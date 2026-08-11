import { useGetAnime } from '@workspace/api-client-react';
import { ContentTray } from '@/components/ContentTray';
import { Seo } from '@/components/Seo';

export default function Anime() {
  const anime = useGetAnime();

  return (
    <div className="pb-28 md:pb-0 pt-20 md:pt-24" data-testid="page-anime">
      <Seo title="Anime" />
      <div className="px-6 md:px-12 lg:px-16 mb-6">
        <h1
          className="text-white text-4xl md:text-5xl font-bold"
          style={{ fontFamily: "'Bebas Neue', 'Anton', Impact, system-ui, sans-serif" }}
        >
          Anime
        </h1>
      </div>
      <ContentTray
        heading="All Anime"
        titles={anime.data}
        loading={anime.isLoading}
        size="md"
      />
    </div>
  );
}
