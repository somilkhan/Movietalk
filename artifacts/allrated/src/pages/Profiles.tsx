import { useState } from "react";
import { useLocation } from "wouter";
import { Pencil, Plus, Check, Trash2, X } from "lucide-react";
import { useProfiles, DEFAULT_AVATARS } from "@/hooks/useProfiles";
import { Seo } from "@/components/Seo";
import { cn } from "@/lib/utils";

export default function Profiles() {
  const [, navigate] = useLocation();
  const {
    profiles,
    activeId,
    setActiveId,
    addProfile,
    updateProfile,
    deleteProfile,
  } = useProfiles();

  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function handleSelectProfile(id: string) {
    if (isEditing) {
      const p = profiles.find((x) => x.id === id);
      if (p) {
        setEditingProfileId(id);
        setEditName(p.name);
      }
      return;
    }
    setActiveId(id);
    navigate("/home");
  }

  function handleAddProfile() {
    if (!newProfileName.trim()) return;
    addProfile(newProfileName.trim(), selectedAvatar);
    setNewProfileName("");
    setSelectedAvatar(DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]);
    setShowAddModal(false);
  }

  function saveEdit(id: string) {
    if (editName.trim()) {
      updateProfile(id, { name: editName.trim() });
    }
    setEditingProfileId(null);
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex flex-col" data-testid="page-profiles">
      <Seo title="Who's watching?" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center">
          <img
            alt="Bingr Logo"
            className="w-[60px] h-[60px] object-contain drop-shadow-lg"
            src="/brand/logo.png"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setEditingProfileId(null);
          }}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <Pencil className="w-4 h-4" />
          {isEditing ? "Done" : "Edit"}
        </button>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <h1 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl text-white/90">
          Who&apos;s watching?
        </h1>

        <div className="flex flex-wrap items-start justify-center gap-8 md:gap-12">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectProfile(p.id)}
              className="group flex flex-col items-center gap-3 outline-none"
            >
              {editingProfileId === p.id ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-24 w-24 md:h-28 md:w-28 overflow-hidden rounded-full ring-1 ring-white/10">
                    <img
                      alt={p.name}
                      className="h-full w-full object-cover"
                      src={p.avatar}
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATARS[1]; }}
                    />
                  </div>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => saveEdit(p.id)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(p.id)}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white text-center w-24 focus:outline-none focus:border-white/40"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProfile(p.id);
                      setEditingProfileId(null);
                    }}
                    className="text-red-400 text-xs flex items-center gap-1 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "relative h-24 w-24 overflow-hidden rounded-full ring-1 ring-white/10 transition-all duration-300 md:h-28 md:w-28",
                      !isEditing && activeId === p.id
                        ? "ring-2 ring-white"
                        : "group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-2 group-hover:ring-white"
                    )}
                  >
                    <img
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300"
                      src={p.avatar}
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATARS[1]; }}
                    />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="max-w-[8rem] truncate text-sm font-medium text-white/80 transition-colors duration-300 group-hover:text-white">
                    {p.name}
                  </span>
                </>
              )}
            </button>
          ))}

          {/* Add Profile */}
          <button
            onClick={() => setShowAddModal(true)}
            className="group flex flex-col items-center gap-3 outline-none"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-white/25 bg-white/[0.03] text-white/60 transition group-hover:border-white/50 group-hover:bg-white/10 group-hover:text-white md:h-28 md:w-28">
              <Plus className="w-9 h-9" strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-white/70 group-hover:text-white">Add</span>
          </button>
        </div>
      </main>

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
