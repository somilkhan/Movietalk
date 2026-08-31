import { useEffect, useMemo } from "react";
import { useGetCatalogList, useGetTrending } from "@workspace/api-client-react";
import { HeroSection } from "@/components/HeroSection";
import { BingrHomeSections } from "@/components/BingrHomeSections";
import { Seo } from "@/components/Seo";
import { useRegion } from "@/hooks/useRegion";

export default function Home() {
  const { region } = useRegion();
  const nowPlayingMovies = useGetCatalogList({ mediaType: "movie", category: "now_playing", region });
  const trending = useGetTrending({ mediaType: "all", window: "week", region });
  const trendingMovies = useGetTrending({ mediaType: "movie", window: "week", region });

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
    return merged.filter((title) => {
      const key = `${title.mediaType}-${title.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 12);
  }, [nowPlayingMovies.data, trending.data, trendingMovies.data]);

  const homeTitles = useMemo(() => {
    const seen = new Set<string>();
    return (trending.data ?? []).filter((title) => {
      const key = `${title.mediaType}-${title.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [trending.data]);

  return (
    <div className="min-h-screen bg-black pb-28 md:pb-0" data-testid="page-home">
      <Seo />
      <BingrHomeSections trending={homeTitles}>
        <HeroSection titles={heroTitles} />
      </BingrHomeSections>
    </div>
  );
}
