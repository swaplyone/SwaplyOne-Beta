import React from 'react';
import HowItWorks from '../components/HowItWorks';
import FinalCTA from '../components/FinalCTA';

export default function HowItWorksPage({ onOpenJoinModal }) {
  return (
    <div className="pt-16 pb-12 space-y-12">
      <HowItWorks />
      <FinalCTA onOpenJoinModal={onOpenJoinModal} />
    </div>
  );
}
