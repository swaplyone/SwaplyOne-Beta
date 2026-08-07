import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Heart, Shield, Radio, CheckCircle2, MessageSquare, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Lanyard from '../components/Lanyard/Lanyard';
import { generateFullCardAtlasAsync, generateLanyardBandTexture } from '../utils/lanyardTextures';

export default function FounderPage({ onOpenJoinModal }) {
  const navigate = useNavigate();
  const [cardAtlasImage, setCardAtlasImage] = useState(null);

  // Load custom full card texture atlas async (Front Photo + Back Swaply Logo)
  useEffect(() => {
    let isMounted = true;

    generateFullCardAtlasAsync({
      name: 'swaplyone',
      title: 'FOUNDER & CREATOR',
      photoSrc: '/PHOTO-2026-06-30-10-57-17.jpg',
      logoSrc: '/swaply-logo.jpeg'
    }).then((atlasTex) => {
      if (isMounted && atlasTex) setCardAtlasImage(atlasTex);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const lanyardBandImage = useMemo(() => generateLanyardBandTexture({
    text: 'swaplyone'
  }), []);

  return (
    <div className="pt-36 sm:pt-44 lg:pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left overflow-hidden">
      
      {/* 1. BACK BUTTON */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="neo-btn bg-paper-cream hover:bg-swaply-yellow/30 text-swaply-black border-2 border-swaply-black px-4 py-2 rounded-xl text-xs font-bold shadow-hard-sm flex items-center gap-2 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </button>
      </div>

      {/* 2. TOP ANNOUNCEMENT BADGE */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 bg-swaply-yellow border-3 border-swaply-black px-4 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-hard-sm mb-6"
      >
        <Sparkles className="w-4 h-4 text-swaply-black fill-swaply-black" />
        <span>MEET THE FOUNDER • BEHIND THE VISION</span>
      </motion.div>

      {/* 3. HEADLINE */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-6xl font-black text-swaply-black tracking-tight leading-[1.08]"
      >
        Building The Future of<br />
        <span className="inline-block mt-2 bg-swaply-coral text-white border-3 border-swaply-black px-5 py-1.5 rounded-2xl shadow-hard-lg rotate-[-1deg]">
          1-on-1 Real-Time Connections.
        </span>
      </motion.h1>

      {/* 4. INTERACTIVE 3D PHYSICS LANYARD BADGE DISPLAY */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-10 mb-10 bg-paper-card border-3 border-swaply-black rounded-3xl p-4 sm:p-6 shadow-hard-xl relative overflow-hidden bg-paper-grid text-center"
      >
        <div className="flex items-center justify-between pb-3 px-3 border-b-2 border-swaply-black/15 text-xs font-black text-swaply-black">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-swaply-coral animate-ping" />
            3D Founder Pass: swaplyone (Drag & Flip Badge Below)
          </span>
          <span className="bg-swaply-yellow border border-swaply-black px-2.5 py-0.5 rounded-full text-[10px]">
            Interactive Physics
          </span>
        </div>

        {/* 3D LANYARD CANVAS */}
        <Lanyard
          position={[0, 0, 14]}
          gravity={[0, -40, 0]}
          frontImage={cardAtlasImage}
          lanyardImage={lanyardBandImage}
          lanyardWidth={1.8}
        />

        <p className="font-handwriting text-lg text-swaply-coral font-bold -mt-2 pb-2">
          "Click and drag the swaplyone lanyard card to swing & flip it!"
        </p>
      </motion.div>

      {/* 5. FOUNDER PROFILE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 bg-paper-card border-3 border-swaply-black rounded-3xl p-6 sm:p-10 shadow-hard-xl bg-paper-grid relative space-y-6"
      >
        {/* FOUNDER AVATAR HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b-2 border-swaply-black/15">
          <img
            src="/PHOTO-2026-06-30-10-57-17.jpg"
            alt="swaplyone"
            className="w-20 h-20 rounded-2xl object-cover border-3 border-swaply-black shadow-hard shrink-0 rotate-[-2deg]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-swaply-black">swaplyone</h2>
              <span className="bg-swaply-mint text-swaply-black border border-swaply-black px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                Creator & Founder
              </span>
            </div>
            <p className="text-sm font-bold text-swaply-black/70 mt-1">
              Designing next-generation WebRTC peer-to-peer real-time communication platforms.
            </p>
          </div>
        </div>

        {/* FOUNDER MISSION STORY */}
        <div className="space-y-4 text-base font-medium text-swaply-black/85 leading-relaxed">
          <p>
            "We started Swaply with a simple conviction: <strong className="font-black text-swaply-black">real human connection should be effortless, direct, and zero-friction.</strong>"
          </p>
          <p>
            In a digital world full of passive feeds and algorithms, we are crafting a platform that brings people together 1-on-1 through ultra-fast, low-latency video communication.
          </p>
          <p>
            We are currently testing our core WebRTC stream engine with early beta testers. By building directly with our early community, we ensure every detail — from video rendering to crystal clear audio — is built to perfection.
          </p>
        </div>

        {/* FOUNDER PILLARS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-paper-cream border-2 border-swaply-black rounded-2xl p-4 shadow-hard-sm space-y-1">
            <span className="text-xs font-black uppercase text-swaply-coral flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" /> 1-on-1 P2P Core
            </span>
            <h4 className="font-extrabold text-sm text-swaply-black">Direct Stream</h4>
            <p className="text-xs font-bold text-swaply-black/60">Zero intermediary server friction.</p>
          </div>

          <div className="bg-paper-cream border-2 border-swaply-black rounded-2xl p-4 shadow-hard-sm space-y-1">
            <span className="text-xs font-black uppercase text-swaply-mint flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Privacy First
            </span>
            <h4 className="font-extrabold text-sm text-swaply-black">E2E Encrypted</h4>
            <p className="text-xs font-bold text-swaply-black/60">Peer-to-peer encrypted rooms.</p>
          </div>

          <div className="bg-paper-cream border-2 border-swaply-black rounded-2xl p-4 shadow-hard-sm space-y-1">
            <span className="text-xs font-black uppercase text-swaply-yellow flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-swaply-yellow" /> Community Driven
            </span>
            <h4 className="font-extrabold text-sm text-swaply-black">Built with Testers</h4>
            <p className="text-xs font-bold text-swaply-black/60">Evolving directly from beta feedback.</p>
          </div>
        </div>

      </motion.div>

      {/* 6. CTA CALLOUT */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-10 bg-swaply-black text-white border-3 border-swaply-black rounded-3xl p-8 text-center shadow-hard-xl space-y-4"
      >
        <h3 className="text-2xl sm:text-3xl font-black text-white">
          Want To Test The Platform With swaplyone?
        </h3>
        <p className="text-sm font-bold text-white/80 max-w-xl mx-auto">
          Claim an early access beta tester pass today and help shape the future of real-time peer connections.
        </p>

        <div className="pt-2">
          <button
            onClick={onOpenJoinModal}
            className="bg-swaply-yellow hover:bg-swaply-craft text-swaply-black border-2 border-white px-8 py-3.5 rounded-2xl text-base font-black shadow-lg transition-transform hover:scale-105 cursor-pointer"
          >
            Join Founder's Private Beta 🚀
          </button>
        </div>
      </motion.div>

    </div>
  );
}
