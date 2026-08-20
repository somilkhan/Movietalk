import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Seo } from '@/components/Seo';
import { useGetTrending, useSearchCatalog, getSearchCatalogQueryKey } from '@workspace/api-client-react';
import { useRegion, REGIONS } from '@/hooks/useRegion';
import { buildImageUrl } from '@/lib/imageUrl';
import { Clock, ChevronDown, Search as SearchIcon, UsersRound, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { Footer } from '@/components/Footer';
import type { Title } from '@workspace/api-client-react';

const PLACEHOLDERS = ['Find your next binge...', 'Looking for something spooky?', "Search 'Inception'...", "Search 'Breaking Bad'...", "Search 'Attack on Titan'..."];
const TYPES = ['all', 'movie', 'tv', 'anime'] as const;
type Type = typeof TYPES[number];

function SearchCard({ title, index }: { title: Title; index: number }) {
  const [, navigate] = useLocation();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const poster = buildImageUrl(title.posterPath, 'w500') ?? '/placeholder-poster.jpg';
  const typeLabel = title.mediaType === 'movie' ? 'Movie' : title.mediaType === 'tv' ? 'Series' : 'Anime';
  return <button type="button" onClick={() => navigate(`/${title.mediaType === 'movie' ? 'movie' : title.mediaType === 'tv' ? 'tv' : 'anime'}/${title.id}`)} className="group relative w-[150px] text-left sm:w-[170px] md:w-[180px] lg:w-[185px]" aria-label={`${title.title}${title.year ? ` (${title.year})` : ''}`} data-testid="search-title-card">
    <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#1a1c24]">
      {!loaded && !failed && <div className="absolute inset-0 animate-pulse bg-[#1a1c24]" />}
      <img src={poster} alt={title.title} loading={index < 6 ? 'eager' : 'lazy'} decoding="async" className={`h-full w-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setLoaded(true)} onError={() => { setFailed(true); setLoaded(true); }} />
      {failed && <div className="absolute inset-0 flex items-center justify-center bg-[#1a1c24] px-2 text-center text-xs text-white/40">{title.title}</div>}
    </div>
    <div className="mt-2 text-[16px] font-semibold leading-6 tracking-tight text-white">{title.title}</div>
    <div className="mt-px flex items-center text-[11px] font-medium leading-[16.5px] text-white/50">
      {title.voteAverage !== undefined && title.voteAverage > 0 && <span className="flex items-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="white" aria-hidden="true" className="mr-1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>{title.voteAverage.toFixed(1)}</span>}
      {title.year && <><span className="mx-1.5 text-white/30">·</span><span>{title.year}</span></>}
      <span className="mx-1.5 text-white/30">·</span><span>{typeLabel}</span>
    </div>
  </button>;
}

export default function Search() {
  const { region } = useRegion();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<Type>('all');
  const [typeOpen, setTypeOpen] = useState(false);
  const [history, setHistory] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('rabbitrip_recent_searches') || '[]'); } catch { return []; } });
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const debounced = useDebounce(query, 450);
  const trending = useGetTrending({ mediaType: 'all', window: 'day' });
  const search = useSearchCatalog({ query: debounced }, { query: { enabled: debounced.trim().length > 0, queryKey: getSearchCatalogQueryKey({ query: debounced }) } });

  useEffect(() => { const timer = window.setInterval(() => setPlaceholderIndex((value) => (value + 1) % PLACEHOLDERS.length), 3500); return () => window.clearInterval(timer); }, []);
  const saveHistory = useCallback((value: string) => { const term = value.trim(); if (!term) return; setHistory((current) => { const next = [term, ...current.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 8); localStorage.setItem('rabbitrip_recent_searches', JSON.stringify(next)); return next; }); }, []);
  useEffect(() => { if (debounced.trim() && search.data && !search.isLoading) saveHistory(debounced); }, [debounced, search.data, search.isLoading, saveHistory]);

  const raw = (debounced.trim() ? search.data : trending.data) || [];
  const results = raw.filter((item) => type === 'all' || item.mediaType === type);
  const loading = debounced.trim() ? search.isLoading : trending.isLoading;
  const currentRegion = REGIONS.find((item) => item.code === region)?.label || region;
  const heading = debounced.trim() ? `Results for "${debounced}"` : `Trending in ${currentRegion}`;

  return <div className="min-h-screen bg-black font-sans text-white" data-testid="page-search">
    <Seo title="Search" />
    <main className="min-h-screen bg-black px-4 pb-24 pt-10">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mt-4">
          <div className="flex h-12 items-center rounded-[10px] border border-white/[0.06] bg-[#0f1014] px-4">
            <SearchIcon className="h-6 w-6 shrink-0 text-white/40" strokeWidth={1.8} />
            <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') saveHistory(query); }} className="ml-3 min-w-0 flex-1 bg-transparent text-[16px] font-medium leading-6 text-white outline-none placeholder:text-white/40" placeholder={PLACEHOLDERS[placeholderIndex]} aria-label="Search movies, shows and anime" role="searchbox" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="ml-2 rounded-full p-1 text-white/35 hover:text-white"><X className="h-4 w-4" /></button>}
          </div>
          <div className="relative mt-[9px] flex justify-end">
            <button type="button" onClick={() => setTypeOpen((value) => !value)} aria-expanded={typeOpen} aria-haspopup="listbox" className="flex h-8 w-28 items-center justify-between rounded-md border border-white/[0.05] bg-[#0f1014] px-2.5 text-[12px] font-medium leading-[18px] text-white/70"><span>{type === 'all' ? 'All Types' : type === 'tv' ? 'TV Show' : type === 'movie' ? 'Movie' : 'Anime'}</span><ChevronDown className="h-4 w-4 opacity-60" /></button>
            {typeOpen && <div role="listbox" className="absolute right-0 top-9 z-20 w-32 rounded-lg border border-white/10 bg-[#0f1014] p-1.5 shadow-2xl">{TYPES.map((value) => <button key={value} type="button" role="option" aria-selected={type === value} onClick={() => { setType(value); setTypeOpen(false); }} className={`block w-full rounded-md px-2.5 py-2 text-left text-xs ${type === value ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>{value === 'all' ? 'All Types' : value === 'tv' ? 'TV Show' : value === 'movie' ? 'Movie' : 'Anime'}</button>)}</div>}
          </div>
        </div>

        <section className="mt-10">
          <div className="flex min-h-[37.5px] items-center justify-between gap-4">
            <h2 className="text-[18px] font-semibold leading-[27px] text-white/90">{heading}</h2>
            {!debounced.trim() && <a href="/watch-party" className="flex h-[37.5px] items-center gap-2 rounded-lg bg-white/10 px-4 text-[14px] font-medium leading-5 text-white/90 no-underline"><UsersRound className="h-4 w-4" />Watch Party</a>}
          </div>
          {history.length > 0 && debounced.trim() === '' && <div className="sr-only" aria-label="Recent searches">{history.map((term) => <span key={term}><Clock className="inline h-3 w-3" />{term}</span>)}</div>}
          <div className="mt-6 grid grid-cols-[repeat(2,150px)] justify-between gap-y-8 px-4 sm:grid-cols-[repeat(2,170px)] md:grid-cols-[repeat(4,180px)] md:justify-center md:gap-x-8 lg:grid-cols-[repeat(5,185px)]">
            {loading && Array.from({ length: 10 }).map((_, index) => <div key={index} className="aspect-[2/3] w-[150px] animate-pulse bg-[#1a1c24] sm:w-[170px] md:w-[180px] lg:w-[185px]" />)}
            {!loading && results.length === 0 && <p className="col-span-full py-12 text-sm text-white/45">{debounced.trim() ? `Couldn't find "${debounced}"` : 'Nothing found'}</p>}
            {!loading && results.map((title, index) => <SearchCard key={`${title.mediaType}-${title.id}`} title={title} index={index} />)}
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </div>;
}
