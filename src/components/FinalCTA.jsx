import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA({ onOpenJoinModal }) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="rounded-3xl p-10 sm:p-16 bg-[#1B242A] text-[#FBF5EC] shadow-[0_20px_60px_rgba(27,36,42,0.3)] relative overflow-hidden text-center border border-[#C49A62]/30">
        
        {/* TOP DECORATIVE BADGE */}
        <div className="inline-flex items-center gap-2 bg-[#C49A62] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm mb-6">
          <Sparkles className="w-4 h-4" /> Private Beta Testing Pass
        </div>

        {/* HEADLINE */}
        <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto font-serif">
          Ready To Test The Future of <span className="text-[#C49A62]">1-on-1 Video?</span>
        </h2>

        {/* SUBHEADING */}
        <p className="mt-6 text-lg sm:text-2xl font-medium text-[#FBF5EC]/85 max-w-2xl mx-auto leading-relaxed">
          Join our private early access tester group. Zero cost, 100% direct peer access. Help us stress-test the video call engine.
        </p>

        {/* HANDWRITTEN SIGN OFF */}
        <div className="my-8">
          <span className="font-handwriting text-3xl text-[#C49A62] font-bold rotate-[-1deg] inline-block">
            "See you inside the beta." ✦
          </span>
        </div>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenJoinModal}
            className="w-full sm:w-auto bg-[#C49A62] hover:bg-[#BA8E58] text-white px-9 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Claim Early Access Pass 🚀</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
