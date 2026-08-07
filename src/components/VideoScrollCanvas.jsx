import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Zap, Play, Pause, RefreshCw } from 'lucide-react';

export default function VideoScrollCanvas({ videoSrc = "/hero-animation.mp4" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasShakenHands, setHasShakenHands] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001
  });

  // Mappings for fallback SVG character handshake animation
  const person1X = useTransform(smoothProgress, [0, 0.45, 1], [-220, -35, 150]);
  const person2X = useTransform(smoothProgress, [0, 0.45, 1], [220, 35, -150]);
  const burstScale = useTransform(smoothProgress, [0.4, 0.45, 0.55], [0, 1.2, 0]);
  const burstOpacity = useTransform(smoothProgress, [0.4, 0.45, 0.55], [0, 1, 0]);

  // Video Frame Seek Logic based on scroll position
  useEffect(() => {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    const handleCanPlay = () => {
      videoRef.current = video;
      setIsVideoReady(true);
    };

    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('loadeddata', handleCanPlay);

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('loadeddata', handleCanPlay);
    };
  }, [videoSrc]);

  // Draw video frames to Canvas on scroll progress update
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (progress) => {
      // Trigger confetti at handshake moment (~0.45 scroll progress)
      if (progress >= 0.42 && progress <= 0.48 && !hasShakenHands) {
        setHasShakenHands(true);
        try {
          confetti({
            particleCount: 30,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#FFE569', '#FF6B6B', '#4ECDC4', '#A06CD5']
          });
        } catch (e) {}
      }

      // If video is loaded, update video currentTime and draw frame on canvas
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && isVideoReady && canvas && video.duration) {
        const targetTime = progress * video.duration;
        if (Math.abs(video.currentTime - targetTime) > 0.04) {
          video.currentTime = targetTime;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }
    });

    return () => unsubscribe();
  }, [smoothProgress, isVideoReady, hasShakenHands]);

  return (
    <div
      ref={containerRef}
      className="relative w-full py-10 my-6 bg-paper-cream border-3 border-swaply-black rounded-3xl shadow-hard overflow-hidden bg-paper-grid"
    >
      {/* SECTION ANNOTATION & BADGE */}
      <div className="absolute top-4 left-6 flex items-center gap-2 z-20">
        <span className="bg-swaply-yellow border-2 border-swaply-black px-3 py-1 rounded-full text-xs font-black shadow-hard-sm uppercase tracking-wider">
          Scroll-Driven Animation
        </span>
        <span className="font-handwriting text-lg text-swaply-coral hidden sm:inline font-bold">
          ↓ Scroll to control the character movement!
        </span>
      </div>

      {/* VIDEO CANVAS FRAME PLAYER */}
      {isVideoReady ? (
        <div className="relative w-full h-[360px] flex items-center justify-center pt-8">
          <canvas
            ref={canvasRef}
            width={720}
            height={360}
            className="w-full max-w-2xl h-auto rounded-2xl border-2 border-swaply-black shadow-hard-sm"
          />
        </div>
      ) : (
        /* FALLBACK SMOOTH SVG CHARACTER SCROLL ANIMATION */
        <div className="relative min-h-[340px] flex items-center justify-center pt-8">
          
          {/* CENTER SPARKS & BURST */}
          <motion.div
            style={{ scale: burstScale, opacity: burstOpacity }}
            className="absolute z-20 pointer-events-none flex flex-col items-center justify-center"
          >
            <div className="bg-swaply-yellow border-3 border-swaply-black px-4 py-1.5 rounded-full shadow-hard text-sm font-marker text-swaply-black rotate-[-2deg] flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-swaply-black" /> SKILL MATCHED! <Sparkles className="w-4 h-4 fill-swaply-coral text-swaply-coral" />
            </div>
            <div className="absolute -top-12 -left-12 text-swaply-coral text-3xl font-black rotate-12">✦</div>
            <div className="absolute -top-12 -right-12 text-swaply-mint text-3xl font-black -rotate-12">★</div>
          </motion.div>

          {/* PERSON 1 (TEACHER - LEFT) */}
          <motion.div
            style={{ x: person1X }}
            className="absolute z-10 flex flex-col items-center cursor-grab active:cursor-grabbing"
          >
            <div className="mb-2 bg-swaply-yellow border-2 border-swaply-black px-3 py-1 rounded-2xl shadow-hard-sm rotate-[-4deg] text-xs font-extrabold flex items-center gap-1.5">
              <span>"I can teach Web Dev & Music!"</span>
            </div>

            <svg width="140" height="180" viewBox="0 0 140 180" fill="none" className="drop-shadow-md">
              <rect x="35" y="75" width="70" height="75" rx="14" fill="#FF6B6B" stroke="#121212" strokeWidth="4"/>
              <circle cx="70" cy="45" r="32" fill="#FFE569" stroke="#121212" strokeWidth="4"/>
              <rect x="50" y="36" width="16" height="14" rx="3" fill="none" stroke="#121212" strokeWidth="3.5"/>
              <rect x="74" y="36" width="16" height="14" rx="3" fill="none" stroke="#121212" strokeWidth="3.5"/>
              <path d="M58 56 Q70 66 82 56" stroke="#121212" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M42 35 C42 20, 60 12, 70 12 C80 12, 98 20, 98 35" fill="#121212" stroke="#121212" strokeWidth="3"/>
              <path d="M35 85 L15 110" stroke="#121212" strokeWidth="7" strokeLinecap="round"/>
              <rect x="5" y="105" width="22" height="18" rx="3" fill="#A06CD5" stroke="#121212" strokeWidth="3"/>
              <g transform="translate(100, 85)">
                <path d="M0 0 L35 15" stroke="#121212" strokeWidth="8" strokeLinecap="round" />
                <circle cx="40" cy="18" r="8" fill="#FFE569" stroke="#121212" strokeWidth="3" />
              </g>
              <rect x="48" y="148" width="14" height="28" rx="6" fill="#121212" />
              <rect x="78" y="148" width="14" height="28" rx="6" fill="#121212" />
            </svg>
            <span className="mt-1 font-bold text-xs bg-paper border-2 border-swaply-black px-2 py-0.5 rounded-full shadow-hard-sm">Alex (Teacher)</span>
          </motion.div>

          {/* PERSON 2 (LEARNER - RIGHT) */}
          <motion.div
            style={{ x: person2X }}
            className="absolute z-10 flex flex-col items-center cursor-grab active:cursor-grabbing"
          >
            <div className="mb-2 bg-swaply-mint border-2 border-swaply-black px-3 py-1 rounded-2xl shadow-hard-sm rotate-[4deg] text-xs font-extrabold flex items-center gap-1.5">
              <span>"I want to learn Coding!"</span>
            </div>

            <svg width="140" height="180" viewBox="0 0 140 180" fill="none" className="drop-shadow-md">
              <rect x="35" y="75" width="70" height="75" rx="14" fill="#4ECDC4" stroke="#121212" strokeWidth="4"/>
              <circle cx="70" cy="45" r="32" fill="#FF85A1" stroke="#121212" strokeWidth="4"/>
              <circle cx="58" cy="42" r="4.5" fill="#121212" />
              <circle cx="82" cy="42" r="4.5" fill="#121212" />
              <path d="M58 55 Q70 68 82 55" stroke="#121212" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M38 35 Q70 12 102 35 Z" fill="#A06CD5" stroke="#121212" strokeWidth="3.5"/>
              <path d="M105 85 L125 110" stroke="#121212" strokeWidth="7" strokeLinecap="round"/>
              <rect x="112" y="105" width="22" height="18" rx="3" fill="#FFE569" stroke="#121212" strokeWidth="3"/>
              <g transform="translate(35, 85)">
                <path d="M0 0 L-35 15" stroke="#121212" strokeWidth="8" strokeLinecap="round" />
                <circle cx="-40" cy="18" r="8" fill="#FF85A1" stroke="#121212" strokeWidth="3" />
              </g>
              <rect x="48" y="148" width="14" height="28" rx="6" fill="#121212" />
              <rect x="78" y="148" width="14" height="28" rx="6" fill="#121212" />
            </svg>
            <span className="mt-1 font-bold text-xs bg-paper border-2 border-swaply-black px-2 py-0.5 rounded-full shadow-hard-sm">Maya (Learner)</span>
          </motion.div>

        </div>
      )}

      {/* DISPLAY CAPTION */}
      <div className="mt-4 text-center px-4">
        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-swaply-black">
          "One person teaches. One person learns. <span className="underline decoration-swaply-coral underline-offset-4 decoration-4">Both grow.</span>"
        </h3>
        <p className="text-sm font-bold text-swaply-black/70 mt-1 font-handwriting text-lg">
          Connection + Skill Exchange + Growth
        </p>
      </div>

    </div>
  );
}
