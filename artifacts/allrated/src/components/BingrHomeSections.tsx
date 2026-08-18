import { Link } from "wouter";
import { useRef } from "react";
import { useGetTrending } from "@workspace/api-client-react";

const STUDIOS = [
  ["Disney Plus", 2, "https://api.bingr.one/static/categories/1747996723703-a.webp"],
  ["HBO Max", 3268, "https://api.bingr.one/static/categories/1775539725531-a.webp"],
  ["Peacock", 3353, "https://api.bingr.one/static/categories/1739359307816-a.webp"],
  ["Paramount", 4, "https://api.bingr.one/static/categories/1739358280583-a.webp"],
  ["Netflix", 213, "https://api.bingr.one/static/netflix.webp"],
  ["Hulu", 453, "https://api.bingr.one/static/hulu.webp"],
  ["Prime Video", 1024, "https://api.bingr.one/static/prime-video.webp"],
  ["Apple TV+", 350, "https://api.bingr.one/static/apple-tv.webp"],
] as const;

const GENRES = [
  ["Romance", "https://api.bingr.one/static/categories/1750239101112-a.webp"], ["Drama", "https://api.bingr.one/static/categories/1535285-a-88035ca1ae69.webp"], ["Family", "https://api.bingr.one/static/categories/1535284-a-656c6b45a905.webp"], ["Reality", "https://api.bingr.one/static/categories/1535264-a-9e7871687c76.webp"], ["Comedy", "https://api.bingr.one/static/categories/1535292-a-5739f9c84b63.webp"], ["Mythology", "https://api.bingr.one/static/categories/1535267-a-3cae422b372e.webp"], ["Action", "https://api.bingr.one/static/categories/1535302-a-e90748391e0d.webp"], ["Thriller", "https://api.bingr.one/static/categories/1535246-a-27373cc1a222.webp"], ["Crime", "https://api.bingr.one/static/categories/1535288-a-690bac400aa1.webp"], ["Horror", "https://api.bingr.one/static/categories/1535279-a-c92b487cb711.webp"], ["Mystery", "https://api.bingr.one/static/categories/1535269-a-e0ed0b72ebe7.webp"], ["Sci-Fi", "https://api.bingr.one/static/categories/1535259-a-6e0b7daffb29.webp"], ["Fantasy", "https://api.bingr.one/static/categories/1535282-a-ae97739962dc.webp"], ["Adventure", "https://api.bingr.one/static/categories/1535301-a-9bb68bcd147c.webp"], ["Superhero", "https://api.bingr.one/static/categories/1538364-a-a3b574f36633.webp"], ["Anime", "https://api.bingr.one/static/categories/1750239042025-a.webp"], ["Animation", "https://api.bingr.one/static/categories/1535299-a-e6296badeb14.webp"], ["Biopic", "https://api.bingr.one/static/categories/1750239188589-a.webp"], ["Historical", "https://api.bingr.one/static/categories/1535280-a-a1d64ccd7457.webp"], ["Documentary", "https://api.bingr.one/static/categories/1535286-a-f282f00643b5.webp"], ["Musical", "https://api.bingr.one/static/categories/1535270-a-6a85b09721ab.webp"], ["Devotional", "https://api.bingr.one/static/categories/1608815-a-7d866bb51198.webp"], ["Teen", "https://api.bingr.one/static/categories/1535248-a-35ccd1ea9ec0.webp"], ["Lifestyle", "https://api.bingr.one/static/categories/1535274-a-5532b8285ed1.webp"], ["Travel", "https://api.bingr.one/static/categories/1535245-a-90839834c474.webp"], ["Science and Technology", "https://api.bingr.one/static/categories/1568791-a-e50a43088a1a.webp"],
] as const;

const GENRE_LINKS: Record<string, string> = Object.fromEntries(GENRES.map(([name]) => [name, `/genre/${encodeURIComponent(name)}`]));

function ScrollRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (direction: -1 | 1) => ref.current?.scrollBy({ left: direction * 600, behavior: "smooth" });
  return <div className={`relative group/row ${className}`}><div ref={ref} className="flex overflow-x-auto gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">{children}</div><button type="button" onClick={() => scroll(1)} className="absolute right-0 top-0 bottom-0 z-30 w-10 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity" aria-label="Next"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg></button></div>;
}
function RowHeader({ title, viewAllHref }: { title: string; viewAllHref?: string }) { return <div className="flex items-center justify-between mb-4"><h2 className="text-[17px] lg:text-[19px] font-semibold text-white/90">{title}</h2>{viewAllHref && <Link href={viewAllHref} className="flex items-center text-[12px] md:text-sm font-medium text-white/50 hover:text-white transition-colors">View All<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5 opacity-50"><path d="m9 18 6-6-6-6" /></svg></Link>}</div>; }

export function TrendingRow() {
  const { data = [] } = useGetTrending({ mediaType: "all", window: "week" });
  return <section className="px-6 lg:px-20 pt-8 pb-4"><RowHeader title="Trending Right Now" viewAllHref="/catalog/all/Trending%20Right%20Now" /><ScrollRow className="pt-4">{data.map((item, index) => <Link key={`${item.mediaType}-${item.id}`} href={`/${item.mediaType === "movie" ? "movie" : "tv"}/${item.id}`} className="flex-shrink-0 group/card relative flex items-center pr-2 lg:pr-6"><div className="select-none z-10 pl-2 lg:pl-4 text-[100px] md:text-[120px] lg:text-[140px]" style={{ fontFamily: '"Alfa Slab One", "Arial Black", Impact, sans-serif', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.05em', marginRight: '-10px', transform: 'scaleX(1.2)', transformOrigin: 'left center', background: 'linear-gradient(to right, rgb(255,255,255) 0%, rgb(255,255,255) 40%, rgba(255,255,255,0) 100%) padding-box text', WebkitTextFillColor: 'transparent' }}>{index + 1}</div><div className="relative flex flex-col w-[110px] sm:w-[130px] lg:w-[160px] z-20 shrink-0"><div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-[#1a1c24] ring-1 ring-white/5 transition-all duration-300 group-hover/card:ring-white/20 group-hover/card:-translate-y-2"><img alt={item.title} className="w-full h-full object-cover" loading={index < 3 ? "eager" : "lazy"} src={item.posterPath || ""} /></div></div></Link>)}</ScrollRow></section>;
}

function ImageRow({ title, items, getHref, viewAllHref }: { title: string; items: readonly (readonly [string, any, ...any])[]; getHref: (name: string, item: readonly any[]) => string; viewAllHref?: string }) {
  return <section className="w-full relative px-6 lg:px-20 pt-8 pb-4"><RowHeader title={title} viewAllHref={viewAllHref} /><ScrollRow className="py-4">{items.map((item) => { const [name, , image] = item; return <div key={name} className="snap-start shrink-0"><Link href={getHref(name, item)} className="block"><div className="flex-none cursor-pointer group/cat relative rounded-md overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10 bg-[#16181f] w-[160px] md:w-[220px] lg:w-[280px] aspect-[16/9]"><img alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover/cat:scale-105" loading="lazy" src={image} /><div className="absolute inset-0 bg-black/0 group-hover/cat:bg-white/5 transition-colors duration-300" /></div></Link></div>; })}</ScrollRow></section>;
}

export function StudiosSection() { return <ImageRow title="Studios" items={STUDIOS} getHref={(name) => `/studio/${encodeURIComponent(name)}`} viewAllHref="/categories/all/STUDIOS" />; }
export function PopularGenresSection() { return <ImageRow title="Popular Genres" items={GENRES.map(([name, image]) => [name, null, image] as const)} getHref={(name) => GENRE_LINKS[name] || "/categories"} viewAllHref="/categories/all/GENRES" />; }
export function BingrHomeSections() { return <TrendingRow />; }
