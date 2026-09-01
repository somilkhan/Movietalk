import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import type { Title } from "@workspace/api-client-react";
import { getGenreNames } from "@/lib/tmdbGenres";

type TrailerPayload = { url?: unknown; key?: unknown };
const mediaImage = (path: string | null | undefined, size: "w500" | "w1280" | "original") => !path ? "" : /^https?:\/\//i.test(path) ? path : `https://image.tmdb.org/t/p/${size}${path}`;
const yearOf = (title: Title) => title.releaseDate?.slice(0, 4) || (title.year ? String(title.year) : "");
const typeLabel = (title: Title) => title.mediaType === "tv" ? "Series" : title.mediaType === "movie" ? "Movie" : "Anime";
const detailRoute = (title: Title) => `/title/${title.mediaType === "tv" ? "tv" : title.mediaType === "movie" ? "movie" : "anime"}/${title.id}`;

export function HeroSection({ titles }: { titles: Title[] | undefined }) {
  const featured = useMemo(() => { const seen = new Set<string>(); return (Array.isArray(titles) ? titles : []).filter((title) => { const key = `${title.mediaType}-${title.id}`; if (seen.has(key)) return false; seen.add(key); return Boolean(title.id && (title.backdropPath || title.posterPath)); }).slice(0, 10); }, [titles]);
  const [index, setIndex] = useState(0);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [youtubeKey, setYoutubeKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLIFrameElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const title = featured[index];

  useEffect(() => { if (index >= featured.length) setIndex(0); }, [featured.length, index]);
  useEffect(() => { if (featured.length < 2) return; const interval = window.setInterval(() => setIndex((current) => (current + 1) % featured.length), 9000); return () => window.clearInterval(interval); }, [featured.length]);
  useEffect(() => {
    setTrailerUrl(null); setYoutubeKey(null); setIsMuted(true); if (!title) return;
    const controller = new AbortController();
    void fetch(`/api/catalog/title/${title.mediaType}/${title.id}/trailer`, { signal: controller.signal, headers: { Accept: "application/json" } }).then(async (response) => { if (!response.ok) return null; const payload: unknown = await response.json(); return payload && typeof payload === "object" ? payload as TrailerPayload : null; }).then((payload) => { if (typeof payload?.url === "string" && payload.url) setTrailerUrl(payload.url); else if (typeof payload?.key === "string" && payload.key) setYoutubeKey(payload.key); }).catch(() => undefined);
    return () => controller.abort();
  }, [title?.id, title?.mediaType]);
  useEffect(() => { if (!trailerUrl || !videoRef.current) return; videoRef.current.muted = true; void videoRef.current.play().catch(() => undefined); }, [trailerUrl]);
  if (!title) return null;
  const genres = getGenreNames(title.genreIds ?? [], 3);
  const hasTrailer = Boolean(trailerUrl || youtubeKey);
  const youtubeEmbed = youtubeKey ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeKey)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${encodeURIComponent(youtubeKey)}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1` : null;
  const postYoutube = (func: string) => youtubeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "https://www.youtube-nocookie.com");
  const toggleMute = () => { if (trailerUrl && videoRef.current) { videoRef.current.muted = !videoRef.current.muted; setIsMuted(videoRef.current.muted); } else if (youtubeKey) { postYoutube(isMuted ? "unMute" : "mute"); setIsMuted((current) => !current); } };
  const onSliderScroll = () => { if (!sliderRef.current || window.matchMedia("(min-width: 1536px)").matches) return; const width = sliderRef.current.clientWidth; if (!width) return; const next = Math.round(sliderRef.current.scrollLeft / width); if (next !== index && next >= 0 && next < featured.length) setIndex(next); };
  return <section className="relative w-full h-[75vh] md:h-auto md:aspect-video max-h-[85vh] overflow-hidden group" data-testid="hero-section">
    <div ref={sliderRef} onScroll={onSliderScroll} className="flex 2xl:block w-full h-full overflow-x-auto 2xl:overflow-hidden snap-x snap-mandatory 2xl:snap-none scroll-smooth cursor-grab active:cursor-grabbing 2xl:cursor-default [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {featured.map((item, itemIndex) => { const active = itemIndex === index; const backdrop = mediaImage(item.backdropPath || item.posterPath, "w1280"); const poster = mediaImage(item.posterPath || item.backdropPath, "w500"); return <div key={`${item.mediaType}-${item.id}`} className={`relative w-full h-full flex-shrink-0 snap-center 2xl:absolute 2xl:inset-0 2xl:transition-opacity 2xl:duration-1000 ${active ? "2xl:opacity-100 2xl:z-10" : "2xl:opacity-0 2xl:z-0 2xl:pointer-events-none"}`} aria-hidden={!active}>
        <div className="absolute inset-0 bg-black overflow-hidden">{active && trailerUrl ? <video ref={videoRef} src={trailerUrl} autoPlay loop playsInline muted disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" className="w-full h-full object-cover object-center animate-in fade-in duration-1000 transform scale-[1.35] pointer-events-none" onError={() => setTrailerUrl(null)} /> : active && youtubeEmbed ? <iframe ref={youtubeRef} src={youtubeEmbed} title={`${item.title} trailer`} className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-in fade-in duration-1000" allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" /> : <picture><source media="(min-width: 1900px)" srcSet={mediaImage(item.backdropPath || item.posterPath, "original")} /><source media="(min-width: 768px)" srcSet={backdrop} /><img alt={item.title} className="w-full h-full object-cover object-top" src={poster} /></picture>}<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 md:via-transparent to-transparent pointer-events-none" /><div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" /></div>
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-[90px] md:pl-[100px] lg:pl-[120px] lg:pb-24 pointer-events-none"><div className="pointer-events-auto flex-1 w-[85%] md:max-w-2xl flex flex-col items-start justify-end text-left"><div className="mb-2 min-h-[60px] md:min-h-[80px] flex items-end"><h2 className="text-3xl sm:text-5xl lg:text-[64px] font-black leading-[1.1] drop-shadow-xl tracking-tight text-[#f9f9f9]">{item.title}</h2></div><div className="flex items-center flex-wrap gap-y-1 text-[13px] md:text-[14px] font-semibold text-white/90 mb-3">{item.voteAverage > 0 ? <span className="flex items-center mr-1.5"><span className="mr-1">★</span>{item.voteAverage.toFixed(1)}</span> : null}{item.voteAverage > 0 && yearOf(item) ? <span className="text-white/30 mx-1.5">·</span> : null}{yearOf(item) ? <span>{yearOf(item)}</span> : null}{yearOf(item) ? <span className="text-white/30 mx-1.5">·</span> : null}<span>{typeLabel(item)}</span>{genres.map((genre) => <span key={genre} className="contents"><span className="text-white/30 mx-1.5">·</span><span>{genre}</span></span>)}</div>{item.overview ? <p className="text-[13px] md:text-[14px] lg:text-[15px] text-white/70 leading-[1.4] max-w-xl mb-5 line-clamp-3 md:line-clamp-4">{item.overview}</p> : null}<div className="flex items-center gap-3 mt-1"><Link href={detailRoute(item)} className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[#f9f9f9] text-black flex items-center justify-center hover:bg-white transition active:scale-95 shadow-lg" aria-label="Open details"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l15 8-15 8z" /></svg></Link><Link href={detailRoute(item)} className="inline-flex items-center justify-center gap-2.5 px-6 py-3 md:py-3.5 rounded-full border border-white/20 bg-[#0f1014]/60 backdrop-blur-md text-[#f9f9f9] font-semibold text-[13px] md:text-[15px] hover:bg-white/10 transition active:scale-95"><span>See More</span></Link></div></div></div>
      </div>; })}
    </div>
    {hasTrailer ? <button type="button" onClick={toggleMute} aria-label={isMuted ? "Unmute trailer" : "Mute trailer"} className="absolute right-6 bottom-[90px] z-30 w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/20 bg-[#0f1014]/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/10 transition active:scale-95">{isMuted ? "🔇" : "🔊"}</button> : null}
    {featured.length > 1 ? <div className="hidden 2xl:flex absolute right-12 bottom-[120px] z-[60] items-center gap-3"><button type="button" onClick={() => setIndex((current) => (current - 1 + featured.length) % featured.length)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white" aria-label="Previous hero">‹</button><button type="button" onClick={() => setIndex((current) => (current + 1) % featured.length)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white" aria-label="Next hero">›</button></div> : null}
  </section>;
}
