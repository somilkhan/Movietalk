import { useState, useEffect, useCallback, useRef } from 'react';

export interface BingrSource {
  url: string;
  type: 'hls' | 'mp4' | 'dash';
  quality: string;
  provider: { id: string; name: string };
}
export interface BingrSubtitle { url: string; label: string; language: string; }
interface BingrRawSource { url: string; quality?: string | number; language?: string; type?: string; label?: string; name?: string; headers?: Record<string, string>; }
interface BingrRawSubtitle { url: string; language?: string; label?: string; name?: string; }
interface BingrStreamResponse { scraperName?: string; sources: BingrRawSource[]; subtitles: BingrRawSubtitle[]; }

export function useBingrSources(serverId: string, mediaType: 'movie' | 'tv', tmdbId: number, title: string, year: string, season?: number, episode?: number) {
  const [sources, setSources] = useState<BingrSource[]>([]);
  const [subtitles, setSubtitles] = useState<BingrSubtitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fetch_ = useCallback(async () => {
    if (!tmdbId || !serverId || !title) return;
    abortRef.current?.abort();
    const controller = new AbortController(); abortRef.current = controller;
    setLoading(true); setError(null); setSources([]); setSubtitles([]);
    const body: Record<string, unknown> = { srv: serverId, t: mediaType, id: tmdbId, query: { title, year: String(year) } };
    if (mediaType === 'tv' && typeof season === 'number' && typeof episode === 'number') body.query = { ...(body.query as Record<string, unknown>), season, episode };
    try {
      const response = await fetch('/api/bingr/stream', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal });
      if (!response.ok) throw new Error(`Bingr returned HTTP ${response.status}`);
      const data = (await response.json()) as BingrStreamResponse;
      if ('error' in data && (data as unknown as Record<string, string>).error) throw new Error((data as unknown as Record<string, string>).error);
      const rawSources = Array.isArray(data.sources) ? data.sources : [];
      const rawSubtitles = Array.isArray(data.subtitles) ? data.subtitles : [];
      const parsedSources: BingrSource[] = rawSources.map((s) => {
        if (!s.url) return null;
        const rawType = (s.type ?? '').toLowerCase(); const urlLower = s.url.toLowerCase();
        let type: BingrSource['type'] = 'mp4';
        if (rawType.includes('mpegurl') || urlLower.includes('.m3u8') || rawType.includes('hls')) type = 'hls'; else if (rawType.includes('mpd') || urlLower.includes('.mpd')) type = 'dash';
        let quality = 'Auto';
        if (s.quality) { const q = String(s.quality); if (q.includes('1080')) quality = '1080p'; else if (q.includes('720')) quality = '720p'; else if (q.includes('480')) quality = '480p'; else if (q.includes('360')) quality = '360p'; else if (q.includes('2160') || q.includes('4K')) quality = '4K'; else quality = q; }
        return { url: s.url, type, quality, provider: { id: serverId, name: serverId.toUpperCase() } };
      }).filter((s): s is BingrSource => s !== null);
      const parsedSubtitles: BingrSubtitle[] = rawSubtitles.map((s) => ({ url: s.url, label: s.label ?? s.name ?? s.language ?? 'Auto', language: s.language ?? s.label ?? 'unknown' })).filter((s) => s.url);
      setSources(parsedSources); setSubtitles(parsedSubtitles); setLoading(false);
    } catch (e: any) { if (e.name !== 'AbortError') setError(e.message || 'Failed to load Bingr stream'); setLoading(false); }
  }, [serverId, mediaType, tmdbId, title, year, season, episode]);
  useEffect(() => { fetch_(); return () => abortRef.current?.abort(); }, [fetch_]);
  return { sources, subtitles, loading, error, refetch: fetch_ };
}
