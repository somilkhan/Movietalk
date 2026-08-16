import { FormEvent, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Seo } from '@/components/Seo';

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await register(email.trim(), password, username.trim());
      if (result.session) navigate('/profiles');
      else setMessage('Account created. Check your email to confirm your account, then sign in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040405] text-white selection:bg-white/20">
      <Seo title="Create account" />
      <style>{`
        @keyframes authFloat { 0%,100% { transform:translate3d(0,0,0) scale(1); } 50% { transform:translate3d(0,-18px,0) scale(1.04); } }
        @keyframes authGlow { 0%,100% { opacity:.28; transform:scale(.96); } 50% { opacity:.52; transform:scale(1.06); } }
        @keyframes authReveal { from { opacity:0; transform:translateY(18px) scale(.985); filter:blur(8px); } to { opacity:1; transform:translateY(0) scale(1); filter:blur(0); } }
        @keyframes authShimmer { from { transform:translateX(-120%); } to { transform:translateX(120%); } }
        .auth-reveal { animation:authReveal .75s cubic-bezier(.22,1,.36,1) both; }
        .auth-float { animation:authFloat 8s ease-in-out infinite; }
        .auth-glow { animation:authGlow 6s ease-in-out infinite; }
        .auth-shimmer { animation:authShimmer 3.8s ease-in-out infinite; }
      `}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="auth-glow absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-white/[0.07] blur-[110px]" />
        <div className="auth-float absolute -right-28 top-[18%] h-[360px] w-[360px] rounded-full bg-[#5965ff]/[0.12] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)', backgroundSize:'44px 44px' }} />
      </div>
      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8 sm:px-6">
        <section className="auth-reveal w-full max-w-[430px]">
          <div className="mb-7 text-center">
            <div className="relative mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-[21px] border border-white/15 bg-white/[0.07] shadow-[0_20px_70px_rgba(0,0,0,.45)] backdrop-blur-xl">
              <img src="/brand/logo.png" alt="RabbitRip" className="h-11 w-11 object-contain" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#040405] bg-white text-black shadow-lg"><Sparkles className="h-3 w-3" /></span>
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.32em] text-white/35">RabbitRip</p>
            <h1 className="text-[32px] font-semibold tracking-[-0.04em] sm:text-[36px]">Make it yours.</h1>
            <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-white/40">Create an account and take your watchlist and progress with you.</p>
          </div>
          <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-[0_30px_100px_rgba(0,0,0,.48)] backdrop-blur-2xl sm:p-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden bg-white/10"><div className="auth-shimmer h-full w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" /></div>
            <div className="space-y-4">
              <div><label htmlFor="register-username" className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Username</label><input id="register-username" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" className="h-13 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-[15px] text-white placeholder:text-white/20 outline-none transition duration-300 focus:border-white/30 focus:bg-white/[0.06] focus:ring-4 focus:ring-white/[0.04]" /></div>
              <div><label htmlFor="register-email" className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Email</label><input id="register-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-13 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-[15px] text-white placeholder:text-white/20 outline-none transition duration-300 focus:border-white/30 focus:bg-white/[0.06] focus:ring-4 focus:ring-white/[0.04]" /></div>
              <div><label htmlFor="register-password" className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Password</label><div className="relative"><input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-13 w-full rounded-2xl border border-white/10 bg-black/25 px-4 pr-12 text-[15px] text-white placeholder:text-white/20 outline-none transition duration-300 focus:border-white/30 focus:bg-white/[0.06] focus:ring-4 focus:ring-white/[0.04]" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/10 hover:text-white/75" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
              <div><label htmlFor="register-confirm" className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Confirm password</label><div className="relative"><input id="register-confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="h-13 w-full rounded-2xl border border-white/10 bg-black/25 px-4 pr-12 text-[15px] text-white placeholder:text-white/20 outline-none transition duration-300 focus:border-white/30 focus:bg-white/[0.06] focus:ring-4 focus:ring-white/[0.04]" /><button type="button" onClick={() => setShowConfirm((value) => !value)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/10 hover:text-white/75" aria-label={showConfirm ? 'Hide password' : 'Show password'}>{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            </div>
            {error && <div className="mt-4 rounded-2xl border border-red-400/15 bg-red-500/[0.07] px-4 py-3 text-sm leading-5 text-red-200">{error}</div>}
            {message && <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.07] px-4 py-3 text-sm leading-5 text-emerald-200">{message}</div>}
            <button type="submit" disabled={loading} className="group relative mt-6 flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-4 text-[15px] font-bold text-black shadow-[0_14px_40px_rgba(255,255,255,.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-[0_18px_50px_rgba(255,255,255,.14)] disabled:pointer-events-none disabled:opacity-60">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {loading ? <Loader2 className="relative h-4 w-4 animate-spin" /> : <><span className="relative">Create account</span><ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></>}
            </button>
            <div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-white/8" /><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">Already a member?</span><span className="h-px flex-1 bg-white/8" /></div>
            <Link href="/login"><span className="group flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025] text-sm font-semibold text-white/70 transition duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white">Sign in <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>
          </form>
        </section>
      </main>
    </div>
  );
}
