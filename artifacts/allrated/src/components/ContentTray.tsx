import { useRef, useState, useEffect } from 'react';
import { Link } from 'wouter';
import type { Title } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';
import { TitleCard, NumberedTitleCard } from './TitleCard';

interface ContentTrayProps {
  heading: string;
  titles?: Title[];
  loading?: boolean;
  numbered?: boolean;
  viewAllHref?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ContentTray({
  heading,
  titles,
  loading,
  numbered,
  viewAllHref,
  className,
}: ContentTrayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [titles]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -el.clientWidth * 0.7 : el.clientWidth * 0.7;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const skeletonCount = 6;

  return (
    <section className={cn('relative mb-8 md:mb-10', className)}>
      {/* Header — matches bingr.one exactly */}
      <div className="flex items-center justify-between mb-4 px-6 lg:px-20">
        <h2 className="text-[17px] lg:text-[19px] font-semibold text-white/90">
          {heading}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-[12px] font-semibold text-white/50 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition"
          >
            View All
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        )}
      </div>

      {/* Scroll container */}
      <div className="relative group/tray">
        {/* Left fade */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none transition-opacity duration-300",
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Right fade */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none transition-opacity duration-300",
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Scroll buttons - desktop only */}
        <button
          onClick={() => scroll('left')}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:bg-black/80 opacity-0 group-hover/tray:opacity-100 pointer-events-none group-hover/tray:pointer-events-auto",
            canScrollLeft ? 'translate-x-0' : '-translate-x-4 opacity-0'
          )}
          aria-label="Scroll left"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <button
          onClick={() => scroll('right')}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:bg-black/80 opacity-0 group-hover/tray:opacity-100 pointer-events-none group-hover/tray:pointer-events-auto",
            canScrollRight ? 'translate-x-0' : 'translate-x-4 opacity-0'
          )}
          aria-label="Scroll right"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth px-6 lg:px-20 pt-4"
        >
          {loading || !titles ? (
            Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[130px] md:w-[160px] lg:w-[185px]">
                <div className="aspect-[2/3] rounded-lg bg-[#1a1c24] animate-pulse" />
                <div className="mt-2 h-4 bg-[#1a1c24] rounded animate-pulse w-3/4" />
                <div className="mt-1 h-3 bg-[#1a1c24] rounded animate-pulse w-1/2" />
              </div>
            ))
          ) : (
            titles.map((title, i) =>
              numbered ? (
                <NumberedTitleCard key={`${title.id}-${i}`} title={title} index={i} />
              ) : (
                <TitleCard key={`${title.id}-${i}`} title={title} index={i} />
              )
            )
          )}
        </div>
      </div>
    </section>
  );
}
