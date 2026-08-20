import { useEffect, useState } from 'react';
import { Maximize } from 'lucide-react';
import RabbitPlayer from '@/pages/RabbitPlayer';
import PlayerStabilityBridge from '@/components/PlayerStabilityBridge';

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function RabbitPlayerRoute() {
  const [ios, setIos] = useState(false);
  useEffect(() => { setIos(isIOS()); }, []);
  const openNativeFullscreen = () => {
    const video = document.querySelector('video');
    if (!(video instanceof HTMLVideoElement)) return;
    const native = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    if (native.webkitEnterFullscreen) { try { native.webkitEnterFullscreen(); } catch {} return; }
    const root = document.querySelector('[data-testid="rabbit-player"]') as HTMLElement | null;
    if (root?.requestFullscreen) void root.requestFullscreen().catch(() => undefined);
  };
  return <><RabbitPlayer /><PlayerStabilityBridge />{ios && <button type="button" onClick={openNativeFullscreen} className="fixed bottom-24 right-5 z-[500] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/65 text-white shadow-2xl backdrop-blur-xl md:bottom-8 md:right-8" aria-label="Enter fullscreen"><Maximize className="h-5 w-5" /></button>}</>;
}
