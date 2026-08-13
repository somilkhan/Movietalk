import { useState } from "react";
import { Link } from "wouter";
import { User, Lock, HelpCircle, LogOut, ChevronRight, Globe } from "lucide-react";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";
import { useRegion, REGIONS, type RegionCode } from "@/hooks/useRegion";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  {
    href: "/settings/account",
    icon: <User className="w-5 h-5" />,
    title: "Account & Devices",
    subtitle: "Manage Account & Devices",
  },
  {
    href: "/settings/parental",
    icon: <Lock className="w-5 h-5" />,
    title: "Parental Controls",
    subtitle: "Parental Lock",
  },
  {
    href: "/settings/help",
    icon: <HelpCircle className="w-5 h-5" />,
    title: "Help & Support",
    subtitle: "Help Centre",
  },
];

function MenuRow({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href}>
      <button className="group w-full flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-white/[0.04] transition-all text-left">
        <div className="flex items-center gap-4">
          <div className="text-white/90">{icon}</div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-[15px] text-white/90">{title}</span>
            <span className="text-[13px] font-medium text-white/50">{subtitle}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
      </button>
    </Link>
  );
}

export default function Settings() {
  const { logout } = useAuth();
  const { region, setRegion } = useRegion();
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const currentRegion = REGIONS.find((r) => r.code === region);

  return (
    <div className="min-h-screen bg-[#07070b] text-white pb-28 md:pb-8" data-testid="page-settings">
      <Seo title="Settings" />
      <div className="relative z-10 pl-0 md:pl-[80px] lg:pl-[100px] pt-12 md:pt-20">
        <div className="px-6 md:px-12">
          <h1 className="text-[22px] font-semibold text-white/90 mb-6">Help &amp; Settings</h1>

          {/* Region Selector */}
          <div className="mb-4">
            <button
              onClick={() => setShowRegionPicker(!showRegionPicker)}
              className="group w-full flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-white/[0.04] transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-white/90"><Globe className="w-5 h-5" /></div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-[15px] text-white/90">Region</span>
                  <span className="text-[13px] font-medium text-white/50">
                    {currentRegion ? `${currentRegion.flag} ${currentRegion.label}` : region}
                  </span>
                </div>
              </div>
              <ChevronRight className={cn("w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors", showRegionPicker && "rotate-90")} />
            </button>

            {showRegionPicker && (
              <div className="mx-4 mt-1 mb-2 flex flex-col gap-1">
                {REGIONS.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => { setRegion(r.code as RegionCode); setShowRegionPicker(false); }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-colors",
                      region === r.code
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/[0.04] hover:text-white/80"
                    )}
                  >
                    <span className="text-base">{r.flag}</span>
                    <span>{r.label}</span>
                    {region === r.code && (
                      <span className="ml-auto text-xs text-white/40">Active</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {MENU_ITEMS.map((item) => (
              <MenuRow key={item.href} {...item} />
            ))}
          </div>
          <div className="mt-14">
            <button
              onClick={logout}
              className="px-6 py-2.5 rounded-lg bg-[#1a1c22] hover:bg-[#252830] transition-colors font-semibold text-[14px] text-white/90 disabled:opacity-50"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
