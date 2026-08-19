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
    setLogoPath(null);
    setTrailerUrl(null);
    setPlaying(true);
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

  if (!title) return <section className="relative w-full min-h-[70dvh] bg-black animate-pulse" data-testid="hero-section" />;

  const genres = getGenreNames(title.genreIds ?? [], 4);
  const mediaRoute = title.mediaType === 'movie' ? 'movie' : title.mediaType === 'tv' ? 'tv' : 'anime';
  const backdrop = title.backdropPath || title.posterPath;
  const go = (delta: number) => setIndex((current) => (current + delta + items.length) % items.length);

  return (
    <section className="relative isolate w-full min-h-[720px] h-[78vh] max-h-[900px] overflow-hidden bg-black text-white" data-testid="hero-section">
      <div className="absolute inset-0 z-0 bg-black">
        {trailerUrl ? (
          <video src={trailerUrl} autoPlay loop playsInline muted={muted} className="absolute inset-0 h-full w-full object-cover object-center opacity-95" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
        ) : backdrop ? (
          <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-95" />
        ) : null}
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,0,0,.92)_0%,rgba(0,0,0,.68)_28%,rgba(0,0,0,.18)_65%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(0deg,#000_0%,rgba(0,0,0,.92)_9%,rgba(0,0,0,.35)_42%,transparent_76%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_75%_35%,transparent_0%,rgba(0,0,0,.12)_48%,rgba(0,0,0,.35)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 z-[2] flex max-w-[760px] flex-col px-5 pb-12 pt-32 sm:px-8 sm:pb-16 md:left-[100px] md:right-auto md:px-0 md:pb-24 lg:left-[140px] lg:pb-28">
        {logoPath ? (
          <img src={logoPath} alt={title.title} className="mb-5 max-h-24 w-auto max-w-[min(72vw,430px)] object-contain object-left-bottom drop-shadow-2xl md:max-h-32" onError={() => setLogoPath(null)} />
        ) : (
          <h1 className="mb-4 max-w-[720px] text-[clamp(2.2rem,5vw,4.8rem)] font-bold leading-[.96] tracking-[-.045em] drop-shadow-2xl">{title.title}</h1>
        )}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] font-medium text-white/70 sm:text-[13px]">
          {title.voteAverage > 0 && <span className="font-semibold text-white">★ {title.voteAverage.toFixed(1)}</span>}
          {title.releaseDate && <><span className="text-white/30">·</span><span>{new Date(title.releaseDate).getFullYear()}</span></>}
          {genres.length > 0 && <><span className="text-white/30">·</span><span>{genres.join(' · ')}</span></>}
        </div>
        {title.overview && <p className="mb-6 line-clamp-3 max-w-[650px] text-[13px] leading-6 text-white/65 sm:text-[14px] sm:leading-6">{title.overview}</p>}
        <div className="flex items-center gap-3">
          <Link href={`/watch/${mediaRoute}/${title.id}`} aria-label={`Watch ${title.title}`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-2xl transition hover:scale-105 active:scale-95 md:h-14 md:w-14"><Play className="h-5 w-5 fill-current translate-x-[1px]" /></Link>
          <Link href={`/${mediaRoute}/${title.id}`} className="flex h-12 items-center rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15 active:scale-[.99] md:h-14">See More</Link>
        </div>
      </div>

      {items.length > 1 && <>
        <div className="absolute bottom-8 right-5 z-[3] hidden items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] font-semibold text-white/60 backdrop-blur-xl sm:flex md:bottom-12 md:right-8">
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-xl text-white/65 transition hover:bg-white/10 hover:text-white" onClick={() => go(-1)} aria-label="Previous featured"><ChevronLeft className="h-4 w-4" /></button>
          <span className="min-w-9 text-center">Next</span>
          {next?.posterPath && <img src={next.posterPath} alt="" className="h-10 w-7 rounded object-cover" />}
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-xl text-white/65 transition hover:bg-white/10 hover:text-white" onClick={() => go(1)} aria-label="Next featured"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="absolute bottom-5 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-1.5 sm:bottom-8">
          {items.map((item, i) => <button key={`${item.id}-${i}`} type="button" aria-label={`Featured ${item.title}`} onClick={() => setIndex(i)} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/60'}`} />)}
        </div>
      </>}

      <div className="absolute right-5 top-20 z-[3] flex items-center gap-2 md:right-8 md:top-24">
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 backdrop-blur-xl transition hover:bg-white/10 hover:text-white" aria-label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted((value) => !value)}>{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 backdrop-blur-xl transition hover:bg-white/10 hover:text-white" aria-label={playing ? 'Pause' : 'Play'} onClick={() => { const video = document.querySelector('[data-testid="hero-section"] video') as HTMLVideoElement | null; if (video) { if (video.paused) void video.play(); else video.pause(); } setPlaying((value) => !value); }}>{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
      </div>
    </section>
  );
}
