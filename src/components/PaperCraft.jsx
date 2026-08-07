import React from 'react';

// PAPER CLIP SVG WITH FIXED WIDTH & HEIGHT BOUNDS
export function PaperClip({ className = "", style }) {
  return (
    <svg
      className={`w-6 h-10 text-swaply-black drop-shadow-md pointer-events-none ${className}`}
      style={{ width: '24px', height: '40px', maxWidth: '24px', maxHeight: '40px', ...style }}
      viewBox="0 0 24 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 4v34a6 6 0 0 1-12 0V12a8 8 0 0 1 16 0v24a4 4 0 0 1-8 0V16" />
    </svg>
  );
}

// BINDER CLIP ACCENT
export function BinderClip({ className = "" }) {
  return (
    <div className={`relative inline-block w-10 h-10 text-swaply-black drop-shadow-md pointer-events-none ${className}`}>
      <svg viewBox="0 0 40 40" fill="currentColor">
        <path d="M10 16 h20 v18 h-20 z" fill="#1B242A" />
        <path d="M14 6 L20 16 L26 6" fill="none" stroke="#C49A62" strokeWidth="3" strokeLinecap="round" />
        <circle cx="20" cy="24" r="3" fill="#D96B52" />
      </svg>
    </div>
  );
}

// MASKING TAPE STRIP
export function MaskingTape({ text, className = "" }) {
  return (
    <div
      className={`pointer-events-none z-10 backdrop-blur-[1px] px-3 py-0.5 bg-amber-100/90 border border-amber-300/80 shadow-sm rotate-[-3deg] text-[10px] font-black tracking-wider text-swaply-black uppercase ${className}`}
      style={{
        clipPath: 'polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)',
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.02) 5px, rgba(0,0,0,0.02) 10px)'
      }}
    >
      {text || 'SWAPLY TAPE'}
    </div>
  );
}

// STICKY NOTE
export function StickyNote({ title, text, rotation = "rotate-[2deg]", color = "bg-[#FEF9C3]" }) {
  return (
    <div className={`p-4 ${color} text-swaply-black border-2 border-swaply-black/80 shadow-hard-sm ${rotation} rounded-sm relative max-w-xs font-sans`}>
      <MaskingTape text={title} className="w-20 h-5 bg-amber-100/80 border border-amber-200/80 -top-3 left-1/2 -translate-x-1/2 absolute" />
      {title && <h5 className="font-black text-xs uppercase mb-1 tracking-wide">{title}</h5>}
      <p className="font-handwriting text-lg leading-tight font-bold text-swaply-black/90">{text}</p>
    </div>
  );
}

// TORN PAPER EDGE
export function TornEdge({ color = "#FBF5EC", position = "bottom" }) {
  const isTop = position === "top";
  return (
    <div className={`w-full overflow-hidden leading-none ${isTop ? '-mb-1 rotate-180' : '-mt-1'}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-8 text-paper" fill="currentColor">
        <path d="M0,0 C150,90 350,-40 500,65 C650,140 900,-30 1200,45 L1200,120 L0,120 Z" />
      </svg>
    </div>
  );
}
