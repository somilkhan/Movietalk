import { useEffect, useMemo } from "react";
import { useGetTrending, useGetCatalogList, useGetAnime } from "@workspace/api-client-react";
import { useQueries } from "@tanstack/react-query";
import { HeroSection } from "@/components/HeroSection";
import { ContentTray } from "@/components/ContentTray";
import { PopularGenresSection, TrendingRow, StudiosRow } from "@/components/BingrHomeSections";
import { PopularLanguagesTray } from "@/components/PopularLanguagesTray";
import { Seo } from "@/components/Seo";
import { useRegion } from "@/hooks/useRegion";
import type { Title } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function GenreContentTray({ heading, genreIds, viewAllHref }: { heading: string; genreIds: number[]; viewAllHref: string }) {
  const queries = useQueries({ queries: genreIds.map((genreId) => ({
    queryKey: ["bingr-home-genre", genreId],
    queryFn: async () => {
      const response = await fetch(`${BASE}/api/catalog/genre?mediaType=movie&genreId=${genreId}&page=1`);
      if (!response.ok) throw new Error(`Failed to load genre ${genreId}`);
      return (await response.json()) as Title[];
    },
    staleTime: 5 * 60 * 1000,
  })) });
  const titles = useMemo(() => {
    const seen = new Set<string>();
    return queries.flatMap((q) => q.data ?? []).filter((title) => {
      const key = `${title.mediaType}-${title.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 20);
  }, [queries]);
  return <ContentTray heading={heading} titles={titles} loading={queries.some((q) => q.isLoading)} viewAllHref={viewAllHref} size="md" />;
}

export default function Home() {
  const { region } = useRegion();
  const trending = useGetTrending({ mediaType: "all", window: "week", region });
  const trendingMovies = useGetTrending({ mediaType: "movie", window: "week", region });
  const nowPlayingMovies = useGetCatalogList({ mediaType: "movie", category: "now_playing", region });
  const popularTv = useGetCatalogList({ mediaType: "tv", category: "popular" });
  const topRatedMovies = useGetCatalogList({ mediaType: "movie", category: "top_rated", region });
  const topRatedTv = useGetCatalogList({ mediaType: "tv", category: "top_rated" });
  const anime = useGetAnime();

  useEffect(() => {
    void nowPlayingMovies.refetch();
    void trending.refetch();
  }, [region]);

  const heroTitles = useMemo(() => {
    const merged = [...(nowPlayingMovies.data ?? []), ...(trending.data ?? []), ...(trendingMovies.data ?? [])];
    const seen = new Set<string>();
    return merged.filter((t) => {
      const key = `${t.mediaType}-${t.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 12);
  }, [nowPlayingMovies.data, trending.data, trendingMovies.data]);

  return (
    <div className="bg-black pb-28 md:pb-0" data-testid="page-home">
      <Seo />
      <HeroSection titles={heroTitles} />
      <div className="relative z-10 -mt-4 pl-0 md:pl-[80px] lg:pl-[100px] pb-20 md:pb-0">
        <TrendingRow />
        <ContentTray heading="New Movies" titles={nowPlayingMovies.data} loading={nowPlayingMovies.isLoading} viewAllHref="/catalog/movie/New%20Movies" size="md" />
        <ContentTray heading="Popular TV Shows" titles={popularTv.data} loading={popularTv.isLoading} viewAllHref="/catalog/tv/Popular%20TV%20Shows" size="md" />
        <StudiosRow />
        <ContentTray heading="Top Rated TV Shows" titles={topRatedTv.data} loading={topRatedTv.isLoading} viewAllHref="/catalog/tv/Top%20Rated%20TV%20Shows" size="md" />
        <PopularGenresSection />
        <ContentTray heading="Top Rated Movies" titles={topRatedMovies.data} loading={topRatedMovies.isLoading} viewAllHref="/catalog/movie/Top%20Rated%20Movies" size="md" />
        <ContentTray heading="Top Rated Anime" titles={anime.data} loading={anime.isLoading} viewAllHref="/anime" size="md" />
        <GenreContentTray heading="Romance Movies" genreIds={[10749]} viewAllHref="/catalog/movie/Romance%20Movies" />
        <GenreContentTray heading="Action Movies" genreIds={[28]} viewAllHref="/catalog/movie/Action%20Movies" />
        <GenreContentTray heading="Comedy Movies" genreIds={[35]} viewAllHref="/catalog/movie/Comedy%20Movies" />
        <GenreContentTray heading="Horror Movies" genreIds={[27]} viewAllHref="/catalog/movie/Horror%20Movies" />
        <GenreContentTray heading="Sci-Fi & Fantasy Movies" genreIds={[878, 14]} viewAllHref="/catalog/movie/Sci-Fi%20%26%20Fantasy%20Movies" />
        <GenreContentTray heading="Crime Thrillers" genreIds={[80, 53]} viewAllHref="/catalog/movie/Crime%20Movies" />
        <PopularLanguagesTray />
      </div>
    </div>
  );
}
