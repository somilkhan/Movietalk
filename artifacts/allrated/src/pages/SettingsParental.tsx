import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Seo } from "@/components/Seo";
import { cn } from "@/lib/utils";

export default function SettingsParental() {
  return (
    <div className="min-h-screen bg-[#07070b] text-white pb-28 md:pb-8" data-testid="page-settings-parental">
      <Seo title="Parental Controls" />
      <div className="relative z-10 pl-0 md:pl-[80px] lg:pl-[100px] pt-12 md:pt-20">
        <div className="px-6 md:px-12">
          {/* Back */}
          <Link href="/settings">
            <button className="flex items-center gap-2 text-white/60 hover:text-white mb-6 -ml-2">
              <ChevronLeft className="w-6 h-6" />
              <span className="font-medium text-[15px]">Back to Settings</span>
            </button>
          </Link>

          <h2 className="text-sm font-bold tracking-widest text-white/40 uppercase mb-8">Parental Controls</h2>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[17px] font-semibold text-white/90">Parental Lock</span>
              <span className="text-[13px] font-medium text-white/50">
                Coming soon — restrict access to adult profiles with a PIN
              </span>
            </div>
            <button
              type="button"
              disabled
              aria-pressed="false"
              className="relative w-10 h-5 rounded-full outline-none shrink-0 transition-colors bg-white/20 cursor-not-allowed"
            >
              <div className="absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white/60" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
