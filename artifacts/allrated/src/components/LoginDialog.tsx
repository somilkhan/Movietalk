import { useState } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps) {
  const trapRef = useFocusTrap(open);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login'
      ? { email, password }
      : { email, password, username };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store profile in localStorage (matches real bingr.one)
      localStorage.setItem('bingr.profile', JSON.stringify(data.user || data));
      window.dispatchEvent(new Event('bingr:profile-updated'));
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={trapRef}
        className="bg-[#252830] border-[#ffffff1a] text-white max-w-sm"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => { setMode(v as 'login' | 'register'); setError(''); }}>
          <TabsList className="grid w-full grid-cols-2 bg-[#07070b]">
            <TabsTrigger value="login" className="data-[state=active]:bg-[#4752c4] data-[state=active]:text-black">
              <LogIn className="w-4 h-4 mr-2" /> Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-[#4752c4] data-[state=active]:text-black">
              <UserPlus className="w-4 h-4 mr-2" /> Sign Up
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="login" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#07070b] border-[#ffffff1a] text-white"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#07070b] border-[#ffffff1a] text-white"
                  placeholder="••••••••"
                />
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="reg-username">Username</Label>
                <Input
                  id="reg-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-[#07070b] border-[#ffffff1a] text-white"
                  placeholder="moviefan"
                />
              </div>
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#07070b] border-[#ffffff1a] text-white"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#07070b] border-[#ffffff1a] text-white"
                  placeholder="••••••••"
                />
              </div>
            </TabsContent>

            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#4752c4] text-black hover:bg-[#3d47b0] font-semibold"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
