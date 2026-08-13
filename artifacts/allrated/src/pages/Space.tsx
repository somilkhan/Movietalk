import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Settings, ChevronRight, Plus, Pencil, Check,
  Play, Trash2, X,
} from "lucide-react";
import { useProfiles, DEFAULT_AVATARS } from "@/hooks/useProfiles";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/hooks/useAuth";
import { useAds } from "@/hooks/useAds";
import { Seo } from "@/components/Seo";
import { cn } from "@/lib/utils";

const TAGLINES = [
  "Netflix and Chill? More like Bingr and finger... wait.",
  "Welcome to Bingr. Where your social life comes to die.",
  "Bingr: Cheaper than therapy, twice as addictive.",
];

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-20">
      <div
        className="h-full bg-[#1875e5] transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

export default function Space() {
  const { profile, isLoggedIn } = useAuth();
  const { profiles, activeProfile, activeId, setActiveId, addProfile, updateProfile, deleteProfile, isEditing, setIsEditing } = useProfiles();
  const { items: continueItems } = useContinueWatching();
  const { watchlist, isLoading: watchlistLoading } = useWatchlist(isLoggedIn);
  const { showAds, setShowAds } = useAds();
  const [, navigate] = useLocation();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const tagline = TAGLINES[Math.abs((activeProfile?.name || "").charCodeAt(0) || 0) % TAGLINES.length];

  function handleAddProfile() {
    if (!newProfileName.trim()) return;
    addProfile(newProfileName.trim(), selectedAvatar);
    setNewProfileName("");
    setSelectedAvatar(DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]);
    setShowAddModal(false);
  }

  function startEdit(p: typeof profiles[0]) {
    setEditingProfileId(p.id);
    setEditName(p.name);
  }

  function saveEdit(id: string) {
    if (editName.trim()) {
      updateProfile(id, { name: editName.trim() });
    }
    setEditingProfileId(null);
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white pb-28 md:pb-8" data-testid="page-space">
      <Seo title="My Space" />

      {/* Header */}
      <div className="relative z-10 pl-0 md:pl-[80px] lg:pl-[100px] pt-12 md:pt-20">
        <div className="px-6 md:px-12 mb-10 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:items-start w-full">
            <div className="flex flex-col gap-1 w-full md:w-[60%]">
              <h2 className="text-lg sm:text-xl font-semibold text-white/90 leading-snug">
                <span className="line-clamp-2 sm:line-clamp-1">{tagline}</span>
              </h2>
              <p className="text-sm font-medium text-white/60 mt-1">
                {profile?.email || "smartysomilbz@gmail.com"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-4 self-start md:self-auto w-full md:w-auto justify-end">
              <Link href="/settings">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all font-semibold text-white/90 text-sm">
                  <Settings className="w-5 h-5 text-white/70" />
                  Help &amp; Settings
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white/60">Show Ads</span>
                <button
                  type="button"
                  aria-pressed={showAds}
                  onClick={() => setShowAds(!showAds)}
                  className={cn(
                    "relative w-10 h-5 rounded-full outline-none shrink-0 transition-colors",
                    showAds ? "bg-white" : "bg-white/20"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-[2px] w-4 h-4 rounded-full transition-transform bg-black",
                      showAds ? "translate-x-[22px]" : "translate-x-[2px]"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profiles */}
        <div className="px-6 md:px-12 mb-12 w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white/90 tracking-tight">Profiles</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 text-sm font-semibold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-white/10"
            >
              <Pencil className="w-4 h-4 text-white/70" />
              {isEditing ? "Done" : "Edit"}
            </button>
          </div>
          <div className="flex flex-wrap items-start gap-5 md:gap-8">
            {profiles.map((p) => (
              <div key={p.id} className="group flex flex-col items-center gap-3 outline-none relative">
                <button
                  onClick={() => {
                    if (isEditing) {
                      startEdit(p);
                    } else {
                      setActiveId(p.id);
                    }
                  }}
                  className="relative"
                >
                  <div
                    className={cn(
                      "relative h-[72px] w-[72px] md:h-[120px] md:w-[120px] overflow-hidden rounded-full transition-all duration-300",
                      activeId === p.id && !isEditing
                        ? "ring-2 ring-white/40"
                        : "ring-2 ring-transparent group-hover:ring-white/20"
                    )}
                  >
                    <img
                      alt={p.name}
                      className="h-full w-full object-cover"
                      src={p.avatar}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_AVATARS[1];
                      }}
                    />
                  </div>
                  {activeId === p.id && !isEditing && (
                    <div className="absolute bottom-0 right-0 z-20 flex items-center justify-center w-7 h-7 md:w-9 md:h-9 bg-[#E2E8F0] rounded-full border-[3px] border-[#0f0f0f] shadow-lg">
                      <Check className="w-3.5 h-3.5 md:w-5 md:h-5 text-black" strokeWidth={2.5} />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
                {editingProfileId === p.id ? (
                  <div className="flex flex-col items-center gap-1">
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => saveEdit(p.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(p.id)}
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white text-center w-24 focus:outline-none focus:border-white/40"
                    />
                    <button
                      onClick={() => deleteProfile(p.id)}
                      className="text-red-400 text-xs flex items-center gap-1 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                    {p.name}
                  </span>
                )}
              </div>
            ))}

            {/* Add Profile */}
            <button
              onClick={() => setShowAddModal(true)}
              className="group flex flex-col items-center gap-3 outline-none"
            >
              <div className="flex h-[72px] w-[72px] md:h-[120px] md:w-[120px] items-center justify-center rounded-full bg-white/5 border border-dashed border-white/20 transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/10">
                <Plus className="w-6 h-6 md:w-8 md:h-8 text-white/60 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-semibold text-white/60 group-hover:text-white/90 transition-colors">Add</span>
            </button>
          </div>
        </div>

        {/* Watchlist */}
        {(watchlist.length > 0 || watchlistLoading) && (
          <div className="mb-4">
            <section className="group/row relative mb-8">
              <h2 className="mb-3 px-6 text-lg font-semibold text-white/90 md:px-12">Watchlist</h2>
              <div className="relative">
                <div className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-6 md:px-12 py-4">
                  {watchlistLoading && (
                    <div className="flex gap-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-[150px] sm:w-[170px] shrink-0">
                          <div className="aspect-[2/3] rounded-lg bg-white/5 animate-pulse" />
                          <div className="mt-2 h-4 w-24 bg-white/5 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  )}
                  {watchlist.map((item: any) => (
                    <Link key={`${item.mediaType}-${item.titleId}`} href={`/title/${item.mediaType}/${item.titleId}`}>
                      <button className="focusable group relative w-[150px] shrink-0 text-left transition-transform duration-200 sm:w-[170px] hover:z-10 hover:scale-105">
                        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5 ring-2 transition-all ring-transparent group-hover:ring-white/30">
                          <img
                            alt={item.titleSnapshot?.title || "Title"}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            src={item.titleSnapshot?.posterPath || "https://via.placeholder.com/300x450?text=No+Image"}
                          />
                        </div>
                        <div className="mt-2 truncate text-[14px] font-semibold text-white/90 tracking-tight">
                          {item.titleSnapshot?.title || "Untitled"}
                        </div>
                        <div className="flex items-center mt-1 text-[11px] font-medium text-white/50">
                          <span>{item.mediaType === "movie" ? "Movie" : "Series"}</span>
                        </div>
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Continue Watching */}
        {continueItems.length > 0 && (
          <section className="mb-8 relative group">
            <div className="flex items-center justify-between gap-3 md:gap-4 mb-4 px-6 text-lg font-semibold text-white/90 md:px-12 w-full">
              <div className="flex items-center gap-4">
                <h2>Continue Watching for {activeProfile?.name || "You"}</h2>
              </div>
            </div>
            <div className="no-scrollbar flex gap-4 overflow-x-auto py-4 scroll-smooth px-6 md:px-12">
              {continueItems.map((item) => (
                <Link
                  key={`${item.mediaType}-${item.id}-${item.season}-${item.episode}`}
                  href={
                    item.mediaType === "movie"
                      ? `/watch/movie/${item.id}`
                      : `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`
                  }
                >
                  <button className="group/card flex flex-col gap-2 w-[220px] md:w-[260px] lg:w-[300px] shrink-0 transition-all duration-200 outline-none text-left">
                    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-[#1a1c20] transition-all duration-300">
                      {item.backdropPath ? (
                        <img
                          className="object-cover w-full h-full transition-all duration-500 ease-out group-hover/card:scale-105"
                          alt={item.title}
                          loading="lazy"
                          src={item.backdropPath}
                        />
                      ) : item.posterPath ? (
                        <img
                          className="object-cover w-full h-full transition-all duration-500 ease-out group-hover/card:scale-105"
                          alt={item.title}
                          loading="lazy"
                          src={item.posterPath}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-center p-4 text-white/40 font-bold text-sm bg-white/5">
                          {item.title}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 pointer-events-none" />
                      <div className="absolute bottom-2 left-2 flex items-center justify-center z-10 opacity-80 group-hover/card:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.90588 4.53682C6.50592 4.2998 6 4.58808 6 5.05299V18.947C6 19.4119 6.50592 19.7002 6.90588 19.4632L18.629 12.5162C19.0211 12.2838 19.0211 11.7162 18.629 11.4838L6.90588 4.53682Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <ProgressBar progress={item.progress} />
                    </div>
                    <div className="flex flex-col px-0.5">
                      <h3 className="text-[14px] sm:text-[15px] font-semibold text-white/90 leading-snug truncate transition-colors duration-200 group-hover/card:text-white">
                        {item.mediaType === "tv" && item.episode
                          ? `S${item.season || 1} E${item.episode}`
                          : item.title}
                      </h3>
                      <div className="flex items-center mt-0.5 text-[12px] text-white/50 font-medium">
                        {item.mediaType === "tv" && item.episode ? (
                          <>
                            <span className="truncate max-w-[60%] mr-2">{item.title}</span>
                            <span>{item.timeLeft ? `${item.timeLeft}m left` : ""}</span>
                          </>
                        ) : (
                          <span>{item.timeLeft ? `${item.timeLeft}m left` : item.title}</span>
                        )}
                      </div>
                    </div>
                  </button>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#1a1c22] rounded-2xl border border-white/10 p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/20">
                <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {DEFAULT_AVATARS.slice(0, 8).map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={cn(
                    "w-12 h-12 rounded-full overflow-hidden transition-all",
                    selectedAvatar === avatar ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={avatar} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              autoFocus
              placeholder="Profile name"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddProfile()}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm mb-4 focus:outline-none focus:border-white/30 placeholder:text-white/30"
            />
            <button
              onClick={handleAddProfile}
              disabled={!newProfileName.trim()}
              className="w-full py-3 rounded-lg bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
