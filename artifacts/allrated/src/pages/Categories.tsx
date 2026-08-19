import { Link } from "wouter";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { Seo } from "@/components/Seo";
import { CATEGORY_GROUPS, STUDIOS, LANGUAGES, GENRES, POPULAR_SPORTS } from "@/lib/genres";

interface ImageItem {
  name: string;
  image?: string;
  href?: string;
  gradient?: string;
}

function ImageRow({ title, items, viewAllHref }: { title: string; items: ImageItem[]; viewAllHref?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });

  return (
    <section className="relative mb-9 w-full md:mb-11">
      <div className="mb-3 flex items-center justify-between px-4 sm:px-6 lg:px-0">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-white/90 md:text-[19px]">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref}>
            <a className="flex items-center text-xs font-medium text-white/40 transition-colors hover:text-white md:text-sm">
              View All <ChevronRight className="ml-0.5 h-4 w-4" />
            </a>
          </Link>
        )}
      </div>
      <div className="group relative">
        <div ref={scrollRef} className="flex snap-x gap-3 overflow-x-auto px-4 py-1 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-6 lg:px-0">
          {items.map((item) => (
            <div key={item.name} className="shrink-0 snap-start">
              <Link href={item.href || "#"}>
                <a className="block">
                  <div className="group/card relative aspect-[16/9] w-[170px] overflow-hidden rounded-lg bg-[#14151b] ring-1 ring-white/[0.045] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-[transform,box-shadow,ring-color] duration-300 hover:-translate-y-1 hover:ring-white/[0.12] hover:shadow-[0_14px_30px_rgba(0,0,0,0.3)] sm:w-[210px] md:w-[240px] lg:w-[280px]">
                    {item.image ? (
                      <img alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.025]" loading="lazy" src={item.image} />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br px-4 text-center ${item.gradient || "from-gray-800 to-gray-900"}`}>
                        <span className="text-sm font-semibold text-white/80">{item.name}</span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>
        <button type="button" onClick={scrollRight} className="absolute right-0 top-0 bottom-0 z-20 hidden w-16 items-center justify-center bg-gradient-to-l from-[#07070b] via-[#07070b]/70 to-transparent text-white/55 opacity-0 transition-opacity duration-300 hover:text-white group-hover:opacity-100 lg:flex" aria-label={`Next ${title}`}>
          <ChevronRight className="h-6 w-6" strokeWidth={2.4} />
        </button>
      </div>
    </section>
  );
}

function PopularGenresRow() {
  return <ImageRow title="Popular Genres" items={GENRES.map((genre) => ({ name: genre.name, image: genre.image, href: `/genre/${encodeURIComponent(genre.name)}` }))} />;
}

export default function Categories() {
  return (
    <div className="min-h-screen bg-black pb-24 text-white md:pb-10" data-testid="page-categories">
      <Seo title="Categories" />
      <main className="mx-auto w-full max-w-[1920px] px-0 sm:px-0 lg:px-12 xl:px-16 2xl:px-20">
        <header className="px-4 pb-7 pt-8 sm:px-6 sm:pt-10 lg:px-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Browse</p>
          <h1 className="text-[24px] font-bold tracking-[-0.025em] text-white md:text-[30px]">Categories</h1>
        </header>
        <ImageRow title="Browse" items={CATEGORY_GROUPS.map((item) => ({ ...item, href: item.href === "/spark" ? "/sparks" : item.href }))} />
        <ImageRow title="Studios" items={STUDIOS.map((studio) => ({ ...studio, href: `/catalog/movie/${encodeURIComponent(studio.name + " Studios")}` }))} />
        <ImageRow title="Popular Languages" items={LANGUAGES.map((language) => ({ name: language.name, image: language.image, href: `/language/${encodeURIComponent(language.sublabel || language.name)}` }))} />
        <ImageRow title="Popular Sports" items={POPULAR_SPORTS.map((sport) => ({ ...sport, href: "/sports" }))} viewAllHref="/sports" />
        <PopularGenresRow />
      </main>
    </div>
  );
}
