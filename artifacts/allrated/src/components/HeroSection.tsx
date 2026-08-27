import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import type { Title } from '@workspace/api-client-react';
import { getGenreNames } from '@/lib/tmdbGenres';

const clampFeatured = (titles: Title[] | undefined) => (Array.isArray(titles) ? titles.slice(0, 8) : []);

function HeroSlide({ title, active }: { title: Title; active: boolean }) {
  const [backdropError, setBackdropError] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [youtubeKey, setYoutubeKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLIFrameElement>(null);
  const genres = getGenreNames(title.genreIds ?? [], 4);
  const backdropUrl = title.backdropPath || title.posterPath;

  useEffect(() => {
    setBackdropError(false);
    setTrailerUrl(null);
    setYoutubeKey(null);
    setIsPlaying(true);
    setIsMuted(true);
    if (!active) return;

    const ctrl = new AbortController();
    fetch(`/api/catalog/title/${title.mediaType}/${title.id}/trailer`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.url) setTrailerUrl(data.url);
        else if (data?.key) setYoutubeKey(data.key);
      })
      .catch(() => {});

    return () => ctrl.abort();
  }, [active, title.id, title.mediaType]);

  useEffect(() => {
    if (!trailerUrl || !videoRef.current || !active) return;
    videoRef.current.muted = true;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [active, trailerUrl]);

  const postYoutube = (func: string) => {
    youtubeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      'https://www.youtube-nocookie.com',
    );
  };

  const togglePlay = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (trailerUrl && videoRef.current) {
      if (videoRef.current.paused) {
        try { await videoRef.current.play(); setIsPlaying(true); } catch { setIsPlaying(false); }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else if (youtubeKey) {
      postYoutube(isPlaying ? 'pauseVideo' : 'playVideo');
      setIsPlaying((v) => !v);
    }
  };

  const toggleMute = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (trailerUrl && videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else if (youtubeKey) {
      postYoutube(isMuted ? 'unMute' : 'mute');
      setIsMuted((v) => !v);
    }
  };

  const youtubeEmbed = youtubeKey
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeKey)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${encodeURIComponent(youtubeKey)}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`
    : null;
  const hasTrailer = Boolean(trailerUrl || youtubeKey);

  return (
    <div
      className={`relative w-full h-full flex-shrink-0 snap-center 2xl:absolute 2xl:inset-0 2xl:transition-opacity 2xl:duration-1000 ${active ? '2xl:opacity-100 2xl:z-10' : '2xl:opacity-0 2xl:z-0 2xl:pointer-events-none'}`}
      aria-hidden={!active}
    >
      {trailerUrl && !backdropError ? (
        <div className="absolute inset-0 bg-black overflow-hidden">
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
            className="w-full h-full object-cover object-center animate-in fade-in duration-1000 transform scale-[1.35] pointer-events-none"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setBackdropError(true)}
          />
        </div>
      ) : youtubeEmbed && !backdropError ? (
        <div className="absolute inset-0 bg-black overflow-hidden pointer-events-none">
          <iframe
            ref={youtubeRef}
            src={youtubeEmbed}
            title={`${title.title} trailer`}
            className="absolute left-1/2 top-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full -translate-x-1/2 -translate-y-1/2 scale-[1.35] animate-in fade-in duration-1000"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            onError={() => setBackdropError(true)}
          />
        </div>
      ) : (
        <>
          <img
            src={backdropUrl || ''}
            alt={title.title}
            className={`absolute inset-0 h-full w-full object-cover ${!backdropUrl || backdropError ? 'hidden' : ''}`}
            onError={() => setBackdropError(true)}
          />
          {(!backdropUrl || backdropError) && <div className="absolute inset-0 bg-black" />}
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-[90px] md:pl-[100px] md:pr-6 lg:pl-[120px] lg:pr-8 lg:pb-24 pointer-events-none">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 w-full pointer-events-auto relative">
          <div className="flex-1 w-[85%] md:max-w-2xl flex flex-col items-start text-left group">
            <div className="w-full transition-opacity duration-1000 ease-in-out opacity-100">
              <div className="mb-2 min-h-[60px] md:min-h-[80px] flex items-end justify-start w-full">
                <h2 className="text-3xl sm:text-5xl lg:text-[64px] font-black leading-[1.1] drop-shadow-xl font-display tracking-tight text-[#f9f9f9]">
                  {title.title}
                </h2>
              </div>

              <div className="overflow-hidden transition-all duration-1000 ease-in-out max-h-[300px] opacity-100">
                <div className="flex items-center flex-wrap gap-y-1 text-[13px] md:text-[14px] font-semibold text-white/90 mb-3">
                  {title.voteAverage > 0 && <span>{title.voteAverage.toFixed(1)}</span>}
                  {title.voteAverage > 0 && title.releaseDate && <span className="text-white/40 mx-2">·</span>}
                  {title.releaseDate && <span>{new Date(title.releaseDate).getFullYear()}</span>}
                  {(genres.length > 0 || title.releaseDate) && <span className="text-white/40 mx-2">·</span>}
                  <span>{title.mediaType === 'tv' ? 'Series' : 'Movie'}</span>
                  {genres.map((genre) => <span key={genre} className="ml-2">· {genre}</span>)}
                </div>
                {title.overview && (
                  <p className="text-[13px] md:text-[14px] lg:text-[15px] text-white/70 leading-[1.4] max-w-xl mb-5 line-clamp-3 md:line-clamp-4">
                    {title.overview}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 w-full mt-1">
                {hasTrailer && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause trailer' : 'Play trailer'}
                    className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[#f9f9f9] text-black flex items-center justify-center hover:bg-white transition active:scale-95 shadow-lg"
                  >
                    {isPlaying ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </button>
                )}

                <Link
                  href={`/title/${title.mediaType}/${title.id}`}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 md:py-3.5 rounded-full border border-white/20 bg-[#0f1014]/60 backdrop-blur-md text-[#f9f9f9] font-semibold text-[13px] md:text-[15px] hover:bg-white/10 transition active:scale-95"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  <span>See More</span>
                </Link>

                {hasTrailer && (
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
                    className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  >
                    {isMuted ? (
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="m19 9-4 6" /><path d="m15 9 4 6" /></svg>
                    ) : (
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M19 9a5 5 0 0 1 0 6" /></svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ titles }: { titles: Title[] | undefined }) {
  const featured = clampFeatured(titles);
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    if (featured.length < 2) return;
    const timer = window.setInterval(() => {
      if (window.innerWidth < 1536) return;
      setIndex((current) => (current + 1) % featured.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [featured.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || window.innerWidth >= 1536) return;
    const onScroll = () => {
      if (isScrolling.current) return;
      const next = Math.round(el.scrollLeft / el.clientWidth);
      if (next >= 0 && next < featured.length) setIndex(next);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [featured.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || window.innerWidth < 1536) return;
    const active = el.children[index] as HTMLElement | undefined;
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [index]);

  if (!featured.length) return <div className="relative w-full h-[75vh] md:h-auto md:aspect-video max-h-[85vh] overflow-hidden bg-black animate-pulse" />;

  const selectSlide = (next: number) => {
    setIndex(next);
    const el = scrollerRef.current;
    if (!el || window.innerWidth >= 1536) return;
    isScrolling.current = true;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    window.setTimeout(() => { isScrolling.current = false; }, 700);
  };

  return (
    <section className="relative w-full h-[75vh] md:h-auto md:aspect-video max-h-[85vh] overflow-hidden group" data-testid="hero-section">
      <div ref={scrollerRef} className="flex 2xl:block w-full h-full overflow-x-auto 2xl:overflow-hidden snap-x snap-mandatory 2xl:snap-none scroll-smooth cursor-grab active:cursor-grabbing 2xl:cursor-default [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {featured.map((title, i) => <HeroSlide key={`${title.id}-${i}`} title={title} active={i === index} />)}
      </div>

      <div className="hidden 2xl:flex absolute right-12 bottom-[120px] z-[60] items-center gap-3">
        <button type="button" onClick={() => selectSlide((index - 1 + featured.length) % featured.length)} aria-label="Previous featured" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all pointer-events-auto hover:scale-105">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button type="button" onClick={() => selectSlide((index + 1) % featured.length)} aria-label="Next featured" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all pointer-events-auto hover:scale-105">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>

      {featured.length > 1 && (
        <div className="hidden 2xl:block absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl px-6 pointer-events-none">
          <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth py-2 justify-center">
            {featured.map((title, i) => (
              <button key={`${title.id}-${i}`} type="button" onClick={() => selectSlide(i)} className={`pointer-events-auto flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ${i === index ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-80 scale-95'}`} aria-label={`Show ${title.title}`}>
                <img src={title.backdropPath || title.posterPath || ''} alt={title.title} className="w-28 h-16 object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
