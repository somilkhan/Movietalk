import { useGetTrending } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/useAuth';
import { useWatchlist } from '@/hooks/useWatchlist';
import { ContentTray } from '@/components/ContentTray';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Space() {
  const { isLoggedIn } = useAuth();
  const { watchlist } = useWatchlist(isLoggedIn);
  const trending = useGetTrending({ mediaType: 'all', window: 'week' });

  return (
    <div className="pb-28 md:pb-0 pt-20 md:pt-24 px-6 md:px-12" data-testid="page-space">
      <Seo title="My Space" />
      <div className="max-w-2xl mb-10">
        <h1
          className="text-white text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: "'Bebas Neue', 'Anton', Impact, system-ui, sans-serif" }}
        >
          My Space
        </h1>
        <p className="text-white/60 text-base md:text-lg">
          Your watchlist, history, and personal collection.
        </p>
      </div>

      {isLoggedIn && watchlist.length > 0 ? (
        <ContentTray
          heading="My Watchlist"
          titles={watchlist}
          viewAllHref="/watchlist"
        />
      ) : (
        <div className="mb-10 p-8 rounded-2xl bg-[#1a1c24] border border-white/10 text-center">
          <p className="text-white/60 mb-4">Sign in to save titles to your watchlist.</p>
          <Link href="/auth">
            <Button className="rounded-full px-6">Sign In</Button>
          </Link>
        </div>
      )}

      <ContentTray
        heading="Trending For You"
        titles={trending.data}
        loading={trending.isLoading}
      />
    </div>
  );
}
