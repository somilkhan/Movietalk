import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Eye, EyeOff, Github, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { beginOAuth, consumeOAuthCallback } from '@/lib/supabase';
import { Seo } from '@/components/Seo';

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.73-.06-1.45-.2-2.13H12v4.03h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.29Z"/><path fill="#34A853" d="M12 21.75c2.64 0 4.86-.87 6.48-2.36l-3.14-2.45c-.87.58-1.98.92-3.34.92-2.56 0-4.73-1.73-5.51-4.06H3.25v2.53A9.79 9.79 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M6.49 13.8A5.88 5.88 0 0 1 6.18 12c0-.62.11-1.23.31-1.8V7.67H3.25A9.78 9.78 0 0 0 2.2 12c0 1.57.38 3.06 1.05 4.33l3.24-2.53Z"/><path fill="#EA4335" d="M12 6.14c1.44 0 2.73.5 3.75 1.48l2.81-2.81C16.85 3.15 14.63 2.25 12 2.25a9.79 9.79 0 0 0-8.75 5.42L6.49 10.2C7.27 7.87 9.44 6.14 12 6.14Z"/></svg>;
}

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

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
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/profiles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally { setLoading(false); }
  }

  function handleOAuth(provider: 'google' | 'github') {
    setError('');
    setOauthLoading(provider);
    try { beginOAuth(provider); } catch (err) {
      setOauthLoading(null);
      setError(err instanceof Error ? err.message : 'Social sign-in is unavailable.');
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040405] text-white selection:bg-white/20">
      <Seo title="Sign in" />
      <style>{`@keyframes authFloat{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-18px,0) scale(1.04)}}@keyframes authGlow{0%,100%{opacity:.28;transform:scale(.96)}50%{opacity:.52;transform:scale(1.06)}}@keyframes authReveal{from{opacity:0;transform:translateY(18px) scale(.985);filter:blur(8px)}to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}@keyframes authShimmer{from{transform:translateX(-120%)}to{transform:translateX(120%)}}.auth-reveal{animation:authReveal .75s cubic-bezier(.22,1,.36,1) both}.auth-float{animation:authFloat 8s ease-in-out infinite}.auth-glow{animation:authGlow 6s ease-in-out infinite}.auth-shimmer{animation:authShimmer 3.8s ease-in-out infinite}`}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="auth-glow absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-white/[0.07] blur-[110px]" />
        <div className="auth-float absolute -right-28 top-[18%] h-[360px] w-[360px] rounded-full bg-[#5965ff]/[0.12] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)',backgroundSize:'44px 44px'}} />
      </div>
      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 sm:px-6">
        <section className="auth-reveal w-full max-w-[430px]">
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border border-white/15 bg-white/[0.07] shadow-[0_20px_70px_rgba(0,0,0,.45)] backdrop-blur-xl">
              <img src="/brand/logo.png" alt="Bingr" className="h-12 w-12 object-contain" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#040405] bg-white text-black shadow-lg"><Sparkles className="h-3 w-3" /></span>
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.32em] text-white/35">Bingr</p>
            <h1 className="text-[34px] font-semibold tracking-[-0.04em] sm:text-[38px]">Welcome back.</h1>
            <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-white/40">Sign in to continue watching and keep your progress synced across devices.</p>
          </div>

          <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-[0_30px_100px_rgba(0,0,0,.48)] backdrop-blur-2xl sm:p-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden bg-white/10"><div className="auth-shimmer h-full w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" /></div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleOAuth('google')} disabled={!!oauthLoading || loading} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] text-sm font-semibold text-white/80 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:pointer-events-none disabled:opacity-50">
                {oauthLoading === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />} Google
              </button>
              <button type="button" onClick={() => handleOAuth('github')} disabled={!!oauthLoading || loading} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] text-sm font-semibold text-white/80 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:pointer-events-none disabled:opacity-50">
                {oauthLoading === 'github' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />} GitHub
              </button>
            </div>

            <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-white/8" /><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">or continue with email</span><span className="h-px flex-1 bg-white/8" /></div>

            <div className="space-y-4">
              <div><label htmlFor="login-email" className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Email</label><input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-13 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-[15px] text-white placeholder:text-white/20 outline-none transition duration-300 focus:border-white/30 focus:bg-white/[0.06] focus:ring-4 focus:ring-white/[0.04]" /></div>
              <div><label htmlFor="login-password" className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Password</label><div className="relative"><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-13 w-full rounded-2xl border border-white/10 bg-black/25 px-4 pr-12 text-[15px] text-white placeholder:text-white/20 outline-none transition duration-300 focus:border-white/30 focus:bg-white/[0.06] focus:ring-4 focus:ring-white/[0.04]" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/10 hover:text-white/75" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            </div>

            {error && <div className="mt-4 rounded-2xl border border-red-400/15 bg-red-500/[0.07] px-4 py-3 text-sm leading-5 text-red-200">{error}</div>}
            <button type="submit" disabled={loading || !!oauthLoading} className="group relative mt-6 flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-4 text-[15px] font-bold text-black shadow-[0_14px_40px_rgba(255,255,255,.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-[0_18px_50px_rgba(255,255,255,.14)] disabled:pointer-events-none disabled:opacity-60">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {loading ? <Loader2 className="relative h-4 w-4 animate-spin" /> : <><span className="relative">Sign in</span><ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></>}
            </button>
            <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-white/8" /><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">New here?</span><span className="h-px flex-1 bg-white/8" /></div>
            <Link href="/register"><span className="group flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] text-sm font-semibold text-white/70 transition duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white">Create an account <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>
          </form>
          <p className="mt-6 text-center text-[11px] leading-5 text-white/20">Secure sign-in powered by Supabase Auth.</p>
        </section>
      </main>
    </div>
  );
}
