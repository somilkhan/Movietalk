import { useRef, type ReactNode } from "react";
import { Link } from "wouter";
import { useGetTrending } from "@workspace/api-client-react";
import { CompletedBingrTray } from "@/components/CompletedBingrTray";

interface StudioItem {
  name: string;
  id: number;
  image: string;
}

interface MediaItem {
  id: number;
  title: string;
  name?: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

interface TrayProps {
  title: string;
  items: MediaItem[];
  href?: string;
  ranked?: boolean;
}

const poster = (path?: string | null) =>
  path ? `https://image.tmdb.org/t/p/w342${path}` : "/placeholder-poster.svg";

const yearOf = (item: MediaItem) => {
  const date = item.release_date || item.first_air_date;
  return date ? date.slice(0, 4) : "—";
};

function SectionHeading({ title, href }: Pick<TrayProps, "title" | "href">) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[17px] font-semibold leading-[1.35] tracking-[-0.01em] text-white">
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
        >
          View All
        </Link>
      ) : null}
    </div>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  return (
    <Link
      href={`/watch/${item.media_type === "tv" ? "tv" : "movie"}/${item.id}`}
      className="group/card relative block w-[130px] shrink-0 md:w-[160px] lg:w-[185px]"
      aria-label={`${item.title || item.name || "Untitled"}, ${yearOf(item)}`}
    >
      <div className="overflow-hidden rounded-[6px] bg-white/[0.06]">
        <img
          src={poster(item.poster_path)}
          alt={item.title || item.name || ""}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover/card:scale-[1.025]"
        />
      </div>
      <h3 className="mt-2 line-clamp-1 text-[13px] font-medium leading-[18px] text-white/90">
        {item.title || item.name || "Untitled"}
      </h3>
      <div className="mt-0.5 flex items-center text-[11px] font-medium leading-[16.5px] text-white/50">
        {item.vote_average != null ? <span>★ {item.vote_average.toFixed(1)}</span> : null}
        {item.vote_average != null ? <span className="mx-1.5 text-white/30">·</span> : null}
        <span>{yearOf(item)}</span>
        <span className="mx-1.5 text-white/30">·</span>
        <span>{item.media_type === "tv" ? "Series" : "Movie"}</span>
      </div>
    </Link>
  );
}

function RankedCard({ item, rank }: { item: MediaItem; rank: number }) {
  return (
    <Link
      href={`/watch/${item.media_type === "tv" ? "tv" : "movie"}/${item.id}`}
      className="flex w-[163px] shrink-0 items-center pr-2 lg:w-[210px] lg:pr-6"
    >
      <span className="select-none pl-2 text-[100px] font-black leading-[0.72] tracking-[-0.08em] text-white/10 md:text-[120px] lg:text-[140px]">
        {rank}
      </span>
      <div className="relative z-10 w-[88px] shrink-0 overflow-hidden rounded-[5px] bg-white/[0.06] lg:w-[110px]">
        <img
          src={poster(item.poster_path)}
          alt={item.title || item.name || ""}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover"
        />
      </div>
    </Link>
  );
}

function Tray({ title, items, href, ranked = false }: TrayProps) {
  const scroller = useRef<HTMLDivElement>(null);
  if (!items.length) return null;

  return (
    <section className="mt-8 px-6 first:mt-0">
      <SectionHeading title={title} href={href} />
      <div
        ref={scroller}
        className="flex gap-3 overflow-x-auto pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) =>
          ranked ? <RankedCard key={`${item.id}-${index}`} item={item} rank={index + 1} /> : <MediaCard key={`${item.id}-${index}`} item={item} />,
        )}
      </div>
    </section>
  );
}

function StudioTray({ studios }: { studios: StudioItem[] }) {
  if (!studios.length) return null;
  return (
    <section className="mt-8 px-6">
      <SectionHeading title="Studios" href="/studios" />
      <div className="flex gap-3 overflow-x-auto pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {studios.map((studio) => (
          <Link key={studio.id} href={`/studio/${studio.id}`} className="w-[130px] shrink-0 md:w-[160px] lg:w-[185px]">
            <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[6px] border border-white/[0.06] bg-white/[0.04] p-5">
              <img src={studio.image} alt={studio.name} loading="lazy" className="max-h-full max-w-full object-contain opacity-90 transition-opacity hover:opacity-100" />
            </div>
            <p className="mt-2 line-clamp-1 text-[13px] font-medium text-white/80">{studio.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BingrHomeSections({ children }: { children?: ReactNode }) {
  const { data } = useGetTrending({ mediaType: "all", timeWindow: "week" });
  const trending = ((data as { results?: MediaItem[] } | undefined)?.results ?? []).filter((item) => item?.id);

  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      {children}
      <div className="mx-auto w-full max-w-[1440px]">
        <Tray title="Trending Right Now" items={trending} href="/trending" />
        <Tray title="New Movies" items={trending.filter((x) => x.media_type === "movie")} href="/movies" />
        <Tray title="Popular TV Shows" items={trending.filter((x) => x.media_type === "tv")} href="/tv" />
        <CompletedBingrTray />
        <Tray title="Top Rated TV Shows" items={trending.filter((x) => x.media_type === "tv")} href="/tv?sort=rating" ranked />
        <Tray title="Top Rated Movies" items={trending.filter((x) => x.media_type === "movie")} href="/movies?sort=rating" />
        <Tray title="Top Rated Anime" items={trending.filter((x) => x.media_type === "tv")} href="/anime" />
        <Tray title="Action" items={trending} href="/genre/action" />
        <Tray title="Thriller" items={trending} href="/genre/thriller" />
        <Tray title="Crime" items={trending} href="/genre/crime" />
        <Tray title="Horror" items={trending} href="/genre/horror" />
        <Tray title="Mystery" items={trending} href="/genre/mystery" />
      </div>
    </main>
  );
}
