import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import type { Title } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { NumberedTitleCard, TitleCard } from "./TitleCard";

interface ContentTrayProps {
  heading: string;
  titles?: Title[];
  loading?: boolean;
  numbered?: boolean;
  viewAllHref?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ContentTray({ heading, titles, loading, numbered, viewAllHref, className }: ContentTrayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    const onResize = () => checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [titles?.length, loading]);

  const scroll = (direction: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: direction * 600, behavior: "smooth" });
  };

  return (
    <section className={cn("relative mb-8", className)}>
      <div className="flex items-center justify-between mb-4 px-6 lg:px-20">
        <h2 className="text-[17px] lg:text-[19px] font-semibold text-white/90">{heading}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="flex items-center text-[12px] md:text-sm font-medium text-white/50 hover:text-white transition-colors">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5 opacity-50">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        )}
      </div>

      <div className="relative group/row">
        {canScrollLeft && (
          <button type="button" onClick={() => scroll(-1)} aria-label="Scroll left" className="absolute left-0 top-0 bottom-0 z-30 hidden w-12 items-center justify-center bg-gradient-to-r from-black/80 to-transparent text-2xl text-white opacity-0 transition group-hover/row:opacity-100 md:flex">‹</button>
        )}
        <div ref={scrollRef} className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-6 py-4 lg:px-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading || !titles
            ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[2/3] w-[130px] shrink-0 animate-pulse rounded-lg bg-[#1a1c24] md:w-[160px] lg:w-[185px]" />)
            : titles.map((title, index) => numbered
              ? <NumberedTitleCard key={`${title.id}-${index}`} title={title} index={index} />
              : <TitleCard key={`${title.id}-${index}`} title={title} index={index} />)}
        </div>
        {canScrollRight && (
          <button type="button" onClick={() => scroll(1)} aria-label="Scroll right" className="absolute right-0 top-0 bottom-0 z-30 hidden w-12 items-center justify-center bg-gradient-to-l from-black/80 to-transparent text-2xl text-white opacity-0 transition group-hover/row:opacity-100 md:flex">›</button>
        )}
      </div>
    </section>
  );
}
