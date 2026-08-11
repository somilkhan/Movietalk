import { Link } from 'wouter';
import { useRef } from 'react';
import { Seo } from '@/components/Seo';
import { useGetGenres } from '@workspace/api-client-react';
import {
  CATEGORY_GROUPS,
  STUDIOS,
  LANGUAGES,
  GENRES,
  POPULAR_SPORTS,
  GENRE_GRADIENTS,
} from '@/lib/genres';

// Sport icons for Popular Sports gradient cards
const SPORT_ICONS: Record<string, React.ReactNode> = {
  Cricket: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <ellipse cx="12" cy="12" rx="9" ry="9"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/>
      <path d="M5.6 5.6 L18.4 18.4M18.4 5.6 L5.6 18.4"/>
    </svg>
  ),
  Football: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6 L9 9 L9 14 L12 16 L15 14 L15 9 Z"/>
      <path d="M9 9 L6.5 7.5M15 9 L17.5 7.5M9 14 L6.5 15.5M15 14 L17.5 15.5M12 16 L12 20"/>
    </svg>
  ),
  Badminton: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 21 L13 11"/>
      <path d="M10 8 a4 4 0 1 1 6 6 a4 4 0 0 0-6 -6"/>
      <path d="M13 11 L16 8"/>
    </svg>
  ),
  Mixed: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="10" width="8" height="11" rx="1"/><rect x="10" y="6" width="4" height="15" rx="1"/><rect x="16" y="3" width="6" height="18" rx="1"/>
    </svg>
  ),
  Racing: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 6 L4 18 M4 6 L14 6 L10 12 L20 12"/>
      <line x1="14" y1="6" x2="14" y2="18"/>
    </svg>
  ),
  Basketball: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="10"/>
      <path d="M4.93 4.93 A10 10 0 0 0 19.07 19.07"/>
      <path d="M4.93 19.07 A10 10 0 0 0 19.07 4.93"/>
      <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
    </svg>
  ),
};

function SportCard({ name, gradient }: { name: string; gradient: string }) {
  return (
    <div
      className={`relative flex-none flex items-end rounded-xl overflow-hidden cursor-pointer group bg-gradient-to-br ${gradient}`}
      style={{ width: 200, height: 120 }}
    >
      <div className="absolute inset-0 flex items-center justify-end pr-4 opacity-70">
        {SPORT_ICONS[name]}
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-white/5 transition-colors duration-300" />
      <p className="relative z-10 pb-3 pl-4 text-[15px] font-bold text-white leading-tight">{name}</p>
    </div>
  );
}

// Browse card — dark gradient with icon watermark, matches bingr.one
const BROWSE_ICONS: Record<string, React.ReactNode> = {
  Sports: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>
    </svg>
  ),
  Sparks: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="23 7 16 7 19 2 3 11 10 11 7 16 23 7"/>
    </svg>
  ),
  Anime: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  TV: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  Movies: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>
    </svg>
  ),
  News: (
    <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
    </svg>
  ),
};

function BrowseCard({ name, href, gradient }: { name: string; href: string; gradient: string }) {
  return (
    <Link href={href}>
      <div
        className={`relative flex-none flex items-end rounded-xl overflow-hidden cursor-pointer group bg-gradient-to-br ${gradient}`}
        style={{ width: 190, height: 120 }}
      >
        <div className="absolute inset-0 flex items-center justify-end pr-4 opacity-60">
          {BROWSE_ICONS[name]}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-white/5 transition-colors duration-300" />
        <p className="relative z-10 pb-3 pl-4 text-[15px] font-bold text-white leading-tight">{name}</p>
      </div>
    </Link>
  );
}

// Image card used for Studios / Languages / Sports / Genres (photo-based)
function ImageCard({
  label,
  sublabel,
  image,
  href,
  testId,
}: {
  label: string;
  sublabel?: string;
  image: string;
  href?: string;
  testId?: string;
}) {
  const inner = (
    <div
      className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#1a1c24] cursor-pointer group"
      data-testid={testId}
    >
      <img
        src={image}
        alt={label}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-3">
        <p className="text-[15px] font-bold text-white leading-tight drop-shadow">{label}</p>
        {sublabel && (
          <p className="text-[12px] text-white/60 mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

// Gradient card for TMDB genres
function GradientCard({
  label,
  gradient,
  testId,
}: {
  label: string;
  gradient: string;
  testId?: string;
}) {
  return (
    <div
      className={`relative flex w-full aspect-[16/9] cursor-pointer items-end rounded-xl bg-gradient-to-br ${gradient} overflow-hidden group`}
      data-testid={testId}
    >
      <div className="absolute inset-0 bg-black/0 group-hover:bg-white/5 transition-colors duration-300" />
      <p className="relative z-10 p-3 text-[15px] font-bold text-white leading-tight drop-shadow">{label}</p>
    </div>
  );
}

// Horizontal scrollable row of cards
function CategorySection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  function scroll(dir: 'left' | 'right') {
    scroller.current?.scrollBy({ left: dir === 'left' ? -700 : 700, behavior: 'smooth' });
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] md:text-[20px] font-semibold text-white/90">{heading}</h2>
        <button className="flex items-center gap-0.5 text-[13px] font-semibold text-white/50 hover:text-white transition-colors">
          View All
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
      <div className="relative group/scroll">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-30 w-10 bg-gradient-to-r from-background to-transparent flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div
          ref={scroller}
          className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {children}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-30 w-10 bg-gradient-to-l from-background to-transparent flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </section>
  );
}

export default function Categories() {
  const genres = useGetGenres({ mediaType: 'movie' });

  return (
    <div className="pb-24 md:pb-12 pt-20 md:pt-8" data-testid="page-categories">
      <Seo title="Categories" />
      <div className="px-6 lg:px-20">
        {/* Browse — dark gradient icon cards, no scrollbar, all 6 visible */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] md:text-[20px] font-semibold text-white/90">Browse</h2>
            <button className="flex items-center gap-0.5 text-[13px] font-semibold text-white/50 hover:text-white transition-colors">
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          {/* Mobile: horizontal scroll; Desktop: 6-col equal-width grid */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar lg:grid lg:grid-cols-6 lg:overflow-x-visible">
            {CATEGORY_GROUPS.map((c) => (
              <Link key={c.name} href={c.href} className="flex-none lg:flex-auto">
                <div
                  className={`relative flex items-end rounded-xl overflow-hidden cursor-pointer group bg-gradient-to-br ${c.gradient} w-[190px] lg:w-full`}
                  style={{ height: 120 }}
                >
                  <div className="absolute inset-0 flex items-center justify-end pr-4 opacity-60">
                    {BROWSE_ICONS[c.name]}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-white/5 transition-colors duration-300" />
                  <p className="relative z-10 pb-3 pl-4 text-[15px] font-bold text-white leading-tight">{c.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Studios */}
        <CategorySection heading="Studios">
          {STUDIOS.map((s) => (
            <div key={s.name} className="flex-none w-[200px] md:w-[240px] lg:w-[280px]">
              <ImageCard
                label={s.name}
                image={s.image}
                testId={`card-studio-${s.name.toLowerCase().replace(/\s+/g, '-')}`}
              />
            </div>
          ))}
        </CategorySection>

        {/* Popular Languages — with sublabel (native script + English name) */}
        <CategorySection heading="Popular Languages">
          {LANGUAGES.map((l) => (
            <div key={l.name} className="flex-none w-[200px] md:w-[240px] lg:w-[280px]">
              <ImageCard
                label={l.name}
                sublabel={l.sublabel}
                image={l.image}
                testId={`card-language-${l.name.toLowerCase()}`}
              />
            </div>
          ))}
        </CategorySection>

        {/* Popular Sports — gradient + sport icon cards */}
        <CategorySection heading="Popular Sports">
          {POPULAR_SPORTS.map((s) => (
            <SportCard key={s.name} name={s.name} gradient={s.gradient} />
          ))}
        </CategorySection>

        {/* Popular Genres */}
        <CategorySection heading="Popular Genres">
          {GENRES.map((g) => (
            <div key={g.name} className="flex-none w-[200px] md:w-[240px] lg:w-[280px]">
              <ImageCard
                label={g.name}
                image={g.image}
                testId={`card-genre-${g.name.toLowerCase()}`}
              />
            </div>
          ))}
        </CategorySection>

        {/* All Genres (from TMDB) */}
        <section className="mb-10">
          <h2 className="mb-4 text-[18px] md:text-[20px] font-semibold text-white/90">All Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {genres.isLoading &&
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[16/9] animate-pulse rounded-xl bg-card" />
              ))}
            {Array.isArray(genres.data) && genres.data.map((g, i) => (
              <GradientCard
                key={g.id}
                label={g.name}
                gradient={GENRE_GRADIENTS[i % GENRE_GRADIENTS.length]}
                testId={`card-genre-tmdb-${g.id}`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
