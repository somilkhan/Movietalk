import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, ChevronDown, Monitor } from 'lucide-react';
import type { Backend } from './BackendSelector';

interface OmssSource { url: string; type: 'hls' | 'mp4' | string; quality: string; provider: { id: string; name: string }; }
interface BingrServer { id: string; name: string; cc: string; }

const trigger = 'group flex h-9 items-center gap-2 rounded-lg border border-white/[0.07] bg-black/45 px-2.5 text-white/75 shadow-lg backdrop-blur-xl transition hover:border-white/[0.12] hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:h-10 md:px-3';
const panel = 'overflow-hidden rounded-xl border border-white/[0.08] bg-[#09090b]/95 p-1.5 text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,.85)] backdrop-blur-2xl';
const item = 'flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-white/[0.07] focus-visible:bg-white/[0.08] focus-visible:outline-none';

export function SourceSelector({ backend, movietalkSources, movietalkActiveIdx, movietalkFailedSet, onMovietalkSelect, bingrServers, bingrActiveId, onBingrSelect }: {
  backend: Backend; movietalkSources: OmssSource[]; movietalkActiveIdx: number; movietalkFailedSet: Set<number>; onMovietalkSelect: (idx: number) => void;
  bingrServers: BingrServer[]; bingrActiveId: string; onBingrSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const activeIndex = bingrServers.findIndex((server) => server.id === bingrActiveId);
  const label = backend === 'movietalk' ? 'Source' : 'Server';
  const count = backend === 'movietalk' ? (movietalkSources.length ? movietalkActiveIdx + 1 : '-') : (activeIndex >= 0 ? activeIndex + 1 : '-');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return <div className="relative" onMouseLeave={close}>
    <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={`${label} selector`} onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }} className={trigger}>
      <Monitor className="h-4 w-4 text-white/55" />
      <span className="hidden text-[12px] font-semibold md:inline">{label}</span>
      <span className="hidden text-[12px] font-medium text-white/35 md:inline">{count}</span>
      <ChevronDown className={cn('h-3.5 w-3.5 text-white/40 transition-transform', open && 'rotate-180')} />
    </button>

    <div className={cn('absolute bottom-full right-0 z-50 mb-2 origin-bottom-right transition-all duration-150', open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0')}>
      <div role="menu" aria-label={`${label} options`} className={`${panel} min-w-[260px] max-w-[calc(100vw-1rem)]`}>
        <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">{label}</div>
        <div className="max-h-[min(300px,50vh)] overflow-y-auto overscroll-contain pr-0.5">
          {backend === 'movietalk' ? (
            movietalkSources.length === 0 ? <div className="px-3 py-4 text-xs font-medium text-white/35">No sources available</div> : movietalkSources.map((source, idx) => {
              const active = idx === movietalkActiveIdx; const failed = movietalkFailedSet.has(idx); const isHls = source.type === 'hls' || source.url.includes('.m3u8');
              return <button type="button" role="menuitem" aria-current={active ? 'true' : undefined} aria-label={`Source ${idx + 1}${source.provider.name ? `, ${source.provider.name}` : ''}${failed ? ', failed' : ''}`} key={`${source.provider.id}-${idx}`} onClick={() => { onMovietalkSelect(idx); close(); }} className={cn(item, active && 'bg-white/[0.055]')}>
                <span className="flex w-4 justify-center">{active && <Check className="h-3.5 w-3.5" />}</span>
                <span className="min-w-0 flex-1"><span className={cn('flex items-center gap-1.5 text-[12px]', active ? 'font-semibold text-white' : 'font-medium text-white/70')}><span>Source {idx + 1}</span>{source.quality !== 'Auto' && <b className="rounded bg-emerald-500/15 px-1 py-0.5 text-[8px] tracking-wider text-emerald-300">{source.quality}</b>}{isHls && <b className="rounded bg-sky-500/15 px-1 py-0.5 text-[8px] tracking-wider text-sky-300">HLS</b>}</span><span className="mt-0.5 block truncate text-[10px] font-medium uppercase tracking-wide text-white/30">{source.provider.name}</span></span>
                {failed && !active && <AlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
              </button>;
            })
          ) : bingrServers.map((server, idx) => { const active = server.id === bingrActiveId; return <button type="button" role="menuitem" aria-current={active ? 'true' : undefined} aria-label={`Server ${idx + 1}, ${server.name}${server.cc ? `, ${server.cc}` : ''}`} key={server.id} onClick={() => { onBingrSelect(server.id); close(); }} className={cn(item, active && 'bg-white/[0.055]')}><span className="flex w-4 justify-center">{active && <Check className="h-3.5 w-3.5" />}</span><span className="min-w-0 flex-1"><span className={cn('flex items-center gap-1.5 text-[12px]', active ? 'font-semibold text-white' : 'font-medium text-white/70')}><span>Server {idx + 1}</span><b className="rounded bg-sky-500/15 px-1 py-0.5 text-[8px] tracking-wider text-sky-300">HLS</b></span><span className="mt-0.5 block truncate text-[10px] font-medium uppercase tracking-wide text-white/30">{server.cc} · {server.name}</span></span></button>; })}
        </div>
        <div className="mt-1.5 flex items-start gap-2 border-t border-white/[0.07] px-2.5 pt-2.5 pb-1 text-[10px] leading-snug text-white/30"><AlertCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/70" /><span>{backend === 'bingr' ? 'Bingr servers · streaming via api.bingr.one' : 'HLS sources play natively; other sources may show ads.'}</span></div>
      </div>
    </div>
  </div>;
}
