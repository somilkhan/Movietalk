import { useGetTrending } from '@workspace/api-client-react';
import { HeroSection } from '@/components/HeroSection';
import { ContentTray } from '@/components/ContentTray';
import { Seo } from '@/components/Seo';

export default function Sports() {
  const trending = useGetTrending({ mediaType: 'tv', window: 'week' });

  return (
    <div className="pb-28 md:pb-0" data-testid="page-sports">
      <Seo title="Sports" />
      <HeroSection titles={trending.data} />
      <div className="relative z-10 pt-6 md:pt-10">
        <ContentTray
          heading="Live Sports"
          titles={trending.data}
          loading={trending.isLoading}
          viewAllHref="/category/Sports"
        />
        <ContentTray
          heading="Upcoming Events"
          titles={trending.data?.slice().reverse()}
          loading={trending.isLoading}
        />
      </div>
    </div>
  );
}
