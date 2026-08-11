import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Seo } from '@/components/Seo';
import {
  useGetTrending,
  useSearchCatalog,
  getSearchCatalogQueryKey,
} from '@workspace/api-client-react';
import { TitleCard } from '@/components/TitleCard';
import { Clock, X, SlidersHorizontal } from 'lucide-react';
import { TMDB_GENRES } from '@/lib/tmdbGenres';

const FILTER_OPTIONS = ['All Types', 'Movies', 'TV Shows', 'Anime'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

export default function Explore() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('All Types');
  const [filterOpen, setFilterOpen] = useState(false);
  const debounced = useDebounce(query, 350);

  // Advanced filters
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bingr_recent_searches') || '[]');
    } catch { return []; }
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'year'>('relevance');
  const [language, setLanguage] = useState('all');
  const [quality, setQuality] = useState('all');

  const LANGUAGES = [
    { value: 'all', label: 'All Languages' },
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'zh', label: 'Chinese' },
  ];

  const QUALITIES = [
    { value: 'all', label: 'All Qualities' },
    { value: '4k', label: '4K' },
    { value: '1080p', label: '1080p' },
    { value: '720p', label: '720p' },
  ];

  const trending = useGetTrending({ mediaType: 'all', window: 'day' });
  const search = useSearchCatalog(
    { query: debounced },
    {
      query: {
        enabled: debounced.trim().length > 0,
        queryKey: getSearchCatalogQueryKey({ query: debounced }),
      },
    },
  );

  // Save to search history when debounced query changes and results come in
  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((t) => t !== term)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('bingr_recent_searches', JSON.stringify(updated));
  };

  // Triggered when search resolves
  if (debounced.trim().length > 0 && search.data && !search.isLoading) {
    const last = localStorage.getItem('bingr_recent_searches');
    const arr: string[] = last ? JSON.parse(last) : [];
    if (!arr.includes(debounced)) saveSearch(debounced);
  }

  type AnyTitle = { mediaType: string; genreIds?: number[]; year?: string | null; voteAverage?: number; [k: string]: unknown };
  const rawData = debounced.trim().length > 0 ? search.data : trending.data;
  const raw = Array.isArray(rawData) ? rawData as AnyTitle[] : [];
  const isLoading = debounced.trim().length > 0 ? search.isLoading : trending.isLoading;

  // Apply filters
  let results = raw?.filter((t: AnyTitle) => {
    if (filter === 'Movies') return t.mediaType === 'movie';
    if (filter === 'TV Shows') return t.mediaType === 'tv';
    return true;
  });

  // Genre filter (by genreId)
  if (selectedGenre && results) {
    const gid = Number(selectedGenre);
    results = results.filter((t: AnyTitle) => (t.genreIds ?? []).includes(gid));
  }

  // Year filter
  if (selectedYear && results) {
    results = results.filter((t: AnyTitle) => (t.year ?? '').startsWith(selectedYear));
  }

  // Language filter (original_language field from TMDB)
  if (language !== 'all' && results) {
    results = results.filter((t: AnyTitle) => (t as any).originalLanguage === language || (t as any).original_language === language);
  }

  // Sort
  if (results && sortBy !== 'relevance') {
    results = [...results].sort((a: AnyTitle, b: AnyTitle) => {
      if (sortBy === 'rating') return (b.voteAverage ?? 0) - (a.voteAverage ?? 0);
      if (sortBy === 'year') return (b.year ?? '').localeCompare(a.year ?? '');
      return 0;
    });
  }

  const removeRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem('bingr_recent_searches', JSON.stringify(updated));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('bingr_recent_searches');
  };

  return (
    <div className="pb-24 md:pb-12 pt-14 md:pt-0" data-testid="page-explore">
      <Seo title="Explore" />

      {/* ── Search bar ── */}
      <div className="sticky top-14 md:top-0 z-30 pt-2 md:pt-4 pb-3 px-6 lg:px-20 bg-background/80 backdrop-blur-md">
        <div className="md:max-w-[560px]">
          <div className="relative flex items-center gap-0 rounded-xl border border-border bg-card overflow-hidden">
            {/* Search icon */}
            <div className="flex-shrink-0 pl-4 pr-2 flex items-center pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>

            {/* Input */}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Movies, shows, anime and more..."
              aria-label="Search movies and shows"
              role="searchbox"
              className="flex-1 min-w-0 bg-transparent py-3.5 pr-2 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              data-testid="input-search"
            />

            {/* Divider */}
            <div className="h-5 w-px bg-border flex-shrink-0" />

            {/* Filter dropdown trigger */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className="flex items-center gap-1.5 px-4 py-3.5 text-[14px] font-medium text-foreground whitespace-nowrap"
              >
                {filter}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-border bg-popover shadow-xl overflow-hidden z-50">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setFilter(opt); setFilterOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-white/5 ${filter === opt ? 'text-white font-semibold' : 'text-muted-foreground'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Watch Party banner ── */}
      <div className="px-6 lg:px-20 mt-4 mb-6">
        <div
          className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4"
          data-testid="banner-watch-party"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-white">Host a Watch Party</p>
              <p className="text-[13px] text-muted-foreground truncate">
                Watch movies and shows in sync with your friends.
              </p>
            </div>
          </div>
          <button className="flex-shrink-0 rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-semibold text-white hover:bg-white/10 transition whitespace-nowrap">
            Start&nbsp;Party
          </button>
        </div>
      </div>

      {/* ── Recent searches (shown when input is empty) ── */}
      {!query.trim() && recentSearches.length > 0 && (
        <div className="px-6 lg:px-20 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#ffffffb3]">Recent Searches</h3>
            <button
              onClick={clearAllRecent}
              className="text-xs text-[#ffffff4d] hover:text-[#ffffffb3] transition-bingr"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffffff0d] text-[#ffffffb3] text-xs hover:bg-[#ffffff1a] transition-bingr"
              >
                <Clock className="w-3 h-3 text-[#ffffff4d]" />
                {term}
                <X
                  className="w-3 h-3 text-[#ffffff4d] hover:text-white"
                  onClick={(e) => removeRecent(term, e)}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Advanced filters ── */}
      <div className="px-6 lg:px-20 mb-4 flex items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-bingr ${
            showFilters || selectedGenre || selectedYear || sortBy !== 'relevance'
              ? 'bg-[#4752c4]/20 text-[#4752c4] border border-[#4752c4]/30'
              : 'bg-[#ffffff0d] text-[#ffffffb3] hover:bg-[#ffffff1a]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {(selectedGenre || selectedYear || sortBy !== 'relevance') && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4752c4]" />
          )}
        </button>
        {(selectedGenre || selectedYear || sortBy !== 'relevance') && (
          <button
            onClick={() => { setSelectedGenre(''); setSelectedYear(''); setSortBy('relevance'); }}
            className="text-xs text-[#ffffff4d] hover:text-[#ffffffb3] transition-bingr"
          >
            Reset
          </button>
        )}
      </div>

      {showFilters && (
        <div className="px-6 lg:px-20 mb-6">
          <div className="p-4 rounded-xl bg-[#252830] border border-[#ffffff0d]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[#ffffff4d] mb-1 block">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-[#07070b] border border-[#ffffff1a] rounded-lg px-3 py-2 text-sm text-[#ffffffb3] outline-none focus:border-[#ffffff33]"
                >
                  <option value="">All Genres</option>
                  {Object.entries(TMDB_GENRES).map(([gid, name]) => (
                    <option key={gid} value={gid}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#ffffff4d] mb-1 block">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-[#07070b] border border-[#ffffff1a] rounded-lg px-3 py-2 text-sm text-[#ffffffb3] outline-none focus:border-[#ffffff33]"
                >
                  <option value="">All Years</option>
                  {Array.from({ length: 50 }, (_, i) => 2026 - i).map((year) => (
                    <option key={year} value={String(year)}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#ffffff4d] mb-1 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full bg-[#07070b] border border-[#ffffff1a] rounded-lg px-3 py-2 text-sm text-[#ffffffb3] outline-none focus:border-[#ffffff33]"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="year">Year</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#ffffff4d] mb-1 block">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#07070b] border border-[#ffffff1a] rounded-lg px-3 py-2 text-sm text-[#ffffffb3] outline-none focus:border-[#ffffff33]"
                  aria-label="Filter by language"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#ffffff4d] mb-1 block">Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-[#07070b] border border-[#ffffff1a] rounded-lg px-3 py-2 text-sm text-[#ffffffb3] outline-none focus:border-[#ffffff33]"
                  aria-label="Filter by quality"
                >
                  {QUALITIES.map((q) => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Results grid ── */}
      <div className="px-6 lg:px-20">
        <h2 className="mb-4 text-[17px] font-bold text-white/90">
          {debounced.trim().length > 0
            ? `Results for "${debounced}"`
            : 'Trending in United States'}
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {isLoading &&
            Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-card" />
            ))}
          {!isLoading && results?.length === 0 && (
            <p className="col-span-full py-8 text-sm text-muted-foreground">
              No results found.
            </p>
          )}
          {Array.isArray(results) && results.map((title) => (
            <TitleCard key={`${title.mediaType}-${title.id as number}`} title={title as unknown as import('@workspace/api-client-react').Title} />
          ))}
        </div>
      </div>
    </div>
  );
}
