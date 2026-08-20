import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Seo } from '@/components/Seo';
import { getSearchCatalogQueryKey, useGetTrending, useSearchCatalog } from '@workspace/api-client-react';
import { buildImageUrl } from '@/lib/imageUrl';
import { Search, ChevronDown, UsersRound } from 'lucide-react';
import { useLocation } from 'wouter';

const SEARCH_REGION = 'IN';
const SEARCH_REGION_LABEL = 'India';
const FILTER_OPTIONS = ['All Types', 'Movies', 'TV Shows', 'Anime'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];
type SearchTitle = { id:number; mediaType:string; title:string; posterPath:string|null; voteAverage?:number; year?:string|null; genreIds?:number[] };

function SearchTitleCard({ title, index, onOpen }: { title:SearchTitle; index:number; onOpen:(title:SearchTitle)=>void }) {
  const posterUrl = buildImageUrl(title.posterPath, 'w500') ?? '/placeholder-poster.jpg';
  const isAnime = title.genreIds?.includes(16) ?? false;
  const typeLabel = title.mediaType === 'movie' ? 'Movie' : isAnime ? 'Anime' : 'Series';
  return <button type="button" onClick={()=>onOpen(title)} aria-label={`${title.title}${title.year ? ` (${title.year})` : ''}`} className="block w-[150px] p-0 text-left text-white">
    <div className="h-[225px] w-[150px] overflow-hidden rounded-lg bg-[#0f1014]"><img src={posterUrl} alt={title.title} loading={index<6?'eager':'lazy'} decoding="async" className="block h-full w-full object-cover" /></div>
    <div className="mt-[9px] truncate text-[14px] font-semibold leading-5 text-white/90">{title.title}</div>
    <div className="mt-1 flex h-[16.5px] items-center text-[11px] font-medium leading-[16.5px] text-white/50">
      {title.voteAverage !== undefined && title.voteAverage > 0 && <span className="flex items-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="mr-1 shrink-0" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>{title.voteAverage.toFixed(1)}</span>}
      {title.year && <><span className="mx-1.5 text-white/30">·</span><span>{title.year}</span></>}
      <span className="mx-1.5 text-white/30">·</span><span>{typeLabel}</span>
    </div>
  </button>;
}

export default function Explore() {
  const [query,setQuery]=useState(''); const [filter,setFilter]=useState<FilterOption>('All Types'); const [filterOpen,setFilterOpen]=useState(false); const debounced=useDebounce(query,350); const [,navigate]=useLocation();
  const trending=useGetTrending({mediaType:'all',window:'day',region:SEARCH_REGION});
  const search=useSearchCatalog({query:debounced,region:SEARCH_REGION},{query:{enabled:debounced.trim().length>0,queryKey:getSearchCatalogQueryKey({query:debounced,region:SEARCH_REGION})}});
  const rawData=debounced.trim()?search.data:trending.data; const raw=Array.isArray(rawData)?rawData as SearchTitle[]:[]; const isLoading=debounced.trim()?search.isLoading:trending.isLoading;
  const results=raw.filter(title=>filter==='Movies'?title.mediaType==='movie':filter==='TV Shows'?title.mediaType==='tv':filter==='Anime'?(title.genreIds?.includes(16)??false):true);
  const openTitle=(title:SearchTitle)=>navigate(`/title/${title.mediaType}/${title.id}`);
  return <main className="pt-10 pb-24" data-testid="page-explore"><Seo title="Explore" />
    <div className="px-4">
      <div className="mt-4 h-11"><div className="flex h-11 w-full items-center rounded-xl border border-white/5 bg-[#0f1014] px-4"><Search className="h-6 w-6 shrink-0 text-white/40" strokeWidth={2}/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find your next binge..." aria-label="Search movies and shows" role="searchbox" className="ml-3 min-w-0 flex-1 bg-transparent p-0 text-base font-medium leading-6 text-white outline-none placeholder:text-white/40" data-testid="input-search"/></div></div>
      <div className="mt-[13.5px] flex justify-end"><div className="relative"><button type="button" onClick={()=>setFilterOpen(o=>!o)} className="flex h-8 w-28 items-center justify-between rounded-md border border-white/5 bg-[#0f1014] px-2.5 text-xs font-medium leading-[18px] text-white/70"><span>{filter}</span><ChevronDown className={`h-4 w-4 shrink-0 text-white/70 transition-transform ${filterOpen?'rotate-180':''}`} strokeWidth={2}/></button>{filterOpen&&<div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-lg border border-white/10 bg-[#0f1014] shadow-xl">{FILTER_OPTIONS.map(option=><button key={option} type="button" onClick={()=>{setFilter(option);setFilterOpen(false)}} className={`block w-full px-3 py-2.5 text-left text-sm ${filter===option?'font-semibold text-white':'text-white/60'} hover:bg-white/5`}>{option}</button>)}</div>}</div></div>
      <div className="mt-10 flex h-[37.5px] items-center justify-between"><h2 className="m-0 text-[18px] font-semibold leading-[27px] text-white/90">{debounced.trim()?`Results for "${debounced}"`:`Trending in ${SEARCH_REGION_LABEL}`}</h2><a href="/watch-party" className="inline-flex h-[37.5px] items-center gap-2 rounded-lg bg-white/10 px-4 text-sm font-medium leading-5 text-white/90"><UsersRound className="h-4 w-4 shrink-0" strokeWidth={2}/>Watch Party</a></div>
    </div>
    <div className="mt-6 px-8 pb-16"><div className="grid grid-cols-[repeat(2,150px)] justify-between gap-y-8">{isLoading&&Array.from({length:12}).map((_,i)=><div key={i} className="h-[274.5px] w-[150px] animate-pulse rounded-lg bg-[#0f1014]"/>)}{!isLoading&&results.length===0&&<p className="col-span-full py-8 text-sm text-white/50">No results found.</p>}{!isLoading&&results.map((title,index)=><SearchTitleCard key={`${title.mediaType}-${title.id}`} title={title} index={index} onOpen={openTitle}/>)}</div></div>
  </main>;
}
