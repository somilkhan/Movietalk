import { useState, useEffect, useCallback, useRef } from 'react';

export interface BingrAudioTrack {
  label: string;
  language: string;
}

export interface BingrSource {
  url: string;
  type: 'hls' | 'mp4' | 'dash';
  quality: string;
  provider: { id: string; name: string };
  audioTracks?: BingrAudioTrack[];
}

export interface BingrSubtitle {
  url: string;
  label: string;
  language: string;
}

interface BingrRawSource {
  url: string;
  quality?: string | number;
  language?: string;
  type?: string;
  label?: string;
  name?: string;
  headers?: Record<string, string>;
  provider?: { id?: string; name?: string };
  audioTracks?: BingrAudioTrack[];
}

interface BingrRawSubtitle {
  url: string;
  language?: string;
  label?: string;
  name?: string;
}

interface BingrStreamResponse {
  sources?: BingrRawSource[];
  subtitles?: BingrRawSubtitle[];
}

const SERVER_NAMES: Record<string, string> = {
  s11: 'Sirius', s40: 'DarkMatter', s12: 'Quasar', s30: 'Apollo',
  s1: 'Miller', s2: 'Mann', s3: 'Edmunds', s4: 'Luna', s5: 'Aditya',
};

function parseQuality(value: string | number | undefined) {
  if (value === undefined || value === null || value === '') return 'Auto';
  const q = String(value);
  if (q.includes('2160') || q.includes('4K')) return '4K';
  if (q.includes('1080')) return '1080p';
  if (q.includes('720')) return '720p';
  if (q.includes('480')) return '480p';
  if (q.includes('360')) return '360p';
  return q;
}

function parseType(rawType: string | undefined, url: string): BingrSource['type'] {
  const type = (rawType ?? '').toLowerCase();
  const lower = url.toLowerCase();
  if (type.includes('mpegurl') || type.includes('hls') || lower.includes('.m3u8')) return 'hls';
  if (type.includes('mpd') || lower.includes('.mpd')) return 'dash';
  return 'mp4';
}

function serverMatches(source: BingrSource, serverId: string) {
  const expectedName = SERVER_NAMES[serverId];
  if (!expectedName) return true;
  const provider = `${source.provider.id} ${source.provider.name}`.toLowerCase();
  return provider.includes(serverId.toLowerCase()) || provider.includes(expectedName.toLowerCase());
}

export function useBingrSources(serverId: string, mediaType: 'movie' | 'tv', tmdbId: number, title: string, year: string, season?: number, episode?: number) {
  const [allSources, setAllSources] = useState<BingrSource[]>([]);
  const [allSubtitles, setAllSubtitles] = useState<BingrSubtitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch_ = useCallback(async () => {
    if (!tmdbId || !title) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    const endpoint = mediaType === 'tv' && typeof season === 'number' && typeof episode === 'number'
      ? `/api/stream/tv/${tmdbId}/season/${season}/episode/${episode}`
      : `/api/stream/movie/${tmdbId}`;

    try {
      const response = await fetch(endpoint, { method: 'GET', headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error(`Stream service returned HTTP ${response.status}`);
      const data = (await response.json()) as BingrStreamResponse;
      const rawSources = Array.isArray(data.sources) ? data.sources : [];
      const rawSubtitles = Array.isArray(data.subtitles) ? data.subtitles : [];
      const parsedSources: BingrSource[] = rawSources.filter((source) => Boolean(source.url)).map((source) => ({
        url: source.url,
        type: parseType(source.type, source.url),
        quality: parseQuality(source.quality),
        provider: { id: source.provider?.id ?? 'Bingr', name: source.provider?.name ?? source.name ?? 'Bingr' },
        audioTracks: source.audioTracks,
      }));
      const parsedSubtitles: BingrSubtitle[] = rawSubtitles.filter((sub) => Boolean(sub.url)).map((sub) => ({
        url: sub.url,
        label: sub.label ?? sub.name ?? sub.language ?? 'Auto',
        language: sub.language ?? sub.label ?? 'unknown',
      }));
      setAllSources(parsedSources);
      setAllSubtitles(parsedSubtitles);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setError(e.message || 'Failed to load Bingr stream');
        setAllSources([]);
        setAllSubtitles([]);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [mediaType, tmdbId, title, season, episode]);

  useEffect(() => { fetch_(); return () => abortRef.current?.abort(); }, [fetch_]);

  const sources = allSources.filter((source) => serverMatches(source, serverId));
  const subtitles = allSubtitles.filter((sub, index, list) => list.findIndex((item) => item.url === sub.url) === index);
  return { sources, subtitles, loading, error, refetch: fetch_ };
}
