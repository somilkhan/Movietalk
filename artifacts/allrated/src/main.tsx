import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './rabbit-polish.css';
import './player-watermark.css';
import './subtitle-polyfill';
import { initAnalytics } from '@/hooks/useAnalytics';
import { consumeOAuthCallback } from '@/lib/supabase';

// Complete Supabase's implicit OAuth callback before React mounts. This makes
// Google/GitHub redirects reliable even when the browser restores a stale
// /login document or the route is rendered before Login.tsx's effect runs.
async function bootstrapOAuthCallback() {
  if (!window.location.hash.includes('access_token=')) return;
  try {
    await consumeOAuthCallback();
  } catch (error) {
    console.error('OAuth callback failed:', error);
  }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.error('SW registration failed:', err));
  });
}

// Initialize analytics
initAnalytics();

void bootstrapOAuthCallback().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
