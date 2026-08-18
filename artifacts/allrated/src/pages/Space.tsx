import { useEffect, useState } from 'react';
import { Check, ChevronRight, Pencil, Plus, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { useProfiles, DEFAULT_AVATARS } from '@/hooks/useProfiles';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { useMyWatchlist } from '@/hooks/useUserData';
import { useAuth } from '@/hooks/useAuth';
import { useAds } from '@/hooks/useAds';
import { Seo } from '@/components/Seo';

const GREETINGS = [
  'Welcome to Bingr. Where your social life comes to die.',
  "Grab your chimichangas and lube, it's binge o'clock!",
  'Netflix and Chill? More like Bingr and finger... wait.',
  "Unzip your pants and relax, we've got the good shit right here.",
  'Bingr: Cheaper than therapy, twice as addictive.',
  "Cancel your plans. You're not going anywhere anyway.",
  "Go ahead, hit Next Episode. We won't judge your lack of self-control.",
];

const imageOf = (value?: string | null, width = 'w500') => value ? (value.startsWith('http') ? value : `https://image.tmdb.org/t/p/${width}${value}`) : '/placeholder-poster.jpg';

function Starfield() {
  return (
    <div className="rr-space-stars pointer-events-none absolute left-0 right-0 top-0 z-0 h-[350px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-black to-black" />
      <svg className="absolute h-full w-full opacity-40 mix-blend-screen" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs><pattern id="rabbit-star-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <circle fill="#fff" cx="15" cy="15" r="1" opacity=".9" /><circle fill="#fff" cx="60" cy="35" r=".8" opacity=".5" /><circle fill="#fff" cx="100" cy="80" r="1.5" opacity=".3" /><circle fill="#fff" cx="30" cy="100" r="1" opacity=".7" /><circle fill="#fff" cx="110" cy="20" r=".8" opacity=".6" /><circle fill="#fff" cx="50" cy="75" r=".6" opacity=".8" /><circle fill="#fff" cx="8" cy="65" r="1.2" opacity=".4" /><circle fill="#fff" cx="85" cy="55" r=".8" opacity=".9" />
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#rabbit-star-pattern)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black" />
    </div>
  );
}

function ProfileAvatar({ src, name, selected }: { src: string; name: string; selected: boolean }) {
  return (
    <button type="button" className="group flex flex-col items-center gap-3 outline-none">
      <span className="rr-space-profile relative block overflow-visible">
        <span className={`block h-full w-full overflow-hidden rounded-full transition-all duration-300 ${selected ? 'ring-2 ring-white/40' : 'ring-1 ring-transparent'} group-hover:ring-2 group-hover:ring-white/50`}>
          <img src={src} alt={name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(event) => { event.currentTarget.src = DEFAULT_AVATARS[0]; }} />
        </span>
        {selected && <span className="absolute bottom-0 right-0 z-20 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-[#0f0f0f] bg-[#E2E8F0] text-black shadow-lg md:h-9 md:w-9"><Check className="h-3.5 w-3.5 md:h-5 md:w-5" strokeWidth={2.5} /></span>}
      </span>
      <span className="text-sm font-semibold text-white/80 transition-colors group-hover:text-white">{name}</span>
    </button>
  );
}

function PosterTray({ title, items, loading }: { title: string; items: any[]; loading: boolean }) {
  if (!loading && items.length === 0) return null;
  return (
    <section className="group/row relative mb-8">
      <h2 className="mb-3 px-6 text-lg font-semibold text-white/90 md:px-12">{title}</h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-6 py-4 md:px-12">
        {loading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[2/3] w-[150px] shrink-0 animate-pulse rounded-lg bg-white/5 md:w-[170px]" />) : items.map((item: any) => (
          <Link key={`${item.mediaType}-${item.titleId}`} href={`/title/${item.mediaType}/${item.titleId}`} className="group/card w-[150px] shrink-0 md:w-[170px]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/5 transition-all duration-300 group-hover/card:-translate-y-1 group-hover/card:ring-white/20">
              <img src={imageOf(item.titleSnapshot?.posterPath)} alt={item.titleSnapshot?.title || ''} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/65 to-transparent" />
            </div>
            <div className="mt-2 truncate text-[14px] font-semibold text-white/90">{item.titleSnapshot?.title || ''}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ContinueTray({ items, loading, profileName }: { items: any[]; loading: boolean; profileName?: string }) {
  if (!loading && items.length === 0) return null;
  return (
    <section className="relative mb-8">
      <div className="mb-4 flex items-center gap-4 px-6 md:px-12">
        <h2 className="text-lg font-semibold text-white/90">Continue Watching for {profileName || 'You'}</h2>
        <Link href="/profiles?edit=1" className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/50 transition hover:bg-white/15 hover:text-white" aria-label="Edit profile"><Pencil className="h-4 w-4" /></Link>
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-6 py-4 md:px-12">
        {loading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="aspect-video w-[220px] shrink-0 animate-pulse rounded-md bg-[#1a1c20] md:w-[260px] lg:w-[300px]" />) : items.map((item: any) => {
          const progress = Math.min(100, Math.max(0, Number(item.progress) || 0));
          const href = item.mediaType === 'tv' ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}` : item.mediaType === 'anime' ? `/watch/anime/${item.id}/${item.episode || 1}` : `/watch/movie/${item.id}`;
          return (
            <Link key={`${item.mediaType}-${item.id}-${item.season || ''}-${item.episode || ''}`} href={href} className="group/card flex w-[220px] shrink-0 flex-col gap-2 md:w-[260px] lg:w-[300px]">
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[#1a1c20]">
                <img src={imageOf(item.backdropPath || item.posterPath, 'w780')} alt={item.title || ''} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20"><div className="h-full bg-[#1875e5]" style={{ width: `${progress}%` }} /></div>
              </div>
              <h3 className="truncate px-0.5 text-[14px] font-semibold leading-snug text-white/90">{item.mediaType === 'tv' ? `S${item.season || 1} E${item.episode || 1}` : item.title || ''}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function Space() {
  const { profile } = useAuth();
  const { showAds, setShowAds } = useAds();
  const { profiles, activeProfile, activeId, setActiveId, isHydrated } = useProfiles();
  const { items: continueItems, isLoading: continueLoading } = useContinueWatching();
  const { data: watchlist = [], isLoading: watchlistLoading } = useMyWatchlist(activeId);
  const [greetingIndex, setGreetingIndex] = useState(() => Math.floor(Math.random() * GREETINGS.length));

  useEffect(() => { if (!activeId && profiles[0]) setActiveId(profiles[0].id); }, [activeId, profiles, setActiveId]);
  useEffect(() => { const timer = window.setInterval(() => setGreetingIndex((value) => (value + 1) % GREETINGS.length), 4500); return () => window.clearInterval(timer); }, []);

  if (!isHydrated) return <div className="min-h-screen bg-black" />;
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black font-sans text-white" data-testid="page-space">
      <Seo title="My Space" /><Starfield />
      <main className="rr-space-main relative z-10 pb-24 md:pb-8 md:pl-[80px] lg:pl-[100px]">
        <div className="px-6 pt-12 md:px-12 md:pt-20">
          <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex w-full flex-col gap-1 md:w-[60%]">
              <Link href="/settings/subscription" className="group relative flex h-[56px] w-full items-center sm:h-[32px]"><h2 key={greetingIndex} className="rr-space-greeting-text text-lg font-semibold text-white/90 sm:text-xl">{GREETINGS[greetingIndex]}<ChevronRight className="ml-1 inline h-5 w-5 text-white/60 transition group-hover:text-white/90" /></h2></Link>
              <p className="text-sm font-medium text-white/60">{profile?.email || ''}</p>
            </div>
            <div className="flex w-full flex-col items-end gap-4 md:w-auto">
              <Link href="/settings" className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"><Settings className="h-5 w-5 text-white/70" />Help &amp; Settings</Link>
              <div className="flex items-center gap-3"><span className="text-sm font-medium text-white/60">Show Ads</span><button type="button" aria-pressed={showAds} onClick={() => setShowAds(!showAds)} className={`relative h-5 w-10 rounded-full transition-colors ${showAds ? 'bg-white' : 'bg-white/20'}`}><span className={`absolute top-[2px] h-4 w-4 rounded-full bg-black transition-transform ${showAds ? 'translate-x-[22px]' : 'translate-x-0.5'}`} /></button></div>
            </div>
          </div>
        </div>
        <section className="mb-12 mt-10 px-6 md:px-12">
          <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-semibold tracking-tight text-white/90">Profiles</h2><Link href="/profiles?edit=1" className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"><Pencil className="h-4 w-4 text-white/70" />Edit</Link></div>
          <div className="flex flex-wrap items-start gap-5 md:gap-8">
            {profiles.map((item) => <button key={item.id} type="button" onClick={() => setActiveId(item.id)}><ProfileAvatar src={item.avatar} name={item.name} selected={item.id === activeId} /></button>)}
            {profiles.length < 3 && <Link href="/profiles" className="group flex flex-col items-center gap-3 outline-none"><span className="rr-space-profile flex items-center justify-center rounded-full border border-dashed border-white/20 bg-white/5 transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/10"><Plus className="h-6 w-6 text-white/60 md:h-8 md:w-8" /></span><span className="text-sm font-semibold text-white/60 group-hover:text-white/90">Add</span></Link>}
          </div>
        </section>
        <PosterTray title="Watchlist" items={watchlist as any[]} loading={watchlistLoading} />
        <ContinueTray items={continueItems as any[]} loading={continueLoading} profileName={activeProfile?.name} />
      </main>
    </div>
  );
}
