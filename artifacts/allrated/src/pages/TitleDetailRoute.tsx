import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'wouter';
import TitleDetail from '@/pages/TitleDetail';
import DetailStreamPlayer from '@/components/DetailStreamPlayer';

interface WatchSelection {
  mediaType: 'movie' | 'tv';
  id: number;
  season?: number;
  episode?: number;
}

export default function TitleDetailRoute() {
  const params = useParams<{ mediaType: string; id: string }>();
  const [watch, setWatch] = useState<WatchSelection | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      let url: URL;
      try { url = new URL(anchor.href, window.location.origin); } catch { return; }
      if (!url.pathname.startsWith('/watch/')) return;
      const parts = url.pathname.split('/').filter(Boolean);
      const mediaType = parts[1] === 'tv' ? 'tv' : parts[1] === 'movie' ? 'movie' : null;
      const id = Number(parts[2]);
      if (!mediaType || !Number.isFinite(id)) return;
      event.preventDefault();
      event.stopPropagation();
      const season = parts[3] ? Number(parts[3]) : undefined;
      const episode = parts[4] ? Number(parts[4]) : undefined;
      setWatch({
        mediaType,
        id,
        season: mediaType === 'tv' && Number.isFinite(season) ? season : undefined,
        episode: mediaType === 'tv' && Number.isFinite(episode) ? episode : undefined,
      });
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  useEffect(() => {
    const enhance = () => {
      const root = document.querySelector('[data-testid="page-title-detail"]');
      if (!(root instanceof HTMLElement)) return;
      const hero = root.firstElementChild;
      if (hero instanceof HTMLElement) {
        hero.style.height = window.matchMedia('(max-width: 767px)').matches ? '72vh' : 'min(78vh, 860px)';
        hero.style.minHeight = window.matchMedia('(max-width: 767px)').matches ? '560px' : '620px';
      }
      const iframe = root.querySelector('iframe[title="Trailer"]');
      if (!(iframe instanceof HTMLIFrameElement)) return;
      try {
        const url = new URL(iframe.src, window.location.origin);
        url.searchParams.set('enablejsapi', '1');
        url.searchParams.set('origin', window.location.origin);
        if (iframe.src !== url.toString()) iframe.src = url.toString();
      } catch {}
    };
    enhance();
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', enhance);
    return () => { observer.disconnect(); window.removeEventListener('resize', enhance); };
  }, []);

  useEffect(() => {
    if (!watch) return;
    const root = document.querySelector('[data-testid="page-title-detail"]');
    if (!(root instanceof HTMLElement)) return;
    const hero = root.firstElementChild;
    if (!(hero instanceof Element)) return;
    const slot = document.createElement('div');
    slot.setAttribute('data-detail-stream-slot', 'true');
    hero.insertAdjacentElement('afterend', slot);
    requestAnimationFrame(() => slot.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    return () => slot.remove();
  }, [watch]);

  useEffect(() => {
    if (!watch) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setWatch(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [watch]);

  const selection = watch ?? null;
  const detailMediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const detailId = Number(params.id);

  return (
    <>
      <TitleDetail />
      {selection ? createPortal(
        <DetailStreamPlayer
          mediaType={selection.mediaType}
          id={selection.id}
          season={selection.season}
          episode={selection.episode}
          onClose={() => setWatch(null)}
        />,
        document.querySelector('[data-detail-stream-slot]') ?? document.body,
      ) : null}
    </>
  );
}
