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
function generateId() { return Math.random().toString(36).slice(2, 9); }

export function useProfiles() {
  const { profile } = useAuth();
  const profileId = profile?.id || null;
  const profilesKey = `rabbitrip.profiles:${profileId || "guest"}`;
  const activeKey = `rabbitrip.activeProfile:${profileId || "guest"}`;
  const readProfiles = useCallback((): Profile[] => {
    try { const parsed = JSON.parse(localStorage.getItem(profilesKey) || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }, [profilesKey]);
  const readActiveId = useCallback(() => { try { return localStorage.getItem(activeKey); } catch { return null; } }, [activeKey]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [hydratedKey, setHydratedKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setHydratedKey(""); setProfiles([]); setActiveIdState(null);
    if (!profileId) { setHydratedKey(profilesKey); return; }
    const nextProfiles = readProfiles();
    const storedActive = readActiveId();
    const nextActive = storedActive && nextProfiles.some((p) => p.id === storedActive)
      ? storedActive
      : nextProfiles[0]?.id || null;
    setProfiles(nextProfiles);
    setActiveIdState(nextActive);
    if (nextActive) {
      try { localStorage.setItem(activeKey, nextActive); } catch {}
    }
    setIsEditing(false);
    setHydratedKey(profilesKey);
  }, [profileId, profilesKey, activeKey, readProfiles, readActiveId]);

  useEffect(() => {
    if (hydratedKey !== profilesKey || !profileId) return;
    try { localStorage.setItem(profilesKey, JSON.stringify(profiles)); } catch {}
  }, [profiles, profilesKey, hydratedKey, profileId]);

  useEffect(() => {
    if (hydratedKey !== profilesKey || !profileId) return;
    try { if (activeId) localStorage.setItem(activeKey, activeId); else localStorage.removeItem(activeKey); } catch {}
  }, [activeId, activeKey, profilesKey, hydratedKey, profileId]);

  useEffect(() => {
    const sync = () => {
      if (hydratedKey !== profilesKey) return;
      const id = readActiveId();
      setActiveIdState(id && profiles.some((p) => p.id === id) ? id : profiles[0]?.id || null);
    };
    window.addEventListener("rabbitrip:active-profile-updated", sync);
    return () => window.removeEventListener("rabbitrip:active-profile-updated", sync);
  }, [hydratedKey, profilesKey, profiles, readActiveId]);

  const activeProfile = profiles.find((p) => p.id === activeId) || null;
  const setActiveId = useCallback((id: string) => {
    if (hydratedKey !== profilesKey || !profileId) return;
    setActiveIdState(id);
    try { localStorage.setItem(activeKey, id); } catch {}
    window.dispatchEvent(new Event("rabbitrip:active-profile-updated"));
  }, [activeKey, hydratedKey, profileId, profilesKey]);
  const addProfile = useCallback((name: string, avatar?: string) => {
    const newProfile = { id: generateId(), name: name.trim() || "New Profile", avatar: avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)] };
    setProfiles((prev) => [...prev, newProfile]);
    return newProfile.id;
  }, []);
  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p)), []);
  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activeId === id) {
        const nextActiveId = next[0]?.id || null;
        setActiveIdState(nextActiveId);
        try { if (nextActiveId) localStorage.setItem(activeKey, nextActiveId); else localStorage.removeItem(activeKey); } catch {}
        window.dispatchEvent(new Event("rabbitrip:active-profile-updated"));
      }
      return next;
    });
  }, [activeId, activeKey]);
  return { profiles, activeProfile, activeId, setActiveId, addProfile, updateProfile, deleteProfile, isEditing, setIsEditing, isHydrated: hydratedKey === profilesKey };
}
