import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Monitor, AlertCircle, ChevronDown } from 'lucide-react';
import type { Backend } from './BackendSelector';

interface OmssSource {
  url: string;
  type: 'hls' | 'mp4' | string;
  quality: string;
  provider: { id: string; name: string };
}
interface BingrServer {
  id: string;
  name: string;
  cc: string;
}

export function SourceSelector({
  backend, movietalkSources, movietalkActiveIdx, movietalkFailedSet, onMovietalkSelect,
  bingrServers, bingrActiveId, onBingrSelect,
}: {
  backend: Backend;
  movietalkSources: OmssSource[];
  movietalkActiveIdx: number;
  movietalkFailedSet: Set<number>;
  onMovietalkSelect: (idx: number) => void;
  bingrServers: BingrServer[];
  bingrActiveId: string;
  onBingrSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (backend === 'movietalk') {
    return (
      <div className="relative" onMouseLeave={() => setOpen(false)}>
        <button onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }} onMouseEnter={() => setOpen(true)}
          className="flex items-center gap-2 p-2 md:px-3 md:py-2 rounded-lg bg-black/40 backdrop-blur-md text-white/90 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold">
          <Monitor className="w-4 h-4" />
          <span className="hidden md:inline">Source</span>
          <span className="hidden md:inline opacity-50 font-normal">{movietalkSources.length > 0 ? movietalkActiveIdx + 1 : '-'}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
        </button>
        <div className={cn("absolute bottom-full right-0 mb-2 min-w-[16rem] max-w-[calc(100vw-1rem)] z-50 transition-all duration-200 origin-bottom-right", open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
          <div className="bg-black/70 backdrop-blur-2xl border border-white/10 text-white rounded-xl shadow-2xl py-2 text-sm flex flex-col w-max max-w-[calc(100vw-1rem)]">
            <div className="text-white/50 text-[11px] font-bold px-5 mb-2 uppercase tracking-wider">Source</div>
            {movietalkSources.length === 0 ? (
              <div className="px-5 py-3 text-white/40 text-sm">No sources available</div>
            ) : (
              <div className="flex flex-col max-h-[300px] overflow-y-auto">
                {movietalkSources.map((s, idx) => {
                  const isActive = movietalkActiveIdx === idx;
                  const failed = movietalkFailedSet.has(idx);
                  const isHls = s.type === 'hls' || s.url.includes('.m3u8');
                  return (
                    <button key={idx} onClick={() => { onMovietalkSelect(idx); setOpen(false); }}
                      className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/10 text-left transition-colors">
                      <span className={cn("w-4 text-white", isActive ? "opacity-100" : "opacity-0")}><Check className="w-4 h-4" /></span>
                      <div className="flex-1 min-w-0">
                        <div className={cn("flex items-center gap-2", isActive ? "text-white font-semibold" : "text-white/80")}>
                          <span>Source {idx + 1}</span>
                          {s.quality !== 'Auto' && <span className="text-[9px] font-black tracking-wider px-1 py-0.5 rounded bg-green-500/20 text-green-400">{s.quality}</span>}
                          {isHls && <span className="text-[9px] font-black tracking-wider px-1 py-0.5 rounded bg-blue-500/20 text-blue-300">HLS</span>}
                        </div>
                        <div className="text-[11px] uppercase font-semibold mt-0.5 text-white/40 truncate">{s.provider.name}</div>
                      </div>
                      {failed && !isActive && <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-2 border-t border-white/10 px-5 pt-2.5 pb-1 flex items-start gap-2 text-white/50 text-[11px] leading-snug max-w-[280px]">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400/80" />
              <span>HLS sources play natively; others may show ads.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeIndex = bingrServers.findIndex(s => s.id === bingrActiveId);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }} onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-2 p-2 md:px-3 md:py-2 rounded-lg bg-black/40 backdrop-blur-md text-white/90 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold">
        <Monitor className="w-4 h-4" />
        <span className="hidden md:inline">Server</span>
        <span className="hidden md:inline opacity-50 font-normal">{activeIndex + 1}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <div className={cn("absolute bottom-full right-0 mb-2 min-w-[16rem] max-w-[calc(100vw-1rem)] z-50 transition-all duration-200 origin-bottom-right", open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
        <div className="bg-black/70 backdrop-blur-2xl border border-white/10 text-white rounded-xl shadow-2xl py-2 text-sm flex flex-col w-max max-w-[calc(100vw-1rem)]">
          <div className="text-white/50 text-[11px] font-bold px-5 mb-2 uppercase tracking-wider">Server</div>
          <div className="flex flex-col max-h-[300px] overflow-y-auto">
            {bingrServers.map((server, idx) => {
              const isActive = server.id === bingrActiveId;
              return (
                <button key={server.id} onClick={() => { onBingrSelect(server.id); setOpen(false); }}
                  className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/10 text-left transition-colors">
                  <span className={cn("w-4 text-white", isActive ? "opacity-100" : "opacity-0")}><Check className="w-4 h-4" /></span>
                  <div className="flex-1 min-w-0">
                    <div className={cn("flex items-center gap-2", isActive ? "text-white font-semibold" : "text-white/80")}>
                      <span>Server {idx + 1}</span>
                      <span className="text-[9px] font-black tracking-wider px-1 py-0.5 rounded bg-blue-500/20 text-blue-300">HLS</span>
                    </div>
                    <div className="text-[11px] uppercase font-semibold mt-0.5 text-white/40 truncate">{server.cc} &bull; {server.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 border-t border-white/10 px-5 pt-2.5 pb-1 flex items-start gap-2 text-white/50 text-[11px] leading-snug max-w-[280px]">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400/80" />
            <span>Bingr servers &mdash; streaming via api.bingr.one</span>
          </div>
        </div>
      </div>
    </div>
  );
}
