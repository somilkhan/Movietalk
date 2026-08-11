export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-display select-none text-2xl tracking-wide text-white ${className}`}
    >
      ALL<span className="text-primary">RATED</span>
    </span>
  );
}

export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L12 16.9l-5.2 2.6.99-5.78-4.21-4.1 5.82-.85L12 3.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
