import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Pencil, Play, Plus, Settings, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useProfiles, DEFAULT_AVATARS } from '@/hooks/useProfiles';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useAuth } from '@/hooks/useAuth';
import { useAds } from '@/hooks/useAds';
import { Seo } from '@/components/Seo';

const TAGLINES = [
  "Look who's back. Don't you have a job or something?",
  'Grab your snacks. It\'s binge o\'clock.',
  'Welcome back. Your queue missed you.',
  'Netflix and Chill? More like Bingr and finger... wait.',
];

const imageOf = (value?: string | null, width = 'w500') => {
  if (!value) return '/placeholder-poster.jpg';
  if (value.startsWith('http')) return value;
  return `https://image.tmdb.org/t/p/${width}${value}`;
};

function Stars() {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[350px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-black to-black" />
      <svg className="absolute h-full w-full opacity-40 mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="rabbit-space-stars" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle fill="white" cx="15" cy="15" r="1" opacity=".9" />
            <circle fill="white" cx="60" cy="35" r=".8" opacity=".5" />
            <circle fill="white" cx="100" cy="80" r="1.5" opacity=".3" />
            <circle fill="white" cx="30" cy="100" r="1" opacity=".7" />
            <circle fill="white" cx="110" cy="20" r=".8" opacity=".6" />
            <circle fill="white" cx="50" cy="75" r=".6" opacity=".8" />
            <circle fill="white" cx="8" cy="65" r="1.2" opacity=".4" />
            <circle fill="white" cx="85" cy="55" r=".8" opacity=".9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rabbit-space-stars)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black" />
    </div>
  );
}

function Avatar({ src, alt, selected, onClick }: { src: string; alt: string; selected?: boolean; onClick?: () => void }) {
  const body = (
    <div className="relative">
      <div className={`relative h-[72px] w-[72px] overflow-hidden rounded-full transition-all duration-300 md:h-[120px] md:w-[120px] ${selected ? 'ring-2 ring-white/40' : 'ring-1 ring-white/10'}`}>
        <img src={src} alt={alt} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATARS[0]; }} />
      </div>
      {selected && (
        <div className="absolute bottom-0 right-0 z-20 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-[#0f0f0f] bg-[#E2E8F0] shadow-lg md:h-9 md:w-9">
          <Check className="h-3.5 w-3.5 text-black md:h-5 md:w-5" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
  return onClick ? <button type="button" onClick={onClick} className="group flex shrink-0 flex-col items-center gap-3 outline-none">{body}<span className="text-sm font-semibold text-white/80 transition-colors group-hover:text-white">{alt}</span></button> : body;
}

function ProfileCarousel({ selected, onSelect }: { selected: string; onSelect: (avatar: string) => void }) {
  const selectedIndex = Math.max(0, DEFAULT_AVATARS.indexOf(selected));
  const [drag, setDrag] = useState(0);
  const start = useRef(0);
  const dragging = useRef(false);
  const move = (delta: number) => onSelect(DEFAULT_AVATARS[Math.max(0, Math.min(DEFAULT_AVATARS.length - 1, selectedIndex + delta))]);
  const finish = () => {
    if (!dragging.current) return;
    const d = drag;
    dragging.current = false;
    setDrag(0);
    if (Math.abs(d) > 50) move(d < 0 ? 1 : -1);
  };
  return (
    <div className="relative mx-auto flex w-full items-center justify-center overflow-hidden">
      <button type="button" aria-label="Previous" onClick={() => move(-1)} className="absolute left-4 z-10 rounded-full bg-black/40 p-3 text-white/50 backdrop-blur-sm transition hover:text-white disabled:opacity-30 md:left-8" disabled={selectedIndex === 0}><ChevronLeft className="h-6 w-6" /></button>
      <div
        className="relative flex h-[180px] w-full items-center justify-center overflow-hidden touch-pan-y select-none md:h-[230px]"
        onPointerDown={(e: PointerEvent<HTMLDivElement>) => { start.current = e.clientX; dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e: PointerEvent<HTMLDivElement>) => { if (dragging.current) setDrag(Math.max(-120, Math.min(120, e.clientX - start.current))); }}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        <div className="absolute left-1/2 top-1/2 flex items-center gap-5" style={{ transform: `translate(calc(-50px - ${selectedIndex * 120}px + ${drag}px), -50%)`, transition: dragging.current ? 'none' : 'transform 400ms cubic-bezier(0.22,0.9,0.3,1)' }}>
          {DEFAULT_AVATARS.map((avatar, index) => {
            const distance = Math.abs(index - selectedIndex);
            return (
              <button key={`${avatar}-${index}`} type="button" onClick={() => onSelect(avatar)} className="relative flex h-[100px] w-[100px] shrink-0 items-center justify-center outline-none" style={{ transform: `scale(${index === selectedIndex ? 1.4 : 1})`, opacity: index === selectedIndex ? 1 : Math.max(.14, 1 - distance * .19), transition: 'transform 400ms cubic-bezier(0.22,0.9,0.3,1), opacity 300ms' }}>
                <div className={`relative h-20 w-20 overflow-hidden rounded-full transition-all duration-300 ${index === selectedIndex ? 'ring-2 ring-white ring-offset-4 ring-offset-black' : 'opacity-60 hover:opacity-100'}`}>
                  <img src={avatar} alt="" draggable={false} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATARS[0]; }} />
                  {index === selectedIndex && <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-xl"><Check className="h-5 w-5" strokeWidth={3} /></span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <button type="button" aria-label="Next" onClick={() => move(1)} className="absolute right-4 z-10 rounded-full bg-black/40 p-3 text-white/50 backdrop-blur-sm transition hover:text-white disabled:opacity-30 md:right-8" disabled={selectedIndex === DEFAULT_AVATARS.length - 1}><ChevronRight className="h-6 w-6" /></button>
    </div>
  );
}

function ContinueCard({ item }: { item: any }) {
  const href = item.mediaType === 'tv' ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}` : `/watch/movie/${item.id}`;
  const title = item.title || item.episodeTitle || 'Untitled';
  const sub = item.mediaType === 'tv' ? `S${item.season || 1} E${item.episode || 1}` : 'Movie';
  const left = item.timeLeft || '';
  const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
  return (
    <Link href={href} className="group/card flex w-[220px] shrink-0 flex-col gap-2 outline-none md:w-[260px] lg:w-[300px]">
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[#1a1c20] transition-all duration-300">
        <img src={imageOf(item.backdropPath || item.posterPath, 'w780')} alt={title} loading="lazy" className="h-full w-full object-cover transition-all duration-500 ease-out group-hover/card:scale-105" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 z-10 flex items-center justify-center opacity-80 transition-opacity group-hover/card:opacity-100"><Play className="h-6 w-6 fill-current text-white drop-shadow-md" /></div>
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/20"><div className="h-full bg-[#1875e5]" style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="flex flex-col px-0.5">
        <h3 className="truncate text-[14px] font-semibold leading-snug text-white/90 transition-colors group-hover/card:text-white sm:text-[15px]">{item.episodeTitle || sub}</h3>
        <div className="mt-0.5 flex items-center text-[12px] font-medium text-white/50"><span className="mr-2 max-w-[60%] truncate">{item.title}</span><span>{left}</span></div>
      </div>
    </Link>
  );
}

export default function Space() {
  const [, navigate] = useLocation();
  const { profile, isLoggedIn } = useAuth();
  const { showAds, setShowAds } = useAds();
  const { profiles, activeProfile, activeId, setActiveId, addProfile, updateProfile, deleteProfile, isHydrated } = useProfiles();
  const { items: continueItems, isLoading: continueLoading } = useContinueWatching();
  const { watchlist, isLoading: watchlistLoading } = useWatchlist(isLoggedIn);
  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftAvatar, setDraftAvatar] = useState(DEFAULT_AVATARS[0]);

  useEffect(() => { if (activeProfile) { setDraftName(activeProfile.name); setDraftAvatar(activeProfile.avatar); } }, [activeProfile]);
  const tagline = TAGLINES[Math.abs((activeProfile?.name || 'RabbitRip').charCodeAt(0)) % TAGLINES.length];
  const save = () => { const name = draftName.trim(); if (!name) return; if (activeId) updateProfile(activeId, { name, avatar: draftAvatar }); setEditing(false); };
  const remove = () => { if (!activeId) return; if (window.confirm(`Delete ${activeProfile?.name || 'profile'}?`)) { deleteProfile(activeId); setEditing(false); } };
  const add = () => { const name = draftName.trim(); if (!name) return; addProfile(name, draftAvatar); setShowAdd(false); };

  if (!isHydrated) return <div className="min-h-screen bg-black" />;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black font-sans text-white" data-testid="page-space">
      <Seo title="My Space" />
      <Stars />
      <div className="relative z-10 pl-0 pt-12 pb-24 md:pl-[80px] md:pt-20 lg:pl-[100px]">
        <div className="mb-10 w-full px-6 md:px-12">
          <div className="flex w-full flex-col items-center justify-between gap-6 md:flex-row md:items-start">
            <div className="flex w-full flex-col gap-1 md:w-[60%]">
              <Link href="/settings/subscription" className="group relative flex h-[56px] w-full items-center sm:h-[32px]">
                <h2 className="absolute flex items-center text-lg font-semibold text-white/90 transition-colors group-hover:text-white sm:text-xl"><span className="line-clamp-2 sm:line-clamp-1">{tagline}</span><ChevronRight className="ml-1 h-5 w-5 shrink-0 text-white/60 transition group-hover:text-white/90 sm:ml-2" /></h2>
              </Link>
              <p className="mt-1 text-sm font-medium text-white/60 sm:mt-0">{profile?.email || ''}</p>
            </div>
            <div className="flex w-full flex-col items-end gap-4 self-start md:w-auto md:self-auto">
              <Link href="/settings"><button type="button" className="flex items-center gap-2 rounded-lg border border-transparent bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition-all hover:border-white/10 hover:bg-white/10"><Settings className="h-5 w-5 text-white/70" />Help &amp; Settings</button></Link>
              <div className="flex items-center gap-3"><span className="text-sm font-medium text-white/60">Show Ads</span><button type="button" aria-pressed={showAds} onClick={() => setShowAds(!showAds)} className={`relative h-5 w-10 shrink-0 rounded-full outline-none transition-colors ${showAds ? 'bg-white' : 'bg-white/15'}`}><div className={`absolute top-[2px] h-4 w-4 rounded-full bg-black transition-transform ${showAds ? 'translate-x-[22px]' : 'translate-x-0.5'}`} /></button></div>
            </div>
          </div>
        </div>

        <section className="mb-12 w-full px-6 md:px-12">
          <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-semibold tracking-tight text-white/90">Profiles</h2><button type="button" onClick={() => { if (activeProfile) { setDraftName(activeProfile.name); setDraftAvatar(activeProfile.avatar); } setEditing(true); }} className="flex items-center gap-2 rounded-lg border border-transparent bg-white/5 px-4 py-2 text-sm font-semibold transition-colors hover:border-white/10 hover:bg-white/10"><Pencil className="h-4 w-4 text-white/70" />Edit</button></div>
          <div className="flex flex-wrap items-start gap-5 md:gap-8">
            {profiles.map((item) => <Avatar key={item.id} src={item.avatar} alt={item.name} selected={item.id === activeId} onClick={() => setActiveId(item.id)} />)}
            <button type="button" onClick={() => { setDraftName(''); setDraftAvatar(DEFAULT_AVATARS[0]); setShowAdd(true); }} className="group flex flex-col items-center gap-3 outline-none"><div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-dashed border-white/20 bg-white/5 transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/10 md:h-[120px] md:w-[120px]"><Plus className="h-6 w-6 text-white/60 transition-colors group-hover:text-white md:h-8 md:w-8" /></div><span className="text-sm font-semibold text-white/60 transition-colors group-hover:text-white/90">Add</span></button>
          </div>
        </section>

        <section className="group/row relative mb-8">
          <h2 className="mb-3 px-6 text-lg font-semibold text-white/90 md:px-12">Watchlist</h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-6 py-4 md:px-12">
            {watchlistLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[255px] w-[150px] shrink-0 animate-pulse rounded-lg bg-white/5 sm:h-[290px] sm:w-[170px]" />) : watchlist.map((item) => (
              <Link key={`${item.mediaType}-${item.titleId}`} href={`/title/${item.mediaType}/${item.titleId}`} className="focusable group relative w-[150px] shrink-0 text-left transition-transform duration-200 sm:w-[170px] hover:z-10 hover:scale-105">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5 ring-2 ring-transparent transition-all group-hover:ring-white/30"><img alt={item.titleSnapshot?.title || ''} loading="lazy" className="h-full w-full object-cover" src={imageOf(item.titleSnapshot?.posterPath)} /></div>
                <div className="mt-2 truncate text-[14px] font-semibold tracking-tight text-white/90">{item.titleSnapshot?.title || 'Untitled'}</div>
                <div className="mt-1 flex items-center text-[11px] font-medium text-white/50"><span>{item.mediaType === 'tv' ? 'Series' : 'Movie'}</span></div>
              </Link>
            ))}
          </div>
        </section>

        {continueItems.length > 0 && <section className="group relative mb-8">
          <div className="mb-4 flex w-full items-center justify-between gap-3 px-6 text-lg font-semibold text-white/90 md:gap-4 md:px-12"><div className="flex items-center gap-4"><h2>Continue Watching for {activeProfile?.name || 'you'}</h2><button type="button" onClick={() => navigate('/profiles')} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/50 transition-all hover:bg-white/15 hover:text-white"><Pencil className="h-4 w-4" /></button></div></div>
          <div className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-6 py-4 md:px-12">{continueLoading ? null : continueItems.map((item) => <ContinueCard key={`${item.mediaType}-${item.id}-${item.season || ''}-${item.episode || ''}`} item={item} />)}</div>
        </section>}
      </div>

      {showAdd && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm"><div className="w-full max-w-[430px] rounded-[28px] border border-white/10 bg-[#111115] p-7 shadow-2xl"><div className="mb-7 flex items-center justify-between"><h2 className="text-[22px] font-semibold">Add profile</h2><button type="button" onClick={() => setShowAdd(false)} className="text-white/50">×</button></div><div className="mb-7 flex justify-center"><img src={draftAvatar} alt="Selected avatar" className="h-28 w-28 rounded-full object-cover ring-2 ring-white/20" /></div><div className="mb-7 grid max-h-52 grid-cols-6 gap-3 overflow-y-auto">{DEFAULT_AVATARS.map((avatar, i) => <button key={`${avatar}-${i}`} type="button" onClick={() => setDraftAvatar(avatar)} className={`h-12 w-12 overflow-hidden rounded-full ${draftAvatar === avatar ? 'ring-2 ring-white' : 'ring-1 ring-white/10'}`}><img src={avatar} alt="" className="h-full w-full object-cover" /></button>)}</div><input value={draftName} onChange={(e) => setDraftName(e.target.value)} maxLength={20} placeholder="Profile Name" className="mb-4 w-full rounded-lg border border-white/20 bg-transparent px-4 py-3.5 text-base text-white placeholder-white/40 outline-none focus:border-white" /><button type="button" onClick={add} disabled={!draftName.trim()} className="w-full rounded-lg bg-white py-4 text-sm font-semibold text-black disabled:opacity-40">Save &amp; Continue</button></div></div>}

      {editing && activeProfile && <div className="fixed inset-0 z-[90] flex flex-col bg-black font-sans text-white animate-[fadeIn_.2s_ease]">
        <div className="relative flex items-center justify-between px-6 py-5 md:px-12"><button type="button" onClick={() => setEditing(false)} className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"><ArrowLeft className="h-6 w-6" /></button><h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight text-white/90 md:text-xl">Edit Profile</h2><div className="w-10" /></div>
        <div className="flex flex-1 flex-col items-center justify-center gap-12 px-4 pb-20">
          <ProfileCarousel selected={draftAvatar} onSelect={setDraftAvatar} />
          <div className="w-full max-w-sm"><input value={draftName} onChange={(e) => setDraftName(e.target.value)} maxLength={20} placeholder="Profile Name" className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-3.5 text-base text-white placeholder-white/40 outline-none transition focus:border-white focus:bg-white/5" /></div>
          <button type="button" onClick={save} disabled={!draftName.trim()} className="w-full max-w-sm rounded-lg bg-white py-4 text-sm font-semibold text-black shadow-lg transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40">Save &amp; Continue</button>
          <button type="button" onClick={remove} className="text-sm font-medium text-red-400/80 transition hover:text-red-400">Delete profile</button>
        </div>
      </div>}
    </div>
  );
}
