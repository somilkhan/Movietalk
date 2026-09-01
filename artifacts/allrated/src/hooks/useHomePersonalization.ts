import { useEffect, useMemo, useState } from "react";
import type { Title } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/supabase";

export interface WatchProgressItem {
  id: number;
  mediaType: "movie" | "tv";
  season: number | null;
  episode: number | null;
  position_seconds: number;
  duration_seconds: number;
  title: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
}

function toTitle(item: WatchProgressItem): Title {
  return {
    id: item.id,
    mediaType: item.mediaType,
    title: item.title || "Untitled",
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    overview: "",
    voteAverage: 0,
    year: null,
    genreIds: [],
  } as Title;
}

export function useHomePersonalization() {
  const [continueWatching, setContinueWatching] = useState<WatchProgressItem[]>([]);
  const [recommendations, setRecommendations] = useState<Title[]>([]);

  useEffect(() => {
    let cancelled = false;
    const token = getAccessToken();
    if (!token) {
      setContinueWatching([]);
      setRecommendations([]);
      return;
    }

    async function load() {
      try {
        const response = await fetch("/api/progress?list=1", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        const items = Array.isArray(data?.items) ? data.items as WatchProgressItem[] : [];
        if (cancelled) return;
        setContinueWatching(items.filter((item) => item.duration_seconds <= 0 || item.position_seconds < item.duration_seconds * 0.95).slice(0, 20));

        const sources = items.slice(0, 3);
        const recommendationLists = await Promise.all(
          sources.map(async (item) => {
            try {
              const r = await fetch(`/api/catalog/title/similar?mediaType=${item.mediaType}&id=${item.id}`);
              if (!r.ok) return [] as Title[];
              const payload = await r.json();
              return Array.isArray(payload?.results) ? payload.results as Title[] : [];
            } catch {
              return [] as Title[];
            }
          }),
        );
        if (cancelled) return;
        const seen = new Set<string>();
        const merged = recommendationLists.flat().filter((item) => {
          const key = `${item.mediaType}-${item.id}`;
          if (seen.has(key) || sources.some((source) => source.mediaType === item.mediaType && source.id === item.id)) return false;
          seen.add(key);
          return true;
        }).slice(0, 20);
        setRecommendations(merged);
      } catch {
        if (!cancelled) {
          setContinueWatching([]);
          setRecommendations([]);
        }
      }
    }

    void load();
    const refresh = () => void load();
    window.addEventListener("rabbitrip:progress-updated", refresh);
    window.addEventListener("rabbitrip:auth-changed", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("rabbitrip:progress-updated", refresh);
      window.removeEventListener("rabbitrip:auth-changed", refresh);
    };
  }, []);

  const continueTitles = useMemo(() => continueWatching.map(toTitle), [continueWatching]);
  return { continueWatching, continueTitles, recommendations };
}
