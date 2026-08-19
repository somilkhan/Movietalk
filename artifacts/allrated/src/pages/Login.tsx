import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Eye, EyeOff, Github, Loader2, Mail, ScanLine, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { beginOAuth, consumeOAuthCallback, resetPassword } from '@/lib/supabase';
import { Seo } from '@/components/Seo';

const posterColumns = [
  [
    'https://image.tmdb.org/t/p/original/gaiMtK2ll6BLdK1qKFuZGDwwEuD.jpg',
    'https://image.tmdb.org/t/p/w500/iPOn6DinuVyLY17YM9mKuPofV08.jpg',
    'https://image.tmdb.org/t/p/w500/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg',
    'https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg',
    'https://image.tmdb.org/t/p/w500/sO3O1szSYuXLwtkobU5TExQ6Wfa.jpg',
    'https://image.tmdb.org/t/p/w500/6JU7E8Vv2M11egkctWVOScxWR75.jpg',
  ],
  [
    'https://www.impawards.com/tv/posters/special_ops_lioness_ver8_xxlg.jpg',
    'https://image.tmdb.org/t/p/w500/7V0Ebks0GgpKvQ7QbLAIdX5dos4.jpg',
    'https://image.tmdb.org/t/p/w500/gMYZZvnkVNTqSVnVCphWbPXwWwb.jpg',
    'https://image.tmdb.org/t/p/w500/f1VCQIG2iCyOookdgOzwtUpwWC0.jpg',
    'https://image.tmdb.org/t/p/w500/rzpHPSEgPTpRs8EHbygwsOw7jC0.jpg',
    'https://image.tmdb.org/t/p/w500/rb94rKVIzLyfWufIN7WqLvadBDH.jpg',
  ],
  [
    'https://pbs.twimg.com/media/HB1yo35WcAEpiWm.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178789-hNXjKFzUq7mk.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx188139-1qIJfWxym8FX.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx210031-TppgcHZh46LY.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx200637-QLR5uv9SbQ69.jpg',
  ],
];

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.73-.06-1.45-.2-2.13H12v4.03h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.29Z"/><path fill="#34A853" d="M12 21.75c2.64 0 4.86-.87 6.48-2.36l-3.14-2.45c-.87.58-1.98.92-3.34.92-2.56 0-4.73-1.73-5.51-4.06H3.25v2.53A9.79 9.79 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M6.49 13.8A5.88 5.88 0 0 1 6.18 12c0-.62.11-1.23.31-1.8V7.67H3.25A9.78 9.78 0 0 0 2.2 12c0 1.57.38 3.06 1.05 4.33l3.24-2.53Z"/><path fill="#EA4335" d="M12 6.14c1.44 0 2.73.5 3.75 1.48l2.81-2.81C16.85 3.15 14.63 2.25 12 2.25a9.79 9.79 0 0 0-8.75 5.42L6.49 10.2C7.27 7.87 9.44 6.14 12 6.14Z"/></svg>;
}

function FakeQr() {
  return <div className="relative grid h-36 w-36 grid-cols-9 gap-1 rounded-lg bg-white p-2">
    {Array.from({ length: 81 }, (_, i) => {
      const finder = (x: number, y: number) => (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
      const x = i % 9, y = Math.floor(i / 9);
      return <span key={i} className={`rounded-[1px] ${finder(x, y) || ((i * 17 + i * i) % 7 < 3) ? 'bg-black' : 'bg-white'}`} />;
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

  const submitDisabled = loading || !!oauthLoading || !email.trim() || !password;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-white/20">
      <Seo title="Sign in" />
      <style>{`@keyframes rrMarqueeUp{from{transform:translateY(0)}to{transform:translateY(-50%)}}@keyframes rrMarqueeDown{from{transform:translateY(-50%)}to{transform:translateY(0)}}.rr-up{animation:rrMarqueeUp 34s linear infinite}.rr-down{animation:rrMarqueeDown 42s linear infinite}`}</style>

      <main className="relative z-10 flex min-h-screen flex-col bg-black">
        <div className="relative h-[210px] w-full shrink-0 overflow-hidden bg-black md:h-[220px]">
          <div className="absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-black/55 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-black via-black/90 to-transparent" />

          <div className="absolute left-5 top-3 z-30 flex items-center gap-3 text-white">
            <ChevronLeft className="h-7 w-7 stroke-[2.25]" />
            <span className="text-[17px] font-semibold tracking-tight">RabbitRip</span>
          </div>

          <div className="grid h-full grid-cols-3 gap-3 px-0 opacity-[0.52]">
            {posterColumns.map((column, index) => (
              <div key={index} className="h-full overflow-hidden">
                <div className={`flex flex-col gap-3 ${index === 1 ? 'rr-down' : 'rr-up'}`}>
                  {[...column, ...column].map((src, i) => (
                    <img key={`${src}-${i}`} src={src} alt="" loading="eager" className="aspect-[2/3] w-full shrink-0 rounded-lg object-cover" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col bg-black">
          <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col px-6 pt-2">
            <div className="text-center">
              <h1 className="text-[20px] font-semibold leading-7 tracking-tight text-[#f5f5f5] md:text-2xl">Welcome back to RabbitRip</h1>
            </div>

            <div className="mt-2.5 flex flex-col">
              <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.11] bg-[#090909] text-[15px] font-medium text-white transition hover:bg-white/[0.04] md:hidden" onClick={() => setNotice('Open the QR preview on a desktop device to scan it.')}>
                <ScanLine className="h-[19px] w-[19px]" />
                <span>Scan QR code to log in</span>
              </button>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/[0.1]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">or</span>
                <span className="h-px flex-1 bg-white/[0.1]" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col">
                <label className="flex h-10 items-center rounded-xl border border-white/[0.1] bg-[#0a0a0a] transition focus-within:border-white/25">
                  <span className="pl-3 text-white/40"><Mail className="h-[19px] w-[19px]" /></span>
                  <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-white outline-none placeholder:text-white/30" />
                </label>

                <label className="mt-2 flex h-10 items-center rounded-xl border border-white/[0.1] bg-[#0a0a0a] transition focus-within:border-white/25">
                  <span className="pl-3 text-white/40"><span className="text-[14px] tracking-[2px]">••</span></span>
                  <input required minLength={6} type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-white outline-none placeholder:text-white/30" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="px-3 text-white/40 transition hover:text-white/80" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-[19px] w-[19px]" /> : <Eye className="h-[19px] w-[19px]" />}
                  </button>
                </label>

                <div className="mt-1.5 flex justify-end">
                  <button type="button" onClick={() => setResetOpen(true)} className="text-[13px] font-medium text-white/50 transition hover:text-white">Forgot password?</button>
                </div>

                {error && <div className="mt-2 rounded-xl border border-red-400/15 bg-red-500/[0.07] px-3 py-2.5 text-xs leading-5 text-red-200">{error}</div>}
                {notice && <div className="mt-2 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.07] px-3 py-2.5 text-xs leading-5 text-emerald-200">{notice}</div>}

                <button disabled={submitDisabled} type="submit" className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#808080] px-6 text-[15px] font-semibold text-black shadow-none transition hover:bg-[#8a8a8a] disabled:pointer-events-none disabled:opacity-100 disabled:bg-[#808080]">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Sign in</span><ArrowRight className="hidden h-4 w-4" /></>}
                </button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/[0.1]" />
                <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">or continue with</span>
                <span className="h-px flex-1 bg-white/[0.1]" />
              </div>

              <div className="grid grid-cols-2 justify-center gap-3 md:gap-4">
                <button type="button" onClick={() => handleOAuth('google')} disabled={!!oauthLoading || loading} aria-label="Continue with Google" className="group flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-[#090909] text-sm font-medium text-white/80 transition hover:border-white/[0.18] hover:bg-white/[0.05] hover:text-white md:h-11">
                  {oauthLoading === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                  <span className="hidden md:inline">Google</span>
                </button>
                <button type="button" onClick={() => handleOAuth('github')} disabled={!!oauthLoading || loading} aria-label="Continue with GitHub" className="group flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-[#090909] text-sm font-medium text-white/80 transition hover:border-white/[0.18] hover:bg-white/[0.05] hover:text-white md:h-11">
                  {oauthLoading === 'github' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Github className="h-5 w-5" />}
                  <span className="hidden md:inline">GitHub</span>
                </button>
              </div>

              <p className="mt-4 text-center text-[14px] text-white/45">New to RabbitRip? <Link href="/register" className="font-semibold text-white hover:underline underline-offset-4">Create an account</Link></p>
            </div>
          </div>

          <div className="border-t border-white/[0.06] bg-[#040404] px-6 py-3">
            <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-2 md:flex-row">
              <p className="text-center text-[10px] leading-relaxed text-white/35 md:text-left">By continuing you agree to our <Link href="/legal/terms" className="underline hover:text-white/70">Terms</Link>, <Link href="/legal/privacy" className="underline hover:text-white/70">Privacy</Link> and <Link href="/legal/dmca" className="underline hover:text-white/70">DMCA</Link>.</p>
              <Link href="/help" className="text-xs font-medium text-white/60 hover:text-white">Get Help</Link>
            </div>
          </div>
        </div>
      </main>

      {resetOpen && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"><form onSubmit={handleReset} className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#111217] p-6 shadow-2xl"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Mail className="h-4 w-4" /></div><div><h2 className="font-semibold">Reset password</h2><p className="text-xs text-white/40">We'll send a recovery link.</p></div></div><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-5 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm outline-none focus:border-white/30" /><div className="mt-5 flex gap-3"><button type="button" onClick={() => setResetOpen(false)} className="h-11 flex-1 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white">Cancel</button><button disabled={resetLoading} className="h-11 flex-1 rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-50">{resetLoading ? 'Sending…' : 'Send link'}</button></div></form></div>}
    </div>
  );
}
