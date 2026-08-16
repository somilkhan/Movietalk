import { Link } from "wouter";
import { Play } from "lucide-react";
import { useContinueWatching } from "@/hooks/useContinueWatching";

export function ContinueWatchingRow() {
  const { items, isLoading } = useContinueWatching();
  if (isLoading && items.length === 0) return null;
  if (!items.length) return null;

  return (
    <section className="px-6 lg:px-20 pt-8" data-testid="continue-watching-row">
      <div className="flex items-center justify-between mb-4 pr-4">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-white/90">Continue Watching</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.slice(0, 20).map((item) => (
          <Link
            key={`${item.mediaType}-${item.id}-${item.season ?? 0}-${item.episode ?? 0}`}
            href={item.mediaType === "movie" ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`}
            className="group shrink-0 w-[220px] sm:w-[260px] lg:w-[300px] snap-start"
          >
            <div className="relative aspect-video overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
              {item.backdropPath || item.posterPath ? (
                <img src={item.backdropPath || item.posterPath || ""} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              ) : <div className="h-full w-full flex items-center justify-center text-xs text-white/40">{item.title}</div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="absolute left-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg">
                <Play className="h-4 w-4 fill-black" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div className="h-full bg-white" style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }} />
              </div>
            </div>
            <h3 className="mt-2 truncate text-sm font-semibold text-white/90">{item.mediaType === "tv" && item.episode ? `S${item.season || 1} E${item.episode} • ${item.title}` : item.title}</h3>
            <p className="mt-0.5 text-xs text-white/45">{item.timeLeft ? `${item.timeLeft}m left` : `${Math.round(item.progress)}% watched`}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
