import { useState, useEffect, useCallback } from 'react';

const PROFILE_KEY = 'bingr.profile';
const SESSION_KEY = 'allrated_session_id';

interface Profile {
  id: string;
  email: string;
  username: string;
}

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      try { setProfile(JSON.parse(raw)); } catch { /* ignore */ }
    }
    setIsReady(true);

    const handler = () => {
      const r = localStorage.getItem(PROFILE_KEY);
      setProfile(r ? JSON.parse(r) : null);
    };
    window.addEventListener('bingr:profile-updated', handler);
    return () => window.removeEventListener('bingr:profile-updated', handler);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('bingr:profile-updated'));
  }, []);

  return { profile, isLoggedIn: !!profile, isReady, logout };
}

export function requireAuth(callback: () => void, onNeedLogin: () => void) {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (raw) {
    callback();
  } else {
    onNeedLogin();
  }
}
