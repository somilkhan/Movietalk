import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  href: string;
}

interface CategoryTrayProps {
  categories: Category[];
  activeId?: string;
  className?: string;
}

export function CategoryTray({ categories, activeId, className }: CategoryTrayProps) {
  return (
    <div
      className={cn(
        'flex overflow-x-auto snap-x snap-mandatory gap-2 px-4 md:px-8 pb-2 no-scrollbar',
        className
      )}
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <Link
            key={cat.id}
            href={cat.href}
            className={cn(
              'snap-start shrink-0 px-4 py-1.5 rounded-full text-xs font-medium',
              'transition-all duration-200 whitespace-nowrap cursor-pointer',
              isActive
                ? 'bg-[#00bb7f] text-[#07070b]'
                : 'bg-[#ffffff0d] text-[#ffffffb3] hover:bg-[#ffffff1a] hover:text-white border border-[#ffffff0d]'
            )}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
