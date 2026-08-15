import { useGetTrending, useGetCatalogList, useGetAnime, useGetRegional, useGetByLanguage } from "@workspace/api-client-react";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { useRegion } from "@/hooks/useRegion";
import { HeroSection } from "@/components/HeroSection";
import { ContentTray } from "@/components/ContentTray";
import { BingrHomeSections } from "@/components/BingrHomeSections";
import { PopularLanguagesTray } from "@/components/PopularLanguagesTray";
import { Seo } from "@/components/Seo";

export default function Home() {
  const { region } = useRegion();
  const trending = useGetTrending({ mediaType: "all", window: "week", region });
  const trendingMovies = useGetTrending({ mediaType: "movie", window: "week", region });
  const trendingTv = useGetTrending({ mediaType: "tv", window: "week", region });
  const popularMovies = useGetCatalogList({ mediaType: "movie", category: "popular", region });
  const topRatedMovies = useGetCatalogList({ mediaType: "movie", category: "top_rated", region });
  const popularTv = useGetCatalogList({ mediaType: "tv", category: "popular", region });
  const topRatedTv = useGetCatalogList({ mediaType: "tv", category: "top_rated", region });
  const anime = useGetAnime();
  const { items: continueTitles } = useContinueWatching();

  const regionalMovies = useGetRegional({ mediaType: "movie", country: region });
  const regionalTv = useGetRegional({ mediaType: "tv", country: region });
  const hindiMovies = useGetByLanguage({ mediaType: "movie", language: "hi" });
  const tamilMovies = useGetByLanguage({ mediaType: "movie", language: "ta" });
  const teluguMovies = useGetByLanguage({ mediaType: "movie", language: "te" });

  const isIndia = region === "IN";

  return (
    <div className="pb-28 md:pb-0" data-testid="page-home">
      <Seo />
      <HeroSection titles={trending.data} />

      <div className="relative z-10 pt-6 md:pt-10 space-y-2">
        {continueTitles.length > 0 && (
          <ContentTray heading="Continue Watching" titles={continueTitles} viewAllHref="/continue-watching" size="md" />
        )}

        {isIndia && regionalMovies.data && regionalMovies.data.length > 0 && (
          <ContentTray heading="Indian Movies" titles={regionalMovies.data} loading={regionalMovies.isLoading} viewAllHref="/catalog/regional?mediaType=movie&country=IN" size="md" />
        )}
        {isIndia && regionalTv.data && regionalTv.data.length > 0 && (
          <ContentTray heading="Indian TV Shows" titles={regionalTv.data} loading={regionalTv.isLoading} viewAllHref="/catalog/regional?mediaType=tv&country=IN" size="md" />
        )}
        {isIndia && hindiMovies.data && hindiMovies.data.length > 0 && (
          <ContentTray heading="Hindi Movies" titles={hindiMovies.data} loading={hindiMovies.isLoading} viewAllHref="/catalog/language?mediaType=movie&language=hi" size="md" />
        )}
        {isIndia && tamilMovies.data && tamilMovies.data.length > 0 && (
          <ContentTray heading="Tamil Movies" titles={tamilMovies.data} loading={tamilMovies.isLoading} viewAllHref="/catalog/language?mediaType=movie&language=ta" size="md" />
        )}
        {isIndia && teluguMovies.data && teluguMovies.data.length > 0 && (
          <ContentTray heading="Telugu Movies" titles={teluguMovies.data} loading={teluguMovies.isLoading} viewAllHref="/catalog/language?mediaType=movie&language=te" size="md" />
        )}

        <BingrHomeSections />

        <ContentTray heading="New Movies" titles={popularMovies.data} loading={popularMovies.isLoading} viewAllHref="/category/Popular%20Movies" size="md" />
        <ContentTray heading="Popular TV Shows" titles={popularTv.data} loading={popularTv.isLoading} viewAllHref="/category/Popular%20TV%20Shows" size="md" />
        <ContentTray heading="Top Rated Movies" titles={topRatedMovies.data} loading={topRatedMovies.isLoading} viewAllHref="/category/Top%20Rated%20Movies" size="md" />
        <ContentTray heading="Blockbuster Action" titles={trendingMovies.data} loading={trendingMovies.isLoading} viewAllHref="/category/Action%20Movies" size="md" />
        <ContentTray heading="Laugh Out Loud" titles={popularMovies.data?.slice().reverse()} loading={popularMovies.isLoading} viewAllHref="/category/Comedy%20Movies" size="md" />
        <ContentTray heading="Sci-Fi & Fantasy" titles={trending.data?.slice(4)} loading={trending.isLoading} viewAllHref="/category/Sci-Fi%20Movies" size="md" />
        <ContentTray heading="Anime Series" titles={anime.data} loading={anime.isLoading} viewAllHref="/anime" size="md" />
        <ContentTray heading="Spine-Chilling Horror" titles={trendingMovies.data?.slice(2)} loading={trendingMovies.isLoading} viewAllHref="/category/Horror%20Movies" size="md" />
        <ContentTray heading="Heartwarming Romance" titles={popularMovies.data?.slice(3)} loading={popularMovies.isLoading} viewAllHref="/category/Romance%20Movies" size="md" />
        <ContentTray heading="Top Rated TV" titles={topRatedTv.data} loading={topRatedTv.isLoading} viewAllHref="/category/Top%20Rated%20TV%20Shows" size="md" />
        <ContentTray heading="Trending TV" titles={trendingTv.data} loading={trendingTv.isLoading} viewAllHref="/category/Trending%20TV%20Shows" size="md" />
        <ContentTray heading="Crime Thrillers" titles={trending.data?.slice(1)} loading={trending.isLoading} viewAllHref="/category/Crime%20Movies" size="md" />

        <PopularLanguagesTray />
      </div>
    </div>
  );
}
