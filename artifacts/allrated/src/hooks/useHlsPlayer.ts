import { useRef, useEffect, useCallback, useState, type RefObject } from 'react';
import Hls from 'hls.js';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const PROXY = `${BASE}/api/proxy?url=`;
export interface HlsAudioTrack { id: number; label: string; language: string; }

export function useHlsPlayer(videoRef: RefObject<HTMLVideoElement | null>, onFatalErrorRef: RefObject<(() => void) | null>) {
  const hlsRef = useRef<Hls | null>(null);
  const [audioTracks, setAudioTracks] = useState<HlsAudioTrack[]>([]);
  const load = useCallback((src: string, type: string) => {
    const video = videoRef.current; if (!video) return;
    hlsRef.current?.destroy(); hlsRef.current = null; setAudioTracks([]);
    video.preload = 'auto'; video.playsInline = true; video.setAttribute('playsinline',''); video.removeAttribute('src'); video.load();
    const isHls = type === 'hls' || src.includes('.m3u8');
    const safePlay = () => { void video.play().catch(() => {}); };
    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ fetchSetup(context, init) { return new Request(PROXY + encodeURIComponent(context.url), init); }, maxBufferLength: 16, maxMaxBufferLength: 60, startLevel: 0, abrEwmaDefaultEstimate: 8_000_000, enableWorker: true, lowLatencyMode: false, backBufferLength: 45 });
      hlsRef.current = hls;
      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => setAudioTracks(data.audioTracks.map((track, id) => ({ id, label: track.name || track.lang || `Track ${id + 1}`, language: track.lang || track.name || 'unknown' }))));
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) { try { hls.startLoad(); return; } catch {} }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) { try { hls.recoverMediaError(); return; } catch {} }
        hls.destroy(); hlsRef.current = null; setAudioTracks([]); onFatalErrorRef.current?.();
      });
      hls.loadSource(src); hls.attachMedia(video); hls.on(Hls.Events.MANIFEST_PARSED, safePlay);
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && isHls) {
      video.src = src; video.addEventListener('loadeddata', safePlay, { once: true }); video.onerror = () => onFatalErrorRef.current?.();
      video.load();
    } else {
      video.src = src ? (src.startsWith('http') ? PROXY + encodeURIComponent(src) : src) : ''; video.addEventListener('loadeddata', safePlay, { once: true }); video.onerror = () => onFatalErrorRef.current?.(); video.load();
    }
  }, [videoRef, onFatalErrorRef]);
  const selectAudioTrack = useCallback((trackId: number) => { if (hlsRef.current && trackId >= 0 && trackId < hlsRef.current.audioTracks.length) { hlsRef.current.audioTrack = trackId; return true; } return false; }, []);
  useEffect(() => () => { hlsRef.current?.destroy(); }, []);
  return { load, audioTracks, selectAudioTrack };
}
