import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Eye, EyeOff, Github, Loader2, Mail, ScanLine } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { beginOAuth, consumeOAuthCallback, resetPassword } from '@/lib/supabase';
import { Seo } from '@/components/Seo';

const posterColumns = [
  ['https://image.tmdb.org/t/p/w500/iPOn6DinuVyLY17YM9mKuPofV08.jpg','https://image.tmdb.org/t/p/w500/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg','https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg','https://image.tmdb.org/t/p/w500/sO3O1szSYuXLwtkobU5TExQ6Wfa.jpg','https://image.tmdb.org/t/p/w500/6JU7E8Vv2M11egkctWVOScxWR75.jpg','https://image.tmdb.org/t/p/w500/b7Dr8Chzse8VagexAporUu2RtLx.jpg'],
  ['https://image.tmdb.org/t/p/w500/7V0Ebks0GgpKvQ7QbLAIdX5dos4.jpg','https://image.tmdb.org/t/p/w500/gMYZZvnkVNTqSVnVCphWbPXwWwb.jpg','https://image.tmdb.org/t/p/w500/f1VCQIG2iCyOookdgOzwtUpwWC0.jpg','https://image.tmdb.org/t/p/w500/rzpHPSEgPTpRs8EHbygwsOw7jC0.jpg','https://image.tmdb.org/t/p/w500/rb94rKVIzLyfWufIN7WqLvadBDH.jpg','https://image.tmdb.org/t/p/w500/tSZ4aFpTGc8Oj52SuzPUUZ7WKL0.jpg'],
  ['https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178789-hNXjKFzUq7mk.jpg','https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg','https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx188139-1qIJfWxym8FX.jpg','https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx210031-TppgcHZh46LY.jpg','https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx200637-QLR5uv9SbQ69.jpg','https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx198409-EiWJXfYnvfu4.png'],
];

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.73-.06-1.45-.2-2.13H12v4.03h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.29Z"/><path fill="#34A853" d="M12 21.75c2.64 0 4.86-.87 6.48-2.36l-3.14-2.45c-.87.58-1.98.92-3.34.92-2.56 0-4.73-1.73-5.51-4.06H3.25v2.53A9.79 9.79 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M6.49 13.8A5.88 5.88 0 0 1 6.18 12c0-.62.11-1.23.31-1.8V7.67H3.25A9.78 9.78 0 0 0 2.2 12c0 1.57.38 3.06 1.05 4.33l3.24-2.53Z"/><path fill="#EA4335" d="M12 6.14c1.44 0 2.73.5 3.75 1.48l2.81-2.81C16.85 3.15 14.63 2.25 12 2.25a9.79 9.79 0 0 0-8.75 5.42L6.49 10.2C7.27 7.87 9.44 6.14 12 6.14Z"/></svg>;
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
    <div className="relative min-h-screen overflow-hidden bg-[#000] text-white">
      <Seo title="Sign in" />
      <style>{`@keyframes rrUp{from{transform:translateY(0)}to{transform:translateY(-50%)}}@keyframes rrDown{from{transform:translateY(-50%)}to{transform:translateY(0)}}.rr-up{animation:rrUp 42s linear infinite}.rr-down{animation:rrDown 48s linear infinite}@media(prefers-reduced-motion:reduce){.rr-up,.rr-down{animation:none}}`}</style>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
        <div className="grid grid-cols-3 gap-[10.8px] px-0 opacity-[0.48]">
          {posterColumns.map((column, index) => (
            <div key={index} className="min-w-0 overflow-hidden">
              <div className={`flex flex-col gap-[12.6px] ${index === 1 ? 'rr-down' : 'rr-up'}`}>
                {[...column, ...column, ...column].map((src, i) => <img key={`${src}-${i}`} src={src} alt="" className="block aspect-[2/3] w-full rounded-[12px] object-cover" />)}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.18)_0%,rgba(0,0,0,.3)_20%,rgba(0,0,0,.76)_48%,#000_62%,#000_100%)]" />
      </div>

      <header className="absolute inset-x-0 top-0 z-30 flex h-14 items-center px-4">
        <button type="button" onClick={() => navigate('/')} aria-label="Back" className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10">
          <ArrowLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <span className="ml-1 text-base font-semibold tracking-tight">RabbitRip</span>
      </header>

      <main className="relative z-10 min-h-screen w-full">
        <div className="mx-auto flex min-h-screen w-full max-w-[408px] flex-col px-6 pb-8 pt-[258px]">
          <section className="w-full text-center">
            <h1 className="text-[20px] font-semibold leading-6 tracking-[-0.02em] text-white">Welcome back to RabbitRip</h1>
          </section>

          <button type="button" onClick={() => setNotice('QR login is available from the Bingr companion flow.')} className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.11] bg-black/35 text-[16px] font-medium text-white backdrop-blur-sm transition hover:bg-white/[0.05]">
            <ScanLine className="h-5 w-5" strokeWidth={2} />
            <span>Scan QR code to log in</span>
          </button>

          <div className="my-[18px] flex items-center gap-4"><span className="h-px flex-1 bg-white/[0.10]"/><span className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/45">OR</span><span className="h-px flex-1 bg-white/[0.10]"/></div>

          <form onSubmit={handleSubmit} className="flex w-full flex-col">
            <label className="flex h-12 w-full items-center rounded-xl border border-white/[0.10] bg-black/30 backdrop-blur-sm focus-within:border-white/25">
              <Mail className="ml-4 h-5 w-5 shrink-0 text-white/40" strokeWidth={1.8} />
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] text-white outline-none placeholder:text-white/35" />
            </label>

            <label className="mt-3 flex h-12 w-full items-center rounded-xl border border-white/[0.10] bg-black/30 backdrop-blur-sm focus-within:border-white/25">
              <span className="ml-4 text-[16px] tracking-[2px] text-white/40">••</span>
              <input required minLength={6} type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] text-white outline-none placeholder:text-white/35" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="mr-2 flex h-9 w-9 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white/75">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
            </label>

            <div className="mt-3 flex justify-end"><button type="button" onClick={() => setResetOpen(true)} className="text-[16px] font-medium text-white/55 hover:text-white">Forgot password?</button></div>
            {error && <div className="mt-3 rounded-xl border border-red-400/15 bg-red-500/[0.08] px-3 py-2 text-sm text-red-200">{error}</div>}
            {notice && <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/65">{notice}</div>}

            <button type="submit" disabled={loading || !!oauthLoading} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-[16px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Sign in</span>}
            </button>
          </form>

          <div className="my-[20px] flex items-center gap-4"><span className="h-px flex-1 bg-white/[0.10]"/><span className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/35">OR CONTINUE WITH</span><span className="h-px flex-1 bg-white/[0.10]"/></div>

          <div className="flex items-center justify-center gap-5">
            <button type="button" disabled={!!oauthLoading} onClick={() => handleOAuth('google')} aria-label="Continue with Google" className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.10] bg-black/30 text-white backdrop-blur-sm transition hover:bg-white/[0.06] disabled:opacity-50"><GoogleIcon /></button>
            <button type="button" disabled={!!oauthLoading} onClick={() => handleOAuth('github')} aria-label="Continue with GitHub" className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.10] bg-black/30 text-white backdrop-blur-sm transition hover:bg-white/[0.06] disabled:opacity-50"><Github className="h-5 w-5" strokeWidth={1.9} /></button>
          </div>

          <div className="mt-6 text-center text-[16px] text-white/50">New to RabbitRip? <Link href="/register"><span className="cursor-pointer font-semibold text-white hover:underline">Create an account</span></Link></div>
          <div className="mt-10 border-t border-white/[0.08] pt-4 text-center text-[12px] leading-5 text-white/35">By continuing you agree to our <span className="underline underline-offset-2">Terms</span>, <span className="underline underline-offset-2">Privacy</span> and <span className="underline underline-offset-2">DMCA</span>.</div>
        </div>
      </main>

      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm" role="dialog" aria-modal="true">
          <form onSubmit={handleReset} className="w-full max-w-[380px] rounded-2xl border border-white/10 bg-[#0a0a0b] p-5 shadow-2xl">
            <h2 className="text-lg font-semibold">Reset password</h2>
            <p className="mt-1 text-sm text-white/45">Enter your email and we’ll send a reset link.</p>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-4 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm outline-none placeholder:text-white/30 focus:border-white/25" />
            <div className="mt-4 flex gap-2"><button type="button" onClick={() => setResetOpen(false)} className="h-11 flex-1 rounded-xl border border-white/10 text-sm text-white/70">Cancel</button><button type="submit" disabled={resetLoading} className="h-11 flex-1 rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-50">{resetLoading ? 'Sending…' : 'Send link'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
