import { useRef, useState, useEffect } from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

const GENRES = [
  { name: 'Romance', color: '#ff6b9d', bg: 'linear-gradient(135deg, #2d1b2e 0%, #1a0f1a 100%)' },
  { name: 'Drama', color: '#4ecdc4', bg: 'linear-gradient(135deg, #0f2d2a 0%, #0a1f1c 100%)' },
  { name: 'Family', color: '#ffe66d', bg: 'linear-gradient(135deg, #2d2a0f 0%, #1f1c0a 100%)' },
  { name: 'Reality', color: '#a8e6cf', bg: 'linear-gradient(135deg, #1a2d1f 0%, #0f1f14 100%)' },
  { name: 'Action', color: '#ff8b94', bg: 'linear-gradient(135deg, #2d1a1a 0%, #1f0f0f 100%)' },
  { name: 'Comedy', color: '#ffd93d', bg: 'linear-gradient(135deg, #2d2a0f 0%, #1f1c0a 100%)' },
  { name: 'Horror', color: '#ff6b6b', bg: 'linear-gradient(135deg, #2d1a1a 0%, #1f0a0a 100%)' },
  { name: 'Sci-Fi', color: '#6bcb77', bg: 'linear-gradient(135deg, #0f2d1a 0%, #0a1f0f 100%)' },
];

export function PopularGenresTray() {
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
  }, []);

  return (
    <section className="mb-8 md:mb-10">
      <div className="flex items-center justify-between mb-4 px-6 md:px-12 lg:px-16">
        <h2
          className="text-white font-bold text-[18px] md:text-[22px] tracking-normal"
          style={{ fontFamily: "'Bebas Neue', 'Anton', Impact, system-ui, sans-serif", letterSpacing: '0.04em' }}
        >
          Popular Genres
        </h2>
        <span className="text-white/50 text-xs md:text-sm font-medium flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
          View All
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </span>
      </div>

      <div className="relative group/tray">
        <div className={cn("absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none transition-opacity duration-300", canScrollLeft ? 'opacity-100' : 'opacity-0')} />
        <div className={cn("absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none transition-opacity duration-300", canScrollRight ? 'opacity-100' : 'opacity-0')} />

        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory scroll-pl-6 md:scroll-pl-12 lg:scroll-pl-16 px-6 md:px-12 lg:px-16 pb-2"
        >
          {GENRES.map((genre) => (
            <div
              key={genre.name}
              className="flex-shrink-0 snap-start w-[140px] md:w-[180px] aspect-[16/9] rounded-xl border border-white/5 flex items-end p-3 cursor-pointer hover:border-white/20 transition-all hover:scale-105"
              style={{ background: genre.bg }}
            >
              <span className="text-white font-bold text-base md:text-lg">
                {genre.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
