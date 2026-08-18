import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export const DEFAULT_AVATARS = [
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v2/feature/profile/38_jv.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/24.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/12.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/1.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/23.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/9.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/25.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/4.png",
  "https://img10.hotstar.com/image/upload/f_auto,q_90,w_256/feature/profile/Additional%20Profile%20Avatars/Loki.png",
  "https://img10.hotstar.com/image/upload/f_auto,q_90,w_256/feature/profile/Additional%20Profile%20Avatars/Wanda.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/26.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/11.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/7.png",
  "https://img10.hotstar.com/image/upload/f_auto,q_90,w_256/feature/profile/Additional%20Profile%20Avatars/Shang_chi.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/15.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/22.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/8.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/27.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/10.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/14.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/5.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/2.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/37.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/3.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/35.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/13.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/32.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/29.png",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Shashi&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Kiddo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Mickey&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Loki&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Thor&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Hulk&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Spider&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Strange&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Nova&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Aria&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Kai&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Zara&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
];

export interface Profile { id: string; name: string; avatar: string; }
function generateId() { return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11); }

function safeRead<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useProfiles() {
  const { profile } = useAuth();
  const profileId = profile?.id || null;
  const profilesKey = `rabbitrip.profiles:${profileId || "guest"}`;
  const activeKey = `rabbitrip.activeProfile:${profileId || "guest"}`;

  const readStoredProfiles = useCallback(() => {
    const stored = safeRead<Profile[]>(profilesKey, []);
    return Array.isArray(stored) ? stored : [];
  }, [profilesKey]);

  const readStoredActive = useCallback(() => {
    try { return localStorage.getItem(activeKey); } catch { return null; }
  }, [activeKey]);

  const initialProfiles = profileId ? readStoredProfiles() : [];
  const initialActive = (() => {
    const stored = profileId ? readStoredActive() : null;
    if (stored && initialProfiles.some((item) => item.id === stored)) return stored;
    return initialProfiles[0]?.id ?? null;
  })();

  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [activeId, setActiveIdState] = useState<string | null>(initialActive);
  const [hydratedKey, setHydratedKey] = useState(profileId ? profilesKey : "guest");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setProfiles([]);
      setActiveIdState(null);
      setHydratedKey("guest");
      return;
    }
    const stored = readStoredProfiles();
    const storedActive = readStoredActive();
    const nextActive = storedActive && stored.some((item) => item.id === storedActive)
      ? storedActive
      : stored[0]?.id ?? null;
    setProfiles(stored);
    setActiveIdState(nextActive);
    setHydratedKey(profilesKey);
    if (nextActive) {
      try { localStorage.setItem(activeKey, nextActive); } catch {}
    }
  }, [profileId, profilesKey, activeKey, readStoredProfiles, readStoredActive]);

  const persistProfiles = useCallback((next: Profile[]) => {
    try { localStorage.setItem(profilesKey, JSON.stringify(next)); } catch {}
  }, [profilesKey]);

  const persistActive = useCallback((id: string | null) => {
    try {
      if (id) localStorage.setItem(activeKey, id);
      else localStorage.removeItem(activeKey);
    } catch {}
    window.dispatchEvent(new CustomEvent("rabbitrip:active-profile-updated", { detail: { id } }));
  }, [activeKey]);

  const setActiveId = useCallback((id: string) => {
    if (!profileId) return;
    setActiveIdState(id);
    persistActive(id);
  }, [profileId, persistActive]);

  const addProfile = useCallback((name: string, avatar?: string) => {
    const newProfile: Profile = {
      id: generateId(),
      name: name.trim() || "New Profile",
      avatar: avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
    };
    setProfiles((prev) => {
      const next = [...prev, newProfile];
      persistProfiles(next);
      return next;
    });
    return newProfile.id;
  }, [persistProfiles]);

  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles((prev) => {
      const next = prev.map((item) => item.id === id ? { ...item, ...updates } : item);
      persistProfiles(next);
      return next;
    });
  }, [persistProfiles]);

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const next = prev.filter((item) => item.id !== id);
      persistProfiles(next);
      if (activeId === id) {
        const nextActive = next[0]?.id ?? null;
        setActiveIdState(nextActive);
        persistActive(nextActive);
      }
      return next;
    });
  }, [activeId, persistActive, persistProfiles]);

  useEffect(() => {
    const sync = (event: Event) => {
      const customEvent = event as CustomEvent<{ id?: string | null }>;
      const incoming = customEvent.detail?.id ?? readStoredActive();
      setActiveIdState(incoming && profiles.some((item) => item.id === incoming) ? incoming : profiles[0]?.id ?? null);
    };
    window.addEventListener("rabbitrip:active-profile-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("rabbitrip:active-profile-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [profiles, readStoredActive]);

  const activeProfile = profiles.find((item) => item.id === activeId) || null;

  return {
    profiles,
    activeProfile,
    activeId,
    setActiveId,
    addProfile,
    updateProfile,
    deleteProfile,
    isEditing,
    setIsEditing,
    isHydrated: hydratedKey === profilesKey || (!profileId && hydratedKey === "guest"),
  };
}
