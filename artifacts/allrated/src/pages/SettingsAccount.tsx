import { Link, useLocation } from "wouter";
import { ChevronLeft, Laptop, Smartphone, LogIn, LogOut } from "lucide-react";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";

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
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/.test(ua);
  const browser = ua.includes("Firefox") ? "Firefox" : ua.includes("Chrome") ? "Chrome" : "Browser";
  const platform = isMobile ? "Android" : "Desktop";
  return [{ id: "current", name: `${browser} on ${platform}`, type: isMobile ? "mobile" : "desktop", lastUsed: "Just now", isCurrent: true }];
}

function DeviceRow({ device }: { device: Device }) {
  return (
    <div className="flex items-center justify-between pr-0 lg:pr-8">
      <div className="flex items-center gap-5">
        <div className="text-white/70">{device.type === "desktop" ? <Laptop className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}</div>
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[15px] text-white/90">{device.name}</span>
          <span className="text-[13px] font-medium text-white/50">Last used : {device.lastUsed}</span>
        </div>
      </div>
      <button disabled={device.isCurrent} className="px-6 py-2.5 rounded-lg bg-[#1a1c22] text-[14px] font-semibold text-white/90 disabled:opacity-50">Log Out</button>
    </div>
  );
}

export default function SettingsAccount() {
  const [, navigate] = useLocation();
  const { profile, logout } = useAuth();
  const devices = getDevices();
  const thisDevice = devices.find((d) => d.isCurrent);
  const otherDevices = devices.filter((d) => !d.isCurrent);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white pb-28 md:pb-8" data-testid="page-settings-account">
      <Seo title="Account & Devices" />
      <div className="relative z-10 pl-0 md:pl-[80px] lg:pl-[100px] pt-12 md:pt-20">
        <div className="px-6 md:px-12">
          <Link href="/settings"><button className="flex items-center gap-2 text-white/60 hover:text-white mb-6 -ml-2"><ChevronLeft className="w-6 h-6" /><span className="font-medium text-[15px]">Back to Settings</span></button></Link>
          <div className="flex items-center justify-between pr-0 lg:pr-8 mb-10">
            <span className="text-[17px] font-semibold text-white/90">Donate to RabbitRip</span>
            <a href="https://discord.gg/ytxEStcQzQ" target="_blank" rel="noreferrer" className="px-6 py-2.5 rounded-lg bg-[#1a1c22] hover:bg-[#252830] transition-colors text-[14px] font-semibold text-white/90">Donate</a>
          </div>
          <div className="flex items-center justify-between pr-0 lg:pr-8 mt-10 lg:mt-0 mb-10">
            <div className="flex flex-col gap-1"><span className="text-[13px] font-medium text-white/50">Registered Email</span><span className="text-[16px] font-semibold text-white/90">{profile?.email || "Not signed in"}</span></div>
            {profile ? <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-white/15"><LogOut className="h-4 w-4" /> Sign out</button> : <button onClick={() => navigate('/login')} className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-[14px] font-semibold text-black hover:bg-white/90"><LogIn className="h-4 w-4" /> Sign in</button>}
          </div>
          <h3 className="text-[17px] font-semibold text-white/90 mb-6">This Device</h3>
          {thisDevice && <DeviceRow device={thisDevice} />}
          {otherDevices.length > 0 && <><h3 className="text-[17px] font-semibold text-white/90 mt-10 mb-6">Other Devices</h3><div className="flex flex-col gap-8">{otherDevices.map((device) => <DeviceRow key={device.id} device={device} />)}</div></>}
        </div>
      </div>
    </div>
  );
}
