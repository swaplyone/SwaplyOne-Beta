import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Repeat, ShieldCheck, ArrowRightLeft, Cpu } from 'lucide-react';

const FLOATING_SKILLS = [
  { text: '💻 React.js', color: 'bg-swaply-yellow', initialX: -180, initialY: -120, delay: 0 },
  { text: '🎨 UI/UX Design', color: 'bg-swaply-coral text-white', initialX: 180, initialY: -140, delay: 0.1 },
  { text: '🎸 Acoustic Guitar', color: 'bg-swaply-mint', initialX: -220, initialY: 100, delay: 0.2 },
  { text: '🇪🇸 Conversational Spanish', color: 'bg-swaply-orange text-white', initialX: 200, initialY: 120, delay: 0.15 },
  { text: '🤖 AI Prompting', color: 'bg-swaply-blue text-white', initialX: -140, initialY: 220, delay: 0.25 },
  { text: '📷 Photography', color: 'bg-swaply-pink', initialX: 150, initialY: 240, delay: 0.3 },
];

const TICKER_MESSAGES = [
  "Initializing Swaply Skill Exchange Network...",
  "Loading 192 high-definition animation frames...",
  "Decoding smooth 60FPS scroll bitmap sequences...",
  "Connecting learners and mentors worldwide...",
  "Readying buttery smooth handshake experience!"
];

export default function FrameLoader({ progress, loadedCount, totalFrames }) {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const idx = Math.min(
      TICKER_MESSAGES.length - 1,
      Math.floor((progress / 100) * TICKER_MESSAGES.length)
    );
    setTickerIndex(idx);
  }, [progress]);

  const displayProgress = String(progress).padStart(3, '0');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.04,
        filter: 'blur(10px)',
        transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] }
      }}
      className="fixed inset-0 z-[9999] w-screen h-screen bg-paper bg-paper-grid flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-hidden select-none font-sans"
    >
      {/* FLOATING SKILL STICKERS BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {FLOATING_SKILLS.map((skill, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.5, x: skill.initialX, y: skill.initialY }}
            animate={{
              opacity: [0.4, 0.85, 0.4],
              scale: [0.95, 1.05, 0.95],
              y: [skill.initialY - 10, skill.initialY + 10, skill.initialY - 10],
            }}
            transition={{
              duration: 4 + index,
              repeat: Infinity,
              repeatType: "reverse",
              delay: skill.delay,
              ease: "easeInOut"
            }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-2 border-3 border-swaply-black px-4 py-2 rounded-2xl font-black text-sm shadow-hard-md ${skill.color}`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{skill.text}</span>
          </motion.div>
        ))}
      </div>

      {/* TOP BRAND HEADER */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-swaply-yellow border-3 border-swaply-black rounded-2xl shadow-hard flex items-center justify-center font-black text-xl sm:text-2xl">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl text-swaply-black tracking-tight">SWAPLY</span>
              <span className="inline-flex items-center gap-1 bg-swaply-mint border-2 border-swaply-black px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-ping" />
                Live Network
              </span>
            </div>
            <span className="text-[11px] font-bold text-swaply-black/60 block -mt-0.5">
              Learn What You Love • 100% Free
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-paper-card border-3 border-swaply-black px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-hard text-xs font-black">
          <Cpu className="w-4 h-4 text-swaply-coral animate-spin" style={{ animationDuration: '4s' }} />
          <span className="hidden sm:inline">PRELOADING INTERACTIVE CANVAS</span>
          <span className="sm:hidden">LOADING</span>
        </div>
      </div>

      {/* CENTER HERO STAGE */}
      <div className="relative z-10 max-w-2xl w-full mx-auto my-auto flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
        
        {/* INTERACTIVE ANIMATED NODES */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-4 sm:gap-8"
        >
          <div className="neo-card bg-swaply-yellow p-3 sm:p-4 rounded-2xl flex items-center gap-2">
            <span className="text-xl sm:text-2xl">👨‍💻</span>
            <div className="text-left hidden xs:block">
              <div className="text-[10px] font-black uppercase text-swaply-black/70">TEACH</div>
              <div className="text-xs sm:text-sm font-black text-swaply-black">Coding</div>
            </div>
          </div>

          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-swaply-coral text-white border-3 border-swaply-black rounded-full shadow-hard flex items-center justify-center animate-pulse">
            <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="neo-card bg-swaply-mint p-3 sm:p-4 rounded-2xl flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🎨</span>
            <div className="text-left hidden xs:block">
              <div className="text-[10px] font-black uppercase text-swaply-black/70">LEARN</div>
              <div className="text-xs sm:text-sm font-black text-swaply-black">Design</div>
            </div>
          </div>
        </motion.div>

        {/* GIANT NUMERICAL COUNTER */}
        <div className="space-y-1">
          <motion.div
            key={displayProgress}
            initial={{ y: 5, opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-7xl sm:text-9xl font-black text-swaply-black font-mono tracking-tighter leading-none select-none flex items-baseline justify-center"
          >
            <span>{displayProgress}</span>
            <span className="text-4xl sm:text-6xl text-swaply-coral font-black ml-1">%</span>
          </motion.div>

          {/* DYNAMIC TICKER PHRASE */}
          <AnimatePresence mode="wait">
            <motion.p
              key={tickerIndex}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs sm:text-base font-bold text-swaply-black/80 max-w-md mx-auto h-6"
            >
              {TICKER_MESSAGES[tickerIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* HIGH-END NEO-BRUTALIST PROGRESS BAR */}
        <div className="w-full space-y-3 max-w-lg">
          <div className="w-full h-8 sm:h-9 bg-white border-4 border-swaply-black rounded-2xl p-1.5 shadow-hard-xl relative overflow-hidden">
            {/* STRIPED BACKGROUND PATTERN */}
            <div
              className="h-full bg-gradient-to-r from-swaply-yellow via-swaply-orange to-swaply-coral rounded-xl transition-all duration-200 ease-out flex items-center justify-end px-2.5 relative"
              style={{ width: `${Math.max(6, progress)}%` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-black text-swaply-black/80 px-1">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-swaply-orange fill-swaply-orange" />
              <span>{loadedCount} / {totalFrames} FRAMES READY</span>
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-black">
              <ShieldCheck className="w-4 h-4" />
              <span>{progress === 100 ? 'COMPLETE' : 'DECODING'}</span>
            </span>
          </div>
        </div>

      </div>

      {/* FOOTER BAR */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-7xl mx-auto pt-4 border-t-2 border-swaply-black/20 text-xs font-black text-swaply-black/70">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-swaply-coral" />
          <span>Zero-Cost Skill Swapping Engine</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-swaply-yellow border-2 border-swaply-black px-3 py-1 rounded-xl text-swaply-black shadow-hard-sm">
            ✨ Interactive Experience
          </span>
        </div>
      </div>

    </motion.div>
  );
}
