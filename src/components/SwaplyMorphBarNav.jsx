import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronUp, ChevronDown, FileText, Bookmark, X, Check } from 'lucide-react';
import { PaperClip, MaskingTape } from './PaperCraft';

export default function SwaplyMorphBarNav({ onOpenJoinModal }) {
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  // Track window scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-fold menu on route change
  useEffect(() => {
    setIsUnfolded(false);
  }, [location.pathname]);

  // Click outside to fold paper back
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsUnfolded(false);
      }
    };
    if (isUnfolded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUnfolded]);

  const navItems = [
    { label: 'Home', path: '/', isHash: false },
    { label: 'About Beta', path: '/beta#about', targetId: 'about' },
    { label: 'Timeline', path: '/beta#timeline', targetId: 'timeline' },
    { label: 'Registration', path: '/beta#registration', targetId: 'registration' },
    { label: 'FAQ', path: '/beta#faq', targetId: 'faq' },
    { label: 'Contact', path: '/beta#contact', targetId: 'contact' },
  ];

  const handleNavClick = (item, e) => {
    setIsUnfolded(false);
    if (item.path === '/') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.targetId) {
      if (location.pathname !== '/beta') {
        navigate('/beta');
        setTimeout(() => {
          const el = document.getElementById(item.targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(item.targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <div ref={navRef} className="fixed top-4 left-0 right-0 z-[9990] flex justify-center px-4 pointer-events-none selection:bg-swaply-yellow">
      <div className="pointer-events-auto relative max-w-2xl w-full flex flex-col items-center">
        
        {/* FOLDED PAPER STRIP (DEFAULT COMPACT MORPH BAR) */}
        <motion.div
          layout
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsUnfolded(!isUnfolded)}
          className={`relative bg-paper-cream border-3 border-swaply-black rounded-2xl px-4 sm:px-6 py-2.5 shadow-hard flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 bg-paper-grid ${
            isScrolled ? 'shadow-hard-lg scale-[0.98]' : 'scale-100'
          }`}
        >
          {/* PAPER CLIP LEFT */}
          <PaperClip className="absolute -top-3.5 left-4 w-5 h-9 text-swaply-black/80 drop-shadow-sm pointer-events-none" />

          {/* WASHI TAPE TOP RIGHT */}
          <div className="absolute -top-2.5 right-12 pointer-events-none hidden sm:block">
            <MaskingTape className="w-20 h-4 bg-amber-100/80 border border-amber-300/60 rotate-[3deg]" />
          </div>

          {/* BRANDING LOGO & NAME */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-swaply-yellow border-2 border-swaply-black rounded-lg flex items-center justify-center font-black text-xs text-swaply-black shadow-hard-sm rotate-[-2deg]">
              S1
            </div>
            <span className="font-serif font-black text-base sm:text-lg text-swaply-black tracking-tight flex items-center gap-1">
              Swaply<span className="text-swaply-coral font-sans text-xs uppercase tracking-wider font-extrabold bg-swaply-coral/10 px-1.5 py-0.5 rounded border border-swaply-coral/30">One</span>
            </span>
          </div>

          {/* RUBBER STAMP BADGE: [ BETA ] */}
          <div className="inline-flex items-center gap-1 bg-[#FEF2F2] text-swaply-coral border-2 border-dashed border-swaply-coral px-2.5 py-0.5 rounded-md font-black text-[10px] sm:text-xs tracking-widest uppercase rotate-[-2deg] shadow-sm">
            <span>BETA</span>
          </div>

          {/* FOLD TOGGLE BUTTON & RIGHT CLIP */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-black text-swaply-black uppercase tracking-wider bg-swaply-black/5 px-2 py-0.5 rounded border border-swaply-black/10">
              {isUnfolded ? 'Fold Up ▲' : 'Unfold Menu ▾'}
            </span>

            <div className="p-1 bg-paper-card border-2 border-swaply-black rounded-lg shadow-hard-sm">
              {isUnfolded ? <ChevronUp className="w-4 h-4 text-swaply-black" /> : <ChevronDown className="w-4 h-4 text-swaply-black" />}
            </div>
          </div>
        </motion.div>

        {/* 3D ORIGAMI PAPER UNFOLD EXPANDED MENU */}
        <AnimatePresence>
          {isUnfolded && (
            <motion.div
              key="morph-unfolded-notebook"
              initial={{ opacity: 0, scaleY: 0, rotateX: -60, transformOrigin: 'top center' }}
              animate={{
                opacity: 1,
                scaleY: 1,
                rotateX: 0,
                transition: {
                  type: 'spring',
                  stiffness: 380,
                  damping: 26,
                  mass: 0.85
                }
              }}
              exit={{
                opacity: 0,
                scaleY: 0,
                rotateX: -45,
                transition: { duration: 0.22, ease: 'easeIn' }
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-full mt-2 bg-paper-cream border-3 border-swaply-black rounded-3xl p-5 sm:p-6 shadow-hard-2xl relative bg-paper-grid border-t-0"
            >
              {/* NOTEBOOK BINDER HOLE PUNCHES ALONG TOP EDGE */}
              <div className="flex justify-between px-6 -mt-3 mb-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-swaply-black/20 border border-swaply-black/30 shadow-inner" />
                ))}
              </div>

              {/* FOLDED CORNER DETAIL */}
              <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-br-2xl">
                <div className="w-12 h-12 bg-swaply-black/15 origin-bottom-left rotate-45 transform translate-x-2 translate-y-6 shadow-md" />
              </div>

              {/* HEADER CAPTION ON PAPER */}
              <div className="flex items-center justify-between border-b-2 border-dashed border-swaply-black/20 pb-3 mb-4">
                <span className="font-handwriting text-xl font-bold text-swaply-coral rotate-[-1deg]">
                  "Select a notebook tab below..." 📓
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-swaply-black/50 bg-paper-card border border-swaply-black/20 px-2 py-0.5 rounded">
                  Pioneer Navigation
                </span>
              </div>

              {/* NAVIGATION TABS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
                {navItems.map((item) => {
                  const isActive = location.pathname === '/' && item.path === '/';
                  return (
                    <motion.button
                      key={item.label}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => handleNavClick(item, e)}
                      className={`px-3 py-2.5 rounded-xl border-2 border-swaply-black text-xs font-black shadow-hard-sm transition-all text-left flex items-center justify-between relative ${
                        isActive
                          ? 'bg-swaply-yellow text-swaply-black shadow-hard border-3'
                          : 'bg-paper-card text-swaply-black hover:bg-swaply-coral/10 hover:border-swaply-coral'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-swaply-black flex-shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* ACTION BUTTON ON UNFOLDED SHEET */}
              <div className="pt-2 border-t-2 border-swaply-black/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs font-bold text-swaply-black/70 flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-swaply-coral" />
                  <span>Swaply Beta Pioneer Program</span>
                </div>

                <button
                  onClick={() => {
                    setIsUnfolded(false);
                    if (onOpenJoinModal) onOpenJoinModal();
                  }}
                  className="w-full sm:w-auto neo-btn bg-swaply-coral hover:bg-swaply-orange text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-hard-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Join Pioneer List</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
