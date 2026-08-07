import React from 'react';
import WhatIsSwaply from '../components/WhatIsSwaply';
import WhySwaply from '../components/WhySwaply';
import CommunityGraph from '../components/CommunityGraph';
import FinalCTA from '../components/FinalCTA';

export default function AboutPage({ onOpenJoinModal }) {
  return (
    <div className="pt-16 pb-12 space-y-12">
      <WhatIsSwaply />
      <WhySwaply />
      <CommunityGraph />
      <FinalCTA onOpenJoinModal={onOpenJoinModal} />
    </div>
  );
}
