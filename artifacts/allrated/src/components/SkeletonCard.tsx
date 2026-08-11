import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  aspectRatio?: string;
}

export function SkeletonCard({
  className,
  aspectRatio = '2/3',
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'shrink-0 w-[110px] sm:w-[130px] md:w-[160px] lg:w-[185px]',
        className
      )}
    >
      <div
        className="rounded-lg bg-[#2e3140] animate-pulse"
        style={{ aspectRatio }}
      />
      <div className="mt-2 h-3 bg-[#2e3140] rounded animate-pulse w-3/4" />
      <div className="mt-1 h-2 bg-[#2e3140] rounded animate-pulse w-1/2" />
    </div>
  );
}

interface SkeletonTrayProps {
  count?: number;
  title?: string;
}

export function SkeletonTray({ count = 8, title = 'Loading…' }: SkeletonTrayProps) {
  return (
    <section className="mb-10">
      <div className="px-6 lg:px-20 mb-4 flex items-center">
        <div className="h-5 bg-[#2e3140] rounded animate-pulse w-32" aria-label={title} />
      </div>
      <div className="flex gap-3 px-6 lg:px-20 pb-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}
