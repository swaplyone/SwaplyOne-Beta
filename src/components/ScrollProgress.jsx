import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 25,
    restDelta: 0.001
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-2 bg-paper-grid">
      <motion.div
        style={{ scaleX, transformOrigin: '0%' }}
        className="h-full bg-swaply-coral border-b-2 border-swaply-black relative"
      >
        {/* Hand-drawn end dot indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-swaply-yellow border-2 border-swaply-black rounded-full shadow-hard-sm" />
      </motion.div>
    </div>
  );
}
