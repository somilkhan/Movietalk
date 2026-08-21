import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Seo } from '@/components/Seo';
import { getSearchCatalogQueryKey, useGetTrending, useSearchCatalog } from '@workspace/api-client-react';
import { buildImageUrl } from '@/lib/imageUrl';
import { Search, ChevronDown, X } from 'lucide-react';
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
  return <button type="button" onClick={()=>onOpen(title)} aria-label={`Open ${title.title}${title.year ? ` (${title.year})` : ''}`} className="group block w-full min-w-0 p-0 text-left text-white focus-visible:outline-none"><div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-[#0f1014] ring-1 ring-white/5 transition duration-200 group-hover:-translate-y-0.5 group-hover:ring-white/15 group-focus-visible:ring-2 group-focus-visible:ring-white/70"><img src={posterUrl} alt={title.title} loading={index<6?'eager':'lazy'} decoding="async" className="block h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" /></div><div className="mt-2 truncate text-[14px] font-semibold leading-5 text-white/90">{title.title}</div><div className="mt-1 flex min-h-[17px] items-center overflow-hidden text-[11px] font-medium leading-[17px] text-white/50">{title.voteAverage !== undefined && title.voteAverage > 0 && <span className="shrink-0">★ {title.voteAverage.toFixed(1)}</span>}{title.year && <><span className="mx-1.5 shrink-0 text-white/30">·</span><span className="shrink-0">{title.year}</span></>}<span className="mx-1.5 shrink-0 text-white/30">·</span><span className="truncate">{typeLabel}</span></div></button>;
}

export default function Explore() {
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState<FilterOption>('All Types');
  const [filterOpen,setFilterOpen]=useState(false);
  const filterRef=useRef<HTMLDivElement>(null);
  const debounced=useDebounce(query,350);
  const [,navigate]=useLocation();
  const trending=useGetTrending({mediaType:'all',window:'day',region:SEARCH_REGION});
  const search=useSearchCatalog({query:debounced,region:SEARCH_REGION},{query:{enabled:debounced.trim().length>0,queryKey:getSearchCatalogQueryKey({query:debounced,region:SEARCH_REGION})}});
  const rawData=debounced.trim()?search.data:trending.data;
  const raw=Array.isArray(rawData)?rawData as SearchTitle[]:[];
  const isLoading=debounced.trim()?search.isLoading:trending.isLoading;
  const results=raw.filter(title=>filter==='Movies'?title.mediaType==='movie':filter==='TV Shows'?title.mediaType==='tv':filter==='Anime'?(title.genreIds?.includes(16)??false):true);

  useEffect(()=>{
    const onPointerDown=(event:PointerEvent)=>{if(filterRef.current&&!filterRef.current.contains(event.target as Node))setFilterOpen(false)};
    const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape')setFilterOpen(false)};
    document.addEventListener('pointerdown',onPointerDown); document.addEventListener('keydown',onKeyDown);
    return()=>{document.removeEventListener('pointerdown',onPointerDown);document.removeEventListener('keydown',onKeyDown)};
  },[]);

  const openTitle=(title:SearchTitle)=>navigate(`/title/${title.mediaType}/${title.id}`);
  const clearSearch=()=>setQuery('');

  return <main className="min-h-[100dvh] pt-8 pb-28" data-testid="page-explore"><Seo title="Explore" /><div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10"><header><h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Explore</h1><p className="mt-1 text-sm text-white/50">Find something worth watching.</p><div className="mt-5 flex h-12 w-full items-center rounded-xl border border-white/10 bg-[#0f1014] px-4 transition focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10"><Search className="h-5 w-5 shrink-0 text-white/40" aria-hidden="true" /><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search movies, shows, anime..." aria-label="Search movies and shows" role="searchbox" className="ml-3 min-w-0 flex-1 bg-transparent p-0 text-base text-white outline-none placeholder:text-white/35" data-testid="input-search" />{query&&<button type="button" onClick={clearSearch} aria-label="Clear search" className="ml-2 rounded-full p-1.5 text-white/45 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"><X className="h-4 w-4" /></button>}</div></header><div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-white/40">{debounced.trim()?`${results.length} result${results.length===1?'':'s'}`:`Trending in ${SEARCH_REGION_LABEL}`}</p><div ref={filterRef} className="relative shrink-0"><button type="button" onClick={()=>setFilterOpen(o=>!o)} aria-haspopup="listbox" aria-expanded={filterOpen} className="flex h-9 min-w-[120px] items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0f1014] px-3 text-xs font-medium text-white/75 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"><span>{filter}</span><ChevronDown className={`h-4 w-4 text-white/55 transition-transform ${filterOpen?'rotate-180':''}`} aria-hidden="true" /></button>{filterOpen&&<div role="listbox" aria-label="Search type" className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#111318] p-1 shadow-2xl">{FILTER_OPTIONS.map(option=><button key={option} type="button" role="option" aria-selected={filter===option} onClick={()=>{setFilter(option);setFilterOpen(false)}} className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${filter===option?'bg-white/8 font-semibold text-white':'text-white/60'}`}>{option}</button>)}</div>}</div></div><div className="mt-7"><h2 className="truncate text-lg font-semibold text-white/90 sm:text-xl">{debounced.trim()?`Results for “${debounced}”`:`Trending in ${SEARCH_REGION_LABEL}`}</h2></div></div><section className="mx-auto mt-5 w-full max-w-[1500px] px-4 pb-12 sm:px-6 lg:px-10" aria-label={debounced.trim()?'Search results':'Trending titles'}>{isLoading?<div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">{Array.from({length:14}).map((_,i)=><div key={i} className="aspect-[2/3] w-full animate-pulse rounded-lg bg-[#0f1014]" />)}</div>:results.length===0?<div className="rounded-2xl border border-white/8 bg-[#0f1014]/60 px-6 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5"><Search className="h-5 w-5 text-white/35" aria-hidden="true" /></div><h3 className="mt-4 text-base font-semibold text-white/80">No results found</h3><p className="mx-auto mt-1 max-w-sm text-sm text-white/40">Try a different title, spelling, or search filter.</p>{query&&<button type="button" onClick={clearSearch} className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">Clear search</button>}</div>:<div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">{results.map((title,index)=><SearchTitleCard key={`${title.mediaType}-${title.id}`} title={title} index={index} onOpen={openTitle}/>)}</div>}</section></main>;
}
