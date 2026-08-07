import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Bug, UserCheck } from 'lucide-react';

export default function Footer({ onOpenJoinModal }) {
  return (
    <footer className="bg-paper-dark border-t-3 border-swaply-black py-12 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* LOGO & BRANDING */}
        <div className="space-y-2 text-center md:text-left">
          <Link to="/" className="flex items-center justify-center md:justify-start gap-2 group">
            <div className="w-8 h-8 bg-swaply-yellow border-2 border-swaply-black rounded-lg flex items-center justify-center font-extrabold text-sm shadow-hard-sm rotate-[-3deg] group-hover:rotate-0 transition-transform">
              S
            </div>
            <span className="font-extrabold text-xl tracking-tight text-swaply-black">SWAPLY</span>
          </Link>
          <p className="text-xs font-extrabold text-swaply-black/70 font-handwriting text-lg">
            "Private Beta • 1-on-1 Video Engine"
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

        {/* SOCIAL ICONS */}
        <div className="flex items-center gap-3">
          <a href="#twitter" aria-label="Twitter" className="w-9 h-9 bg-paper border-2 border-swaply-black rounded-xl flex items-center justify-center shadow-hard-sm hover:bg-swaply-yellow transition-all hover:scale-105">
            <svg className="w-4 h-4 fill-swaply-black" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="#github" aria-label="GitHub" className="w-9 h-9 bg-paper border-2 border-swaply-black rounded-xl flex items-center justify-center shadow-hard-sm hover:bg-swaply-yellow transition-all hover:scale-105">
            <svg className="w-4 h-4 fill-swaply-black" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
        </div>

      </div>
    </footer>
  );
}
