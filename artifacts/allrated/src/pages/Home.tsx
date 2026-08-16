import { useEffect, useMemo } from "react";
import { useGetTrending, useGetCatalogList, useGetAnime, useGetRegional, useGetByLanguage } from "@workspace/api-client-react";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { useRegion } from "@/hooks/useRegion";
import { HeroSection } from "@/components/HeroSection";
import { ContentTray } from "@/components/ContentTray";
import { BingrHomeSections, PopularGenresSection } from "@/components/BingrHomeSections";
import { PopularLanguagesTray } from "@/components/PopularLanguagesTray";
import { Seo } from "@/components/Seo";

export default function Home(){
  const {region}=useRegion();
  const trending=useGetTrending({mediaType:"all",window:"week",region});
  const trendingMovies=useGetTrending({mediaType:"movie",window:"week",region});
  const trendingTv=useGetTrending({mediaType:"tv",window:"week",region});
  const nowPlayingMovies=useGetCatalogList({mediaType:"movie",category:"now_playing",region});
  const popularMovies=useGetCatalogList({mediaType:"movie",category:"popular",region});
  const topRatedMovies=useGetCatalogList({mediaType:"movie",category:"top_rated",region});
  const popularTv=useGetCatalogList({mediaType:"tv",category:"popular",region});
  const topRatedTv=useGetCatalogList({mediaType:"tv",category:"top_rated",region});
  const anime=useGetAnime();
  const {items:continueTitles}=useContinueWatching();
  const regionalMovies=useGetRegional({mediaType:"movie",country:region});
  const regionalTv=useGetRegional({mediaType:"tv",country:region});
  const hindiMovies=useGetByLanguage({mediaType:"movie",language:"hi"});
  const tamilMovies=useGetByLanguage({mediaType:"movie",language:"ta"});
  const teluguMovies=useGetByLanguage({mediaType:"movie",language:"te"});

  useEffect(() => {
    void nowPlayingMovies.refetch();
    void trending.refetch();
  }, [region]);

  const heroTitles = useMemo(() => {
    const merged = [...(nowPlayingMovies.data || []), ...(trending.data || []), ...(trendingMovies.data || [])];
    const seen = new Set<string>();
    return merged.filter((title) => {
      const key = `${title.mediaType}-${title.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 12);
  }, [nowPlayingMovies.data, trending.data, trendingMovies.data]);

  return <div className="pb-28 md:pb-0" data-testid="page-home"><Seo/><HeroSection titles={heroTitles}/><div className="relative z-10 pt-6 md:pt-10 space-y-2"><BingrHomeSections/><ContentTray heading="New Movies" titles={nowPlayingMovies.data} loading={nowPlayingMovies.isLoading} viewAllHref="/catalog/movie/New%20Movies" size="md"/><ContentTray heading="Popular TV Shows" titles={popularTv.data} loading={popularTv.isLoading} viewAllHref="/catalog/tv/Popular%20TV%20Shows" size="md"/><ContentTray heading="Top Rated Movies" titles={topRatedMovies.data} loading={topRatedMovies.isLoading} viewAllHref="/catalog/movie/Top%20Rated%20Movies" size="md"/><ContentTray heading="Blockbuster Action" titles={trendingMovies.data} loading={trendingMovies.isLoading} viewAllHref="/catalog/movie/Action%20Movies" size="md"/><ContentTray heading="Laugh Out Loud" titles={popularMovies.data?.slice().reverse()} loading={popularMovies.isLoading} viewAllHref="/catalog/movie/Comedy%20Movies" size="md"/><PopularGenresSection/><ContentTray heading="Sci-Fi & Fantasy" titles={trending.data?.slice(4)} loading={trending.isLoading} viewAllHref="/catalog/movie/Sci-Fi%20Movies" size="md"/><ContentTray heading="Anime Series" titles={anime.data} loading={anime.isLoading} viewAllHref="/anime" size="md"/><ContentTray heading="Spine-Chilling Horror" titles={trendingMovies.data?.slice(2)} loading={trendingMovies.isLoading} viewAllHref="/catalog/movie/Horror%20Movies" size="md"/><ContentTray heading="Heartwarming Romance" titles={popularMovies.data?.slice(3)} loading={popularMovies.isLoading} viewAllHref="/catalog/movie/Romance%20Movies" size="md"/><ContentTray heading="Top Rated TV" titles={topRatedTv.data} loading={topRatedTv.isLoading} viewAllHref="/catalog/tv/Top%20Rated%20TV%20Shows" size="md"/><ContentTray heading="Trending TV" titles={trendingTv.data} loading={trendingTv.isLoading} viewAllHref="/catalog/tv/Trending%20TV%20Shows" size="md"/><ContentTray heading="Crime Thrillers" titles={trending.data?.slice(1)} loading={trending.isLoading} viewAllHref="/catalog/movie/Crime%20Movies" size="md"/><PopularLanguagesTray/></div></div>}
