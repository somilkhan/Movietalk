import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Play, Plus, Settings, Trash2, X } from "lucide-react";
import { useProfiles, DEFAULT_AVATARS } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { useAds } from "@/hooks/useAds";
import { useMyWatchlist } from "@/hooks/useUserData";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { Seo } from "@/components/Seo";

const SLOT = 120;
const SWIPE_THRESHOLD = 42;

function Avatar({ src, alt, selected, editor, onClick }: { src: string; alt: string; selected?: boolean; editor?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className="relative shrink-0 h-[100px] w-[100px] flex items-center justify-center focus:outline-none" aria-label={editor ? `Select ${alt}` : alt}>
      <img
        src={src}
        alt={alt}
        className={`h-20 w-20 rounded-full object-cover transition-all duration-400 ease-[cubic-bezier(0.22,0.9,0.3,1)] ${selected ? "h-24 w-24 ring-2 ring-white ring-offset-4 ring-offset-black" : "ring-1 ring-white/10"}`}
        onError={(event) => { event.currentTarget.src = DEFAULT_AVATARS[0]; }}
      />
      {selected && <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-lg"><Check className="h-4 w-4" strokeWidth={3} /></span>}
    </button>
  );
}

function AvatarCarousel({ selected, onSelect }: { selected: string; onSelect: (avatar: string) => void }) {
  const index = Math.max(0, DEFAULT_AVATARS.indexOf(selected));
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);

  const move = (next: number) => onSelect(DEFAULT_AVATARS[Math.min(DEFAULT_AVATARS.length - 1, Math.max(0, next))]);
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX; currentX.current = event.clientX; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    currentX.current = event.clientX;
    setDragOffset(Math.max(-120, Math.min(120, currentX.current - startX.current)));
  };
  const finishDrag = () => {
    if (!dragging) return;
    const delta = currentX.current - startX.current;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) move(index + (delta < 0 ? 1 : -1));
    setDragOffset(0); setDragging(false);
  };

  return (
    <div
      className="relative h-56 w-full overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={finishDrag} onPointerCancel={finishDrag} onPointerLeave={finishDrag}
    >
      <div
        className="absolute left-1/2 top-1/2 flex items-center gap-5 will-change-transform"
        style={{ transform: `translate3d(calc(-50px - ${index * SLOT}px + ${dragOffset}px), -50%, 0)`, transition: dragging ? "none" : "transform 400ms cubic-bezier(0.22,0.9,0.3,1)" }}
      >
        {DEFAULT_AVATARS.map((avatar, itemIndex) => {
          const distance = Math.abs(itemIndex - index);
          return (
            <div key={`${avatar}-${itemIndex}`} className="h-[100px] w-[100px] shrink-0 transition-opacity duration-300" style={{ opacity: Math.max(0.14, 1 - distance * 0.19), transform: itemIndex === index ? "scale(1.4)" : "scale(1)", transition: dragging ? "none" : "transform 400ms cubic-bezier(0.22,0.9,0.3,1), opacity 300ms ease" }}>
              <Avatar src={avatar} alt={`Avatar ${itemIndex + 1}`} selected={itemIndex === index} editor onClick={() => onSelect(avatar)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Poster({ src, title, href }: { src: string | null; title: string; href: string }) {
  return (
    <Link href={href}>
      <a className="group block w-[150px] shrink-0 overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-white/25">
        <div className="aspect-[2/3] overflow-hidden bg-white/5">
          {src ? <img src={src.startsWith("http") ? src : `https://image.tmdb.org/t/p/w342${src}`} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /> : <div className="h-full w-full" />}
        </div>
        <p className="truncate px-3 py-2.5 text-sm font-medium text-white/80">{title}</p>
      </a>
    </Link>
  );
}

export default function Profiles() {
  const [, navigate] = useLocation();
  const { profile } = useAuth();
  const { showAds, setShowAds } = useAds();
  const { profiles, activeId, activeProfile, setActiveId, addProfile, updateProfile, deleteProfile, isHydrated } = useProfiles();
  const { data: watchlist = [] } = useMyWatchlist(activeId);
  const { items: continueWatching = [] } = useContinueWatching();
  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftAvatar, setDraftAvatar] = useState(DEFAULT_AVATARS[0]);

  const sortedProfiles = useMemo(() => profiles, [profiles]);
  const selectedAvatar = editing ? (activeProfile?.avatar || DEFAULT_AVATARS[0]) : (activeProfile?.avatar || DEFAULT_AVATARS[0]);

  if (!isHydrated) return <div className="min-h-screen bg-[#07070b] flex items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-white animate-spin" /></div>;

  const saveAvatar = (avatar: string) => { if (activeProfile) updateProfile(activeProfile.id, { avatar }); };
  const create = () => {
    const name = draftName.trim();
    if (!name) return;
    const id = addProfile(name, draftAvatar);
    setActiveId(id); setDraftName(""); setDraftAvatar(DEFAULT_AVATARS[0]); setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-[#07070b] text-white" data-testid="page-profiles">
      <Seo title={editing ? "Edit Profile" : "Profiles"} />

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07070b]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="min-w-0">
            <p className="truncate text-[11px] text-white/35">{profile?.email || ""}</p>
            <p className="truncate text-sm font-medium text-white/75">{editing ? "Edit Profile" : "Profiles"}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-2 text-xs text-white/50">
              <span>Show Ads</span>
              <input type="checkbox" checked={showAds} onChange={(event) => setShowAds(event.target.checked)} className="sr-only" />
              <span className={`relative h-5 w-9 rounded-full transition ${showAds ? "bg-white" : "bg-white/15"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full transition ${showAds ? "left-4 bg-black" : "left-0.5 bg-white/50"}`} /></span>
            </label>
            <Link href="/settings"><a className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Help and settings"><Settings className="h-4 w-4" /></a></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        {editing ? (
          <section className="pt-5">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-1 rounded-full px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"><ArrowLeft className="h-4 w-4" />Back</button>
              <h1 className="text-base font-semibold">Edit Profile</h1>
              <button type="button" onClick={() => setEditing(false)} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">Done</button>
            </div>
            {activeProfile ? (
              <>
                <div className="mt-5 flex flex-col items-center">
                  <AvatarCarousel selected={selectedAvatar} onSelect={saveAvatar} />
                  <input value={activeProfile.name} onChange={(event) => updateProfile(activeProfile.id, { name: event.target.value })} className="mt-1 h-11 w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-4 text-center text-sm outline-none focus:border-white/30" aria-label="Profile name" />
                </div>
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button type="button" onClick={() => { const i = DEFAULT_AVATARS.indexOf(activeProfile.avatar); saveAvatar(DEFAULT_AVATARS[Math.max(0, i - 1)]); }} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/10" aria-label="Previous avatar"><ChevronLeft /></button>
                  <button type="button" onClick={() => { const i = DEFAULT_AVATARS.indexOf(activeProfile.avatar); saveAvatar(DEFAULT_AVATARS[Math.min(DEFAULT_AVATARS.length - 1, i + 1)]); }} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/10" aria-label="Next avatar"><ChevronRight /></button>
                </div>
              </>
            ) : <p className="py-24 text-center text-sm text-white/35">Create a profile first.</p>}
          </section>
        ) : (
          <>
            <section className="pt-8">
              <div className="flex items-center justify-between"><h1 className="text-xl font-semibold tracking-tight">Profiles</h1><button type="button" onClick={() => setEditing(true)} disabled={!activeProfile} className="text-sm font-medium text-white/45 hover:text-white disabled:opacity-30">Edit</button></div>
              <div className="mt-6 flex flex-wrap items-start gap-6">
                {sortedProfiles.map((item) => (
                  <div key={item.id} className="group w-24 text-center">
                    <button type="button" onClick={() => setActiveId(item.id)} className="relative h-20 w-20 overflow-hidden rounded-full ring-1 ring-white/10 transition hover:scale-105 hover:ring-white/50 focus:outline-none focus:ring-2 focus:ring-white">
                      <img src={item.avatar} alt={item.name} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = DEFAULT_AVATARS[0]; }} />
                      {activeId === item.id && <span className="absolute inset-0 rounded-full bg-white/10 ring-2 ring-white" />}
                    </button>
                    <p className="mt-2 truncate text-sm text-white/70">{item.name}</p>
                  </div>
                ))}
                <button type="button" onClick={() => setShowAdd(true)} className="group w-24 text-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-white/20 bg-white/[0.03] transition group-hover:border-white/50 group-hover:bg-white/[0.06]"><Plus className="h-7 w-7 text-white/40 group-hover:text-white" /></span>
                  <span className="mt-2 block text-sm text-white/40 group-hover:text-white">Add profile</span>
                </button>
              </div>
            </section>

            <section className="mt-12">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Watchlist</h2><span className="text-xs text-white/25">{watchlist.length}</span></div>
              {watchlist.length ? <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">{watchlist.map((item) => <Poster key={`${item.mediaType}-${item.titleId}`} src={item.titleSnapshot.posterPath} title={item.titleSnapshot.title} href={`/title/${item.mediaType}/${item.titleId}`} />)}</div> : <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-8 text-sm text-white/35">Your watchlist is empty.</div>}
            </section>

            <section className="mt-12">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Continue Watching{activeProfile ? <span className="ml-2 text-sm font-normal text-white/30">{activeProfile.name}</span> : null}</h2></div>
              {continueWatching.length ? (
                <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
                  {continueWatching.map((item) => {
                    const href = item.mediaType === "tv" && item.season && item.episode ? `/watch/tv/${item.id}/${item.season}/${item.episode}` : `/watch/${item.mediaType}/${item.id}`;
                    const image = item.backdropPath || item.posterPath;
                    return <Link key={`${item.mediaType}-${item.id}-${item.season || 0}-${item.episode || 0}`} href={href}><a className="group w-[260px] shrink-0 overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition hover:ring-white/25">
                      <div className="relative aspect-video overflow-hidden bg-white/5">{image && <img src={image.startsWith("http") ? image : `https://image.tmdb.org/t/p/w780${image}`} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />}<span className="absolute inset-0 flex items-center justify-center bg-black/15"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg"><Play className="ml-0.5 h-4 w-4 fill-current" /></span></span><div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"><div className="h-full bg-white" style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }} /></div></div>
                      <div className="px-3 py-3"><p className="truncate text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-white/35">{item.mediaType === "tv" && item.season && item.episode ? `S${item.season} E${item.episode}` : "Movie"}{item.timeLeft ? ` · ${item.timeLeft} min left` : ""}</p></div>
                    </a></Link>;
                  })}
                </div>
              ) : <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-8 text-sm text-white/35">Nothing to continue yet.</div>}
            </section>
          </>
        )}
      </main>

      {showAdd && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAdd(false); }}>
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#15161b] p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">Add profile</h2><button type="button" onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-white/60" /></button></div>
          <div className="mb-5 flex justify-center"><img src={draftAvatar} alt="Selected avatar" className="h-24 w-24 rounded-full object-cover ring-2 ring-white/20" /></div>
          <div className="mb-5 grid max-h-48 grid-cols-6 gap-3 overflow-y-auto pr-1">{DEFAULT_AVATARS.map((avatar) => <button type="button" key={avatar} onClick={() => setDraftAvatar(avatar)} className={`h-11 w-11 overflow-hidden rounded-full transition ${draftAvatar === avatar ? "scale-105 ring-2 ring-white" : "ring-1 ring-white/10"}`}><img src={avatar} alt="" className="h-full w-full object-cover" /></button>)}</div>
          <input autoFocus value={draftName} onChange={(event) => setDraftName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") create(); }} placeholder="Profile name" className="mb-4 h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-white/30" />
          <button type="button" disabled={!draftName.trim()} onClick={create} className="h-12 w-full rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-40">Create profile</button>
        </div>
      </div>}
    </div>
  );
}
