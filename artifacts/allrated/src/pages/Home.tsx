import { useMemo } from 'react';
import { useGetTrending, useGetCatalogList } from '@workspace/api-client-react';
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
  const nowPlayingMovies = useGetCatalogList({ mediaType: 'movie', category: 'now_playing', region });
  const popularMovies = useGetCatalogList({ mediaType: 'movie', category: 'popular', region });
  const topRatedMovies = useGetCatalogList({ mediaType: 'movie', category: 'top_rated', region });
  const popularTv = useGetCatalogList({ mediaType: 'tv', category: 'popular', region });
  const topRatedTv = useGetCatalogList({ mediaType: 'tv', category: 'top_rated', region });

  const heroTitles = useMemo(() => {
    const seen = new Set<string>();
    return (trending.data || []).filter((title) => {
      const key = `${title.mediaType}-${title.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);
  }, [trending.data]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-sans text-white" data-testid="page-home">
      <Seo />
      <HeroSection titles={heroTitles} />
      <main className="relative z-10 -mt-8 pb-16">
        <ContinueWatchingRow />
        <BingrHomeSections />
        <ContentTray heading="New Movies" titles={nowPlayingMovies.data} loading={nowPlayingMovies.isLoading} viewAllHref="/catalog/movie/New%20Movies" />
        <ContentTray heading="Popular TV Shows" titles={popularTv.data} loading={popularTv.isLoading} viewAllHref="/catalog/tv/Popular%20TV%20Shows" />
        <StudiosSection />
        <ContentTray heading="Top Rated Movies" titles={topRatedMovies.data} loading={topRatedMovies.isLoading} viewAllHref="/catalog/movie/Top%20Rated%20Movies" />
        <ContentTray heading="Top Rated TV Shows" titles={topRatedTv.data} loading={topRatedTv.isLoading} viewAllHref="/catalog/tv/Top%20Rated%20TV%20Shows" />
        <PopularGenresSection />
        <ContentTray heading="Popular Movies" titles={popularMovies.data} loading={popularMovies.isLoading} viewAllHref="/catalog/movie/Popular%20Movies" />
        <PopularLanguagesTray />
      </main>
    </div>
  );
}
