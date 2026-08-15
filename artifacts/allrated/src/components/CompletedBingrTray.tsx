import { useEffect, useState } from "react";
import { Link } from "wouter";

const COMPLETED_BINGR_KEY = "movietalk:last-completed-bingr";

type CompletedTitle = {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
};

type Recommendation = {
  id: number;
  mediaType?: "movie" | "tv";
  title?: string;
  name?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  year?: string | null;
};

function readCompletedTitle(): CompletedTitle | null {
  try {
    const raw = localStorage.getItem(COMPLETED_BINGR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CompletedTitle>;
    if (!parsed.id || !parsed.mediaType || !parsed.title) return null;
    if (parsed.mediaType !== "movie" && parsed.mediaType !== "tv") return null;
    return {
      id: Number(parsed.id),
      mediaType: parsed.mediaType,
      title: String(parsed.title),
      posterPath: parsed.posterPath || null,
    };
  } catch {
    return null;
  }
}

export function CompletedBingrTray() {
  const [completed, setCompleted] = useState<CompletedTitle | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const load = () => setCompleted(readCompletedTitle());
    load();
    window.addEventListener("bingr:completed", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("bingr:completed", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  useEffect(() => {
    if (!completed) {
      setRecommendations([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/catalog/title/${completed.mediaType}/${completed.id}/similar`, {
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        const next = Array.isArray(data?.results)
          ? data.results.filter((item: Recommendation) => item.id !== completed.id).slice(0, 10)
          : [];
        setRecommendations(next);
      })
      .catch(() => {
        if (!cancelled) setRecommendations([]);
      });
    return () => {
      cancelled = true;
    };
  }, [completed]);

  if (!completed || !recommendations.length) return null;

  return (
    <section className="px-6 lg:px-20 pt-8 pb-4">
      <div className="flex items-center gap-4 mb-4">
        {completed.posterPath ? (
          <img
            alt={completed.title}
            className="w-10 h-14 md:w-12 md:h-16 rounded object-cover border border-white/10 shadow-lg"
            src={completed.posterPath}
          />
        ) : null}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 md:h-6 bg-white rounded-sm shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            <h2 className="text-[17px] lg:text-[19px] font-bold text-white tracking-wide">Your next Bingr after</h2>
          </div>
          <span className="text-[12px] md:text-[13px] text-white/50 uppercase font-semibold tracking-wider mt-0.5 ml-3 truncate">
            {completed.title}
          </span>
        </div>
      </div>

      <div className="relative group/row">
        <div className="flex gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth pt-2 pb-2">
          {recommendations.map((item) => {
            const image = item.backdropPath || item.posterPath;
            if (!image) return null;
            const mediaType = item.mediaType || "movie";
            return (
              <Link
                key={`${mediaType}-${item.id}`}
                href={`/title/${mediaType}/${item.id}`}
                className="w-[220px] md:w-[260px] lg:w-[280px] shrink-0"
              >
                <div className="group flex flex-col gap-2 w-full transition-all duration-200">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    <img
                      alt={item.title || item.name || ""}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 absolute inset-0"
                      src={image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-60" />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-end justify-between gap-2 z-10">
                      {item.voteAverage ? (
                        <div className="flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-white bg-black/60 px-1 sm:px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10">
                          ★ {Number(item.voteAverage).toFixed(1)}
                        </div>
                      ) : <span />}
                      <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 border border-white/20 text-white opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 backdrop-blur-md">
                        ▶
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col px-0.5">
                    <h3 className="text-[12px] sm:text-[14px] font-medium text-white/90 leading-snug truncate transition-colors duration-200 group-hover:text-white">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center gap-1 sm:gap-1.5 mt-1 text-[9px] sm:text-[11px] text-white/50 leading-none truncate font-medium">
                      <span>{item.year || ""}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="uppercase tracking-wider">{mediaType === "tv" ? "Series" : "Movie"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => document.querySelector<HTMLDivElement>("[data-completed-bingr-row]")?.scrollBy({ left: 300, behavior: "smooth" })}
          className="absolute right-0 top-0 bottom-0 z-30 w-10 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          aria-label="Next recommendations"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
