import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Settings, Trash2, Check, Play } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useProfiles, DEFAULT_AVATARS } from '@/hooks/useProfiles';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useAuth } from '@/hooks/useAuth';
import { useAds } from '@/hooks/useAds';
import { Seo } from '@/components/Seo';

const TAGLINES = [
  "Look who's back. Don't you have a job or something?",
  'Welcome back. Your queue missed you.',
  'Netflix and Chill? More like Bingr and finger... wait.',
  'Bingr: Cheaper than therapy, twice as addictive.',
];

type EditState = { id: string | null; isNew: boolean } | null;

const imageOf = (value?: string | null) => {
  if (!value) return '/placeholder-poster.jpg';
  if (value.startsWith('http')) return value;
  return `https://image.tmdb.org/t/p/w500${value}`;
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
      <div className="h-full bg-white" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function Avatar({
  src,
  name,
  selected,
  size = 'normal',
  onClick,
}: {
  src: string;
  name: string;
  selected?: boolean;
  size?: 'normal' | 'selected';
  onClick?: () => void;
}) {
  const button = (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full transition-all duration-300 ${
        size === 'selected'
          ? 'h-24 w-24 scale-[1.4] ring-2 ring-white ring-offset-4 ring-offset-[#07070b]'
          : 'h-20 w-20'
      }`}
      style={{ opacity: selected || size === 'selected' ? 1 : 0.48 }}
    >
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover"
        draggable={false}
        onError={(event) => {
          event.currentTarget.src = '/brand/logo.png';
        }}
      />
      {selected && (
        <span className="absolute bottom-0 right-0 flex h-9 w-9 translate-x-1 translate-y-1 items-center justify-center rounded-full border-2 border-[#07070b] bg-white text-black shadow-xl">
          <Check className="h-5 w-5 stroke-[3]" />
        </span>
      )}
    </div>
  );
  return onClick ? <button type="button" onClick={onClick} className="shrink-0">{button}</button> : button;
}

function AvatarCarousel({
  avatars,
  selected,
  onSelect,
}: {
  avatars: string[];
  selected: string;
  onSelect: (avatar: string) => void;
}) {
  const selectedIndex = Math.max(0, avatars.indexOf(selected));
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);
  const SLOT = 120;
  const visible = avatars.map((avatar, index) => {
    const distance = Math.abs(index - selectedIndex);
    return { avatar, index, distance };
  }).filter(({ distance }) => distance <= 2);

  const move = (direction: -1 | 1) => {
    const next = (selectedIndex + direction + avatars.length) % avatars.length;
    onSelect(avatars[next]);
  };

  const finishDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const offset = dragOffset;
    setDragOffset(0);
    if (Math.abs(offset) >= 42) move(offset < 0 ? 1 : -1);
  };

  return (
    <div className="relative h-56 w-full select-none overflow-hidden touch-pan-y">
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="Previous avatar"
        className="absolute left-0 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#111116] text-white/80 shadow-xl md:left-6"
      >
        <ChevronLeft className="h-7 w-7" />
      </button>

      <div
        className="absolute left-1/2 top-1/2 flex items-center gap-5 cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(calc(-50px - ${selectedIndex * SLOT}px + ${dragOffset}px), -50%)`,
          transition: dragging.current ? 'none' : 'transform 400ms cubic-bezier(0.22,0.9,0.3,1)',
        }}
        onPointerDown={(event) => {
          startX.current = event.clientX;
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (startX.current !== null && dragging.current) setDragOffset(event.clientX - startX.current);
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        {visible.map(({ avatar, index, distance }) => (
          <div key={`${avatar}-${index}`} className="flex h-[100px] w-[100px] shrink-0 items-center justify-center">
            <Avatar
              src={avatar}
              name="Profile avatar"
              selected={avatar === selected}
              size={avatar === selected ? 'selected' : 'normal'}
              onClick={() => onSelect(avatar)}
            />
            {distance > 0 && (
              <style>{`[data-avatar-index="${index}"]{opacity:${Math.max(0.14, 1 - distance * 0.19)}}`}</style>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => move(1)}
        aria-label="Next avatar"
        className="absolute right-0 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#111116] text-white/80 shadow-xl md:right-6"
      >
        <ChevronRight className="h-7 w-7" />
      </button>
    </div>
  );
}

export default function Space() {
  const [, navigate] = useLocation();
  const { profile, isLoggedIn } = useAuth();
  const { showAds, setShowAds } = useAds();
  const { profiles, activeProfile, activeId, setActiveId, addProfile, updateProfile, deleteProfile, isHydrated } = useProfiles();
  const { items: continueItems, isLoading: continueLoading } = useContinueWatching();
  const { watchlist, isLoading: watchlistLoading } = useWatchlist(isLoggedIn);
  const [edit, setEdit] = useState<EditState>(null);
  const [draftName, setDraftName] = useState('');
  const [draftAvatar, setDraftAvatar] = useState(DEFAULT_AVATARS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeProfile?.avatar) setDraftAvatar(activeProfile.avatar);
  }, [activeProfile?.avatar]);

  const tagline = TAGLINES[Math.abs((activeProfile?.name || 'RabbitRip').charCodeAt(0)) % TAGLINES.length];
  const avatars = useMemo(() => {
    if (draftAvatar && !DEFAULT_AVATARS.includes(draftAvatar)) return [draftAvatar, ...DEFAULT_AVATARS];
    return DEFAULT_AVATARS;
  }, [draftAvatar]);

  if (!isHydrated) return <div className="min-h-screen bg-[#07070b]" />;

  const openEdit = (id: string) => {
    const target = profiles.find((item) => item.id === id);
    if (!target) return;
    setEdit({ id, isNew: false });
    setDraftName(target.name);
    setDraftAvatar(target.avatar);
  };

  const openAdd = () => {
    setEdit({ id: null, isNew: true });
    setDraftName('');
    setDraftAvatar(DEFAULT_AVATARS[0]);
  };

  const closeEdit = () => {
    if (saving) return;
    setEdit(null);
    setDraftName('');
    setDraftAvatar(activeProfile?.avatar || DEFAULT_AVATARS[0]);
  };

  const saveProfile = () => {
    const name = draftName.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      if (edit?.isNew) {
        addProfile(name, draftAvatar);
      } else if (edit?.id) {
        updateProfile(edit.id, { name, avatar: draftAvatar });
      }
      setEdit(null);
    } finally {
      setSaving(false);
    }
  };

  const removeProfile = () => {
    if (!edit?.id) return;
    const target = profiles.find((item) => item.id === edit.id);
    if (!target || !window.confirm(`Delete ${target.name}?`)) return;
    deleteProfile(target.id);
    setEdit(null);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-28" data-testid="page-space">
      <Seo title="My Space" />

      <main className="mx-auto w-full max-w-[1180px] px-6 pt-10 md:px-12 md:pt-14">
        <header className="relative mb-14">
          <div className="absolute inset-x-[-48px] top-[-56px] -z-10 h-[300px] overflow-hidden bg-[radial-gradient(circle_at_15%_30%,rgba(255,255,255,.07),transparent_20%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,.035),transparent_18%)] opacity-80" />
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-[680px]">
              <p className="text-[18px] font-semibold leading-7 text-white/95 md:text-[25px] md:leading-9">{tagline}</p>
              <p className="mt-3 text-[15px] text-white/55 md:text-base">{profile?.email || ''}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/[0.055] text-white/70 transition hover:bg-white/[0.09] hover:text-white"
              aria-label="Help & Settings"
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pr-1">
            <span className="text-sm font-medium text-white/55">Show Ads</span>
            <button
              type="button"
              role="switch"
              aria-checked={showAds}
              onClick={() => setShowAds(!showAds)}
              className={`relative h-7 w-12 rounded-full transition-colors ${showAds ? 'bg-white' : 'bg-white/15'}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-black shadow-md transition-transform ${showAds ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </header>

        <section className="mb-14">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="text-[28px] font-bold tracking-tight md:text-[32px]">Profiles</h2>
            <button
              type="button"
              onClick={() => activeId && openEdit(activeId)}
              disabled={!activeId}
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.055] px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[0.09] hover:text-white disabled:opacity-30"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </div>

          <div className="flex items-start gap-8 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {profiles.map((item) => {
              const selected = item.id === activeId;
              return (
                <button key={item.id} type="button" onClick={() => setActiveId(item.id)} className="group flex w-[88px] shrink-0 flex-col items-center gap-3 text-center md:w-[96px]">
                  <div className={`relative h-[76px] w-[76px] overflow-hidden rounded-full border transition-all md:h-[88px] md:w-[88px] ${selected ? 'border-white/70' : 'border-white/10 group-hover:border-white/35'}`}>
                    <img src={item.avatar} alt={item.name} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = '/brand/logo.png'; }} />
                    {selected && <span className="absolute bottom-[-1px] right-[-1px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-lg"><Check className="h-4 w-4 stroke-[3]" /></span>}
                  </div>
                  <span className={`max-w-full truncate text-sm font-semibold ${selected ? 'text-white' : 'text-white/55'}`}>{item.name}</span>
                </button>
              );
            })}
            <button type="button" onClick={openAdd} className="group flex w-[88px] shrink-0 flex-col items-center gap-3 md:w-[96px]">
              <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full border border-dashed border-white/20 bg-white/[0.015] transition group-hover:border-white/40 group-hover:bg-white/[0.04] md:h-[88px] md:w-[88px]"><Plus className="h-8 w-8 text-white/45 group-hover:text-white" /></span>
              <span className="text-sm font-semibold text-white/45 group-hover:text-white/80">Add</span>
            </button>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[25px] font-bold tracking-tight md:text-[28px]">Watchlist</h2>
            <span className="text-sm text-white/30">{watchlistLoading ? '' : watchlist.length || ''}</span>
          </div>
          {watchlistLoading ? (
            <div className="flex gap-5 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-[330px] w-[170px] shrink-0 animate-pulse rounded-xl bg-white/[0.04] md:h-[380px] md:w-[200px]" />)}
            </div>
          ) : watchlist.length ? (
            <div className="flex gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {watchlist.map((item) => (
                <Link key={`${item.mediaType}-${item.titleId}`} href={`/title/${item.mediaType}/${item.titleId}`} className="group w-[170px] shrink-0 md:w-[200px]">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/5">
                    <img src={imageOf(item.titleSnapshot?.posterPath)} alt={item.titleSnapshot?.title || 'Watchlist item'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <h3 className="mt-2.5 truncate text-[15px] font-semibold text-white/90">{item.titleSnapshot?.title || 'Untitled'}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-8 text-sm text-white/35">Your watchlist is empty.</p>
          )}
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[25px] font-bold tracking-tight md:text-[28px]">Continue Watching</h2>
            <span className="text-sm text-white/30">{activeProfile?.name || ''}</span>
          </div>
          {continueLoading && !continueItems.length ? (
            <div className="flex gap-4 overflow-hidden"><div className="h-[130px] w-[230px] shrink-0 animate-pulse rounded-xl bg-white/[0.04] md:h-[160px] md:w-[280px]" /></div>
          ) : continueItems.length ? (
            <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {continueItems.slice(0, 20).map((item) => (
                <Link key={`${item.mediaType}-${item.id}-${item.season || 0}-${item.episode || 0}`} href={item.mediaType === 'movie' ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`} className="group w-[230px] shrink-0 md:w-[280px]">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                    <img src={imageOf(item.backdropPath || item.posterPath)} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg"><Play className="ml-0.5 h-4 w-4 fill-current" /></div>
                    <ProgressBar value={item.progress} />
                  </div>
                  <h3 className="mt-2 truncate text-sm font-semibold text-white/90">{item.mediaType === 'tv' && item.episode ? `S${item.season || 1} E${item.episode} • ${item.title}` : item.title}</h3>
                  <p className="mt-0.5 text-xs text-white/40">{item.timeLeft ? `${item.timeLeft}m left` : `${Math.round(item.progress)}% watched`}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-8 text-sm text-white/35">Nothing here yet. Start watching something and it will appear here.</p>
          )}
        </section>
      </main>

      {edit && (
        <div className="fixed inset-0 z-[100] min-h-screen overflow-y-auto bg-[#07070b] text-white" role="dialog" aria-modal="true">
          <div className="mx-auto flex min-h-screen w-full max-w-[760px] flex-col px-6 py-7 md:px-10">
            <header className="relative flex h-12 shrink-0 items-center justify-center">
              <button type="button" onClick={closeEdit} className="absolute left-0 flex items-center gap-1 rounded-full px-2 py-2 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Back"><ChevronLeft className="h-7 w-7" /><span className="text-base">Back</span></button>
              <h2 className="text-xl font-bold md:text-2xl">Edit Profile</h2>
              <button type="button" onClick={closeEdit} className="absolute right-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-black">Done</button>
            </header>

            <div className="flex flex-1 flex-col items-center justify-center pb-12 pt-8">
              <div className="w-full max-w-[620px]">
                <AvatarCarousel avatars={avatars} selected={draftAvatar} onSelect={setDraftAvatar} />
              </div>

              <div className="mt-7 w-full max-w-[540px]">
                <input autoFocus value={draftName} onChange={(event) => setDraftName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') saveProfile(); }} placeholder="Profile name" className="h-[58px] w-full rounded-2xl border border-white/10 bg-[#111116] px-5 text-base text-white outline-none transition focus:border-white/25" />
                <div className="mt-8 flex items-center justify-center gap-5">
                  <button type="button" onClick={() => { const index = Math.max(0, avatars.indexOf(draftAvatar)); setDraftAvatar(avatars[(index - 1 + avatars.length) % avatars.length]); }} className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111116] text-white/85"><ChevronLeft className="h-8 w-8" /></button>
                  <button type="button" onClick={() => { const index = Math.max(0, avatars.indexOf(draftAvatar)); setDraftAvatar(avatars[(index + 1) % avatars.length]); }} className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111116] text-white/85"><ChevronRight className="h-8 w-8" /></button>
                </div>
                <button type="button" disabled={!draftName.trim() || saving} onClick={saveProfile} className="mt-8 h-14 w-full rounded-2xl bg-white text-base font-bold text-black disabled:opacity-40">{edit.isNew ? 'Save & Continue' : 'Save & Continue'}</button>
                {!edit.isNew && <button type="button" onClick={removeProfile} className="mx-auto mt-9 flex items-center gap-2 text-sm font-semibold text-red-400/80 transition hover:text-red-400"><Trash2 className="h-4 w-4" /> Delete profile</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
