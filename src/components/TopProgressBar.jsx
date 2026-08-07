import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { preloadAllFrames, checkIsPreloaded } from '../utils/frameCache';

const MIN_LOADING_DURATION_MS = 5000; // 5-second initial frame preloading window
const TOTAL_FRAMES = 192;

export default function TopProgressBar() {
  const [isVisible, setIsVisible] = useState(() => !checkIsPreloaded());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let isMounted = true;
    const startTime = Date.now();
    let frameLoadCount = 0;

    // Start background frame preloading & hardware decoding
    preloadAllFrames((pct, count) => {
      frameLoadCount = count;
    });

    // 5-second smooth ticker
    const timer = setInterval(() => {
      if (!isMounted) return;

      const elapsed = Date.now() - startTime;
      const timePct = Math.min(100, Math.floor((elapsed / MIN_LOADING_DURATION_MS) * 100));
      const isTimeDone = elapsed >= MIN_LOADING_DURATION_MS;
      const isFramesDone = frameLoadCount >= TOTAL_FRAMES;

      let currentPct = Math.min(timePct, Math.max(timePct, Math.floor((frameLoadCount / TOTAL_FRAMES) * 100)));

      if (isTimeDone && isFramesDone) {
        currentPct = 100;
      } else if (currentPct >= 100) {
        currentPct = 99;
      }

      setProgress(currentPct);

      if (isTimeDone && isFramesDone) {
        clearInterval(timer);
        setTimeout(() => {
          if (isMounted) {
            setIsVisible(false);
          }
        }, 400);
      }
    }, 40);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.35 } }}
          className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-1.5 bg-swaply-black/10"
        >
          <div
            className="h-full bg-gradient-to-r from-swaply-yellow via-swaply-orange to-swaply-coral shadow-[0_0_12px_rgba(252,192,84,0.9)] transition-all duration-150 ease-out relative"
            style={{ width: `${Math.max(3, progress)}%` }}
          >
            {/* Glowing lead tip light */}
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/90 animate-pulse" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
