import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Radio, Shield, Zap } from 'lucide-react';

export default function WhatIsSwaply() {
  const cards = [
    {
      title: "CONNECT",
      subtitle: "Direct 1-on-1 Peer-to-Peer Engine",
      desc: "Built on WebRTC protocols for instant, zero-friction 1-on-1 video rooms without intermediary server delays.",
      badgeColor: "bg-[#C49A62] text-white",
      badge: "P2P Stream",
      illustration: (
        <svg viewBox="0 0 160 120" className="w-full h-28" fill="none">
          <rect x="20" y="90" width="120" height="8" rx="4" fill="#1B242A" opacity="0.8"/>
          <rect x="45" y="55" width="70" height="40" rx="8" fill="#F7EFE5" stroke="#1B242A" strokeWidth="2.5"/>
          <path d="M55 70 L105 70 M55 80 L90 80" stroke="#C49A62" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="80" cy="30" r="14" fill="#C49A62" stroke="#1B242A" strokeWidth="2"/>
          <path d="M80 10 L80 4 M60 20 L55 15 M100 20 L105 15" stroke="#1B242A" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      title: "STRESS TEST",
      subtitle: "Help Evaluate Audio & Video Performance",
      desc: "Test 12ms low latency, 60fps HD camera rendering, and noise-cancelling 48kHz audio streams across browsers.",
      badgeColor: "bg-[#65AB84] text-white",
      badge: "Performance",
      illustration: (
        <svg viewBox="0 0 160 120" className="w-full h-28" fill="none">
          <circle cx="70" cy="50" r="32" fill="#FBF5EC" stroke="#1B242A" strokeWidth="3"/>
          <line x1="94" y1="74" x2="130" y2="105" stroke="#1B242A" strokeWidth="8" strokeLinecap="round"/>
          <circle cx="70" cy="42" r="10" fill="#D96B52" stroke="#1B242A" strokeWidth="2"/>
          <path d="M54 62 C54 52 86 52 86 62" stroke="#1B242A" strokeWidth="2.5" fill="#65AB84"/>
        </svg>
      )
    },
    {
      title: "EARLY ACCESS",
      subtitle: "Exclusive Early Supporter Perks",
      desc: "Private beta members receive lifetime early-access privileges, feature preview passes, and founder tester badges.",
      badgeColor: "bg-[#1B242A] text-white",
      badge: "Beta Pass",
      illustration: (
        <svg viewBox="0 0 160 120" className="w-full h-28" fill="none">
          <circle cx="80" cy="60" r="38" fill="#FBF5EC" stroke="#1B242A" strokeWidth="2.5" strokeDasharray="6 6"/>
          <path d="M50 45 C65 30 95 30 110 45" stroke="#D96B52" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <path d="M102 38 L114 46 L104 56" fill="#D96B52" stroke="#1B242A" strokeWidth="1.5"/>
          <path d="M110 75 C95 90 65 90 50 75" stroke="#65AB84" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <path d="M58 82 L46 74 L56 64" fill="#65AB84" stroke="#1B242A" strokeWidth="1.5"/>
          <circle cx="80" cy="60" r="14" fill="#C49A62" stroke="#1B242A" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  return (
    <section id="what-is-swaply" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 bg-[#65AB84]/15 border border-[#65AB84]/40 text-[#1B242A] px-3.5 py-1 rounded-full text-xs font-bold mb-4 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#65AB84]" /> Private Beta Architecture
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-[#1B242A] tracking-tight leading-tight font-serif">
          Built For Ultra-Fast <span className="underline decoration-[#C49A62] underline-offset-8 decoration-2">1-on-1 Video Connections.</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg font-medium text-[#1B242A]/75">
          Evaluating next-generation peer-to-peer real-time communication performance.
        </p>
      </div>

      {/* THREE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            whileHover={{ y: -6 }}
            className="bg-white border border-[#1B242A]/12 rounded-3xl p-7 shadow-[0_12px_40px_rgba(27,36,42,0.06)] flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_50px_rgba(27,36,42,0.12)]"
          >
            {/* CARD TOP BADGE */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${card.badgeColor}`}>
                0{idx + 1} • {card.title}
              </span>
              <span className="font-handwriting text-lg font-bold text-[#D96B52]">
                {card.badge}
              </span>
            </div>

            {/* CARD ILLUSTRATION */}
            <div className="my-2 bg-[#FBF5EC] border border-[#1B242A]/10 rounded-2xl p-4 flex items-center justify-center">
              {card.illustration}
            </div>

            {/* TITLE & DESC */}
            <div className="mt-4">
              <h3 className="text-xl font-bold text-[#1B242A] tracking-tight font-serif">
                {card.subtitle}
              </h3>
              <p className="mt-2 text-sm font-medium text-[#1B242A]/75 leading-relaxed">
                {card.desc}
              </p>
            </div>

            {/* FOOTER DECORATION */}
            <div className="mt-6 pt-4 border-t border-[#1B242A]/10 flex items-center justify-between text-xs font-bold text-[#1B242A]/60">
              <span>P2P Protocol</span>
              <Star className="w-4 h-4 text-[#C49A62] fill-[#C49A62]" />
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}
