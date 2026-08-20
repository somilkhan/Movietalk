import { useState, useEffect, useCallback, useRef } from 'react';
import { getStreamProvider, getStreamServer } from '@/lib/streamingProviders';

export type RabbitStreamType = 'hls' | 'mp4' | 'dash';
export interface RabbitSource {
  url: string;
  type: RabbitStreamType;
  quality: string;
  provider: { id: string; name: string };
  serverId: string;
  serverName: string;
  sourceId: string;
  sourceName: string;
  audio?: Array<{ id: string; label: string; language?: string }>;
  subtitles?: RabbitSubtitle[];
  headers?: Record<string, string>;
}
export interface RabbitSubtitle { url: string; label: string; language: string }
interface RawSource { url: string; quality?: string | number; language?: string; type?: string; label?: string; name?: string; headers?: Record<string, string>; provider?: { id?: string; name?: string } }
interface RawSubtitle { url: string; language?: string; label?: string; name?: string }
interface StreamResponse { scraperName?: string; sources?: RawSource[]; subtitles?: RawSubtitle[]; error?: string }

type CachedPayload = { sources: RabbitSource[]; subtitles: RabbitSubtitle[]; expiresAt: number };
const CACHE_TTL = 60_000;
const sourceCache = new Map<string, CachedPayload>();

function cacheKey(serverId: string, mediaType: string, tmdbId: number, season?: number, episode?: number) {
  return `${serverId}:${mediaType}:${tmdbId}:${season ?? ''}:${episode ?? ''}`;
}

function detectType(raw: RawSource): RabbitStreamType {
  const type = (raw.type ?? '').toLowerCase();
  const url = raw.url.toLowerCase();
  if (type.includes('mpegurl') || type.includes('hls') || url.includes('.m3u8')) return 'hls';
  if (type.includes('dash') || type.includes('mpd') || url.includes('.mpd')) return 'dash';
  return 'mp4';
}

function normalizeQuality(value?: string | number) {
  if (value === undefined || value === null || value === '') return 'Auto';
  const q = String(value);
  if (q.includes('2160') || /4k/i.test(q)) return '4K';
  if (q.includes('1080')) return '1080p';
  if (q.includes('720')) return '720p';
  if (q.includes('480')) return '480p';
  if (q.includes('360')) return '360p';
  return q;
}

function normalizeSubtitles(items: RawSubtitle[]): RabbitSubtitle[] {
  return items.filter((item) => Boolean(item.url)).map((item) => ({
    url: item.url,
    label: item.label ?? item.name ?? item.language ?? 'Auto',
    language: item.language ?? item.label ?? 'unknown',
  }));
}

function normalizeSources(items: RawSource[], serverId: string, serverName: string): RabbitSource[] {
  return items.filter((item) => Boolean(item.url)).map((item, index) => {
    const providerId = item.provider?.id ?? getStreamProvider(serverId) ?? serverId;
    const providerName = item.provider?.name ?? (getStreamProvider(serverId) === 'cinepro' ? 'CinePro' : 'Bingr');
    const sourceName = item.name ?? item.label ?? item.provider?.name ?? `Source ${index + 1}`;
    return {
      url: item.url,
      type: detectType(item),
      quality: normalizeQuality(item.quality),
      provider: { id: providerId, name: providerName },
      serverId,
      serverName,
      sourceId: item.provider?.id ?? `${serverId}-${index}`,
      sourceName,
      headers: item.headers,
    };
  });
}

export function useRabbitSources(serverId: string, mediaType: 'movie' | 'tv', tmdbId: number, title: string, year: string, season?: number, episode?: number) {
  const [sources, setSources] = useState<RabbitSource[]>([]);
  const [subtitles, setSubtitles] = useState<RabbitSubtitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSources = useCallback(async () => {
    if (!tmdbId || !serverId || !title) return;
    const key = cacheKey(serverId, mediaType, tmdbId, season, episode);
    const cached = sourceCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      setSources(cached.sources); setSubtitles(cached.subtitles); setError(null); setLoading(false); return;
    }

    abortRef.current?.abort();
    const controller = new AbortController(); abortRef.current = controller;
    setLoading(true); setError(null); setSources([]); setSubtitles([]);

    let requestedSeason = season;
    let requestedEpisode = episode;
    if (mediaType === 'tv' && typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const watchIndex = parts.indexOf('watch');
      const urlSeason = Number(parts[watchIndex + 3]);
      const urlEpisode = Number(parts[watchIndex + 4]);
      if (watchIndex >= 0 && parts[watchIndex + 1] === 'tv' && Number.isInteger(urlSeason) && urlSeason > 0 && Number.isInteger(urlEpisode) && urlEpisode > 0) {
        requestedSeason = urlSeason; requestedEpisode = urlEpisode;
      }
    }

    try {
      const provider = getStreamProvider(serverId);
      let data: StreamResponse;
      if (provider === 'cinepro') {
        const query = new URLSearchParams({ type: mediaType, tmdbId: String(tmdbId) });
        if (mediaType === 'tv' && typeof requestedSeason === 'number' && typeof requestedEpisode === 'number') {
          query.set('season', String(requestedSeason)); query.set('episode', String(requestedEpisode));
        }
        const response = await fetch(`/api/cinepro?${query.toString()}`, { headers: { Accept: 'application/json' }, signal: controller.signal });
        if (!response.ok) throw new Error(`CinePro returned HTTP ${response.status}`);
        data = await response.json() as StreamResponse;
      } else {
        const body: Record<string, unknown> = { srv: serverId, t: mediaType, id: tmdbId, query: { title, year: String(year) } };
        if (mediaType === 'tv' && typeof requestedSeason === 'number' && typeof requestedEpisode === 'number') {
          body.query = { ...(body.query as Record<string, unknown>), season: requestedSeason, episode: requestedEpisode };
        }
        const response = await fetch('/api/bingr/stream', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal });
        if (!response.ok) throw new Error(`Bingr returned HTTP ${response.status}`);
        data = await response.json() as StreamResponse;
      }

      if (data.error) throw new Error(data.error);
      const server = getStreamServer(serverId);
      const serverName = server?.name ?? (provider === 'cinepro' ? 'CinePro' : 'Bingr');
      const parsedSources = normalizeSources(Array.isArray(data.sources) ? data.sources : [], serverId, serverName);
      const parsedSubtitles = normalizeSubtitles(Array.isArray(data.subtitles) ? data.subtitles : []);
      sourceCache.set(key, { sources: parsedSources, subtitles: parsedSubtitles, expiresAt: Date.now() + CACHE_TTL });
      setSources(parsedSources); setSubtitles(parsedSubtitles); setLoading(false);
    } catch (e: any) {
      if (e?.name !== 'AbortError') { setError(e?.message || `Failed to load ${serverId} stream`); setLoading(false); }
    }
  }, [serverId, mediaType, tmdbId, title, year, season, episode]);

  useEffect(() => { fetchSources(); return () => abortRef.current?.abort(); }, [fetchSources]);
  return { sources, subtitles, loading, error, refetch: fetchSources };
}
