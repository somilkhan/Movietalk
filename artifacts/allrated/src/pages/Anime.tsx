import { useMemo } from 'react';
import { useGetAnime } from '@workspace/api-client-react';
import { ContentTray } from '@/components/ContentTray';
import { HeroSection } from '@/components/HeroSection';
import { Seo } from '@/components/Seo';
import type { Title } from '@workspace/api-client-react';

function byRating(a: Title, b: Title) {
  return b.voteAverage - a.voteAverage;
}

function byYearDesc(a: Title, b: Title) {
  return Number(b.year || 0) - Number(a.year || 0);
}

export default function Anime() {
  const anime = useGetAnime();
  const titles = anime.data ?? [];

  const sections = useMemo(() => {
    const movies = titles.filter((t) => t.mediaType === 'movie');
    const series = titles.filter((t) => t.mediaType === 'tv');
    const topRated = [...titles].sort(byRating);
    const latest = [...titles].sort(byYearDesc);

    return {
      featured: topRated.slice(0, 8),
      trending: titles.slice(0, 12),
      topRated: topRated.slice(0, 12),
      series: series.slice(0, 12),
      movies: movies.slice(0, 12),
      latest: latest.slice(0, 12),
    };
  }, [titles]);

  return (
    <div className="pb-28 md:pb-0" data-testid="page-anime">
      <Seo title="Anime" />

      <HeroSection titles={sections.featured} />

      <div className="relative z-10 pt-8 md:pt-10 space-y-2">
        <div className="px-6 lg:px-20 mb-2">
          <h1
            className="text-white text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "'Bebas Neue', 'Anton', Impact, system-ui, sans-serif" }}
          >
            Anime
          </h1>
        </div>

        <ContentTray
          heading="Trending Anime"
          titles={sections.trending}
          loading={anime.isLoading}
          size="md"
        />

        <ContentTray
          heading="Top Rated Anime"
          titles={sections.topRated}
          loading={anime.isLoading}
          size="md"
        />

        <ContentTray
          heading="Anime Series"
          titles={sections.series}
          loading={anime.isLoading}
          size="md"
        />

        <ContentTray
          heading="Anime Movies"
          titles={sections.movies}
          loading={anime.isLoading}
          size="md"
        />

        <ContentTray
          heading="Latest Anime"
          titles={sections.latest}
          loading={anime.isLoading}
          size="md"
        />
      </div>
    </div>
  );
}
