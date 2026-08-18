import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './bingr-parity.css';
import './player-watermark.css';
import './subtitle-polyfill';
import { initAnalytics } from '@/hooks/useAnalytics';
import { consumeOAuthCallback } from '@/lib/supabase';

async function bootstrapOAuthCallback() {
  if (!window.location.hash.includes('access_token=')) return;
  try {
    await consumeOAuthCallback();
  } catch (error) {
    console.error('OAuth callback failed:', error);
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.error('SW registration failed:', err));
  });
}

initAnalytics();

void bootstrapOAuthCallback().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
