import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export const DEFAULT_AVATARS = [
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/25.png",
  ...Array.from({ length: 12 }, (_, i) => `https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/${i + 1}.png`),
];
export interface Profile { id: string; name: string; avatar: string; }
function generateId() { return Math.random().toString(36).slice(2, 9); }

export function useProfiles() {
  const { profile } = useAuth();
  const profileId = profile?.id || null;
  const profilesKey = `rabbitrip.profiles:${profileId || "guest"}`;
  const activeKey = `rabbitrip.activeProfile:${profileId || "guest"}`;
  const readProfiles = useCallback((): Profile[] => { try { const parsed = JSON.parse(localStorage.getItem(profilesKey) || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }, [profilesKey]);
  const readActiveId = useCallback(() => { try { return localStorage.getItem(activeKey); } catch { return null; } }, [activeKey]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [hydratedKey, setHydratedKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setHydratedKey("");
    setProfiles([]);
    setActiveIdState(null);
    if (!profileId) { setHydratedKey(profilesKey); return; }
    const nextProfiles = readProfiles();
    const storedActive = readActiveId();
    setProfiles(nextProfiles);
    setActiveIdState(storedActive && nextProfiles.some((p) => p.id === storedActive) ? storedActive : null);
    setIsEditing(false);
    setHydratedKey(profilesKey);
  }, [profileId, profilesKey, readProfiles, readActiveId]);

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
      setActiveIdState(id && profiles.some((p) => p.id === id) ? id : null);
    };
    window.addEventListener("rabbitrip:active-profile-updated", sync);
    return () => window.removeEventListener("rabbitrip:active-profile-updated", sync);
  }, [hydratedKey, profilesKey, profiles, readActiveId]);

  const activeProfile = profiles.find((p) => p.id === activeId) || null;
  const setActiveId = useCallback((id: string) => {
    if (hydratedKey !== profilesKey) return;
    setActiveIdState(id);
    try { localStorage.setItem(activeKey, id); } catch {}
    window.dispatchEvent(new Event("rabbitrip:active-profile-updated"));
  }, [activeKey, hydratedKey, profilesKey]);
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
