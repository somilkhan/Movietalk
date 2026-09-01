import { useMemo } from "react";
import { useGetAnime, useGetCatalogList, useGetTrending } from "@workspace/api-client-react";
import { BingrHero } from "@/components/BingrHero";
import { BingrHomeSections } from "@/components/BingrHomeSections";
import { Seo } from "@/components/Seo";
import { useRegion } from "@/hooks/useRegion";
import { useHomePersonalization } from "@/hooks/useHomePersonalization";
import type { Title } from "@workspace/api-client-react";
import { getGenreNames } from "@/lib/tmdbGenres";

const GENRES = ["Action", "Thriller", "Crime", "Horror", "Mystery", "Sci-Fi", "Fantasy", "Adventure", "Superhero"];

function uniqueTitles(items: Title[]): Title[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.mediaType}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function BingrHome() {
  const { region } = useRegion();
  const { continueWatching, continueTitles, recommendations } = useHomePersonalization();
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
  const topRatedAnime = useMemo(
    () => uniqueTitles([...(animeQuery.data ?? [])].sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 20)),
    [animeQuery.data],
  );

  const heroTitles = useMemo(
    () => uniqueTitles([
      ...(trendingQuery.data ?? []),
      ...(newMoviesQuery.data ?? []),
      ...(popularMoviesQuery.data ?? []),
      ...(popularTvQuery.data ?? []),
      ...(animeQuery.data ?? []),
    ]).slice(0, 10),
    [trendingQuery.data, newMoviesQuery.data, popularMoviesQuery.data, popularTvQuery.data, animeQuery.data],
  );

  const genreRows = useMemo(() => {
    const source = uniqueTitles([
      ...(trendingQuery.data ?? []),
      ...(newMoviesQuery.data ?? []),
      ...(popularMoviesQuery.data ?? []),
      ...(popularTvQuery.data ?? []),
    ]);
    return GENRES.map((title) => ({
      title,
      href: `/catalog/movie/${encodeURIComponent(`${title} Movies`)}`,
      items: source.filter((item) =>
        getGenreNames(item.genreIds ?? [], 8).some((name) => name.toLowerCase() === title.toLowerCase()),
      ).slice(0, 20),
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
        continueWatching={continueWatching}
        continueTitles={continueTitles}
        recommendations={recommendations}
      >
        <BingrHero titles={heroTitles} />
      </BingrHomeSections>
    </div>
  );
}
