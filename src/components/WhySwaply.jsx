import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Sparkles, Plus, Check, RefreshCw, Heart } from 'lucide-react';

export default function WhySwaply() {
  const [userKnows, setUserKnows] = useState(['React Frontend', 'Guitar Chords', 'Spanish Basics']);
  const [userWants, setUserWants] = useState(['UI UX Figma', 'Portrait Photography', 'Python AI']);
  const [matched, setMatched] = useState(false);

  const availableKnowSkills = ['Acoustic Guitar', 'React Code', 'Public Speaking', 'Digital Marketing', 'Video Editing', 'German'];
  const availableWantSkills = ['UX Figma', 'Photography', 'Python AI', 'Creative Writing', 'Cooking Sourdough', 'Italian'];

  const handleAddKnow = (skill) => {
    if (!userKnows.includes(skill)) {
      setUserKnows([...userKnows, skill]);
    }
  };

  const handleAddWant = (skill) => {
    if (!userWants.includes(skill)) {
      setUserWants([...userWants, skill]);
    }
  };

  const triggerMatchSimulation = () => {
    setMatched(true);
    setTimeout(() => setMatched(false), 4000);
  };

  return (
    <section id="why-swaply" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 bg-swaply-coral text-white border-2 border-swaply-black px-3 py-1 rounded-full text-xs font-black shadow-hard-sm mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Why Swaply?
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-swaply-black tracking-tight leading-snug">
          "Because Everyone Knows Something <span className="bg-swaply-yellow border-2 border-swaply-black px-2 py-0.5 rounded-xl shadow-hard-sm">Someone Else Wants To Learn."</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg font-bold text-swaply-black/70">
          Try the live skill swapper below! Select what you know and what you want to learn to simulate a match.
        </p>
      </div>

      {/* INTERACTIVE SPLIT-SCREEN VISUAL SWAPPER */}
      <div className="neo-card rounded-3xl p-6 sm:p-10 bg-paper-cream relative overflow-hidden bg-paper-grid">
        
        {/* MATCH SIMULATION ANIMATED OVERLAY */}
        <AnimatePresence>
          {matched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-swaply-yellow/95 border-3 border-swaply-black z-30 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-16 h-16 bg-swaply-coral border-3 border-swaply-black rounded-full flex items-center justify-center text-white text-3xl mb-3 shadow-hard">
                🤝
              </div>
              <h3 className="text-3xl font-black text-swaply-black">IT'S A MATCH!</h3>
              <p className="mt-2 text-base font-extrabold text-swaply-black max-w-md">
                Alex teaches <span className="bg-white border border-swaply-black px-2 py-0.5 rounded-md">{userKnows[0] || 'React'}</span> to Maya, and Maya teaches <span className="bg-white border border-swaply-black px-2 py-0.5 rounded-md">{userWants[0] || 'Figma'}</span> to Alex!
              </p>
              <button
                onClick={() => setMatched(false)}
                className="mt-6 neo-btn bg-swaply-black text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-hard-sm"
              >
                Reset Matcher
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          
          {/* LEFT SIDE: WHAT I KNOW */}
          <div className="bg-paper-card border-3 border-swaply-black rounded-2xl p-6 shadow-hard relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-swaply-black/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-swaply-yellow border border-swaply-black" />
                <h3 className="font-extrabold text-lg text-swaply-black">What I Know</h3>
              </div>
              <span className="text-xs font-bold text-swaply-black/60 font-handwriting text-base">
                Your Superpowers ⚡
              </span>
            </div>

            <div className="space-y-2 min-h-[140px]">
              {userKnows.map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-swaply-yellow border-2 border-swaply-black px-3 py-2 rounded-xl text-xs font-black shadow-hard-sm flex items-center justify-between"
                >
                  <span>{skill}</span>
                  <Check className="w-4 h-4 text-swaply-black" />
                </motion.div>
              ))}
            </div>

            {/* QUICK ADD STICKERS */}
            <div className="mt-4 pt-3 border-t-2 border-swaply-black/10">
              <span className="text-[11px] font-black text-swaply-black/60 uppercase block mb-2">Tap to add skill:</span>
              <div className="flex flex-wrap gap-1.5">
                {availableKnowSkills.map(s => (
                  <button
                    key={s}
                    onClick={() => handleAddKnow(s)}
                    className="bg-paper-cream hover:bg-swaply-yellow border border-swaply-black px-2 py-1 rounded-lg text-[11px] font-bold"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER ANIMATED EXCHANGE ARROW INDICATOR */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center">
            <button
              onClick={triggerMatchSimulation}
              className="w-14 h-14 bg-swaply-coral text-white border-3 border-swaply-black rounded-full shadow-hard-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              title="Test Skill Match"
            >
              <ArrowRightLeft className="w-6 h-6 animate-pulse" />
            </button>
            <span className="font-handwriting text-sm font-bold text-swaply-black bg-swaply-yellow border border-swaply-black px-2 py-0.5 rounded-full mt-2 shadow-hard-sm rotate-[-2deg]">
              Click to Swap!
            </span>
          </div>

          {/* RIGHT SIDE: WHAT I WANT TO LEARN */}
          <div className="bg-paper-card border-3 border-swaply-black rounded-2xl p-6 shadow-hard relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-swaply-black/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-swaply-mint border border-swaply-black" />
                <h3 className="font-extrabold text-lg text-swaply-black">What I Want To Learn</h3>
              </div>
              <span className="text-xs font-bold text-swaply-black/60 font-handwriting text-base">
                Your Goals 🎯
              </span>
            </div>

            <div className="space-y-2 min-h-[140px]">
              {userWants.map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-swaply-mint border-2 border-swaply-black px-3 py-2 rounded-xl text-xs font-black shadow-hard-sm flex items-center justify-between"
                >
                  <span>{skill}</span>
                  <Check className="w-4 h-4 text-swaply-black" />
                </motion.div>
              ))}
            </div>

            {/* QUICK ADD STICKERS */}
            <div className="mt-4 pt-3 border-t-2 border-swaply-black/10">
              <span className="text-[11px] font-black text-swaply-black/60 uppercase block mb-2">Tap to add goal:</span>
              <div className="flex flex-wrap gap-1.5">
                {availableWantSkills.map(s => (
                  <button
                    key={s}
                    onClick={() => handleAddWant(s)}
                    className="bg-paper-cream hover:bg-swaply-mint border border-swaply-black px-2 py-1 rounded-lg text-[11px] font-bold"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
