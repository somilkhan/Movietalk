import { Link } from "wouter";
import { ChevronLeft, Globe } from "lucide-react";
import { Seo } from "@/components/Seo";
import { useRegion, REGIONS } from "@/hooks/useRegion";

const LEGAL_LINKS = [
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "DMCA Notice", href: "#" },
];

export default function SettingsHelp() {
  const { region } = useRegion();
  const currentRegion = REGIONS.find((r) => r.code === region);

  return (
    <div className="min-h-screen bg-[#07070b] text-white pb-28 md:pb-8" data-testid="page-settings-help">
      <Seo title="Help & Support" />
      <div className="relative z-10 pl-0 md:pl-[80px] lg:pl-[100px] pt-12 md:pt-20">
        <div className="px-6 md:px-12">
          {/* Back */}
          <Link href="/settings">
            <button className="flex items-center gap-2 text-white/60 hover:text-white mb-6 -ml-2">
              <ChevronLeft className="w-6 h-6" />
              <span className="font-medium text-[15px]">Back to Settings</span>
            </button>
          </Link>

          <h2 className="text-sm font-bold tracking-widest text-white/40 uppercase mb-8">Help &amp; Support</h2>

          {/* Region Info Card */}
          <div className="bg-[#1a1c22] rounded-2xl border border-white/5 p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-5 h-5 text-white/70" />
              <h3 className="text-lg font-semibold text-white/90">Current Region</h3>
            </div>
            <p className="text-[14px] font-medium text-white/50 leading-relaxed mb-4">
              Content catalog and recommendations are tailored to your selected region.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-base">{currentRegion?.flag || "🌍"}</span>
              <span className="text-sm font-semibold text-white/90">{currentRegion?.label || region}</span>
              <span className="text-xs text-white/40 font-mono">{region}</span>
            </div>
          </div>

          {/* Discord Card */}
          <div className="bg-[#1a1c22] rounded-2xl border border-white/5 p-6 mb-10">
            <h3 className="text-xl font-semibold text-white/90 mb-3">Join the Community</h3>
            <p className="text-[14px] font-medium text-white/50 leading-relaxed mb-5">
              Bingr is currently in Beta! Join our Discord server to report bugs, suggest new features, or hang out with other users.
            </p>
            <a
              href="https://discord.gg/ytxEStcQzQ"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] transition-colors text-white font-semibold text-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Join Discord
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col items-center gap-4 mb-10">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium text-white/50 hover:text-white/80 transition-colors underline underline-offset-4 decoration-white/20"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Build */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-white/30 uppercase">Build</span>
            <span className="px-5 py-2 rounded-full border border-white/10 text-[13px] font-medium text-white/50">
              v1.6.2+unknown
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
