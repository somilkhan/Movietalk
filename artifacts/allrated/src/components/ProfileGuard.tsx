import { useEffect } from "react";
import { useLocation } from "wouter";
import { useProfiles } from "@/hooks/useProfiles";

const PUBLIC_ROUTES = ["/profiles", "/login", "/register", "/watch", "/title"];

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { activeProfile, profiles } = useProfiles();

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some((r) => location.startsWith(r));
    if (!isPublic && profiles.length > 0 && !activeProfile) {
      navigate("/profiles");
    }
  }, [location, activeProfile, profiles.length, navigate]);

  return <>{children}</>;
}
