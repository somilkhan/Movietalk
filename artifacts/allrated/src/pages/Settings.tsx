import { useState } from "react";
import { Link } from "wouter";
import { User, Lock, HelpCircle, LogOut, ChevronRight, Globe } from "lucide-react";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";
import { useRegion, REGIONS, type RegionCode } from "@/hooks/useRegion";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { href: "/settings/account", icon: <User className="h-[19px] w-[19px]" />, title: "Account & Devices", subtitle: "Manage account and signed-in devices" },
  { href: "/settings/parental", icon: <Lock className="h-[19px] w-[19px]" />, title: "Parental Controls", subtitle: "Manage parental lock and restrictions" },
  { href: "/settings/help", icon: <HelpCircle className="h-[19px] w-[19px]" />, title: "Help & Support", subtitle: "Get help with Bingr and your account" },
];

function MenuRow({ href, icon, title, subtitle }: { href: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Link href={href}>
      <a className="group flex min-h-[72px] w-full items-center justify-between rounded-xl border border-white/[0.045] bg-white/[0.018] px-4 py-3.5 text-left transition-colors hover:border-white/[0.08] hover:bg-white/[0.04] md:px-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.055] text-white/75 transition-colors group-hover:bg-white/[0.08] group-hover:text-white">{icon}</div>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-white/90 md:text-[15px]">{title}</div>
            <div className="mt-0.5 truncate text-[12px] font-medium text-white/40 md:text-[13px]">{subtitle}</div>
          </div>
        </div>
        <ChevronRight className="ml-4 h-5 w-5 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
      </a>
    </Link>
  );
}

export default function Settings() {
  const { logout } = useAuth();
  const { region, setRegion } = useRegion();
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const currentRegion = REGIONS.find((r) => r.code === region);

  return (
    <div className="min-h-screen bg-[#07070b] pb-28 text-white md:pb-10" data-testid="page-settings">
      <Seo title="Settings" />
      <main className="mx-auto w-full max-w-[860px] px-4 pt-8 sm:px-6 md:pt-14 lg:px-8">
        <header className="mb-7">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">Account</p>
          <h1 className="text-[24px] font-bold tracking-[-0.025em] text-white md:text-[28px]">Help &amp; Settings</h1>
        </header>

        <section className="mb-5 overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.018]">
          <button onClick={() => setShowRegionPicker((v) => !v)} className="group flex min-h-[72px] w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/[0.035] md:px-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.055] text-white/75"><Globe className="h-[19px] w-[19px]" /></div>
              <div><div className="text-[14px] font-semibold text-white/90 md:text-[15px]">Region</div><div className="mt-0.5 text-[12px] font-medium text-white/40 md:text-[13px]">{currentRegion ? `${currentRegion.flag} ${currentRegion.label}` : region}</div></div>
            </div>
            <ChevronRight className={cn("h-5 w-5 text-white/25 transition-all", showRegionPicker && "rotate-90 text-white/60")} />
          </button>
          {showRegionPicker && <div className="border-t border-white/[0.045] px-3 py-2 md:px-4">{REGIONS.map((r) => <button key={r.code} onClick={() => { setRegion(r.code as RegionCode); setShowRegionPicker(false); }} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors", region === r.code ? "bg-white/[0.08] text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white/85")}><span>{r.flag}</span><span className="font-medium">{r.label}</span>{region === r.code && <span className="ml-auto text-[11px] text-white/35">Active</span>}</button>)}</div>}
        </section>

        <section className="space-y-2.5">{MENU_ITEMS.map((item) => <MenuRow key={item.href} {...item} />)}</section>

        <div className="mt-8 border-t border-white/[0.045] pt-6">
          <button onClick={logout} className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-5 py-2.5 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white">Log Out</button>
        </div>
      </main>
    </div>
  );
}
