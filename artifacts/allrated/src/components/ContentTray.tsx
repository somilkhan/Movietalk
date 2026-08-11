import { useRef, useState, useEffect } from 'react';
import { Link } from 'wouter';
import type { Title } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';
import { PosterCard } from './PosterCard';

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
  size = 'md',
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-12 lg:px-16">
        <h2
          className="text-white font-bold text-[18px] md:text-[22px] tracking-normal"
          style={{ fontFamily: "'Bebas Neue', 'Anton', Impact, system-ui, sans-serif", letterSpacing: '0.04em' }}
        >
          {heading}
        </h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-white/50 text-xs md:text-sm font-medium hover:text-white transition-colors flex items-center gap-1">
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            "absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 transition-all",
            canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          aria-label="Scroll left"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <button
          onClick={() => scroll('right')}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 transition-all",
            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          aria-label="Scroll right"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className={cn(
            "flex gap-1.5 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth",
            "snap-x snap-mandatory scroll-pl-6 md:scroll-pl-12 lg:scroll-pl-16",
            "px-4 md:px-12 lg:px-16 pb-2"
          )}
        >
          {loading &&
            Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-shrink-0 rounded-lg bg-[#1a1a1a] animate-shimmer",
                  size === 'sm' ? 'w-[130px] md:w-[160px] aspect-[2/3]' :
                  size === 'lg' ? 'w-[180px] md:w-[260px] aspect-[2/3]' :
                  'w-[140px] md:w-[200px] aspect-[2/3]'
                )}
              />
            ))}

          {Array.isArray(titles) && titles.map((title, i) => (
            <PosterCard
              key={`${title.mediaType}-${title.id}`}
              title={title}
              index={numbered ? i : undefined}
              size={size}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
