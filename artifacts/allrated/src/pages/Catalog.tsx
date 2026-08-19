import { useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'wouter';
import { Seo } from '@/components/Seo';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { Title } from '@workspace/api-client-react';

type CatalogPage = { titles: Title[]; nextPage: number | null };
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

function buildFetcher(name: string): (page: number) => Promise<CatalogPage> {
  const catalogMap: Record<string, { mediaType: string; category: string }> = {
    'New Movies': { mediaType: 'movie', category: 'now_playing' },
    'Popular Movies': { mediaType: 'movie', category: 'popular' },
    'Top Rated Movies': { mediaType: 'movie', category: 'top_rated' },
    'Popular TV Shows': { mediaType: 'tv', category: 'popular' },
    'Animation TV Shows': { mediaType: 'tv', category: 'animation' },
    'Top Rated TV Shows': { mediaType: 'tv', category: 'top_rated' },
  };
  const trendingMap: Record<string, { mediaType: string; window: string }> = {
    'Trending Right Now': { mediaType: 'all', window: 'week' },
    'Trending Movies': { mediaType: 'movie', window: 'week' },
    'Trending TV Shows': { mediaType: 'tv', window: 'week' },
  };
  const genreMap: Record<string, number> = {
    'Action Movies': 28, 'Comedy Movies': 35, 'Horror Movies': 27, 'Romance Movies': 10749, 'Sci-Fi Movies': 878, 'Crime Movies': 80,
    'Drama Movies': 18, 'Family Movies': 10751, 'Reality Movies': 10764, 'Thriller Movies': 53, 'Mystery Movies': 9648,
    'Fantasy Movies': 14, 'Adventure Movies': 12, 'Animation Movies': 16, 'Historical Movies': 36, 'Documentary Movies': 99, 'Musical Movies': 10402,
  };
  const languageMap: Record<string, string> = {
    'English': 'en', 'Japanese': 'ja', 'Korean': 'ko', 'Hindi': 'hi', 'Spanish': 'es', 'French': 'fr', 'German': 'de', 'Chinese': 'zh',
  };
  const studioMap: Record<string, number> = {
    'Disney Plus Studios': 2, 'Disney+ Studios': 2,
    'HBO Max Studios': 3268, 'HBO Max': 3268,
    'Peacock Studios': 3353, 'Paramount Studios': 4, 'Paramount+ Studios': 4,
    'Netflix Studios': 213, 'Hulu Studios': 453, 'Prime Video Studios': 1024,
    'Apple TV+ Studios': 350,
  };

  const catalogParams = catalogMap[name];
  const trendingParams = trendingMap[name];
  const genreId = genreMap[name];
  const language = languageMap[name];
  const studioId = studioMap[name];

  return async (page: number): Promise<CatalogPage> => {
    let url: string;
    if (genreId) url = `${BASE}/api/catalog/genre?mediaType=movie&genreId=${genreId}&page=${page}`;
    else if (language) url = `${BASE}/api/catalog/language?mediaType=movie&language=${language}&page=${page}`;
    else if (studioId) url = `${BASE}/api/catalog/studio?mediaType=movie&companyId=${studioId}&page=${page}`;
    else if (trendingParams) url = `${BASE}/api/catalog/trending?mediaType=${trendingParams.mediaType}&window=${trendingParams.window}&page=${page}`;
    else if (catalogParams) url = `${BASE}/api/catalog/list?mediaType=${catalogParams.mediaType}&category=${catalogParams.category}&page=${page}`;
    else return { titles: [], nextPage: null };

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch page ${page}`);
    const titles: Title[] = await res.json();
    return { titles, nextPage: titles.length === 20 ? page + 1 : null };
  };
}

function PosterCard({ title }: { title: Title }) {
  return (
    <Link href={`/title/${title.mediaType}/${title.id}`} className="group/card min-w-0 flex flex-col">
      <div className="relative aspect-[2/3] overflow-hidden rounded-[7px] bg-[#14151b] ring-1 ring-white/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-[transform,box-shadow,ring-color] duration-300 group-hover/card:-translate-y-1 group-hover/card:ring-white/[0.18] group-hover/card:shadow-[0_14px_30px_rgba(0,0,0,0.38)]">
        {title.posterPath ? (
          <img src={title.posterPath} alt={title.title} loading="lazy" className="block h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.035]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-white/35">{title.title}</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-70" />
      </div>
      <div className="mt-2 truncate text-[12.5px] font-semibold leading-[1.25] text-white/90 sm:text-[13px]">{title.title}</div>
      <div className="mt-1 flex min-h-[14px] flex-wrap items-center gap-x-1 text-[10.5px] leading-none text-white/35 sm:text-[11px]">
        {title.voteAverage > 0 && <><span className="text-white/55">★ {title.voteAverage.toFixed(1)}</span><span>·</span></>}
        {title.year && <><span>{title.year}</span><span>·</span></>}
        <span>{title.mediaType === 'movie' ? 'Movie' : 'Series'}</span>
      </div>
    </Link>
  );
}

function CatalogSkeleton({ count = 21 }: { count?: number }) {
  return <div className="grid grid-cols-3 gap-x-2.5 gap-y-6 sm:grid-cols-4 sm:gap-x-3.5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">{Array.from({ length: count }).map((_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-[7px] bg-white/[0.055]" />)}</div>;
}

export default function Catalog() {
  const { mediaType, category } = useParams<{ mediaType: string; category: string }>();
  const name = decodeURIComponent(category ?? '');
  const routeMediaType = decodeURIComponent(mediaType ?? '');
  const fetcher = useCallback(buildFetcher(name), [name]);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({ queryKey: ['catalog-page', routeMediaType, name], queryFn: ({ pageParam }) => fetcher(pageParam as number), initialPageParam: 1, getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined });
  const allTitles = data?.pages.flatMap((p) => p.titles) ?? [];
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, { rootMargin: '500px 0px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-12">
      <Seo title={name || 'Catalog'} />
      <header className="mx-auto flex w-full max-w-[1920px] items-center gap-3 px-4 pb-7 pt-8 sm:px-6 sm:pt-10 lg:px-12 xl:px-16 2xl:px-20">
        <button onClick={() => history.back()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.055] text-white/55 ring-1 ring-white/[0.06] transition hover:bg-white/[0.09] hover:text-white" aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Browse</p>
          <h1 className="truncate text-[22px] font-bold tracking-[-0.02em] text-white sm:text-2xl md:text-[28px]">{name}</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
        {isError && <div className="flex items-center justify-center py-20 text-sm text-white/40">Failed to load. Try going back and trying again.</div>}
        {isLoading && <CatalogSkeleton />}
        {!isLoading && allTitles.length > 0 && (
          <div className="grid grid-cols-3 gap-x-2.5 gap-y-6 sm:grid-cols-4 sm:gap-x-3.5 md:grid-cols-5 md:gap-y-7 lg:grid-cols-6 lg:gap-x-4 xl:grid-cols-7 2xl:grid-cols-8">
            {allTitles.map((title, i) => <PosterCard key={`${title.id}-${i}`} title={title} />)}
            {isFetchingNextPage && <>{Array.from({ length: 8 }).map((_, i) => <div key={`skel-${i}`} className="aspect-[2/3] animate-pulse rounded-[7px] bg-white/[0.055]" />)}</>}
          </div>
        )}
        {!isLoading && allTitles.length === 0 && !isError && <div className="flex min-h-[45vh] flex-col items-center justify-center text-white/30"><p className="text-lg font-medium">Nothing found</p></div>}
        <div ref={sentinelRef} className="h-1 w-full" />
        {!hasNextPage && allTitles.length > 0 && !isLoading && <p className="pb-4 pt-10 text-center text-xs text-white/20">You've seen everything in this category</p>}
      </main>
    </div>
  );
}
