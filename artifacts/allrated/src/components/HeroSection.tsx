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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLIFrameElement>(null);
  const title = featured?.[index];

  useEffect(() => {
    setLogoPath(null); setBackdropError(false); setTrailerUrl(null); setYoutubeKey(null); setIsPlaying(true); setIsMuted(true);
    if (!title) return;
    const ctrl = new AbortController();
    fetch(`/api/catalog/title/${title.mediaType}/${title.id}/logo`, { signal: ctrl.signal }).then(r => r.ok ? r.json() : null).then(data => data?.logoPath ? setLogoPath(data.logoPath) : null).catch(() => {});
    fetch(`/api/catalog/title/${title.mediaType}/${title.id}/trailer`, { signal: ctrl.signal }).then(r => r.ok ? r.json() : null).then(data => { if (data?.url) setTrailerUrl(data.url); else if (data?.key) setYoutubeKey(data.key); }).catch(() => {});
    return () => ctrl.abort();
  }, [title?.id, title?.mediaType]);

  useEffect(() => {
    if (!trailerUrl || !videoRef.current) return;
    videoRef.current.muted = true;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [trailerUrl]);

  if (!title) return <div className="relative w-full h-[75vh] md:aspect-video max-h-[85vh] overflow-hidden bg-black animate-pulse" />;
  const genres = getGenreNames(title.genreIds ?? [], 4);
  const backdropUrl = title.backdropPath || title.posterPath;
  const youtubeEmbed = youtubeKey ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeKey)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${encodeURIComponent(youtubeKey)}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1` : null;
  const postYoutube = (func: string, args: unknown[] = []) => youtubeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), 'https://www.youtube-nocookie.com');
  const togglePlay = async () => {
    if (trailerUrl && videoRef.current) { if (videoRef.current.paused) { try { await videoRef.current.play(); setIsPlaying(true); } catch { setIsPlaying(false); } } else { videoRef.current.pause(); setIsPlaying(false); } }
    else if (youtubeKey) { postYoutube(isPlaying ? 'pauseVideo' : 'playVideo'); setIsPlaying(v => !v); }
  };
  const toggleMute = () => {
    if (trailerUrl && videoRef.current) { videoRef.current.muted = !videoRef.current.muted; setIsMuted(videoRef.current.muted); if (!videoRef.current.muted) videoRef.current.volume = 1; }
    else if (youtubeKey) { postYoutube(isMuted ? 'unMute' : 'mute'); setIsMuted(v => !v); }
  };
  const hasTrailer = Boolean(trailerUrl || youtubeKey);

  return (
    <section className="relative w-full h-[75vh] md:h-auto md:aspect-video max-h-[85vh] overflow-hidden group" data-testid="hero-section">
      {trailerUrl && !backdropError ? <div className="absolute inset-0 z-0 bg-black overflow-hidden"><video ref={videoRef} src={trailerUrl} autoPlay loop playsInline muted disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" className="w-full h-full object-cover object-center opacity-90 animate-in fade-in duration-1000 scale-[1.35]" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onError={() => setBackdropError(true)} /></div> : youtubeEmbed && !backdropError ? <div className="absolute inset-0 z-0 bg-black overflow-hidden pointer-events-none"><iframe ref={youtubeRef} src={youtubeEmbed} title={`${title.title} trailer`} className="absolute left-1/2 top-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full -translate-x-1/2 -translate-y-1/2 scale-[1.35] opacity-90" allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" onError={() => setBackdropError(true)} /></div> : <><img src={backdropUrl || ''} alt={title.title} className={`absolute inset-0 h-full w-full object-cover z-0 ${!backdropUrl || backdropError ? 'hidden' : ''}`} onError={() => setBackdropError(true)} />{(!backdropUrl || backdropError) && <div className="absolute inset-0 bg-black z-0" />}</>}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent w-[50%] md:w-[65%] pointer-events-none z-[1] transition-opacity duration-1000 opacity-0 md:opacity-100" />
      <div className="absolute top-5 left-5 z-20 md:hidden"><svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg></div>
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 md:pb-16 md:pl-[100px] lg:pl-[120px] pointer-events-none z-10"><div className="flex flex-col gap-3 max-w-2xl">{logoPath ? <img src={logoPath} alt={title.title} className="h-16 md:h-24 object-contain object-left drop-shadow-2xl" onError={() => setLogoPath(null)} /> : <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg leading-tight">{title.title}</h1>}<div className="flex items-center gap-2 text-sm md:text-base text-white/80">{title.voteAverage > 0 && <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l5.25 2.76L17 21.02l-1.18-6.88L21 9.27l-6.91-1.01L12 2z"/></svg>{title.voteAverage.toFixed(1)}</span>}{title.voteAverage > 0 && title.releaseDate && <span className="text-white/40">·</span>}{title.releaseDate && <span>{new Date(title.releaseDate).getFullYear()}</span>}{genres.length > 0 && <><span className="text-white/40">·</span><span className="truncate">{genres.join(' · ')}</span></>}</div>{title.overview && <p className="text-sm md:text-base text-white/70 line-clamp-3 max-w-xl leading-relaxed">{title.overview}</p>}<div className="flex items-center gap-3 mt-2 pointer-events-auto"><Link href={`/watch/${title.mediaType}/${title.id}`} className="flex items-center justify-center w-14 h-14 rounded-full bg-white text-black hover:bg-white/90 transition-transform hover:scale-105 active:scale-95" aria-label={`Play ${title.title}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5v14l11-7z"/></svg></Link><Link href={`/title/${title.mediaType}/${title.id}`} className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>See More</Link></div></div></div>
      {hasTrailer && !backdropError && <div className="absolute right-5 bottom-[92px] md:right-8 md:bottom-28 z-30 flex items-center gap-2 pointer-events-auto"><button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause trailer' : 'Play trailer'} className="w-11 h-11 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg">{isPlaying ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}</button><button type="button" onClick={toggleMute} aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'} className="w-11 h-11 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg">{isMuted ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m19 9-4 6"/><path d="m15 9 4 6"/></svg> : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M19 9a5 5 0 0 1 0 6"/><path d="M15 12h.01"/></svg>}</button></div>}
      {featured.length > 1 && <div className="hidden md:block absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl px-6"><div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth py-2">{featured.map((t, i) => <button key={`${t.id}-${i}`} onClick={() => setIndex(i)} className={`flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ${i === index ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-80 scale-95'}`}><img src={t.backdropPath || t.posterPath || ''} alt={t.title} className="w-28 h-16 object-cover" /></button>)}</div></div>}
    </section>
  );
}
