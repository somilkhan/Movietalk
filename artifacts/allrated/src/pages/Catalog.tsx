import { useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'wouter';
import { Seo } from '@/components/Seo';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { Title } from '@workspace/api-client-react';
import { useRegion } from '@/hooks/useRegion';

type CatalogPage = { titles: Title[]; nextPage: number | null };
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

function buildFetcher(name: string, routeMediaType: string, region: string): (page: number) => Promise<CatalogPage> {
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
    'Action Movies': 28,
    'Comedy Movies': 35,
    'Horror Movies': 27,
    'Romance Movies': 10749,
    'Sci-Fi Movies': 878,
    'Crime Movies': 80,
    'Drama Movies': 18,
    'Family Movies': 10751,
    'Reality Movies': 10764,
    'Thriller Movies': 53,
    'Mystery Movies': 9648,
    'Fantasy Movies': 14,
    'Adventure Movies': 12,
    'Animation Movies': 16,
    'Historical Movies': 36,
    'Documentary Movies': 99,
    'Musical Movies': 10402,
    'Mythology Movies': 14,
    'Superhero Movies': 28,
    'Anime Movies': 16,
    'Biopic Movies': 36,
    'Devotional Movies': 36,
    'Teen Movies': 18,
    'Lifestyle Movies': 99,
    'Travel Movies': 99,
    'Science and Technology Movies': 99,
  };
  const combinedGenreMap: Record<string, number[]> = { 'Sci-Fi & Fantasy Movies': [878, 14] };
  const languageMap: Record<string, string> = {
    English: 'en', Japanese: 'ja', Korean: 'ko', Hindi: 'hi', Spanish: 'es', French: 'fr', German: 'de', Chinese: 'zh', Portuguese: 'pt', Tamil: 'ta', Telugu: 'te', Kannada: 'kn', Malayalam: 'ml', Marathi: 'mr', Bengali: 'bn',
  };
  const studioCompanyIds: Record<string, number> = {
    'Disney+': 2, 'Disney Plus': 2, 'Disney Plus Studios': 2, 'HBO Max': 3268, 'HBO Max Studios': 3268, Peacock: 3353, 'Peacock Studios': 3353, 'Paramount+': 4, Paramount: 4, 'Paramount Studios': 4, 'Paramount+ Studios': 4, Netflix: 213, 'Netflix Studios': 213, Hulu: 453, 'Hulu Studios': 453, 'Prime Video': 1024, 'Prime Video Studios': 1024, 'Apple TV+': 350, 'Apple TV+ Studios': 350,
  };
  const studioCompanyNames: Record<string, string> = { 'Hotstar Specials': 'Hotstar Specials', 'Hotstar Specials Studios': 'Hotstar Specials' };
  const catalogParams = catalogMap[name];
  const trendingParams = trendingMap[name];
  const genreId = genreMap[name];
  const combinedGenreIds = combinedGenreMap[name];
  const language = languageMap[name];
  const studioCompanyId = studioCompanyIds[name];
  const studioCompanyName = studioCompanyNames[name];
  const mediaType = routeMediaType === 'tv' ? 'tv' : 'movie';
  const encodedRegion = encodeURIComponent(region || 'IN');

  return async (page: number): Promise<CatalogPage> => {
    if (combinedGenreIds) {
      const responses = await Promise.all(combinedGenreIds.map((id) => fetch(`${BASE}/api/catalog/genre?mediaType=${mediaType}&genreId=${id}&page=${page}&region=${encodedRegion}`)));
      if (responses.some((response) => !response.ok)) throw new Error(`Failed to fetch combined genre page ${page}`);
      const lists = await Promise.all(responses.map((response) => response.json() as Promise<Title[]>));
      const seen = new Set<string>();
      const titles = lists.flat().filter((title) => {
        const key = `${title.mediaType}-${title.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return { titles, nextPage: lists.some((list) => list.length >= 20) ? page + 1 : null };
    }

    let url: string;
    if (genreId) url = `${BASE}/api/catalog/genre?mediaType=${mediaType}&genreId=${genreId}&page=${page}&region=${encodedRegion}`;
    else if (language) url = `${BASE}/api/catalog/language?mediaType=${mediaType}&language=${language}&page=${page}&region=${encodedRegion}`;
    else if (studioCompanyId) url = `${BASE}/api/catalog/studio?mediaType=${mediaType}&companyId=${studioCompanyId}&page=${page}&region=${encodedRegion}`;
    else if (studioCompanyName) url = `${BASE}/api/catalog/studio?mediaType=${mediaType}&companyName=${encodeURIComponent(studioCompanyName)}&page=${page}&region=${encodedRegion}`;
    else if (trendingParams) url = `${BASE}/api/catalog/trending?mediaType=${trendingParams.mediaType}&window=${trendingParams.window}&page=${page}&region=${encodedRegion}`;
    else if (catalogParams) url = `${BASE}/api/catalog/list?mediaType=${catalogParams.mediaType}&category=${catalogParams.category}&page=${page}&region=${encodedRegion}`;
    else return { titles: [], nextPage: null };

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch page ${page}`);
    const titles: Title[] = await response.json();
    return { titles, nextPage: titles.length >= 20 ? page + 1 : null };
  };
}

function PosterCard({ title }: { title: Title }) {
  return (
    <Link href={`/title/${title.mediaType}/${title.id}`} className="group/card flex flex-col">
      <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-[#1a1c24] ring-1 ring-white/5 transition-all duration-300 group-hover/card:ring-white/20 group-hover/card:-translate-y-1">
        {title.posterPath ? <img src={title.posterPath} alt={title.title} loading="lazy" className="w-full h-full object-cover" /> : <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-white/40">{title.title}</div>}
      </div>
      <div className="mt-2 truncate text-[13px] font-semibold text-white/90 leading-tight">{title.title}</div>
      <div className="flex items-center flex-wrap mt-0.5 gap-x-1 text-[11px] text-white/40">
        {title.voteAverage > 0 && <><span className="text-white/60">★ {title.voteAverage.toFixed(1)}</span><span>·</span></>}
        {title.year && <><span>{title.year}</span><span>·</span></>}
        <span>{title.mediaType === 'movie' ? 'Movie' : title.mediaType === 'tv' ? 'Series' : 'Anime'}</span>
      </div>
    </Link>
  );
}

export default function Catalog() {
  const { mediaType: routeMediaTypeParam, category } = useParams<{ mediaType: string; category: string }>();
  const { region } = useRegion();
  const name = decodeURIComponent(category ?? '');
  const routeMediaType = decodeURIComponent(routeMediaTypeParam ?? 'movie');
  const fetcher = useCallback(buildFetcher(name, routeMediaType, region), [name, routeMediaType, region]);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['catalog-page', routeMediaType, name, region],
    queryFn: ({ pageParam }) => fetcher(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage ?? undefined,
  });
  const allTitles = data?.pages.flatMap((page) => page.titles) ?? [];
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) void fetchNextPage();
    }, { rootMargin: '400px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-12">
      <Seo title={name || 'Catalog'} />
      <div className="pt-10 pb-8 px-6 lg:px-20 flex items-center gap-4">
        <button onClick={() => history.back()} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition flex-shrink-0" aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6 6" /></svg>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">{name}</h1>
      </div>
      {isError && <div className="flex items-center justify-center py-20 text-white/40 text-sm">Failed to load. Try going back and trying again.</div>}
      <div className="px-6 lg:px-20">
        {isLoading && <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 gap-y-6">{Array.from({ length: 21 }).map((_, index) => <div key={index} className="animate-pulse rounded-lg bg-white/5 aspect-[2/3]" />)}</div>}
        {!isLoading && allTitles.length > 0 && <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 gap-y-6">
          {allTitles.map((title, index) => <PosterCard key={`${title.mediaType}-${title.id}-${index}`} title={title} />)}
          {isFetchingNextPage && Array.from({ length: 7 }).map((_, index) => <div key={`skel-${index}`} className="animate-pulse rounded-lg bg-white/5 aspect-[2/3]" />)}
        </div>}
        {!isLoading && allTitles.length === 0 && !isError && <div className="flex flex-col items-center justify-center py-32 text-white/30"><p className="text-lg font-medium">Nothing found</p></div>}
        <div ref={sentinelRef} className="h-1 w-full" />
        {!hasNextPage && allTitles.length > 0 && !isLoading && <p className="mt-8 pb-4 text-center text-sm text-white/20">You've seen everything in this category</p>}
      </div>
    </div>
  );
}
