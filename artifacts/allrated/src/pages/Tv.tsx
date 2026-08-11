import { useGetTrending, useGetCatalogList } from '@workspace/api-client-react';
import { HeroSection } from '@/components/HeroSection';
import { ContentTray } from '@/components/ContentTray';
import { Seo } from '@/components/Seo';

export default function Tv() {
  const trending = useGetTrending({ mediaType: 'tv', window: 'week' });
  const popular = useGetCatalogList({ mediaType: 'tv', category: 'popular' });
  const animation = useGetCatalogList({ mediaType: 'tv', category: 'animation' });
  const topRated = useGetCatalogList({ mediaType: 'tv', category: 'top_rated' });

  return (
    <div className="pb-28 md:pb-0" data-testid="page-tv">
      <Seo title="TV Shows" />
      <HeroSection titles={trending.data} />
      <div className="relative z-10 pt-6 md:pt-10 space-y-2">
        <ContentTray
          heading="Trending TV Shows"
          titles={trending.data}
          numbered
          loading={trending.isLoading}
          viewAllHref="/category/Trending%20TV%20Shows"
        />
        <ContentTray
          heading="Popular TV Shows"
          titles={popular.data}
          loading={popular.isLoading}
          viewAllHref="/category/Popular%20TV%20Shows"
        />
        <ContentTray
          heading="Animation TV Shows"
          titles={animation.data}
          loading={animation.isLoading}
          viewAllHref="/category/Animation%20TV%20Shows"
        />
        <ContentTray
          heading="Top Rated TV Shows"
          titles={topRated.data}
          loading={topRated.isLoading}
          viewAllHref="/category/Top%20Rated%20TV%20Shows"
        />
      </div>
    </div>
  );
}
