import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Eye, EyeOff, Github, Loader2, Mail, ScanLine, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { beginOAuth, consumeOAuthCallback, resetPassword } from '@/lib/supabase';
import { Seo } from '@/components/Seo';

const posterColumns = [
  ['https://image.tmdb.org/t/p/w500/iPOn6DinuVyLY17YM9mKuPofV08.jpg','https://image.tmdb.org/t/p/w500/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg','https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg','https://image.tmdb.org/t/p/w500/sO3O1szSYuXLwtkobU5TExQ6Wfa.jpg','https://image.tmdb.org/t/p/w500/6JU7E8Vv2M11egkctWVOScxWR75.jpg','https://image.tmdb.org/t/p/w500/b7Dr8Chzse8VagexAporUu2RtLx.jpg'],
  ['https://image.tmdb.org/t/p/w500/7V0Ebks0GgpKvQ7QbLAIdX5dos4.jpg','https://image.tmdb.org/t/p/w500/gMYZZvnkVNTqSVnVCphWbPXwWwb.jpg','https://image.tmdb.org/t/p/w500/f1VCQIG2iCyOookdgOzwtUpwWC0.jpg','https://image.tmdb.org/t/p/w500/rzpHPSEgPTpRs8EHbygwsOw7jC0.jpg','https://image.tmdb.org/t/p/w500/rb94rKVIzLyfWufIN7WqLvadBDH.jpg','https://image.tmdb.org/t/p/w500/tSZ4aFpTGc8Oj52SuzPUUZ7WKL0.jpg'],
  ['https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178789-hNXjKFzUq7mk.jpg','https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg','https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx188139-1qIJfWxym8FX.jpg','https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx210031-TppgcHZh46LY.jpg','https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx200637-QLR5uv9SbQ69.jpg','https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx198409-EiWJXfYnvfu4.png'],
];

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.73-.06-1.45-.2-2.13H12v4.03h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.29Z"/><path fill="#34A853" d="M12 21.75c2.64 0 4.86-.87 6.48-2.36l-3.14-2.45c-.87.58-1.98.92-3.34.92-2.56 0-4.73-1.73-5.51-4.06H3.25v2.53A9.79 9.79 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M6.49 13.8A5.88 5.88 0 0 1 6.18 12c0-.62.11-1.23.31-1.8V7.67H3.25A9.78 9.78 0 0 0 2.2 12c0 1.57.38 3.06 1.05 4.33l3.24-2.53Z"/><path fill="#EA4335" d="M12 6.14c1.44 0 2.73.5 3.75 1.48l2.81-2.81C16.85 3.15 14.63 2.25 12 2.25a9.79 9.79 0 0 0-8.75 5.42L6.49 10.2C7.27 7.87 9.44 6.14 12 6.14Z"/></svg>;
}

function FakeQr() {
  return <div className="relative grid h-36 w-36 grid-cols-9 gap-1 rounded-lg bg-white p-2">
    {Array.from({ length: 81 }, (_, i) => {
      const finder = (x: number, y: number) => (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
      const x = i % 9, y = Math.floor(i / 9);
      return <span key={i} className={`rounded-[1px] ${finder(x,y) || ((i * 17 + i * i) % 7 < 3) ? 'bg-black' : 'bg-white'}`} />;
    })}
    <span className="absolute inset-0 m-auto flex h-8 w-8 items-center justify-center rounded-md border-2 border-white bg-black text-[6px] font-black text-white">RR</span>
  </div>;
}

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    consumeOAuthCallback().then((session) => {
      if (mounted && session) navigate('/profiles');
    }).catch((err) => {
      if (mounted) setError(err instanceof Error ? err.message : 'Social sign-in could not be completed.');
    });
    return () => { mounted = false; };
  }, [navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(''); setNotice(''); setLoading(true);
    try { await login(email.trim(), password); navigate('/profiles'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in.'); }
    finally { setLoading(false); }
  }

  function handleOAuth(provider: 'google' | 'github') {
    setError(''); setNotice(''); setOauthLoading(provider);
    try { beginOAuth(provider); } catch (err) { setOauthLoading(null); setError(err instanceof Error ? err.message : 'Social sign-in is unavailable.'); }
  }

  async function handleReset(event: FormEvent) {
    event.preventDefault();
    setError(''); setNotice(''); setResetLoading(true);
    try { await resetPassword(email.trim()); setNotice('Password reset email sent. Check your inbox.'); setResetOpen(false); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not send reset email.'); }
    finally { setResetLoading(false); }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070b] text-[#e9e9ee] selection:bg-white/20">
      <Seo title="Sign in" />
      <style>{`@keyframes rrMarqueeUp{from{transform:translateY(0)}to{transform:translateY(-50%)}}@keyframes rrMarqueeDown{from{transform:translateY(-50%)}to{transform:translateY(0)}}@keyframes rrReveal{from{opacity:0;transform:translateY(22px);filter:blur(8px)}to{opacity:1;transform:none;filter:blur(0)}}@keyframes rrGlow{0%,100%{opacity:.2;transform:scale(.96)}50%{opacity:.45;transform:scale(1.05)}}.rr-up{animation:rrMarqueeUp 34s linear infinite}.rr-down{animation:rrMarqueeDown 42s linear infinite}.rr-reveal{animation:rrReveal .75s cubic-bezier(.22,1,.36,1) both}.rr-glow{animation:rrGlow 7s ease-in-out infinite}`}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="rr-glow absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/[0.07] blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[#4752c4]/[0.14] blur-[140px]" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col">
        <div className="relative h-[180px] shrink-0 w-full overflow-hidden bg-black md:h-[220px]">
          <div className="absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-black to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[#07070b] via-black/90 to-transparent" />
          <div className="grid h-full grid-cols-3 gap-2 px-2 opacity-50 md:gap-3">
            {posterColumns.map((column, index) => <div key={index} className="h-full overflow-hidden"><div className={`flex flex-col gap-2 md:gap-3 ${index === 1 ? 'rr-down' : 'rr-up'}`}>{[...column,...column].map((src,i)=><img key={`${src}-${i}`} src={src} alt="" loading="lazy" className="aspect-[2/3] w-full shrink-0 rounded-xl object-cover" />)}</div></div>)}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="rr-reveal mx-auto flex w-full max-w-[900px] flex-1 flex-col justify-center px-6 py-7 md:px-10 md:py-8">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]"><img src="/brand/logo.png" alt="RabbitRip" className="h-8 w-8 object-contain" /></div>
              <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">Welcome back to RabbitRip</h1>
              <p className="mt-1.5 text-sm text-white/45">Sign in to continue watching and keep everything synced.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto_1.2fr] md:gap-8">
              <div className="hidden flex-col items-center text-center pt-1 pb-4 md:flex">
                <div className="rounded-xl border border-white/[0.08] bg-white p-3 shadow-2xl" aria-label="RabbitRip mobile QR preview"><FakeQr /></div>
                <p className="mt-4 text-sm font-semibold text-white">Open RabbitRip on mobile</p>
                <p className="mt-1.5 max-w-[210px] text-xs leading-relaxed text-white/40">Scan this code to open the RabbitRip login page on your phone.</p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#4752c4]/20 px-3 py-1.5 text-xs font-semibold text-white/70"><ScanLine className="h-3.5 w-3.5" /> Mobile access</span>
              </div>
              <div className="hidden items-center justify-center md:flex"><div className="flex h-full flex-col items-center"><div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/15 to-transparent"/><span className="my-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">or</span><div className="w-px flex-1 bg-gradient-to-b from-white/15 via-transparent to-transparent"/></div></div>

              <div className="flex flex-col gap-3.5 pb-4">
                <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.025] text-sm font-medium text-white transition hover:bg-white/[0.06] md:hidden" onClick={() => setNotice('Open the QR preview on a desktop device to scan it.') }><ScanLine className="h-[18px] w-[18px]" /> Scan QR code to log in</button>
                <div className="flex items-center gap-3 md:hidden"><span className="h-px flex-1 bg-white/[0.08]"/><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">or</span><span className="h-px flex-1 bg-white/[0.08]"/></div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                  <label className="flex items-center rounded-xl border border-white/[0.08] bg-[#252830]/50 transition focus-within:border-[#4752c4]"><span className="pl-3 text-white/35"><Mail className="h-4 w-4"/></span><input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="h-12 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/25"/></label>
                  <label className="flex items-center rounded-xl border border-white/[0.08] bg-[#252830]/50 transition focus-within:border-[#4752c4]"><span className="pl-3 text-white/35"><span className="text-sm">••</span></span><input required minLength={6} type={showPassword?'text':'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="h-12 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/25"/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="px-3 text-white/35 transition hover:text-white/80" aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></label>
                  <div className="flex justify-end -mt-0.5"><button type="button" onClick={()=>setResetOpen(true)} className="text-xs font-medium text-white/45 transition hover:text-white">Forgot password?</button></div>
                  {error && <div className="rounded-xl border border-red-400/15 bg-red-500/[0.07] px-3 py-2.5 text-xs leading-5 text-red-200">{error}</div>}
                  {notice && <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/[0.07] px-3 py-2.5 text-xs leading-5 text-emerald-200">{notice}</div>}
                  <button disabled={loading||!!oauthLoading} type="submit" className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4752c4] px-6 text-base font-semibold text-white shadow-[0_8px_30px_-10px_rgba(71,82,196,.9)] transition hover:bg-[#5865d8] active:bg-[#3c45a8] disabled:pointer-events-none disabled:opacity-50">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<><span>Sign in</span><ArrowRight className="h-4 w-4"/></>}</button>
                </form>

                <div className="flex items-center gap-3 py-0.5"><span className="h-px flex-1 bg-white/[0.08]"/><span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">or continue with</span><span className="h-px flex-1 bg-white/[0.08]"/></div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={()=>handleOAuth('google')} disabled={!!oauthLoading||loading} className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.025] text-sm font-medium text-white/80 transition hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-50">{oauthLoading==='google'?<Loader2 className="h-4 w-4 animate-spin"/>:<GoogleIcon/>}<span>Google</span></button>
                  <button type="button" onClick={()=>handleOAuth('github')} disabled={!!oauthLoading||loading} className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.025] text-sm font-medium text-white/80 transition hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-50">{oauthLoading==='github'?<Loader2 className="h-4 w-4 animate-spin"/>:<Github className="h-4 w-4"/>}<span>GitHub</span></button>
                </div>
                <p className="mt-1 text-center text-xs text-white/45">New to RabbitRip? <Link href="/register" className="font-semibold text-white hover:underline underline-offset-4">Create an account</Link></p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] bg-white/[0.015] px-6 py-4 md:px-10"><div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-2 md:flex-row"><p className="text-center text-[11px] leading-relaxed text-white/35 md:text-left">By continuing you agree to our <Link href="/legal/terms" className="underline hover:text-white/70">Terms</Link>, <Link href="/legal/privacy" className="underline hover:text-white/70">Privacy</Link> and <Link href="/legal/dmca" className="underline hover:text-white/70">DMCA</Link>.</p><Link href="/help" className="text-xs font-medium text-white/60 hover:text-white">Get Help</Link></div></div>
        </div>
      </main>

      {resetOpen && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"><form onSubmit={handleReset} className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#252830] p-6 shadow-2xl"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4752c4]/20"><Mail className="h-4 w-4"/></div><div><h2 className="font-semibold">Reset password</h2><p className="text-xs text-white/40">We'll send a recovery link.</p></div></div><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="mt-5 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm outline-none focus:border-[#4752c4]"/><div className="mt-5 flex gap-3"><button type="button" onClick={()=>setResetOpen(false)} className="h-11 flex-1 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white">Cancel</button><button disabled={resetLoading} className="h-11 flex-1 rounded-xl bg-[#4752c4] text-sm font-semibold text-white disabled:opacity-50">{resetLoading?'Sending…':'Send link'}</button></div></form></div>}
    </div>
  );
}
