import React from 'react';
import ExploreSkills from '../components/ExploreSkills';
import FinalCTA from '../components/FinalCTA';

export default function ExplorePage({ onOpenJoinModal }) {
  return (
    <div className="pt-16 pb-12 space-y-12">
      <ExploreSkills onOpenJoinModal={onOpenJoinModal} />
      <FinalCTA onOpenJoinModal={onOpenJoinModal} />
    </div>
  );
}
