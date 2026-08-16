import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { getLastAuthMethod, type AuthMethod } from "@/lib/supabase";

const labels: Record<AuthMethod, string> = { google: "Google", github: "GitHub", email: "Email" };

export function LastLoginHint() {
  const [method, setMethod] = useState<AuthMethod | null>(null);
  useEffect(() => { setMethod(getLastAuthMethod()); }, []);
  if (!method) return null;
  return <div className="pointer-events-none fixed left-1/2 top-[226px] z-[100] hidden -translate-x-1/2 md:block"><div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 backdrop-blur-xl">Last used: {labels[method]} {method === "email" && <Mail className="ml-1 inline h-3 w-3" />}</div></div>;
}
