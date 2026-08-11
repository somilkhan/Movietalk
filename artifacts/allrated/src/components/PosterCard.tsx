import { useState } from 'react';
import { Link } from 'wouter';
import type { Title } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';

interface PosterCardProps {
  title: Title;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function PosterCard({ title, index, size = 'md' }: PosterCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const mediaTypeLabel = title.mediaType === 'movie' ? 'Movie' : title.mediaType === 'tv' ? 'Series' : 'Anime';

  const sizeClasses = {
    sm: 'w-[120px] md:w-[160px]',
    md: 'w-[130px] md:w-[200px]',
    lg: 'w-[160px] md:w-[260px]',
  };

  return (
    <Link href={`/title/${title.mediaType}/${title.id}`} className={cn(
        "group relative flex-shrink-0 cursor-pointer select-none",
        "snap-start snap-always",
        sizeClasses[size]
      )}>
        <div className={cn(
          "relative overflow-hidden rounded-xl bg-[#1a1a1a]",
          "aspect-[2/3]"
        )}>
          {/* HUGE Number - positioned behind image, bottom-left, partially cut off */}
          {index !== undefined && (
            <div className="absolute -bottom-3 -left-2 z-0 pointer-events-none">
              <span 
                className="text-white font-black leading-none block"
                style={{
                  fontSize: 'clamp(70px, 18vw, 100px)',
                  fontFamily: "'Bebas Neue', Impact, system-ui, sans-serif",
                  textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 0 50px rgba(0,0,0,0.7)',
                  WebkitTextStroke: '1px rgba(0,0,0,0.3)',
                }}
              >
                {index + 1}
              </span>
            </div>
          )}

          {/* Skeleton loader */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 animate-shimmer z-[1]" />
          )}

          {/* Poster image - on top of number */}
          {title.posterPath ? (
            <img
              src={title.posterPath}
              alt={title.title}
              loading="lazy"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out z-[2]",
                imgLoaded ? 'opacity-100' : 'opacity-0',
                "group-hover:scale-105"
              )}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] z-[2]">
              <span className="text-white/20 text-xs text-center px-2">{title.title}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-[3]" />

          {/* Rating badge - green bg, black text, top right */}
          {title.voteAverage && (
            <div className="absolute top-2 right-2 z-[4]">
              <span className="inline-flex items-center gap-0.5 bg-[#00d084] text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {title.voteAverage.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Title + metadata below poster */}
        <div className="mt-2 px-0.5">
          <p className="text-white/90 text-[13px] font-semibold truncate">
            {title.title}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-white/50">
            {title.voteAverage && (
              <>
                <span className="text-white">★ {title.voteAverage.toFixed(1)}</span>
                <span className="text-white/30">·</span>
              </>
            )}
            {title.year && <span>{title.year}</span>}
            <span className="text-white/30">·</span>
            <span>{mediaTypeLabel}</span>
          </div>
        </div>
    </Link>
  );
}
