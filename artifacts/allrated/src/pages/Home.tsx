import { useEffect, useMemo } from "react";
import { useGetTrending, useGetCatalogList, useGetAnime } from "@workspace/api-client-react";
import { useQueries } from "@tanstack/react-query";
import { useRegion } from "@/hooks/useRegion";
import { HeroSection } from "@/components/HeroSection";
import { ContentTray } from "@/components/ContentTray";
import { BingrHomeSections, PopularGenresSection } from "@/components/BingrHomeSections";
import { PopularLanguagesTray } from "@/components/PopularLanguagesTray";
import { ContinueWatchingRow } from "@/components/ContinueWatchingRow";
import { Seo } from "@/components/Seo";
import type { Title } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function GenreContentTray({ heading, genreIds, viewAllHref }: { heading: string; genreIds: number[]; viewAllHref: string }) {
  const queries = useQueries({ queries: genreIds.map((genreId) => ({
    queryKey: ["home-genre", genreId],
    queryFn: async () => {
      const response = await fetch(`${BASE}/api/catalog/genre?mediaType=movie&genreId=${genreId}&page=1`);
      if (!response.ok) throw new Error(`Failed to load genre ${genreId}`);
      return (await response.json()) as Title[];
    },
    staleTime: 5 * 60 * 1000,
  })) });
  const titles = useMemo(() => {
    const seen = new Set<string>();
    return queries.flatMap((query) => query.data ?? []).filter((title) => {
      const key = `${title.mediaType}-${title.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 20);
  }, [queries]);
  const loading = queries.some((query) => query.isLoading);
  return <ContentTray heading={heading} titles={titles} loading={loading} viewAllHref={viewAllHref} size="md" />;
}

export default function Home(){
  const {region}=useRegion();
  const trending=useGetTrending({mediaType:"all",window:"week",region});
  const trendingMovies=useGetTrending({mediaType:"movie",window:"week",region});
  const trendingTv=useGetTrending({mediaType:"tv",window:"week",region});
  const nowPlayingMovies=useGetCatalogList({mediaType:"movie",category:"now_playing",region});
  const popularMovies=useGetCatalogList({mediaType:"movie",category:"popular",region});
  const topRatedMovies=useGetCatalogList({mediaType:"movie",category:"top_rated",region});
  // Popular TV is a global TMDB popularity list; do not pass the user's region.
  const popularTv=useGetCatalogList({mediaType:"tv",category:"popular"});
  const topRatedTv=useGetCatalogList({mediaType:"tv",category:"top_rated"});
  const anime=useGetAnime();
  useEffect(()=>{void nowPlayingMovies.refetch();void trending.refetch()},[region]);
  const heroTitles=useMemo(()=>{const merged=[...(nowPlayingMovies.data||[]),...(trending.data||[]),...(trendingMovies.data||[])];const seen=new Set<string>();return merged.filter(t=>{const k=`${t.mediaType}-${t.id}`;if(seen.has(k))return false;seen.add(k);return true}).slice(0,12)},[nowPlayingMovies.data,trending.data,trendingMovies.data]);
  return <div className="pb-28 md:pb-0" data-testid="page-home"><Seo/><HeroSection titles={heroTitles}/><div className="relative z-10 pt-6 md:pt-10 space-y-2"><ContinueWatchingRow/><BingrHomeSections/><ContentTray heading="New Movies" titles={nowPlayingMovies.data} loading={nowPlayingMovies.isLoading} viewAllHref="/catalog/movie/New%20Movies" size="md"/><ContentTray heading="Popular TV Shows" titles={popularTv.data} loading={popularTv.isLoading} viewAllHref="/catalog/tv/Popular%20TV%20Shows" size="md"/><ContentTray heading="Top Rated Movies" titles={topRatedMovies.data} loading={topRatedMovies.isLoading} viewAllHref="/catalog/movie/Top%20Rated%20Movies" size="md"/><GenreContentTray heading="Blockbuster Action" genreIds={[28]} viewAllHref="/catalog/movie/Action%20Movies"/><GenreContentTray heading="Laugh Out Loud" genreIds={[35]} viewAllHref="/catalog/movie/Comedy%20Movies"/><PopularGenresSection/><GenreContentTray heading="Sci-Fi & Fantasy" genreIds={[878,14]} viewAllHref="/catalog/movie/Sci-Fi%20%26%20Fantasy%20Movies"/><ContentTray heading="Anime Series" titles={anime.data} loading={anime.isLoading} viewAllHref="/anime" size="md"/><GenreContentTray heading="Spine-Chilling Horror" genreIds={[27]} viewAllHref="/catalog/movie/Horror%20Movies"/><GenreContentTray heading="Heartwarming Romance" genreIds={[10749]} viewAllHref="/catalog/movie/Romance%20Movies"/><ContentTray heading="Top Rated TV" titles={topRatedTv.data} loading={topRatedTv.isLoading} viewAllHref="/catalog/tv/Top%20Rated%20TV%20Shows" size="md"/><ContentTray heading="Trending TV" titles={trendingTv.data} loading={trendingTv.isLoading} viewAllHref="/catalog/tv/Trending%20TV%20Shows" size="md"/><GenreContentTray heading="Crime Thrillers" genreIds={[80]} viewAllHref="/catalog/movie/Crime%20Movies"/><PopularLanguagesTray/></div></div>;
}