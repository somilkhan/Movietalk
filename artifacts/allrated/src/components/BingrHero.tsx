import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import type { Title } from "@workspace/api-client-react";
import { getGenreNames } from "@/lib/tmdbGenres";

type ExtendedTitle = Title & { logoPath?: string | null };
type TrailerPayload = { url?: unknown; key?: unknown };

const image = (path: string | null | undefined, size: "w500" | "w1280" | "original") => {
  if (!path) return "";
  return /^https?:\/\//i.test(path) ? path : `https://image.tmdb.org/t/p/${size}${path}`;
};

const yearOf = (title: Title) => title.releaseDate?.slice(0, 4) || (title.year ? String(title.year) : "");
const typeOf = (title: Title) => title.mediaType === "tv" ? "Series" : title.mediaType === "movie" ? "Movie" : "Anime";
const routeOf = (title: Title) => `/${title.mediaType === "tv" ? "tv" : title.mediaType === "movie" ? "movie" : "anime"}/${title.id}`;

export function BingrHero({ titles }: { titles: Title[] | undefined }) {
  const featured = useMemo(() => {
    const seen = new Set<string>();
    return (Array.isArray(titles) ? titles : []).filter((item) => {
      const key = `${item.mediaType}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return Boolean(item.id && (item.backdropPath || item.posterPath));
    }).slice(0, 10) as ExtendedTitle[];
  }, [titles]);

  const [index, setIndex] = useState(0);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [youtubeKey, setYoutubeKey] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLIFrameElement>(null);
  const current = featured[index];

  useEffect(() => {
    if (index >= featured.length) setIndex(0);
  }, [featured.length, index]);

  useEffect(() => {
    if (featured.length < 2) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % featured.length), 9000);
    return () => window.clearInterval(timer);
  }, [featured.length]);

  useEffect(() => {
    if (!current) return;
    const controller = new AbortController();
    setTrailerUrl(null);
    setYoutubeKey(null);
    setPlaying(false);
    setMuted(true);
    setLogoPath(current.logoPath || null);
    void fetch(`/api/catalog/title/${current.mediaType}/${current.id}/trailer`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload: unknown = await response.json();
        return payload && typeof payload === "object" ? payload as TrailerPayload : null;
      })
      .then((payload) => {
        if (typeof payload?.url === "string" && payload.url) setTrailerUrl(payload.url);
        else if (typeof payload?.key === "string" && payload.key) setYoutubeKey(payload.key);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [current?.id, current?.mediaType, current?.logoPath]);

  useEffect(() => {
    if (!current || logoPath || current.logoPath) return;
    const controller = new AbortController();
    void fetch(`/api/catalog/title/${current.mediaType}/${current.id}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload: unknown = await response.json();
        if (!payload || typeof payload !== "object") return null;
        const candidate = payload as { logoPath?: unknown; logo?: unknown; title?: { logoPath?: unknown } };
        const value = candidate.logoPath ?? candidate.logo ?? candidate.title?.logoPath;
        return typeof value === "string" && value ? value : null;
      })
      .then((value) => setLogoPath(value))
      .catch(() => undefined);
    return () => controller.abort();
  }, [current?.id, current?.mediaType, current?.logoPath, logoPath]);

  useEffect(() => {
    if (!trailerUrl || !videoRef.current) return;
    const video = videoRef.current;
    video.muted = true;
    void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [trailerUrl]);

  if (!current) return null;

  const genres = getGenreNames(current.genreIds ?? [], 3);
  const hasTrailer = Boolean(trailerUrl || youtubeKey);
  const youtubeSrc = youtubeKey
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeKey)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${encodeURIComponent(youtubeKey)}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`
    : null;

  const togglePlay = async () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        try { await videoRef.current.play(); setPlaying(true); } catch { setPlaying(false); }
      } else {
        videoRef.current.pause();
        setPlaying(false);
      }
      return;
    }
    if (youtubeRef.current) {
      youtubeRef.current.contentWindow?.postMessage(JSON.stringify({ event: "command", func: playing ? "pauseVideo" : "playVideo", args: [] }), "https://www.youtube-nocookie.com");
      setPlaying((value) => !value);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
      return;
    }
    if (youtubeRef.current) {
      const func = muted ? "unMute" : "mute";
      youtubeRef.current.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "https://www.youtube-nocookie.com");
      setMuted((value) => !value);
    }
  };

  return (
    <section className="relative w-full h-[75vh] md:h-auto md:aspect-video max-h-[85vh] overflow-hidden bg-black" data-testid="hero-section">
      <div ref={sliderRef} className="flex w-full h-full overflow-hidden">
        <div className="relative w-full h-full shrink-0">
          <div className="absolute inset-0 overflow-hidden bg-black">
            {trailerUrl ? (
              <video
                ref={videoRef}
                src={trailerUrl}
                autoPlay
                loop
                playsInline
                muted
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload nofullscreen noremoteplayback"
                className="h-full w-full object-cover object-center pointer-events-none animate-in fade-in duration-1000"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onError={() => { setTrailerUrl(null); setPlaying(false); }}
              />
            ) : youtubeSrc ? (
              <iframe
                ref={youtubeRef}
                src={youtubeSrc}
                title={`${current.title} trailer`}
                className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <picture>
                <source media="(min-width: 1900px)" srcSet={image(current.backdropPath || current.posterPath, "original")} />
                <source media="(min-width: 768px)" srcSet={image(current.backdropPath || current.posterPath, "w1280")} />
                <img src={image(current.posterPath || current.backdropPath, "w500")} alt={current.title} className="h-full w-full object-cover object-top" />
              </picture>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 md:via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
          </div>

          <Link href="/home" className="absolute left-4 top-4 z-[60] h-[55px] w-[55px]" aria-label="Bingr home">
            <img src="https://bingr.one/brand/logo.png" alt="Bingr Logo" className="h-[55px] w-[55px] object-contain drop-shadow-lg" />
          </Link>

          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-[90px] md:pl-[100px] md:pr-6 lg:pl-[120px] lg:pr-8 lg:pb-24 pointer-events-none">
            <div className="w-full pointer-events-auto">
              <div className="w-[85%] md:max-w-2xl flex flex-col items-start text-left">
                <div className="mb-2 flex min-h-[60px] md:min-h-[80px] items-end w-full">
                  {logoPath ? (
                    <img src={image(logoPath, "w500")} alt={current.title} className="max-h-[60px] md:max-h-[70px] max-w-[78%] w-auto object-contain object-left drop-shadow-xl" />
                  ) : (
                    <h2 className="text-3xl sm:text-5xl lg:text-[64px] font-black leading-[1.1] tracking-tight text-[#f9f9f9] drop-shadow-xl">{current.title}</h2>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-y-1 text-[13px] md:text-[14px] font-semibold text-white/90 mb-3">
                  {current.voteAverage > 0 ? <span className="flex items-center text-white"><svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="mr-1" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>{current.voteAverage.toFixed(1)}</span> : null}
                  {current.voteAverage > 0 && yearOf(current) ? <span className="mx-1.5 text-white/30">·</span> : null}
                  {yearOf(current) ? <span>{yearOf(current)}</span> : null}
                  {(current.voteAverage > 0 || yearOf(current)) ? <span className="mx-1.5 text-white/30">·</span> : null}
                  <span>{typeOf(current)}</span>
                  {genres.map((genre) => <span key={genre} className="contents"><span className="mx-1.5 text-white/30">·</span><span>{genre}</span></span>)}
                </div>
                {current.overview ? <p className="mb-5 max-w-xl line-clamp-3 md:line-clamp-4 text-[13px] md:text-[14px] lg:text-[15px] leading-[1.4] text-white/70">{current.overview}</p> : null}
                <div className="flex items-center gap-3">
                  {hasTrailer ? <button type="button" onClick={togglePlay} className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-full bg-[#f9f9f9] text-black flex items-center justify-center shadow-lg transition hover:bg-white active:scale-95" aria-label={playing ? "Pause trailer" : "Play trailer"}>{playing ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l15 8-15 8z" /></svg>}</button> : null}
                  <Link href={routeOf(current)} className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-[#0f1014]/60 px-6 py-3 md:py-3.5 text-[13px] md:text-[15px] font-semibold text-[#f9f9f9] backdrop-blur-md transition hover:bg-white/10 active:scale-95"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>See More</Link>
                </div>
              </div>
            </div>
          </div>

          {hasTrailer && playing ? <button type="button" onClick={toggleMute} className="absolute right-6 bottom-[90px] z-30 h-12 w-12 md:h-14 md:w-14 rounded-full border border-white/20 bg-[#0f1014]/60 text-white backdrop-blur-md transition hover:bg-white/10 active:scale-95" aria-label={muted ? "Unmute trailer" : "Mute trailer"}>{muted ? "🔇" : "🔊"}</button> : null}
        </div>
      </div>
    </section>
  );
}
