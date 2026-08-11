import { useState } from "react";
import {
  User, Play, Shield, Palette, Info, ChevronRight, Moon, Sun,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { getSessionId } from "@/lib/session";

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center gap-3 mb-3 md:mb-4">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
          {icon}
        </div>
        <h2 className="text-base md:text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="bg-[#252830] rounded-xl border border-white/5 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({
  label,
  value,
  onClick,
  danger,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 md:px-5 py-3.5 md:py-4 hover:bg-white/5 transition-colors text-left ${
        danger ? "text-red-400" : "text-white"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-white/40">{value}</span>}
        <ChevronRight className="w-4 h-4 text-white/20" />
      </div>
    </button>
  );
}

export default function Settings() {
  const sessionId = getSessionId();
  const [parentalPin, setParentalPin] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSavePin() {
    if (parentalPin.length === 4) {
      localStorage.setItem("bingr_parental_pin", parentalPin);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function handleLogout() {
    localStorage.removeItem("bingr.profile");
    localStorage.removeItem("allrated_session_id");
    window.location.href = "/home";
  }

  return (
    <div className="pb-24 md:pb-0 min-h-screen bg-[#07070b] pt-14 md:pt-0" data-testid="page-settings">
      <Seo title="Settings" />
      <div className="pt-20 md:pt-32 px-4 md:px-20 max-w-3xl">
        <h1 className="font-display text-4xl md:text-6xl text-white mb-8 md:mb-10 tracking-wider">
          Settings
        </h1>

        <Section icon={<User className="w-4 h-4" />} title="Account">
          <SettingsRow label="Session ID" value={sessionId.slice(0, 12) + "..."} />
          <div className="h-px bg-white/5" />
          <SettingsRow label="Clear Cache" onClick={() => { localStorage.clear(); window.location.reload(); }} />
          <div className="h-px bg-white/5" />
          <SettingsRow label="Sign Out" danger onClick={handleLogout} />
        </Section>

        <Section icon={<Play className="w-4 h-4" />} title="Playback">
          <SettingsRow label="Auto-play next episode" value="On" />
          <div className="h-px bg-white/5" />
          <SettingsRow label="Default quality" value="Auto" />
          <div className="h-px bg-white/5" />
          <SettingsRow label="Subtitle language" value="English" />
        </Section>

        <Section icon={<Shield className="w-4 h-4" />} title="Parental Controls">
          <div className="px-4 md:px-5 py-4">
            <label className="text-sm text-white/60 mb-2 block">
              Set PIN to restrict mature content
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={4}
                inputMode="numeric"
                value={parentalPin}
                onChange={(e) => setParentalPin(e.target.value.replace(/\D/g, ""))}
                placeholder="4-digit PIN"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm w-32 focus:outline-none focus:border-[#4752c4]"
              />
              <button
                onClick={handleSavePin}
                className="px-4 py-2 rounded-lg bg-[#4752c4] text-black text-sm font-semibold hover:bg-[#3d47b0] transition-colors active:scale-95"
              >
                {saved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>
        </Section>

        <Section icon={<Palette className="w-4 h-4" />} title="Appearance">
          <div className="px-4 md:px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-white">Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-7 rounded-full transition-colors relative ${darkMode ? "bg-[#4752c4]" : "bg-white/20"}`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center transition-transform ${
                  darkMode ? "translate-x-5" : "translate-x-0.5"
                }`}
              >
                {darkMode ? <Moon className="w-3 h-3 text-black" /> : <Sun className="w-3 h-3 text-black" />}
              </div>
            </button>
          </div>
        </Section>

        <Section icon={<Info className="w-4 h-4" />} title="About">
          <SettingsRow label="Version" value="2.0.0" />
          <div className="h-px bg-white/5" />
          <SettingsRow label="Terms of Service" />
          <div className="h-px bg-white/5" />
          <SettingsRow label="Privacy Policy" />
          <div className="h-px bg-white/5" />
          <SettingsRow label="DMCA" />
        </Section>
      </div>
    </div>
  );
}
