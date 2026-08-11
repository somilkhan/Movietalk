import { useGetTrending, useGetCatalogList, useGetAnime } from '@workspace/api-client-react';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { HeroSection } from '@/components/HeroSection';
import { ContentTray } from '@/components/ContentTray';
import { StudiosTray } from '@/components/StudiosTray';
import { PopularGenresTray } from '@/components/PopularGenresTray';
import { PopularLanguagesTray } from '@/components/PopularLanguagesTray';
import { Seo } from '@/components/Seo';

export default function Home() {
  const trending = useGetTrending({ mediaType: 'all', window: 'week' });
  const trendingMovies = useGetTrending({ mediaType: 'movie', window: 'week' });
  const trendingTv = useGetTrending({ mediaType: 'tv', window: 'week' });
  const popularMovies = useGetCatalogList({ mediaType: 'movie', category: 'popular' });
  const topRatedMovies = useGetCatalogList({ mediaType: 'movie', category: 'top_rated' });
  const popularTv = useGetCatalogList({ mediaType: 'tv', category: 'popular' });
  const topRatedTv = useGetCatalogList({ mediaType: 'tv', category: 'top_rated' });
  const anime = useGetAnime();
  const { titles: continueTitles } = useContinueWatching();

  return (
    <div className="pb-28 md:pb-0" data-testid="page-home">
      <Seo />
      <HeroSection titles={trending.data} />

      <div className="relative z-10 pt-6 md:pt-10 space-y-2">
        {continueTitles.length > 0 && (
          <ContentTray
            heading="Continue Watching"
            titles={continueTitles}
            viewAllHref="/continue-watching"
            size="md"
          />
        )}

        <ContentTray
          heading="Trending Right Now"
          titles={trending.data}
          loading={trending.isLoading}
          numbered
          viewAllHref="/category/Trending%20Now"
          size="md"
        />

        <ContentTray
          heading="New Movies"
          titles={popularMovies.data}
          loading={popularMovies.isLoading}
          viewAllHref="/category/Popular%20Movies"
          size="md"
        />

        <ContentTray
          heading="Popular TV Shows"
          titles={popularTv.data}
          loading={popularTv.isLoading}
          viewAllHref="/category/Popular%20TV%20Shows"
          size="md"
        />

        <StudiosTray />

        <ContentTray
          heading="Top Rated Movies"
          titles={topRatedMovies.data}
          loading={topRatedMovies.isLoading}
          viewAllHref="/category/Top%20Rated%20Movies"
          size="md"
        />

        <PopularGenresTray />

        <ContentTray
          heading="Blockbuster Action"
          titles={trendingMovies.data}
          loading={trendingMovies.isLoading}
          viewAllHref="/category/Action%20Movies"
          size="md"
        />

        <ContentTray
          heading="Laugh Out Loud"
          titles={popularMovies.data?.slice().reverse()}
          loading={popularMovies.isLoading}
          viewAllHref="/category/Comedy%20Movies"
          size="md"
        />

        <ContentTray
          heading="Sci-Fi & Fantasy"
          titles={trending.data?.slice(4)}
          loading={trending.isLoading}
          viewAllHref="/category/Sci-Fi%20Movies"
          size="md"
        />

        <ContentTray
          heading="Anime Series"
          titles={anime.data}
          loading={anime.isLoading}
          viewAllHref="/anime"
          size="md"
        />

        <ContentTray
          heading="Spine-Chilling Horror"
          titles={trendingMovies.data?.slice(2)}
          loading={trendingMovies.isLoading}
          viewAllHref="/category/Horror%20Movies"
          size="md"
        />

        <ContentTray
          heading="Heartwarming Romance"
          titles={popularMovies.data?.slice(3)}
          loading={popularMovies.isLoading}
          viewAllHref="/category/Romance%20Movies"
          size="md"
        />

        <ContentTray
          heading="Top Rated TV"
          titles={topRatedTv.data}
          loading={topRatedTv.isLoading}
          viewAllHref="/category/Top%20Rated%20TV%20Shows"
          size="md"
        />

        <ContentTray
          heading="Trending TV"
          titles={trendingTv.data}
          loading={trendingTv.isLoading}
          viewAllHref="/category/Trending%20TV%20Shows"
          size="md"
        />

        <ContentTray
          heading="Crime Thrillers"
          titles={trending.data?.slice(1)}
          loading={trending.isLoading}
          viewAllHref="/category/Crime%20Movies"
          size="md"
        />

        <PopularLanguagesTray />
      </div>
    </div>
  );
}
