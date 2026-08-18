import { useEffect, useState } from "react";
import { Link } from "wouter";
import type { Title } from "@workspace/api-client-react";
import { getGenreNames } from "@/lib/tmdbGenres";

export function HeroSection({ titles }: { titles: Title[] | undefined }) {
  const [index, setIndex] = useState(0);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const title = Array.isArray(titles) ? titles[index] : undefined;

  useEffect(() => {
    setLogoPath(null);
    setTrailerUrl(null);
    if (!title) return;
    const controller = new AbortController();
    Promise.all([
      fetch(`/api/catalog/title/${title.mediaType}/${title.id}/logo`, { signal: controller.signal }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch(`/api/catalog/title/${title.mediaType}/${title.id}/trailer`, { signal: controller.signal }).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([logo, trailer]) => {
      if (logo?.logoPath) setLogoPath(logo.logoPath);
      if (trailer?.url) setTrailerUrl(trailer.url);
    });
    return () => controller.abort();
  }, [title?.id, title?.mediaType]);

  useEffect(() => {
    if (!titles || titles.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % Math.min(titles.length, 8)), 9000);
    return () => window.clearInterval(timer);
  }, [titles]);

  if (!title) return <section className="relative w-full min-h-[75vh] max-h-[85vh] overflow-hidden bg-black animate-pulse" data-testid="hero-section" />;

  const genres = getGenreNames(title.genreIds ?? [], 4);
  const mediaRoute = title.mediaType === "movie" ? "movie" : "tv";
  const backdrop = title.backdropPath || title.posterPath;

  return (
    <section className="relative w-full min-h-[75vh] max-h-[85vh] overflow-hidden bg-black" data-testid="hero-section">
      <div className="absolute inset-0 z-0 bg-black">
        {trailerUrl ? (
          <video src={trailerUrl} autoPlay loop playsInline muted disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" className="h-full w-full object-cover object-center opacity-90" />
        ) : backdrop ? (
          <img src={backdrop} alt={title.title} className="h-full w-full object-cover object-center opacity-90" />
        ) : null}
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-[1] w-[65%] bg-gradient-to-r from-black via-black/50 to-transparent" />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-12 md:pl-[100px] md:pr-12 md:pb-24 lg:pl-[140px]">
        <div className="pointer-events-auto max-w-2xl">
          {logoPath ? <img src={logoPath} alt={title.title} className="mb-6 max-h-[55px] w-auto object-contain object-left drop-shadow-2xl md:max-h-[100px]" onError={() => setLogoPath(null)} /> : <h1 className="mb-4 text-3xl font-bold tracking-tight text-white drop-shadow-lg md:text-6xl">{title.title}</h1>}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[15px] font-medium text-white/90 md:text-base">
            {title.voteAverage > 0 && <span className="flex items-center font-semibold text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="mr-1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>{title.voteAverage.toFixed(1)}<span className="ml-2 text-white/40">•</span></span>}
            {title.releaseDate && <span>{new Date(title.releaseDate).getFullYear()}</span>}
            {genres.length > 0 && <><span className="mx-1 text-white/40">•</span><span>{genres.join(" · ")}</span></>}
          </div>
          {title.overview && <p className="mb-6 max-w-xl line-clamp-3 text-[15px] font-normal leading-relaxed text-white/70 md:text-base">{title.overview}</p>}
          <div className="mt-2 flex items-center gap-4">
            <Link href={`/watch/${mediaRoute}/${title.id}`} aria-label={`Watch ${title.title}`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f9f9f9] text-black transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,.5)] active:scale-95 md:h-14 md:w-14"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="translate-x-[2px]"><path d="M6 4l15 8-15 8z" /></svg></Link>
            <Link href={`/${mediaRoute}/${title.id}`} className="hidden flex-col md:flex"><span className="text-[17px] font-bold text-white">Watch Now</span><span className="text-[13px] font-medium uppercase tracking-wide text-white/50">{mediaRoute === "movie" ? "Movie" : "TV Show"}</span></Link>
            <Link href={`/${mediaRoute}/${title.id}`} className="flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-[.99] md:h-14 md:px-6">See More</Link>
          </div>
        </div>
      </div>

      {titles.length > 1 && <div className="absolute bottom-6 right-6 z-20 hidden items-center gap-2 md:flex">{titles.slice(0, 8).map((item, itemIndex) => <button key={`${item.id}-${itemIndex}`} type="button" onClick={() => setIndex(itemIndex)} aria-label={`Featured ${item.title}`} className={`h-1.5 rounded-full transition-all ${itemIndex === index ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/60"}`} />)}</div>}
    </section>
  );
}
