import React from 'react';
import HeroSection from '../components/HeroSection';
import ScrollFrameAnimation from '../components/ScrollFrameAnimation';
import WhatIsSwaply from '../components/WhatIsSwaply';
import FinalCTA from '../components/FinalCTA';

export default function HomePage({ onOpenJoinModal }) {
  return (
    <div className="space-y-8">
      {/* 1. ULTRA-MINIMALIST HERO SECTION */}
      <HeroSection onOpenJoinModal={onOpenJoinModal} />

      {/* 2. FULL-SCREEN PINNED HANDSHAKE CANVAS ANIMATION STAGE */}
      <ScrollFrameAnimation onOpenJoinModal={onOpenJoinModal} />

      {/* 3. PLATFORM PILLARS SUMMARY */}
      <WhatIsSwaply />

      {/* 4. FINAL CTA */}
      <FinalCTA onOpenJoinModal={onOpenJoinModal} />
    </div>
  );
}
