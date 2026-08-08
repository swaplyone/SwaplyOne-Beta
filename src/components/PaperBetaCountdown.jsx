import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import SwaplyLogo from './SwaplyLogo';
import { getTimeRemaining } from '../config/launchConfig';

/**
 * Concentric Real-Time Rotating Paper Ring Component
 * Rotates in real-time to align the active remaining value (Hours, Minutes, Seconds) to the top 12 o'clock indicator!
 */
function RealTimeRotatingPaperRing({ diameterPercent, radiusOffsetPx, maxCount, activeValue, label, depthZ = 0 }) {
  // Generate 12 evenly spaced numbers around circumference
  const totalSlots = 12;
  const step = Math.max(1, Math.floor(maxCount / totalSlots));
  const numbers = [];
  for (let i = 0; i < maxCount; i += step) {
    numbers.push(i);
  }

  // Calculate exact rotation angle so activeValue aligns to top 12 o'clock position (0 deg)
  const targetRotation = -((activeValue / maxCount) * 360);

  return (
    <motion.div
      style={{
        width: `${diameterPercent}%`,
        height: `${diameterPercent}%`,
        transformStyle: 'preserve-3d',
        translateZ: depthZ
      }}
      animate={{ rotate: targetRotation }}
      transition={{ type: "spring", stiffness: 110, damping: 15 }}
      className="absolute rounded-full border-2 border-[#1A2228] shadow-[0_15px_35px_rgba(26,34,40,0.14)] bg-[#F4EDE2] flex items-center justify-center select-none pointer-events-none"
    >
      {/* PAPER GRAIN */}
      <div 
        className="absolute inset-0 rounded-full opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#1A2228 1px, transparent 1px)', backgroundSize: '8px 8px' }}
      />

      {/* DASHED KINETIC GEAR TICK NOTCHES */}
      <div className="absolute inset-1 rounded-full border border-dashed border-[#1A2228]/30 pointer-events-none" />

      {/* RING LABEL STENCIL */}
      <div className="absolute bottom-1.5 font-mono text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#C49A62] bg-[#FAF5EE] px-2 py-0.5 rounded-full border border-[#1A2228]/25 shadow-sm z-20">
        {label}
      </div>

      {/* PRINTED NUMBERS ATTACHED DIRECTLY TO ROTATING RING */}
      {numbers.map((num, idx) => {
        const angleDeg = (idx / numbers.length) * 360;
        const isActive = Math.abs(num - activeValue) < (step / 2);
        return (
          <div
            key={num}
            className="absolute font-mono text-center flex flex-col items-center justify-center"
            style={{
              top: '50%',
              left: '50%',
              width: '28px',
              height: '20px',
              margin: '-10px 0 0 -14px',
              transform: `rotate(${angleDeg}deg) translateY(-${radiusOffsetPx}px)`
            }}
          >
            <span className={`font-black text-xs sm:text-sm tracking-tighter ${isActive ? 'text-[#D96B52] scale-125 font-extrabold drop-shadow' : 'text-[#1A2228]/60'}`}>
              {String(num).padStart(2, '0')}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}

export default function PaperBetaCountdown({ onOpenJoinModal, onUnlockSuccess, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());
  const [isStamped, setIsStamped] = useState(false);

  // Hidden Flap Lift States
  const [liftedFlap, setLiftedFlap] = useState(null);

  // 3D Mouse Parallax Tilt State
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const rotX = ((clientY / innerHeight) - 0.5) * -12; // -6deg to +6deg
    const rotY = ((clientX / innerWidth) - 0.5) * 12;   // -6deg to +6deg
    setTilt({ rotateX: rotX, rotateY: rotY });
  };

  const handleUnlock = () => {
    if (onUnlockSuccess) onUnlockSuccess();
    if (onComplete) onComplete();
  };

  // Real-time tick interval updating countdown values every second
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeLeft(remaining);

      if (remaining.isComplete && !isStamped) {
        clearInterval(timer);
        setIsStamped(true);
        setTimeout(() => {
          handleUnlock();
        }, 2200);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isStamped]);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#F7F2EA] text-[#1A2228] flex flex-col justify-between items-center relative overflow-hidden font-sans p-4 sm:p-8 select-none"
    >
      {/* REALISTIC FINE PAPER FIBERS & NOISE TEXTURE */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#1A2228 0.75px, transparent 0.75px)', backgroundSize: '22px 22px' }}
      />
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1A2228 0, #1A2228 1px, transparent 0, transparent 40px)' }}
      />

      {/* CLEAN TOP HEADER BAR */}
      <header className="relative z-10 w-full max-w-5xl flex justify-between items-center text-[10px] sm:text-xs font-mono text-[#1A2228]/70 tracking-widest pt-2">
        <div className="flex items-center gap-2 font-black">
          <span>⊕</span>
          <span>SWAPLYONE</span>
        </div>
        <div className="flex items-center gap-2 font-black">
          <span>AUGUST 09 — 10:00 AM IST</span>
          <span>⊕</span>
        </div>
      </header>

      {/* MAIN KINETIC CONCENTRIC PAPER CLOCK WITH CLEAR PROPORTIONED RINGS & DISC */}
      <div 
        className="relative my-auto flex items-center justify-center pt-4"
        style={{ perspective: '1200px' }}
      >
        <motion.div
          style={{
            rotateX: tilt.rotateX,
            rotateY: tilt.rotateY,
            transformStyle: 'preserve-3d'
          }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          className="relative w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] md:w-[600px] md:h-[600px] flex items-center justify-center"
        >
          {/* TOP 12 O'CLOCK PHYSICAL PAPER INDICATOR ARROW */}
          <div className="absolute -top-6 z-40 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[14px] border-t-[#D96B52] drop-shadow-md" />
            <span className="font-mono text-[9px] font-black text-[#D96B52] uppercase tracking-widest mt-1">
              ▲ CURRENT TIME
            </span>
          </div>

          {/* RING 1 (OUTERMOST PAPER RING - HOURS) */}
          <RealTimeRotatingPaperRing 
            diameterPercent={98}
            radiusOffsetPx={136}
            maxCount={24}
            activeValue={timeLeft.hours}
            label="HOURS"
            depthZ={15}
          />

          {/* RING 2 (MIDDLE PAPER RING - MINUTES) */}
          <RealTimeRotatingPaperRing 
            diameterPercent={76}
            radiusOffsetPx={104}
            maxCount={60}
            activeValue={timeLeft.minutes}
            label="MINUTES"
            depthZ={35}
          />

          {/* RING 3 (INNERMOST PAPER RING - SECONDS) */}
          <RealTimeRotatingPaperRing 
            diameterPercent={56}
            radiusOffsetPx={76}
            maxCount={60}
            activeValue={timeLeft.seconds}
            label="SECONDS"
            depthZ={55}
          />

          {/* CLEAN PROPORTIONED CENTER PAPER DISC (NO OVERLAPPING TEXT) */}
          <motion.div 
            style={{ transformStyle: 'preserve-3d', translateZ: 70 }}
            className="absolute w-[130px] h-[130px] sm:w-[170px] sm:h-[170px] md:w-[190px] md:h-[190px] rounded-full bg-[#FAF5EE] border-3 border-[#1A2228] shadow-hard-lg flex flex-col items-center justify-center p-3 sm:p-5 text-center z-30 overflow-hidden"
          >
            {/* PAPER DISC GRAIN */}
            <div 
              className="absolute inset-0 rounded-full opacity-[0.08] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#1A2228 1px, transparent 1px)', backgroundSize: '10px 10px' }}
            />

            {/* LOGO */}
            <SwaplyLogo className="w-6 h-6 sm:w-7 sm:h-7 text-[#1A2228] mb-0.5" />

            <span className="font-mono text-[8px] sm:text-[9px] font-black tracking-widest text-[#C49A62] uppercase mb-1">
              THE NEXT CHAPTER
            </span>

            {/* PRINTED DATE */}
            <div className="leading-none font-mono mb-1">
              <span className="block font-black text-xl sm:text-3xl text-[#1A2228] tracking-tighter">
                09 AUG
              </span>
              <span className="block font-black text-[10px] sm:text-xs text-[#C49A62] tracking-wider mt-1">
                10:00 AM IST
              </span>
            </div>

            {/* SURPRISE INTERACTIVE HIDDEN PAPER FLAP */}
            <div 
              onMouseEnter={() => setLiftedFlap('FIRST 150')}
              onMouseLeave={() => setLiftedFlap(null)}
              className="mt-1 cursor-pointer z-40"
            >
              <div className="bg-[#EFE7DC] border border-[#1A2228]/40 px-2 py-0.5 rounded-full font-mono text-[7px] sm:text-[8px] font-bold text-[#1A2228] shadow-sm hover:rotate-2 transition-transform">
                {liftedFlap === 'FIRST 150' ? '✨ FIRST 150' : 'peek ▾'}
              </div>
            </div>
          </motion.div>

          {/* MECHANICAL IRIS OPENING TRANSITION AT ZERO COUNTDOWN */}
          <AnimatePresence>
            {isStamped && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.6, opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute inset-0 rounded-full bg-[#FAF5EE] border-8 border-dashed border-[#D96B52] z-50 flex flex-col items-center justify-center p-8 text-center shadow-2xl"
              >
                <div className="font-mono font-black text-4xl sm:text-6xl text-[#1A2228] uppercase tracking-widest mb-2">
                  WE'RE OPEN.
                </div>
                <div className="border-4 border-dashed border-[#D96B52] px-6 py-3 rounded-sm transform -rotate-12 bg-[#F7F2EA] shadow-xl">
                  <span className="font-black text-4xl sm:text-6xl text-[#D96B52] uppercase tracking-widest block font-mono">
                    OPEN
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* DIGITAL COUNTDOWN READOUT & FOOTER BAR */}
      <footer className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 pt-4">
        {onOpenJoinModal ? (
          <button
            onClick={onOpenJoinModal}
            className="px-6 py-2.5 bg-[#1A2228] hover:bg-[#28353D] text-[#FAF5EE] font-black rounded-sm shadow-hard-sm hover:shadow-hard transition-all flex items-center gap-2 text-xs uppercase tracking-wider font-mono"
          >
            <Bell className="w-4 h-4 text-[#C49A62]" />
            <span>Get Notified On Launch</span>
          </button>
        ) : <div />}

        {/* COMPACT DIGITAL READOUT (HOURS : MINUTES : SECONDS) */}
        <div className="font-mono text-xs font-black text-[#1A2228] uppercase tracking-wider bg-[#FFFDF8] border border-[#1A2228]/30 px-4 py-1.5 shadow-sm">
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono text-[#1A2228]/60 tracking-widest">
          <span>© SWAPLYONE 2026</span>
          <span>AUGUST 09 10:00 AM IST</span>
        </div>
      </footer>
    </div>
  );
}
