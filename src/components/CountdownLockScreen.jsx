import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Bell, Lock, ArrowRight, ShieldCheck, Clock, KeyRound } from 'lucide-react';
import SwaplyLogo from './SwaplyLogo';
import { getTimeRemaining } from '../config/launchConfig';

/**
 * Individual Split-Flap Card Component
 * Emulates vintage mechanical flip clock card with top/bottom seam & 3D flip animation
 */
function SingleFlipUnit({ value, label }) {
  const formattedVal = String(value).padStart(2, '0');
  const [currentVal, setCurrentVal] = useState(formattedVal);
  const [previousVal, setPreviousVal] = useState(formattedVal);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (formattedVal !== currentVal) {
      setPreviousVal(currentVal);
      setCurrentVal(formattedVal);
      setIsFlipping(true);
      const timer = setTimeout(() => setIsFlipping(false), 550);
      return () => clearTimeout(timer);
    }
  }, [formattedVal, currentVal]);

  return (
    <div className="flex flex-col items-center">
      {/* CARD CONTAINER */}
      <div 
        className="relative w-20 sm:w-28 md:w-36 h-24 sm:h-32 md:h-40 rounded-xl bg-[#171F24] border-2 border-[#C49A62]/40 shadow-[0_12px_28px_rgba(0,0,0,0.5),0_6px_0_#C49A62] flex flex-col justify-between overflow-hidden select-none perspective-800"
        style={{ perspective: '1000px' }}
      >
        {/* CENTER SEAM & HINGES */}
        <div className="absolute top-1/2 inset-x-0 h-[2px] bg-[#0E1418] z-30 shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2.5 h-3.5 bg-[#C49A62] border border-[#0E1418] rounded-sm z-40 shadow-sm" />
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2.5 h-3.5 bg-[#C49A62] border border-[#0E1418] rounded-sm z-40 shadow-sm" />

        {/* TOP HALF STATIC (Shows current value) */}
        <div className="relative w-full h-1/2 bg-gradient-to-b from-[#222C33] to-[#1A2228] overflow-hidden flex items-end justify-center border-b border-[#0E1418]/60">
          <span className="translate-y-1/2 font-mono text-3xl sm:text-5xl md:text-6xl font-black text-[#FBF5EC] tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {currentVal}
          </span>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* BOTTOM HALF STATIC (Shows previous value during flip, then current value) */}
        <div className="relative w-full h-1/2 bg-gradient-to-b from-[#182026] to-[#12191F] overflow-hidden flex items-start justify-center">
          <span className="-translate-y-1/2 font-mono text-3xl sm:text-5xl md:text-6xl font-black text-[#FBF5EC] tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {isFlipping ? previousVal : currentVal}
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* ANIMATED FLIPPING CARD (FLIP DOWN) */}
        <AnimatePresence>
          {isFlipping && (
            <motion.div
              key={currentVal}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: -180 }}
              transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
              style={{ transformOrigin: 'bottom', transformStyle: 'preserve-3d' }}
              className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-[#253139] to-[#1D262D] border-b border-[#0E1418] overflow-hidden flex items-end justify-center z-20"
            >
              <span className="translate-y-1/2 font-mono text-3xl sm:text-5xl md:text-6xl font-black text-[#FBF5EC] tracking-tighter">
                {previousVal}
              </span>
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CARD LABEL */}
      <span className="mt-3 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#C49A62] bg-[#171F24]/80 px-3 py-1 rounded-full border border-[#C49A62]/30 shadow-sm">
        {label}
      </span>
    </div>
  );
}

export default function CountdownLockScreen({ onOpenJoinModal, onUnlockSuccess }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());
  const [passcode, setPasscode] = useState('');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);

  // Live interval timer
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeLeft(remaining);

      if (remaining.isComplete) {
        clearInterval(timer);
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.4 },
            colors: ['#C49A62', '#1B242A', '#65AB84', '#FBF5EC']
          });
        } catch {}

        if (onUnlockSuccess) {
          onUnlockSuccess();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onUnlockSuccess]);

  // Handle secret admin bypass code submission
  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode.trim().toLowerCase() === 'swaply' || passcode.trim() === '1000' || passcode.trim() === '2026') {
      setPasscodeError(false);
      setShowPasscodeModal(false);
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {}
      if (onUnlockSuccess) {
        onUnlockSuccess();
      }
    } else {
      setPasscodeError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#141C21] text-[#FBF5EC] flex flex-col justify-between items-center relative overflow-hidden font-sans selection:bg-[#C49A62] selection:text-[#1B242A] px-4 py-8 sm:py-12">
      
      {/* VINTAGE AMBIENT BACKGROUND GRADIENTS & GRID */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,#202B33_0%,#11171B_70%)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#C49A62 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />

      {/* TOP BRAND HEADER */}
      <header className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto mt-2 sm:mt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 bg-[#1B242A] border-2 border-[#C49A62]/40 px-5 py-2.5 rounded-full shadow-hard-yellow"
        >
          <SwaplyLogo className="w-8 h-8 text-[#C49A62]" />
          <span className="font-extrabold text-xl tracking-tight text-[#FBF5EC]">Swaply</span>
          <span className="bg-[#C49A62] text-[#1B242A] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Launch Countdown
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-3xl sm:text-5xl font-black text-[#FBF5EC] tracking-tight leading-tight"
        >
          We Are Opening Doors On <br />
          <span className="text-[#C49A62] underline decoration-[#C49A62]/40 decoration-wavy underline-offset-8">
            August 9th at 10:00 AM
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-3 text-sm sm:text-base text-[#FBF5EC]/70 max-w-md font-medium"
        >
          Swaply is currently preparing for our official launch. Mark your calendar and get ready to swap skills seamlessly!
        </motion.p>
      </header>

      {/* MAIN RETRO FLIP CARD CLOCK DISPLAY */}
      <main className="relative z-10 my-8 sm:my-12 w-full max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-[#1B242A]/90 backdrop-blur-md p-6 sm:p-10 md:p-12 rounded-3xl border-3 border-[#C49A62]/40 shadow-[0_20px_50px_rgba(0,0,0,0.6),4px_4px_0px_#C49A62] w-full flex flex-col items-center"
        >
          {/* BADGE */}
          <div className="flex items-center gap-2 text-xs font-bold text-[#C49A62] bg-[#141C21] px-4 py-1.5 rounded-full border border-[#C49A62]/30 mb-8 shadow-inner">
            <Clock className="w-4 h-4 animate-spin-slow text-[#C49A62]" />
            <span>COUNTDOWN TO OFFICIAL ACCESS</span>
          </div>

          {/* FLIP CLOCK GRID */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 flex-wrap">
            <SingleFlipUnit value={timeLeft.days} label="Days" />
            <span className="text-3xl sm:text-5xl font-black text-[#C49A62] -translate-y-4 font-mono select-none">:</span>
            <SingleFlipUnit value={timeLeft.hours} label="Hours" />
            <span className="text-3xl sm:text-5xl font-black text-[#C49A62] -translate-y-4 font-mono select-none">:</span>
            <SingleFlipUnit value={timeLeft.minutes} label="Minutes" />
            <span className="text-3xl sm:text-5xl font-black text-[#C49A62] -translate-y-4 font-mono select-none">:</span>
            <SingleFlipUnit value={timeLeft.seconds} label="Seconds" />
          </div>

          {/* CALL TO ACTION BUTTON */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenJoinModal}
              className="w-full sm:w-auto px-8 py-4 bg-[#C49A62] hover:bg-[#d6aa70] text-[#1B242A] font-black rounded-2xl shadow-hard-sm hover:shadow-hard flex items-center justify-center gap-3 text-base transition-all group"
            >
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Get Notified On Launch</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* FOOTER & VIP ACCESS PASSCODE LINK */}
      <footer className="relative z-10 text-center flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-[#FBF5EC]/50 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#65AB84]" />
          <span>Launch Date: August 9, 2026 at 10:00 AM IST</span>
        </div>

        <button
          onClick={() => setShowPasscodeModal(true)}
          className="text-xs text-[#C49A62]/80 hover:text-[#C49A62] underline underline-offset-4 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Team / VIP Preview Bypass</span>
        </button>
      </footer>

      {/* VIP / ADMIN PASSCODE MODAL */}
      <AnimatePresence>
        {showPasscodeModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1B242A] border-3 border-[#C49A62] p-6 sm:p-8 rounded-2xl max-w-sm w-full shadow-2xl relative"
            >
              <h3 className="text-xl font-black text-[#FBF5EC] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#C49A62]" />
                <span>VIP Preview Access</span>
              </h3>
              <p className="text-xs text-[#FBF5EC]/70 mt-1">
                Enter your team key to preview the full website before August 9th 10:00 AM.
              </p>

              <form onSubmit={handlePasscodeSubmit} className="mt-4 flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="Enter passcode (e.g. swaply)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141C21] border border-[#C49A62]/40 rounded-xl text-[#FBF5EC] placeholder:text-[#FBF5EC]/40 focus:outline-none focus:border-[#C49A62] text-sm font-mono"
                  autoFocus
                />
                {passcodeError && (
                  <p className="text-xs text-[#D96B52] font-semibold">Incorrect passcode. Try 'swaply'</p>
                )}
                
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasscodeModal(false)}
                    className="px-4 py-2 text-xs font-bold text-[#FBF5EC]/60 hover:text-[#FBF5EC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#C49A62] text-[#1B242A] font-extrabold text-xs rounded-xl hover:bg-[#d6aa70] shadow-sm"
                  >
                    Unlock Preview
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
