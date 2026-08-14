import { useRef } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { useGetTrending, useGetCatalogList } from "@workspace/api-client-react";
import { useRegion } from "@/hooks/useRegion";
import { HeroSection } from "@/components/HeroSection";
import { Seo } from "@/components/Seo";

// ── Static category data matching Bingr ────────────────────────────────────

const BROWSE_CATEGORIES = [
  { name: "Sports", image: "https://api.bingr.one/static/categories/Sports.webp", href: "/sports" },
  { name: "Sparks", image: "https://api.bingr.one/static/categories/Sparks.webp", href: "/spark" },
  { name: "Anime", image: "https://api.bingr.one/static/categories/anime.webp", href: "/anime" },
  { name: "TV", image: "https://api.bingr.one/static/categories/TV.webp", href: "/tv" },
  { name: "Movies", image: "https://api.bingr.one/static/categories/Movie.webp", href: "/movies" },
  { name: "News", image: "https://api.bingr.one/static/categories/News.webp", href: "/categories" },
];

const STUDIOS = [
  { name: "Specials", image: "https://api.bingr.one/static/categories/1739441155598-a.webp", href: "/categories" },
  { name: "Disney Plus", image: "https://api.bingr.one/static/categories/1747996723703-a.webp", href: "/categories" },
  { name: "HBO Max", image: "https://api.bingr.one/static/categories/1775539725531-a.webp", href: "/categories" },
  { name: "Peacock", image: "https://api.bingr.one/static/categories/1739359307816-a.webp", href: "/categories" },
  { name: "Paramount", image: "https://api.bingr.one/static/categories/1739358280583-a.webp", href: "/categories" },
  { name: "Netflix", image: "https://api.bingr.one/static/netflix.webp", href: "/categories" },
  { name: "Hulu", image: "https://api.bingr.one/static/hulu.webp", href: "/categories" },
  { name: "Prime Video", image: "https://api.bingr.one/static/prime-video.webp", href: "/categories" },
  { name: "Apple TV+", image: "https://api.bingr.one/static/apple-tv.webp", href: "/categories" },
];

const LANGUAGES = [
  { name: "English", image: "https://api.bingr.one/static/categories/1526660-a-afdd1ecfd8ae.webp", code: "en" },
  { name: "Japanese", image: "https://api.bingr.one/static/categories/1750233039896-a.webp", code: "ja" },
  { name: "Korean", image: "https://api.bingr.one/static/categories/1526670-a-ec8fb58a5fb8.webp", code: "ko" },
  { name: "Hindi", image: "https://api.bingr.one/static/categories/1526661-a-00b818b5bc0e.webp", code: "hi" },
  { name: "Portuguese", image: "https://api.bingr.one/static/portuguese.webp", code: "pt" },
  { name: "Spanish", image: "https://api.bingr.one/static/spanish.webp", code: "es" },
  { name: "Tamil", image: "https://api.bingr.one/static/categories/1526682-a-fd4e220ba563.webp", code: "ta" },
  { name: "Telugu", image: "https://api.bingr.one/static/categories/1526685-a-5f5995a53f61.webp", code: "te" },
  { name: "Kannada", image: "https://api.bingr.one/static/categories/1781241136059-a.webp", code: "kn" },
  { name: "Malayalam", image: "https://api.bingr.one/static/categories/1526672-a-eafe6913c6c8.webp", code: "ml" },
  { name: "Marathi", image: "https://api.bingr.one/static/categories/1526674-a-fdd5233a7699.webp", code: "mr" },
  { name: "Bengali", image: "https://api.bingr.one/static/categories/1526659-a-7271cf19114e.webp", code: "bn" },
];

const SPORTS = [
  { name: "Cricket", image: "https://api.bingr.one/static/categories/cricket.webp" },
  { name: "Football", image: "https://api.bingr.one/static/categories/football.webp" },
  { name: "Hockey", image: "https://api.bingr.one/static/categories/hockey.webp" },
  { name: "Formula 1", image: "https://api.bingr.one/static/categories/f1.webp" },
  { name: "Tennis", image: "https://api.bingr.one/static/categories/tennis.webp" },
  { name: "WWE", image: "https://api.bingr.one/static/categories/wwe.webp" },
  { name: "Kabaddi", image: "https://api.bingr.one/static/categories/kabaddi.webp" },
  { name: "Basketball", image: "https://api.bingr.one/static/categories/basketball.webp" },
];

// ── Reusable Category Row ──────────────────────────────────────────────────

interface CategoryItem {
  name: string;
  image: string;
  href?: string;
  code?: string;
}

function CategoryRow({ title, items, viewAllHref }: { title: string; items: CategoryItem[]; viewAllHref?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full relative px-4 md:px-0 mb-10">
      <div className="flex items-center justify-between mb-4 pr-4 md:pr-0">
        <h2 className="text-[18px] md:text-[20px] font-semibold text-white/90">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref}>
            <button className="flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors group/btn">
              View All
              <ChevronRight className="w-4 h-4 ml-0.5 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
            </button>
          </Link>
        )}
      </div>
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x"
        >
          {items.map((item) => (
            <div key={item.name} className="snap-start">
              <Link href={item.href || `/catalog/language?language=${item.code}`}>
                <div
                  className="flex-none cursor-pointer group/cat relative rounded-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:z-10 bg-[#16181f]
                  w-[160px] md:w-[220px] lg:w-[280px] aspect-[16/9]"
                >
                  <img
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/cat:scale-105"
                    loading="lazy"
                    src={item.image}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/cat:bg-white/5 transition-colors duration-300" />
                </div>
              </Link>
            </div>
          ))}
        </div>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-0 bottom-0 z-30 w-12 md:w-16 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Content Tray for TMDB data ─────────────────────────────────────────────

function ContentRow({ title, query }: { title: string; query: any }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data } = query;

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const items = data || [];
  if (items.length === 0) return null;

  return (
    <div className="w-full relative px-4 md:px-0 mb-10">
      <div className="flex items-center justify-between mb-4 pr-4 md:pr-0">
        <h2 className="text-[18px] md:text-[20px] font-semibold text-white/90">{title}</h2>
      </div>
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x"
        >
          {items.map((item: any) => (
            <div key={`${item.mediaType}-${item.id}`} className="snap-start">
              <Link href={`/title/${item.mediaType}/${item.id}`}>
                <div className="flex-none cursor-pointer group/card relative rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:z-10 bg-[#16181f] w-[140px] md:w-[180px] lg:w-[200px] aspect-[2/3]">
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                    loading="lazy"
                    src={item.posterPath || "https://via.placeholder.com/300x450?text=No+Image"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                </div>
              </Link>
            </div>
          ))}
        </div>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-0 bottom-0 z-30 w-12 md:w-16 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Main Home Page ─────────────────────────────────────────────────────────

export default function Home() {
  const { region } = useRegion();

  const trendingQuery = useGetTrending({ mediaType: "all", window: "week" });
  const popularMoviesQuery = useGetCatalogList({ mediaType: "movie", category: "popular", region });
  const popularTvQuery = useGetCatalogList({ mediaType: "tv", category: "popular", region });

  return (
    <div className="min-h-screen bg-[#07070b] text-white" data-testid="page-home">
      <Seo title="Home" />

      <main className="relative z-10 px-0 md:pl-[80px] lg:pl-[120px] pt-24 pb-24 md:pb-16 min-h-screen">
        <div className="max-w-[1600px]">
          {/* Hero */}
          <div className="px-4 md:px-0 mb-10">
            <HeroSection />
          </div>

          {/* Browse Categories */}
          <CategoryRow title="Browse" items={BROWSE_CATEGORIES} viewAllHref="/categories" />

          {/* Trending */}
          <ContentRow title="Trending Now" query={trendingQuery} />

          {/* Studios */}
          <CategoryRow title="Studios" items={STUDIOS} viewAllHref="/categories" />

          {/* Popular Movies */}
          <ContentRow title="Popular Movies" query={popularMoviesQuery} />

          {/* Popular Languages */}
          <CategoryRow title="Popular Languages" items={LANGUAGES} />

          {/* Popular TV */}
          <ContentRow title="Popular TV Shows" query={popularTvQuery} />

          {/* Popular Sports */}
          <CategoryRow title="Popular Sports" items={SPORTS} viewAllHref="/sports" />
        </div>
      </main>
    </div>
  );
}
