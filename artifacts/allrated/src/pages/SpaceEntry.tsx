import { ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useAds } from "@/hooks/useAds";
import { Seo } from "@/components/Seo";
import Space from "@/pages/Space";

const posterColumns = [
  ["https://image.tmdb.org/t/p/w500/iPOn6DinuVyLY17YM9mKuPofV08.jpg","https://image.tmdb.org/t/p/w500/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg","https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg","https://image.tmdb.org/t/p/w500/sO3O1szSYuXLwtkobU5TExQ6Wfa.jpg","https://image.tmdb.org/t/p/w500/6JU7E8Vv2M11egkctWVOScxWR75.jpg"],
  ["https://image.tmdb.org/t/p/w500/7V0Ebks0GgpKvQ7QbLAIdX5dos4.jpg","https://image.tmdb.org/t/p/w500/gMYZZvnkVNTqSVnVCphWbPXwWwb.jpg","https://image.tmdb.org/t/p/w500/f1VCQIG2iCyOookdgOzwtUpwWC0.jpg","https://image.tmdb.org/t/p/w500/rzpHPSEgPTpRs8EHbygwsOw7jC0.jpg","https://image.tmdb.org/t/p/w500/rb94rKVIzLyfWufIN7WqLvadBDH.jpg"],
  ["https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178789-hNXjKFzUq7mk.jpg","https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg","https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx188139-1qIJfWxym8FX.jpg","https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx210031-TppgcHZh46LY.jpg","https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx200637-QLR5uv9SbQ69.jpg"],
];

function LoggedOutSpace() {
  const { showAds, setShowAds } = useAds();
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070b] text-white" data-testid="page-space-logged-out">
      <Seo title="My Space" />
      <style>{`@keyframes spaceMarqueeA{from{transform:translateY(0)}to{transform:translateY(-50%)}}@keyframes spaceMarqueeB{from{transform:translateY(-50%)}to{transform:translateY(0)}}@keyframes spaceFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-12px,0)}}@keyframes spaceReveal{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:none}}.space-marquee-a{animation:spaceMarqueeA 34s linear infinite}.space-marquee-b{animation:spaceMarqueeB 42s linear infinite}.space-float{animation:spaceFloat 7s ease-in-out infinite}.space-reveal{animation:spaceReveal .7s cubic-bezier(.22,1,.36,1) both}`}</style>
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-white/[0.045] blur-[110px]" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-[#5b61ff]/[0.08] blur-[130px]" />
      <div className="relative z-20 flex items-center justify-end gap-4 px-6 pt-6 md:px-12">
        <Link href="/settings/help" className="inline-flex items-center gap-1.5 text-xs font-medium text-white/65 transition hover:text-white"><HelpCircle className="h-3.5 w-3.5" /> Help &amp; Support</Link>
        <div className="hidden h-4 w-px bg-white/10 sm:block" />
        <div className="flex items-center gap-3"><span className="text-xs font-medium text-white/45">Show Ads</span><button type="button" aria-pressed={showAds} onClick={() => setShowAds(!showAds)} className={`relative h-5 w-10 rounded-full transition-colors ${showAds ? "bg-white" : "bg-white/15"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${showAds ? "translate-x-[22px]" : "translate-x-0.5"}`} /></button></div>
      </div>
      <main className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 pb-28 pt-8 md:pb-12">
        <section className="space-reveal w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.025] shadow-[0_30px_120px_rgba(0,0,0,.42)] backdrop-blur-xl">
          <div className="relative h-[190px] w-full overflow-hidden bg-black md:h-[235px]">
            <div className="absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black to-transparent" /><div className="absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[#07070b] via-black/80 to-transparent" />
            <div className="grid h-full grid-cols-3 gap-2 px-2 opacity-50 md:gap-3">{posterColumns.map((column,index)=><div key={index} className="relative h-full overflow-hidden"><div className={`flex flex-col gap-2 md:gap-3 ${index===1?"space-marquee-b":"space-marquee-a"}`}>{[...column,...column].map((src,i)=><img key={`${src}-${i}`} src={src} alt="" className="aspect-[2/3] w-full shrink-0 rounded-xl object-cover" loading="lazy" />)}</div></div>)}</div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#07070b]/30 via-transparent to-[#07070b]/30" />
          </div>
          <div className="space-float relative flex flex-col items-center px-7 py-10 text-center md:px-10 md:py-12">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.06] shadow-[0_18px_60px_rgba(0,0,0,.4)]"><img src="/brand/logo.png" alt="RabbitRip" className="h-11 w-11 object-contain" /></div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30"><Sparkles className="h-3.5 w-3.5" /> RabbitRip</div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Log in to RabbitRip</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/50">Start watching from where you left off, personalise your space and keep your progress synced across devices.</p>
            <Link href="/login" className="group mt-7 inline-flex h-12 min-w-[190px] items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-bold text-black shadow-[0_14px_45px_rgba(255,255,255,.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/90">Log In <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            <p className="mt-4 text-[11px] text-white/25">Your watchlist, history and progress stay tied to your RabbitRip account.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function SpaceEntry() {
  const { isLoggedIn, isReady } = useAuth();
  if (!isReady) return <div className="min-h-screen bg-[#07070b]" />;
  return isLoggedIn ? <Space /> : <LoggedOutSpace />;
}
