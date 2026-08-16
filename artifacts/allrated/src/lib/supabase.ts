const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const SESSION_KEY = 'movietalk.supabase.session';

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  user: SupabaseUser;
}

function assertConfig() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase Auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }
}

function headers() {
  assertConfig();
  return { apikey: SUPABASE_KEY!, 'Content-Type': 'application/json' };
}

function readStoredSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SupabaseSession;
  } catch { return null; }
}

function storeSession(session: SupabaseSession | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
  window.dispatchEvent(new Event('movietalk:auth-changed'));
}

export function getStoredSession() { return readStoredSession(); }
export function getAccessToken() { return readStoredSession()?.access_token || null; }

async function request(path: string, init: RequestInit = {}) {
  assertConfig();
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: { ...headers(), ...(init.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.msg || payload?.message || payload?.error_description || payload?.error || `Supabase request failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
}

export function beginOAuth(provider: 'google' | 'github') {
  assertConfig();
  const redirectTo = `${window.location.origin}/login`;
  const url = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  url.searchParams.set('provider', provider);
  url.searchParams.set('redirect_to', redirectTo);
  window.location.assign(url.toString());
}

export async function consumeOAuthCallback() {
  if (typeof window === 'undefined' || !window.location.hash) return null;
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  if (!accessToken || !refreshToken) return null;

  const session = await request('/auth/v1/user', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  }) as SupabaseUser;

  const expiresIn = Number(hash.get('expires_in') || 3600);
  const expiresAt = Number(hash.get('expires_at') || Math.floor(Date.now() / 1000) + expiresIn);
  const next: SupabaseSession = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    expires_at: expiresAt,
    user: session,
  };
  storeSession(next);
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
  return next;
}

export async function signIn(email: string, password: string) {
  const session = await request('/auth/v1/token?grant_type=password', {
    method: 'POST', body: JSON.stringify({ email, password }),
  }) as SupabaseSession;
  storeSession(session);
  return session;
}

export async function signUp(email: string, password: string, username?: string) {
  const payload = await request('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, options: username ? { data: { username } } : undefined }),
  }) as SupabaseSession & { user: SupabaseUser; session: SupabaseSession | null };
  if (payload.session) storeSession(payload.session);
  return payload;
}

export async function signOut() {
  const token = getAccessToken();
  try {
    if (token) await request('/auth/v1/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  } catch {}
  storeSession(null);
}

export async function refreshSession() {
  const current = readStoredSession();
  if (!current?.refresh_token) return null;
  try {
    const session = await request('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', body: JSON.stringify({ refresh_token: current.refresh_token }),
    }) as SupabaseSession;
    storeSession(session);
    return session;
  } catch {
    storeSession(null);
    return null;
  }
}

export async function getSession() {
  const current = readStoredSession();
  if (!current) return null;
  const expiresAt = Number(current.expires_at || 0) * 1000;
  if (expiresAt && expiresAt < Date.now() + 30_000) return refreshSession();
  return current;
}

export function subscribeToAuthChanges(callback: (session: SupabaseSession | null) => void) {
  const handler = () => callback(readStoredSession());
  window.addEventListener('movietalk:auth-changed', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('movietalk:auth-changed', handler);
    window.removeEventListener('storage', handler);
  };
}
