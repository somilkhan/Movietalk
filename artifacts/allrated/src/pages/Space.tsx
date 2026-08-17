import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Pencil, Play, Plus, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { useProfiles, DEFAULT_AVATARS } from '@/hooks/useProfiles';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { useMyWatchlist } from '@/hooks/useUserData';
import { useAuth } from '@/hooks/useAuth';
import { useAds } from '@/hooks/useAds';
import { Seo } from '@/components/Seo';

const imageOf = (value?: string | null, width = 'w500') => {
  if (!value) return '/placeholder-poster.jpg';
  return value.startsWith('http') ? value : `https://image.tmdb.org/t/p/${width}${value}`;
};

const TAGLINES = [
  "Look who's back. Don't you have a job or something?",
  "Grab your snacks. It's binge o'clock.",
  'Welcome back. Your queue missed you.',
  'Netflix and Chill? More like Bingr and finger... wait.',
];

function Starfield() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[430px] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-15%,#242424_0%,#090909_38%,#000_76%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-35" aria-hidden="true">
        <defs>
          <pattern id="space-stars" width="150" height="150" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="22" r="1" fill="white" opacity=".7" />
            <circle cx="72" cy="47" r=".7" fill="white" opacity=".45" />
            <circle cx="121" cy="25" r=".8" fill="white" opacity=".6" />
            <circle cx="38" cy="91" r=".8" fill="white" opacity=".5" />
            <circle cx="103" cy="111" r="1" fill="white" opacity=".35" />
            <circle cx="143" cy="82" r=".6" fill="white" opacity=".8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#space-stars)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/35 to-black" />
    </div>
  );
}

function ProfileAvatar({ src, name, selected, onClick }: { src: string; name: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex w-[72px] shrink-0 flex-col items-center gap-3 md:w-[120px]">
      <span className="relative block h-[72px] w-[72px] overflow-visible rounded-full md:h-[120px] md:w-[120px]">
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATARS[0]; }} />
        {selected && (
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-black bg-[#edf2f8] text-black md:h-8 md:w-8">
            <Check className="h-4 w-4 md:h-5 md:w-5" strokeWidth={3} />
          </span>
        )}
      </span>
      <span className="max-w-full truncate text-sm font-medium text-white/70 group-hover:text-white">{name}</span>
    </button>
  );
}

function ContinueCard({ item }: { item: any }) {
  const href = item.mediaType === 'tv'
    ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`
    : `/watch/movie/${item.id}`;
  const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
  return (
    <Link href={href} className="group block w-[220px] shrink-0 md:w-[260px] lg:w-[300px]">
      <div className="relative aspect-video overflow-hidden rounded-[5px] bg-[#17181b]">
        <img src={imageOf(item.backdropPath || item.posterPath, 'w780')} alt={item.title || ''} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20"><div className="h-full bg-[#fff]" style={{ width: `${progress}%` }} /></div>
        <Play className="absolute bottom-2.5 left-2.5 h-5 w-5 fill-white text-white" />
      </div>
      <p className="mt-2 truncate text-[14px] font-medium text-white/90">{item.episodeTitle || item.title || 'Untitled'}</p>
      <p className="mt-0.5 text-[12px] text-white/45">
        {item.mediaType === 'tv' ? `S${item.season || 1} E${item.episode || 1}` : 'Movie'}
        {item.timeLeft ? ` · ${item.timeLeft}m left` : ''}
      </p>
    </Link>
  );
}

function AvatarCarousel({ selected, onSelect }: { selected: string; onSelect: (avatar: string) => void }) {
  const selectedIndex = Math.max(0, DEFAULT_AVATARS.indexOf(selected));
  const [drag, setDrag] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);
  const move = (delta: number) => onSelect(DEFAULT_AVATARS[Math.max(0, Math.min(DEFAULT_AVATARS.length - 1, selectedIndex + delta))]);
  const end = () => {
    if (!dragging.current) return;
    const delta = drag;
    dragging.current = false;
    setDrag(0);
    if (Math.abs(delta) > 42) move(delta < 0 ? 1 : -1);
  };

  return (
    <div className="relative h-[224px] w-full overflow-hidden">
      <button type="button" aria-label="Previous avatar" onClick={() => move(-1)} disabled={selectedIndex === 0} className="absolute left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 p-3 text-white backdrop-blur-md disabled:opacity-0">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div
        className="absolute inset-0 touch-pan-y select-none overflow-hidden"
        onPointerDown={(e: PointerEvent<HTMLDivElement>) => { startX.current = e.clientX; dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e: PointerEvent<HTMLDivElement>) => { if (dragging.current) setDrag(Math.max(-130, Math.min(130, e.clientX - startX.current))); }}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div className="absolute left-1/2 top-1/2 flex items-center gap-5" style={{ transform: `translate(calc(-50px - ${selectedIndex * 120}px + ${drag}px), -50%)`, transition: dragging.current ? 'none' : 'transform 400ms cubic-bezier(0.22,0.9,0.3,1)' }}>
          {DEFAULT_AVATARS.map((avatar, index) => {
            const chosen = index === selectedIndex;
            const distance = Math.abs(index - selectedIndex);
            return (
              <button key={`${avatar}-${index}`} type="button" onClick={() => onSelect(avatar)} className="relative flex h-[100px] w-[100px] shrink-0 items-center justify-center" style={{ transform: `scale(${chosen ? 1.4 : 1})`, opacity: chosen ? 1 : Math.max(.14, 1 - distance * .19), transition: 'transform 400ms cubic-bezier(0.22,0.9,0.3,1), opacity 300ms' }}>
                <span className={`relative block h-20 w-20 overflow-visible rounded-full ${chosen ? 'ring-2 ring-white ring-offset-4 ring-offset-black' : ''}`}>
                  <img src={avatar} alt="" draggable={false} className="h-full w-full rounded-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATARS[0]; }} />
                  {chosen && <span className="absolute -bottom-1.5 -right-1.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-white text-black"><Check className="h-5 w-5" strokeWidth={3} /></span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <button type="button" aria-label="Next avatar" onClick={() => move(1)} disabled={selectedIndex === DEFAULT_AVATARS.length - 1} className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 p-3 text-white backdrop-blur-md disabled:opacity-0">
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}

export default function Space() {
  const { profile } = useAuth();
  const { showAds, setShowAds } = useAds();
  const { profiles, activeProfile, activeId, setActiveId, addProfile, updateProfile, deleteProfile, isHydrated } = useProfiles();
  const { items: continueItems, isLoading: continueLoading } = useContinueWatching();
  const { data: watchlist = [], isLoading: watchlistLoading } = useMyWatchlist(activeId);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);

  useEffect(() => {
    if (activeProfile) {
      setName(activeProfile.name);
      setAvatar(activeProfile.avatar);
    }
  }, [activeProfile]);

  const tagline = TAGLINES[Math.abs((activeProfile?.name || 'RabbitRip').charCodeAt(0)) % TAGLINES.length];
  const beginEdit = () => { if (!activeProfile) return; setName(activeProfile.name); setAvatar(activeProfile.avatar); setEditing(true); };
  const save = () => { const clean = name.trim(); if (!clean || !activeId) return; updateProfile(activeId, { name: clean, avatar }); setEditing(false); };
  const add = () => { const clean = name.trim(); if (!clean) return; addProfile(clean, avatar); setAdding(false); };
  const remove = () => { if (!activeId) return; if (window.confirm(`Delete ${activeProfile?.name || 'profile'}?`)) { deleteProfile(activeId); setEditing(false); } };

  if (!isHydrated) return <div className="min-h-screen bg-black" />;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black font-sans text-white" data-testid="page-space">
      <Seo title="My Space" />
      <Starfield />
      <main className="relative z-10 pb-24 md:pl-[80px] lg:pl-[100px]">
        <header className="flex w-full flex-col gap-6 px-6 pt-12 md:flex-row md:items-start md:justify-between md:px-12 md:pt-20">
          <div className="max-w-[600px]">
            <Link href="/home" className="flex items-start text-[18px] font-semibold leading-7 text-white/90">
              <span>{tagline}</span><ChevronRight className="mt-1 ml-1 h-5 w-5 shrink-0 text-white/55" />
            </Link>
            <p className="mt-1 text-[14px] font-medium text-white/55">{profile?.email || ''}</p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <Link href="/settings" className="flex items-center gap-3 rounded-lg bg-white/[0.06] px-5 py-3 text-[15px] font-medium text-white/90">
              <Settings className="h-5 w-5 text-white/65" /> Help &amp; Settings
            </Link>
            <label className="flex items-center gap-3 text-[14px] font-medium text-white/55">
              Show Ads
              <button type="button" aria-pressed={showAds} onClick={() => setShowAds(!showAds)} className={`relative h-6 w-11 rounded-full transition-colors ${showAds ? 'bg-white' : 'bg-white/20'}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-black transition-transform ${showAds ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
          </div>
        </header>

        <section className="mt-10 px-6 md:px-12">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Profiles</h1>
            <button type="button" onClick={beginEdit} className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-5 py-3 text-[15px] font-medium text-white/90"><Pencil className="h-5 w-5 text-white/65" /> Edit</button>
          </div>
          <div className="flex items-start gap-6 md:gap-8">
            {profiles.map((p) => <ProfileAvatar key={p.id} src={p.avatar} name={p.name} selected={p.id === activeId} onClick={() => setActiveId(p.id)} />)}
            <button type="button" onClick={() => { setName(''); setAvatar(DEFAULT_AVATARS[0]); setAdding(true); }} className="flex w-[72px] shrink-0 flex-col items-center gap-3 md:w-[120px]">
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-dashed border-white/25 bg-white/[0.02] md:h-[120px] md:w-[120px]"><Plus className="h-8 w-8 text-white/55" /></span>
              <span className="text-sm font-medium text-white/60">Add</span>
            </button>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 px-6 text-[22px] font-semibold md:px-12">Watchlist</h2>
          <div className="no-scrollbar flex gap-4 overflow-x-auto px-6 pb-2 md:px-12">
            {watchlistLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[225px] w-[150px] shrink-0 animate-pulse rounded-lg bg-white/[0.06] sm:h-[255px] sm:w-[170px]" />) : watchlist.map((item: any) => (
              <Link key={`${item.mediaType}-${item.titleId}`} href={`/title/${item.mediaType}/${item.titleId}`} className="group w-[150px] shrink-0 sm:w-[170px]">
                <div className="aspect-[2/3] overflow-hidden rounded-lg bg-white/[0.05]"><img src={imageOf(item.titleSnapshot?.posterPath)} alt={item.titleSnapshot?.title || ''} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /></div>
                <p className="mt-2 truncate text-[14px] font-medium text-white/85">{item.titleSnapshot?.title || 'Untitled'}</p>
              </Link>
            ))}
          </div>
        </section>

        {(continueLoading || continueItems.length > 0) && <section className="mt-10">
          <h2 className="mb-4 px-6 text-[22px] font-semibold md:px-12">Continue Watching</h2>
          <div className="no-scrollbar flex gap-4 overflow-x-auto px-6 pb-2 md:px-12">
            {continueLoading ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="aspect-video w-[220px] shrink-0 animate-pulse rounded-md bg-white/[0.06] md:w-[260px]" />) : continueItems.map((item) => <ContinueCard key={`${item.mediaType}-${item.id}-${item.season || ''}-${item.episode || ''}`} item={item} />)}
          </div>
        </section>}
      </main>

      {adding && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
        <div className="w-full max-w-[430px] rounded-[24px] border border-white/10 bg-[#111114] p-6">
          <h2 className="mb-5 text-xl font-semibold">Add profile</h2>
          <div className="mb-5 flex justify-center"><img src={avatar} alt="" className="h-24 w-24 rounded-full object-cover" /></div>
          <div className="mb-5 grid max-h-44 grid-cols-6 gap-3 overflow-y-auto">{DEFAULT_AVATARS.map((a, i) => <button key={`${a}-${i}`} type="button" onClick={() => setAvatar(a)} className={`h-11 w-11 overflow-hidden rounded-full ${avatar === a ? 'ring-2 ring-white' : ''}`}><img src={a} alt="" className="h-full w-full object-cover" /></button>)}</div>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Profile Name" className="mb-4 h-12 w-full rounded-lg border border-white/15 bg-transparent px-4 text-white outline-none placeholder:text-white/35" />
          <div className="flex gap-3"><button type="button" onClick={() => setAdding(false)} className="flex-1 rounded-lg bg-white/[0.06] py-3 font-medium">Cancel</button><button type="button" onClick={add} className="flex-1 rounded-lg bg-white py-3 font-semibold text-black">Save</button></div>
        </div>
      </div>}

      {editing && activeProfile && <div className="fixed inset-0 z-[100] overflow-y-auto bg-black text-white">
        <header className="flex h-[80px] items-center px-6">
          <button type="button" aria-label="Back" onClick={() => setEditing(false)} className="flex h-10 w-10 items-center justify-center rounded-full"><ArrowLeft className="h-6 w-6" /></button>
          <h2 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold leading-7">Edit Profile</h2>
        </header>
        <main className="mx-auto flex max-w-[760px] flex-col gap-12 px-4 pb-20">
          <div className="pt-16"><AvatarCarousel selected={avatar} onSelect={setAvatar} /></div>
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-[90px] w-full rounded-[10px] border border-white/15 bg-[#101012] px-5 text-[22px] font-medium text-white outline-none placeholder:text-white/30" placeholder="Profile name" />
          <div className="flex flex-col gap-6">
            <button type="button" onClick={save} className="h-[56px] w-full rounded-[10px] bg-white text-[16px] font-semibold text-black">Save &amp; Continue</button>
            <button type="button" onClick={remove} className="w-full py-2 text-[15px] font-medium text-red-500">Delete profile</button>
          </div>
        </main>
      </div>}
    </div>
  );
}
