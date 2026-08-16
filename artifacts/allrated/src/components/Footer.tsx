export function Footer() {
  return (
    <footer className="hidden md:block py-10 px-6 md:px-20 text-center border-t border-white/5 mt-auto bg-[#07070b]">
      <p className="text-white/30 text-xs mb-1">
        RabbitRip does not store any content — all media is fetched from third-party sources.
      </p>
      <p className="text-white/30 text-xs">
        For removal or DMCA requests, contact:{" "}
        <a
          href="mailto:support@movietalk.app"
          className="underline hover:text-white/60 transition-colors"
        >
          support@movietalk.app
        </a>
      </p>
    </footer>
  );
}
