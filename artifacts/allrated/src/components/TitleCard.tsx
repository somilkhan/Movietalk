import { useState, memo } from 'react';
import { Link } from 'wouter';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildImageUrl } from '@/lib/imageUrl';
import type { Title } from '@workspace/api-client-react';

interface TitleCardProps {
  title: Title;
  progress?: number;
  isInWatchlist?: boolean;
  onWatchlistToggle?: (id: number, type: string) => void;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
}

const CARD_WIDTH = {
  sm: 'w-[112px] sm:w-[128px] md:w-[140px] lg:w-[156px]',
  md: 'w-[130px] sm:w-[145px] md:w-[160px] lg:w-[185px]',
  lg: 'w-[145px] sm:w-[165px] md:w-[185px] lg:w-[210px]',
} as const;

function TitleCardComponent({
  title: titleObj,
  progress,
  isInWatchlist,
  onWatchlistToggle,
  index = 0,
  size = 'md',
}: TitleCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { id, mediaType, title, posterPath, voteAverage, year } = titleObj;
  const posterUrl = buildImageUrl(posterPath, 'w500') ?? '/placeholder-poster.jpg';
  const posterUrlWebp = posterPath ? `${buildImageUrl(posterPath, 'w500')}?format=webp` : null;
  const srcSet = posterPath ? `${buildImageUrl(posterPath, 'w500')} 500w` : undefined;
  const typeLabel = mediaType === 'movie' ? 'Movie' : mediaType === 'tv' ? 'TV' : mediaType;

  return (
    <Link
      href={`/title/${mediaType}/${id}`}
      className={cn('flex-shrink-0 group/card relative cursor-pointer rounded-lg focus-visible:outline-none', CARD_WIDTH[size])}
      aria-label={`${title}${year ? ` (${year})` : ''}`}
    >
      <div className="relative flex flex-col w-full" data-testid="title-card">
        <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-[#1a1c24] ring-1 ring-white/5 transition-all duration-300 group-hover/card:ring-white/20 group-hover/card:-translate-y-1">
          {!imageLoaded && !imageError && <div className="absolute inset-0 bg-[#1a1c24] animate-pulse" aria-hidden="true" />}
          {posterUrlWebp ? (
            <picture>
              <source srcSet={posterUrlWebp} type="image/webp" sizes="(max-width: 640px) 130px, (max-width: 768px) 160px, 185px" />
              <img
                src={posterUrl}
                alt={title}
                srcSet={srcSet}
                sizes="(max-width: 640px) 130px, (max-width: 768px) 160px, 185px"
                loading={index < 6 ? 'eager' : 'lazy'}
                decoding="async"
                className={cn('w-full h-full object-cover transition-opacity duration-300', imageLoaded ? 'opacity-100' : 'opacity-0')}
                onLoad={() => setImageLoaded(true)}
                onError={() => { setImageError(true); setImageLoaded(true); }}
              />
            </picture>
          ) : (
            <img
              src={posterUrl}
              alt={title}
              loading={index < 6 ? 'eager' : 'lazy'}
              decoding="async"
              className={cn('w-full h-full object-cover', imageLoaded ? 'opacity-100' : 'opacity-0')}
              onLoad={() => setImageLoaded(true)}
              onError={() => { setImageError(true); setImageLoaded(true); }}
            />
          )}
          {imageError && (
            <div className="absolute inset-0 bg-[#1a1c24] flex items-center justify-center" aria-hidden="true">
              <span className="text-white/40 text-xs text-center px-2">{title}</span>
            </div>
          )}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden" aria-label={`${Math.round(progress)}% watched`}>
              <div className="h-full bg-[#4752c4] transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          )}
          {isInWatchlist && (
            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#4752c4] flex items-center justify-center shadow-lg" aria-label="In My List">
              <Bookmark className="w-3 h-3 text-black fill-current" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="mt-2 truncate text-[14px] font-semibold text-white/90 tracking-tight">{title}</div>
        <div className="flex items-center mt-1 text-[11px] font-medium text-white/50 min-h-4">
          {voteAverage !== undefined && voteAverage > 0 && (
            <span className="flex items-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white" className="mr-1" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {voteAverage.toFixed(1)}
            </span>
          )}
          {year && <><span className="mx-1.5 text-white/30" aria-hidden="true">·</span><span>{year}</span></>}
          <span className="mx-1.5 text-white/30" aria-hidden="true">·</span>
          <span>{typeLabel}</span>
        </div>
      </div>
    </Link>
  );
}

export const TitleCard = memo(TitleCardComponent);

export function NumberedTitleCard({ title, index }: { title: Title; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { id, mediaType, posterPath } = title;
  const posterUrl = buildImageUrl(posterPath, 'w500') ?? '/placeholder-poster.jpg';

  return (
    <Link href={`/title/${mediaType}/${id}`} className="flex-shrink-0 group/card relative flex items-center pr-2 lg:pr-6 cursor-pointer rounded-lg focus-visible:outline-none" aria-label={`${title.title}, ranked ${index + 1}`}>
      <div className="select-none z-10 pl-2 lg:pl-4 text-[100px] md:text-[120px] lg:text-[140px]" style={{ fontFamily: '"Alfa Slab One", "Arial Black", Impact, sans-serif', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.05em', marginRight: '-10px', transform: 'scaleX(1.2)', transformOrigin: 'left center', background: 'linear-gradient(to right, rgb(255,255,255) 0%, rgb(255,255,255) 40%, rgba(255,255,255,0) 100%) padding-box text', WebkitTextFillColor: 'transparent' }} aria-hidden="true">
        {index + 1}
      </div>
      <div className="relative flex flex-col w-[110px] sm:w-[130px] lg:w-[160px] z-20 shrink-0">
        <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-[#1a1c24] ring-1 ring-white/5 transition-all duration-300 group-hover/card:ring-white/20 group-hover/card:-translate-y-1">
          {!imageLoaded && !imageError && <div className="absolute inset-0 bg-[#1a1c24] animate-pulse" aria-hidden="true" />}
          <img src={posterUrl} alt={title.title} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" className={cn('w-full h-full object-cover transition-opacity duration-300', imageLoaded ? 'opacity-100' : 'opacity-0')} onLoad={() => setImageLoaded(true)} onError={() => { setImageError(true); setImageLoaded(true); }} />
          {imageError && <div className="absolute inset-0 bg-[#1a1c24] flex items-center justify-center" aria-hidden="true"><span className="text-white/40 text-xs text-center px-2">{title.title}</span></div>}
        </div>
      </div>
    </Link>
  );
}
