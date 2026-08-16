import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { getAccessToken } from "@/lib/supabase";

export interface ContinueItem {
  id: number;
  mediaType: "movie" | "tv" | "anime";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  progress: number;
  timestamp: number;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  timeLeft?: number;
  duration?: number;
  completedAt?: number;
}

type DbItem = {
  id: number;
  mediaType: "movie" | "tv";
  title?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  position_seconds?: number;
  duration_seconds?: number;
  season?: number | null;
  episode?: number | null;
  updated_at?: string;
};

function localKey(userId: string | undefined, profileId: string | null) {
  return `rabbitrip.continue-watching:${userId || "guest"}:${profileId || "default"}`;
}

export function useContinueWatching() {
  const { profile, isLoggedIn } = useAuth();
  const { activeId, isHydrated: profileHydrated } = useProfiles();
  const storageKey = localKey(profile?.id, activeId);
  const [items, setItems] = useState<ContinueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const readLocal = useCallback((): ContinueItem[] => {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }, [storageKey]);

  const fetchRemote = useCallback(async () => {
    if (!isLoggedIn || !profile?.id || !profileHydrated) {
      const local = readLocal();
      setItems(local);
      setIsLoading(false);
      return;
    }
    const token = getAccessToken();
    if (!token) { setItems(readLocal()); setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ list: "1", profileId: activeId || "default" });
      const response = await fetch(`/api/progress?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("progress list failed");
      const data = await response.json() as { items?: DbItem[] };
      const next = (Array.isArray(data.items) ? data.items : []).map((item): ContinueItem => {
        const duration = Number(item.duration_seconds || 0);
        const position = Number(item.position_seconds || 0);
        return {
          id: Number(item.id),
          mediaType: item.mediaType,
          title: item.title || "Untitled",
          posterPath: item.poster_path || null,
          backdropPath: item.backdrop_path || null,
          progress: duration > 0 ? Math.min(100, (position / duration) * 100) : 0,
          timestamp: item.updated_at ? Date.parse(item.updated_at) || Date.now() : Date.now(),
          season: item.season ?? undefined,
          episode: item.episode ?? undefined,
          duration,
          timeLeft: duration > position ? Math.max(0, Math.ceil((duration - position) / 60)) : undefined,
        };
      }).filter((item) => item.progress < 100);
      setItems(next);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    } catch {
      setItems(readLocal());
    } finally { setIsLoading(false); }
  }, [activeId, isLoggedIn, profile?.id, profileHydrated, readLocal, storageKey]);

  useEffect(() => { void fetchRemote(); }, [fetchRemote]);

  const addOrUpdate = useCallback(async (item: Omit<ContinueItem, "timestamp">) => {
    const nextItem = { ...item, timestamp: Date.now() };
    setItems((prev) => [nextItem, ...prev.filter((p) => !(p.id === item.id && p.mediaType === item.mediaType && p.season === item.season && p.episode === item.episode))].slice(0, 50));
    const token = getAccessToken();
    if (!isLoggedIn || !token) {
      try { localStorage.setItem(storageKey, JSON.stringify([nextItem, ...readLocal().filter((p) => !(p.id === item.id && p.mediaType === item.mediaType && p.season === item.season && p.episode === item.episode))].slice(0, 50))); } catch {}
      return;
    }
    try {
      await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ profileId: activeId || "default", id: item.id, mediaType: item.mediaType, season: item.season, episode: item.episode, position: ((item.progress || 0) / 100) * (item.duration || 0), duration: item.duration || 0, title: item.title, posterPath: item.posterPath, backdropPath: item.backdropPath }) });
    } catch {}
  }, [activeId, isLoggedIn, readLocal, storageKey]);

  const markCompleted = useCallback(async (item: Omit<ContinueItem, "timestamp" | "progress" | "completedAt">) => {
    setItems((prev) => prev.filter((p) => !(p.id === item.id && p.mediaType === item.mediaType && p.season === item.season && p.episode === item.episode)));
    const token = getAccessToken();
    if (!isLoggedIn || !token) return;
    try {
      await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ profileId: activeId || "default", id: item.id, mediaType: item.mediaType, season: item.season, episode: item.episode, position: item.duration || 0, duration: item.duration || 0, title: item.title, posterPath: item.posterPath, backdropPath: item.backdropPath, completed: true }) });
    } catch {}
  }, [activeId, isLoggedIn]);

  const remove = useCallback((id: number, mediaType: string, season?: number, episode?: number) => {
    setItems((prev) => prev.filter((p) => !(p.id === id && p.mediaType === mediaType && p.season === season && p.episode === episode)));
  }, []);

  const sortedItems = useMemo(() => [...items].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20), [items]);
  return { items: sortedItems, completed: null, allItems: items, isLoading, refresh: fetchRemote, addOrUpdate, markCompleted, remove };
}
