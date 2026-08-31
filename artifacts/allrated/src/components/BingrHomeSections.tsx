import { Link } from "wouter";
import type { ReactNode } from "react";
import type { Title } from "@workspace/api-client-react";
import { CompletedBingrTray } from "@/components/CompletedBingrTray";

interface TrayProps {
  title: string;
  items: Title[];
  href?: string;
  ranked?: boolean;
}

const poster = (path?: string | null) =>
  path ? `https://image.tmdb.org/t/p/w342${path}` : "/placeholder-poster.svg";

const yearOf = (item: Title): string => {
  if (!item.releaseDate) return "—";
  return item.releaseDate.slice(0, 4);
};

const titleOf = (item: Title): string => item.title || "Untitled";

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

function MediaCard({ item }: { item: Title }) {
  const mediaType = item.mediaType === "tv" ? "tv" : "movie";
  const label = mediaType === "tv" ? "Series" : "Movie";

  return (
    <Link
      href={`/watch/${mediaType}/${item.id}`}
      className="group/card block w-[130px] shrink-0 md:w-[160px] lg:w-[185px]"
      aria-label={`${titleOf(item)}, ${yearOf(item)}`}
    >
      <div className="overflow-hidden rounded-[6px] bg-white/[0.06]">
        <img
          src={poster(item.posterPath)}
          alt={titleOf(item)}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover/card:scale-[1.025]"
        />
      </div>
      <h3 className="mt-2 line-clamp-1 text-[13px] font-medium leading-[18px] text-white/90">
        {titleOf(item)}
      </h3>
      <div className="mt-0.5 flex items-center text-[11px] font-medium leading-[16.5px] text-white/50">
        {item.voteAverage > 0 ? <span>★ {item.voteAverage.toFixed(1)}</span> : null}
        {item.voteAverage > 0 ? <span className="mx-1.5 text-white/30">·</span> : null}
        <span>{yearOf(item)}</span>
        <span className="mx-1.5 text-white/30">·</span>
        <span>{label}</span>
      </div>
    </Link>
  );
}

function RankedCard({ item, rank }: { item: Title; rank: number }) {
  const mediaType = item.mediaType === "tv" ? "tv" : "movie";

  return (
    <Link
      href={`/watch/${mediaType}/${item.id}`}
      className="flex w-[163px] shrink-0 items-center pr-2 lg:w-[210px] lg:pr-6"
      aria-label={`${rank}. ${titleOf(item)}`}
    >
      <span className="select-none pl-2 text-[100px] font-black leading-[0.72] tracking-[-0.08em] text-white/10 md:text-[120px] lg:text-[140px]">
        {rank}
      </span>
      <div className="relative z-10 w-[88px] shrink-0 overflow-hidden rounded-[5px] bg-white/[0.06] lg:w-[110px]">
        <img
          src={poster(item.posterPath)}
          alt={titleOf(item)}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover"
        />
      </div>
    </Link>
  );
}

function Tray({ title, items, href, ranked = false }: TrayProps) {
  if (!items.length) return null;

  return (
    <section className="mt-8 px-6 first:mt-0" aria-label={title}>
      <SectionHeading title={title} href={href} />
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pt-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) =>
          ranked ? (
            <RankedCard key={`${item.mediaType}-${item.id}-${index}`} item={item} rank={index + 1} />
          ) : (
            <MediaCard key={`${item.mediaType}-${item.id}-${index}`} item={item} />
          ),
        )}
      </div>
    </section>
  );
}

export function BingrHomeSections({ children, trending }: { children?: ReactNode; trending: Title[] }) {
  const movies = trending.filter((item) => item.mediaType === "movie");
  const series = trending.filter((item) => item.mediaType === "tv");

  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      {children}
      <div className="mx-auto w-full max-w-[1440px]">
        <Tray title="Trending Right Now" items={trending} href="/trending" />
        <Tray title="New Movies" items={movies} href="/movies" />
        <Tray title="Popular TV Shows" items={series} href="/tv" />
        <CompletedBingrTray />
        <Tray title="Top Rated TV Shows" items={series} href="/tv?sort=rating" ranked />
        <Tray title="Top Rated Movies" items={movies} href="/movies?sort=rating" />
        <Tray title="Top Rated Anime" items={series} href="/anime" />
        <Tray title="Action" items={trending} href="/genre/action" />
        <Tray title="Thriller" items={trending} href="/genre/thriller" />
        <Tray title="Crime" items={trending} href="/genre/crime" />
        <Tray title="Horror" items={trending} href="/genre/horror" />
        <Tray title="Mystery" items={trending} href="/genre/mystery" />
      </div>
    </main>
  );
}
