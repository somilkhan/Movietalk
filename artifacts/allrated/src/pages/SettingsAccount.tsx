import { Link, useLocation } from "wouter";
import { ChevronLeft, Laptop, Smartphone, LogIn, LogOut } from "lucide-react";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";

interface Device { id: string; name: string; type: "desktop" | "mobile"; lastUsed: string; isCurrent: boolean; }

function getDevices(): Device[] {
  try { const raw = localStorage.getItem("bingr.devices"); if (raw) return JSON.parse(raw); } catch {}
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/.test(ua);
  const browser = ua.includes("Firefox") ? "Firefox" : ua.includes("Chrome") ? "Chrome" : "Browser";
  return [{ id: "current", name: `${browser} on ${isMobile ? "Android" : "Desktop"}`, type: isMobile ? "mobile" : "desktop", lastUsed: "Just now", isCurrent: true }];
}

function DeviceRow({ device }: { device: Device }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.045] bg-white/[0.018] px-4 py-4 md:px-5">
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.055] text-white/65">{device.type === "desktop" ? <Laptop className="h-[19px] w-[19px]" /> : <Smartphone className="h-[19px] w-[19px]" />}</div>
      <div className="min-w-0"><div className="truncate text-[14px] font-semibold text-white/90">{device.name}</div><div className="mt-0.5 text-[12px] font-medium text-white/40">Last used · {device.lastUsed}{device.isCurrent ? " · Current device" : ""}</div></div>
    </div>
    <button disabled={device.isCurrent} className="shrink-0 rounded-lg border border-white/[0.07] bg-white/[0.035] px-4 py-2 text-[12px] font-semibold text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-default disabled:opacity-35">Log Out</button>
  </div>;
}

export default function SettingsAccount() {
  const [, navigate] = useLocation();
  const { profile, logout } = useAuth();
  const devices = getDevices();
  const thisDevice = devices.find((d) => d.isCurrent);
  const otherDevices = devices.filter((d) => !d.isCurrent);
  async function handleLogout() { await logout(); navigate("/login"); }

  return <div className="min-h-screen bg-[#07070b] pb-28 text-white md:pb-10" data-testid="page-settings-account">
    <Seo title="Account & Devices" />
    <main className="mx-auto w-full max-w-[860px] px-4 pt-8 sm:px-6 md:pt-14 lg:px-8">
      <Link href="/settings"><a className="mb-7 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/40 transition-colors hover:text-white"><ChevronLeft className="h-4 w-4" />Back to Settings</a></Link>
      <header className="mb-8"><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">Account</p><h1 className="text-[24px] font-bold tracking-[-0.025em] text-white md:text-[28px]">Account &amp; Devices</h1></header>

      <section className="mb-8 rounded-xl border border-white/[0.05] bg-white/[0.018] p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30">Registered Email</div><div className="mt-1 text-[15px] font-semibold text-white/90">{profile?.email || "Not signed in"}</div></div>{profile ? <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-white/[0.08] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.13]"><LogOut className="h-4 w-4" />Sign out</button> : <button onClick={() => navigate("/login")} className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-white px-4 py-2.5 text-[13px] font-semibold text-black hover:bg-white/90"><LogIn className="h-4 w-4" />Sign in</button>}</div>
      </section>

      <section className="mb-9"><div className="mb-3 text-[15px] font-semibold text-white/85">This Device</div>{thisDevice && <DeviceRow device={thisDevice} />}</section>
      {otherDevices.length > 0 && <section><div className="mb-3 text-[15px] font-semibold text-white/85">Other Devices</div><div className="space-y-2.5">{otherDevices.map((device) => <DeviceRow key={device.id} device={device} />)}</div></section>}
    </main>
  </div>;
}
