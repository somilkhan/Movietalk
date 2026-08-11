import { Link } from "wouter";
import { Seo } from "@/components/Seo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-[#07070b]">
      <Seo title="Page Not Found" />
      <div className="w-32 h-32 md:w-40 md:h-40 mb-6 md:mb-8 rounded-2xl overflow-hidden opacity-50 grayscale">
        <img
          src="/brand/logo-animated.svg"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className="font-display text-4xl md:text-6xl text-white mb-4 md:mb-5 tracking-wider">
        404. Well, fuck.
      </h1>
      <p className="text-white/40 max-w-sm mb-8 md:mb-10 text-sm md:text-base leading-relaxed">
        The page you're looking for is either dead, missing, or out banging someone's mom.
        Don't worry, it happens to a lot of guys.
      </p>
      <Link href="/home">
        <button className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors border border-white/10 hover:border-white/30 active:scale-95">
          Take me home, Daddy
        </button>
      </Link>
    </div>
  );
}
