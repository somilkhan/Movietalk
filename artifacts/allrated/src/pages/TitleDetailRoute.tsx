import { useEffect } from "react";
import TitleDetail from "@/pages/TitleDetail";

export default function TitleDetailRoute() {
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

  return <TitleDetail />;
}
