import { useEffect, useState, useCallback } from "react";

const CW_KEY = "movietalk.continue-watching";

export interface ContinueItem {
  id: number;
  mediaType: "movie" | "tv" | "anime";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  progress: number; // 0-100
  timestamp: number;
  // TV specific
  season?: number;
  episode?: number;
  episodeTitle?: string;
  timeLeft?: number; // minutes left
  duration?: number; // total minutes
}

function getStored(): ContinueItem[] {
  try {
    const raw = localStorage.getItem(CW_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function useContinueWatching() {
  const [items, setItems] = useState<ContinueItem[]>(getStored);

  useEffect(() => {
    try {
      localStorage.setItem(CW_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items]);

  const addOrUpdate = useCallback((item: Omit<ContinueItem, "timestamp">) => {
    setItems((prev) => {
      const filtered = prev.filter((p) =>
        !(p.id === item.id && p.mediaType === item.mediaType &&
          p.season === item.season && p.episode === item.episode)
      );
      return [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, 50);
    });
  }, []);

  const remove = useCallback((id: number, mediaType: string, season?: number, episode?: number) => {
    setItems((prev) =>
      prev.filter((p) =>
        !(p.id === id && p.mediaType === mediaType &&
          p.season === season && p.episode === episode)
      )
    );
  }, []);

  const sortedItems = items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);

  return { items: sortedItems, addOrUpdate, remove };
}
