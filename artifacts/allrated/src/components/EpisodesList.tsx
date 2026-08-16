import { useState } from 'react';
import { Link } from 'wouter';
import { Play, Download, ChevronDown, Search } from 'lucide-react';
import { useTvSeason } from '@/hooks/useTvSeason';

interface Episode { id: number; episodeNumber: number; name: string; overview: string; stillPath: string | null; airDate: string | null; runtime: number | null; }

export function EpisodesList({ showId, numberOfSeasons }: { showId: number; numberOfSeasons: number | null }) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEpisode, setExpandedEpisode] = useState<number | null>(null);
  const { episodes, loading } = useTvSeason(showId, selectedSeason, true);
  const seasons = numberOfSeasons ? Array.from({ length: numberOfSeasons }, (_, i) => i + 1) : [1];
  const filteredEpisodes = searchQuery.trim() ? episodes.filter((ep) => ep.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(ep.episodeNumber).includes(searchQuery)) : episodes;
  const episodeHref = (episode: number) => `/watch/tv/${showId}/${selectedSeason}/${episode}`;

  return <div className="mt-8 md:mt-16">
    <div className="flex items-center justify-between gap-4 mb-5"><h2 className="heading-trail text-xl md:text-2xl font-semibold text-white min-w-0 truncate">Episodes</h2><span className="text-xs font-medium text-white/30">{filteredEpisodes.length} episodes</span></div>
    <div className="flex items-center gap-2 mb-5 flex-wrap">
      <div className="relative shrink-0">
        <select value={selectedSeason} onChange={(e) => { setSelectedSeason(Number(e.target.value)); setSearchQuery(''); setExpandedEpisode(null); }} aria-label="Select season" className="appearance-none h-9 rounded-[10px] border border-white/[0.08] text-[12px] font-semibold text-white transition-colors w-[112px] px-3 pr-8 hover:border-white/25 focus:border-white/25 bg-white/[0.035]">
          {seasons.map((s) => <option key={s} value={s} className="bg-[#0f1014]">Season {s}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/45 pointer-events-none" />
      </div>
      <div className="relative flex-1 min-w-[190px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
        <input placeholder="Search episode..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Search episode" className="h-9 rounded-[10px] border border-white/[0.08] text-[12px] font-medium text-white transition-colors w-full pl-9 pr-3 placeholder:text-white/35 bg-white/[0.035] outline-none focus:border-white/25 focus:ring-0" />
      </div>
    </div>
    {loading ? <div className="flex flex-col gap-2">{[1,2,3].map((i) => <div key={i} className="w-full rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-2 md:p-3 animate-shimmer h-20" />)}</div> : <div className="flex flex-col gap-2 max-h-[32rem] lg:max-h-[40rem] overflow-auto pr-1">
      {filteredEpisodes.map((ep: Episode) => <div key={ep.id} className="group relative w-full rounded-[14px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all duration-200">
        <div className="flex items-center gap-3 md:gap-4 p-2 md:p-3">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 md:hidden">
            <div className="relative flex-shrink-0 w-28 aspect-video rounded-[8px] overflow-hidden bg-white/[0.04] border border-white/[0.05]">{ep.stillPath ? <img src={ep.stillPath} alt={ep.name} className="object-cover w-full h-full" loading="lazy"/> : <div className="w-full h-full bg-white/[0.04]"/>}<span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-white bg-black/80 backdrop-blur-sm rounded border border-white/[0.06]">{ep.episodeNumber}</span></div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1"><h4 className="font-medium text-white text-[13.5px] leading-snug line-clamp-1">{ep.name}</h4><span className="text-white/50 text-[11px] tabular-nums">{ep.runtime ? `${ep.runtime}m` : ''}</span></div>
            <button type="button" onClick={() => setExpandedEpisode(expandedEpisode === ep.id ? null : ep.id)} className="rounded-full p-1 text-white/45 hover:text-white hover:bg-white/5" aria-label={expandedEpisode === ep.id ? 'Collapse episode' : 'Expand episode'}><ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedEpisode === ep.id ? 'rotate-180' : ''}`}/></button>
          </div>
          <Link href={episodeHref(ep.episodeNumber)} className="hidden md:flex items-center gap-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0 w-40 aspect-video rounded-[10px] overflow-hidden bg-white/[0.04] border border-white/[0.05]">{ep.stillPath ? <img src={ep.stillPath} alt={ep.name} className="object-cover w-full h-full group-hover:scale-[1.04] transition-transform duration-500 ease-out" loading="lazy"/> : <div className="w-full h-full bg-white/[0.04]"/>}<span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-white bg-black/80 backdrop-blur-sm rounded border border-white/[0.06]">{ep.episodeNumber}</span></div>
            <div className="flex flex-col gap-1 min-w-0 flex-1 py-1"><h4 className="font-medium text-white text-[15px] leading-snug line-clamp-1 group-hover:text-white/80">{ep.name}</h4><span className="text-white/50 text-[11.5px] tabular-nums">{ep.runtime ? `${ep.runtime}m` : ''}</span><p className="text-white/50 text-[13px] leading-relaxed line-clamp-2">{ep.overview}</p></div>
          </Link>
          <Link href={episodeHref(ep.episodeNumber)} className="hidden md:flex flex-shrink-0 items-center justify-center w-9 h-9 rounded-full text-white/45 hover:text-white hover:bg-white/[0.06]" aria-label={`Open ${ep.name}`}><Download className="w-4 h-4"/></Link>
        </div>
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${expandedEpisode === ep.id ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}><div className="px-3 pb-3 pt-1"><h4 className="font-medium text-white text-[15px] leading-snug mb-2"><span className="tabular-nums">{ep.episodeNumber}.</span> {ep.name}</h4><p className="text-white/50 text-[13px] leading-relaxed mb-3 max-h-[140px] overflow-y-auto pr-1">{ep.overview}</p><div className="flex items-center gap-2"><Link href={episodeHref(ep.episodeNumber)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black text-[12px] font-medium"><Play className="w-3 h-3 fill-black"/>Play</Link><Link href={episodeHref(ep.episodeNumber)} className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:border-white/30" aria-label={`Open ${ep.name}`}><Download className="w-3.5 h-3.5"/></Link></div></div></div>
      </div>)}
      {!filteredEpisodes.length && <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-12 text-center text-sm text-white/35">No episodes match “{searchQuery}”.</div>}
    </div>}
  </div>;
}
