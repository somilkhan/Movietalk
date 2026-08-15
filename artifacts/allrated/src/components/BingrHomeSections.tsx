import { Link } from "wouter";
import { useRef } from "react";

const TRENDING = [
  { id: 969681, mediaType: "movie", title: "Spider-Man: Brand New Day", posterPath: "https://image.tmdb.org/t/p/w500/iPOn6DinuVyLY17YM9mKuPofV08.jpg" },
  { id: 1339713, mediaType: "movie", title: "Obsession", posterPath: "https://image.tmdb.org/t/p/w500/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg" },
  { id: 1368337, mediaType: "movie", title: "The Odyssey", posterPath: "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg" },
  { id: 1315772, mediaType: "movie", title: "Minions & Monsters", posterPath: "https://image.tmdb.org/t/p/w500/nz7i42yhLIJ4ve9JKgM6NthoLHO.jpg" },
  { id: 108978, mediaType: "tv", title: "Reacher", posterPath: "https://image.tmdb.org/t/p/w500/f1VCQIG2iCyOookdgOzwtUpwWC0.jpg" },
  { id: 1284041, mediaType: "movie", title: "The Last House", posterPath: "https://image.tmdb.org/t/p/w500/6JU7E8Vv2M11egkctWVOScxWR75.jpg" },
  { id: 94997, mediaType: "tv", title: "House of the Dragon", posterPath: "https://image.tmdb.org/t/p/w500/7V0Ebks0GgpKvQ7QbLAIdX5dos4.jpg" },
  { id: 950028, mediaType: "movie", title: "The Invite", posterPath: "https://image.tmdb.org/t/p/w500/b7Dr8Chzse8VagexAporUu2RtLx.jpg" },
  { id: 1101383, mediaType: "movie", title: "The End of Oak Street", posterPath: "https://image.tmdb.org/t/p/w500/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg" },
  { id: 125988, mediaType: "tv", title: "Silo", posterPath: "https://image.tmdb.org/t/p/w500/gMYZZvnkVNTqSVnVCphWbPXwWwb.jpg" },
];

const AFTER_REACHER = [
  { id: 222766, mediaType: "tv", title: "The Day of the Jackal", year: "2024", rating: "8.2", image: "https://image.tmdb.org/t/p/w780/edblLdbHWXr4o9ezUbvlT4FkHwp.jpg" },
  { id: 61859, mediaType: "tv", title: "The Night Manager", year: "2016", rating: "7.7", image: "https://image.tmdb.org/t/p/w780/yw36rzKpHZ1sVFiA3uf9AIykPTV.jpg" },
  { id: 1973, mediaType: "tv", title: "24", year: "2001", rating: "7.8", image: "https://image.tmdb.org/t/p/w780/oE8wosfV6CwfTrvols918ZEnZbv.jpg" },
  { id: 213306, mediaType: "tv", title: "Cross", year: "2024", rating: "7", image: "https://image.tmdb.org/t/p/w780/oIt7hJlpbXETlbmDYoZJu5XkYGI.jpg" },
  { id: 262280, mediaType: "tv", title: "Legends", year: "2026", rating: "7.7", image: "https://image.tmdb.org/t/p/w780/tXFmb1T8vcj6LVoYHw67pyWIT0Q.jpg" },
  { id: 111800, mediaType: "tv", title: "The Old Man", year: "2022", rating: "7.2", image: "https://image.tmdb.org/t/p/w780/dfnuycH4BKWi9nYoj1snxd6zRAr.jpg" },
  { id: 67178, mediaType: "tv", title: "Marvel's The Punisher", year: "2017", rating: "8.2", image: "https://image.tmdb.org/t/p/w780/kWZK3CBC2Lgr8Sk97SAXTZ78r4k.jpg" },
  { id: 287238, mediaType: "tv", title: "Furious", year: "2026", rating: "6.9", image: "https://image.tmdb.org/t/p/w780/p2BRmtZvk2WtRln5avS9W6vgwDf.jpg" },
  { id: 85021, mediaType: "tv", title: "Gangs of London", year: "2020", rating: "7.8", image: "https://image.tmdb.org/t/p/w780/5xWkToUhlLExQMt3mP0gx0azV2h.jpg" },
];

const STUDIOS = [
  ["Specials", "https://api.bingr.one/static/categories/1739441155598-a.webp"],
  ["Disney Plus", "https://api.bingr.one/static/categories/1747996723703-a.webp"],
  ["HBO Max", "https://api.bingr.one/static/categories/1775539725531-a.webp"],
  ["Peacock", "https://api.bingr.one/static/categories/1739359307816-a.webp"],
  ["Paramount", "https://api.bingr.one/static/categories/1739358280583-a.webp"],
  ["Netflix", "https://api.bingr.one/static/netflix.webp"],
  ["Hulu", "https://api.bingr.one/static/hulu.webp"],
  ["Prime Video", "https://api.bingr.one/static/prime-video.webp"],
  ["Apple TV+", "https://api.bingr.one/static/apple-tv.webp"],
] as const;

const GENRES = [
  ["Romance", "https://api.bingr.one/static/categories/1750239101112-a.webp"],
  ["Drama", "https://api.bingr.one/static/categories/1535285-a-88035ca1ae69.webp"],
  ["Family", "https://api.bingr.one/static/categories/1535284-a-656c6b45a905.webp"],
  ["Reality", "https://api.bingr.one/static/categories/1535264-a-9e7871687c76.webp"],
  ["Comedy", "https://api.bingr.one/static/categories/1535292-a-5739f9c84b63.webp"],
  ["Mythology", "https://api.bingr.one/static/categories/1535267-a-3cae422b372e.webp"],
  ["Action", "https://api.bingr.one/static/categories/1535302-a-e90748391e0d.webp"],
  ["Thriller", "https://api.bingr.one/static/categories/1535246-a-27373cc1a222.webp"],
  ["Crime", "https://api.bingr.one/static/categories/1535288-a-690bac400aa1.webp"],
  ["Horror", "https://api.bingr.one/static/categories/1535279-a-c92b487cb711.webp"],
  ["Mystery", "https://api.bingr.one/static/categories/1535269-a-e0ed0b72ebe7.webp"],
  ["Sci-Fi", "https://api.bingr.one/static/categories/1535259-a-6e0b7daffb29.webp"],
  ["Fantasy", "https://api.bingr.one/static/categories/1535282-a-ae97739962dc.webp"],
  ["Adventure", "https://api.bingr.one/static/categories/1535301-a-9bb68bcd147c.webp"],
  ["Superhero", "https://api.bingr.one/static/categories/1538364-a-a3b574f36633.webp"],
  ["Anime", "https://api.bingr.one/static/categories/1750239042025-a.webp"],
  ["Animation", "https://api.bingr.one/static/categories/1535299-a-e6296badeb14.webp"],
  ["Biopic", "https://api.bingr.one/static/categories/1750239188589-a.webp"],
  ["Historical", "https://api.bingr.one/static/categories/1535280-a-a1d64ccd7457.webp"],
  ["Documentary", "https://api.bingr.one/static/categories/1535286-a-f282f00643b5.webp"],
  ["Musical", "https://api.bingr.one/static/categories/1535270-a-6a85b09721ab.webp"],
  ["Devotional", "https://api.bingr.one/static/categories/1608815-a-7d866bb51198.webp"],
  ["Teen", "https://api.bingr.one/static/categories/1535248-a-35ccd1ea9ec0.webp"],
  ["Lifestyle", "https://api.bingr.one/static/categories/1535274-a-5532b8285ed1.webp"],
  ["Travel", "https://api.bingr.one/static/categories/1535245-a-90839834c474.webp"],
  ["Science and Technology", "https://api.bingr.one/static/categories/1568791-a-e50a43088a1a.webp"],
] as const;

function ScrollRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return <div ref={ref} className={`flex overflow-x-auto gap-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x ${className}`}>{children}</div>;
}

function RowHeader({ title }: { title: string }) {
  return <div className="flex items-center justify-between mb-4 pr-4 md:pr-0"><h2 className="text-[17px] md:text-[19px] font-semibold text-white/90">{title}</h2><Link href="/categories" className="flex items-center text-[12px] md:text-sm font-medium text-white/50 hover:text-white transition-colors">View All<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5 opacity-50"><path d="m9 18 6-6-6-6" /></svg></Link></div>;
}

function TrendingRow() {
  return <section className="px-6 lg:px-20 pt-8"><RowHeader title="Trending Right Now" /><div className="relative group"><ScrollRow className="pt-4">{TRENDING.map((item, index) => <Link key={item.id} href={`/title/${item.mediaType}/${item.id}`} className="flex-shrink-0 group/card relative flex items-center pr-2 lg:pr-6 snap-start"><div className="select-none z-10 pl-2 lg:pl-4 text-[100px] md:text-[120px] lg:text-[140px]" style={{ fontFamily: '"Alfa Slab One", "Arial Black", Impact, sans-serif', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.05em', marginRight: '-10px', transform: 'scaleX(1.2)', transformOrigin: 'left center', background: 'linear-gradient(to right, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 40%, rgba(255, 255, 255, 0) 100%) padding-box text', WebkitTextFillColor: 'transparent' }}>{index + 1}</div><div className="relative flex flex-col w-[110px] sm:w-[130px] lg:w-[160px] z-20 shrink-0"><div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-[#1a1c24] ring-1 ring-white/5 transition-all duration-300 group-hover/card:ring-white/20 group-hover/card:-translate-y-2"><img alt={item.title} className="w-full h-full object-cover" loading={index < 3 ? "eager" : "lazy"} src={item.posterPath} /></div></div></Link>)}</ScrollRow><button className="absolute right-0 top-0 bottom-0 z-30 w-10 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition" aria-label="Next"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg></button></div></section>;
}

function AfterReacherRow() {
  return <section className="px-6 lg:px-20 pt-8 pb-4"><div className="flex items-center gap-4 mb-4"><img alt="Reacher" className="w-10 h-14 md:w-12 md:h-16 rounded object-cover border border-white/10 shadow-lg" src={TRENDING[4].posterPath} /><div className="flex flex-col"><div className="flex items-center gap-2"><div className="w-1 h-5 md:h-6 bg-white rounded-sm shadow-[0_0_8px_rgba(255,255,255,0.4)]" /><h2 className="text-[17px] lg:text-[19px] font-bold text-white tracking-wide">Your next Bingr after</h2></div><span className="text-[12px] md:text-[13px] text-white/50 uppercase font-semibold tracking-wider mt-0.5 ml-3">Reacher</span></div></div><ScrollRow className="pt-2 pb-2">{AFTER_REACHER.map((item) => <Link key={item.id} href={`/title/${item.mediaType}/${item.id}`} className="w-[220px] md:w-[260px] lg:w-[280px] shrink-0 snap-start"><div className="group flex flex-col gap-2 w-full transition-all duration-200"><div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"><img alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 absolute inset-0" src={item.image} /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-60" /><div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-end justify-between gap-2 z-10"><div className="flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-white bg-black/60 px-1 sm:px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10">★ {item.rating}</div><div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 border border-white/20 text-white opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 backdrop-blur-md">▶</div></div></div><div className="flex flex-col px-0.5"><h3 className="text-[12px] sm:text-[14px] font-medium text-white/90 leading-snug truncate transition-colors duration-200 group-hover:text-white">{item.title}</h3><div className="flex items-center gap-1 sm:gap-1.5 mt-1 text-[9px] sm:text-[11px] text-white/50 leading-none truncate font-medium"><span>{item.year}</span><span className="w-1 h-1 rounded-full bg-white/20" /><span className="uppercase tracking-wider">Series</span></div></div></div></Link>)}</ScrollRow></section>;
}

function ImageRow({ title, items }: { title: string; items: readonly (readonly [string, string])[] }) {
  return <section className="w-full relative px-6 lg:px-20 pt-8"><RowHeader title={title} /><div className="relative group"><ScrollRow className="py-4 snap-x">{items.map(([name, image]) => <div key={name} className="snap-start shrink-0"><div className="flex-none cursor-pointer group/cat relative rounded-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:z-10 bg-[#16181f] w-[160px] md:w-[220px] lg:w-[280px] aspect-[16/9]"><img alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover/cat:scale-105" loading="lazy" src={image} /><div className="absolute inset-0 bg-black/0 group-hover/cat:bg-white/5 transition-colors duration-300" /></div></div>)}</ScrollRow><button className="absolute right-0 top-0 bottom-0 z-30 w-12 md:w-16 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-label={`Next ${title}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg></button></div></section>;
}

export function BingrHomeSections() {
  return <>
    <TrendingRow />
    <AfterReacherRow />
    <ImageRow title="Studios" items={STUDIOS} />
    <ImageRow title="Popular Genres" items={GENRES} />
  </>;
}
