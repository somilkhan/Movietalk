import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Globe, ChevronDown } from 'lucide-react';

export type Backend = 'movietalk' | 'bingr';

const options = [
  { value: 'movietalk' as Backend, label: 'Movietalk', color: 'bg-blue-500' },
  { value: 'bingr' as Backend, label: 'Bingr', color: 'bg-amber-500' },
];

export function BackendSelector({ backend, onChange }: { backend: Backend; onChange: (b: Backend) => void }) {
  const [open, setOpen] = useState(false);
  const active = options.find(o => o.value === backend)!;
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }} onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-2 p-2 md:px-3 md:py-2 rounded-lg bg-black/40 backdrop-blur-md text-white/90 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold">
        <Globe className="w-4 h-4" />
        <span className="hidden md:inline">{active.label}</span>
        <span className={`w-2 h-2 rounded-full ${active.color}`} />
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <div className={cn("absolute bottom-full right-0 mb-2 min-w-[10rem] z-50 transition-all duration-200 origin-bottom-right", open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
        <div className="bg-black/70 backdrop-blur-2xl border border-white/10 text-white rounded-xl shadow-2xl py-2 text-sm flex flex-col">
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn("flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-left transition-colors", backend === opt.value ? "text-white font-semibold" : "text-white/70")}>
              <span className={cn("w-4 flex justify-center", backend === opt.value ? "opacity-100" : "opacity-0")}><Check className="w-4 h-4" /></span>
              <span>{opt.label}</span>
              <span className={`w-2 h-2 rounded-full ${opt.color} ml-auto`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
