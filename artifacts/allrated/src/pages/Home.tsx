import { useEffect, useMemo } from "react";
import { useGetTrending, useGetCatalogList, useGetAnime } from "@workspace/api-client-react";
import { useQueries } from "@tanstack/react-query";
import { HeroSection } from "@/components/HeroSection";
import { ContentTray } from "@/components/ContentTray";
import { PopularGenresSection, TrendingRow, StudiosRow } from "@/components/BingrHomeSections";
import { PopularLanguagesTray } from "@/components/PopularLanguagesTray";
import { Seo } from "@/components/Seo";
import { useRegion } from "@/hooks/useRegion";
import type { Title } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type MediaType = "movie" | "tv";

interface GenreContentTrayProps {
  heading: string;
  mediaType: MediaType;
  genreIds: number[];
  viewAllHref: string;
}

function GenreContentTray({ heading, mediaType, genreIds, viewAllHref }: GenreContentTrayProps) {
  const queries = useQueries({
    queries: genreIds.map((genreId) => ({
      queryKey: ["bingr-home-genre", mediaType, genreId],
      queryFn: async (): Promise<Title[]> => {
        const params = new URLSearchParams({ mediaType, genreId: String(genreId), page: "1" });
        const response = await fetch(`${BASE}/api/catalog/genre?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to load ${mediaType} genre ${genreId}`);
        }
        const data: unknown = await response.json();
        return Array.isArray(data) ? (data as Title[]) : [];
      },
      staleTime: 5 * 60 * 1000,
    })),
  });

  const titles = useMemo(() => {
    const seen = new Set<string>();
    return queries
      .flatMap((query) => query.data ?? [])
      .filter((title) => {
        const key = `${title.mediaType}-${title.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 20);
  }, [queries]);

  return (
    <ContentTray
      heading={heading}
      titles={titles}
      loading={queries.some((query) => query.isLoading)}
      viewAllHref={viewAllHref}
      size="md"
      className="!mb-0"
    />
  );
}

const ACTION_ANIME_NAMES = new Set([
  "Attack on Titan",
  "Demon Slayer: Kimetsu no Yaiba",
  "JUJUTSU KAISEN",
  "My Hero Academia",
  "Hunter x Hunter (2011)",
  "One-Punch Man",
  "ONE PIECE",
  "Tokyo Ghoul",
]);

export default function Home() {
  const { region } = useRegion();
  const trending = useGetTrending({ mediaType: "all", window: "week", region });
  const trendingMovies = useGetTrending({ mediaType: "movie", window: "week", region });
  const nowPlayingMovies = useGetCatalogList({ mediaType: "movie", category: "now_playing", region });
  const popularTv = useGetCatalogList({ mediaType: "tv", category: "popular" });
  const topRatedMovies = useGetCatalogList({ mediaType: "movie", category: "top_rated", region });
  const topRatedTv = useGetCatalogList({ mediaType: "tv", category: "top_rated" });
  const anime = useGetAnime();

  useEffect(() => {
    void nowPlayingMovies.refetch();
    void trending.refetch();
  }, [region]);

  const heroTitles = useMemo(() => {
    const merged = [
      ...(nowPlayingMovies.data ?? []),
      ...(trending.data ?? []),
      ...(trendingMovies.data ?? []),
    ];
    const seen = new Set<string>();
    return merged
      .filter((title) => {
        const key = `${title.mediaType}-${title.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);
  }, [nowPlayingMovies.data, trending.data, trendingMovies.data]);

  const actionAnime = useMemo(() => {
    const titles = anime.data ?? [];
    const filtered = titles.filter((title) => ACTION_ANIME_NAMES.has(title.title));
    return filtered.length >= 5 ? filtered.slice(0, 20) : titles.slice(0, 20);
  }, [anime.data]);

  return (
    <div className="bg-black pb-28 md:pb-0" data-testid="page-home">
      <Seo />
      <HeroSection titles={heroTitles} />

      <div className="relative z-10 -mt-4 pl-0 md:pl-[80px] lg:pl-[100px] pb-20 md:pb-0">
        <TrendingRow />

        <ContentTray
          heading="New Movies"
          titles={nowPlayingMovies.data}
          loading={nowPlayingMovies.isLoading}
          viewAllHref="/catalog/movie/New%20Movies"
          size="md"
          className="!mb-0"
        />

        <ContentTray
          heading="Popular TV Shows"
          titles={popularTv.data}
          loading={popularTv.isLoading}
          viewAllHref="/catalog/tv/Popular%20TV%20Shows"
          size="md"
          className="!mb-0"
        />

        <StudiosRow />

        <GenreContentTray
          heading="Blockbuster Action Movies"
          mediaType="movie"
          genreIds={[28]}
          viewAllHref="/catalog/movie/Action%20Movies"
        />

        <PopularGenresSection />

        <ContentTray
          heading="Top Rated TV Shows"
          titles={topRatedTv.data}
          loading={topRatedTv.isLoading}
          viewAllHref="/catalog/tv/Top%20Rated%20TV%20Shows"
          size="md"
          className="!mb-0"
        />

        <ContentTray
          heading="Top Rated Movies"
          titles={topRatedMovies.data}
          loading={topRatedMovies.isLoading}
          viewAllHref="/catalog/movie/Top%20Rated%20Movies"
          size="md"
          className="!mb-0"
        />

        <ContentTray
          heading="Top Rated Anime"
          titles={anime.data}
          loading={anime.isLoading}
          viewAllHref="/anime"
          size="md"
          className="!mb-0"
        />

        <GenreContentTray
          heading="Spine-Chilling Horror"
          mediaType="movie"
          genreIds={[27]}
          viewAllHref="/catalog/movie/Horror%20Movies"
        />

        <GenreContentTray
          heading="Crime & Thriller Series"
          mediaType="tv"
          genreIds={[80]}
          viewAllHref="/catalog/tv/Crime%20%26%20Thriller%20Series"
        />

        <GenreContentTray
          heading="Sci-Fi & Fantasy Movies"
          mediaType="movie"
          genreIds={[878, 14]}
          viewAllHref="/catalog/movie/Sci-Fi%20%26%20Fantasy%20Movies"
        />

        <ContentTray
          heading="Action Anime"
          titles={actionAnime}
          loading={anime.isLoading}
          viewAllHref="/anime"
          size="md"
          className="!mb-0"
        />

        <GenreContentTray
          heading="Heartwarming Romance"
          mediaType="movie"
          genreIds={[10749]}
          viewAllHref="/catalog/movie/Romance%20Movies"
        />

        <GenreContentTray
          heading="Binge-Worthy Comedy Series"
          mediaType="tv"
          genreIds={[35]}
          viewAllHref="/catalog/tv/Comedy%20Series"
        />

        <PopularLanguagesTray />
      </div>
    </div>
  );
}
