import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { preloadAllFrames, frameImagesCache } from '../utils/frameCache';

const TOTAL_FRAMES = 192;
const FRAME_STEP = 2;
const DURATION_MS = 3200; // 3.2s smooth loading timeline

export default function LoadingPage({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const canvasRef = useRef(null);
  const frameIndexRef = useRef(0);
  const animFrameIdRef = useRef(null);
  const completedFiredRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep latest onComplete callback ref to prevent effect re-runs
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Background frame preloader
  useEffect(() => {
    preloadAllFrames();
  }, []);

  // Smooth monotonic 0% -> 100% progress counter
  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    const timer = setInterval(() => {
      if (!isMounted) return;

      const elapsed = Date.now() - startTime;
      const targetPct = Math.min(100, Math.floor((elapsed / DURATION_MS) * 100));

      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, Math.max(prev + 1, targetPct));
      });
    }, 28);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Handle 100% completion & payment-style checkmark transition
  useEffect(() => {
    if (progress >= 100 && !completedFiredRef.current) {
      completedFiredRef.current = true;

      const checkmarkTimer = setTimeout(() => {
        setShowCheckmark(true);

        try {
          confetti({
            particleCount: 65,
            spread: 65,
            origin: { y: 0.5 },
            colors: ['#C49A62', '#1B242A', '#65AB84', '#FBF5EC']
          });
        } catch {}

        const completeTimer = setTimeout(() => {
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
        }, 750);

        return () => clearTimeout(completeTimer);
      }, 120);

      return () => clearTimeout(checkmarkTimer);
    }
  }, [progress]);

  // 20FPS Subsampled Handshake Canvas Loop (Untouched scroll frame animation!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastFrameTime = performance.now();
    const frameInterval = 1000 / 20;

    const render = (currentTime) => {
      const delta = currentTime - lastFrameTime;

      if (delta >= frameInterval) {
        lastFrameTime = currentTime - (delta % frameInterval);

        frameIndexRef.current = (frameIndexRef.current + FRAME_STEP) % TOTAL_FRAMES;
        const index = frameIndexRef.current;

        let img = frameImagesCache[index];
        if (!img || !img.complete || img.naturalWidth === 0) {
          for (let i = index; i >= 0; i--) {
            if (frameImagesCache[i] && frameImagesCache[i].complete && frameImagesCache[i].naturalWidth > 0) {
              img = frameImagesCache[i];
              break;
            }
          }
        }

        if (img && img.complete && img.naturalWidth > 0) {
          const w = canvas.width;
          const h = canvas.height;
          const r = w / 2;

          ctx.clearRect(0, 0, w, h);

          ctx.save();
          ctx.beginPath();
          ctx.arc(r, r, r - 2, 0, Math.PI * 2);
          ctx.clip();

          const imgRatio = img.naturalWidth / img.naturalHeight;
          const canvasRatio = w / h;
          let drawW = w;
          let drawH = h;
          let drawX = 0;
          let drawY = 0;

          if (imgRatio > canvasRatio) {
            drawW = h * imgRatio;
            drawX = (w - drawW) / 2;
          } else {
            drawH = w / imgRatio;
            drawY = (h - drawH) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Safeguard click handler
  const handleForceComplete = () => {
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  // SVG Circular progress math
  const radius = 136;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.04,
        filter: 'blur(8px)',
        transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] }
      }}
      onClick={handleForceComplete}
      className="min-h-screen w-screen bg-[#FBF5EC] text-[#1B242A] flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none font-sans relative cursor-pointer"
    >
      {/* BRANDING HEADER WITH OFFICIAL SWAPLY LOGO */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="flex items-center gap-3">
          <img
            src="/swaply-logo.jpeg"
            alt="Swaply Logo"
            className="h-10 w-auto rounded-lg shadow-sm object-contain"
          />
          <div className="text-left">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1B242A] block leading-none">
              Swaply
            </span>
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#C49A62] block mt-1">
              SWAP • LEARN • GROW
            </span>
          </div>
        </div>
      </div>

      {/* CENTERPIECE: CIRCULAR LENS WITH FRAME SCROLL ANIMATION & GOLD/CHARCOAL PALETTE */}
      <div className="my-auto flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto w-full">
        
        {/* CIRCULAR CONTAINER WITH ELEGANT GOLD PROGRESS RING */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          
          {/* SVG CIRCULAR PROGRESS RING */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10" viewBox="0 0 300 300">
            {/* Background Ring Track */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              stroke="#E8DDD0"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Elegant Gold / Emerald Progress Ring */}
            <motion.circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              stroke={showCheckmark ? '#65AB84' : '#C49A62'}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ ease: 'linear', duration: 0.05 }}
              style={{ transition: 'stroke 0.3s ease-out' }}
            />
          </svg>

          {/* INNER CIRCULAR LENS CONTAINER */}
          <motion.div
            animate={{
              scale: showCheckmark ? [1, 1.08, 1] : 1
            }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative w-64 h-64 rounded-full border-3 border-[#1B242A] shadow-xl overflow-hidden bg-[#F7EFE5] flex items-center justify-center z-0"
          >
            {/* Frame Scroll Canvas Animation (Untouched!) */}
            <canvas
              ref={canvasRef}
              width={256}
              height={256}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                showCheckmark ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Subtle Gloss Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/25 pointer-events-none rounded-full z-10" />

            {/* CHECKMARK OVERLAY WITH BRAND ELEGANCE */}
            <AnimatePresence>
              {showCheckmark && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="absolute inset-0 bg-[#65AB84] border-3 border-[#1B242A] rounded-full flex items-center justify-center z-20 shadow-inner"
                >
                  <svg className="w-32 h-32 text-white" viewBox="0 0 100 100">
                    <motion.path
                      d="M 30 52 L 44 66 L 72 36"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35, ease: 'easeOut', delay: 0.08 }}
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ELEGANT GOLD & CHARCOAL PERCENTAGE BADGE */}
          <motion.div
            animate={{
              scale: showCheckmark ? [1, 1.1, 1] : 1
            }}
            className={`absolute -bottom-3 z-30 border-2 border-[#1B242A] px-4 py-1.5 rounded-full shadow-md text-xs font-black tracking-tight flex items-center gap-1 transition-colors duration-300 ${
              showCheckmark ? 'bg-[#65AB84] text-white' : 'bg-[#1B242A] text-[#FBF5EC]'
            }`}
          >
            {showCheckmark ? (
              <span className="font-extrabold flex items-center gap-1">
                <span>✓ READY</span>
              </span>
            ) : (
              <>
                <span className="font-mono text-sm tracking-wider text-[#C49A62]">
                  {String(progress).padStart(3, '0')}
                </span>
                <span className="text-[#C49A62] font-black">%</span>
              </>
            )}
          </motion.div>

        </div>

        {/* ELEGANT TAGLINE MATCHING BRAND LOGO */}
        <div className="pt-3">
          <p className="text-xs font-bold text-[#1B242A]/70 tracking-[0.2em] uppercase">
            {showCheckmark ? '🎉 Welcome to Swaply!' : 'S W A P  •  L E A R N  •  G R O W'}
          </p>
        </div>

      </div>

      {/* BRAND FOOTER */}
      <div className="text-center text-[11px] font-bold text-[#1B242A]/40 tracking-widest uppercase">
        100% Free Peer-to-Peer Skill Exchange
      </div>
    </motion.div>
  );
}
