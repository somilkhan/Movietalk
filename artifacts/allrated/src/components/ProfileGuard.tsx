import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const PUBLIC_ROUTES = ["/login", "/register"];

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { profile, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    const isPublic = PUBLIC_ROUTES.some(
      (route) => location === route || location.startsWith(`${route}/`),
    );
    if (!profile && !isPublic) navigate("/login");
    else if (profile && isPublic) navigate("/profiles");
  }, [location, profile, isReady, navigate]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white">
        <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
