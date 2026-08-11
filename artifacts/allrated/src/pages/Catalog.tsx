import { useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'wouter';
import { Seo } from '@/components/Seo';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { Title } from '@workspace/api-client-react';

// ---------------------------------------------------------------------------
// Category name → raw API fetch
// ---------------------------------------------------------------------------

type CatalogPage = { titles: Title[]; nextPage: number | null };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Map the human-readable category name to an API fetcher that accepts page */
function buildFetcher(name: string): (page: number) => Promise<CatalogPage> {
  const catalogMap: Record<string, { mediaType: string; category: string }> = {
    'New Movies':           { mediaType: 'movie', category: 'now_playing' },
    'Popular Movies':       { mediaType: 'movie', category: 'popular' },
    'Top Rated Movies':     { mediaType: 'movie', category: 'top_rated' },
    'Popular TV Shows':     { mediaType: 'tv',    category: 'popular' },
    'Animation TV Shows':   { mediaType: 'tv',    category: 'animation' },
    'Top Rated TV Shows':   { mediaType: 'tv',    category: 'top_rated' },
  };

  const trendingMap: Record<string, { mediaType: string; window: string }> = {
    'Trending Right Now': { mediaType: 'all',   window: 'week' },
    'Trending Movies':    { mediaType: 'movie', window: 'week' },
    'Trending TV Shows':  { mediaType: 'tv',    window: 'week' },
  };

  const catalogParams = catalogMap[name];
  const trendingParams = trendingMap[name];

  return async (page: number): Promise<CatalogPage> => {
    let url: string;
    if (trendingParams) {
      url = `${BASE}/api/catalog/trending?mediaType=${trendingParams.mediaType}&window=${trendingParams.window}&page=${page}`;
    } else if (catalogParams) {
      url = `${BASE}/api/catalog/list?mediaType=${catalogParams.mediaType}&category=${catalogParams.category}&page=${page}`;
    } else {
      // Unknown category — return empty
      return { titles: [], nextPage: null };
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch page ${page}`);
    const titles: Title[] = await res.json();
    // TMDB returns 20 per page; if we got a full page there's likely more
    const nextPage = titles.length === 20 ? page + 1 : null;
    return { titles, nextPage };
  };
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

function PosterCard({ title }: { title: Title }) {
  return (
    <Link
      href={`/title/${title.mediaType}/${title.id}`}
      className="group/card flex flex-col"
    >
      <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-[#1a1c24] ring-1 ring-white/5 transition-all duration-300 group-hover/card:ring-white/20 group-hover/card:-translate-y-1">
        {title.posterPath ? (
          <img
            src={title.posterPath}
            alt={title.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-white/40">
            {title.title}
          </div>
        )}
      </div>
      <div className="mt-2 truncate text-[13px] font-semibold text-white/90 leading-tight">
        {title.title}
      </div>
      <div className="flex items-center flex-wrap mt-0.5 gap-x-1 text-[11px] text-white/40">
        {title.voteAverage > 0 && (
          <>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 shrink-0">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-white/60">{title.voteAverage.toFixed(1)}</span>
            <span>·</span>
          </>
        )}
        {title.year && <><span>{title.year}</span><span>·</span></>}
        <span>{title.mediaType === 'movie' ? 'Movie' : 'Series'}</span>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Catalog() {
  const params = useParams<{ name: string }>();
  const name = decodeURIComponent(params.name ?? '');

  const fetcher = useCallback(buildFetcher(name), [name]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['catalog-page', name],
    queryFn: ({ pageParam }) => fetcher(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  const allTitles = data?.pages.flatMap((p) => p.titles) ?? [];

  // Sentinel ref for IntersectionObserver — triggers next page load
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-12">
      <Seo title={name || "Catalog"} />
      {/* Header */}
      <div className="pt-10 pb-8 px-6 lg:px-20 flex items-center gap-4">
        <button
          onClick={() => history.back()}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition flex-shrink-0"
          aria-label="Back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">{name}</h1>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-center py-20 text-white/40 text-sm">
          Failed to load. Try going back and trying again.
        </div>
      )}

      {/* Grid */}
      <div className="px-6 lg:px-20">
        {/* Initial skeleton */}
        {isLoading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 gap-y-6">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-white/5 aspect-[2/3]" />
            ))}
          </div>
        )}

        {/* Titles */}
        {!isLoading && allTitles.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 gap-y-6">
            {allTitles.map((title, i) => (
              <PosterCard key={`${title.id}-${i}`} title={title} />
            ))}

            {/* Inline skeletons while loading next page */}
            {isFetchingNextPage &&
              Array.from({ length: 7 }).map((_, i) => (
                <div key={`skel-${i}`} className="animate-pulse rounded-lg bg-white/5 aspect-[2/3]" />
              ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && allTitles.length === 0 && !isError && (
          <div className="flex flex-col items-center justify-center py-32 text-white/30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-lg font-medium">Nothing found</p>
          </div>
        )}

        {/* IntersectionObserver sentinel */}
        <div ref={sentinelRef} className="h-1 w-full" />

        {/* End of results */}
        {!hasNextPage && allTitles.length > 0 && !isLoading && (
          <p className="mt-8 pb-4 text-center text-sm text-white/20">
            You've seen everything in this category
          </p>
        )}
      </div>
    </div>
  );
}
