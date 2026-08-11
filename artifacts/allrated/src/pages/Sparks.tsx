import { useState, useRef, useEffect, useCallback } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX } from "lucide-react";
import { Seo } from "@/components/Seo";

const SPARKS = [
  {
    id: 1,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    title: "Epic Movie Moments",
    creator: "@bingr_official",
    likes: 12400,
    comments: 892,
  },
  {
    id: 2,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    title: "Behind the Scenes",
    creator: "@filmgeek",
    likes: 8300,
    comments: 421,
  },
  {
    id: 3,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Top 10 Action Scenes",
    creator: "@actiondaily",
    likes: 25600,
    comments: 1543,
  },
];

export default function Sparks() {
  const [muted, setMuted] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  // ── IntersectionObserver — play/pause based on visibility ────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => {});
            video.muted = muted;
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      { threshold: [0.6] },
    );

    const videos = container.querySelectorAll("video");
    videos.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, [muted]);

  // Re-apply muted state to all videos when toggled
  useEffect(() => {
    containerRef.current?.querySelectorAll("video").forEach((v) => {
      v.muted = muted;
    });
  }, [muted]);

  // ── Pull-to-refresh touch handlers ────────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    const container = containerRef.current;
    if (!container || refreshing) return;
    if (container.scrollTop === 0) {
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0) setPullDistance(Math.min(delta * 0.5, 80));
    }
  }

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 1500);
    } else {
      setPullDistance(0);
    }
  }, [pullDistance]);

  return (
    <div className="h-[calc(100dvh-56px)] w-full bg-black relative overflow-hidden pb-14" data-testid="page-sparks">
      <Seo title="Sparks" />

      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center pointer-events-none"
          style={{ transform: `translateY(${pullDistance}px)`, height: 40 }}
        >
          <div
            className={`w-7 h-7 border-2 rounded-full transition-all ${
              refreshing
                ? "border-[#4752c4] border-t-transparent animate-spin"
                : "border-white/30"
            }`}
          />
        </div>
      )}

      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="h-[calc(100dvh-56px)] w-full snap-y snap-mandatory overflow-y-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined }}
      >
        {SPARKS.map((spark) => (
          <div
            key={spark.id}
            className="h-full w-full snap-center relative flex items-center justify-center bg-black"
          >
            <video
              src={spark.videoUrl}
              className="h-full w-full object-cover"
              loop
              playsInline
              muted={muted}
              onClick={() => setMuted((m) => !m)}
            />

            {/* Mute toggle */}
            <button
              onClick={() => setMuted((m) => !m)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Right-side actions */}
            <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-10">
              <button className="flex flex-col items-center gap-1 text-white" aria-label="Like">
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">{(spark.likes / 1000).toFixed(1)}k</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-white" aria-label="Comments">
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">{(spark.comments / 1000).toFixed(1)}k</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-white" aria-label="Save">
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform">
                  <Bookmark className="w-5 h-5" />
                </div>
              </button>
              <button className="flex flex-col items-center gap-1 text-white" aria-label="Share">
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform">
                  <Share2 className="w-5 h-5" />
                </div>
              </button>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-6 left-4 right-20 z-10">
              <h3 className="text-white font-bold text-base mb-0.5">{spark.title}</h3>
              <p className="text-white/70 text-sm">{spark.creator}</p>
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
