import { useRef, type ReactNode } from "react";
import { Link } from "wouter";
import type { Title } from "@workspace/api-client-react";

interface TrayProps { title: string; items: Title[]; href: string; ranked?: boolean; }
const poster = (path?: string | null) => !path ? "/placeholder-poster.svg" : /^https?:\/\//i.test(path) ? path : `https://image.tmdb.org/t/p/w500${path}`;
const yearOf = (item: Title) => item.releaseDate?.slice(0, 4) || (item.year ? String(item.year) : "");
const mediaLabel = (item: Title) => item.mediaType === "tv" ? "Series" : item.mediaType === "movie" ? "Movie" : "Anime";
const routeOf = (item: Title) => `/title/${item.mediaType === "tv" ? "tv" : item.mediaType === "movie" ? "movie" : "anime"}/${item.id}`;

function Heading({ title, href }: { title: string; href: string }) {
  return <div className="flex items-center justify-between mb-4"><h2 className="text-[17px] lg:text-[19px] font-semibold text-white/90">{title}</h2><Link href={href} className="flex items-center gap-1 text-[12px] font-semibold text-white/50 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition" aria-label={`View all ${title}`}>View All<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg></Link></div>;
}

function PosterCard({ item }: { item: Title }) {
  return <Link href={routeOf(item)} className="flex-shrink-0 group/card relative w-[130px] md:w-[160px] lg:w-[185px]"><div className="relative flex flex-col w-full"><div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-[#1a1c24] ring-1 ring-white/5 transition-all duration-300 group-hover/card:ring-white/20 group-hover/card:-translate-y-2"><img alt={item.title} className="w-full h-full object-cover" loading="lazy" src={poster(item.posterPath)} /></div><div className="mt-2 truncate text-[14px] font-semibold text-white/90 tracking-tight">{item.title}</div><div className="flex items-center mt-1 text-[11px] font-medium text-white/50">{item.voteAverage > 0 ? <span className="flex items-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="white" className="mr-1" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 17.77z" /></svg>{item.voteAverage.toFixed(1)}</span> : null}{item.voteAverage > 0 && yearOf(item) ? <span className="mx-1.5 text-white/30">·</span> : null}{yearOf(item) ? <span>{yearOf(item)}</span> : null}{yearOf(item) ? <span className="mx-1.5 text-white/30">·</span> : null}<span>{mediaLabel(item)}</span></div></div></Link>;
}

function RankedCard({ item, rank }: { item: Title; rank: number }) {
  return <Link href={routeOf(item)} className="flex-shrink-0 group/card relative flex items-center pr-2 lg:pr-6"><div aria-hidden="true" className="select-none z-10 pl-2 lg:pl-4 text-[100px] md:text-[120px] lg:text-[140px] font-normal leading-none tracking-[-0.05em] mr-[-10px] transform scale-x-[1.2] origin-left bg-gradient-to-r from-white via-white to-transparent bg-clip-text text-transparent" style={{ fontFamily: "'Alfa Slab One', 'Arial Black', Impact, sans-serif" }}>{rank}</div><div className="relative flex flex-col w-[110px] sm:w-[130px] lg:w-[160px] z-20 shrink-0"><div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-[#1a1c24] ring-1 ring-white/5 transition-all duration-300 group-hover/card:ring-white/20 group-hover/card:-translate-y-2"><img alt={item.title} className="w-full h-full object-cover" loading="lazy" src={poster(item.posterPath)} /></div></div></Link>;
}

function Tray({ title, items, href, ranked = false }: TrayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (!items.length) return null;
  const next = () => { const node = scrollRef.current; if (node) node.scrollBy({ left: node.clientWidth * 0.75, behavior: "smooth" }); };
  return <section className="px-6 lg:px-20 pt-8"><Heading title={title} href={href} /><div className="relative group/row"><div ref={scrollRef} className="no-scrollbar [&::-webkit-scrollbar]:hidden flex gap-3 overflow-x-auto scroll-smooth pt-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>{items.map((item, index) => ranked ? <RankedCard key={`${item.mediaType}-${item.id}`} item={item} rank={index + 1} /> : <PosterCard key={`${item.mediaType}-${item.id}`} item={item} />)}</div><button type="button" onClick={next} className="absolute right-0 top-0 bottom-0 z-30 w-10 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition" aria-label={`Next ${title}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg></button></div></section>;
}

export interface BingrHomeSectionsProps { trending: Title[]; newMovies: Title[]; popularMovies: Title[]; popularTv: Title[]; topRatedMovies: Title[]; topRatedTv: Title[]; topRatedAnime: Title[]; genreRows: Array<{ title: string; items: Title[]; href: string }>; children: ReactNode; }
export function BingrHomeSections({ trending, newMovies, popularMovies, popularTv, topRatedMovies, topRatedTv, topRatedAnime, genreRows, children }: BingrHomeSectionsProps) {
  return <main className="relative min-h-screen bg-black text-white pb-20" data-testid="bingr-home">{children}<div className="relative z-10 -mt-4"><Tray title="Trending Right Now" items={trending} href="/catalog/all/Trending%20Right%20Now" ranked /><Tray title="New Movies" items={newMovies} href="/catalog/movie/New%20Movies" /><Tray title="Popular Movies" items={popularMovies} href="/catalog/movie/Popular%20Movies" /><Tray title="Popular TV Shows" items={popularTv} href="/catalog/tv/Popular%20TV%20Shows" /><Tray title="Top Rated TV Shows" items={topRatedTv} href="/catalog/tv/Top%20Rated%20TV%20Shows" ranked /><Tray title="Top Rated Movies" items={topRatedMovies} href="/catalog/movie/Top%20Rated%20Movies" /><Tray title="Top Rated Anime" items={topRatedAnime} href="/anime" />{genreRows.map((row) => <Tray key={row.title} title={row.title} items={row.items} href={row.href} />)}</div></main>;
}
