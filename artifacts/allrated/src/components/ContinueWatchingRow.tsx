import { Link } from "wouter";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { Play } from "lucide-react";

export function ContinueWatchingRow() {
  const { items, isLoading } = useContinueWatching();
  if (isLoading && items.length === 0) return null;
  if (!items.length) return null;

  return (
    <section className="px-6 lg:px-20 pt-8 pb-4" data-testid="continue-watching-row">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] lg:text-[19px] font-semibold text-white/90">Continue Watching</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pt-4 pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.slice(0, 15).map((item) => {
          const progress = Math.min(100, Math.max(0, Number(item.progress) || 0));
          const href = item.mediaType === "tv"
            ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`
            : item.mediaType === "anime"
              ? `/watch/anime/${item.id}/${item.episode || 1}`
              : `/watch/movie/${item.id}`;
          const label = item.mediaType === "tv"
            ? `S${item.season || 1} E${item.episode || 1}`
            : item.mediaType === "anime"
              ? `E${item.episode || 1}`
              : "Movie";

          return (
            <Link
              key={`${item.mediaType}-${item.id}-${item.season ?? "x"}-${item.episode ?? "x"}`}
              href={href}
              className="group/card flex w-[220px] md:w-[260px] lg:w-[300px] shrink-0 flex-col gap-2 outline-none transition-all duration-200"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[#1a1c20]">
                {item.backdropPath || item.posterPath ? (
                  <img
                    src={item.backdropPath || item.posterPath || ""}
                    alt={item.title || ""}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm font-bold text-white/40 bg-white/5">
                    {item.title}
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 z-10 flex items-center justify-center opacity-80 transition-opacity group-hover/card:opacity-100">
                  <Play className="h-6 w-6 text-white fill-white drop-shadow-md" strokeWidth={1.8} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/20">
                  <div className="h-full bg-[#1875e5]" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="flex flex-col px-0.5">
                <h3 className="truncate text-[14px] leading-snug font-semibold text-white/90 transition-colors group-hover/card:text-white sm:text-[15px]">
                  {item.mediaType === "tv" ? label : item.title || ""}
                </h3>
                <div className="mt-0.5 text-[12px] font-medium text-white/50">
                  {item.mediaType === "tv" ? item.title || "" : item.timeLeft ? `${item.timeLeft}m left` : label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
