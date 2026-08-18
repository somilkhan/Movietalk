import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Seo } from "@/components/Seo";
import { useGetTrending, useSearchCatalog, getSearchCatalogQueryKey } from "@workspace/api-client-react";
import { TitleCard } from "@/components/TitleCard";
import { Clock, X, Search } from "lucide-react";

const PLACEHOLDERS = [
  "Movies, shows, anime and more...", "Search 'Inception'...", "Search 'Breaking Bad'...", "Search 'Attack on Titan'...",
  "Looking for a comedy?", "Find your next binge...", "Search for a favorite actor...", "What are we watching today?",
  "Search 'Oppenheimer'...", "In the mood for a thriller?", "Search 'Stranger Things'...", "Looking for something spooky?",
  "Search 'Interstellar'...", "Find the perfect rom-com...", "Search 'Naruto'...", "Discover hidden gems...",
  "Search 'The Office'...", "Need a good cry? Search drama...", "Search 'Spider-Man'...", "Explore documentaries...",
  "Search 'Jujutsu Kaisen'...",
];
const TYPES = ["all", "movie", "tv", "anime"] as const;
type Type = typeof TYPES[number];

export default function Explore() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<Type>("all");
  const [history, setHistory] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("rabbitrip_recent_searches") || "[]"); } catch { return []; } });
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const debounced = useDebounce(query, 450);
  const trending = useGetTrending({ mediaType: "all", window: "day" });
  const search = useSearchCatalog({ query: debounced }, { query: { enabled: debounced.trim().length > 0, queryKey: getSearchCatalogQueryKey({ query: debounced }) } });

  useEffect(() => {
    const timer = window.setInterval(() => setPlaceholderIndex((value) => (value + 1) % PLACEHOLDERS.length), 3500);
    return () => window.clearInterval(timer);
  }, []);

  const saveHistory = useCallback((value: string) => {
    const term = value.trim();
    if (!term) return;
    setHistory((current) => {
      const next = [term, ...current.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 8);
      localStorage.setItem("rabbitrip_recent_searches", JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => { if (debounced.trim() && search.data && !search.isLoading) saveHistory(debounced); }, [debounced, search.data, search.isLoading, saveHistory]);

  const raw = (debounced.trim() ? search.data : trending.data) || [];
  const results = raw.filter((item) => type === "all" || item.mediaType === type);
  const loading = debounced.trim() ? search.isLoading : trending.isLoading;
  const removeHistory = (term: string) => { const next = history.filter((item) => item !== term); setHistory(next); localStorage.setItem("rabbitrip_recent_searches", JSON.stringify(next)); };
  const clearHistory = () => { setHistory([]); localStorage.removeItem("rabbitrip_recent_searches"); };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden" data-testid="page-explore">
      <Seo title="Explore" />
      <main className="min-h-screen px-4 pb-24 pt-10 md:pl-[80px] md:pr-6 md:pb-16 lg:pl-[120px] lg:pr-16">
        <div className="relative mb-10 mt-4 max-w-3xl">
          <div className="flex items-center rounded-lg border border-white/5 bg-[#0f1014] px-4 py-2.5 shadow-lg transition-all focus-within:border-white/20 focus-within:bg-[#16181f] md:py-3">
            <Search className="mr-3 h-6 w-6 shrink-0 text-white/40" strokeWidth={1.8} />
            <div className="relative flex h-full min-w-0 flex-1 items-center overflow-hidden">
              <input type="text" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveHistory(query); }} className="relative z-10 w-full bg-transparent text-[16px] font-medium text-white outline-none placeholder:text-white/40" aria-label="Search movies and shows" role="searchbox" />
              {!query && <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[16px] font-medium text-white/40">{PLACEHOLDERS[placeholderIndex]}</span>}
            </div>
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="ml-2 shrink-0 rounded-full p-1 text-white/40 transition hover:text-white/80"><X className="h-5 w-5" /></button>}
            <div className="hidden h-6 w-px bg-white/10 pl-3 md:flex" />
            <div className="relative hidden md:block">
              <select value={type} onChange={(event) => setType(event.target.value as Type)} className="h-9 w-32 appearance-none bg-transparent px-3 text-[14px] font-medium text-white/70 outline-none transition hover:bg-white/5 hover:text-white">
                <option value="all">All Types</option><option value="movie">Movie</option><option value="tv">TV Show</option><option value="anime">Anime</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end md:hidden">
            <select value={type} onChange={(event) => setType(event.target.value as Type)} className="h-8 w-28 rounded-md border border-white/5 bg-[#0f1014] px-2.5 text-[12px] font-medium text-white/70 outline-none"><option value="all">All Types</option><option value="movie">Movie</option><option value="tv">TV Show</option><option value="anime">Anime</option></select>
          </div>
        </div>

        {!query.trim() && history.length > 0 && (
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-medium text-white/70">Recent Searches</h3><button type="button" onClick={clearHistory} className="text-xs text-white/30 transition hover:text-white/70">Clear all</button></div>
            <div className="flex flex-wrap gap-2">{history.map((term) => <div key={term} className="flex items-center gap-1.5 rounded-full bg-white/[.05] px-3 py-1.5 text-xs text-white/70"><button type="button" onClick={() => setQuery(term)} className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-white/30" />{term}</button><button type="button" aria-label={`Remove ${term}`} onClick={() => removeHistory(term)}><X className="h-3 w-3 text-white/30 hover:text-white" /></button></div>)}</div>
          </div>
        )}

        <div className="mb-4"><h2 className="text-[17px] font-bold text-white/90">{debounced.trim() ? `Results for "${debounced}"` : "Trending in United States"}</h2></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {loading && Array.from({ length: 14 }).map((_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-[#1a1c24]" />)}
          {!loading && results.length === 0 && <p className="col-span-full py-8 text-sm text-white/50">No results found.</p>}
          {!loading && results.map((title) => <TitleCard key={`${title.mediaType}-${title.id}`} title={title} />)}
        </div>
      </main>
    </div>
  );
}
