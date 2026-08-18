import { useEffect, useMemo } from 'react';
import { useGetTrending, useGetCatalogList, useGetAnime } from '@workspace/api-client-react';
import { useRegion } from '@/hooks/useRegion';
import { HeroSection } from '@/components/HeroSection';
import { ContentTray } from '@/components/ContentTray';
import { BingrHomeSections, PopularGenresSection, StudiosSection } from '@/components/BingrHomeSections';
import { PopularLanguagesTray } from '@/components/PopularLanguagesTray';
import { ContinueWatchingRow } from '@/components/ContinueWatchingRow';
import { Seo } from '@/components/Seo';

export default function Home() {
  const { region } = useRegion();
  const trending = useGetTrending({ mediaType: 'all', window: 'week', region });
  const trendingMovies = useGetTrending({ mediaType: 'movie', window: 'week', region });
  const nowPlayingMovies = useGetCatalogList({ mediaType: 'movie', category: 'now_playing', region });
  const popularMovies = useGetCatalogList({ mediaType: 'movie', category: 'popular', region });
  const topRatedMovies = useGetCatalogList({ mediaType: 'movie', category: 'top_rated', region });
  const popularTv = useGetCatalogList({ mediaType: 'tv', category: 'popular', region });
  const topRatedTv = useGetCatalogList({ mediaType: 'tv', category: 'top_rated', region });
  const anime = useGetAnime();

  useEffect(() => { void nowPlayingMovies.refetch(); void trending.refetch(); }, [region]);

  const heroTitles = useMemo(() => {
    const merged = [...(trending.data || []), ...(nowPlayingMovies.data || []), ...(trendingMovies.data || [])];
    const seen = new Set<string>();
    return merged.filter((title) => {
      const key = `${title.mediaType}-${title.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 10);
  }, [nowPlayingMovies.data, trending.data, trendingMovies.data]);

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden" data-testid="page-home">
      <Seo />
      <HeroSection titles={heroTitles} />
      <div className="relative z-10 -mt-4 pb-20">
        <ContinueWatchingRow />
        <BingrHomeSections />
        <ContentTray heading="New Movies" titles={nowPlayingMovies.data} loading={nowPlayingMovies.isLoading} viewAllHref="/catalog/movie/New%20Movies" />
        <ContentTray heading="Popular TV Shows" titles={popularTv.data} loading={popularTv.isLoading} viewAllHref="/catalog/tv/Popular%20TV%20Shows" />
        <StudiosSection />
        <ContentTray heading="Top Rated Movies" titles={topRatedMovies.data} loading={topRatedMovies.isLoading} viewAllHref="/catalog/movie/Top%20Rated%20Movies" />
        <PopularGenresSection />
        <ContentTray heading="Blockbuster Action" titles={trendingMovies.data} loading={trendingMovies.isLoading} viewAllHref="/genre/Action" />
        <ContentTray heading="Laugh Out Loud" titles={popularMovies.data?.slice().reverse()} loading={popularMovies.isLoading} viewAllHref="/genre/Comedy" />
        <ContentTray heading="Sci-Fi & Fantasy" titles={trending.data?.slice(4)} loading={trending.isLoading} viewAllHref="/genre/Sci-Fi" />
        <ContentTray heading="Anime Series" titles={anime.data} loading={anime.isLoading} viewAllHref="/anime" />
        <ContentTray heading="Spine-Chilling Horror" titles={trendingMovies.data?.slice(2)} loading={trendingMovies.isLoading} viewAllHref="/genre/Horror" />
        <ContentTray heading="Heartwarming Romance" titles={popularMovies.data?.slice(3)} loading={popularMovies.isLoading} viewAllHref="/genre/Romance" />
        <ContentTray heading="Top Rated TV" titles={topRatedTv.data} loading={topRatedTv.isLoading} viewAllHref="/catalog/tv/Top%20Rated%20TV%20Shows" />
        <ContentTray heading="Crime Thrillers" titles={trending.data?.slice(1)} loading={trending.isLoading} viewAllHref="/genre/Crime" />
        <PopularLanguagesTray />
        <div className="h-16" />
      </div>
    </div>
  );
}
