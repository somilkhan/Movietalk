import { useGetTrending, useGetCatalogList, useGetAnime, useGetRegional, useGetByLanguage } from "@workspace/api-client-react";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { useRegion } from "@/hooks/useRegion";
import { HeroSection } from "@/components/HeroSection";
import { ContentTray } from "@/components/ContentTray";
import { BingrHomeSections, PopularGenresSection } from "@/components/BingrHomeSections";
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
        <BingrHomeSections />
        <ContentTray heading="New Movies" titles={popularMovies.data} loading={popularMovies.isLoading} viewAllHref="/catalog/movie/Action%20Movies" size="md" />
      </div>
    </div>
  );
}
