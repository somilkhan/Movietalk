import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

/* ================================================================
   TYPES
   ================================================================ */
interface AnimatedCatLogoProps {
  className?: string;
  size?: number;
  autoPlay?: boolean;
  smokePoof?: boolean;
  onSmokeDone?: () => void;
}

/* ================================================================
   SMOKE BURST (inline for logo)
   ================================================================ */
interface LogoParticle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  duration: number;
  delay: number;
}

const LogoSmoke = memo(function LogoSmoke({
  size,
  onDone,
}: {
  size: number;
  onDone?: () => void;
}) {
  const particles = useRef<LogoParticle[]>([]);

  if (particles.current.length === 0) {
    particles.current = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      angle: (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      distance: size * 0.3 + Math.random() * size * 0.5,
      size: size * 0.08 + Math.random() * size * 0.15,
      duration: 0.5 + Math.random() * 0.5,
      delay: Math.random() * 0.15,
    }));
  }

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 900);
    return () => clearTimeout(t);
  }, [onDone]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }} aria-hidden="true">
      {particles.current.map((p) => {
        const tx = Math.cos(p.angle) * p.distance;
        const ty = Math.sin(p.angle) * p.distance;
        return (
          <div
            key={p.id}
            className="absolute rounded-full bg-white/60"
            style={{
              left: cx,
              top: cy,
              width: p.size,
              height: p.size,
              filter: 'blur(3px)',
              opacity: 0,
              animation: `logoSmoke ${p.duration}s ease-out ${p.delay}s forwards`,
              transform: `translate(${tx}px, ${ty}px) scale(0)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes logoSmoke {
          0% { opacity: 0.7; transform: translate(0, 0) scale(0.3); }
          50% { opacity: 0.4; transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.3); }
          100% { opacity: 0; transform: translate(var(--tx, 0), var(--ty, 0)) scale(2); }
      `}</style>
    </div>
  );
});

/* ================================================================
   CAT SVG (logo version)
   ================================================================ */
function LogoCatSVG({
  isExpanded,
  mousePos,
}: {
  isExpanded: boolean;
  mousePos: { x: number; y: number };
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="logoBodyGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f0f0f5" />
          <stop offset="100%" stopColor="#e0e0e8" />
        </radialGradient>
        <radialGradient id="logoHeadGrad" cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f0f5" />
        </radialGradient>
        <linearGradient id="logoEarPink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd1dc" />
          <stop offset="100%" stopColor="#ffb6c1" />
        </linearGradient>
        <radialGradient id="logoEyeShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="logoBlush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb6c1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffb6c1" stopOpacity="0" />
        </radialGradient>

        <style>{`
          .logo-tail { animation: lTail 2.2s ease-in-out infinite; transform-origin: 155px 125px; }
          .logo-body { animation: lBreathe 3s ease-in-out infinite; transform-origin: 100px 135px; }
          .logo-head { animation: lHeadBob 3s ease-in-out infinite; transform-origin: 72px 72px; }
          .logo-ear-l { animation: lEarL 5s ease-in-out infinite; transform-origin: 52px 38px; }
          .logo-ear-r { animation: lEarR 5.3s ease-in-out infinite; transform-origin: 82px 38px; }
          .logo-eye { animation: lBlink 4s ease-in-out infinite; transform-origin: 72px 78px; }
          .logo-whiskers { opacity: 0; transition: opacity 0.4s ease; }
          .logo-paws { opacity: 0; transition: opacity 0.4s ease 0.1s; }
          .logo-show { opacity: 1; }

          @keyframes lTail { 0%,100%{transform:rotate(0)} 50%{transform:rotate(16deg)} }
          @keyframes lBreathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.015)} }
          @keyframes lHeadBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5px)} }
          @keyframes lEarL { 0%,92%,100%{transform:rotate(0)} 94%{transform:rotate(-5deg)} 96%{transform:rotate(2deg)} }
          @keyframes lEarR { 0%,93%,100%{transform:rotate(0)} 95%{transform:rotate(4deg)} 97%{transform:rotate(-2deg)} }
          @keyframes lBlink { 0%,45%,55%,100%{transform:scaleY(1)} 48%,52%{transform:scaleY(0.08)} }
        `}</style>
      </defs>

      {/* Tail */}
      <path
        className="logo-tail"
        d="M152 128 Q175 108, 182 78 Q188 48, 178 28 Q175 20, 182 18"
        fill="none"
        stroke="url(#logoBodyGrad)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="182" cy="18" r="5" fill="url(#logoBodyGrad)" />

      {/* Back legs */}
      <g className={cn('logo-paws', isExpanded && 'logo-show')}>
        <ellipse cx="128" cy="164" rx="11" ry="10" fill="url(#logoBodyGrad)" />
        <ellipse cx="128" cy="171" rx="7" ry="4" fill="#e8e8f0" />
        <ellipse cx="148" cy="164" rx="10" ry="9" fill="url(#logoBodyGrad)" />
        <ellipse cx="148" cy="170" rx="6" ry="3.5" fill="#e8e8f0" />
      </g>

      {/* Body */}
      <path
        className="logo-body"
        d="M72 105 C72 105, 95 100, 120 105 C145 110, 158 130, 155 155 C152 172, 130 178, 100 178 C70 178, 48 172, 45 155 C42 130, 55 110, 72 105Z"
        fill="url(#logoBodyGrad)"
      />
      <ellipse cx="100" cy="152" rx="28" ry="18" fill="#ffffff" opacity="0.4" />

      {/* Front legs */}
      <g className={cn('logo-paws', isExpanded && 'logo-show')}>
        <ellipse cx="68" cy="164" rx="11" ry="10" fill="url(#logoBodyGrad)" />
        <ellipse cx="68" cy="171" rx="7" ry="4" fill="#e8e8f0" />
        <line x1="65" y1="169" x2="65" y2="172" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="68" y1="170" x2="68" y2="173" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="71" y1="169" x2="71" y2="172" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
        <ellipse cx="88" cy="164" rx="10" ry="9" fill="url(#logoBodyGrad)" />
        <ellipse cx="88" cy="170" rx="6" ry="3.5" fill="#e8e8f0" />
        <line x1="85" y1="168" x2="85" y2="171" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="88" y1="169" x2="88" y2="172" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="91" y1="168" x2="91" y2="171" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* Head */}
      <g className="logo-head">
        <circle cx="72" cy="72" r="38" fill="url(#logoHeadGrad)" />

        {/* Ears */}
        <g className="logo-ear-l">
          <path d="M42 52 L38 22 L58 48 Z" fill="url(#logoHeadGrad)" />
          <path d="M44 48 L42 30 L52 46 Z" fill="url(#logoEarPink)" opacity="0.8" />
        </g>
        <g className="logo-ear-r">
          <path d="M62 48 L78 20 L88 50 Z" fill="url(#logoHeadGrad)" />
          <path d="M68 46 L78 28 L82 48 Z" fill="url(#logoEarPink)" opacity="0.8" />
        </g>

        {/* Blush */}
        <circle cx="48" cy="82" r="8" fill="url(#logoBlush)" />
        <circle cx="96" cy="82" r="8" fill="url(#logoBlush)" />

        {/* Eyes */}
        <g className="logo-eye">
          <ellipse cx="64" cy="76" rx="9" ry="10" fill="#1a1a24" />
          <ellipse cx={65 + mousePos.x * 0.7} cy={74 + mousePos.y * 0.7} rx="5" ry="6" fill="#2d2d3a" />
          <circle cx={66 + mousePos.x} cy={72 + mousePos.y} r="3.5" fill="url(#logoEyeShine)" />
          <circle cx={63 + mousePos.x} cy={78 + mousePos.y} r="1.5" fill="#ffffff" opacity="0.6" />

          <ellipse cx="84" cy="76" rx="9" ry="10" fill="#1a1a24" />
          <ellipse cx={85 + mousePos.x * 0.7} cy={74 + mousePos.y * 0.7} rx="5" ry="6" fill="#2d2d3a" />
          <circle cx={86 + mousePos.x} cy={72 + mousePos.y} r="3.5" fill="url(#logoEyeShine)" />
          <circle cx={83 + mousePos.x} cy={78 + mousePos.y} r="1.5" fill="#ffffff" opacity="0.6" />
        </g>

        {/* Nose */}
        <path d="M72 86 L76 84 L74 90 Z" fill="#ff8fa3" />
        <ellipse cx="73" cy="88" rx="2.5" ry="1.5" fill="#ff6b85" opacity="0.5" />

        {/* Mouth */}
        <path d="M74 91 Q76 95, 79 93" fill="none" stroke="#2a2a35" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
        <path d="M72 91 Q70 95, 67 93" fill="none" stroke="#2a2a35" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />

        {/* Whiskers */}
        <g className={cn('logo-whiskers', isExpanded && 'logo-show')} opacity="0.45">
          <line x1="42" y1="80" x2="22" y2="76" stroke="#2a2a35" strokeWidth="1" strokeLinecap="round" />
          <line x1="42" y1="84" x2="20" y2="84" stroke="#2a2a35" strokeWidth="1" strokeLinecap="round" />
          <line x1="42" y1="88" x2="22" y2="92" stroke="#2a2a35" strokeWidth="1" strokeLinecap="round" />
          <line x1="102" y1="80" x2="122" y2="76" stroke="#2a2a35" strokeWidth="1" strokeLinecap="round" />
          <line x1="102" y1="84" x2="124" y2="84" stroke="#2a2a35" strokeWidth="1" strokeLinecap="round" />
          <line x1="102" y1="88" x2="122" y2="92" stroke="#2a2a35" strokeWidth="1" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export function AnimatedCatLogo({
  className,
  size = 32,
  autoPlay = true,
  smokePoof = false,
  onSmokeDone,
}: AnimatedCatLogoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showSmoke, setShowSmoke] = useState(false);
  const [smokePhase, setSmokePhase] = useState<'idle' | 'poofing' | 'reforming'>('idle');
  const smokeTriggered = useRef(false);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setTimeout(() => setIsExpanded(true), 1500);
    return () => clearTimeout(timer);
  }, [autoPlay]);

  useEffect(() => {
    if (smokePoof && !smokeTriggered.current) {
      smokeTriggered.current = true;
      setSmokePhase('poofing');
      setShowSmoke(true);
      setIsExpanded(false);
      setTimeout(() => {
        setSmokePhase('reforming');
        setTimeout(() => {
          setShowSmoke(false);
          setSmokePhase('idle');
          setIsExpanded(true);
          onSmokeDone?.();
        }, 400);
      }, 600);
    }
  }, [smokePoof, onSmokeDone]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxOffset = 3;
    const x = Math.max(-maxOffset, Math.min(maxOffset, (e.clientX - centerX) / 16));
    const y = Math.max(-maxOffset, Math.min(maxOffset, (e.clientY - centerY) / 16));
    setMousePos({ x, y });
  }, []);

  return (
    <div
      className={cn('relative cursor-pointer select-none', className)}
      style={{ width: size, height: size }}
      onMouseEnter={() => smokePhase === 'idle' && setIsExpanded(true)}
      onMouseMove={handleMouseMove}
      onClick={() => smokePhase === 'idle' && setIsExpanded(!isExpanded)}
    >
      {showSmoke && <LogoSmoke size={size} />}
      <div
        className={cn(
          'w-full h-full transition-all duration-300',
          smokePhase === 'poofing' && 'opacity-0 scale-50',
          smokePhase === 'reforming' && 'opacity-100 scale-100'
        )}
      >
        <LogoCatSVG isExpanded={isExpanded} mousePos={mousePos} />
      </div>
    </div>
  );
}
