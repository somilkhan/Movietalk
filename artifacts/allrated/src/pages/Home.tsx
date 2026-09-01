import { useMemo } from "react";
import { useGetAnime, useGetCatalogList, useGetTrending } from "@workspace/api-client-react";
import { HeroSection } from "@/components/HeroSection";
import { BingrHomeSections } from "@/components/BingrHomeSections";
import { Seo } from "@/components/Seo";
import { useRegion } from "@/hooks/useRegion";
import type { Title } from "@workspace/api-client-react";
import { getGenreNames } from "@/lib/tmdbGenres";

const GENRE_ROWS = [
  { title: "Action", slug: "action" },
  { title: "Thriller", slug: "thriller" },
  { title: "Crime", slug: "crime" },
  { title: "Horror", slug: "horror" },
  { title: "Mystery", slug: "mystery" },
  { title: "Sci-Fi", slug: "sci-fi" },
  { title: "Fantasy", slug: "fantasy" },
  { title: "Adventure", slug: "adventure" },
  { title: "Superhero", slug: "superhero" },
];

function uniqueTitles(items: Title[]): Title[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.mediaType}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function genreMatches(item: Title, genre: string): boolean {
  return getGenreNames(item.genreIds ?? [], 8).some((name) => name.toLowerCase() === genre.toLowerCase());
}

export default function Home() {
  const { region } = useRegion();
  const trendingQuery = useGetTrending({ mediaType: "all", window: "week", region });
  const newMoviesQuery = useGetCatalogList({ mediaType: "movie", category: "now_playing", region });
  const popularMoviesQuery = useGetCatalogList({ mediaType: "movie", category: "popular", region });
  const popularTvQuery = useGetCatalogList({ mediaType: "tv", category: "popular", region });
  const topRatedMoviesQuery = useGetCatalogList({ mediaType: "movie", category: "top_rated", region });
  const topRatedTvQuery = useGetCatalogList({ mediaType: "tv", category: "top_rated", region });
  const animeQuery = useGetAnime();

  const trending = useMemo(() => uniqueTitles(trendingQuery.data ?? []), [trendingQuery.data]);
  const newMovies = useMemo(() => uniqueTitles(newMoviesQuery.data ?? []), [newMoviesQuery.data]);
  const popularMovies = useMemo(() => uniqueTitles(popularMoviesQuery.data ?? []), [popularMoviesQuery.data]);
  const popularTv = useMemo(() => uniqueTitles(popularTvQuery.data ?? []), [popularTvQuery.data]);
  const topRatedMovies = useMemo(() => uniqueTitles(topRatedMoviesQuery.data ?? []), [topRatedMoviesQuery.data]);
  const topRatedTv = useMemo(() => uniqueTitles(topRatedTvQuery.data ?? []), [topRatedTvQuery.data]);
  const topRatedAnime = useMemo(() => {
    const anime = animeQuery.data ?? [];
    return uniqueTitles([...anime].sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 20));
  }, [animeQuery.data]);

  const heroTitles = useMemo(() => {
    return uniqueTitles([
      ...(trendingQuery.data ?? []),
      ...(newMoviesQuery.data ?? []),
      ...(popularMoviesQuery.data ?? []),
      ...(popularTvQuery.data ?? []),
      ...(animeQuery.data ?? []),
    ]).slice(0, 10);
  }, [trendingQuery.data, newMoviesQuery.data, popularMoviesQuery.data, popularTvQuery.data, animeQuery.data]);

  const genreRows = useMemo(() => {
    const source = uniqueTitles([
      ...(trendingQuery.data ?? []),
      ...(newMoviesQuery.data ?? []),
      ...(popularMoviesQuery.data ?? []),
      ...(popularTvQuery.data ?? []),
    ]);
    return GENRE_ROWS.map((row) => ({
      title: row.title,
      href: `/category/${encodeURIComponent(row.title)}`,
      items: source.filter((item) => genreMatches(item, row.title)).slice(0, 20),
    })).filter((row) => row.items.length > 0);
  }, [trendingQuery.data, newMoviesQuery.data, popularMoviesQuery.data, popularTvQuery.data]);

  return (
    <div className="min-h-screen bg-black pb-28 md:pb-0" data-testid="page-home">
      <Seo />
      <BingrHomeSections
        trending={trending}
        newMovies={newMovies}
        popularMovies={popularMovies}
        popularTv={popularTv}
        topRatedMovies={topRatedMovies}
        topRatedTv={topRatedTv}
        topRatedAnime={topRatedAnime}
        genreRows={genreRows}
      >
        <HeroSection titles={heroTitles} />
      </BingrHomeSections>
    </div>
  );
}
