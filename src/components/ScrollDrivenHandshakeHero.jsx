import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';
import { Zap, Sparkles, Heart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollDrivenHandshakeHero() {
  const outerPinRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [scrollProgressText, setScrollProgressText] = useState('0%');
  const [showGrowthText, setShowGrowthText] = useState(false);
  const hasTriggeredConfetti = useRef(false);

  useEffect(() => {
    const pinEl = outerPinRef.current;
    const canvas = canvasRef.current;
    if (!pinEl || !canvas) return;

    const ctx = canvas.getContext('2d');

    // Canvas sizing setup for high DPI display
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Frame Renderer Function driven by GSAP ScrollTrigger progress (0 -> 1)
    const renderFrame = (progress) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear canvas with paper background color
      ctx.fillStyle = '#FAF6F0';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid pattern on canvas
      ctx.strokeStyle = 'rgba(180, 170, 155, 0.2)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Determine Stage & Progress Percentage
      const percent = Math.min(Math.max(Math.round(progress * 100), 0), 100);
      setScrollProgressText(`${percent}%`);

      let stage = 1;
      if (progress < 0.25) stage = 1;
      else if (progress < 0.60) stage = 2;
      else if (progress < 0.80) stage = 3;
      else if (progress < 0.95) stage = 4;
      else stage = 5;
      setCurrentStage(stage);

      if (progress >= 0.95) {
        setShowGrowthText(true);
        if (!hasTriggeredConfetti.current) {
          hasTriggeredConfetti.current = true;
          try {
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#FFE569', '#FF6B6B', '#4ECDC4', '#A06CD5']
            });
          } catch (e) {}
        }
      } else {
        setShowGrowthText(false);
        if (progress < 0.8) {
          hasTriggeredConfetti.current = false;
        }
      }

      // Calculate Character Positions
      // Left Character start at ~15% width, Right Character start at ~85% width
      const centerTarget = width / 2;
      const leftStartX = width * 0.14;
      const rightStartX = width * 0.86;

      // Ease movement toward center based on progress (0 -> 0.85 progress reaches center)
      const approachFactor = Math.min(progress / 0.85, 1);
      // Smooth cubic easing
      const easedApproach = Math.pow(approachFactor, 0.8);

      const p1X = leftStartX + (centerTarget - 45 - leftStartX) * easedApproach;
      const p2X = rightStartX - (rightStartX - (centerTarget + 45)) * easedApproach;
      const centerY = height / 2 + 10;

      // DRAW DASHED APPROACH LINE
      ctx.save();
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(p1X + 40, centerY + 10);
      ctx.lineTo(p2X - 40, centerY + 10);
      ctx.stroke();
      ctx.restore();

      // DRAW PERSON 1 (LEFT — SKILL TEACHER)
      drawPerson1(ctx, p1X, centerY, progress, stage);

      // DRAW PERSON 2 (RIGHT — SKILL LEARNER)
      drawPerson2(ctx, p2X, centerY, progress, stage);

      // STAGE 4 & 5: DRAW HANDSHAKE BURST & SPARKLES
      if (progress >= 0.80) {
        const burstScale = Math.min((progress - 0.80) / 0.15, 1);
        drawHandshakeBurst(ctx, centerTarget, centerY - 10, burstScale);
      }
    };

    // Person 1 (Teacher) Canvas Drawing
    function drawPerson1(ctx, x, y, progress, stage) {
      ctx.save();
      ctx.translate(x, y);

      // Skill Speech Bubble
      if (progress < 0.9) {
        ctx.fillStyle = '#FFE569';
        ctx.strokeStyle = '#121212';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-55, -95, 110, 26, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#121212';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('"I teach Coding!"', 0, -78);
      }

      // Head
      ctx.fillStyle = '#FFE569';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, -42, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hair
      ctx.fillStyle = '#121212';
      ctx.beginPath();
      ctx.arc(0, -48, 22, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();

      // Glasses
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-14, -46, 11, 10);
      ctx.strokeRect(3, -46, 11, 10);
      ctx.beginPath();
      ctx.moveTo(-3, -41);
      ctx.lineTo(3, -41);
      ctx.stroke();

      // Smile
      ctx.beginPath();
      ctx.arc(0, -34, 8, 0.1, Math.PI - 0.1);
      ctx.stroke();

      // Body (Torso / Shirt)
      ctx.fillStyle = '#FF6B6B';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-22, -18, 44, 52, 10);
      ctx.fill();
      ctx.stroke();

      // Arm reaching for handshake
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#121212';
      ctx.beginPath();
      ctx.moveTo(16, -6);

      // Arm extension increases as progress increases
      const armReach = Math.min(progress / 0.85, 1);
      const armEndX = 16 + 28 * armReach;
      const armEndY = -6 + 10 * armReach;
      ctx.lineTo(armEndX, armEndY);
      ctx.stroke();

      // Hand
      ctx.fillStyle = '#FFE569';
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Legs
      ctx.fillStyle = '#121212';
      const walkCycle = Math.sin(progress * Math.PI * 12) * 8;
      ctx.fillRect(-14 + walkCycle, 34, 10, 24);
      ctx.fillRect(4 - walkCycle, 34, 10, 24);

      // Badge
      ctx.fillStyle = '#FAF6F0';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-24, 62, 48, 18, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#121212';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Alex (Teacher)', 0, 74);

      ctx.restore();
    }

    // Person 2 (Learner) Canvas Drawing
    function drawPerson2(ctx, x, y, progress, stage) {
      ctx.save();
      ctx.translate(x, y);

      // Skill Speech Bubble
      if (progress < 0.9) {
        ctx.fillStyle = '#4ECDC4';
        ctx.strokeStyle = '#121212';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-55, -95, 110, 26, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#121212';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('"I learn Design!"', 0, -78);
      }

      // Head
      ctx.fillStyle = '#FF85A1';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, -42, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Beanie Cap
      ctx.fillStyle = '#A06CD5';
      ctx.beginPath();
      ctx.arc(0, -48, 22, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#121212';
      ctx.beginPath();
      ctx.arc(-8, -42, 3, 0, Math.PI * 2);
      ctx.arc(8, -42, 3, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -34, 8, 0.1, Math.PI - 0.1);
      ctx.stroke();

      // Body (Torso / Hoodie)
      ctx.fillStyle = '#4ECDC4';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-22, -18, 44, 52, 10);
      ctx.fill();
      ctx.stroke();

      // Arm reaching for handshake
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#121212';
      ctx.beginPath();
      ctx.moveTo(-16, -6);

      const armReach = Math.min(progress / 0.85, 1);
      const armEndX = -16 - 28 * armReach;
      const armEndY = -6 + 10 * armReach;
      ctx.lineTo(armEndX, armEndY);
      ctx.stroke();

      // Hand
      ctx.fillStyle = '#FF85A1';
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Legs
      ctx.fillStyle = '#121212';
      const walkCycle = Math.sin(progress * Math.PI * 12 + Math.PI) * 8;
      ctx.fillRect(-14 + walkCycle, 34, 10, 24);
      ctx.fillRect(4 - walkCycle, 34, 10, 24);

      // Badge
      ctx.fillStyle = '#FAF6F0';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-24, 62, 48, 18, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#121212';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Maya (Learner)', 0, 74);

      ctx.restore();
    }

    // Handshake Explosion Burst
    function drawHandshakeBurst(ctx, cx, cy, scale) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // Sparkle Star 1
      ctx.fillStyle = '#FFE569';
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -30, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#121212';
      ctx.font = 'bold 12px "Permanent Marker", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('MATCH!', 0, -26);

      // Sparks
      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-25, -20); ctx.lineTo(-40, -35);
      ctx.moveTo(25, -20); ctx.lineTo(40, -35);
      ctx.moveTo(0, -50); ctx.lineTo(0, -65);
      ctx.stroke();

      ctx.restore();
    }

    // GSAP ScrollTrigger Setup: Pin the outer section during scroll
    const trigger = ScrollTrigger.create({
      trigger: pinEl,
      start: "top top",
      end: "+=1200",
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        renderFrame(self.progress);
      }
    });

    // Initial render at progress 0
    renderFrame(0);

    return () => {
      trigger.kill();
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  return (
    <div ref={outerPinRef} className="w-full relative min-h-screen flex flex-col items-center justify-center py-6 bg-paper-cream border-3 border-swaply-black rounded-3xl shadow-hard overflow-hidden bg-paper-grid">
      
      {/* TOP SCROLL STAGE INDICATOR & BADGE */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <span className="bg-swaply-yellow border-2 border-swaply-black px-3 py-1 rounded-full text-xs font-black shadow-hard-sm">
            STAGE 0{currentStage} / 05
          </span>
          <span className="font-handwriting text-lg text-swaply-coral font-bold hidden sm:inline">
            Scroll down to bring them together ({scrollProgressText})
          </span>
        </div>
        <div className="bg-swaply-black text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-hard-sm">
          GSAP ScrollTrigger Active
        </div>
      </div>

      {/* CANVAS ELEMENT FOR 60FPS SCROLL FRAME DRAWING */}
      <div className="w-full max-w-4xl h-[420px] px-4 relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-2xl border-3 border-swaply-black shadow-hard"
        />
      </div>

      {/* STAGE 5 CAPTION DISPLAY */}
      {showGrowthText && (
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
