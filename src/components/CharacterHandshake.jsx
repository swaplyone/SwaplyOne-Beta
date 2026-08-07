import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Zap, BookOpen, Code, Palette, Music } from 'lucide-react';

export default function CharacterHandshake() {
  const containerRef = useRef(null);
  const [hasShakenHands, setHasShakenHands] = useState(false);
  const [isManualTouch, setIsManualTouch] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smooth out scroll progress with a spring
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

  // Map scroll progress to horizontal translation (X position)
  // Initially at 0 scroll: Person 1 at -220px, Person 2 at +220px
  // At ~0.45 scroll progress: they meet in center (0px)
  const person1X = useTransform(smoothProgress, [0, 0.45, 1], [-220, -35, 150]);
  const person2X = useTransform(smoothProgress, [0, 0.45, 1], [220, 35, -150]);

  // Arm rotation for handshake
  const arm1Rotate = useTransform(smoothProgress, [0, 0.4, 0.45, 1], [0, 25, 45, 10]);
  const arm2Rotate = useTransform(smoothProgress, [0, 0.4, 0.45, 1], [0, -25, -45, -10]);

  // Sparkle burst scale at handshake moment
  const burstScale = useTransform(smoothProgress, [0.4, 0.45, 0.55], [0, 1.2, 0]);
  const burstOpacity = useTransform(smoothProgress, [0.4, 0.45, 0.55], [0, 1, 0]);

  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (val) => {
      if (val >= 0.42 && val <= 0.48 && !hasShakenHands) {
        setHasShakenHands(true);
        // Trigger light confetti burst
        try {
          confetti({
            particleCount: 25,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#FFE569', '#FF6B6B', '#4ECDC4', '#A06CD5']
          });
        } catch (e) {
          // fallback ignore
        }
      }
    });
    return () => unsubscribe();
  }, [smoothProgress, hasShakenHands]);

  return (
    <div ref={containerRef} className="relative w-full py-12 my-6 bg-paper-cream border-3 border-swaply-black rounded-3xl shadow-hard overflow-hidden bg-paper-grid">
      
      {/* SECTION ANNOTATION */}
      <div className="absolute top-4 left-6 flex items-center gap-2">
        <span className="bg-swaply-yellow border-2 border-swaply-black px-3 py-1 rounded-full text-xs font-black shadow-hard-sm uppercase tracking-wider">
          Interactive Scroll Visual
        </span>
        <span className="font-handwriting text-lg text-swaply-coral hidden sm:inline">
          ↓ Scroll down to bring them together!
        </span>
      </div>

      {/* BACKGROUND STICKERS */}
      <div className="absolute top-12 right-8 bg-swaply-pink/20 border-2 border-swaply-black rounded-xl p-2 rotate-6 shadow-hard-sm text-xs font-bold flex items-center gap-1">
        <Music className="w-4 h-4 text-swaply-purple" /> Guitar & Code
      </div>
      <div className="absolute bottom-6 left-8 bg-swaply-mint/20 border-2 border-swaply-black rounded-xl p-2 -rotate-3 shadow-hard-sm text-xs font-bold flex items-center gap-1">
        <Palette className="w-4 h-4 text-swaply-coral" /> UI Design & Languages
      </div>

      {/* CHARACTER ANIMATION CANVAS */}
      <div className="relative min-h-[340px] flex items-center justify-center pt-8">

        {/* CENTER HANDSHAKE SPARKS & BURST */}
        <motion.div
          style={{ scale: burstScale, opacity: burstOpacity }}
          className="absolute z-20 pointer-events-none flex flex-col items-center justify-center"
        >
          <div className="bg-swaply-yellow border-3 border-swaply-black px-4 py-1.5 rounded-full shadow-hard text-sm font-marker text-swaply-black rotate-[-2deg] flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-swaply-black" /> SKILL MATCHED! <Sparkles className="w-4 h-4 fill-swaply-coral text-swaply-coral" />
          </div>
          {/* STAR SPARKS */}
          <div className="absolute -top-12 -left-12 text-swaply-coral text-3xl font-black rotate-12">✦</div>
          <div className="absolute -top-12 -right-12 text-swaply-mint text-3xl font-black -rotate-12">★</div>
          <div className="absolute -bottom-10 text-swaply-purple text-2xl font-black">✦</div>
        </motion.div>

        {/* PERSON 1 (TEACHER - LEFT SIDE) */}
        <motion.div
          style={{ x: person1X }}
          className="absolute z-10 flex flex-col items-center cursor-grab active:cursor-grabbing"
        >
          {/* SKILL BUBBLE ABOVE PERSON 1 */}
          <div className="mb-2 bg-swaply-yellow border-2 border-swaply-black px-3 py-1 rounded-2xl shadow-hard-sm rotate-[-4deg] text-xs font-extrabold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>"I can teach Web Dev & Music!"</span>
          </div>

          {/* PERSON 1 SVG ILLUSTRATION */}
          <svg width="140" height="180" viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
            {/* Body / Shirt */}
            <rect x="35" y="75" width="70" height="75" rx="14" fill="#FF6B6B" stroke="#121212" strokeWidth="4"/>
            {/* Shirt Pattern lines */}
            <path d="M45 105 L95 105" stroke="#121212" strokeWidth="3" strokeDasharray="4 4" />
            
            {/* Head */}
            <circle cx="70" cy="45" r="32" fill="#FFE569" stroke="#121212" strokeWidth="4"/>
            {/* Glasses */}
            <rect x="50" y="36" width="16" height="14" rx="3" fill="none" stroke="#121212" strokeWidth="3.5"/>
            <rect x="74" y="36" width="16" height="14" rx="3" fill="none" stroke="#121212" strokeWidth="3.5"/>
            <line x1="66" y1="43" x2="74" y2="43" stroke="#121212" strokeWidth="3.5"/>
            
            {/* Smile */}
            <path d="M58 56 Q70 66 82 56" stroke="#121212" strokeWidth="4" strokeLinecap="round" fill="none" />
            
            {/* Hair */}
            <path d="M42 35 C42 20, 60 12, 70 12 C80 12, 98 20, 98 35" fill="#121212" stroke="#121212" strokeWidth="3"/>
            
            {/* Left Arm (holding laptop/book) */}
            <path d="M35 85 L15 110" stroke="#121212" strokeWidth="7" strokeLinecap="round"/>
            <rect x="5" y="105" width="22" height="18" rx="3" fill="#A06CD5" stroke="#121212" strokeWidth="3"/>

            {/* Right Arm (Reaching forward to handshake) */}
            <g transform="translate(100, 85)">
              <path d="M0 0 L35 15" stroke="#121212" strokeWidth="8" strokeLinecap="round" />
              {/* Hand */}
              <circle cx="40" cy="18" r="8" fill="#FFE569" stroke="#121212" strokeWidth="3" />
            </g>

            {/* Legs */}
            <rect x="48" y="148" width="14" height="28" rx="6" fill="#121212" />
            <rect x="78" y="148" width="14" height="28" rx="6" fill="#121212" />
          </svg>
          <span className="mt-1 font-bold text-xs bg-paper border-2 border-swaply-black px-2 py-0.5 rounded-full shadow-hard-sm">Alex (Teacher)</span>
        </motion.div>

        {/* PERSON 2 (LEARNER - RIGHT SIDE) */}
        <motion.div
          style={{ x: person2X }}
          className="absolute z-10 flex flex-col items-center cursor-grab active:cursor-grabbing"
        >
          {/* SKILL BUBBLE ABOVE PERSON 2 */}
          <div className="mb-2 bg-swaply-mint border-2 border-swaply-black px-3 py-1 rounded-2xl shadow-hard-sm rotate-[4deg] text-xs font-extrabold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-swaply-black" />
            <span>"I want to learn Coding!"</span>
          </div>

          {/* PERSON 2 SVG ILLUSTRATION */}
          <svg width="140" height="180" viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
            {/* Body / Hoodie */}
            <rect x="35" y="75" width="70" height="75" rx="14" fill="#4ECDC4" stroke="#121212" strokeWidth="4"/>
            {/* Hoodie Pocket */}
            <path d="M48 115 L92 115 L86 135 L54 135 Z" fill="#FFE569" stroke="#121212" strokeWidth="3"/>
            
            {/* Head */}
            <circle cx="70" cy="45" r="32" fill="#FF85A1" stroke="#121212" strokeWidth="4"/>
            {/* Eyes */}
            <circle cx="58" cy="42" r="4.5" fill="#121212" />
            <circle cx="82" cy="42" r="4.5" fill="#121212" />
            
            {/* Happy Smile */}
            <path d="M58 55 Q70 68 82 55" stroke="#121212" strokeWidth="4" strokeLinecap="round" fill="none" />
            
            {/* Fun Beanie Cap */}
            <path d="M38 35 Q70 12 102 35 Z" fill="#A06CD5" stroke="#121212" strokeWidth="3.5"/>
            <circle cx="70" cy="14" r="6" fill="#FFE569" stroke="#121212" strokeWidth="3" />

            {/* Right Arm (holding notebook) */}
            <path d="M105 85 L125 110" stroke="#121212" strokeWidth="7" strokeLinecap="round"/>
            <rect x="112" y="105" width="22" height="18" rx="3" fill="#FFE569" stroke="#121212" strokeWidth="3"/>

            {/* Left Arm (Reaching forward to handshake) */}
            <g transform="translate(35, 85)">
              <path d="M0 0 L-35 15" stroke="#121212" strokeWidth="8" strokeLinecap="round" />
              {/* Hand */}
              <circle cx="-40" cy="18" r="8" fill="#FF85A1" stroke="#121212" strokeWidth="3" />
            </g>

            {/* Legs */}
            <rect x="48" y="148" width="14" height="28" rx="6" fill="#121212" />
            <rect x="78" y="148" width="14" height="28" rx="6" fill="#121212" />
          </svg>
          <span className="mt-1 font-bold text-xs bg-paper border-2 border-swaply-black px-2 py-0.5 rounded-full shadow-hard-sm">Maya (Learner)</span>
        </motion.div>

      </div>

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
