import { useState, useEffect, useCallback, useRef } from 'react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface OmssSource {
  url: string;
  type: 'hls' | 'mp4' | string;
  quality: string;
  provider: { id: string; name: string };
}
interface OmssResponse {
  sources: OmssSource[];
  subtitles: { url: string; language: string; label: string }[];
  diagnostics: { message: string }[];
}

export function useStreamSources(
  mediaType: 'movie' | 'tv',
  tmdbId: number,
  season: number,
  episode: number,
) {
  const [data, setData] = useState<OmssResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch_ = useCallback(() => {
    if (!tmdbId) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true); setError(null); setData(null);
    const url = mediaType === 'movie'
      ? `${BASE}/api/stream/movie/${tmdbId}`
      : `${BASE}/api/stream/tv/${tmdbId}/season/${season}/episode/${episode}`;

    const timeoutId = setTimeout(() => controller.abort(), 60_000);
    fetch(url, { signal: controller.signal })
      .then(r => r.json())
      .then((d: unknown) => {
        if (d && typeof d === 'object' && 'sources' in d && Array.isArray((d as OmssResponse).sources)) {
          setData(d as OmssResponse);
        } else {
          setData({ sources: [], subtitles: [], diagnostics: [{ message: 'Invalid response format' }] });
        }
        setLoading(false);
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') {
          setError(e.message); setLoading(false);
        }
      })
      .finally(() => clearTimeout(timeoutId));
  }, [mediaType, tmdbId, season, episode]);

  useEffect(() => {
    fetch_();
    return () => abortRef.current?.abort();
  }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}
