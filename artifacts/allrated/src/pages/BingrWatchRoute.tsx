import { useEffect, useState } from "react";
import { Maximize } from "lucide-react";
import BingrWatch from "@/pages/BingrWatch";

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export default function BingrWatchRoute() {
  const [ios, setIos] = useState(false);
  useEffect(() => { setIos(isIOS()); }, []);

  const openNativeFullscreen = () => {
    const video = document.querySelector("video");
    if (!(video instanceof HTMLVideoElement)) return;
    const nativeVideo = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    if (nativeVideo.webkitEnterFullscreen) {
      try { nativeVideo.webkitEnterFullscreen(); } catch {}
      return;
    }
    const root = document.querySelector('[data-testid="bingr-player"]') as HTMLElement | null;
    if (root?.requestFullscreen) void root.requestFullscreen().catch(() => undefined);
  };

  return <><BingrWatch />{ios && <button type="button" onClick={openNativeFullscreen} className="fixed bottom-24 right-5 z-[500] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/65 text-white shadow-2xl backdrop-blur-xl md:bottom-8 md:right-8" aria-label="Enter fullscreen"><Maximize className="h-5 w-5" /></button>}</>;
}
