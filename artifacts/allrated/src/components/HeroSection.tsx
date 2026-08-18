import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'wouter';
import type { Title } from '@workspace/api-client-react';
import { getGenreNames } from '@/lib/tmdbGenres';

export function HeroSection({ titles }: { titles: Title[] | undefined }) {
  const [index, setIndex] = useState(0);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const title = Array.isArray(titles) ? titles[index] : undefined;
  const items = useMemo(() => (titles || []).slice(0, 8), [titles]);
  const next = items.length ? items[(index + 1) % items.length] : undefined;

  useEffect(() => {
    if (!items.length) return;
    if (index >= items.length) setIndex(0);
  }, [index, items.length]);

  useEffect(() => {
    setLogoPath(null); setTrailerUrl(null); setPlaying(true);
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
    if (items.length < 2 || !playing) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % items.length), 9000);
    return () => window.clearInterval(timer);
  }, [items.length, playing]);

  if (!title) return <section className="relative w-full bg-black min-h-[72vh] animate-pulse" data-testid="hero-section" />;

  const genres = getGenreNames(title.genreIds ?? [], 4);
  const mediaRoute = title.mediaType === 'movie' ? 'movie' : title.mediaType === 'tv' ? 'tv' : 'anime';
  const backdrop = title.backdropPath || title.posterPath;
  const go = (delta: number) => setIndex((current) => (current + delta + items.length) % items.length);

  return (
    <section className="relative w-full overflow-hidden bg-[#07070b]" data-testid="hero-section">
      <div className="absolute inset-0 z-0 bg-black">
        {trailerUrl ? <video src={trailerUrl} autoPlay loop playsInline muted={muted} className="rr-hero-media opacity-[.94]" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} /> : backdrop ? <img src={backdrop} alt="" className="rr-hero-media opacity-[.94]" /> : null}
      </div>
      <div className="rr-hero-gradient-x z-[1] pointer-events-none" />
      <div className="rr-hero-gradient-y z-[1] pointer-events-none" />

      <div className="rr-hero-content">
        {logoPath ? <img src={logoPath} alt={title.title} className="rr-hero-logo mb-6" onError={() => setLogoPath(null)} /> : <h1 className="rr-hero-title mb-5">{title.title}</h1>}
        <div className="rr-hero-meta mb-4 flex flex-wrap items-center gap-2 font-medium">
          {title.voteAverage > 0 && <span className="font-semibold text-white">★ {title.voteAverage.toFixed(1)}</span>}
          {title.releaseDate && <><span className="text-white/30">·</span><span>{new Date(title.releaseDate).getFullYear()}</span></>}
          {genres.length > 0 && <><span className="text-white/30">·</span><span>{genres.join(' · ')}</span></>}
        </div>
        {title.overview && <p className="rr-hero-description mb-6 line-clamp-3">{title.overview}</p>}
        <div className="flex items-center gap-3">
          <Link href={`/watch/${mediaRoute}/${title.id}`} aria-label={`Watch ${title.title}`} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl transition hover:scale-105 active:scale-95 md:h-14 md:w-14"><Play className="h-5 w-5 fill-current translate-x-[1px]" /></Link>
          <Link href={`/${mediaRoute}/${title.id}`} className="flex h-12 items-center rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15 active:scale-[.99] md:h-14">See More</Link>
        </div>
      </div>

      {items.length > 1 && <>
        <div className="rr-hero-next">
          <button type="button" className="rr-hero-arrow" onClick={() => go(-1)} aria-label="Previous featured"><ChevronLeft className="h-4 w-4" /></button>
          <span>Next</span>
          {next?.posterPath && <img src={next.posterPath} alt="" />}
          <button type="button" className="rr-hero-arrow" onClick={() => go(1)} aria-label="Next featured"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="rr-hero-dots">{items.map((item, i) => <button key={`${item.id}-${i}`} type="button" aria-label={`Featured ${item.title}`} onClick={() => setIndex(i)} className={`rr-hero-dot ${i === index ? 'active' : ''}`} />)}</div>
      </>}

      <div className="rr-hero-controls">
        <button type="button" className="rr-hero-control" aria-label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted((value) => !value)}>{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
        <button type="button" className="rr-hero-control" aria-label={playing ? 'Pause' : 'Play'} onClick={() => { const video = document.querySelector('[data-testid="hero-section"] video') as HTMLVideoElement | null; if (video) { if (video.paused) void video.play(); else video.pause(); } setPlaying((value) => !value); }}>{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
      </div>
    </section>
  );
}
