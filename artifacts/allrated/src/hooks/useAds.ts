import { useState, useEffect, useCallback } from "react";

const ADS_KEY = "bingr.show_ads";

export function useAds() {
  const [showAds, setShowAdsState] = useState(() => {
    try {
      const raw = localStorage.getItem(ADS_KEY);
      return raw ? JSON.parse(raw) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(ADS_KEY, JSON.stringify(showAds));
    } catch { /* ignore */ }
  }, [showAds]);

  const setShowAds = useCallback((val: boolean) => {
    setShowAdsState(val);
  }, []);

  return { showAds, setShowAds };
}
