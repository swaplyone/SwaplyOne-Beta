import React from 'react';
import { Link } from 'react-router-dom';
import { Bug, UserCheck } from 'lucide-react';

export default function Footer({ onOpenJoinModal }) {
  return (
    <footer className="bg-paper-dark border-t-3 border-swaply-black py-10 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* LOGO & BRANDING */}
        <div className="space-y-2 text-center md:text-left">
          <Link to="/" className="flex items-center justify-center md:justify-start gap-2.5 group">
            <img
              src="/favicon.png"
              alt="Swaply Logo"
              className="w-9 h-9 border-2 border-swaply-black rounded-xl shadow-hard-sm rotate-[-3deg] group-hover:rotate-0 transition-transform object-cover"
            />
            <span className="font-extrabold text-xl tracking-tight text-swaply-black">SWAPLY</span>
          </Link>
          <p className="text-xs font-extrabold text-swaply-black/70 font-handwriting text-lg">
            "Private Beta • 1-on-1 Real-Time Video Engine"
          </p>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black">
          <Link to="/" className="hover:text-swaply-coral transition-colors">
            Home
          </Link>
          <span>•</span>
          <Link to="/beta" className="hover:text-swaply-coral transition-colors flex items-center gap-1">
            <Bug className="w-3.5 h-3.5" /> Beta Tester
          </Link>
          <span>•</span>
          <Link to="/founder" className="text-swaply-coral hover:underline flex items-center gap-1 font-black">
            <UserCheck className="w-3.5 h-3.5" /> About Founder
          </Link>
        </div>

      </div>
    </footer>
  );
}
