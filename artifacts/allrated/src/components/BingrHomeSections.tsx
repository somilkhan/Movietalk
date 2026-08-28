import { useRef, type ReactNode } from "react";
import { Link } from "wouter";
import { useGetTrending } from "@workspace/api-client-react";
import { CompletedBingrTray } from "@/components/CompletedBingrTray";

interface StudioItem {
  name: string;
  id: number;
  image: string;
}

interface GenreItem {
  name: string;
  image: string;
}

const STUDIOS: readonly StudioItem[] = [
  { name: "Disney Plus", id: 2, image: "https://api.bingr.one/static/categories/1747996723703-a.webp" },
  { name: "HBO Max", id: 3268, image: "https://api.bingr.one/static/categories/1775539725531-a.webp" },
  { name: "Peacock", id: 3353, image: "https://api.bingr.one/static/categories/1739359307816-a.webp" },
  { name: "Paramount", id: 4, image: "https://api.bingr.one/static/categories/1739358280583-a.webp" },
  { name: "Netflix", id: 213, image: "https://api.bingr.one/static/netflix.webp" },
  { name: "Hulu", id: 453, image: "https://api.bingr.one/static/hulu.webp" },
  { name: "Prime Video", id: 1024, image: "https://api.bingr.one/static/prime-video.webp" },
  { name: "Apple TV+", id: 350, image: "https://api.bingr.one/static/apple-tv.webp" },
];

const GENRES: readonly GenreItem[] = [
  { name: "Romance", image: "https://api.bingr.one/static/categories/1750239101112-a.webp" },
  { name: "Drama", image: "https://api.bingr.one/static/categories/1535285-a-88035ca1ae69.webp" },
  { name: "Family", image: "https://api.bingr.one/static/categories/1535284-a-656c6b45a905.webp" },
  { name: "Reality", image: "https://api.bingr.one/static/categories/1535264-a-9e7871687c76.webp" },
  { name: "Comedy", image: "https://api.bingr.one/static/categories/1535292-a-5739f9c84b63.webp" },
  { name: "Mythology", image: "https://api.bingr.one/static/categories/1535267-a-3cae422b372e.webp" },
  { name: "Action", image: "https://api.bingr.one/static/categories/1535302-a-e90748391e0d.webp" },
  { name: "Thriller", image: "https://api.bingr.one/static/categories/1535246-a-27373cc1a222.webp" },
  { name: "Crime", image: "https://api.bingr.one/static/categories/1535288-a-690bac400aa1.webp" },
  { name: "Horror", image: "https://api.bingr.one/static/categories/1535279-a-c92b487cb711.webp" },
  { name: "Mystery", image: "https://api.bingr.one/static/categories/1535269-a-e0ed0b72ebe7.webp" },
  { name: "Sci-Fi", image: "https://api.bingr.one/static/categories/1535259-a-6e0b7daffb29.webp" },
  { name: "Fantasy", image: "https://api.bingr.one/static/categories/1535282-a-ae97739962dc.webp" },
  { name: "Adventure", image: "https://api.bingr.one/static/categories/1535301-a-9bb68bcd147c.webp" },
  { name: "Superhero", image: "https://api.bingr.one/static/categories/1538364-a-a3b574f36633.webp" },
  { name: "Anime", image: "https://api.bingr.one/static/categories/1750239042025-a.webp" },
  { name: "Animation", image: "https://api.bingr.one/static/categories/1535299-a-e6296badeb14.webp" },
  { name: "Biopic", image: "https://api.bingr.one/static/categories/1750239188589-a.webp" },
  { name: "Historical", image: "https://api.bingr.one/static/categories/1535280-a-a1d64ccd7457.webp" },
  { name: "Documentary", image: "https://api.bingr.one/static/categories/1535286-a-f282f00643b5.webp" },
  { name: "Musical", image: "https://api.bingr.one/static/categories/1535270-a-6a85b09721ab.webp" },
  { name: "Devotional", image: "https://api.bingr.one/static/categories/1608815-a-7d866bb51198.webp" },
  { name: "Teen", image: "https://api.bingr.one/static/categories/1535248-a-35ccd1ea9ec0.webp" },
  { name: "Lifestyle", image: "https://api.bingr.one/static/categories/1535274-a-5532b8285ed1.webp" },
  { name: "Travel", image: "https://api.bingr.one/static/categories/1535245-a-90839834c474.webp" },
  { name: "Science and Technology", image: "https://api.bingr.one/static/categories/1568791-a-e50a43088a1a.webp" },
];

const GENRE_LINKS: Readonly<Record<string, string>> = {
  Romance: "/catalog/movie/Romance%20Movies",
  Drama: "/catalog/movie/Drama%20Movies",
  Family: "/catalog/movie/Family%20Movies",
  Reality: "/catalog/movie/Reality%20Movies",
  Comedy: "/catalog/movie/Comedy%20Movies",
  Mythology: "/catalog/movie/Mythology%20Movies",
  Action: "/catalog/movie/Action%20Movies",
  Thriller: "/catalog/movie/Thriller%20Movies",
  Crime: "/catalog/movie/Crime%20Movies",
  Horror: "/catalog/movie/Horror%20Movies",
  Mystery: "/catalog/movie/Mystery%20Movies",
  "Sci-Fi": "/catalog/movie/Sci-Fi%20Movies",
  Fantasy: "/catalog/movie/Fantasy%20Movies",
  Adventure: "/catalog/movie/Adventure%20Movies",
  Superhero: "/catalog/movie/Superhero%20Movies",
  Anime: "/catalog/movie/Anime%20Movies",
  Animation: "/catalog/movie/Animation%20Movies",
  Biopic: "/catalog/movie/Biopic%20Movies",
  Historical: "/catalog/movie/Historical%20Movies",
  Documentary: "/catalog/movie/Documentary%20Movies",
  Musical: "/catalog/movie/Musical%20Movies",
  Devotional: "/catalog/movie/Devotional%20Movies",
  Teen: "/catalog/movie/Teen%20Movies",
  Lifestyle: "/catalog/movie/Lifestyle%20Movies",
  Travel: "/catalog/movie/Travel%20Movies",
  "Science and Technology": "/catalog/movie/Science%20and%20Technology%20Movies",
};

interface ScrollRowProps {
  children: ReactNode;
  className?: string;
}

function ScrollRow({ children, className = "" }: ScrollRowProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const element = ref.current;
    if (!element) return;
    const distance = element.clientWidth * 0.72;
    element.scrollBy({ left: direction === "right" ? distance : -distance, behavior: "smooth" });
  };

  return (
    <div className={`relative group/row ${className}`}>
      <div
        ref={ref}
        className="flex overflow-x-auto gap-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-0 top-0 bottom-0 z-30 w-12 md:w-16 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        aria-label="Next"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

interface RowHeaderProps {
  title: string;
  viewAllHref?: string;
}

function RowHeader({ title, viewAllHref }: RowHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 pr-4 md:pr-0">
      <h2 className="text-[18px] md:text-[20px] font-semibold text-white/90">{title}</h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-[12px] md:text-sm font-medium text-white/50 hover:text-white transition-colors"
        >
          View All
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5 opacity-50">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      )}
    </div>
  );
}

export function TrendingRow() {
  const trending = useGetTrending({ mediaType: "all", window: "week" });
  const items = (trending.data ?? []).slice(0, 10);

  return (
    <section className="px-6 lg:px-20 pt-8">
      <RowHeader title="Trending Right Now" viewAllHref="/catalog/all/Trending%20Right%20Now" />
      <ScrollRow className="pt-4">
        {items.map((item, index) => (
          <Link
            key={`${item.mediaType}-${item.id}`}
            href={`/title/${item.mediaType}/${item.id}`}
            className="flex-shrink-0 group/card relative flex items-center pr-2 lg:pr-6 snap-start"
          >
            <div
              className="select-none z-10 pl-2 lg:pl-4 text-[100px] md:text-[120px] lg:text-[140px]"
              style={{
                fontFamily: '"Alfa Slab One", "Arial Black", Impact, sans-serif',
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                marginRight: "-10px",
                transform: "scaleX(1.2)",
                transformOrigin: "left center",
                background: "linear-gradient(to right, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 40%, rgba(255, 255, 255, 0) 100%) padding-box text",
                WebkitTextFillColor: "transparent",
              }}
              aria-hidden="true"
            >
              {index + 1}
            </div>
            <div className="relative flex flex-col w-[110px] sm:w-[130px] lg:w-[160px] z-20 shrink-0">
              <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-[#1a1c24] ring-1 ring-white/5 transition-all duration-300 group-hover/card:ring-white/20 group-hover/card:-translate-y-2">
                <img
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                  src={item.posterPath || ""}
                />
              </div>
            </div>
          </Link>
        ))}
      </ScrollRow>
    </section>
  );
}

interface ImageRowProps {
  title: string;
  items: readonly { name: string; image: string }[];
  getHref: (name: string) => string;
}

function ImageRow({ title, items, getHref }: ImageRowProps) {
  return (
    <section className="w-full relative px-6 lg:px-20 pt-8">
      <RowHeader title={title} />
      <ScrollRow className="py-4 snap-x">
        {items.map((item) => (
          <div key={item.name} className="snap-start shrink-0">
            <Link href={getHref(item.name)} className="block">
              <div className="flex-none cursor-pointer group/cat relative rounded-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:z-10 bg-[#16181f] w-[160px] md:w-[220px] lg:w-[280px] aspect-[16/9]">
                <img
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/cat:scale-105"
                  loading="lazy"
                  decoding="async"
                  src={item.image}
                />
              </div>
            </Link>
          </div>
        ))}
      </ScrollRow>
    </section>
  );
}

export function StudiosRow() {
  return (
    <ImageRow
      title="Studios"
      items={STUDIOS.map(({ name, image }) => ({ name, image }))}
      getHref={(name) => `/catalog/movie/${encodeURIComponent(`${name} Studios`)}`}
    />
  );
}

export function PopularGenresSection() {
  return <ImageRow title="Popular Genres" items={GENRES} getHref={(name) => GENRE_LINKS[name] ?? "/categories"} />;
}

export function BingrHomeSections() {
  return (
    <>
      <TrendingRow />
      <CompletedBingrTray />
      <StudiosRow />
    </>
  );
}
