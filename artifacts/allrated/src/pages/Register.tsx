import { FormEvent, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Seo } from '@/components/Seo';

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
      if (result.session) {
        navigate('/profiles');
      } else {
        setMessage('Account created. Check your email to confirm your account, then sign in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex items-center justify-center px-5 py-10">
      <Seo title="Create account" />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/brand/logo.png" alt="Bingr" className="mx-auto mb-6 h-16 w-16 object-contain" />
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-white/45">Your watch progress can follow you across devices.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
          <label className="mb-2 block text-sm font-medium text-white/70">Username</label>
          <input required value={username} onChange={(e) => setUsername(e.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30" placeholder="Your name" />
          <label className="mb-2 block text-sm font-medium text-white/70">Email</label>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30" placeholder="you@example.com" />
          <label className="mb-2 block text-sm font-medium text-white/70">Password</label>
          <input type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30" placeholder="••••••••" />
          <label className="mb-2 block text-sm font-medium text-white/70">Confirm password</label>
          <input type="password" autoComplete="new-password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30" placeholder="••••••••" />
          {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          {message && <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Create account
          </button>
          <p className="mt-5 text-center text-sm text-white/45">
            Already have an account? <Link href="/login"><span className="cursor-pointer text-white hover:underline">Sign in</span></Link>
          </p>
        </form>
      </div>
    </div>
  );
}
