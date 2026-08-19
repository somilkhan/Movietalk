import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Globe } from 'lucide-react';

export type Backend = 'movietalk' | 'bingr';

const options = [
  { value: 'movietalk' as Backend, label: 'Movietalk', color: 'bg-blue-500' },
  { value: 'bingr' as Backend, label: 'Bingr', color: 'bg-amber-500' },
];

export function BackendSelector({ backend, onChange }: { backend: Backend; onChange: (b: Backend) => void }) {
  const [open, setOpen] = useState(false);
  const active = options.find((option) => option.value === backend)!;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Streaming backend: ${active.label}`}
        onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }}
        onMouseEnter={() => setOpen(true)}
        className="group flex h-9 min-w-9 items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-black/45 px-2.5 text-white/75 shadow-lg backdrop-blur-xl transition hover:border-white/[0.12] hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:h-10 md:px-3"
      >
        <Globe className="h-4 w-4 text-white/55 transition-colors group-hover:text-white/80" />
        <span className="hidden text-[12px] font-semibold md:inline">{active.label}</span>
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${active.color}`} />
        <ChevronDown className={cn('h-3.5 w-3.5 text-white/40 transition-transform', open && 'rotate-180')} />
      </button>

      <div className={cn('absolute bottom-full right-0 z-50 mb-2 origin-bottom-right transition-all duration-150', open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0')}>
        <div role="menu" aria-label="Streaming backend" className="min-w-[170px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#09090b]/95 p-1.5 text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,.85)] backdrop-blur-2xl">
          {options.map((option) => (
            <button
              type="button"
              role="menuitemradio"
              aria-checked={backend === option.value}
              key={option.value}
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={cn('flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30', backend === option.value ? 'bg-white/[0.06] font-semibold text-white' : 'font-medium text-white/55')}
            >
              <span className="flex w-4 justify-center">{backend === option.value ? <Check className="h-3.5 w-3.5" /> : null}</span>
              <span className="flex-1">{option.label}</span>
              <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${option.color}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}