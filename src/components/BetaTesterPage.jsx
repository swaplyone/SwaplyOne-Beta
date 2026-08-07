import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, UserCheck, CheckCircle2, ArrowLeft, Send, Lock, Copy, RefreshCw, Users, ShieldCheck, Mail, Check, ShieldAlert } from 'lucide-react';
import { useMorphBar } from '../context/MorphBarContext';
import { PaperClip, BinderClip, MaskingTape } from './PaperCraft';

export default function BetaTesterPage({ onBackToHome, onOpenJoinModal }) {
  const { showMorphBar } = useMorphBar();
  const [step, setStep] = useState('form'); // 'form' | 'success'

  // Single Track Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skillsToTest: 'Web Dev & Coding Swaps',
    experience: ''
  });

  const [isEmailLocked, setIsEmailLocked] = useState(false);

  // System Status State
  const [status, setStatus] = useState({
    enabled: true,
    currentCount: 0,
    maxLimit: 150,
    remainingSlots: 150,
    registrationClosed: false
  });

  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  // Check existing registration or login session in localStorage on mount
  useEffect(() => {
    fetchStatus();

    // 1. Check if user already completed registration
    try {
      const savedUser = localStorage.getItem('swaply_registered_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.betaId) {
          setRegisteredUser(parsed);
          setStep('success');
          return;
        }
      }
    } catch (e) {}

    // 2. Check active initial login session
    try {
      const savedSession = localStorage.getItem('swaply_user_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session && session.email) {
          setFormData(prev => ({
            ...prev,
            name: session.name || prev.name,
            email: session.email
          }));
          setIsEmailLocked(true);
        }
      }
    } catch (e) {}
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/beta/status');
      const data = await res.json();
      if (data.success) {
        setStatus(data);
        if (data.registrationClosed) {
          showMorphBar({
            type: 'warning',
            title: 'Registration Closed',
            message: 'All 150 beta slots have been claimed or registration is paused.',
            duration: 6000
          });
        }
      }
    } catch (err) {
      console.warn('Status fetch error:', err.message);
    }
  };

  // DIRECT REGISTRATION FORM SUBMISSION (NO OTP REQUIRED)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showMorphBar({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please enter your full name and valid email address.'
      });
      return;
    }

    setLoading(true);
    showMorphBar({
      type: 'loading',
      title: 'Creating Pioneer Account...',
      message: `Registering ${formData.email} directly on Swaply Beta`
    });

    try {
      const regRes = await fetch('/api/beta/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          track: 'pioneer',
          skillsToTest: formData.skillsToTest,
          experience: formData.experience
        })
      });
      const regData = await regRes.json();

      if (regData.success) {
        setRegisteredUser(regData.user);
        try {
          localStorage.setItem('swaply_registered_user', JSON.stringify(regData.user));
          localStorage.setItem('swaply_user_session', JSON.stringify(regData.user));
        } catch (e) {}

        showMorphBar({
          type: 'success',
          title: '🎉 DONE! Registered Successfully',
          message: `Confirmation email sent to ${regData.user.email}. Beta Pass: ${regData.user.betaId}`,
          duration: 7000
        });

        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#FFE569', '#FF6B6B', '#4ECDC4', '#A06CD5']
          });
        } catch (e) {}

        setStep('success');
        fetchStatus();
      } else {
        showMorphBar({
          type: 'error',
          title: 'Registration Blocked',
          message: regData.message || 'Registration failed. Please check policy rules.'
        });
      }
    } catch (err) {
      showMorphBar({
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to registration server.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative overflow-hidden">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-swaply-yellow/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <div className="text-center mb-10 space-y-3">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-black text-swaply-black/70 hover:text-swaply-coral mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="inline-flex items-center gap-2 bg-paper-card border border-swaply-black/20 px-3.5 py-1 rounded-full text-xs font-black shadow-sm mx-auto block">
          <Sparkles className="w-3.5 h-3.5 text-swaply-coral" />
          <span className="uppercase tracking-wider">OFFICIAL PIONEER BETA REGISTRATION</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-swaply-black tracking-tight">
          Claim Your Pioneer Beta Pass
        </h1>
        <p className="text-sm sm:text-base font-semibold text-swaply-black/70 max-w-lg mx-auto">
          Direct peer matching priority, founder channel access, and lifetime pioneer badges.
        </p>

        {/* SYSTEM STATUS BADGE */}
        <div className="inline-flex items-center gap-3 bg-white border-2 border-swaply-black px-4 py-2 rounded-2xl shadow-hard-sm text-xs font-black mt-2">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Slots Remaining: <span className="text-swaply-black font-extrabold text-sm">{status.remainingSlots}</span> / {status.maxLimit}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ==================== STEP 1: REGISTRATION FORM (NO OTP REQUIRED) ==================== */}
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-paper-cream border-3 border-swaply-black rounded-3xl p-6 sm:p-8 shadow-hard relative">
              <PaperClip className="top-3 right-4 rotate-[15deg]" />
              <MaskingTape text="DIRECT BETA ENTRY" className="-top-3 left-6 -rotate-2" />

              <form onSubmit={handleFormSubmit} className="space-y-5 pt-2">
                
                {/* FULL NAME */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-swaply-black mb-1.5">
                    Full Name <span className="text-swaply-coral">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Smith"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white border-2 border-swaply-black rounded-2xl px-4 py-3 text-sm font-bold text-swaply-black placeholder:text-swaply-black/40 focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm"
                  />
                </div>

                {/* EMAIL ADDRESS */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-swaply-black">
                      Email Address <span className="text-swaply-coral">*</span>
                    </label>
                    {isEmailLocked && (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked to Session
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    required
                    readOnly={isEmailLocked}
                    placeholder="jordan@example.com"
                    value={formData.email}
                    onChange={(e) => !isEmailLocked && setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full border-2 border-swaply-black rounded-2xl px-4 py-3 text-sm font-bold shadow-hard-sm focus:outline-none ${
                      isEmailLocked ? 'bg-slate-100 text-swaply-black/70 cursor-not-allowed' : 'bg-white text-swaply-black focus:ring-2 focus:ring-swaply-yellow'
                    }`}
                  />
                  <p className="text-[11px] font-bold text-swaply-black/60 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-swaply-coral" /> Single-registration policy enforced.
                  </p>
                </div>

                {/* SKILLS TO TEST */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-swaply-black mb-1.5">
                    Primary Skill Focus
                  </label>
                  <select
                    value={formData.skillsToTest}
                    onChange={(e) => setFormData(prev => ({ ...prev, skillsToTest: e.target.value }))}
                    className="w-full bg-white border-2 border-swaply-black rounded-2xl px-4 py-3 text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm cursor-pointer"
                  >
                    <option value="Web Dev & Coding Swaps">Web Dev & Coding Swaps</option>
                    <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                    <option value="Languages & Public Speaking">Languages & Public Speaking</option>
                    <option value="Music & Creative Arts">Music & Creative Arts</option>
                    <option value="Business & Startup Mentorship">Business & Startup Mentorship</option>
                  </select>
                </div>

                {/* EXPERIENCE / BIO */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-swaply-black mb-1.5">
                    What would you like to exchange or learn?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe your skill background or what you hope to gain from 1-on-1 video calls..."
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full bg-white border-2 border-swaply-black rounded-2xl p-4 text-sm font-bold text-swaply-black placeholder:text-swaply-black/40 focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading || status.registrationClosed}
                  className="w-full neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-2 border-swaply-black py-4 rounded-2xl text-sm font-black shadow-hard flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Claim Pass →</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            </div>
          </motion.div>
        )}

        {/* ==================== STEP 2: REGISTRATION CONFIRMED TICKET PASS ==================== */}
        {step === 'success' && registeredUser && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto space-y-6 text-center"
          >
            {/* OFFICIAL PIONEER TICKET PASS */}
            <div className="bg-paper-cream border-3 border-swaply-black rounded-3xl p-6 sm:p-8 shadow-hard relative overflow-hidden text-left space-y-5">
              <PaperClip className="top-3 right-4 rotate-12" />
              <BinderClip className="-top-3 left-1/2 -translate-x-1/2" />
              <MaskingTape text="VERIFIED PIONEER MEMBER" className="-top-3 left-6 -rotate-2" />

              <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-swaply-black/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-black text-xs text-swaply-black uppercase tracking-wider">SWAPLY BETA PASS</span>
                </div>
                <span className="bg-swaply-yellow border border-swaply-black px-3 py-1 rounded-full text-xs font-black">
                  {registeredUser.betaId || 'SWAP-BETA-1001'}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-swaply-black/60 block">PIONEER MEMBER</span>
                  <h3 className="text-xl font-black text-swaply-black">{registeredUser.name}</h3>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-swaply-black/60 block">REGISTERED EMAIL</span>
                  <p className="text-sm font-bold text-swaply-black truncate">{registeredUser.email}</p>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-swaply-black/60 block">SKILL FOCUS</span>
                  <p className="text-xs font-bold text-swaply-coral">{registeredUser.skillsToTest || 'Web Dev & Coding Swaps'}</p>
                </div>
              </div>

              <div className="bg-emerald-100 border-2 border-emerald-600 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-emerald-900">Registration Completed!</h4>
                  <p className="text-[11px] font-bold text-emerald-800">
                    A confirmation welcome mail has been sent to <strong>{registeredUser.email}</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={onBackToHome}
                  className="w-full neo-btn bg-swaply-yellow hover:bg-swaply-craft text-swaply-black border-2 border-swaply-black py-3.5 rounded-2xl text-xs font-black shadow-hard flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Return to Homepage →</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
