import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

interface Episode {
  id: number; episodeNumber: number; name: string;
  stillPath: string | null; runtime: number | null;
}

export function EpisodeList({
  episodes, season, tvEpisode, playing, loading, onChangeEpisode, seasonList, onChangeSeason
}: {
  episodes: Episode[];
  season: number;
  tvEpisode: number;
  playing: boolean;
  loading: boolean;
  onChangeEpisode: (s: number, ep: number) => void;
  seasonList: number[];
  onChangeSeason: (s: number) => void;
}) {
  if (loading) {
    return (
      <div className="px-4 py-5 md:px-6">
        <div className="mb-4 flex items-center gap-4">
          <h2 className="text-sm font-bold text-white">Episodes</h2>
          {seasonList.length > 1 && (
            <select value={season} onChange={e => onChangeSeason(Number(e.target.value))}
              className="rounded-lg bg-white/8 px-3 py-2 text-sm font-semibold text-white border-0 outline-none cursor-pointer">
              {seasonList.map(s => <option key={s} value={s}>Season {s}</option>)}
            </select>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3">
              <div className="h-16 w-28 flex-shrink-0 animate-pulse rounded-lg bg-white/6" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-3/4 animate-pulse rounded bg-white/6" />
                <div className="h-2 w-1/3 animate-pulse rounded bg-white/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 md:px-6">
      <div className="mb-4 flex items-center gap-4">
        <h2 className="text-sm font-bold text-white">Episodes</h2>
        {seasonList.length > 1 && (
          <select value={season} onChange={e => onChangeSeason(Number(e.target.value))}
            className="rounded-lg bg-white/8 px-3 py-2 text-sm font-semibold text-white border-0 outline-none cursor-pointer">
            {seasonList.map(s => <option key={s} value={s}>Season {s}</option>)}
          </select>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {episodes.map(ep => {
          const active = ep.episodeNumber === tvEpisode;
          return (
            <button key={ep.id} onClick={() => onChangeEpisode(season, ep.episodeNumber)}
              className={cn("flex items-start gap-3 rounded-xl p-3 text-left transition-all", active ? 'bg-white/12 ring-1 ring-white/20' : 'hover:bg-white/6')}>
              <div className="relative flex-shrink-0 w-28 aspect-video rounded-lg overflow-hidden bg-white/5">
                {ep.stillPath
                  ? <img src={ep.stillPath} alt={ep.name} className="w-full h-full object-cover" loading="lazy" />
                  : <div className="flex h-full w-full items-center justify-center"><Play className="h-4 w-4 text-white/20" /></div>}
                <div className="absolute bottom-1 left-1.5 rounded bg-black/70 px-1 py-0.5 text-[10px] font-bold text-white/90">E{ep.episodeNumber}</div>
                {active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    {playing
                      ? <div className="flex gap-0.5 items-end h-4"><span className="w-0.5 bg-white animate-[bounce_0.8s_ease-in-out_infinite]" style={{height:'60%'}} /><span className="w-0.5 bg-white animate-[bounce_0.8s_ease-in-out_0.15s_infinite]" style={{height:'100%'}} /><span className="w-0.5 bg-white animate-[bounce_0.8s_ease-in-out_0.3s_infinite]" style={{height:'75%'}} /></div>
                      : <Play className="h-4 w-4 fill-white text-white" />}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className={cn("truncate text-sm font-semibold leading-tight", active ? 'text-white' : 'text-white/80')}>{ep.name}</p>
                {ep.runtime && <p className="mt-1 text-[11px] text-white/35">{ep.runtime} min</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
