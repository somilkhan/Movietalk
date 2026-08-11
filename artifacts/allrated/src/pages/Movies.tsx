import { useGetTrending, useGetCatalogList } from '@workspace/api-client-react';
import { HeroSection } from '@/components/HeroSection';
import { ContentTray } from '@/components/ContentTray';
import { Seo } from '@/components/Seo';

export default function Movies() {
  const trending = useGetTrending({ mediaType: 'movie', window: 'week' });
  const popular = useGetCatalogList({ mediaType: 'movie', category: 'popular' });
  const topRated = useGetCatalogList({ mediaType: 'movie', category: 'top_rated' });

  return (
    <div className="pb-28 md:pb-0" data-testid="page-movies">
      <Seo title="Movies" />
      <HeroSection titles={trending.data} />
      <div className="relative z-10 pt-6 md:pt-10 space-y-2">
        <ContentTray
          heading="Trending Movies"
          titles={trending.data}
          numbered
          loading={trending.isLoading}
          viewAllHref="/category/Trending%20Movies"
        />
        <ContentTray
          heading="Popular Movies"
          titles={popular.data}
          loading={popular.isLoading}
          viewAllHref="/category/Popular%20Movies"
        />
        <ContentTray
          heading="Top Rated Movies"
          titles={topRated.data}
          loading={topRated.isLoading}
          viewAllHref="/category/Top%20Rated%20Movies"
        />
      </div>
    </div>
  );
}
