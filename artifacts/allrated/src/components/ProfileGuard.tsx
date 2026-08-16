import { useEffect } from "react";
import { useLocation } from "wouter";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";

const PUBLIC_ROUTES = ["/login", "/register", "/space"];

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { profile, isReady } = useAuth();
  const { profiles, activeId } = useProfiles();

  useEffect(() => {
    if (!isReady) return;
    const isPublic = PUBLIC_ROUTES.some((route) => location === route || location.startsWith(`${route}/`));
    if (!profile && !isPublic) { navigate("/login"); return; }
    if (profile && (location === "/login" || location === "/register")) { navigate("/home"); return; }
    if (profile && !isPublic && location !== "/profiles") {
      const hasValidActiveProfile = Boolean(activeId && profiles.some((p) => p.id === activeId));
      if (!hasValidActiveProfile) navigate("/profiles");
    }
  }, [location, profile, isReady, activeId, profiles, navigate]);

  if (!isReady) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white"><div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-white animate-spin" /></div>;
  return <>{children}</>;
}
