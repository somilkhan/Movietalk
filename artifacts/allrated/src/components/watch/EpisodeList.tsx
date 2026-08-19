import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

interface Episode {
  id: number; episodeNumber: number; name: string;
  stillPath: string | null; runtime: number | null;
}

export function EpisodeList({ episodes, season, tvEpisode, playing, loading, onChangeEpisode, seasonList, onChangeSeason }: {
  episodes: Episode[]; season: number; tvEpisode: number; playing: boolean; loading: boolean;
  onChangeEpisode: (s: number, ep: number) => void; seasonList: number[]; onChangeSeason: (s: number) => void;
}) {
  const seasonPicker = seasonList.length > 1 ? <select aria-label="Season" value={season} onChange={e => onChangeSeason(Number(e.target.value))}
    className="h-9 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 text-xs font-semibold text-white outline-none transition hover:bg-white/[0.06] focus:border-white/20">
    {seasonList.map(s => <option key={s} value={s}>Season {s}</option>)}
  </select> : null;

  if (loading) return <div className="px-4 py-5 md:px-6">
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-white/90">Episodes</h2>{seasonPicker}</div>
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="flex gap-3 rounded-xl p-3"><div className="h-16 w-28 shrink-0 animate-pulse rounded-lg bg-white/[0.045]" /><div className="flex-1 space-y-2 pt-1"><div className="h-3 w-3/4 animate-pulse rounded bg-white/[0.045]" /><div className="h-2 w-1/3 animate-pulse rounded bg-white/[0.045]" /></div></div>)}
    </div>
  </div>;

  return <div className="px-4 py-5 md:px-6">
    <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-white/90">Episodes</h2><p className="mt-0.5 text-[11px] text-white/30">Continue watching</p></div>{seasonPicker}</div>
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
      {episodes.map(ep => {
        const active = ep.episodeNumber === tvEpisode;
        return <button key={ep.id} type="button" aria-current={active ? 'true' : undefined} onClick={() => onChangeEpisode(season, ep.episodeNumber)}
          className={cn('group flex items-start gap-3 rounded-xl p-3 text-left outline-none transition-colors', active ? 'bg-white/[0.09] ring-1 ring-white/[0.16]' : 'hover:bg-white/[0.045] focus-visible:bg-white/[0.055]')}>
          <div className="relative w-28 shrink-0 overflow-hidden rounded-lg bg-white/[0.045] aspect-video">
            {ep.stillPath ? <img src={ep.stillPath} alt={ep.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center"><Play className="h-4 w-4 text-white/20" /></div>}
            <div className="absolute bottom-1 left-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-white/85">E{ep.episodeNumber}</div>
            {active && <div className="absolute inset-0 flex items-center justify-center bg-black/40">{playing ? <div className="flex h-4 items-end gap-0.5"><span className="w-0.5 animate-[bounce_0.8s_ease-in-out_infinite] bg-white" style={{height:'60%'}} /><span className="w-0.5 animate-[bounce_0.8s_ease-in-out_0.15s_infinite] bg-white" style={{height:'100%'}} /><span className="w-0.5 animate-[bounce_0.8s_ease-in-out_0.3s_infinite] bg-white" style={{height:'75%'}} /></div> : <Play className="h-4 w-4 fill-white text-white" />}</div>}
          </div>
          <div className="min-w-0 flex-1 pt-0.5"><p className={cn('truncate text-sm font-semibold leading-tight', active ? 'text-white' : 'text-white/75')}>{ep.name}</p>{ep.runtime ? <p className="mt-1 text-[11px] text-white/30">{ep.runtime} min</p> : null}</div>
        </button>;
      })}
    </div>
  </div>;
}
