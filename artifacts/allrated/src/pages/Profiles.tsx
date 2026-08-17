import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Pencil, Plus, Settings } from "lucide-react";
import { useProfiles, DEFAULT_AVATARS } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { useAds } from "@/hooks/useAds";
import { useMyWatchlist } from "@/hooks/useUserData";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { Seo } from "@/components/Seo";

const SLOT = 120;
const SWIPE_THRESHOLD = 42;

const TAGLINES = [
  "Look who's back. Don't you have a job or something?",
  "Grab your chimichangas and lube, it's binge o'clock!",
  "Netflix and chill? More like RabbitRip and absolutely no sleep.",
  "Welcome back. Your watchlist missed you.",
];

function imageUrl(path: string | null | undefined, width = "w500") {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${width}${path}`;
}

function Avatar({ src, alt, selected = false, compact = false }: { src: string; alt: string; selected?: boolean; compact?: boolean }) {
  return (
    <div className="relative">
      <div className={`relative overflow-hidden rounded-full transition-all duration-300 ${compact ? "h-[72px] w-[72px] md:h-[120px] md:w-[120px]" : selected ? "h-24 w-24" : "h-20 w-20"} ${selected ? "ring-2 ring-white ring-offset-4 ring-offset-black" : "ring-0 opacity-60 hover:opacity-100"}`}>
        <img src={src} alt={alt} draggable={false} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATARS[0]; }} />
      </div>
      {selected && (
        <div className={`absolute flex items-center justify-center rounded-full bg-white text-black shadow-lg ${compact ? "bottom-0 right-0 h-7 w-7 border-[3px] border-[#0f0f0f] md:h-9 md:w-9" : "-bottom-2 -right-1 h-7 w-7"}`}>
          <Check className={compact ? "h-3.5 w-3.5 md:h-5 md:w-5" : "h-3.5 w-3.5"} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

function AvatarCarousel({ selected, onSelect }: { selected: string; onSelect: (avatar: string) => void }) {
  const selectedIndex = Math.max(0, DEFAULT_AVATARS.findIndex((avatar) => avatar === selected));
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);

  const move = (index: number) => {
    const next = Math.max(0, Math.min(DEFAULT_AVATARS.length - 1, index));
    onSelect(DEFAULT_AVATARS[next]);
  };

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    currentX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const movePointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    currentX.current = e.clientX;
    setDragOffset(Math.max(-120, Math.min(120, currentX.current - startX.current)));
  };
  const up = () => {
    if (!dragging) return;
    const delta = currentX.current - startX.current;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) move(selectedIndex + (delta < 0 ? 1 : -1));
    setDragOffset(0);
    setDragging(false);
  };

  return (
    <div className="relative mx-auto flex w-full items-center justify-center overflow-hidden">
      <button aria-label="Previous" onClick={() => move(selectedIndex - 1)} disabled={selectedIndex === 0} className="absolute left-4 z-10 rounded-full bg-black/40 p-3 text-white/50 backdrop-blur-sm transition hover:text-white disabled:opacity-30 md:left-8">
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </button>
      <div className="relative h-56 w-full cursor-grab select-none overflow-hidden touch-pan-y active:cursor-grabbing" onPointerDown={down} onPointerMove={movePointer} onPointerUp={up} onPointerCancel={up}>
        <div className="absolute top-1/2 flex items-center" style={{ left: "50%", transform: `translate(calc(-50px - ${selectedIndex * SLOT}px + ${dragOffset}px), -50%)`, transition: dragging ? "none" : "transform 400ms cubic-bezier(0.22, 0.9, 0.3, 1)", gap: 20 }}>
          {DEFAULT_AVATARS.map((avatar, index) => {
            const distance = Math.abs(index - selectedIndex);
            return (
              <button key={`${avatar}-${index}`} type="button" onClick={() => onSelect(avatar)} style={{ width: 100, transform: index === selectedIndex ? "scale(1.4)" : "scale(1)", opacity: Math.max(0, 1 - distance * 0.1), transition: dragging ? "none" : "transform 400ms cubic-bezier(0.22, 0.9, 0.3, 1), opacity 300ms" }} className="relative flex shrink-0 items-center justify-center outline-none">
                <Avatar src={avatar} alt="" selected={index === selectedIndex} />
              </button>
            );
          })}
        </div>
      </div>
      <button aria-label="Next" onClick={() => move(selectedIndex + 1)} disabled={selectedIndex === DEFAULT_AVATARS.length - 1} className="absolute right-4 z-10 rounded-full bg-black/40 p-3 text-white/50 backdrop-blur-sm transition hover:text-white disabled:opacity-30 md:right-12">
        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function WatchlistCard({ item }: { item: any }) {
  const src = imageUrl(item.titleSnapshot?.posterPath);
  const href = `/title/${item.mediaType}/${item.titleId}`;
  return (
    <Link href={href}>
      <a className="group relative w-[150px] shrink-0 text-left transition-transform duration-200 sm:w-[170px] hover:z-10 hover:scale-105">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5 ring-2 ring-transparent transition-all group-hover:ring-white/30">
          {src ? <img alt={item.titleSnapshot?.title || ""} loading="lazy" className="h-full w-full object-cover" src={src} /> : <div className="h-full w-full bg-white/5" />}
        </div>
        <div className="mt-2 truncate text-[14px] font-semibold tracking-tight text-white/90">{item.titleSnapshot?.title || "Untitled"}</div>
        <div className="mt-1 flex items-center text-[11px] font-medium text-white/50"><span>{item.mediaType === "tv" ? "Series" : item.mediaType === "anime" ? "Anime" : "Movie"}</span></div>
      </a>
    </Link>
  );
}

function ContinueCard({ item }: { item: any }) {
  const src = imageUrl(item.backdropPath || item.posterPath, "w780");
  const href = item.mediaType === "tv" ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}` : item.mediaType === "anime" ? `/watch/anime/${item.id}/${item.episode || 1}` : `/watch/movie/${item.id}`;
  const progress = Math.max(0, Math.min(100, Number(item.progress || 0)));
  const label = item.mediaType === "tv" ? `S${item.season || 1} E${item.episode || 1}` : item.episodeTitle || item.title;
  return (
    <Link href={href}>
      <a className="group/card flex w-[220px] shrink-0 flex-col gap-2 outline-none transition-all duration-200 md:w-[260px] lg:w-[300px]">
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[#1a1c20] transition-all duration-300">
          {src ? <img className="h-full w-full object-cover transition-all duration-500 ease-out group-hover/card:scale-105" alt={item.title || ""} loading="lazy" src={src} /> : <div className="h-full w-full bg-[#1a1c20]" />}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 z-10 text-white opacity-80 transition-opacity group-hover/card:opacity-100"><span className="text-2xl leading-none">▶</span></div>
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/20"><div className="h-full bg-[#1875e5]" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="flex flex-col px-0.5">
          <h3 className="truncate text-[14px] font-semibold leading-snug text-white/90 sm:text-[15px]">{label}</h3>
          <div className="mt-0.5 flex items-center text-[12px] font-medium text-white/50">
            <span className="mr-2 max-w-[60%] truncate">{item.title}</span>
            {item.timeLeft ? <span>{item.timeLeft}m left</span> : null}
          </div>
        </div>
      </a>
    </Link>
  );
}

function AddProfile({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, avatar: string) => void }) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1014] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-semibold">Add profile</h2><button onClick={onClose} className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"><span className="text-xl">×</span></button></div>
        <div className="mb-5 grid max-h-64 grid-cols-4 gap-4 overflow-y-auto py-2">
          {DEFAULT_AVATARS.map((item, i) => <button key={`${item}-${i}`} type="button" onClick={() => setAvatar(item)} className="flex justify-center"><div className={avatar === item ? "rounded-full ring-2 ring-white ring-offset-2 ring-offset-[#0f1014]" : "rounded-full opacity-70"}><img src={item} alt="" className="h-14 w-14 rounded-full object-cover" /></div></button>)}
        </div>
        <input autoFocus value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="Profile Name" className="mb-4 w-full rounded-lg border border-white/20 bg-transparent px-4 py-3.5 text-base text-white placeholder-white/40 outline-none focus:border-white focus:bg-white/5" />
        <button disabled={!name.trim()} onClick={() => onCreate(name.trim(), avatar)} className="w-full rounded-lg bg-white py-4 text-sm font-semibold text-black shadow-lg transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40">Create profile</button>
      </div>
    </div>
  );
}

export default function Profiles() {
  const { profile } = useAuth();
  const { showAds, setShowAds } = useAds();
  const { profiles, activeId, activeProfile, setActiveId, addProfile, updateProfile, deleteProfile, isHydrated } = useProfiles();
  const { data: watchlist = [] } = useMyWatchlist(activeId);
  const { items: continueWatching = [] } = useContinueWatching();
  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  if (!isHydrated) return <div className="flex min-h-screen items-center justify-center bg-black"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" /></div>;

  const createProfile = (name: string, avatar: string) => {
    const id = addProfile(name, avatar);
    setActiveId(id);
    setShowAdd(false);
  };
  const removeProfile = () => {
    if (!activeProfile) return;
    if (!window.confirm(`Delete ${activeProfile.name || "this profile"}?`)) return;
    deleteProfile(activeProfile.id);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-black font-sans text-white" data-testid="page-profiles">
      <Seo title={editing ? "Edit Profile" : "My Space"} />
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[350px]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-black to-black" />
        <svg className="absolute h-full w-full opacity-40 mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="rabbitrip-space-stars" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle fill="#fff" cx="15" cy="15" r="1" opacity=".9" /><circle fill="#fff" cx="60" cy="35" r=".8" opacity=".5" /><circle fill="#fff" cx="100" cy="80" r="1.5" opacity=".3" /><circle fill="#fff" cx="30" cy="100" r="1" opacity=".7" /><circle fill="#fff" cx="110" cy="20" r=".8" opacity=".6" /><circle fill="#fff" cx="50" cy="75" r=".6" opacity=".8" /><circle fill="#fff" cx="8" cy="65" r="1.2" opacity=".4" /><circle fill="#fff" cx="85" cy="55" r=".8" opacity=".9" />
          </pattern></defs><rect width="100%" height="100%" fill="url(#rabbitrip-space-stars)" /></svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black" />
      </div>

      <main className="relative z-10 pl-0 pb-24 md:pl-[80px] lg:pl-[100px] md:pb-8">
        <div className="px-6 pt-12 md:px-12 md:pt-20">
          <div className="mb-10 flex w-full flex-col items-center justify-between gap-6 md:flex-row md:items-start">
            <div className="flex w-full flex-col gap-1 md:w-[60%]">
              <Link href="/settings/subscription"><a className="group relative flex h-[56px] w-full items-center sm:h-[32px]">
                <h2 className="absolute flex items-center text-lg font-semibold text-white/90 transition-colors group-hover:text-white sm:text-xl"><span className="line-clamp-2 sm:line-clamp-1">{TAGLINES[Math.abs((profile?.email || "").length) % TAGLINES.length]}</span><ChevronRight className="ml-1 h-5 w-5 shrink-0 text-white/60 transition-colors group-hover:text-white/90 sm:ml-2" /></h2>
              </a></Link>
              <p className="mt-1 text-sm font-medium text-white/60 sm:mt-0">{profile?.email || ""}</p>
            </div>
            <div className="flex w-full flex-col items-end gap-4 self-start md:w-auto md:self-auto">
              <Link href="/settings"><a className="flex items-center gap-2 rounded-lg border border-transparent bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition-all hover:border-white/10 hover:bg-white/10"><Settings className="h-5 w-5 text-white/70" />Help &amp; Settings</a></Link>
              <div className="flex items-center gap-3"><span className="text-sm font-medium text-white/60">Show Ads</span><button type="button" aria-pressed={showAds} onClick={() => setShowAds(!showAds)} className={`relative h-5 w-10 shrink-0 rounded-full outline-none transition-colors ${showAds ? "bg-white" : "bg-white/20"}`}><div className={`absolute top-[2px] h-4 w-4 rounded-full transition-transform ${showAds ? "translate-x-[22px] bg-black" : "translate-x-[2px] bg-white/70"}`} /></button></div>
            </div>
          </div>

          <div className="mb-12 w-full">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-semibold tracking-tight text-white/90">Profiles</h2><button onClick={() => activeProfile && setEditing(true)} disabled={!activeProfile} className="flex items-center gap-2 rounded-lg border border-transparent bg-white/5 px-4 py-2 text-sm font-semibold transition-colors hover:border-white/10 hover:bg-white/10 disabled:opacity-30"><Pencil className="h-4 w-4 text-white/70" />Edit</button></div>
            <div className="flex flex-wrap items-start gap-5 md:gap-8">
              {profiles.map((item) => <button key={item.id} type="button" onClick={() => setActiveId(item.id)} className="group flex flex-col items-center gap-3 outline-none"><Avatar src={item.avatar} alt={item.name} selected={activeId === item.id} compact /><span className="text-sm font-semibold text-white/80 transition-colors group-hover:text-white">{item.name}</span></button>)}
              <button type="button" onClick={() => setShowAdd(true)} className="group flex flex-col items-center gap-3 outline-none"><div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-dashed border-white/20 bg-white/5 transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/10 md:h-[120px] md:w-[120px]"><Plus className="h-6 w-6 text-white/60 transition-colors group-hover:text-white md:h-8 md:w-8" /></div><span className="text-sm font-semibold text-white/60 transition-colors group-hover:text-white/90">Add</span></button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <section className="group/row relative mb-8">
            <h2 className="mb-3 px-6 text-lg font-semibold text-white/90 md:px-12">Watchlist</h2>
            <div className="relative"><div className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-6 py-4 md:px-12">
              {watchlist.map((item) => <WatchlistCard key={`${item.mediaType}-${item.titleId}`} item={item} />)}
              {!watchlist.length && <div className="rounded-lg border border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-white/40">Your watchlist is empty.</div>}
            </div></div>
          </section>
        </div>

        <section className="group relative mb-8">
          <div className="mb-4 flex w-full items-center justify-between gap-3 px-6 text-lg font-semibold text-white/90 md:gap-4 md:px-12"><div className="flex items-center gap-4"><h2>Continue Watching for {activeProfile?.name || "you"}</h2><button onClick={() => activeProfile && setEditing(true)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/50 transition-all hover:bg-white/15 hover:text-white"><Pencil className="h-4 w-4" /></button></div></div>
          <div className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-6 py-4 md:px-12">
            {continueWatching.map((item) => <ContinueCard key={`${item.mediaType}-${item.id}-${item.season || 0}-${item.episode || 0}`} item={item} />)}
            {!continueWatching.length && <div className="rounded-md border border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-white/40">Nothing to continue watching yet.</div>}
          </div>
          {continueWatching.length > 0 && <button className="absolute bottom-0 right-0 top-[44px] z-30 hidden w-12 items-center justify-center bg-gradient-to-l from-black to-transparent md:flex"><ChevronRight className="h-6 w-6" /></button>}
        </section>
      </main>

      {editing && activeProfile && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black font-sans text-white" style={{ animation: "rabbitripFadeIn .2s ease" }}>
          <div className="relative flex items-center justify-between px-6 py-5 md:px-12">
            <button onClick={() => setEditing(false)} className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Back"><ArrowLeft className="h-6 w-6" strokeWidth={2.5} /></button>
            <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight text-white/90 md:text-xl">Edit Profile</h2>
            <div className="w-10" />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-12 px-4 pb-20">
            <AvatarCarousel selected={activeProfile.avatar} onSelect={(avatar) => updateProfile(activeProfile.id, { avatar })} />
            <div className="mt-4 w-full max-w-sm"><input placeholder="Profile Name" maxLength={20} value={activeProfile.name} onChange={(e) => updateProfile(activeProfile.id, { name: e.target.value })} className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-3.5 text-base text-white placeholder-white/40 outline-none transition focus:border-white focus:bg-white/5" /></div>
            <button onClick={() => setEditing(false)} className="w-full max-w-sm rounded-lg bg-white py-4 text-sm font-semibold text-black shadow-lg transition hover:brightness-90">Save &amp; Continue</button>
            <button onClick={removeProfile} className="text-sm font-medium text-red-400/80 transition hover:text-red-400">Delete profile</button>
          </div>
        </div>
      )}

      {showAdd && <AddProfile onClose={() => setShowAdd(false)} onCreate={createProfile} />}
      <style>{`@keyframes rabbitripFadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}
