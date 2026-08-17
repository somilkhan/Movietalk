import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Pencil, Play, Plus, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { useProfiles, DEFAULT_AVATARS } from '@/hooks/useProfiles';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { useMyWatchlist } from '@/hooks/useUserData';
import { useAuth } from '@/hooks/useAuth';
import { useAds } from '@/hooks/useAds';
import { Seo } from '@/components/Seo';

const imageOf = (value?: string | null, width = 'w500') => value ? (value.startsWith('http') ? value : `https://image.tmdb.org/t/p/${width}${value}`) : '/placeholder-poster.jpg';

function Starfield() {
  return <div className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[350px] overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-black to-black" />
    <svg className="absolute h-full w-full opacity-40 mix-blend-screen" aria-hidden="true">
      <defs><pattern id="rabbit-space-stars" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
        <circle fill="#fff" cx="15" cy="15" r="1" opacity=".9"/><circle fill="#fff" cx="60" cy="35" r=".8" opacity=".5"/><circle fill="#fff" cx="100" cy="80" r="1.5" opacity=".3"/><circle fill="#fff" cx="30" cy="100" r="1" opacity=".7"/><circle fill="#fff" cx="110" cy="20" r=".8" opacity=".6"/><circle fill="#fff" cx="50" cy="75" r=".6" opacity=".8"/><circle fill="#fff" cx="8" cy="65" r="1.2" opacity=".4"/><circle fill="#fff" cx="85" cy="55" r=".8" opacity=".9"/>
      </pattern></defs><rect width="100%" height="100%" fill="url(#rabbit-space-stars)" /></svg>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black" />
  </div>;
}

function ProfileAvatar({ src, name, selected, onClick }: { src: string; name: string; selected: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="group flex flex-col items-center gap-3 outline-none">
    <span className="relative block h-[72px] w-[72px] overflow-visible rounded-full md:h-[120px] md:w-[120px]">
      <img alt={name} src={src} className="h-full w-full rounded-full object-cover transition-all duration-300 ring-2 ring-transparent group-hover:ring-white/50" onError={(e) => { e.currentTarget.src = DEFAULT_AVATARS[0]; }} />
      {selected && <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-black bg-white text-black"><Check className="h-5 w-5" strokeWidth={3}/></span>}
    </span>
    <span className="text-sm font-semibold text-white/80 transition-colors group-hover:text-white">{name}</span>
  </button>;
}

function ContinueCard({ item }: { item: any }) {
  const href = item.mediaType === 'tv' ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}` : `/watch/movie/${item.id}`;
  const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
  return <Link href={href} className="group/card flex w-[220px] shrink-0 flex-col gap-2 outline-none md:w-[260px] lg:w-[300px]">
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[#1a1c20] transition-all duration-300">
      <img className="h-full w-full object-cover opacity-50 blur-[2px] transition-all duration-500 ease-out" alt={item.title || ''} loading="lazy" src={imageOf(item.backdropPath || item.posterPath, 'w780')} />
      <div className="absolute inset-0 z-20 flex items-center justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 shadow-lg"><Play className="h-5 w-5 fill-white text-white" /></span></div>
      <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/20"><div className="h-full bg-[#1875e5]" style={{ width: `${progress}%` }} /></div>
    </div>
    <div className="flex flex-col px-0.5"><h3 className="truncate text-[14px] font-semibold leading-snug text-white/90 transition-colors duration-200 group-hover/card:text-white sm:text-[15px]">{item.mediaType === 'tv' ? `S${item.season || 1} E${item.episode || 1}` : item.title || ''}</h3>
      <div className="mt-0.5 flex items-center text-[12px] font-medium text-white/50"><span className="truncate">{item.mediaType === 'tv' ? item.title || '' : ''}</span>{item.timeLeft ? <span className={item.mediaType === 'tv' ? 'ml-2 shrink-0' : ''}>{item.timeLeft}m left</span> : null}</div>
    </div>
  </Link>;
}

function AvatarCarousel({ selected, onSelect }: { selected: string; onSelect: (avatar: string) => void }) {
  const index = Math.max(0, DEFAULT_AVATARS.indexOf(selected)); const [drag,setDrag]=useState(0); const start=useRef(0); const active=useRef(false);
  const move=(d:number)=>onSelect(DEFAULT_AVATARS[Math.max(0,Math.min(DEFAULT_AVATARS.length-1,index+d))]);
  const end=()=>{if(!active.current)return; const d=drag;active.current=false;setDrag(0);if(Math.abs(d)>42)move(d<0?1:-1)};
  return <div className="relative h-[224px] w-full overflow-hidden">
    <button type="button" aria-label="Previous avatar" onClick={()=>move(-1)} disabled={!index} className="absolute left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-3 disabled:opacity-0"><ChevronLeft className="h-6 w-6"/></button>
    <div className="absolute inset-0 touch-pan-y overflow-hidden" onPointerDown={(e:PointerEvent<HTMLDivElement>)=>{start.current=e.clientX;active.current=true;e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={(e:PointerEvent<HTMLDivElement>)=>{if(active.current)setDrag(Math.max(-130,Math.min(130,e.clientX-start.current)))}} onPointerUp={end} onPointerCancel={end}>
      <div className="absolute left-1/2 top-1/2 flex items-center gap-5" style={{transform:`translate(calc(-50px - ${index*120}px + ${drag}px), -50%)`,transition:active.current?'none':'transform 400ms cubic-bezier(.22,.9,.3,1)'}}>
        {DEFAULT_AVATARS.map((src,i)=>{const chosen=i===index;const dist=Math.abs(i-index);return <button type="button" key={`${src}-${i}`} onClick={()=>onSelect(src)} className="relative flex h-[100px] w-[100px] shrink-0 items-center justify-center" style={{transform:`scale(${chosen?1.4:1})`,opacity:chosen?1:Math.max(0,1-dist*.1),transition:'transform 400ms cubic-bezier(.22,.9,.3,1),opacity 300ms'}}><span className={`relative block h-20 w-20 overflow-visible rounded-full ${chosen?'ring-2 ring-white ring-offset-4 ring-offset-black':''}`}><img src={src} alt="" draggable={false} className="h-full w-full rounded-full object-cover" />{chosen&&<span className="absolute -bottom-1.5 -right-1.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-white text-black"><Check className="h-5 w-5" strokeWidth={3}/></span>}</span></button>})}
      </div>
    </div>
    <button type="button" aria-label="Next avatar" onClick={()=>move(1)} disabled={index===DEFAULT_AVATARS.length-1} className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-3 disabled:opacity-0"><ChevronRight className="h-6 w-6"/></button>
  </div>;
}

export default function Space() {
  const {profile}=useAuth(); const {showAds,setShowAds}=useAds(); const {profiles,activeProfile,activeId,setActiveId,addProfile,updateProfile,deleteProfile,isHydrated}=useProfiles();
  const {items:continueItems,isLoading:continueLoading}=useContinueWatching(); const {data:watchlist=[],isLoading:watchlistLoading}=useMyWatchlist(activeId);
  const [editing,setEditing]=useState(false),[adding,setAdding]=useState(false),[name,setName]=useState(''),[avatar,setAvatar]=useState(DEFAULT_AVATARS[0]);
  useEffect(()=>{if(activeProfile){setName(activeProfile.name);setAvatar(activeProfile.avatar)}},[activeProfile]);
  const save=()=>{const n=name.trim();if(!n||!activeId)return;updateProfile(activeId,{name:n,avatar});setEditing(false)};
  const add=()=>{const n=name.trim();if(!n)return;const id=addProfile(n,avatar);setActiveId(id);setAdding(false)};
  const remove=()=>{if(activeId&&window.confirm(`Delete ${activeProfile?.name||'profile'}?`)){deleteProfile(activeId);setEditing(false)}};
  if(!isHydrated)return <div className="min-h-screen bg-black"/>;
  return <div className="relative min-h-screen overflow-x-hidden bg-black font-sans text-white"><Seo title="My Space"/><Starfield/>
    <main className="relative z-10 pb-24 md:pl-[80px] lg:pl-[100px] md:pb-8">
      <div className="mb-10 w-full px-6 pt-12 md:px-12 md:pt-20">
        <div className="flex w-full flex-col items-center justify-between gap-6 md:flex-row md:items-start">
          <div className="flex w-full flex-col gap-1 md:w-[60%]"><Link href="/settings/subscription" className="group relative flex h-[56px] w-full items-center sm:h-[32px]"><h2 className="absolute flex items-center text-lg font-semibold text-white/90 transition-colors group-hover:text-white sm:text-xl"><span className="line-clamp-2 sm:line-clamp-1">{profile?.username || 'My Space'}</span><ChevronRight className="ml-1 h-5 w-5 shrink-0 text-white/60 transition-colors group-hover:text-white/90 sm:ml-2"/></h2></Link><p className="mt-1 text-sm font-medium text-white/60 sm:mt-0">{profile?.email || ''}</p></div>
          <div className="flex w-full flex-col items-end gap-4 self-start md:w-auto md:self-auto"><Link href="/settings" className="flex items-center gap-2 rounded-lg border border-transparent bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition-all hover:border-white/10 hover:bg-white/10"><Settings className="h-5 w-5 text-white/70"/>Help &amp; Settings</Link><div className="flex items-center gap-3"><span className="text-sm font-medium text-white/60">Show Ads</span><button type="button" aria-pressed={showAds} onClick={()=>setShowAds(!showAds)} className={`relative h-5 w-10 shrink-0 rounded-full outline-none transition-colors ${showAds?'bg-white':'bg-white/20'}`}><span className={`absolute top-[2px] h-4 w-4 rounded-full bg-black transition-transform ${showAds?'translate-x-[22px]':'translate-x-0.5'}`}/></button></div></div>
        </div>
      </div>

      <section className="mb-12 w-full px-6 md:px-12"><div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-semibold tracking-tight text-white/90">Profiles</h2><button type="button" onClick={()=>{if(activeProfile){setName(activeProfile.name);setAvatar(activeProfile.avatar);setEditing(true)}}} className="flex items-center gap-2 rounded-lg border border-transparent bg-white/5 px-4 py-2 text-sm font-semibold transition-colors hover:border-white/10 hover:bg-white/10"><Pencil className="h-4 w-4 text-white/70"/>Edit</button></div><div className="flex flex-wrap items-start gap-5 md:gap-8">{profiles.map(p=><ProfileAvatar key={p.id} src={p.avatar} name={p.name} selected={p.id===activeId} onClick={()=>setActiveId(p.id)}/>)}<button type="button" onClick={()=>{setName('');setAvatar(DEFAULT_AVATARS[0]);setAdding(true)}} className="group flex flex-col items-center gap-3 outline-none"><span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-dashed border-white/20 bg-white/5 transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/10 md:h-[120px] md:w-[120px]"><Plus className="h-6 w-6 text-white/60 transition-colors group-hover:text-white md:h-8 md:w-8"/></span><span className="text-sm font-semibold text-white/60 transition-colors group-hover:text-white/90">Add</span></button></div></section>

      <div className="mb-4"><section className="group/row relative mb-8"><h2 className="mb-3 px-6 text-lg font-semibold text-white/90 md:px-12">Watchlist</h2><div className="relative"><div className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-6 py-4 md:px-12">{watchlistLoading?Array.from({length:4}).map((_,i)=><div key={i} className="h-[225px] w-[150px] shrink-0 animate-pulse rounded-lg bg-white/5 sm:h-[255px] sm:w-[170px]"/>):watchlist.map((item:any)=><Link key={`${item.mediaType}-${item.titleId}`} href={`/title/${item.mediaType}/${item.titleId}`} className="group relative w-[150px] shrink-0 text-left transition-transform duration-200 sm:w-[170px]"><div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5 ring-2 ring-transparent transition-all group-hover:ring-white/30"><img alt={item.titleSnapshot?.title||''} loading="lazy" className="h-full w-full object-cover" src={imageOf(item.titleSnapshot?.posterPath)}/></div><div className="mt-2 truncate text-[14px] font-semibold tracking-tight text-white/90">{item.titleSnapshot?.title||''}</div><div className="mt-1 flex items-center text-[11px] font-medium text-white/50"><span>{item.titleSnapshot?.mediaType==='tv'?'Series':'Movie'}</span></div></Link>)}</div></div></section>
        {(continueLoading||continueItems.length>0)&&<section className="group relative mb-8"><div className="mb-4 flex w-full items-center justify-between gap-3 px-6 text-lg font-semibold text-white/90 md:gap-4 md:px-12"><div className="flex items-center gap-4"><h2>Continue Watching{activeProfile?.name?` for ${activeProfile.name}`:''}</h2><button type="button" className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/50"><Check className="h-3.5 w-3.5"/></button></div></div><div className="no-scrollbar flex gap-4 overflow-x-auto py-4 px-6 scroll-smooth md:px-12">{continueLoading?Array.from({length:2}).map((_,i)=><div key={i} className="aspect-video w-[220px] shrink-0 animate-pulse rounded-md bg-[#1a1c20] md:w-[260px] lg:w-[300px]"/>):continueItems.map(item=><ContinueCard key={`${item.mediaType}-${item.id}-${item.season||''}-${item.episode||''}`} item={item}/>)}</div></section>}
      </div>
    </main>

    {adding&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm"><div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#101012] p-6"><h2 className="mb-5 text-lg font-semibold">Add profile</h2><div className="mb-5 flex justify-center"><img src={avatar} alt="" className="h-24 w-24 rounded-full object-cover"/></div><div className="mb-5 grid max-h-56 grid-cols-4 gap-4 overflow-y-auto">{DEFAULT_AVATARS.map((a,i)=><button type="button" key={`${a}-${i}`} onClick={()=>setAvatar(a)}><img src={a} alt="" className={`mx-auto h-14 w-14 rounded-full object-cover ${avatar===a?'ring-2 ring-white ring-offset-2 ring-offset-[#101012]':'opacity-70'}`}/></button>)}</div><input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Profile Name" className="mb-4 h-12 w-full rounded-lg border border-white/15 bg-transparent px-4 outline-none"/><div className="flex gap-3"><button type="button" onClick={()=>setAdding(false)} className="flex-1 rounded-lg bg-white/5 py-3">Cancel</button><button type="button" disabled={!name.trim()} onClick={add} className="flex-1 rounded-lg bg-white py-3 font-semibold text-black disabled:opacity-40">Save</button></div></div></div>}

    {editing&&activeProfile&&<div className="fixed inset-0 z-[100] overflow-y-auto bg-black text-white"><header className="flex h-20 items-center px-6"><button type="button" aria-label="Back" onClick={()=>setEditing(false)} className="flex h-10 w-10 items-center justify-center rounded-full"><ArrowLeft className="h-6 w-6"/></button><h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold leading-7">Edit Profile</h2></header><main className="flex flex-col gap-12 px-4 pb-20"><div className="mt-16"><AvatarCarousel selected={avatar} onSelect={setAvatar}/></div><input value={name} onChange={e=>setName(e.target.value)} placeholder="Profile Name" className="h-[90px] w-full rounded-[10px] border border-white/15 bg-[#101012] px-5 text-[22px] font-medium outline-none placeholder:text-white/30"/><div className="flex flex-col gap-6"><button type="button" onClick={save} className="h-14 w-full rounded-[10px] bg-white text-base font-semibold text-black">Save &amp; Continue</button><button type="button" onClick={remove} className="w-full py-2 text-[15px] font-medium text-red-500">Delete profile</button></div></main></div>}
  </div>;
}
