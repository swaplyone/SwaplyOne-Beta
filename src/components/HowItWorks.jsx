import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Search, MessageSquare, Repeat, ArrowRight, CheckCircle2, Sparkles, Star } from 'lucide-react';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Tell the community what you know and what you want to learn.",
      icon: User,
      color: "bg-swaply-yellow",
      preview: {
        heading: "Alex's Swaply Card",
        teaches: ["React Frontend", "Acoustic Guitar", "Product Strategy"],
        wantsToLearn: ["Spanish Conversation", "Portrait Photography"],
        status: "Active Skill Swapper"
      }
    },
    {
      number: "02",
      title: "Discover People",
      description: "Find people with complementary skills nearby or around the world.",
      icon: Search,
      color: "bg-swaply-mint",
      preview: {
        heading: "Perfect Match Found! 🎉",
        matchName: "Maya Lin • UX Designer",
        teaches: ["Portrait Photography", "Figma UI"],
        wantsToLearn: ["React Frontend"],
        compatibility: "98% Skill Match"
      }
    },
    {
      number: "03",
      title: "Connect",
      description: "Start a conversation and find a comfortable schedule to meet online or offline.",
      icon: MessageSquare,
      color: "bg-swaply-coral",
      preview: {
        heading: "Swaply Chat Preview",
        message1: "Hi Maya! I saw you teach Photography and want to learn React!",
        message2: "Hey Alex! Perfect, let's do 45 mins of coding for 45 mins of photo critique!",
        scheduled: "Next Swap: Thursday at 6 PM"
      }
    },
    {
      number: "04",
      title: "Exchange Skills",
      description: "Teach something. Learn something. Grow together.",
      icon: Repeat,
      color: "bg-swaply-purple/30",
      preview: {
        heading: "Live 1-on-1 Swap Session",
        sessionName: "React ↔ Photography Swap",
        duration: "60 mins completed",
        badge: "Both Gained +50 Skill Karma!"
      }
    }
  ];

  return (
    <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 bg-swaply-yellow border-2 border-swaply-black px-3 py-1 rounded-full text-xs font-black shadow-hard-sm mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Simple 4-Step Process
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-swaply-black tracking-tight">
          How Swaply <span className="relative inline-block bg-swaply-mint px-2 py-0.5 rounded-lg border-2 border-swaply-black rotate-[-1deg]">Works</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg font-bold text-swaply-black/70">
          Four simple steps from opening the app to your very first skill exchange session.
        </p>
      </div>

      {/* STEP NAVIGATION BUTTONS WITH HAND-DRAWN CONNECTING ARROWS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === idx;
          return (
            <motion.button
              key={step.number}
              onClick={() => setActiveStep(idx)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-5 rounded-2xl border-3 border-swaply-black text-left transition-all relative ${
                isActive
                  ? `${step.color} shadow-hard-lg translate-y-[-4px]`
                  : 'bg-paper-card shadow-hard hover:bg-paper-cream'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-extrabold text-xs bg-swaply-black text-white px-2.5 py-0.5 rounded-full">
                  Step {step.number}
                </span>
                <div className={`w-8 h-8 rounded-xl border-2 border-swaply-black flex items-center justify-center ${step.color}`}>
                  <Icon className="w-4 h-4 text-swaply-black" />
                </div>
              </div>

              <h3 className="text-lg font-black text-swaply-black">
                {step.title}
              </h3>
              <p className="mt-1 text-xs font-bold text-swaply-black/70 line-clamp-2">
                {step.description}
              </p>

              {/* HAND-DRAWN CONNECTOR ARROW (Desktop only) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12 H18 M14 6 L20 12 L14 18" stroke="#121212" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* INTERACTIVE STEP PREVIEW DISPLAY BOARD */}
      <div className="neo-card rounded-3xl p-6 sm:p-8 bg-paper-cream relative overflow-hidden bg-paper-dots">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* LEFT: STEP EXPLANATION & CHARACTERS */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="inline-flex items-center gap-2 bg-swaply-black text-white px-3 py-1 rounded-full text-xs font-black">
              Step {steps[activeStep].number} Detail
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-black text-swaply-black">
              {steps[activeStep].title}
            </h3>
            
            <p className="text-base sm:text-lg font-bold text-swaply-black/80 leading-relaxed">
              {steps[activeStep].description}
            </p>

            {/* MINI HAND-DRAWN CHARACTER RE-APPEARANCE */}
            <div className="pt-4 flex items-center gap-4">
              <div className="bg-swaply-yellow border-2 border-swaply-black p-2 rounded-2xl rotate-[-3deg] shadow-hard-sm flex items-center gap-2 text-xs font-bold">
                <div className="w-6 h-6 rounded-full bg-swaply-coral border border-swaply-black flex items-center justify-center font-black text-[10px]">
                  A
                </div>
                <span>Alex is setting up teaching slots!</span>
              </div>
              <div className="bg-swaply-mint border-2 border-swaply-black p-2 rounded-2xl rotate-[2deg] shadow-hard-sm flex items-center gap-2 text-xs font-bold">
                <div className="w-6 h-6 rounded-full bg-swaply-purple border border-swaply-black flex items-center justify-center font-black text-[10px] text-white">
                  M
                </div>
                <span>Maya found Alex's React slot!</span>
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE SIMULATED UI CARD */}
          <div className="w-full lg:w-1/2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-paper-card border-3 border-swaply-black rounded-2xl p-6 shadow-hard-lg relative"
              >
                {/* PREVIEW TOP BAR */}
                <div className="flex items-center justify-between border-b-2 border-swaply-black/10 pb-3 mb-4">
                  <span className="font-extrabold text-sm text-swaply-black flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-swaply-coral border border-swaply-black" />
                    {steps[activeStep].preview.heading}
                  </span>
                  <span className="bg-swaply-yellow border border-swaply-black px-2 py-0.5 text-[10px] font-black rounded-full">
                    LIVE PREVIEW
                  </span>
                </div>

                {/* DYNAMIC CONTENT PER STEP */}
                {activeStep === 0 && (
                  <div className="space-y-3 text-xs font-extrabold">
                    <div className="bg-paper-dark p-3 rounded-xl border border-swaply-black">
                      <span className="text-swaply-black/60 block text-[10px] uppercase">I Can Teach:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {steps[0].preview.teaches.map(t => (
                          <span key={t} className="bg-swaply-yellow border border-swaply-black px-2 py-0.5 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-paper-dark p-3 rounded-xl border border-swaply-black">
                      <span className="text-swaply-black/60 block text-[10px] uppercase">I Want To Learn:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {steps[0].preview.wantsToLearn.map(l => (
                          <span key={l} className="bg-swaply-mint border border-swaply-black px-2 py-0.5 rounded-md">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-3">
                    <div className="bg-swaply-mint/20 border-2 border-swaply-black p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-sm text-swaply-black">{steps[1].preview.matchName}</h4>
                        <p className="text-xs font-bold text-swaply-black/70">Teaches: {steps[1].preview.teaches.join(', ')}</p>
                      </div>
                      <span className="bg-swaply-coral text-white border border-swaply-black px-2.5 py-1 rounded-full text-xs font-black">
                        {steps[1].preview.compatibility}
                      </span>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-2 text-xs font-bold">
                    <div className="bg-paper-dark border border-swaply-black p-2.5 rounded-xl max-w-[85%]">
                      {steps[2].preview.message1}
                    </div>
                    <div className="bg-swaply-yellow border border-swaply-black p-2.5 rounded-xl max-w-[85%] ml-auto text-right">
                      {steps[2].preview.message2}
                    </div>
                    <div className="mt-2 text-center bg-swaply-mint border border-swaply-black p-1.5 rounded-lg text-[11px] font-black">
                      📅 {steps[2].preview.scheduled}
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="text-center py-3 space-y-3">
                    <div className="w-14 h-14 bg-swaply-yellow border-2 border-swaply-black rounded-full mx-auto flex items-center justify-center text-2xl animate-bounce">
                      🤝
                    </div>
                    <h4 className="font-black text-base text-swaply-black">{steps[3].preview.sessionName}</h4>
                    <span className="inline-block bg-swaply-purple/20 border border-swaply-black px-3 py-1 rounded-full text-xs font-extrabold">
                      {steps[3].preview.badge}
                    </span>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>

    </section>
  );
}
