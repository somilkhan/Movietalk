import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import type { Title } from '@workspace/api-client-react';
import { getGenreNames } from '@/lib/tmdbGenres';

export function HeroSection({ titles }: { titles: Title[] | undefined }) {
  const [index, setIndex] = useState(0);
  const featured = Array.isArray(titles) ? titles.slice(0, 8) : [];
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [backdropError, setBackdropError] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [youtubeKey, setYoutubeKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLIFrameElement>(null);
  const title = featured[index];

  useEffect(() => {
    setLogoPath(null);
    setBackdropError(false);
    setTrailerUrl(null);
    setYoutubeKey(null);
    setIsPlaying(false);
    setIsMuted(true);
    if (!title) return;

    const ctrl = new AbortController();
    const loadJson = async (url: string): Promise<Record<string, unknown> | null> => {
      try {
        const response = await fetch(url, { signal: ctrl.signal });
        if (!response.ok) return null;
        const value: unknown = await response.json();
        return value && typeof value === 'object' ? value as Record<string, unknown> : null;
      } catch {
        return null;
      }
    };

    void loadJson(`/api/catalog/title/${title.mediaType}/${title.id}/logo`).then((data) => {
      const value = data?.logoPath;
      if (typeof value === 'string' && value.length > 0) setLogoPath(value);
    });
    void loadJson(`/api/catalog/title/${title.mediaType}/${title.id}/trailer`).then((data) => {
      const url = data?.url;
      const key = data?.key;
      if (typeof url === 'string' && url.length > 0) setTrailerUrl(url);
      else if (typeof key === 'string' && key.length > 0) setYoutubeKey(key);
    });

    return () => ctrl.abort();
  }, [title?.id, title?.mediaType]);

  useEffect(() => {
    if (!trailerUrl || !videoRef.current) return;
    const video = videoRef.current;
    video.muted = true;
    void video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [trailerUrl]);

  if (!title) return <div className="relative h-[74vh] min-h-[680px] w-full overflow-hidden bg-black md:aspect-video md:h-auto md:min-h-0 md:max-h-[85vh]" />;

  const genres = getGenreNames(title.genreIds ?? [], 4);
  const backdropUrl = title.backdropPath || title.posterPath || '';
  const youtubeEmbed = youtubeKey
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeKey)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${encodeURIComponent(youtubeKey)}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`
    : null;
  const postYoutube = (func: string) => {
    youtubeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), 'https://www.youtube-nocookie.com');
  };
  const togglePlay = async () => {
    if (trailerUrl && videoRef.current) {
      const video = videoRef.current;
      if (video.paused) {
        try { await video.play(); setIsPlaying(true); } catch { setIsPlaying(false); }
      } else {
        video.pause(); setIsPlaying(false);
      }
      return;
    }
    if (youtubeKey) {
      postYoutube(isPlaying ? 'pauseVideo' : 'playVideo');
      setIsPlaying((playing) => !playing);
    }
  };
  const toggleMute = () => {
    if (trailerUrl && videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else if (youtubeKey) {
      postYoutube(isMuted ? 'unMute' : 'mute');
      setIsMuted((muted) => !muted);
    }
  };
  const hasTrailer = Boolean(trailerUrl || youtubeKey);

  return (
    <section className="relative h-[calc(100svh-164px)] min-h-[980px] w-full overflow-hidden bg-black md:aspect-video md:h-auto md:min-h-0 md:max-h-[85vh]" data-testid="hero-section">
      {trailerUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          <video ref={videoRef} src={trailerUrl} autoPlay loop playsInline muted disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" className="h-full w-full object-cover object-center opacity-90" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onError={() => setTrailerUrl(null)} />
        </div>
      ) : youtubeEmbed ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black">
          <iframe ref={youtubeRef} src={youtubeEmbed} title={`${title.title} trailer`} className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 opacity-90" allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      ) : null}

      {backdropUrl && !trailerUrl && !youtubeEmbed ? <img src={backdropUrl} alt="" aria-hidden="true" className="absolute inset-0 z-0 h-full w-full object-cover object-center" onError={() => setBackdropError(true)} /> : null}
      {backdropError || !backdropUrl ? <div className="absolute inset-0 z-0 bg-black" /> : null}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/35 to-black/5" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/55 via-black/15 to-transparent md:from-black/70 md:via-black/35" />

      <div className="absolute left-5 top-5 z-20 md:hidden"><svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg></div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-10 pb-28 pt-32 md:pb-16 md:pl-[100px] lg:pl-[120px]">
        <div className="relative max-w-2xl">
          <div className="flex max-w-2xl flex-col gap-3">
            {logoPath ? <img src={logoPath} alt={title.title} className="h-16 object-contain object-left drop-shadow-2xl md:h-24" onError={() => setLogoPath(null)} /> : <h1 className="text-4xl font-bold leading-[1.02] tracking-[-0.025em] text-white drop-shadow-lg md:text-5xl lg:text-6xl">{title.title}</h1>}
            <div className="flex items-center gap-2 text-sm text-white/90 md:text-base">
              {title.voteAverage > 0 ? <span>★ {title.voteAverage.toFixed(1)}</span> : null}
              {title.voteAverage > 0 && title.releaseDate ? <span className="text-white/50">·</span> : null}
              {title.releaseDate ? <span>{new Date(title.releaseDate).getFullYear()}</span> : null}
              {genres.length > 0 ? <><span className="text-white/50">·</span><span className="truncate">{genres.join(' · ')}</span></> : null}
            </div>
            {title.overview ? <p className="line-clamp-3 max-w-xl text-[15px] leading-6 text-white/75 md:text-base md:leading-7">{title.overview}</p> : null}
            <div className="mt-2 flex items-center gap-3">
              {hasTrailer ? <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause trailer' : 'Play trailer'} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95 md:h-14 md:w-14">{isPlaying ? <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}</button> : null}
              <Link href={`/title/${title.mediaType}/${title.id}`} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-95"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>See More</Link>
            </div>
          </div>
          {hasTrailer ? <button type="button" onClick={toggleMute} aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'} className="absolute bottom-0 right-0 flex h-12 w-12 shrink-0 translate-y-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-transform hover:scale-105 active:scale-95 md:h-14 md:w-14">{isMuted ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="m19 9-4 6" /><path d="m15 9 4 6" /></svg> : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M19 9a5 5 0 0 1 0 6" /><path d="M15 12h.01" /></svg>}</button> : null}
        </div>
      </div>

      {featured.length > 1 ? <div className="absolute bottom-4 left-1/2 z-20 hidden w-full max-w-3xl -translate-x-1/2 px-6 md:block"><div className="flex gap-2 overflow-x-auto scroll-smooth py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{featured.map((item, itemIndex) => <button key={`${item.id}-${itemIndex}`} type="button" onClick={() => setIndex(itemIndex)} aria-label={`Show ${item.title}`} className={`shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${itemIndex === index ? 'scale-110 ring-2 ring-white' : 'scale-95 opacity-50 hover:opacity-80'}`}><img src={item.backdropPath || item.posterPath || ''} alt="" className="h-16 w-28 object-cover" loading="lazy" /></button>)}</div></div> : null}
    </section>
  );
}
