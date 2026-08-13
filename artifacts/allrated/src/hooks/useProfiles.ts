import { useState, useEffect, useCallback } from "react";

const PROFILES_KEY = "bingr.profiles";
const ACTIVE_PROFILE_KEY = "bingr.activeProfile";

export const DEFAULT_AVATARS = [
  "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/25.png", // Groot
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

export interface Profile {
  id: string;
  name: string;
  avatar: string;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function getStoredProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function getStoredActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  } catch { /* ignore */ }
  return null;
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>(getStoredProfiles);
  const [activeId, setActiveIdState] = useState<string | null>(getStoredActiveId);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch { /* ignore */ }
  }, [profiles]);

  useEffect(() => {
    try {
      if (activeId) localStorage.setItem(ACTIVE_PROFILE_KEY, activeId);
    } catch { /* ignore */ }
  }, [activeId]);

  const activeProfile = profiles.find((p) => p.id === activeId) || profiles[0] || null;

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
  }, []);

  const addProfile = useCallback((name: string, avatar?: string) => {
    const newProfile: Profile = {
      id: generateId(),
      name: name.trim() || "New Profile",
      avatar: avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
    };
    setProfiles((prev) => [...prev, newProfile]);
    if (!activeId) setActiveIdState(newProfile.id);
    return newProfile.id;
  }, [activeId]);

  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activeId === id && next.length > 0) {
        setActiveIdState(next[0].id);
      }
      return next;
    });
  }, [activeId]);

  // Auto-create default profile if none exist
  useEffect(() => {
    if (profiles.length === 0) {
      const defaultId = generateId();
      const defaultProfile: Profile = {
        id: defaultId,
        name: "Sahil",
        avatar: DEFAULT_AVATARS[0],
      };
      setProfiles([defaultProfile]);
      setActiveIdState(defaultId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  };
}
