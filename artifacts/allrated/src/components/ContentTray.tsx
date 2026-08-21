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

const SIZE_CLASSES = {
  sm: 'w-[112px] sm:w-[128px] md:w-[140px] lg:w-[156px]',
  md: 'w-[130px] sm:w-[145px] md:w-[160px] lg:w-[185px]',
  lg: 'w-[145px] sm:w-[165px] md:w-[185px] lg:w-[210px]',
} as const;

export function ContentTray({ heading, titles, loading, numbered, viewAllHref, size = 'md', className }: ContentTrayProps) {
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
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('scroll', checkScroll);
    };
  }, [titles]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -el.clientWidth * 0.72 : el.clientWidth * 0.72, behavior: 'smooth' });
  };

  const skeletonCount = 6;
  const cardWidth = SIZE_CLASSES[size];
  const headingId = `tray-${heading.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <section className={cn('relative mb-8 md:mb-10', className)} aria-labelledby={headingId}>
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-20">
        <h2 id={headingId} className="text-[17px] lg:text-[19px] font-semibold tracking-tight text-white/90">{heading}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="group flex min-h-9 items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none">
            View All
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5"><path d="M9 18l6-6-6-6"/></svg>
          </Link>
        )}
      </div>

      <div className="relative group/tray">
        <div className={cn("absolute left-0 top-0 bottom-0 w-10 md:w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none transition-opacity duration-300", canScrollLeft ? 'opacity-100' : 'opacity-0')} />
        <div className={cn("absolute right-0 top-0 bottom-0 w-10 md:w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none transition-opacity duration-300", canScrollRight ? 'opacity-100' : 'opacity-0')} />

        <button type="button" onClick={() => scroll('left')} disabled={!canScrollLeft} className={cn("absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm items-center justify-center text-white transition-all duration-200 hover:bg-black/90 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0", canScrollLeft ? 'opacity-0 group-hover/tray:opacity-100' : 'opacity-0')} aria-label={`Scroll ${heading} left`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <button type="button" onClick={() => scroll('right')} disabled={!canScrollRight} className={cn("absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm items-center justify-center text-white transition-all duration-200 hover:bg-black/90 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0", canScrollRight ? 'opacity-0 group-hover/tray:opacity-100' : 'opacity-0')} aria-label={`Scroll ${heading} right`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth px-4 sm:px-6 lg:px-20 pt-1 pb-1" tabIndex={0} aria-label={`${heading} titles`}>
          {loading || !titles ? (
            Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className={cn('flex-shrink-0', cardWidth)} aria-hidden="true">
                <div className="aspect-[2/3] rounded-lg bg-[#1a1c24] animate-pulse" />
                <div className="mt-2 h-4 bg-[#1a1c24] rounded animate-pulse w-3/4" />
                <div className="mt-1 h-3 bg-[#1a1c24] rounded animate-pulse w-1/2" />
              </div>
            ))
          ) : titles.length === 0 ? (
            <div className="w-full py-8 text-sm text-white/45">Nothing here yet.</div>
          ) : (
            titles.map((title, i) => numbered ? (
              <NumberedTitleCard key={`${title.mediaType}-${title.id}-${i}`} title={title} index={i} />
            ) : (
              <TitleCard key={`${title.mediaType}-${title.id}-${i}`} title={title} index={i} size={size} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
