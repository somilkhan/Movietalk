import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Pencil, Play, Plus, Settings, Trash2, X } from "lucide-react";
import { useProfiles, DEFAULT_AVATARS } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { useAds } from "@/hooks/useAds";
import { useMyWatchlist } from "@/hooks/useUserData";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { Seo } from "@/components/Seo";

const SLOT = 120;
const SWIPE_THRESHOLD = 42;

function AvatarImage({ src, alt, selected = false }: { src: string; alt: string; selected?: boolean }) {
  return (
    <div className="relative h-full w-full">
      <img
        src={src}
        alt={alt}
        className={`h-full w-full rounded-full object-cover ${selected ? "ring-2 ring-white ring-offset-4 ring-offset-black" : "ring-1 ring-white/15"}`}
        onError={(event) => { event.currentTarget.src = DEFAULT_AVATARS[0]; }}
      />
      {selected && (
        <span className="absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-black bg-white text-black shadow-xl">
          <Check className="h-6 w-6" strokeWidth={3} />
        </span>
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

  const move = (nextIndex: number) => {
    const next = Math.max(0, Math.min(DEFAULT_AVATARS.length - 1, nextIndex));
    onSelect(DEFAULT_AVATARS[next]);
  };

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX;
    currentX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    currentX.current = event.clientX;
    setDragOffset(Math.max(-120, Math.min(120, currentX.current - startX.current)));
  };

  const pointerUp = () => {
    if (!dragging) return;
    const delta = currentX.current - startX.current;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) move(selectedIndex + (delta < 0 ? 1 : -1));
    setDragOffset(0);
    setDragging(false);
  };

  return (
    <div
      className="relative h-[330px] w-full overflow-hidden touch-pan-y select-none"
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
    >
      <div
        className="absolute left-1/2 top-1/2 flex items-center gap-5 will-change-transform"
        style={{
          transform: `translate3d(calc(-50px - ${selectedIndex * SLOT}px + ${dragOffset}px), -50%, 0)`,
          transition: dragging ? "none" : "transform 400ms cubic-bezier(0.22,0.9,0.3,1)",
        }}
      >
        {DEFAULT_AVATARS.map((avatar, index) => {
          const distance = Math.abs(index - selectedIndex);
          return (
            <button
              key={`${avatar}-${index}`}
              type="button"
              onClick={() => onSelect(avatar)}
              className="relative h-[100px] w-[100px] shrink-0 outline-none"
              style={{
                opacity: Math.max(0.12, 1 - distance * 0.2),
                transform: index === selectedIndex ? "scale(1.42)" : "scale(1)",
                transition: dragging ? "none" : "transform 400ms cubic-bezier(0.22,0.9,0.3,1), opacity 300ms ease",
              }}
              aria-label={`Select avatar ${index + 1}`}
            >
              <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} selected={index === selectedIndex} />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => move(selectedIndex - 1)}
        disabled={selectedIndex === 0}
        className="absolute left-8 top-1/2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-[#111115]/90 text-white/90 shadow-xl backdrop-blur disabled:pointer-events-none disabled:opacity-0 md:left-10"
        aria-label="Previous avatar"
      >
        <ChevronLeft className="h-9 w-9" />
      </button>
      <button
        type="button"
        onClick={() => move(selectedIndex + 1)}
        disabled={selectedIndex === DEFAULT_AVATARS.length - 1}
        className="absolute right-8 top-1/2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-[#111115]/90 text-white/90 shadow-xl backdrop-blur disabled:pointer-events-none disabled:opacity-0 md:right-10"
        aria-label="Next avatar"
      >
        <ChevronRight className="h-9 w-9" />
      </button>
    </div>
  );
}

function Poster({ src, title, href }: { src: string | null; title: string; href: string }) {
  const image = src ? (src.startsWith("http") ? src : `https://image.tmdb.org/t/p/w500${src}`) : null;
  return (
    <Link href={href}>
      <a className="group block w-[252px] shrink-0 overflow-hidden rounded-2xl bg-[#111116] ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-white/25">
        <div className="aspect-[2/3] overflow-hidden bg-white/5">
          {image ? <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" /> : <div className="h-full w-full" />}
        </div>
        <p className="truncate px-5 py-4 text-[18px] font-medium text-white/80">{title}</p>
      </a>
    </Link>
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
  const [draftName, setDraftName] = useState("");
  const [draftAvatar, setDraftAvatar] = useState(DEFAULT_AVATARS[0]);

  if (!isHydrated) {
    return <div className="flex min-h-screen items-center justify-center bg-black"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" /></div>;
  }

  const selectProfile = (id: string) => setActiveId(id);
  const saveAvatar = (avatar: string) => {
    if (activeProfile) updateProfile(activeProfile.id, { avatar });
  };
  const createProfile = () => {
    const name = draftName.trim();
    if (!name) return;
    const id = addProfile(name, draftAvatar);
    setActiveId(id);
    setDraftName("");
    setDraftAvatar(DEFAULT_AVATARS[0]);
    setShowAdd(false);
  };
  const removeProfile = () => {
    if (!activeProfile) return;
    if (!window.confirm(`Delete ${activeProfile.name || "this profile"}?`)) return;
    deleteProfile(activeProfile.id);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-black text-white" data-testid="page-profiles">
      <Seo title={editing ? "Edit Profile" : "Profiles"} />

      {editing ? (
        <main className="min-h-screen bg-black px-4 pb-12">
          <div className="mx-auto max-w-[1180px]">
            <div className="flex h-[82px] items-center justify-between">
              <button type="button" onClick={() => setEditing(false)} className="flex h-12 items-center gap-1 rounded-full px-2 text-[20px] text-white/75 transition hover:text-white" aria-label="Back">
                <ArrowLeft className="h-8 w-8" strokeWidth={1.8} />
                <span className="hidden sm:inline">Back</span>
              </button>
              <h1 className="text-[22px] font-semibold">Edit Profile</h1>
              <button type="button" onClick={() => setEditing(false)} className="rounded-full bg-white px-7 py-4 text-[18px] font-semibold text-black transition hover:bg-white/90">Done</button>
            </div>

            {activeProfile ? (
              <div className="mx-auto max-w-[900px]">
                <div className="mt-8">
                  <AvatarCarousel selected={activeProfile.avatar} onSelect={saveAvatar} />
                </div>

                <input
                  value={activeProfile.name}
                  onChange={(event) => updateProfile(activeProfile.id, { name: event.target.value })}
                  className="mt-0 h-[90px] w-full rounded-[22px] border border-white/20 bg-[#101014] px-7 text-center text-[26px] text-white outline-none transition focus:border-white/60"
                  aria-label="Profile name"
                />

                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="mt-16 h-[90px] w-full rounded-[22px] bg-white text-[22px] font-semibold text-black transition hover:bg-white/90"
                >
                  Save &amp; Continue
                </button>

                <button type="button" onClick={removeProfile} className="mt-20 flex w-full items-center justify-center gap-2 text-[20px] font-medium text-[#d95763] transition hover:text-red-400">
                  <Trash2 className="h-5 w-5" />
                  Delete profile
                </button>
              </div>
            ) : (
              <p className="py-32 text-center text-white/40">Create a profile first.</p>
            )}
          </div>
        </main>
      ) : (
        <main className="min-h-screen bg-black pb-28">
          <div className="mx-auto max-w-[1180px] px-6 md:px-10">
            <header className="pt-10 md:pt-14">
              <div className="max-w-[700px]">
                <p className="text-[25px] font-semibold leading-[1.35] tracking-[-0.02em] md:text-[32px]">What are we watching tonight?</p>
                <p className="mt-6 truncate text-[18px] text-white/60 md:text-[20px]">{profile?.email || ""}</p>
              </div>

              <div className="mt-10 flex flex-col items-start gap-5">
                <Link href="/settings">
                  <a className="flex h-[64px] items-center gap-4 rounded-2xl bg-[#111115] px-7 text-[20px] font-semibold text-white transition hover:bg-[#19191f]">
                    <Settings className="h-7 w-7 text-white/70" />
                    Help &amp; Settings
                  </a>
                </Link>
                <label className="flex items-center gap-4 text-[18px] font-medium text-white/60">
                  <span>Show Ads</span>
                  <input type="checkbox" checked={showAds} onChange={(event) => setShowAds(event.target.checked)} className="sr-only" />
                  <span className={`relative h-9 w-[68px] rounded-full transition ${showAds ? "bg-white" : "bg-white/15"}`}>
                    <span className={`absolute top-1 h-7 w-7 rounded-full transition-all ${showAds ? "left-[36px] bg-black" : "left-1 bg-white/70"}`} />
                  </span>
                </label>
              </div>
            </header>

            <section className="mt-20 md:mt-24">
              <div className="flex items-center justify-between">
                <h1 className="text-[28px] font-semibold tracking-[-0.02em] md:text-[34px]">Profiles</h1>
                <button type="button" onClick={() => setEditing(true)} disabled={!activeProfile} className="flex h-14 items-center gap-3 rounded-2xl bg-[#111115] px-6 text-[19px] font-semibold text-white/85 transition hover:bg-[#19191f] disabled:opacity-30">
                  <Pencil className="h-5 w-5" />
                  Edit
                </button>
              </div>

              <div className="mt-9 flex items-start gap-8 overflow-x-auto pb-2 scrollbar-hide">
                {profiles.map((item) => (
                  <button key={item.id} type="button" onClick={() => selectProfile(item.id)} className="group flex w-[124px] shrink-0 flex-col items-center outline-none">
                    <span className="relative h-[124px] w-[124px] rounded-full">
                      <AvatarImage src={item.avatar} alt={item.name} selected={activeId === item.id} />
                    </span>
                    <span className="mt-4 max-w-full truncate text-[20px] text-white/75">{item.name}</span>
                  </button>
                ))}
                <button type="button" onClick={() => setShowAdd(true)} className="group flex w-[124px] shrink-0 flex-col items-center outline-none">
                  <span className="flex h-[124px] w-[124px] items-center justify-center rounded-full border border-dashed border-white/25 bg-[#0c0c10] transition group-hover:border-white/50 group-hover:bg-[#111115]">
                    <Plus className="h-12 w-12 text-white/45 group-hover:text-white/80" strokeWidth={1.6} />
                  </span>
                  <span className="mt-4 text-[20px] text-white/45 group-hover:text-white/75">Add</span>
                </button>
              </div>
            </section>

            <section className="mt-24 md:mt-28">
              <div className="mb-7 flex items-center justify-between">
                <h2 className="text-[28px] font-semibold md:text-[32px]">Watchlist</h2>
                <span className="text-[17px] text-white/35">{watchlist.length}</span>
              </div>
              {watchlist.length ? (
                <div className="flex gap-7 overflow-x-auto pb-5 scrollbar-hide">
                  {watchlist.map((item) => (
                    <Poster key={`${item.mediaType}-${item.titleId}`} src={item.titleSnapshot.posterPath} title={item.titleSnapshot.title} href={`/title/${item.mediaType}/${item.titleId}`} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-10 text-[18px] text-white/35">Your watchlist is empty.</div>
              )}
            </section>

            <section className="mt-24 md:mt-28">
              <div className="mb-7 flex items-center justify-between">
                <h2 className="text-[28px] font-semibold md:text-[32px]">Continue Watching{activeProfile ? <span className="ml-3 text-[18px] font-normal text-white/35">{activeProfile.name}</span> : null}</h2>
              </div>
              {continueWatching.length ? (
                <div className="flex gap-7 overflow-x-auto pb-5 scrollbar-hide">
                  {continueWatching.map((item) => {
                    const href = item.mediaType === "tv" && item.season && item.episode ? `/watch/tv/${item.id}/${item.season}/${item.episode}` : `/watch/${item.mediaType}/${item.id}`;
                    const source = item.backdropPath || item.posterPath;
                    const image = source ? (source.startsWith("http") ? source : `https://image.tmdb.org/t/p/w780${source}`) : null;
                    return (
                      <Link key={`${item.mediaType}-${item.id}-${item.season || 0}-${item.episode || 0}`} href={href}>
                        <a className="group block w-[420px] shrink-0 overflow-hidden rounded-2xl bg-[#111115] ring-1 ring-white/10">
                          <div className="relative aspect-video overflow-hidden bg-white/5">
                            {image && <img src={image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />}
                            <span className="absolute inset-0 flex items-center justify-center bg-black/10"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl"><Play className="ml-1 h-6 w-6 fill-current" /></span></span>
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20"><div className="h-full bg-white" style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }} /></div>
                          </div>
                          <div className="px-5 py-4"><p className="truncate text-[18px] font-medium">{item.title}</p><p className="mt-1 text-[15px] text-white/35">{item.mediaType === "tv" && item.season && item.episode ? `S${item.season} E${item.episode}` : "Movie"}{item.timeLeft ? ` · ${item.timeLeft} min left` : ""}</p></div>
                        </a>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-10 text-[18px] text-white/35">Nothing here yet.</div>
              )}
            </section>
          </div>
        </main>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[430px] rounded-[28px] border border-white/10 bg-[#111115] p-7 shadow-2xl">
            <div className="mb-7 flex items-center justify-between"><h2 className="text-[22px] font-semibold">Add profile</h2><button type="button" onClick={() => setShowAdd(false)} aria-label="Close"><X className="h-6 w-6 text-white/55" /></button></div>
            <div className="mb-7 flex justify-center"><img src={draftAvatar} alt="Selected avatar" className="h-28 w-28 rounded-full object-cover ring-2 ring-white/20" /></div>
            <div className="mb-7 grid max-h-52 grid-cols-6 gap-3 overflow-y-auto scrollbar-hide">
              {DEFAULT_AVATARS.map((avatar, index) => (
                <button key={`${avatar}-${index}`} type="button" onClick={() => setDraftAvatar(avatar)} className={`h-12 w-12 overflow-hidden rounded-full ${draftAvatar === avatar ? "ring-2 ring-white" : "ring-1 ring-white/10"}`}><img src={avatar} alt="" className="h-full w-full object-cover" /></button>
              ))}
            </div>
            <input autoFocus value={draftName} onChange={(event) => setDraftName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createProfile(); }} placeholder="Profile name" className="mb-4 h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-[17px] outline-none focus:border-white/40" />
            <button type="button" disabled={!draftName.trim()} onClick={createProfile} className="h-14 w-full rounded-2xl bg-white text-[17px] font-semibold text-black disabled:opacity-35">Create profile</button>
          </div>
        </div>
      )}
    </div>
  );
}
