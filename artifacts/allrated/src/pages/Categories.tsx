import { Link } from "wouter";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { Seo } from "@/components/Seo";
import { useGetGenres } from "@workspace/api-client-react";
import {
  CATEGORY_GROUPS,
  STUDIOS,
  LANGUAGES,
  GENRES,
  POPULAR_SPORTS,
  GENRE_GRADIENTS,
} from "@/lib/genres";

// ── Reusable Horizontal Image Row ───────────────────────────────────────────

interface ImageItem {
  name: string;
  image?: string;
  href?: string;
  gradient?: string;
}

function ImageRow({ title, items, viewAllHref }: { title: string; items: ImageItem[]; viewAllHref?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
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
              <Link href={item.href || "#"}>
                <div
                  className="flex-none cursor-pointer group/cat relative rounded-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:z-10 bg-[#16181f]
                  w-[160px] md:w-[220px] lg:w-[280px] aspect-[16/9]"
                >
                  {item.image ? (
                    <img
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/cat:scale-105"
                      loading="lazy"
                      src={item.image}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${item.gradient || "from-gray-800 to-gray-900"} flex items-center justify-center`}>
                      <span className="text-white/80 font-semibold text-sm">{item.name}</span>
                    </div>
                  )}
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

// ── Genre Grid (for Genres section) ────────────────────────────────────────

function GenreGrid() {
  return (
    <div className="w-full relative px-4 md:px-0 mb-10">
      <div className="flex items-center justify-between mb-4 pr-4 md:pr-0">
        <h2 className="text-[18px] md:text-[20px] font-semibold text-white/90">Popular Genres</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {GENRES.map((genre, i) => (
          <Link key={genre.name} href={`/catalog/list?mediaType=movie&category=popular`}>
            <div
              className={`relative rounded-lg overflow-hidden aspect-[16/9] cursor-pointer group/genre transition-all duration-300 hover:scale-105 bg-gradient-to-br ${GENRE_GRADIENTS[i % GENRE_GRADIENTS.length]}`}
            >
              {genre.image && (
                <img
                  alt={genre.name}
                  className="w-full h-full object-cover opacity-60 group-hover/genre:opacity-80 transition-opacity"
                  loading="lazy"
                  src={genre.image}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold text-sm drop-shadow-lg">{genre.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Main Categories Page ───────────────────────────────────────────────────

export default function Categories() {
  const { data: genres } = useGetGenres({ mediaType: "movie" });

  return (
    <div className="min-h-screen bg-[#07070b] text-white pb-28 md:pb-8" data-testid="page-categories">
      <Seo title="Categories" />

      <div className="relative z-10 pl-0 md:pl-[80px] lg:pl-[120px] pt-12 md:pt-20">
        <div className="max-w-[1600px]">
          {/* Browse */}
          <ImageRow title="Browse" items={[...CATEGORY_GROUPS]} viewAllHref="/categories" />

          {/* Studios */}
          <ImageRow title="Studios" items={[...STUDIOS]} viewAllHref="/categories" />

          {/* Popular Languages */}
          <ImageRow title="Popular Languages" items={LANGUAGES.map(l => ({ name: l.name, image: l.image }))} />

          {/* Popular Sports */}
          <ImageRow title="Popular Sports" items={[...POPULAR_SPORTS]} viewAllHref="/sports" />

          {/* Genres Grid */}
          <GenreGrid />
        </div>
      </div>
    </div>
  );
}
