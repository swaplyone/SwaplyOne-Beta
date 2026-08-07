import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Video, Users, Zap, CheckCircle2, Lock, Flame } from 'lucide-react';
import { useMorphBar } from '../context/MorphBarContext';

export default function HeroSection({ onOpenJoinModal }) {
  const navigate = useNavigate();
  const { showMorphBar } = useMorphBar();
  const [clicks, setClicks] = useState(0);
  const timerRef = useRef(null);

  // 3-Tap Secret Trigger on Early Tester Badge to access Admin Dashboard
  const handleBadgeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nextCount = clicks + 1;
    setClicks(nextCount);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (nextCount >= 3) {
      setClicks(0);
      showMorphBar({
        type: 'success',
        title: '🔑 Secret 3-Tap Unlocked!',
        message: 'Opening Admin Control Center...',
        duration: 3000
      });
      navigate('/admin');
    } else {
      showMorphBar({
        type: 'info',
        title: `Secret Tap (${nextCount}/3)`,
        message: `Tap ${3 - nextCount} more time${3 - nextCount === 1 ? '' : 's'} to open Admin Dashboard.`,
        duration: 1500
      });

      timerRef.current = setTimeout(() => {
        setClicks(0);
      }, 2000);
    }
  };

  return (
    <section id="hero" className="relative pt-24 sm:pt-28 lg:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center overflow-visible">
      
      {/* SUBTLE AMBIENT BACKGROUND GLOW */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-swaply-yellow/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. ULTRA-MINIMALIST PRIVATE BETA / EARLY TESTER PILL */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleBadgeClick}
        className="inline-flex items-center gap-2 bg-paper-card border border-swaply-black/20 px-4 py-1.5 rounded-full text-xs font-black shadow-sm mb-6 hover:border-swaply-black transition-all cursor-pointer select-none"
        title="Tap 3 times to unlock Admin Dashboard"
      >
        <span className="w-2 h-2 rounded-full bg-swaply-coral animate-ping" />
        <span className="uppercase tracking-wider text-swaply-black">PRIVATE BETA • EARLY TESTER</span>
        <Sparkles className="w-3.5 h-3.5 text-swaply-yellow fill-swaply-yellow ml-0.5" />
      </motion.div>

      {/* 2. STRIKING MYSTERIOUS HEADLINE */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-6xl lg:text-7xl font-black text-swaply-black tracking-tight leading-[1.08] max-w-3xl mx-auto"
      >
        The Next Generation of<br />
        <span className="inline-block mt-2 italic font-serif font-normal text-swaply-yellow underline decoration-swaply-black/20 underline-offset-8">
          1-on-1 Real-Time Video.
        </span>
      </motion.h1>

      {/* 3. CURIOSITY SUBTITLE */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 text-base sm:text-xl font-medium text-swaply-black/75 max-w-xl mx-auto leading-relaxed"
      >
        We are inviting a limited group of early testers to experience our new 1-on-1 real-time video call platform. Built for zero-friction peer connections.
      </motion.p>

      {/* 4. RE-DESIGNED LIVE SKILL SWAP & ENGINE SHOWCASE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mt-10 bg-white/95 backdrop-blur-md border-3 border-swaply-black rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(27,36,42,0.1)] max-w-2xl mx-auto relative overflow-hidden space-y-5 text-left"
      >
        {/* TOP STATUS BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-black text-swaply-black pb-3 border-b-2 border-dashed border-swaply-black/20">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE P2P VIDEO MATCH ENGINE
          </span>
          <span className="bg-swaply-yellow border border-swaply-black px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
            ⚡ &lt;35ms LATENCY
          </span>
        </div>

        {/* LIVE PEER MATCH DEMO */}
        <div className="bg-paper-cream border-2 border-swaply-black rounded-2xl p-4 sm:p-5 shadow-hard-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs font-black text-swaply-black/70">
            <span>ACTIVE 1-ON-1 SKILL EXCHANGE</span>
            <span className="text-emerald-700 flex items-center gap-1 font-extrabold text-xs">
              <Video className="w-3.5 h-3.5" /> HD Video Stream Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PEER 1 */}
            <div className="bg-white border-2 border-swaply-black p-3.5 rounded-xl flex items-center gap-3 shadow-hard-sm">
              <div className="w-10 h-10 rounded-full bg-swaply-coral text-white font-black flex items-center justify-center text-sm border border-swaply-black flex-shrink-0">
                AV
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-swaply-black block truncate">Alex Vance</span>
                <span className="text-[10px] font-bold text-swaply-black/60 block truncate">Offers: React & WebSockets</span>
              </div>
            </div>

            {/* PEER 2 */}
            <div className="bg-white border-2 border-swaply-black p-3.5 rounded-xl flex items-center gap-3 shadow-hard-sm">
              <div className="w-10 h-10 rounded-full bg-swaply-mint text-swaply-black font-black flex items-center justify-center text-sm border border-swaply-black flex-shrink-0">
                ER
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-swaply-black block truncate">Elena Rostova</span>
                <span className="text-[10px] font-bold text-swaply-black/60 block truncate">Offers: UI/UX & Design</span>
              </div>
            </div>
          </div>
        </div>

        {/* ENGINE HIGHLIGHTS BADGES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-black text-swaply-black/80 bg-paper-card border border-swaply-black/15 p-3 rounded-xl">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-swaply-coral flex-shrink-0" /> Encrypted WebRTC
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Zero Software Install
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-swaply-coral flex-shrink-0" /> Instant Matcher
          </span>
        </div>

        {/* ACTION BUTTONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 w-full">
          <button
            onClick={() => navigate('/login')}
            className="w-full neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-2 border-swaply-black h-12 rounded-xl text-xs sm:text-sm font-black shadow-hard flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Start Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/beta')}
            className="w-full neo-btn bg-swaply-yellow hover:bg-swaply-craft text-swaply-black border-2 border-swaply-black h-12 rounded-xl text-xs sm:text-sm font-black shadow-hard flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-swaply-coral" />
            <span>Apply for Beta Access Pass</span>
          </button>
        </div>
      </motion.div>

    </section>
  );
}
