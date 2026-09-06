import { useEffect, useMemo, useState } from "react";
import type { Title } from "@workspace/api-client-react";
import { getAccessToken, getAnonymousDeviceId } from "@/lib/supabase";

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
  completed?: boolean;
  saved_at?: number | string | null;
  updated_at?: string | null;
}

const LOCAL_PROGRESS_KEY = "rabbitrip.watch-progress.v2";

function localItems(): WatchProgressItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY) || "{}");
    return Object.values(raw || {}) as WatchProgressItem[];
  } catch {
    return [];
  }
}

function progressKey(item: WatchProgressItem) {
  return `${item.mediaType}:${item.id}:${item.season ?? 0}:${item.episode ?? 0}`;
}

function timestamp(item: WatchProgressItem) {
  const local = Number(item.saved_at);
  if (Number.isFinite(local) && local > 0) return local;
  const server = item.updated_at ? Date.parse(item.updated_at) : 0;
  return Number.isFinite(server) ? server : 0;
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

    const load = async () => {
      const local = localItems().filter((item) => !item.completed);
      if (local.length && !cancelled) {
        setContinueWatching(local.sort((a, b) => timestamp(b) - timestamp(a)).slice(0, 20));
      }

      const token = getAccessToken();
      const deviceId = getAnonymousDeviceId();
      if (!deviceId && !token) return;

      try {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        if (deviceId) headers["X-Device-Id"] = deviceId;

        const response = await fetch("/api/progress?list=1", { headers });
        if (!response.ok) return;

        const data = await response.json();
        const server = Array.isArray(data?.items) ? (data.items as WatchProgressItem[]) : [];
        if (cancelled) return;

        const byKey = new Map<string, WatchProgressItem>();
        for (const item of [...server, ...local]) {
          if (item.completed) continue;
          const key = progressKey(item);
          const previous = byKey.get(key);
          if (!previous || timestamp(item) >= timestamp(previous)) byKey.set(key, item);
        }

        const merged = Array.from(byKey.values())
          .sort((a, b) => timestamp(b) - timestamp(a))
          .slice(0, 20);
        setContinueWatching(merged);

        const sources = merged.slice(0, 3);
        const lists = await Promise.all(
          sources.map(async (item) => {
            try {
              const result = await fetch(`/api/catalog/title/similar?mediaType=${item.mediaType}&id=${item.id}`);
              const payload = await result.json();
              return result.ok && Array.isArray(payload?.results) ? (payload.results as Title[]) : [];
            } catch {
              return [] as Title[];
            }
          }),
        );

        if (cancelled) return;
        const seen = new Set<string>();
        setRecommendations(
          lists
            .flat()
            .filter((item) => {
              const key = `${item.mediaType}-${item.id}`;
              if (seen.has(key) || sources.some((source) => source.mediaType === item.mediaType && source.id === item.id)) return false;
              seen.add(key);
              return true;
            })
            .slice(0, 20),
        );
      } catch {
        // Local progress remains usable when the API is unavailable.
      }
    };

    const refresh = () => void load();
    void load();
    window.addEventListener("rabbitrip:progress-updated", refresh);
    window.addEventListener("rabbitrip:auth-changed", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      cancelled = true;
      window.removeEventListener("rabbitrip:progress-updated", refresh);
      window.removeEventListener("rabbitrip:auth-changed", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return {
    continueWatching,
    continueTitles: useMemo(() => continueWatching.map(toTitle), [continueWatching]),
    recommendations,
  };
}
