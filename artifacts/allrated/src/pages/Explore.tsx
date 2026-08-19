import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Seo } from '@/components/Seo';
import { useGetTrending, useSearchCatalog, getSearchCatalogQueryKey } from '@workspace/api-client-react';
import { TitleCard } from '@/components/TitleCard';
import { Clock, X, Search, SlidersHorizontal } from 'lucide-react';

const PLACEHOLDERS = ['Movies, shows, anime and more...', "Search 'Inception'...", "Search 'Breaking Bad'...", "Search 'Attack on Titan'...", 'Looking for a comedy?', 'Find your next binge...', 'Search for a favorite actor...'];
const TYPES = ['all', 'movie', 'tv', 'anime'] as const;
type Type = typeof TYPES[number];

export default function Explore() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<Type>('all');
  const [history, setHistory] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('rabbitrip_recent_searches') || '[]'); } catch { return []; } });
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debounced = useDebounce(query, 450);
  const trending = useGetTrending({ mediaType: 'all', window: 'day' });
  const search = useSearchCatalog({ query: debounced }, { query: { enabled: debounced.trim().length > 0, queryKey: getSearchCatalogQueryKey({ query: debounced }) } });

  useEffect(() => { const timer = window.setInterval(() => setPlaceholderIndex((value) => (value + 1) % PLACEHOLDERS.length), 3500); return () => window.clearInterval(timer); }, []);
  const saveHistory = useCallback((value: string) => { const term = value.trim(); if (!term) return; setHistory((current) => { const next = [term, ...current.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 8); localStorage.setItem('rabbitrip_recent_searches', JSON.stringify(next)); return next; }); }, []);
  useEffect(() => { if (debounced.trim() && search.data && !search.isLoading) saveHistory(debounced); }, [debounced, search.data, search.isLoading, saveHistory]);

  const raw = (debounced.trim() ? search.data : trending.data) || [];
  const results = raw.filter((item) => type === 'all' || item.mediaType === type);
  const loading = debounced.trim() ? search.isLoading : trending.isLoading;
  const removeHistory = (term: string) => { const next = history.filter((item) => item !== term); setHistory(next); localStorage.setItem('rabbitrip_recent_searches', JSON.stringify(next)); };
  const clearHistory = () => { setHistory([]); localStorage.removeItem('rabbitrip_recent_searches'); };

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-sans text-white" data-testid="page-explore">
      <Seo title="Explore" />
      <main className="min-h-screen px-4 pb-28 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-[1500px]">
          <header className="mb-8 md:mb-10">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div><p className="mb-1 text-[11px] font-semibold uppercase tracking-[.22em] text-white/35">Discover</p><h1 className="text-2xl font-bold tracking-[-.025em] sm:text-3xl">Explore</h1></div>
              <button type="button" onClick={() => setFiltersOpen((value) => !value)} className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 text-xs font-semibold text-white/65 transition hover:bg-white/[.08] hover:text-white md:hidden"><SlidersHorizontal className="h-4 w-4" /> Filters</button>
            </div>
            <div className="relative max-w-[900px]">
              <div className="rr-search-box flex min-h-[52px] items-center px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,.22)] sm:min-h-[56px]">
                <Search className="mr-3 h-5 w-5 shrink-0 text-white/35 sm:h-6 sm:w-6" strokeWidth={1.8} />
                <div className="relative flex h-full min-w-0 flex-1 items-center overflow-hidden">
                  <input type="text" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') saveHistory(query); }} className="relative z-10 w-full bg-transparent text-[15px] font-medium text-white outline-none sm:text-[16px]" aria-label="Search movies and shows" role="searchbox" />
                  {!query && <span key={placeholderIndex} className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[15px] font-medium text-white/35 animate-[rrSearchPlaceholder_.4s_ease] sm:text-[16px]">{PLACEHOLDERS[placeholderIndex]}</span>}
                </div>
                {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="ml-2 shrink-0 rounded-full p-1.5 text-white/35 transition hover:bg-white/10 hover:text-white/80"><X className="h-4 w-4" /></button>}
                <div className="ml-3 hidden h-7 w-px bg-white/10 md:block" />
                <select value={type} onChange={(event) => setType(event.target.value as Type)} aria-label="Search type" className="rr-search-type hidden h-10 appearance-none rounded-lg bg-transparent px-3 text-[13px] font-medium text-white/60 outline-none transition hover:bg-white/5 hover:text-white md:block">
                  <option value="all">All Types</option><option value="movie">Movie</option><option value="tv">TV Show</option><option value="anime">Anime</option>
                </select>
              </div>
              {filtersOpen && <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-44 rounded-xl border border-white/10 bg-[#111217] p-2 shadow-2xl md:hidden"><p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">Content type</p>{TYPES.map((value) => <button key={value} type="button" onClick={() => { setType(value); setFiltersOpen(false); }} className={`block w-full rounded-lg px-2 py-2 text-left text-xs font-medium transition ${type === value ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>{value === 'all' ? 'All Types' : value === 'tv' ? 'TV Show' : value === 'movie' ? 'Movie' : 'Anime'}</button>)}</div>}
            </div>
          </header>

          {!query.trim() && history.length > 0 && <section className="mb-8"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-white/65">Recent Searches</h2><button type="button" onClick={clearHistory} className="text-xs text-white/30 transition hover:text-white/70">Clear all</button></div><div className="flex flex-wrap gap-2">{history.map((term) => <div key={term} className="rr-history-chip flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/70"><button type="button" onClick={() => setQuery(term)} className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-white/30" />{term}</button><button type="button" aria-label={`Remove ${term}`} onClick={() => removeHistory(term)}><X className="h-3 w-3 text-white/30 hover:text-white" /></button></div>)}</div></section>}

          <div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-[17px] font-bold text-white/90 sm:text-lg">{debounced.trim() ? `Results for "${debounced}"` : 'Trending in United States'}</h2><p className="mt-1 text-xs text-white/30">{debounced.trim() ? `${results.length} results` : 'Popular right now'}</p></div></div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {loading && Array.from({ length: 14 }).map((_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-[#17191f]" />)}
            {!loading && results.length === 0 && <p className="col-span-full py-12 text-sm text-white/45">{debounced.trim() ? `Couldn't find "${debounced}"` : 'Nothing found'}</p>}
            {!loading && results.map((title, index) => <div key={`${title.mediaType}-${title.id}`} className="w-full"><TitleCard title={title} index={index} /></div>)}
          </div>
        </div>
      </main>
      <style>{`@keyframes rrSearchPlaceholder{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
