import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, Loader2, Play, RefreshCw } from 'lucide-react';
import { STREAMING_SERVERS, buildEmbedUrl } from '@/lib/streamingProviders';

type Props = {
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  season?: number;
  episode?: number;
  onClose?: () => void;
};

export function InlineStreamPanel({ mediaType, tmdbId, season, episode, onClose }: Props) {
  const servers = useMemo(() => STREAMING_SERVERS, []);
  const [serverId, setServerId] = useState(servers[0]?.id ?? '');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const server = servers.find((item) => item.id === serverId) ?? servers[0];
  const src = server ? buildEmbedUrl(mediaType, tmdbId, server.id, season, episode) : '';

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    setOpen(false);
  }, [src]);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 9000);
    return () => window.clearTimeout(timer);
  }, [loading, attempt]);

  if (!server || !src) {
    return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center text-sm text-white/45">No streaming source is configured.</div>;
  }

  return (
    <section className="mx-0 mb-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090909] shadow-2xl" aria-label="Streaming player">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-3 py-2.5 md:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Play className="h-3.5 w-3.5 shrink-0 text-white/65 fill-white/65" />
          <span className="text-xs font-semibold text-white/75">Watch</span>
        </div>
        <div className="relative shrink-0">
          <button type="button" onClick={() => setOpen((value) => !value)} className="flex h-8 max-w-[180px] items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.045] px-2.5 text-xs font-semibold text-white transition hover:bg-white/[0.08]" aria-expanded={open}>
            <span className="truncate">{server.name}</span>
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/45 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && <div className="absolute right-0 top-10 z-50 max-h-64 w-48 overflow-y-auto rounded-xl border border-white/10 bg-[#111214] p-1 shadow-2xl backdrop-blur-xl">
            {servers.map((item) => <button type="button" key={item.id} onClick={() => { setServerId(item.id); setOpen(false); }} className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition ${item.id === server.id ? 'bg-white text-black' : 'text-white/65 hover:bg-white/[0.07] hover:text-white'}`}>{item.name}</button>)}
          </div>}
        </div>
      </div>

      <div className="relative aspect-video w-full bg-black">
        {src && <iframe key={`${src}:${attempt}`} src={src} title={`${server.name} player`} className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${failed ? 'opacity-0' : 'opacity-100'}`} allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onLoad={() => { setLoading(false); setFailed(false); }} />}
        {loading && !failed && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm"><Loader2 className="h-7 w-7 animate-spin text-white/65" /><span className="text-xs text-white/40">Loading {server.name}…</span></div>}
        {failed && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#080808] px-6 text-center"><AlertCircle className="h-7 w-7 text-white/45" /><div><p className="text-sm font-semibold text-white/80">This source is unavailable</p><p className="mt-1 text-xs text-white/40">Try another source from the selector.</p></div><button type="button" onClick={() => { setFailed(false); setLoading(true); setAttempt((value) => value + 1); }} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"><RefreshCw className="h-3.5 w-3.5" /> Retry</button></div>}
      </div>

      {onClose && <div className="flex justify-end border-t border-white/[0.06] px-3 py-2"><button type="button" onClick={onClose} className="text-[11px] font-medium text-white/35 hover:text-white/70">Close player</button></div>}
    </section>
  );
}
