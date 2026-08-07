import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FrameByFrameHandshakeCanvas() {
  const outerContainerRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [timelineStatus, setTimelineStatus] = useState('0–1 sec: Standing Far Apart');
  const [progressPercent, setProgressPercent] = useState('0%');
  const [isCompleted, setIsCompleted] = useState(false);
  const hasTriggeredConfetti = useRef(false);

  useEffect(() => {
    const pinContainer = outerContainerRef.current;
    const canvas = canvasRef.current;
    if (!pinContainer || !canvas) return;

    const ctx = canvas.getContext('2d');

    // Handle retina display scaling
    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Frame-by-Frame Renderer (6-8 sec timeline mapped onto scroll progress 0.0 -> 1.0)
    const drawFrameByProgress = (progress) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // 1. Clear & draw background (Static Warm Paper + Grid)
      ctx.fillStyle = '#FAF6F0';
      ctx.fillRect(0, 0, width, height);

      // Paper Dot Grid Texture
      ctx.fillStyle = 'rgba(180, 170, 155, 0.25)';
      const dotSpacing = 20;
      for (let x = 10; x < width; x += dotSpacing) {
        for (let y = 10; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Ground Line
      const groundY = height * 0.72;
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(width * 0.08, groundY);
      ctx.lineTo(width * 0.92, groundY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Timeline Mapping:
      // 0.00 - 0.15 (0-1 sec): Standing Far Apart
      // 0.15 - 0.55 (1-4 sec): Walking toward each other
      // 0.55 - 0.70 (4-5 sec): Meet & pause in center
      // 0.70 - 0.90 (5-7 sec): Extend hands & handshake
      // 0.90 - 1.00 (7-8 sec): Remain standing together
      const pct = Math.min(Math.max(Math.round(progress * 100), 0), 100);
      setProgressPercent(`${pct}%`);

      let statusText = '';
      if (progress < 0.15) {
        statusText = '0–1s • Standing Far Apart';
      } else if (progress < 0.55) {
        statusText = '1–4s • Walking Toward Each Other';
      } else if (progress < 0.70) {
        statusText = '4–5s • Meeting In The Center';
      } else if (progress < 0.90) {
        statusText = '5–7s • Shaking Hands';
      } else {
        statusText = '7–8s • Connected & Growing';
      }
      setTimelineStatus(statusText);

      if (progress >= 0.90) {
        setIsCompleted(true);
        if (!hasTriggeredConfetti.current) {
          hasTriggeredConfetti.current = true;
          try {
            confetti({
              particleCount: 45,
              spread: 65,
              origin: { y: 0.6 },
              colors: ['#FFE569', '#FF6B6B', '#4ECDC4', '#A06CD5']
            });
          } catch (e) {}
        }
      } else {
        setIsCompleted(false);
        if (progress < 0.75) {
          hasTriggeredConfetti.current = false;
        }
      }

      // Calculate Character X Positions
      const leftStartX = width * 0.18;
      const rightStartX = width * 0.82;
      const centerLeftTarget = width * 0.5 - 32;
      const centerRightTarget = width * 0.5 + 32;

      let walkFactor = 0;
      if (progress > 0.15 && progress <= 0.55) {
        walkFactor = (progress - 0.15) / 0.40;
      } else if (progress > 0.55) {
        walkFactor = 1;
      }

      const p1X = leftStartX + (centerLeftTarget - leftStartX) * walkFactor;
      const p2X = rightStartX - (rightStartX - centerRightTarget) * walkFactor;

      // Calculate Hand Extension (5-7 sec)
      let handshakeFactor = 0;
      if (progress > 0.70 && progress <= 0.90) {
        handshakeFactor = (progress - 0.70) / 0.20;
      } else if (progress > 0.90) {
        handshakeFactor = 1;
      }

      // 3. Draw Character 1 (Teacher on Left: Yellow Hair, Glasses, Coral Shirt)
      drawCharacter1(ctx, p1X, groundY, walkFactor, handshakeFactor, progress);

      // 4. Draw Character 2 (Learner on Right: Purple Beanie, Mint Hoodie)
      drawCharacter2(ctx, p2X, groundY, walkFactor, handshakeFactor, progress);

      // 5. Draw Handshake Sparks at meeting moment
      if (handshakeFactor > 0.4) {
        const cx = (p1X + p2X) / 2;
        const cy = groundY - 60;
        drawSparkleBurst(ctx, cx, cy, handshakeFactor);
      }
    };

    // Character 1 Renderer
    function drawCharacter1(ctx, x, y, walkFactor, handshakeFactor, progress) {
      ctx.save();
      ctx.translate(x, y);

      // Head
      ctx.fillStyle = '#FFE569';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, -95, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hair (Black)
      ctx.fillStyle = '#121212';
      ctx.beginPath();
      ctx.arc(0, -101, 22, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();

      // Glasses
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-14, -99, 11, 10);
      ctx.strokeRect(3, -99, 11, 10);
      ctx.beginPath();
      ctx.moveTo(-3, -94);
      ctx.lineTo(3, -94);
      ctx.stroke();

      // Smile
      ctx.beginPath();
      ctx.arc(0, -87, 7, 0.1, Math.PI - 0.1);
      ctx.stroke();

      // Torso (Coral Pink Shirt)
      ctx.fillStyle = '#FF6B6B';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-20, -70, 40, 46, 8);
      ctx.fill();
      ctx.stroke();

      // Arm reaching out for handshake
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#121212';
      ctx.beginPath();
      ctx.moveTo(14, -56);
      const reachX = 14 + 26 * handshakeFactor;
      const reachY = -56 + 6 * handshakeFactor;
      ctx.lineTo(reachX, reachY);
      ctx.stroke();

      // Hand
      ctx.fillStyle = '#FFE569';
      ctx.beginPath();
      ctx.arc(reachX, reachY, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Legs with animated walk cycle
      const isWalking = walkFactor > 0 && walkFactor < 1;
      const legAngle = isWalking ? Math.sin(progress * 40) * 10 : 0;
      ctx.fillStyle = '#121212';
      ctx.fillRect(-12 + legAngle, -24, 9, 24);
      ctx.fillRect(3 - legAngle, -24, 9, 24);

      // Name Label
      ctx.fillStyle = '#FAF6F0';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-25, 8, 50, 16, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#121212';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Alex (Teacher)', 0, 19);

      ctx.restore();
    }

    // Character 2 Renderer
    function drawCharacter2(ctx, x, y, walkFactor, handshakeFactor, progress) {
      ctx.save();
      ctx.translate(x, y);

      // Head
      ctx.fillStyle = '#FF85A1';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, -95, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Beanie Cap (Purple)
      ctx.fillStyle = '#A06CD5';
      ctx.beginPath();
      ctx.arc(0, -101, 22, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#121212';
      ctx.beginPath();
      ctx.arc(-7, -95, 3, 0, Math.PI * 2);
      ctx.arc(7, -95, 3, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -87, 7, 0.1, Math.PI - 0.1);
      ctx.stroke();

      // Torso (Mint Green Hoodie)
      ctx.fillStyle = '#4ECDC4';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-20, -70, 40, 46, 8);
      ctx.fill();
      ctx.stroke();

      // Arm reaching out for handshake
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#121212';
      ctx.beginPath();
      ctx.moveTo(-14, -56);
      const reachX = -14 - 26 * handshakeFactor;
      const reachY = -56 + 6 * handshakeFactor;
      ctx.lineTo(reachX, reachY);
      ctx.stroke();

      // Hand
      ctx.fillStyle = '#FF85A1';
      ctx.beginPath();
      ctx.arc(reachX, reachY, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Legs with animated walk cycle
      const isWalking = walkFactor > 0 && walkFactor < 1;
      const legAngle = isWalking ? Math.sin(progress * 40 + Math.PI) * 10 : 0;
      ctx.fillStyle = '#121212';
      ctx.fillRect(-12 + legAngle, -24, 9, 24);
      ctx.fillRect(3 - legAngle, -24, 9, 24);

      // Name Label
      ctx.fillStyle = '#FAF6F0';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-25, 8, 50, 16, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#121212';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Maya (Learner)', 0, 19);

      ctx.restore();
    }

    // Sparkle Burst
    function drawSparkleBurst(ctx, cx, cy, scale) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      ctx.fillStyle = '#FFE569';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -20, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#121212';
      ctx.font = 'bold 10px "Permanent Marker", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('CONNECTED!', 0, -16);

      ctx.restore();
    }

    // GSAP ScrollTrigger Pinned Controller
    const trigger = ScrollTrigger.create({
      trigger: pinContainer,
      start: "top top",
      end: "+=1400",
      pin: true,
      scrub: 0.4,
      onUpdate: (self) => {
        drawFrameByProgress(self.progress);
      }
    });

    drawFrameByProgress(0);

    return () => {
      trigger.kill();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div
      ref={outerContainerRef}
      className="w-full relative min-h-screen flex flex-col items-center justify-center py-6 bg-paper-cream border-3 border-swaply-black rounded-3xl shadow-hard overflow-hidden bg-paper-grid"
    >
      {/* TIMELINE OVERLAY & PROGRESS DISPLAY */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <span className="bg-swaply-yellow border-2 border-swaply-black px-3 py-1 rounded-full text-xs font-black shadow-hard-sm">
            {timelineStatus}
          </span>
          <span className="font-handwriting text-lg text-swaply-coral font-bold hidden sm:inline">
            Scroll to scrub animation ({progressPercent})
          </span>
        </div>
        <div className="bg-swaply-black text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-hard-sm">
          6–8s Scroll Animator
        </div>
      </div>

      {/* HTML5 CANVAS FRAME RENDERER */}
      <div className="w-full max-w-4xl h-[420px] px-4 relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-2xl border-3 border-swaply-black shadow-hard"
        />
      </div>

      {/* COMPLETED HANDSHAKE TEXT OVERLAY */}
      {isCompleted && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 bg-swaply-yellow border-3 border-swaply-black px-6 py-3 rounded-2xl shadow-hard-lg text-center animate-bounce">
          <h3 className="text-lg sm:text-2xl font-black text-swaply-black">
            "One person teaches. One person learns. <span className="underline decoration-swaply-coral underline-offset-4">Both grow.</span>"
          </h3>
          <p className="text-xs font-bold text-swaply-black/80 font-handwriting text-base">
            Connection + Skill Exchange + Growth
          </p>
        </div>
      )}
    </div>
  );
}
