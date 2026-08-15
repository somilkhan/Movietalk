import { useEffect, useMemo, useState } from 'react';
import { useGetAnime } from '@workspace/api-client-react';
import { ContentTray } from '@/components/ContentTray';
import { HeroSection } from '@/components/HeroSection';
import { Seo } from '@/components/Seo';
import type { Title } from '@workspace/api-client-react';

type AnimeCatalog = {
  featured: Title[];
  trending: Title[];
  airing: Title[];
  upcoming: Title[];
  topRated: Title[];
  series: Title[];
  movies: Title[];
  latest: Title[];
};

const EMPTY_CATALOG: AnimeCatalog = {
  featured: [], trending: [], airing: [], upcoming: [], topRated: [], series: [], movies: [], latest: [],
};

async function fetchAniListCatalog(signal: AbortSignal): Promise<AnimeCatalog> {
  const response = await fetch('/api/catalog/anilist', { signal });
  if (!response.ok) throw new Error('AniList catalog unavailable');
  const data = await response.json();
  return {
    featured: Array.isArray(data.featured) ? data.featured : [],
    trending: Array.isArray(data.trending) ? data.trending : [],
    airing: Array.isArray(data.airing) ? data.airing : [],
    upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
    topRated: Array.isArray(data.topRated) ? data.topRated : [],
    series: Array.isArray(data.series) ? data.series : [],
    movies: Array.isArray(data.movies) ? data.movies : [],
    latest: Array.isArray(data.latest) ? data.latest : [],
  };
}

export default function Anime() {
  const fallbackAnime = useGetAnime();
  const fallbackTitles = fallbackAnime.data ?? [];
  const [catalog, setCatalog] = useState<AnimeCatalog>(EMPTY_CATALOG);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setUsingFallback(false);

    fetchAniListCatalog(controller.signal)
      .then((data) => {
        const hasContent = Object.values(data).some((section) => section.length > 0);
        if (hasContent) {
          setCatalog(data);
        } else {
          setUsingFallback(true);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setUsingFallback(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const sections = useMemo(() => {
    if (!usingFallback) return catalog;

    const movies = fallbackTitles.filter((t) => t.mediaType === 'movie');
    const series = fallbackTitles.filter((t) => t.mediaType === 'tv');
    const topRated = [...fallbackTitles].sort((a, b) => b.voteAverage - a.voteAverage);
    const latest = [...fallbackTitles].sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

    return {
      featured: topRated.slice(0, 8),
      trending: fallbackTitles.slice(0, 12),
      airing: series.slice(0, 12),
      upcoming: latest.slice(0, 12),
      topRated: topRated.slice(0, 12),
      series: series.slice(0, 12),
      movies: movies.slice(0, 12),
      latest: latest.slice(0, 12),
    };
  }, [catalog, fallbackTitles, usingFallback]);

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

        <ContentTray heading="Airing Anime" titles={sections.airing} loading={loading} size="md" />
        <ContentTray heading="Upcoming Anime" titles={sections.upcoming} loading={loading} size="md" />
        <ContentTray heading="Trending Anime" titles={sections.trending} loading={loading} size="md" />
        <ContentTray heading="Top Rated Anime" titles={sections.topRated} loading={loading} size="md" />
        <ContentTray heading="Anime Series" titles={sections.series} loading={loading} size="md" />
        <ContentTray heading="Anime Movies" titles={sections.movies} loading={loading} size="md" />
        <ContentTray heading="Latest Anime" titles={sections.latest} loading={loading} size="md" />
      </div>
    </div>
  );
}
