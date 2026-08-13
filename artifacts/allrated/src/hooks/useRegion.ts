import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "allrated_region";
export type RegionCode = "IN" | "US" | "GB" | "JP" | "KR" | "FR" | "DE" | "BR" | "MX" | "AU";

export const REGIONS: { code: RegionCode; label: string; flag: string }[] = [
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "JP", label: "Japan", flag: "🇯🇵" },
  { code: "KR", label: "South Korea", flag: "🇰🇷" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "BR", label: "Brazil", flag: "🇧🇷" },
  { code: "MX", label: "Mexico", flag: "🇲🇽" },
  { code: "AU", label: "Australia", flag: "🇦🇺" },
];

export function getStoredRegion(): RegionCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && REGIONS.some((r) => r.code === stored)) {
      return stored as RegionCode;
    }
  } catch {
    // ignore
  }
  const locale = navigator.language;
  if (locale?.startsWith("en-IN") || locale?.startsWith("hi")) return "IN";
  if (locale?.startsWith("en-US")) return "US";
  if (locale?.startsWith("en-GB")) return "GB";
  if (locale?.startsWith("ja")) return "JP";
  if (locale?.startsWith("ko")) return "KR";
  return "IN";
}

export function useRegion() {
  const [region, setRegionState] = useState<RegionCode>(getStoredRegion);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, region);
    } catch {
      // ignore
    }
  }, [region]);

  const setRegion = useCallback((r: RegionCode) => {
    setRegionState(r);
    window.location.reload();
  }, []);

  return { region, setRegion, regions: REGIONS };
}
