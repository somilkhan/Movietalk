import { useRef, useEffect, useCallback, type RefObject } from 'react';
import Hls from 'hls.js';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const PROXY = `${BASE}/api/proxy?url=`;

export function useHlsPlayer(
  videoRef: RefObject<HTMLVideoElement | null>,
  onFatalErrorRef: RefObject<(() => void) | null>,
) {
  const hlsRef = useRef<Hls | null>(null);

  const load = useCallback((src: string, type: string) => {
    const video = videoRef.current;
    if (!video) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    video.removeAttribute('src');
    video.load();
    const isHls = type === 'hls' || src.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        fetchSetup(context, init) {
          return new Request(PROXY + encodeURIComponent(context.url), init);
        },
        maxBufferLength: 20,
        maxMaxBufferLength: 60,
        startLevel: -1,
        abrEwmaDefaultEstimate: 5_000_000,
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          hls.destroy();
          hlsRef.current = null;
          onFatalErrorRef.current?.();
        }
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && isHls) {
      video.src = src;
      video.play().catch(() => {});
      video.onerror = () => onFatalErrorRef.current?.();
    } else {
      video.src = src ? (src.startsWith('http') ? PROXY + encodeURIComponent(src) : src) : '';
      video.play().catch(() => {});
      video.onerror = () => onFatalErrorRef.current?.();
    }
  }, [videoRef, onFatalErrorRef]);

  useEffect(() => () => { hlsRef.current?.destroy(); }, []);
  return { load };
}
