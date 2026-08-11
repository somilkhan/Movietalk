import { BaseProvider } from '@omss/framework';
import type {
    ProviderCapabilities,
    ProviderMediaObject,
    ProviderResult
} from '@omss/framework';
import type {
    BingrStreamResponse,
    BingrParsedSource,
    BingrParsedSubtitle,
    BingrRawSource,
    BingrRawSubtitle
} from './bingr.types.js';

export class BingrProvider extends BaseProvider {
    readonly id = 'Bingr';
    readonly name = 'Bingr';
    readonly enabled = true;
    readonly BASE_URL = 'https://api.bingr.one';

    readonly HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': 'https://bingr.one',
        'Referer': 'https://bingr.one/'
    };

    /**
     * ALL Bingr.one servers arranged exactly as the site presents them.
     * Each server is a separate scraper with its own behavior.
     * 
     * Server availability varies by content (movie vs tv) and title.
     * We fan out to all servers in parallel and merge results.
     */
    readonly BINGR_SERVERS: { code: string; name: string; priority: number }[] = [
        // Primary HLS servers (best quality, most reliable)
        { code: 's11', name: 'Sirius', priority: 1 },      // Multi-quality HLS (1080p/720p/480p)
        { code: 's12', name: 'Quasar', priority: 2 },      // MP4 direct links (1080p/720p/480p)

        // Secondary M3U8 servers
        { code: 's3', name: 'Edmunds', priority: 3 },    // M3U8 via wormhole proxy
        { code: 's30', name: 'Apollo', priority: 4 },      // M3U8 via orion proxy
        { code: 's4', name: 'Helios', priority: 5 },       // M3U8 direct (1shows.app)
        { code: 's6', name: 'Nebula', priority: 6 },       // M3U8 via filmu proxy

        // DASH/MPD servers
        { code: 's7', name: 'Copernicus', priority: 7 },  // DASH MPD (aoneroom)
        { code: 's8', name: 'Rohini', priority: 8 },      // DASH MPD (aoneroom)
        { code: 's13', name: 'Ariane', priority: 9 },     // DASH MPD (aoneroom)
        { code: 's16', name: 'Cruzeiro', priority: 10 },   // DASH MPD (aoneroom)

        // Direct MP4 servers
        { code: 's10', name: 'Elysium', priority: 11 },   // MP4 via workers proxy
        { code: 's17', name: 'Centaurus', priority: 12 }, // MP4 via wormhole proxy

        // Specialty servers
        { code: 's40', name: 'DarkMatter', priority: 13 }, // M3U8 direct (streamrip)
        { code: 's15', name: 'Magellan', priority: 14 }, // Subtitles only

        // Additional servers (often empty but checked for completeness)
        { code: 's9', name: 'Meghnad', priority: 15 },
        { code: 's14', name: 'Vostok', priority: 16 },
        { code: 's18', name: 'Aldebaran', priority: 17 },
        { code: 's19', name: 'Canopus', priority: 18 },
        { code: 's20', name: 'Chitra', priority: 19 },
        { code: 's21', name: 'Palapa', priority: 20 },
        { code: 's22', name: 'Diwata', priority: 21 },
        { code: 's23', name: 'Zoroaster', priority: 22 },
    ];

    readonly capabilities: ProviderCapabilities = {
        supportedContentTypes: ['movies', 'tv']
    };

    async getMovieSources(media: ProviderMediaObject): Promise<ProviderResult> {
        return this.getSources(media);
    }

    async getTVSources(media: ProviderMediaObject): Promise<ProviderResult> {
        return this.getSources(media);
    }

    /**
     * Fans out requests to ALL bingr servers in parallel,
     * then merges results. Servers are tried simultaneously
     * for maximum speed.
     */
    private async getSources(
        media: ProviderMediaObject
    ): Promise<ProviderResult> {
        const results = await Promise.allSettled(
            this.BINGR_SERVERS.map((server) =>
                this.fetchFromServer(server.code, server.name, media)
            )
        );

        const sources: ProviderResult['sources'] = [];
        const subtitles: ProviderResult['subtitles'] = [];
        const diagnostics: ProviderResult['diagnostics'] = [];

        let failCount = 0;
        let emptyCount = 0;

        for (const result of results) {
            if (result.status === 'rejected') {
                failCount++;
                continue;
            }

            if (!result.value) {
                emptyCount++;
                continue;
            }

            sources.push(...result.value.sources);
            subtitles.push(...result.value.subtitles);
        }

        if (failCount > 0 && sources.length > 0) {
            diagnostics.push({
                code: 'PARTIAL_SCRAPE',
                message: `${failCount} of ${this.BINGR_SERVERS.length} bingr servers failed`,
                field: '',
                severity: 'warning'
            });
        }

        if (sources.length === 0) {
            return this.emptyResult(
                'all bingr servers returned no sources',
                media
            );
        }

        // Sort sources by server priority, then by quality (descending)
        const qualityOrder: Record<string, number> = {
            '4K': 7, '2160p': 7,
            '1080p': 6, '1080': 6,
            '720p': 5, '720': 5,
            '480p': 4, '480': 4,
            '360p': 3, '360': 3,
            'Auto': 2,
            'Unknown': 1
        };

        sources.sort((a, b) => {
            const pa = this.BINGR_SERVERS.findIndex(s => s.name === a.provider?.name) ?? 999;
            const pb = this.BINGR_SERVERS.findIndex(s => s.name === b.provider?.name) ?? 999;
            if (pa !== pb) return pa - pb;

            const qa = qualityOrder[a.quality] ?? 0;
            const qb = qualityOrder[b.quality] ?? 0;
            return qb - qa;
        });

        return { sources, subtitles, diagnostics };
    }

    /**
     * Hits a single bingr server and maps the response.
     */
    private async fetchFromServer(
        serverCode: string,
        serverName: string,
        media: ProviderMediaObject
    ): Promise<ProviderResult | null> {
        const apiUrl = `${this.BASE_URL}/api/stream`;

        const body: Record<string, unknown> = {
            srv: serverCode,
            t: media.type === 'movie' ? 'movie' : 'tv',
            id: media.tmdbId,
            query: {
                title: media.title,
                year: String(media.year)
            }
        };

        if (media.type === 'tv') {
            if (!media.s || !media.e) {
                return null;
            }
            body.query = {
                ...body.query as Record<string, unknown>,
                season: media.s,
                episode: media.e
            };
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: this.HEADERS,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000)
            });

            if (!response.ok) return null;

            const data = (await response.json()) as BingrStreamResponse;

            // Handle "unknown server" or error responses
            if ('error' in data && (data as unknown as Record<string, string>).error) {
                return null;
            }

            const rawSources = Array.isArray(data.sources) ? data.sources : [];
            const rawSubtitles = Array.isArray(data.subtitles) ? data.subtitles : [];

            if (rawSources.length === 0 && rawSubtitles.length === 0) return null;

            const parsedSources = rawSources
                .map((s) => this.parseSource(s, serverName, serverCode))
                .filter((s): s is BingrParsedSource => s !== null);

            const parsedSubs = rawSubtitles
                .map((s) => this.parseSubtitle(s, serverName))
                .filter((s): s is BingrParsedSubtitle => s !== null);

            const sources: ProviderResult['sources'] = parsedSources.map((s) => ({
                url: this.createProxyUrl(s.url, s.headers),
                type: s.type,
                quality: s.quality,
                audioTracks: s.language ? [
                    {
                        label: s.language,
                        language: s.language.toLowerCase().substring(0, 2)
                    }
                ] : undefined,
                provider: {
                    id: this.id,
                    name: `${serverName} [${serverCode}]`
                }
            }));

            const subtitles: ProviderResult['subtitles'] = parsedSubs.map((s) => ({
                url: this.createProxyUrl(s.url, this.HEADERS),
                label: s.label,
                format: 'vtt'
            }));

            return { sources, subtitles, diagnostics: [] };
        } catch {
            return null;
        }
    }

    /**
     * Extracts a usable source from raw bingr response.
     */
    private parseSource(
        raw: BingrRawSource,
        serverName: string,
        serverCode: string
    ): BingrParsedSource | null {
        const url = raw.url ?? '';
        if (!url) return null;

        // Determine type from URL and type field
        const rawType = (raw.type ?? '').toLowerCase();
        const urlLower = url.toLowerCase();

        let type: 'hls' | 'mp4' | 'dash';
        if (rawType.includes('mpegurl') || urlLower.includes('.m3u8') || rawType.includes('hls')) {
            type = 'hls';
        } else if (rawType.includes('mpd') || urlLower.includes('.mpd')) {
            type = 'dash';
        } else {
            type = 'mp4';
        }

        // Extract quality
        let quality = 'Auto';
        if (raw.quality) {
            const q = String(raw.quality);
            if (q.includes('1080')) quality = '1080p';
            else if (q.includes('720')) quality = '720p';
            else if (q.includes('480')) quality = '480p';
            else if (q.includes('360')) quality = '360p';
            else if (q.includes('2160') || q.includes('4K')) quality = '4K';
            else quality = q;
        }

        // Extract language
        const language = raw.language ?? 
            (raw.label?.match(/Hindi|English|Multi|Original/i)?.[0] ?? 'Unknown');

        // Extract label
        const label = raw.label ?? raw.name ?? `${serverName} — ${quality}`;

        // Headers from bingr (e.g., Referer for cdn15.streamraiwind.stream)
        const headers = raw.headers ?? {};

        return {
            url,
            quality,
            language,
            type,
            label,
            headers,
            serverName,
            serverCode
        };
    }

    /**
     * Extracts subtitle data from raw bingr subtitle entry.
     */
    private parseSubtitle(
        raw: BingrRawSubtitle,
        serverName: string
    ): BingrParsedSubtitle | null {
        const url = raw.url ?? '';
        if (!url) return null;

        const label = raw.label ?? raw.name ?? raw.language ?? 'Auto';
        const language = raw.language ?? label;

        return { url, label, language, serverName };
    }
}
