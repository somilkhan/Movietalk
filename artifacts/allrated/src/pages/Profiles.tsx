import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useProfiles, DEFAULT_AVATARS } from "@/hooks/useProfiles";
import { Seo } from "@/components/Seo";

function Avatar({ src, name, editing, onClick }: { src: string; name: string; editing: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="group flex w-24 flex-col items-center gap-3 text-center outline-none md:w-28">
    <div className="relative h-20 w-20 overflow-hidden rounded-full ring-1 ring-white/[0.08] transition duration-300 group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-white/70 group-focus-visible:ring-2 group-focus-visible:ring-white md:h-24 md:w-24">
      <img src={src} alt={name} draggable={false} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATARS[0]; }} />
      {editing && <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55"><Pencil className="h-6 w-6 text-white" /></div>}
    </div>
    <span className="w-full truncate text-[13px] font-medium text-white/55 transition-colors group-hover:text-white">{name}</span>
  </button>;
}

function AvatarCarousel({ index, onChange }: { index: number; onChange: (index: number) => void }) {
  const [dragStart, setDragStart] = useState<number | null>(null); const [drag, setDrag] = useState(0);
  const move = (delta: number) => onChange(Math.max(0, Math.min(DEFAULT_AVATARS.length - 1, index + delta)));
  const endDrag = () => { if (dragStart === null) return; if (Math.abs(drag) > 10) move(drag < 0 ? 1 : -1); setDragStart(null); setDrag(0); };
  return <div className="relative mx-auto h-52 w-full max-w-[620px] overflow-hidden touch-pan-y select-none">
    <button type="button" aria-label="Previous avatar" onClick={() => move(-1)} disabled={index === 0} className="absolute left-1 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/[0.08] bg-black/60 p-2.5 text-white/50 backdrop-blur-md transition hover:text-white disabled:opacity-25 md:left-3"><ChevronLeft className="h-5 w-5" /></button>
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden" onPointerDown={(e) => { setDragStart(e.clientX); e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => { if (dragStart !== null) setDrag(Math.max(-130, Math.min(130, e.clientX - dragStart))); }} onPointerUp={endDrag} onPointerCancel={endDrag}>
      <div className="absolute left-1/2 top-1/2 flex items-center gap-4" style={{ transform: `translate(calc(-50px - ${index * 116}px + ${drag}px), -50%)`, transition: dragStart === null ? "transform 360ms cubic-bezier(.22,.9,.3,1)" : "none" }}>
        {DEFAULT_AVATARS.map((src, i) => { const distance = Math.abs(i - index); const chosen = i === index; return <button type="button" key={`${src}-${i}`} onClick={() => onChange(i)} className="relative flex h-[100px] w-[100px] shrink-0 items-center justify-center outline-none" style={{ transform: `scale(${chosen ? 1.32 : 1})`, opacity: distance > 7 ? 0 : Math.max(0.12, 1 - distance * 0.12), transition: "transform 360ms cubic-bezier(.22,.9,.3,1), opacity 260ms" }}><span className={`relative block overflow-visible rounded-full ${chosen ? "h-24 w-24 ring-2 ring-white ring-offset-4 ring-offset-black" : "h-20 w-20 opacity-55"}`}><img src={src} alt="" draggable={false} className="h-full w-full rounded-full object-cover" />{chosen && <span className="absolute -bottom-1.5 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black shadow-lg"><Check className="h-3 w-3" strokeWidth={3} /></span>}</span></button>; })}
      </div>
    </div>
    <button type="button" aria-label="Next avatar" onClick={() => move(1)} disabled={index === DEFAULT_AVATARS.length - 1} className="absolute right-1 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/[0.08] bg-black/60 p-2.5 text-white/50 backdrop-blur-md transition hover:text-white disabled:opacity-25 md:right-3"><ChevronRight className="h-5 w-5" /></button>
  </div>;
}

function EditProfile({ id, onClose }: { id: string; onClose: () => void }) {
  const { profiles, updateProfile, deleteProfile } = useProfiles(); const profile = profiles.find((item) => item.id === id); const initialIndex = Math.max(0, DEFAULT_AVATARS.indexOf(profile?.avatar || DEFAULT_AVATARS[0])); const [index, setIndex] = useState(initialIndex); const [name, setName] = useState(profile?.name || "");
  useEffect(() => { if (profile) { setIndex(Math.max(0, DEFAULT_AVATARS.indexOf(profile.avatar))); setName(profile.name); } }, [profile]);
  if (!profile) return null;
  const save = () => { const nextName = name.trim(); if (nextName) { updateProfile(profile.id, { name: nextName, avatar: DEFAULT_AVATARS[index] }); onClose(); } };
  const remove = () => { if (window.confirm("Delete this profile? Watch history for it stays on your account.")) { deleteProfile(profile.id); onClose(); } };
  return <div className="fixed inset-0 z-[100] flex flex-col bg-black font-sans text-white animate-[rrFadeIn_.2s_ease]">
    <header className="relative flex items-center px-5 py-4 md:px-10"><button type="button" onClick={onClose} aria-label="Back" className="rounded-full p-2 text-white/65 transition hover:bg-white/[0.07] hover:text-white"><ChevronLeft className="h-5 w-5" /></button><h2 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-white/90 md:text-base">Edit Profile</h2></header>
    <main className="flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-4 pb-16 md:gap-10"><AvatarCarousel index={index} onChange={setIndex} /><div className="w-full max-w-[360px]"><label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/30">Profile name</label><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Profile Name" maxLength={20} className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.045]" /></div><div className="flex w-full max-w-[360px] flex-col gap-2.5"><button type="button" onClick={save} disabled={!name.trim()} className="h-12 w-full rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-35">Save changes</button><button type="button" onClick={remove} className="h-10 text-xs font-medium text-red-400/70 transition hover:text-red-400">Delete profile</button></div></main>
  </div>;
}

export default function Profiles() {
  const [location, navigate] = useLocation(); const { profiles, setActiveId, addProfile, isHydrated } = useProfiles(); const [editing, setEditing] = useState<string | null>(null); const initialEdit = typeof location === "string" && location.includes("?edit=1"); const [editMode, setEditMode] = useState(initialEdit); const [adding, setAdding] = useState(false); const [name, setName] = useState(""); const [avatarIndex, setAvatarIndex] = useState(0); const selectedAvatar = useMemo(() => DEFAULT_AVATARS[avatarIndex] || DEFAULT_AVATARS[0], [avatarIndex]);
  useEffect(() => { if (initialEdit) setEditMode(true); }, [initialEdit]);
  if (!isHydrated) return <div className="min-h-screen bg-black" />;
  const choose = (id: string) => { setActiveId(id); if (!editMode) navigate("/home"); }; const create = () => { const nextName = name.trim(); if (!nextName) return; const id = addProfile(nextName, selectedAvatar); setActiveId(id); setAdding(false); setName(""); navigate("/home"); };
  return <div className="min-h-screen w-full bg-[#050506] text-white flex flex-col font-sans" data-testid="page-profiles"><Seo title="Who's Watching?" />
    <header className="flex h-[68px] items-center justify-between px-5 md:px-10"><div className="flex items-center"><img src="/brand/logo.png" alt="RabbitRip Logo" className="h-9 w-9 object-contain" /></div><button type="button" onClick={() => setEditMode((value) => !value)} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"><Pencil className="h-3.5 w-3.5" />{editMode ? "Done" : "Edit profiles"}</button></header>
    <main className="flex flex-1 flex-col items-center justify-center px-5 pb-20"><div className="mb-10 text-center md:mb-12"><h1 className="text-[25px] font-semibold tracking-[-0.025em] text-white md:text-[30px]">{editMode ? "Edit profiles" : "Who's watching?"}</h1><p className="mt-2 text-xs text-white/35 md:text-sm">{editMode ? "Choose a profile to edit" : "Select a profile to continue"}</p></div>
      <div className="flex max-w-4xl flex-wrap items-start justify-center gap-x-6 gap-y-8 md:gap-x-10 md:gap-y-10">{profiles.map((item) => <Avatar key={item.id} src={item.avatar} name={item.name} editing={editMode} onClick={() => editMode ? setEditing(item.id) : choose(item.id)} />)}{profiles.length < 3 && <button type="button" onClick={() => { setAvatarIndex(0); setName(""); setAdding(true); }} className="group flex w-24 flex-col items-center gap-3 text-center outline-none md:w-28"><span className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-white/[0.14] bg-white/[0.025] text-white/40 transition group-hover:border-white/35 group-hover:bg-white/[0.06] group-hover:text-white md:h-24 md:w-24"><Plus className="h-7 w-7" /></span><span className="text-[13px] font-medium text-white/45 group-hover:text-white">Add profile</span></button>}</div>
    </main>
    {editing && <EditProfile id={editing} onClose={() => setEditing(null)} />}
    {adding && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 px-5 backdrop-blur-md"><div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#09090a] p-5 shadow-[0_24px_80px_-12px_rgba(0,0,0,.9)]"><div className="mb-5 flex items-center justify-between"><h2 className="text-base font-semibold">Add profile</h2><button type="button" onClick={() => setAdding(false)} aria-label="Close" className="text-2xl leading-none text-white/35 hover:text-white">×</button></div><div className="mb-5 grid max-h-56 grid-cols-5 gap-4 overflow-y-auto pr-1">{DEFAULT_AVATARS.map((src, i) => <button type="button" key={`${src}-${i}`} onClick={() => setAvatarIndex(i)} className="rounded-full outline-none"><img src={src} alt="" className={`mx-auto h-12 w-12 rounded-full object-cover transition ${avatarIndex === i ? "ring-2 ring-white ring-offset-2 ring-offset-[#09090a]" : "opacity-55 hover:opacity-100"}`} /></button>)}</div><label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/30">Profile name</label><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Profile Name" maxLength={20} className="mb-4 h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 text-sm outline-none focus:border-white/30" /><button type="button" disabled={!name.trim()} onClick={create} className="h-12 w-full rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-35">Create profile</button></div></div>}
  </div>;
}
