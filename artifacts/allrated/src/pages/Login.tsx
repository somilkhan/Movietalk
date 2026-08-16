import { FormEvent, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Seo } from '@/components/Seo';

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/profiles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex items-center justify-center px-5 py-10">
      <Seo title="Sign in" />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/brand/logo.png" alt="Bingr" className="mx-auto mb-6 h-16 w-16 object-contain" />
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-white/45">Sign in to sync your Bingr account across devices.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
          <label className="mb-2 block text-sm font-medium text-white/70">Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/30"
            placeholder="you@example.com"
          />
          <label className="mb-2 block text-sm font-medium text-white/70">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/30"
            placeholder="••••••••"
          />
          {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Sign in
          </button>
          <p className="mt-5 text-center text-sm text-white/45">
            New to Bingr? <Link href="/register"><span className="cursor-pointer text-white hover:underline">Create an account</span></Link>
          </p>
        </form>
      </div>
    </div>
  );
}
