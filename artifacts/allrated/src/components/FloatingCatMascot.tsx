import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

/* ================================================================
   TYPES
   ================================================================ */
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

interface SmokeBurstProps {
  x: number;
  y: number;
  onDone?: () => void;
  particleCount?: number;
  color?: string;
}

/* ================================================================
   CONSTANTS
   ================================================================ */
const SIZE = 52;
const PADDING = 16;
const SPEED = 1.2;
const SMOKE_DURATION = 1400;

/* ================================================================
   SMOKE PARTICLE COMPONENT
   ================================================================ */
const SmokeBurst = memo(function SmokeBurst({
  x,
  y,
  onDone,
  particleCount = 18,
  color = '#ffffff',
}: SmokeBurstProps) {
  const particles = useRef<Particle[]>([]);

  if (particles.current.length === 0) {
    particles.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: x + SIZE / 2,
      y: y + SIZE / 2,
      size: 6 + Math.random() * 18,
      duration: 0.6 + Math.random() * 0.8,
      delay: Math.random() * 0.3,
      driftX: (Math.random() - 0.5) * 80,
      driftY: (Math.random() - 0.5) * 80 - 20,
    }));
  }

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), SMOKE_DURATION);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[110]" aria-hidden="true">
      {particles.current.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: color,
            opacity: 0,
            filter: 'blur(4px)',
            animation: `smokePuff ${p.duration}s ease-out ${p.delay}s forwards`,
            transform: `translate(${p.driftX}px, ${p.driftY}px) scale(0)`,
          }}
        />
      ))}
    </div>
  );
});

/* ================================================================
   FLOATING HEART (petting effect)
   ================================================================ */
const FloatingHeart = memo(function FloatingHeart({
  x,
  y,
  onDone,
}: {
  x: number;
  y: number;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed pointer-events-none z-[110]"
      style={{
        left: x,
        top: y,
        fontSize: 13,
        animation: 'heartFloat 1.2s ease-out forwards',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff6b9d" opacity="0.8">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  );
});

/* ================================================================
   CAT SVG COMPONENT
   ================================================================ */
function CatSVG({
  isWalking,
  isSleeping,
  isRaining,
  isPetting,
  pawLicking,
  mousePos,
}: {
  isWalking: boolean;
  isSleeping: boolean;
  isRaining: boolean;
  isPetting: boolean;
  pawLicking: boolean;
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
        {/* Body gradient */}
        <radialGradient id="bodyGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f0f0f5" />
          <stop offset="100%" stopColor="#e0e0e8" />
        </radialGradient>
        {/* Head gradient */}
        <radialGradient id="headGrad" cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f0f5" />
        </radialGradient>
        {/* Inner ear pink */}
        <linearGradient id="earPink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd1dc" />
          <stop offset="100%" stopColor="#ffb6c1" />
        </linearGradient>
        {/* Eye shine */}
        <radialGradient id="eyeShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
        </radialGradient>
        {/* Blush */}
        <radialGradient id="blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb6c1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffb6c1" stopOpacity="0" />
        </radialGradient>

        <style>{`
          .cat-tail { animation: cTail 2.2s ease-in-out infinite; transform-origin: 155px 125px; }
          .cat-body { animation: cBreathe 3s ease-in-out infinite; transform-origin: 100px 135px; }
          .cat-head { animation: cHeadBob 3s ease-in-out infinite; transform-origin: 72px 72px; }
          .cat-ear-l { animation: cEarL 5s ease-in-out infinite; transform-origin: 52px 38px; }
          .cat-ear-r { animation: cEarR 5.3s ease-in-out infinite; transform-origin: 82px 38px; }
          .cat-eye { animation: cBlink 4s ease-in-out infinite; transform-origin: 72px 78px; }
          .cat-leg-bl { animation: ${isWalking && !isSleeping ? 'cLeg 0.4s' : 'none'} ease-in-out infinite; transform-origin: 128px 162px; }
          .cat-leg-br { animation: ${isWalking && !isSleeping ? 'cLeg 0.4s' : 'none'} ease-in-out infinite 0.2s; transform-origin: 148px 162px; }
          .cat-leg-fl { animation: ${isWalking && !isSleeping ? 'cLeg 0.4s' : 'none'} ease-in-out infinite 0.2s; transform-origin: 68px 162px; }
          .cat-leg-fr { animation: ${isWalking && !isSleeping ? 'cLeg 0.4s' : 'none'} ease-in-out infinite; transform-origin: 88px 162px; }
          .cat-paw-lick { animation: ${pawLicking ? 'cPawLick 1.2s ease-in-out infinite' : 'none'}; transform-origin: 68px 162px; }
          .cat-whiskers { animation: ${isPetting ? 'cWhiskers 0.3s ease-in-out infinite' : 'none'}; }

          @keyframes cTail { 0%,100%{transform:rotate(0)} 50%{transform:rotate(16deg)} }
          @keyframes cBreathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.015)} }
          @keyframes cHeadBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5px)} }
          @keyframes cEarL { 0%,92%,100%{transform:rotate(0)} 94%{transform:rotate(-5deg)} 96%{transform:rotate(2deg)} }
          @keyframes cEarR { 0%,93%,100%{transform:rotate(0)} 95%{transform:rotate(4deg)} 97%{transform:rotate(-2deg)} }
          @keyframes cBlink { 0%,45%,55%,100%{transform:scaleY(1)} 48%,52%{transform:scaleY(0.08)} }
          @keyframes cLeg { 0%,100%{transform:rotate(0)} 50%{transform:rotate(18deg)} }
          @keyframes cPawLick { 0%,100%{transform:rotate(0) translate(0,0)} 50%{transform:rotate(-12deg) translate(4px,-6px)} }
          @keyframes cWhiskers { 0%,100%{transform:translateX(0)} 50%{transform:translateX(1.5px)} }
        `}</style>
      </defs>

      {/* === TAIL === */}
      <path
        className="cat-tail"
        d={isSleeping
          ? 'M152 132 Q165 142, 170 155 Q175 168, 168 178'
          : 'M152 128 Q175 108, 182 78 Q188 48, 178 28 Q175 20, 182 18'}
        fill="none"
        stroke="url(#bodyGrad)"
        strokeWidth={isSleeping ? 9 : 8}
        strokeLinecap="round"
      />
      {/* Tail fluff tip */}
      {!isSleeping && (
        <circle cx="182" cy="18" r="5" fill="url(#bodyGrad)" />
      )}

      {/* === BACK LEGS === */}
      <g className="cat-leg-bl">
        <ellipse cx="128" cy="164" rx="11" ry="10" fill="url(#bodyGrad)" />
        {/* Paw pad */}
        <ellipse cx="128" cy="171" rx="7" ry="4" fill="#e8e8f0" />
      </g>
      <g className="cat-leg-br">
        <ellipse cx="148" cy="164" rx="10" ry="9" fill="url(#bodyGrad)" />
        <ellipse cx="148" cy="170" rx="6" ry="3.5" fill="#e8e8f0" />
      </g>

      {/* === BODY === */}
      <path
        className="cat-body"
        d="M72 105 
           C72 105, 95 100, 120 105 
           C145 110, 158 130, 155 155 
           C152 172, 130 178, 100 178 
           C70 178, 48 172, 45 155 
           C42 130, 55 110, 72 105Z"
        fill="url(#bodyGrad)"
      />
      {/* Belly highlight */}
      <ellipse cx="100" cy="152" rx="28" ry="18" fill="#ffffff" opacity="0.4" />

      {/* === FRONT LEGS === */}
      <g className={cn('cat-leg-fl', pawLicking && 'cat-paw-lick')}>
        <ellipse cx="68" cy="164" rx="11" ry="10" fill="url(#bodyGrad)" />
        <ellipse cx="68" cy="171" rx="7" ry="4" fill="#e8e8f0" />
        {/* Toe lines */}
        <line x1="65" y1="169" x2="65" y2="172" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="68" y1="170" x2="68" y2="173" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="71" y1="169" x2="71" y2="172" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
      </g>
      <g className="cat-leg-fr">
        <ellipse cx="88" cy="164" rx="10" ry="9" fill="url(#bodyGrad)" />
        <ellipse cx="88" cy="170" rx="6" ry="3.5" fill="#e8e8f0" />
        <line x1="85" y1="168" x2="85" y2="171" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="88" y1="169" x2="88" y2="172" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="91" y1="168" x2="91" y2="171" stroke="#d0d0dc" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* === HEAD === */}
      <g className="cat-head">
        {/* Main head circle */}
        <circle cx="72" cy="72" r="38" fill="url(#headGrad)" />

        {/* Left ear */}
        <g className="cat-ear-l">
          <path d="M42 52 L38 22 L58 48 Z" fill="url(#headGrad)" />
          <path d="M44 48 L42 30 L52 46 Z" fill="url(#earPink)" opacity="0.8" />
        </g>
        {/* Right ear */}
        <g className="cat-ear-r">
          <path d="M62 48 L78 20 L88 50 Z" fill="url(#headGrad)" />
          <path d="M68 46 L78 28 L82 48 Z" fill="url(#earPink)" opacity="0.8" />
        </g>

        {/* Blush marks */}
        <circle cx="48" cy="82" r="8" fill="url(#blush)" />
        <circle cx="96" cy="82" r="8" fill="url(#blush)" />

        {/* Eyes */}
        {isSleeping ? (
          /* Closed eyes (sleeping) */
          <g>
            <path d="M56 76 Q64 82, 72 76" fill="none" stroke="#2a2a35" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M76 76 Q84 82, 92 76" fill="none" stroke="#2a2a35" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        ) : (
          /* Open eyes */
          <g className="cat-eye">
            {/* Left eye */}
            <ellipse cx="64" cy="76" rx="9" ry="10" fill="#1a1a24" />
            <ellipse cx={65 + mousePos.x * 0.7} cy={74 + mousePos.y * 0.7} rx="5" ry="6" fill="#2d2d3a" />
            <circle cx={66 + mousePos.x} cy={72 + mousePos.y} r="3.5" fill="url(#eyeShine)" />
            <circle cx={63 + mousePos.x} cy={78 + mousePos.y} r="1.5" fill="#ffffff" opacity="0.6" />
            {/* Right eye */}
            <ellipse cx="84" cy="76" rx="9" ry="10" fill="#1a1a24" />
            <ellipse cx={85 + mousePos.x * 0.7} cy={74 + mousePos.y * 0.7} rx="5" ry="6" fill="#2d2d3a" />
            <circle cx={86 + mousePos.x} cy={72 + mousePos.y} r="3.5" fill="url(#eyeShine)" />
            <circle cx={83 + mousePos.x} cy={78 + mousePos.y} r="1.5" fill="#ffffff" opacity="0.6" />
          </g>
        )}

        {/* Nose */}
        <path d="M72 86 L76 84 L74 90 Z" fill="#ff8fa3" />
        <ellipse cx="73" cy="88" rx="2.5" ry="1.5" fill="#ff6b85" opacity="0.5" />

        {/* Mouth */}
        <path d="M74 91 Q76 95, 79 93" fill="none" stroke="#2a2a35" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
        <path d="M72 91 Q70 95, 67 93" fill="none" stroke="#2a2a35" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />

        {/* Whiskers */}
        <g className="cat-whiskers" opacity="0.45">
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
export function FloatingCatMascot({ delay = 5000 }: { delay?: number }) {
  /* ---- visibility & entrance ---- */
  const [visible, setVisible] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);
  const [exiting, setExiting] = useState(false);

  /* ---- position & movement ---- */
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const facingRightRef = useRef(true);
  const [facingRight, setFacingRight] = useState(true);

  /* ---- states ---- */
  const [isWalking, setIsWalking] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [isRaining, setIsRaining] = useState(false);
  const [showBubble, setShowBubble] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showSmoke, setShowSmoke] = useState(false);
  const [showReturnBtn, setShowReturnBtn] = useState(false);
  const [pawLicking, setPawLicking] = useState(false);

  /* ---- refs ---- */
  const animFrameRef = useRef<number>(0);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rainTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pettingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragStartRef = useRef({ x: 0, y: 0, catX: 0, catY: 0 });
  const bottomYRef = useRef(0);
  const heartIdRef = useRef(0);
  const isActiveRef = useRef(true);
  const walkingRef = useRef(false);
  const sleepingRef = useRef(false);
  const rainingRef = useRef(false);
  const draggingRef = useRef(false);
  const pettingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---- sync refs ---- */
  useEffect(() => { walkingRef.current = isWalking; }, [isWalking]);
  useEffect(() => { sleepingRef.current = isSleeping; }, [isSleeping]);
  useEffect(() => { rainingRef.current = isRaining; }, [isRaining]);
  useEffect(() => { draggingRef.current = isDragging; }, [isDragging]);
  useEffect(() => { pettingRef.current = isPetting; }, [isPetting]);
  useEffect(() => { xRef.current = x; }, [x]);
  useEffect(() => { yRef.current = y; }, [y]);

  /* ---- resize ---- */
  useEffect(() => {
    const recalc = () => { bottomYRef.current = window.innerHeight - SIZE - PADDING; };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  /* ---- entrance ---- */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isActiveRef.current) return;
      setShowSmoke(true);
      setVisible(true);
      targetXRef.current = PADDING + Math.random() * (window.innerWidth - SIZE - PADDING * 2);
      targetYRef.current = 0;
      setX(targetXRef.current);
      setFacingRight(targetXRef.current > window.innerWidth / 2);
      facingRightRef.current = targetXRef.current > window.innerWidth / 2;
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleSmokeDone = useCallback(() => {
    setShowSmoke(false);
    setEntranceDone(true);
  }, []);

  /* ---- random movement ---- */
  useEffect(() => {
    if (!entranceDone) return;

    const scheduleNextMove = () => {
      if (!isActiveRef.current) return;
      if (sleepingRef.current || draggingRef.current || rainingRef.current) {
        moveTimerRef.current = setTimeout(scheduleNextMove, 2000);
        return;
      }

      const vw = window.innerWidth;
      targetXRef.current = PADDING + Math.random() * (vw - SIZE - PADDING * 2);
      targetYRef.current = (Math.random() - 0.5) * 16;

      const newFacing = targetXRef.current > xRef.current;
      if (newFacing !== facingRightRef.current) {
        facingRightRef.current = newFacing;
        setFacingRight(newFacing);
      }
      setIsWalking(true);

      moveTimerRef.current = setTimeout(() => {
        if (!isActiveRef.current) return;
        setIsWalking(false);
        if (Math.random() > 0.65) {
          setIsSleeping(true);
          sleepTimerRef.current = setTimeout(() => {
            if (isActiveRef.current) setIsSleeping(false);
          }, 3000 + Math.random() * 5000);
        }
        moveTimerRef.current = setTimeout(scheduleNextMove, 2000 + Math.random() * 4000);
      }, 1500 + Math.random() * 2500);
    };

    const initialTimer = setTimeout(scheduleNextMove, 1500);
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(moveTimerRef.current);
      clearTimeout(sleepTimerRef.current);
    };
  }, [entranceDone]);

  /* ---- animation loop ---- */
  useEffect(() => {
    if (!visible) return;

    const animate = () => {
      if (!isActiveRef.current) return;
      setX((prev) => {
        if (draggingRef.current || sleepingRef.current || rainingRef.current) return prev;
        const dx = targetXRef.current - prev;
        if (Math.abs(dx) < 0.5) return prev;
        const next = prev + (dx > 0 ? SPEED : -SPEED);
        xRef.current = next;
        return next;
      });
      setY((prev) => {
        if (draggingRef.current || sleepingRef.current || rainingRef.current) return prev;
        const dy = targetYRef.current - prev;
        if (Math.abs(dy) < 0.3) return prev;
        const next = prev + (dy > 0 ? 0.4 : -0.4);
        yRef.current = next;
        return next;
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [visible]);

  /* ---- drag ---- */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (sleepingRef.current) {
      setIsSleeping(false);
      setShowBubble('Yawn~');
      bubbleTimerRef.current = setTimeout(() => setShowBubble(null), 1500);
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY, catX: xRef.current, catY: yRef.current };
    setIsDragging(true);
    setIsWalking(false);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setMousePos({
        x: Math.max(-3, Math.min(3, (e.clientX - cx) / 18)),
        y: Math.max(-3, Math.min(3, (e.clientY - cy) / 18)),
      });
      return;
    }
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const newX = Math.max(PADDING, Math.min(window.innerWidth - SIZE - PADDING, dragStartRef.current.catX + dx));
    const newY = Math.max(-100, Math.min(100, dragStartRef.current.catY + dy));
    xRef.current = newX;
    yRef.current = newY;
    setX(newX);
    setY(newY);
    if (dx > 2) { facingRightRef.current = true; setFacingRight(true); }
    else if (dx < -2) { facingRightRef.current = false; setFacingRight(false); }
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setY((prev) => prev - 5);
    setTimeout(() => setY((prev) => prev + 5), 150);
  }, []);

  /* ---- petting ---- */
  const handleMouseEnter = useCallback(() => {
    if (draggingRef.current || sleepingRef.current || rainingRef.current) return;
    setIsPetting(true);
    setShowBubble('Purr... ♥');
    const spawnHeart = () => {
      if (!pettingRef.current || !isActiveRef.current) return;
      const id = ++heartIdRef.current;
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setHearts((prev) => [...prev, { id, x: rect.left + SIZE / 2 + (Math.random() - 0.5) * 20, y: rect.top + 10 }]);
      }
      pettingTimerRef.current = setTimeout(spawnHeart, 400 + Math.random() * 300);
    };
    spawnHeart();
    bubbleTimerRef.current = setTimeout(() => setShowBubble(null), 2000);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPetting(false);
    setShowBubble(null);
    clearTimeout(pettingTimerRef.current);
    setTimeout(() => setHearts([]), 1500);
  }, []);

  const removeHeart = useCallback((id: number) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  }, []);

  /* ---- click ---- */
  const handleClick = useCallback(() => {
    if (sleepingRef.current) return;
    const phrases = ['Meow~', 'Purr...', 'Feed me?', '*stare*', 'Movie time?', '♥'];
    setShowBubble(phrases[Math.floor(Math.random() * phrases.length)]);
    clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setShowBubble(null), 2000);
  }, []);

  /* ---- rain ---- */
  const triggerRain = useCallback(() => {
    if (rainingRef.current || sleepingRef.current) return;
    setIsRaining(true);
    setIsWalking(false);
    setShowBubble('*shake shake*');
    rainTimerRef.current = setTimeout(() => {
      if (!isActiveRef.current) return;
      setShowBubble('*lick*');
      setPawLicking(true);
      rainTimerRef.current = setTimeout(() => {
        if (!isActiveRef.current) return;
        setPawLicking(false);
        setIsRaining(false);
        setShowBubble(null);
      }, 2000);
    }, 1500);
  }, []);

  /* ---- return to logo ---- */
  const handleReturnToLogo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExiting(true);
    setShowSmoke(true);
    setShowBubble('Bye~');
    setTimeout(() => {
      if (!isActiveRef.current) return;
      setVisible(false);
      setExiting(false);
      setEntranceDone(false);
      setShowSmoke(false);
      setShowBubble(null);
      setTimeout(() => {
        if (!isActiveRef.current) return;
        setShowSmoke(true);
        setVisible(true);
        targetXRef.current = PADDING + Math.random() * (window.innerWidth - SIZE - PADDING * 2);
        setX(targetXRef.current);
        setY(0);
        setTimeout(() => { setShowSmoke(false); setEntranceDone(true); }, SMOKE_DURATION);
      }, 3000);
    }, SMOKE_DURATION);
  }, []);

  /* ---- random rain ---- */
  useEffect(() => {
    if (!entranceDone) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.97 && !rainingRef.current && !sleepingRef.current && !draggingRef.current) {
        triggerRain();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [entranceDone, triggerRain]);

  /* ---- cleanup ---- */
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      clearTimeout(sleepTimerRef.current);
      clearTimeout(moveTimerRef.current);
      clearTimeout(bubbleTimerRef.current);
      clearTimeout(rainTimerRef.current);
      clearTimeout(pettingTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  /* ==============================================================
     RENDER
     ============================================================== */
  if (!visible && !showSmoke) return null;

  const smokeX = x;
  const smokeY = bottomYRef.current - y;

  return (
    <>
      {showSmoke && (
        <SmokeBurst x={smokeX} y={smokeY} onDone={exiting ? undefined : handleSmokeDone} particleCount={20} />
      )}

      {hearts.map((h) => (
        <FloatingHeart key={h.id} x={h.x} y={h.y} onDone={() => removeHeart(h.id)} />
      ))}

      <div
        ref={containerRef}
        className={cn(
          'fixed z-[100] select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
          !entranceDone && visible && 'animate-cat-appear',
          exiting && 'animate-cat-disappear'
        )}
        style={{
          left: x,
          bottom: PADDING + y,
          width: SIZE,
          height: SIZE,
          transform: `scaleX(${facingRight ? 1 : -1})`,
          opacity: visible ? 1 : 0,
          transition: isDragging ? 'none' : 'opacity 0.3s ease, bottom 0.2s ease',
          pointerEvents: 'auto',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); triggerRain(); }}
      >
        {/* Return button */}
        {entranceDone && !isDragging && !sleepingRef.current && (
          <button
            className={cn(
              'absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-[9px] text-white/70 hover:bg-white/20 hover:text-white transition-all duration-200 z-10',
              showReturnBtn ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
            )}
            onMouseEnter={() => setShowReturnBtn(true)}
            onMouseLeave={() => setShowReturnBtn(false)}
            onClick={handleReturnToLogo}
            title="Return to logo"
            aria-label="Return cat to logo"
          >
            ↑
          </button>
        )}
        <div className="absolute inset-0" onMouseEnter={() => setShowReturnBtn(true)} onMouseLeave={() => setShowReturnBtn(false)} />

        {/* Speech bubble */}
        {showBubble && (
          <div
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 animate-bubble-pop"
            style={{ pointerEvents: 'none' }}
          >
            {showBubble}
          </div>
        )}

        {/* Zzz */}
        {isSleeping && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-white/50 text-xs animate-zzz" style={{ pointerEvents: 'none' }}>
            Zzz
          </div>
        )}

        {/* Rain drops */}
        {isRaining && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-2 bg-blue-300/40 rounded-full animate-rain-drop"
                style={{ left: `${15 + i * 12}%`, top: '-20%', animationDelay: `${i * 0.15}s`, animationDuration: '0.6s' }}
              />
            ))}
          </div>
        )}

        {/* Cat */}
        <CatSVG
          isWalking={isWalking}
          isSleeping={isSleeping}
          isRaining={isRaining}
          isPetting={isPetting}
          pawLicking={pawLicking}
          mousePos={mousePos}
        />
      </div>

      <style>{`
        @keyframes smokePuff {
          0% { opacity: 0.6; transform: translate(0, 0) scale(0.2); }
          40% { opacity: 0.35; transform: translate(var(--tw-translate-x, 0), var(--tw-translate-y, 0)) scale(1.2); }
          100% { opacity: 0; transform: translate(var(--tw-translate-x, 0), calc(var(--tw-translate-y, 0) - 30px)) scale(2); }
        }
        @keyframes heartFloat {
          0% { opacity: 0.8; transform: translateY(0) scale(0.8); }
          50% { opacity: 0.6; transform: translateY(-20px) scale(1); }
          100% { opacity: 0; transform: translateY(-45px) scale(0.6); }
        }
        @keyframes catAppear {
          0% { opacity: 0; transform: scale(0.3) scaleX(var(--facing, 1)); filter: blur(8px); }
          60% { opacity: 1; transform: scale(1.1) scaleX(var(--facing, 1)); filter: blur(0); }
          100% { opacity: 1; transform: scale(1) scaleX(var(--facing, 1)); filter: blur(0); }
        }
        @keyframes catDisappear {
          0% { opacity: 1; transform: scale(1) scaleX(var(--facing, 1)); filter: blur(0); }
          40% { opacity: 0.8; transform: scale(1.15) scaleX(var(--facing, 1)); filter: blur(2px); }
          100% { opacity: 0; transform: scale(0.2) scaleX(var(--facing, 1)); filter: blur(12px); }
        }
        @keyframes bubblePop {
          0% { opacity: 0; transform: translateX(-50%) scale(0.6); }
          60% { opacity: 1; transform: translateX(-50%) scale(1.05); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        @keyframes zzz {
          0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.8); }
          30% { opacity: 0.7; }
          100% { opacity: 0; transform: translateX(-50%) translateY(-18px) scale(1.2); }
        }
        .animate-cat-appear { animation: catAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-cat-disappear { animation: catDisappear 0.7s ease-in forwards; }
        .animate-bubble-pop { animation: bubblePop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-zzz { animation: zzz 2s ease-out infinite; }
        .animate-rain-drop { animation: rainDrop 0.6s linear infinite; }
        @keyframes rainDrop { 0% { opacity: 0.6; transform: translateY(0); } 100% { opacity: 0; transform: translateY(60px); } }
      `}</style>
    </>
  );
}
