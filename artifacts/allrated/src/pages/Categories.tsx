import { Link } from "wouter";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
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
            <a className="flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors group/btn">
              View All
              <ChevronRight className="w-4 h-4 ml-0.5 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
            </a>
          </Link>
        )}
      </div>
      <div className="relative group">
        <div ref={scrollRef} className="flex overflow-x-auto gap-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x">
          {items.map((item) => (
            <div key={item.name} className="snap-start">
              <Link href={item.href || "#"}>
                <a className="block">
                  <div className="flex-none cursor-pointer group/cat relative rounded-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:z-10 bg-[#16181f] w-[160px] md:w-[220px] lg:w-[280px] aspect-[16/9]">
                    {item.image ? <img alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/cat:scale-105" loading="lazy" src={item.image} /> : <div className={`w-full h-full bg-gradient-to-br ${item.gradient || "from-gray-800 to-gray-900"} flex items-center justify-center`}><span className="text-white/80 font-semibold text-sm">{item.name}</span></div>}
                    <div className="absolute inset-0 bg-black/0 group-hover/cat:bg-white/5 transition-colors duration-300" />
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>
        <button onClick={scrollRight} className="absolute right-0 top-0 bottom-0 z-30 w-12 md:w-16 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  );
}

function PopularGenresRow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="w-full relative px-4 md:px-0 mb-10">
      <div className="flex items-center justify-between mb-4 pr-4 md:pr-0"><h2 className="text-[18px] md:text-[20px] font-semibold text-white/90">Popular Genres</h2></div>
      <div className="relative group">
        <div ref={scrollRef} className="flex overflow-x-auto gap-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x">
          {GENRES.map((genre) => (
            <div key={genre.name} className="snap-start">
              <Link href={`/genre/${encodeURIComponent(genre.name)}`}><a className="block"><div className="flex-none cursor-pointer group/genre relative rounded-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:z-10 w-[160px] md:w-[220px] lg:w-[280px] aspect-[16/9]"><img alt={genre.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/genre:scale-105" loading="lazy" src={genre.image} /><div className="absolute inset-0 bg-black/0 group-hover/genre:bg-white/5 transition-colors duration-300" /></div></a></Link>
            </div>
          ))}
        </div>
        <button onClick={scrollRight} className="absolute right-0 top-0 bottom-0 z-30 w-12 md:w-16 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}

export default function Categories() {
  return (
    <div className="min-h-screen bg-[#07070b] text-white pb-28 md:pb-8" data-testid="page-categories">
      <Seo title="Categories" />
      <div className="relative z-10 pl-0 md:pl-[80px] lg:pl-[120px] pt-12 md:pt-20">
        <div className="max-w-[1600px]">
          <ImageRow title="Browse" items={CATEGORY_GROUPS.map((item) => ({ ...item, href: item.href === '/spark' ? '/sparks' : item.href }))} />
          <ImageRow title="Studios" items={STUDIOS.map((studio) => ({ ...studio, href: `/catalog/movie/${encodeURIComponent(studio.name + ' Studios')}` }))} />
          <ImageRow title="Popular Languages" items={LANGUAGES.map((language) => ({ name: language.name, image: language.image, href: `/language/${encodeURIComponent(language.sublabel || language.name)}` }))} />
          <ImageRow title="Popular Sports" items={POPULAR_SPORTS.map((sport) => ({ ...sport, href: '/sports' }))} viewAllHref="/sports" />
          <PopularGenresRow />
        </div>
      </div>
    </div>
  );
}
