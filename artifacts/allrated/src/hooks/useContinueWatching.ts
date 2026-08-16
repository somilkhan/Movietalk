import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface ContinueItem {
  id: number; mediaType: "movie" | "tv" | "anime"; title: string; posterPath: string | null; backdropPath: string | null;
  progress: number; timestamp: number; season?: number; episode?: number; episodeTitle?: string; timeLeft?: number; duration?: number; completedAt?: number;
}

export function useContinueWatching() {
  const { profile } = useAuth();
  const storageKey = `rabbitrip.continue-watching:${profile?.id || "guest"}`;
  const getStored = useCallback((): ContinueItem[] => { try { const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }, [storageKey]);
  const [items, setItems] = useState<ContinueItem[]>(getStored);
  const [hydratedKey, setHydratedKey] = useState(storageKey);

  useEffect(() => {
    setHydratedKey("");
    setItems(getStored());
    setHydratedKey(storageKey);
  }, [storageKey, getStored]);
  useEffect(() => {
    if (hydratedKey !== storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify(items)); } catch {}
  }, [items, storageKey, hydratedKey]);

  const addOrUpdate = useCallback((item: Omit<ContinueItem, "timestamp">) => setItems((prev) => {
    const filtered = prev.filter((p) => !(p.id === item.id && p.mediaType === item.mediaType && p.season === item.season && p.episode === item.episode));
    return [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, 50);
  }), []);
  const markCompleted = useCallback((item: Omit<ContinueItem, "timestamp" | "progress" | "completedAt">) => setItems((prev) => {
    const completedAt = Date.now();
    const filtered = prev.filter((p) => !(p.id === item.id && p.mediaType === item.mediaType && p.season === item.season && p.episode === item.episode));
    return [{ ...item, progress: 100, timestamp: completedAt, completedAt }, ...filtered].slice(0, 50);
  }), []);
  const remove = useCallback((id: number, mediaType: string, season?: number, episode?: number) => setItems((prev) => prev.filter((p) => !(p.id === id && p.mediaType === mediaType && p.season === season && p.episode === episode))), []);
  const sortedItems = [...items].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  const completed = [...items].filter((item) => item.completedAt).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))[0] || null;
  const continueItems = sortedItems.filter((item) => !item.completedAt && item.progress < 100);
  return { items: continueItems, completed, allItems: items, addOrUpdate, markCompleted, remove };
}
