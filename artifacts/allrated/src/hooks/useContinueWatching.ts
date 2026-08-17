import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { getAccessToken } from '@/lib/supabase';

export interface ContinueItem { id:number; mediaType:'movie'|'tv'|'anime'; title:string; posterPath:string|null; backdropPath:string|null; progress:number; timestamp:number; season?:number; episode?:number; episodeTitle?:string; timeLeft?:number; duration?:number; completedAt?:number; }
type DbItem = { id:number; mediaType:'movie'|'tv'; title?:string|null; poster_path?:string|null; backdrop_path?:string|null; position_seconds?:number; duration_seconds?:number; season?:number|null; episode?:number|null; updated_at?:string };

export function useContinueWatching() {
  const { profile, isLoggedIn } = useAuth();
  const { activeId, isHydrated: profileHydrated } = useProfiles();
  const [items, setItems] = useState<ContinueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastWriteRef = useRef(0);
  const requestRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    requestRef.current?.abort();
    if (!isLoggedIn || !profile?.id || !profileHydrated || !activeId) { setItems([]); setIsLoading(!profileHydrated); return; }
    const token = getAccessToken();
    if (!token) { setItems([]); setIsLoading(false); return; }
    const controller = new AbortController();
    requestRef.current = controller;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ list:'1', profileId:activeId });
      const response = await fetch(`/api/progress?${params}`, { headers:{ Authorization:`Bearer ${token}` }, signal:controller.signal });
      if (!response.ok) throw new Error(`Progress list failed: ${response.status}`);
      const data = await response.json() as { items?:DbItem[] };
      const next = (Array.isArray(data.items) ? data.items : []).map(item => {
        const duration = Number(item.duration_seconds || 0);
        const position = Number(item.position_seconds || 0);
        const progress = duration > 0 ? Math.min(99.9, Math.max(0, (position / duration) * 100)) : 0;
        return { id:Number(item.id), mediaType:item.mediaType, title:item.title || 'Untitled', posterPath:item.poster_path || null, backdropPath:item.backdrop_path || null, progress, timestamp:item.updated_at ? (Date.parse(item.updated_at) || Date.now()) : Date.now(), season:item.season ?? undefined, episode:item.episode ?? undefined, duration, timeLeft:duration > position ? Math.max(0, Math.ceil((duration-position)/60)) : undefined } as ContinueItem;
      }).filter(item => item.progress < 100);
      setItems(next);
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') setItems([]);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [activeId, isLoggedIn, profile?.id, profileHydrated]);

  useEffect(() => { void refresh(); return () => requestRef.current?.abort(); }, [refresh]);

  const addOrUpdate = useCallback(async (item: Omit<ContinueItem,'timestamp'>) => {
    const optimistic = { ...item, timestamp:Date.now() };
    setItems(prev => [optimistic, ...prev.filter(p => !(p.id===item.id && p.mediaType===item.mediaType && p.season===item.season && p.episode===item.episode))].slice(0,50));
    if (!isLoggedIn || !profile?.id || !activeId) return;
    const now = Date.now();
    if (now - lastWriteRef.current < 3500) return;
    lastWriteRef.current = now;
    const token = getAccessToken();
    if (!token) return;
    try {
      const response = await fetch('/api/progress', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({ profileId:activeId,id:item.id,mediaType:item.mediaType,season:item.season,episode:item.episode,position:((item.progress||0)/100)*(item.duration||0),duration:item.duration||0,title:item.title,posterPath:item.posterPath,backdropPath:item.backdropPath,completed:false }) });
      if (!response.ok) throw new Error(`Progress save failed: ${response.status}`);
    } catch { /* next timeupdate retries */ }
  }, [activeId, isLoggedIn, profile?.id]);

  const markCompleted = useCallback(async (item: Omit<ContinueItem,'timestamp'|'progress'|'completedAt'>) => {
    setItems(prev => prev.filter(p => !(p.id===item.id && p.mediaType===item.mediaType && p.season===item.season && p.episode===item.episode)));
    if (!isLoggedIn || !profile?.id || !activeId) return;
    const token = getAccessToken();
    if (!token) return;
    try { await fetch('/api/progress', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({ profileId:activeId,id:item.id,mediaType:item.mediaType,season:item.season,episode:item.episode,position:item.duration||0,duration:item.duration||0,title:item.title,posterPath:item.posterPath,backdropPath:item.backdropPath,completed:true }) }); } catch {}
  }, [activeId, isLoggedIn, profile?.id]);

  const remove = useCallback((id:number, mediaType:string, season?:number, episode?:number) => setItems(prev => prev.filter(p => !(p.id===id && p.mediaType===mediaType && p.season===season && p.episode===episode))), []);
  const sortedItems = useMemo(() => [...items].sort((a,b) => b.timestamp-a.timestamp).slice(0,20), [items]);
  return { items:sortedItems, completed:null, allItems:items, isLoading, refresh, addOrUpdate, markCompleted, remove };
}
