import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { getAccessToken } from '@/lib/supabase';

export interface ContinueItem { id:number; mediaType:'movie'|'tv'|'anime'; title:string; posterPath:string|null; backdropPath:string|null; progress:number; timestamp:number; season?:number; episode?:number; episodeTitle?:string; timeLeft?:number; duration?:number; completedAt?:number; }
type DbItem = { id:number; mediaType:'movie'|'tv'; title?:string|null; poster_path?:string|null; backdrop_path?:string|null; position_seconds?:number; duration_seconds?:number; season?:number|null; episode?:number|null; updated_at?:string };
type PendingWrite = Omit<ContinueItem,'timestamp'>;

export function useContinueWatching() {
  const { profile, isLoggedIn } = useAuth();
  const { activeId, isHydrated: profileHydrated } = useProfiles();
  const [items, setItems] = useState<ContinueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const requestRef = useRef<AbortController | null>(null);
  const pendingRef = useRef<PendingWrite | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

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

  const persist = useCallback(async (item: PendingWrite) => {
    if (savingRef.current || !isLoggedIn || !profile?.id || !activeId) return;
    const token = getAccessToken();
    if (!token) return;
    savingRef.current = true;
    try {
      const response = await fetch('/api/progress', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({ profileId:activeId,id:item.id,mediaType:item.mediaType,season:item.season,episode:item.episode,position:((item.progress||0)/100)*(item.duration||0),duration:item.duration||0,title:item.title,posterPath:item.posterPath,backdropPath:item.backdropPath,completed:false }) });
      if (!response.ok) throw new Error(`Progress save failed: ${response.status}`);
    } catch {
      pendingRef.current = item;
    } finally {
      savingRef.current = false;
      if (pendingRef.current) {
        const next = pendingRef.current;
        pendingRef.current = null;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => { saveTimerRef.current = null; void persist(next); }, 1000);
      }
    }
  }, [activeId, isLoggedIn, profile?.id]);

  const addOrUpdate = useCallback(async (item: Omit<ContinueItem,'timestamp'>) => {
    const optimistic = { ...item, timestamp:Date.now() };
    setItems(prev => [optimistic, ...prev.filter(p => !(p.id===item.id && p.mediaType===item.mediaType && p.season===item.season && p.episode===item.episode))].slice(0,50));
    pendingRef.current = item;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      const next = pendingRef.current;
      pendingRef.current = null;
      if (next) void persist(next);
    }, 1000);
  }, [persist]);

  const markCompleted = useCallback(async (item: Omit<ContinueItem,'timestamp'|'progress'|'completedAt'>) => {
    setItems(prev => prev.filter(p => !(p.id===item.id && p.mediaType===item.mediaType && p.season===item.season && p.episode===item.episode)));
    pendingRef.current = null;
    if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null; }
    if (!isLoggedIn || !profile?.id || !activeId) return;
    const token = getAccessToken();
    if (!token) return;
    try { await fetch('/api/progress', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({ profileId:activeId,id:item.id,mediaType:item.mediaType,season:item.season,episode:item.episode,position:item.duration||0,duration:item.duration||0,title:item.title,posterPath:item.posterPath,backdropPath:item.backdropPath,completed:true }) }); } catch {}
  }, [activeId, isLoggedIn, profile?.id]);

  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) void persist(pending);
  }, [persist]);

  const remove = useCallback((id:number, mediaType:string, season?:number, episode?:number) => setItems(prev => prev.filter(p => !(p.id===id && p.mediaType===mediaType && p.season===season && p.episode===episode))), []);
  const sortedItems = useMemo(() => [...items].sort((a,b) => b.timestamp-a.timestamp).slice(0,20), [items]);
  return { items:sortedItems, completed:null, allItems:items, isLoading, refresh, addOrUpdate, markCompleted, remove };
}
