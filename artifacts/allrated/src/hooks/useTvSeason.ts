import { useState, useEffect } from 'react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface Episode {
  id: number; episodeNumber: number; name: string;
  stillPath: string | null; runtime: number | null;
}

export function useTvSeason(showId: number, season: number, enabled: boolean) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!enabled || !showId || !season) return;
    setLoading(true);
    const controller = new AbortController();
    fetch(`${BASE}/api/catalog/tv/${showId}/season/${season}`, { signal: controller.signal })
      .then(r => r.json())
      .then((d: unknown) => {
        setEpisodes(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => { setEpisodes([]); setLoading(false); });
    return () => controller.abort();
  }, [showId, season, enabled]);
  return { episodes, loading };
}
