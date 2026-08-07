import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { frameImagesCache } from '../utils/frameCache';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 192;

export default function ScrollFrameAnimation({ onOpenJoinModal }) {
  const outerPinRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(document.createElement('canvas'));
  const imagesRef = useRef(frameImagesCache);
  const frameObjRef = useRef({ frame: 0 });
  const lastDrawnIdx = useRef(-1);

  const [isCompleted, setIsCompleted] = useState(false);

  // GSAP ScrollTrigger Pinned Controller
  useEffect(() => {
    const pinContainer = outerPinRef.current;
    const mainCanvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!pinContainer || !mainCanvas) return;

    const mainCtx = mainCanvas.getContext('2d', { alpha: false });
    const offCtx = offscreenCanvas.getContext('2d', { alpha: false });

    mainCtx.imageSmoothingEnabled = true;
    mainCtx.imageSmoothingQuality = 'high';
    offCtx.imageSmoothingEnabled = true;
    offCtx.imageSmoothingQuality = 'high';

    const updateDimensions = () => {
      const rect = mainCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      mainCanvas.width = Math.round(rect.width * dpr);
      mainCanvas.height = Math.round(rect.height * dpr);

      offscreenCanvas.width = Math.round(rect.width * dpr);
      offscreenCanvas.height = Math.round(rect.height * dpr);

      mainCtx.scale(dpr, dpr);
      offCtx.scale(dpr, dpr);

      mainCtx.imageSmoothingEnabled = true;
      mainCtx.imageSmoothingQuality = 'high';
      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = 'high';

      // Fill canvas background with paper color #FBF5EC immediately
      mainCtx.fillStyle = '#FBF5EC';
      mainCtx.fillRect(0, 0, rect.width, rect.height);
      offCtx.fillStyle = '#FBF5EC';
      offCtx.fillRect(0, 0, rect.width, rect.height);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const drawFrame = (index) => {
      if (index === lastDrawnIdx.current) return;
      lastDrawnIdx.current = index;

      const rect = mainCanvas.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;

      const img = imagesRef.current[index];
      if (img && img.complete && img.naturalWidth !== 0) {
        const scale = Math.max(cssW / img.naturalWidth, cssH / img.naturalHeight);
        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        const drawX = (cssW - drawW) / 2;
        const drawY = (cssH - drawH) / 2;

        offCtx.fillStyle = '#FBF5EC';
        offCtx.fillRect(0, 0, cssW, cssH);
        offCtx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        offCtx.fillStyle = '#FBF5EC';
        offCtx.fillRect(0, 0, cssW, cssH);
      }

      mainCtx.drawImage(
        offscreenCanvas,
        0,
        0,
        offscreenCanvas.width,
        offscreenCanvas.height,
        0,
        0,
        cssW,
        cssH
      );
    };

    const tween = gsap.to(frameObjRef.current, {
      frame: TOTAL_FRAMES - 1,
      ease: "none",
      scrollTrigger: {
        trigger: pinContainer,
        start: "top top",
        end: "+=2000",
        pin: true,
        scrub: 0.35,
        onUpdate: (self) => {
          const frameIdx = Math.round(frameObjRef.current.frame);
          const clampedIdx = Math.max(0, Math.min(frameIdx, TOTAL_FRAMES - 1));
          
          drawFrame(clampedIdx);

          if (self.progress >= 0.90) {
            setIsCompleted(true);
          } else {
            setIsCompleted(false);
          }
        }
      }
    });

    drawFrame(0);

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div
      ref={outerPinRef}
      className="w-full min-h-[85vh] sm:min-h-screen relative flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 bg-[#FBF5EC] overflow-hidden border-y border-[#1B242A]/15 shadow-sm"
    >
      {/* FULL-SCREEN CANVAS BACKGROUND STAGE */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover opacity-95 bg-[#FBF5EC]"
          style={{ backgroundColor: '#FBF5EC' }}
        />
      </div>

      {/* FINAL FULL-FRAME QUOTE COVERAGE STAGE */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-30 w-full h-full bg-[#FBF5EC]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 sm:p-10 text-center"
          >
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center">
              
              {/* BADGE ANIMATION */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-[#C49A62] text-white px-5 py-2 rounded-full text-xs sm:text-sm font-bold mb-6 shadow-md"
              >
                <Sparkles className="w-4 h-4 sm:w-5 h-5 fill-white" />
                <span>SKILL MATCH ESTABLISHED!</span>
              </motion.div>

              {/* HEADLINE QUOTE ANIMATION */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1B242A] tracking-tight leading-[1.1] font-serif"
              >
                Teach What You Know.<br />
                <span className="text-[#C49A62] inline-block mt-2">
                  Learn What You Love.
                </span>
              </motion.h2>

              {/* SUBTITLE */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="text-sm sm:text-xl font-medium text-[#1B242A]/80 mt-6 max-w-xl leading-relaxed"
              >
                Swaply connects people who want to learn, teach, and exchange skills — 100% free.
              </motion.p>

              {/* ACTION BUTTON */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
              >
                <button
                  onClick={onOpenJoinModal}
                  className="w-full sm:w-auto bg-[#C49A62] hover:bg-[#BA8E58] text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Start Swapping Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM STAGE SCROLL PROMPT */}
      {!isCompleted && (
        <div className="relative z-20 text-center max-w-3xl mx-auto w-full pb-3 px-2">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-[#1B242A]/15 px-4 py-2 rounded-full shadow-sm text-xs font-bold text-[#1B242A]">
            <span className="w-2 h-2 rounded-full bg-[#D96B52] animate-ping shrink-0" />
            <span>Scroll down to bring them together!</span>
          </div>
        </div>
      )}

    </div>
  );
}
