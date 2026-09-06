import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, ChevronDown, Loader2, X } from 'lucide-react';
import { useGetTitleDetail } from '@workspace/api-client-react';
import { BINGR_SOURCES, buildEmbedUrl } from '@/lib/streamingProviders';
import { getAccessToken, getAnonymousDeviceId } from '@/lib/supabase';

interface DetailStreamPlayerProps { mediaType: 'movie' | 'tv'; id: number; season?: number; episode?: number; onClose: () => void; }

const LOCAL_PROGRESS_KEY = 'rabbitrip.watch-progress.v2';
function readLocalProgress() { try { return JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY) || '{}') as Record<string, unknown>; } catch { return {}; } }
function writeLocalProgress(item: Record<string, unknown>) { try { const all = readLocalProgress(); const key = `${item.mediaType}:${item.id}:${item.season ?? 0}:${item.episode ?? 0}`; all[key] = item; localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(all)); } catch {} }

export default function DetailStreamPlayer({ mediaType, id, season, episode, onClose }: DetailStreamPlayerProps) {
  const { data: title } = useGetTitleDetail(mediaType, id, { query: { enabled: Number.isFinite(id) } });
  const titleName = title?.title || title?.name || '';
  const [sourceId, setSourceId] = useState(BINGR_SOURCES[0]?.id ?? '');
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const selectedSource = useMemo(() => BINGR_SOURCES.find((source) => source.id === sourceId) ?? BINGR_SOURCES[0], [sourceId]);
  const embedUrl = useMemo(() => selectedSource ? buildEmbedUrl(mediaType, id, selectedSource.id, season, episode) : null, [mediaType, id, selectedSource?.id, season, episode]);

  useEffect(() => { setLoading(Boolean(embedUrl)); setFailed(!embedUrl); }, [embedUrl]);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    const deviceId = getAnonymousDeviceId();
    if (!deviceId) return;
    let savedAt = 0;
    const saveProgress = async (position: number, duration = 0, completed = false) => {
      if (!Number.isFinite(position) || position < 0) return;
      const item = { id, mediaType, season: season ?? null, episode: episode ?? null, position_seconds: position, duration_seconds: Number.isFinite(duration) ? duration : 0, title: titleName || null, poster_path: title?.posterPath || null, backdrop_path: title?.backdropPath || null, completed };
      writeLocalProgress(item);
      window.dispatchEvent(new Event('rabbitrip:progress-updated'));
      const now = Date.now();
      if (!completed && now - savedAt < 3000) return;
      savedAt = now;
      try {
        const token = getAccessToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-Device-Id': deviceId };
        if (token) headers.Authorization = `Bearer ${token}`;
        await fetch('/api/progress', { method: 'POST', headers, body: JSON.stringify({ id, mediaType, season: season ?? null, episode: episode ?? null, position, duration, title: titleName || null, posterPath: title?.posterPath || null, backdropPath: title?.backdropPath || null, completed }) });
      } catch { /* local cache keeps the row visible if the network is unavailable */ }
    };
    const onMessage = (event: MessageEvent) => {
      if (![window.location.origin, 'https://embed.vidrift.in', 'https://vidsrc2.ru'].includes(event.origin)) return;
      const data = event.data;
      if (data?.type === 'PLAYER_EVENT') {
        const p = data.data || {}; const position = Number(p.player_progress); const duration = Number(p.player_duration);
        if (p.player_status === 'completed') void saveProgress(position || duration || 0, duration, true);
        else if (['playing', 'paused', 'seeked'].includes(p.player_status)) void saveProgress(position, duration);
      } else if (data?.type === 'vidrift:progress') void saveProgress(Number(data.currentTime), Number(data.duration));
      else if (data?.type === 'vidrift:ended') void saveProgress(Number(data.duration || 0), Number(data.duration || 0), true);
    };
    const onUnload = () => { void saveProgress(1, 0); };
    window.addEventListener('message', onMessage); window.addEventListener('pagehide', onUnload);
    return () => { window.removeEventListener('message', onMessage); window.removeEventListener('pagehide', onUnload); };
  }, [id, mediaType, season, episode, titleName, title?.posterPath, title?.backdropPath]);

  const selectSource = (nextId: string) => { if (nextId === sourceId) { setSourceMenuOpen(false); return; } setSourceId(nextId); setSourceMenuOpen(false); setLoading(true); setFailed(false); };
  return <section className="w-full bg-black py-4 md:py-6" aria-label="Watch"><div className="mx-auto w-full max-w-[1400px] px-4 md:px-8"><div className="overflow-hidden rounded-xl border border-white/10 bg-[#080808] shadow-2xl"><div className="flex items-center justify-between border-b border-white/8 px-3 py-2 md:px-4"><div className="min-w-0"><p className="truncate text-xs font-semibold text-white/85">{titleName || 'Watch'}</p>{mediaType === 'tv' && season && episode ? <p className="text-[10px] text-white/40">S{String(season).padStart(2, '0')} · E{String(episode).padStart(2, '0')}</p> : null}</div><button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Close player"><X className="h-4 w-4" /></button></div><div className="relative aspect-video w-full bg-black">{embedUrl && !failed ? <iframe key={embedUrl} src={embedUrl} title={`${titleName || 'Title'} — ${selectedSource?.name || 'Source'}`} className="absolute inset-0 h-full w-full border-0 bg-black" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onLoad={() => { setLoading(false); }} onError={() => { setLoading(false); setFailed(true); }} /> : null}{loading && embedUrl && !failed ? <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-white/60"><Loader2 className="h-6 w-6 animate-spin" /><span className="text-xs">Loading {selectedSource?.name || 'source'}…</span></div> : null}{failed || !embedUrl ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black px-5 text-center"><AlertCircle className="h-6 w-6 text-white/50" /><p className="text-sm font-medium text-white/75">Source unavailable</p><p className="max-w-md text-xs text-white/40">Choose another source below or configure the player base URL.</p></div> : null}</div><div className="flex items-center gap-2 border-t border-white/8 px-3 py-2 md:px-4"><span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-white/35">Source</span><div className="relative min-w-0 flex-1"><button type="button" onClick={() => setSourceMenuOpen((open) => !open)} className="flex h-8 max-w-full items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-xs text-white/80" aria-expanded={sourceMenuOpen}><span className="max-w-[120px] truncate">{selectedSource?.name ?? 'Select source'}</span><ChevronDown className={`h-3 w-3 text-white/40 ${sourceMenuOpen ? 'rotate-180' : ''}`} /></button>{sourceMenuOpen ? <div className="absolute bottom-10 left-0 z-30 max-h-56 w-48 overflow-y-auto rounded-lg border border-white/10 bg-[#101010] p-1 shadow-2xl">{BINGR_SOURCES.map((source) => <button type="button" key={source.id} onClick={() => selectSource(source.id)} className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs ${source.id === sourceId ? 'bg-white text-black' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}><span>{source.name}</span>{source.id === sourceId ? <Check className="h-3 w-3" /> : null}</button>)}</div> : null}</div></div></div></div></section>;
}
