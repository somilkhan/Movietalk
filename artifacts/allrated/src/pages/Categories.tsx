import { useLocation } from "wouter";
import { useRef } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Seo } from "@/components/Seo";
import {
  CATEGORY_GROUPS,
  STUDIOS,
  LANGUAGES,
  GENRES,
  POPULAR_SPORTS,
} from "@/lib/genres";

interface ImageItem {
  name: string;
  image?: string;
  href?: string;
  gradient?: string;
}

function ImageRow({ title, items, viewAllHref, expanded = false }: { title: string; items: ImageItem[]; viewAllHref?: string; expanded?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="w-full relative px-4 md:px-0 mb-[35px]">
      <div className="flex items-center justify-between mb-4 pr-4 md:pr-0 gap-4">
        <h2 className="min-w-0 text-[18px] md:text-[20px] font-semibold text-white/90">{title}</h2>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="shrink-0 whitespace-nowrap flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors group/btn"
            aria-label={`View all ${title}`}
          >
            View All
            <ChevronRight className="w-4 h-4 ml-0.5 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
          </a>
        )}
      </div>
      {expanded ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <a key={item.name} href={item.href || "#"} className="block">
              <div className="cursor-pointer group/cat relative rounded-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:z-10 bg-[#16181f] aspect-[16/9]">
                {item.image ? (
                  <img alt={item.name} className="w-full h-full object-cover" loading="lazy" src={item.image} />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${item.gradient || "from-gray-800 to-gray-900"} flex items-center justify-center`}>
                    <span className="text-white/80 font-semibold text-sm">{item.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover/cat:bg-white/5 transition-colors duration-300" />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="relative group">
          <div ref={scrollRef} className="flex overflow-x-auto gap-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x">
            {items.map((item) => (
              <div key={item.name} className="snap-start">
                <a href={item.href || "#"} className="block">
                  <div className="flex-none cursor-pointer group/cat relative rounded-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:z-10 bg-[#16181f] w-[160px] md:w-[220px] lg:w-[280px] aspect-[16/9]">
                    {item.image ? (
                      <img alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/cat:scale-105" loading="lazy" src={item.image} />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${item.gradient || "from-gray-800 to-gray-900"} flex items-center justify-center`}>
                        <span className="text-white/80 font-semibold text-sm">{item.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/cat:bg-white/5 transition-colors duration-300" />
                  </div>
                </a>
              </div>
            ))}
          </div>
          <button onClick={scrollRight} className="absolute right-0 top-0 bottom-0 z-30 w-12 md:w-16 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-label="Next" type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

function PopularGenresRow({ expanded = false }: { expanded?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="w-full relative px-4 md:px-0 mb-[35px]">
      <div className="flex items-center justify-between mb-4 pr-4 md:pr-0 gap-4">
        <h2 className="min-w-0 text-[18px] md:text-[20px] font-semibold text-white/90">Popular Genres</h2>
        {!expanded && (
          <a href="/categories?section=genres" className="shrink-0 whitespace-nowrap flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors" aria-label="View all Popular Genres">
            View All
            <ChevronRight className="w-4 h-4 ml-0.5 opacity-50" />
          </a>
        )}
      </div>
      {expanded ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {GENRES.map((genre) => (
            <a key={genre.name} href={`/catalog/movie/${encodeURIComponent(`${genre.name} Movies`)}`} className="block">
              <div className="relative rounded-md overflow-hidden aspect-[16/9] bg-[#16181f]">
                <img alt={genre.name} className="w-full h-full object-cover" loading="lazy" src={genre.image} />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="relative group">
          <div ref={scrollRef} className="flex overflow-x-auto gap-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x">
            {GENRES.map((genre) => (
              <div key={genre.name} className="snap-start">
                <a href={`/catalog/movie/${encodeURIComponent(`${genre.name} Movies`)}`} className="block">
                  <div className="flex-none cursor-pointer group/genre relative rounded-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:z-10 w-[160px] md:w-[220px] lg:w-[280px] aspect-[16/9]">
                    <img alt={genre.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/genre:scale-105" loading="lazy" src={genre.image} />
                    <div className="absolute inset-0 bg-black/0 group-hover/genre:bg-white/5 transition-colors duration-300" />
                  </div>
                </a>
              </div>
            ))}
          </div>
          <button onClick={scrollRight} className="absolute right-0 top-0 bottom-0 z-30 w-12 md:w-16 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-label="Next" type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default function Categories() {
  const [location] = useLocation();
  const section = new URLSearchParams(location.split("?")[1] || "").get("section");
  const studioItems: ImageItem[] = STUDIOS.map((studio) => ({ name: studio.name, image: studio.image, href: `/catalog/movie/${encodeURIComponent(studio.name)}` }));
  const languageItems: ImageItem[] = LANGUAGES.map((language) => ({ name: language.name, image: language.image, href: `/catalog/movie/${encodeURIComponent(language.sublabel || language.name)}` }));
  const sportsItems: ImageItem[] = POPULAR_SPORTS.map((sport) => ({ ...sport, href: "/sports" }));
  const browseItems: ImageItem[] = CATEGORY_GROUPS.map((item) => ({ ...item, href: item.name === "Sparks" ? "/sparks" : item.href }));

  return (
    <div className="min-h-screen bg-[#07070b] text-white pb-28 md:pb-8" data-testid="page-categories">
      <Seo title="Categories" />
      <div className="relative z-10 pl-0 md:pl-[80px] lg:pl-[120px] pt-24 md:pt-20">
        <div className="max-w-[1600px]">
          {section && (
            <div className="px-4 md:px-0 mb-5">
              <a href="/categories" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
                All Categories
              </a>
            </div>
          )}
          {(!section || section === "browse") && <ImageRow title="Browse" items={browseItems} viewAllHref="/categories?section=browse" expanded={section === "browse"} />}
          {(!section || section === "studios") && <ImageRow title="Studios" items={studioItems} viewAllHref="/categories?section=studios" expanded={section === "studios"} />}
          {(!section || section === "languages") && <ImageRow title="Popular Languages" items={languageItems} viewAllHref="/categories?section=languages" expanded={section === "languages"} />}
          {(!section || section === "sports") && <ImageRow title="Popular Sports" items={sportsItems} viewAllHref="/categories?section=sports" expanded={section === "sports"} />}
          {(!section || section === "genres") && <PopularGenresRow expanded={section === "genres"} />}
        </div>
      </div>
    </div>
  );
}
