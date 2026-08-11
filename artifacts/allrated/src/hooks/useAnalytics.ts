import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

const UMAMI_SCRIPT_URL = import.meta.env.VITE_UMAMI_SCRIPT_URL || '';
const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID || '';

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
    };
  }
}

export function useAnalytics() {
  const [location] = useLocation();

  // Track page views
  useEffect(() => {
    if (window.umami) {
      window.umami.track('pageview', { path: location });
    }
  }, [location]);

  const trackEvent = useCallback((event: string, data?: Record<string, unknown>) => {
    if (window.umami) {
      window.umami.track(event, data);
    }
  }, []);

  return { trackEvent };
}

export function initAnalytics() {
  if (!UMAMI_SCRIPT_URL || !UMAMI_WEBSITE_ID) return;

  // Check if already loaded
  if (document.querySelector(`script[data-website-id="${UMAMI_WEBSITE_ID}"]`)) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = UMAMI_SCRIPT_URL;
  script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
  script.setAttribute('data-auto-track', 'false'); // We handle tracking manually
  document.head.appendChild(script);
}
