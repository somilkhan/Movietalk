import { Link } from "wouter";
import { ChevronLeft, Laptop, Smartphone, LogOut } from "lucide-react";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Device {
  id: string;
  name: string;
  type: "desktop" | "mobile";
  lastUsed: string;
  isCurrent: boolean;
}

function getDevices(): Device[] {
  try {
    const raw = localStorage.getItem("bingr.devices");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  // Default fallback
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/.test(ua);
  const browser = ua.includes("Firefox") ? "Firefox" : ua.includes("Chrome") ? "Chrome" : "Browser";
  const platform = isMobile ? "Android" : "Desktop";
  return [
    {
      id: "current",
      name: `${browser} on ${platform}`,
      type: isMobile ? "mobile" : "desktop",
      lastUsed: "Just now",
      isCurrent: true,
    },
  ];
}

function DeviceRow({ device }: { device: Device }) {
  return (
    <div className="flex items-center justify-between pr-0 lg:pr-8">
      <div className="flex items-center gap-5">
        <div className="text-white/70">
          {device.type === "desktop" ? (
            <Laptop className="w-6 h-6" />
          ) : (
            <Smartphone className="w-6 h-6" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[15px] text-white/90">{device.name}</span>
          <span className="text-[13px] font-medium text-white/50">Last used : {device.lastUsed}</span>
        </div>
      </div>
      <button
        disabled={device.isCurrent}
        className="px-6 py-2.5 rounded-lg bg-[#1a1c22] hover:bg-[#252830] transition-colors text-[14px] font-semibold text-white/90 disabled:opacity-50"
      >
        Log Out
      </button>
    </div>
  );
}

export default function SettingsAccount() {
  const { profile } = useAuth();
  const devices = getDevices();
  const thisDevice = devices.find((d) => d.isCurrent);
  const otherDevices = devices.filter((d) => !d.isCurrent);

  return (
    <div className="min-h-screen bg-[#07070b] text-white pb-28 md:pb-8" data-testid="page-settings-account">
      <Seo title="Account & Devices" />
      <div className="relative z-10 pl-0 md:pl-[80px] lg:pl-[100px] pt-12 md:pt-20">
        <div className="px-6 md:px-12">
          {/* Back */}
          <Link href="/settings">
            <button className="flex items-center gap-2 text-white/60 hover:text-white mb-6 -ml-2">
              <ChevronLeft className="w-6 h-6" />
              <span className="font-medium text-[15px]">Back to Settings</span>
            </button>
          </Link>

          {/* Donate */}
          <div className="flex items-center justify-between pr-0 lg:pr-8 mb-10">
            <span className="text-[17px] font-semibold text-white/90">Donate to Bingr</span>
            <a
              href="https://discord.gg/ytxEStcQzQ"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 rounded-lg bg-[#1a1c22] hover:bg-[#252830] transition-colors text-[14px] font-semibold text-white/90"
            >
              Donate
            </a>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between pr-0 lg:pr-8 mt-10 lg:mt-0 mb-10">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-medium text-white/50">Registered Email</span>
              <span className="text-[16px] font-semibold text-white/90">
                {profile?.email || "smartysomilbz@gmail.com"}
              </span>
            </div>
          </div>

          {/* This Device */}
          <h3 className="text-[17px] font-semibold text-white/90 mb-6">This Device</h3>
          {thisDevice && <DeviceRow device={thisDevice} />}

          {/* Other Devices */}
          {otherDevices.length > 0 && (
            <>
              <h3 className="text-[17px] font-semibold text-white/90 mt-10 mb-6">Other Devices</h3>
              <div className="flex flex-col gap-8">
                {otherDevices.map((device) => (
                  <DeviceRow key={device.id} device={device} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
