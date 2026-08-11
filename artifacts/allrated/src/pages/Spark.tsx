import { useGetTrending } from '@workspace/api-client-react';
import { ContentTray } from '@/components/ContentTray';
import { Seo } from '@/components/Seo';

export default function Spark() {
  const trending = useGetTrending({ mediaType: 'all', window: 'week' });

  return (
    <div className="pb-28 md:pb-0 pt-20 md:pt-24 px-6 md:px-12" data-testid="page-spark">
      <Seo title="Spark" />
      <div className="max-w-2xl mb-10">
        <h1
          className="text-white text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: "'Bebas Neue', 'Anton', Impact, system-ui, sans-serif" }}
        >
          Spark
        </h1>
        <p className="text-white/60 text-base md:text-lg">
          AI-powered recommendations and personalized picks just for you.
        </p>
      </div>
      <ContentTray
        heading="Recommended For You"
        titles={trending.data}
        loading={trending.isLoading}
      />
      <ContentTray
        heading="Because You Watched"
        titles={trending.data?.slice().reverse()}
        loading={trending.isLoading}
      />
    </div>
  );
}
