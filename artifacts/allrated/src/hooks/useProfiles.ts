import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export const DEFAULT_AVATARS = [
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/25.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/1.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/2.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/3.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/4.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/5.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/6.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/7.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/8.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/9.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/10.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/11.png",
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/12.png",
];
export interface Profile { id: string; name: string; avatar: string; }
function generateId(): string { return Math.random().toString(36).slice(2, 9); }
export function useProfiles() {
  const { profile } = useAuth();
  const profileId = profile?.id || "guest";
  const profilesKey = `rabbitrip.profiles:${profileId}`;
  const activeKey = `rabbitrip.activeProfile:${profileId}`;
  const readProfiles = useCallback((): Profile[] => { try { const parsed = JSON.parse(localStorage.getItem(profilesKey) || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }, [profilesKey]);
  const readActiveId = useCallback((): string | null => { try { return localStorage.getItem(activeKey); } catch { return null; } }, [activeKey]);
  const [profiles, setProfiles] = useState<Profile[]>(readProfiles);
  const [activeId, setActiveIdState] = useState<string | null>(readActiveId);
  const [hydratedKey, setHydratedKey] = useState(profilesKey);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => { setHydratedKey(""); setProfiles(readProfiles()); setActiveIdState(readActiveId()); setIsEditing(false); setHydratedKey(profilesKey); }, [profileId, profilesKey, readProfiles, readActiveId]);
  useEffect(() => { if (hydratedKey !== profilesKey) return; try { localStorage.setItem(profilesKey, JSON.stringify(profiles)); } catch {} }, [profiles, profilesKey, hydratedKey]);
  useEffect(() => { try { if (activeId) localStorage.setItem(activeKey, activeId); else localStorage.removeItem(activeKey); } catch {} }, [activeId, activeKey]);
  useEffect(() => { const sync = () => setActiveIdState(readActiveId()); window.addEventListener("rabbitrip:active-profile-updated", sync); return () => window.removeEventListener("rabbitrip:active-profile-updated", sync); }, [readActiveId]);
  const activeProfile = profiles.find((p) => p.id === activeId) || null;
  const setActiveId = useCallback((id: string) => { setActiveIdState(id); try { localStorage.setItem(activeKey, id); } catch {} window.dispatchEvent(new Event("rabbitrip:active-profile-updated")); }, [activeKey]);
  const addProfile = useCallback((name: string, avatar?: string) => { const newProfile: Profile = { id: generateId(), name: name.trim() || "New Profile", avatar: avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)] }; setProfiles((prev) => [...prev, newProfile]); return newProfile.id; }, []);
  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p)), []);
  const deleteProfile = useCallback((id: string) => setProfiles((prev) => { const next = prev.filter((p) => p.id !== id); if (activeId === id) { const nextActiveId = next[0]?.id || null; setActiveIdState(nextActiveId); try { if (nextActiveId) localStorage.setItem(activeKey, nextActiveId); else localStorage.removeItem(activeKey); } catch {} window.dispatchEvent(new Event("rabbitrip:active-profile-updated")); } return next; }), [activeId, activeKey]);
  return { profiles, activeProfile, activeId, setActiveId, addProfile, updateProfile, deleteProfile, isEditing, setIsEditing };
}
