import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, UserCheck, CheckCircle2, ArrowLeft, Send, Lock, Copy, RefreshCw, Users, ShieldCheck, Mail, Check, ShieldAlert } from 'lucide-react';
import { useMorphBar } from '../context/MorphBarContext';
import { OtpInput } from './OtpInput';
import { PaperClip, BinderClip, MaskingTape } from './PaperCraft';

export default function BetaTesterPage({ onBackToHome, onOpenJoinModal }) {
  const { showMorphBar } = useMorphBar();
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'success'

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
  const [cooldown, setCooldown] = useState(0);
  const [otpValue, setOtpValue] = useState('');
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

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

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

  // STEP 1: Submit Form -> Send OTP
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
      title: 'Generating Verification Code...',
      message: `Sending 6-digit OTP code to locked email ${formData.email}`
    });

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();

      if (data.success) {
        showMorphBar({
          type: 'success',
          title: 'Verification Code Sent',
          message: data.message || `Check ${formData.email} for your 6-digit code.`,
          duration: 5000
        });
        setCooldown(data.cooldownSeconds || 60);
        setStep('otp');
      } else {
        showMorphBar({
          type: 'error',
          title: 'Registration Policy Blocked',
          message: data.message || 'Unable to request verification code.'
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

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    showMorphBar({
      type: 'loading',
      title: 'Resending Verification Code...',
      message: `Sending new OTP to ${formData.email}`
    });

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();

      if (data.success) {
        showMorphBar({
          type: 'success',
          title: 'OTP Resent Successfully',
          message: `New code sent to ${formData.email}`
        });
        setCooldown(60);
      } else {
        showMorphBar({
          type: 'error',
          title: 'Resend Failed',
          message: data.message
        });
      }
    } catch (err) {
      showMorphBar({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to connect to OTP service.'
      });
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP & Complete Registration into Firebase
  const handleVerifyOtp = async (codeToVerify) => {
    const code = codeToVerify || otpValue;
    if (!code || code.length < 6) {
      showMorphBar({
        type: 'warning',
        title: 'Invalid OTP Length',
        message: 'Please enter all 6 digits of your verification code.'
      });
      return;
    }

    setLoading(true);
    showMorphBar({
      type: 'loading',
      title: 'Verifying OTP Code...',
      message: 'Checking code against secure verification server'
    });

    try {
      // 1. Verify OTP
      const verifyRes = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: code })
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        showMorphBar({
          type: 'error',
          title: 'Invalid Verification Code',
          message: verifyData.message || 'Verification code failed.'
        });
        setLoading(false);
        return;
      }

      showMorphBar({
        type: 'success',
        title: 'Email Verified Successfully',
        message: 'Completing registration & sending confirmation email...'
      });

      // 2. Complete Registration (Saved via Firebase Admin SDK & sends email)
      const regRes = await fetch('/api/beta/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          track: 'pioneer',
          skillsToTest: formData.skillsToTest,
          experience: formData.experience,
          verificationToken: verifyData.verificationToken
        })
      });
      const regData = await regRes.json();

      if (regData.success) {
        setRegisteredUser(regData.user);
        try {
          localStorage.setItem('swaply_registered_user', JSON.stringify(regData.user));
        } catch (e) {}

        showMorphBar({
          type: 'success',
          title: '🎉 DONE! Registration Confirmed',
          message: `Confirmation email sent to ${regData.user.email}. Beta ID: ${regData.user.betaId}`,
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
          title: 'Registration Policy Blocked',
          message: regData.message || 'Could not complete registration.'
        });
      }
    } catch (err) {
      showMorphBar({
        type: 'error',
        title: 'Server Error',
        message: 'An error occurred during registration verification.'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyBetaId = () => {
    if (registeredUser?.betaId) {
      navigator.clipboard.writeText(registeredUser.betaId);
      showMorphBar({
        type: 'info',
        title: 'Beta ID Copied!',
        message: `${registeredUser.betaId} copied to clipboard.`
      });
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative selection:bg-swaply-yellow">
      
      {/* NAVIGATION BAR HEADER */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBackToHome}
          className="neo-btn bg-paper-cream hover:bg-paper-dark text-swaply-black px-4 py-2 rounded-xl text-xs font-bold shadow-hard-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Swaply Homepage
        </button>

        {!isEmailLocked && (
          <button
            onClick={onOpenJoinModal}
            className="neo-btn bg-swaply-yellow text-swaply-black px-4 py-2 rounded-xl text-xs font-black shadow-hard-sm"
          >
            Start Initial Login Session
          </button>
        )}
      </div>

      {/* HEADER SECTION WITH PAPER BADGES */}
      <div className="text-center max-w-2xl mx-auto mb-10 relative">
        <div className="inline-flex items-center gap-2 bg-swaply-coral text-white border-3 border-swaply-black px-4 py-1.5 rounded-full shadow-hard text-xs sm:text-sm font-black rotate-[-1deg] mb-4">
          <Sparkles className="w-4 h-4 text-swaply-yellow fill-swaply-yellow" />
          <span>OFFICIAL SWAPLY BETA REGISTRATION</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-swaply-black tracking-tight leading-tight">
          Swaply Beta <span className="bg-swaply-yellow border-3 border-swaply-black px-3 py-1 rounded-2xl shadow-hard rotate-[2deg] inline-block">Pioneer Access</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg font-bold text-swaply-black/80">
          Sign up for exclusive early access to live video call skill swapping, founder privileges, and early feature matching.
        </p>

        {/* LIVE REMAINING SLOTS BADGE */}
        <div className="mt-5 inline-flex items-center gap-3 bg-paper-card border-3 border-swaply-black px-4 py-2 rounded-2xl shadow-hard">
          <Users className="w-5 h-5 text-swaply-coral" />
          <span className="text-xs sm:text-sm font-black text-swaply-black">
            Pioneer Slots: <strong className="text-swaply-coral text-base font-extrabold">{status.remainingSlots}</strong> of <strong>{status.maxLimit}</strong> Remaining
          </span>
        </div>
      </div>

      {/* PAPER CARD CONTAINER */}
      <div className="neo-card rounded-3xl p-6 sm:p-10 bg-paper-cream relative bg-paper-grid border-3 shadow-hard-2xl">
        <BinderClip className="absolute -top-5 left-10" />
        <MaskingTape className="absolute -top-3 right-12" />

        <AnimatePresence mode="wait">
          {/* STEP 1: SINGLE TRACK FORM INPUT */}
          {step === 'form' && (
            <motion.form
              key="step-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleFormSubmit}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b-2 border-swaply-black/20 pb-4">
                <h3 className="text-xl font-black text-swaply-black flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-swaply-coral" />
                  Swaply Beta Pioneer Registration
                </h3>
                <span className="bg-swaply-black text-white px-3 py-1 rounded-full text-xs font-extrabold uppercase">
                  PIONEER MEMBER
                </span>
              </div>

              {isEmailLocked && (
                <div className="bg-swaply-yellow/30 border-2 border-swaply-black p-3 rounded-xl flex items-center gap-2 text-xs font-black text-swaply-black">
                  <Lock className="w-4 h-4 text-swaply-coral flex-shrink-0" />
                  <span>Verified Session Email: <u className="font-extrabold">{formData.email}</u> (Email locked from initial login)</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-swaply-black/80 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-paper-card border-2 border-swaply-black rounded-xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-swaply-black/80 mb-1">
                    Email Address * {isEmailLocked && <span className="text-[10px] text-swaply-coral font-black">(LOCKED)</span>}
                  </label>
                  <input
                    type="email"
                    required
                    readOnly={isEmailLocked}
                    placeholder="jordan@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      if (!isEmailLocked) setFormData({ ...formData, email: e.target.value });
                    }}
                    className={`w-full px-4 py-3 border-2 border-swaply-black rounded-xl text-sm font-bold shadow-hard-sm ${
                      isEmailLocked ? 'bg-paper-dark text-swaply-black/75 cursor-not-allowed border-dashed' : 'bg-paper-card text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-swaply-black/80 mb-1">Primary Skill Interest Focus</label>
                <select
                  value={formData.skillsToTest}
                  onChange={(e) => setFormData({ ...formData, skillsToTest: e.target.value })}
                  className="w-full px-4 py-3 bg-paper-card border-2 border-swaply-black rounded-xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm"
                >
                  <option>Web Dev & Coding Swaps</option>
                  <option>Design & UI/UX Swaps</option>
                  <option>Language Exchange Swaps</option>
                  <option>Music & Audio Production Swaps</option>
                  <option>All Skill Categories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-swaply-black/80 mb-1">What excites you about joining Swaply Beta?</label>
                <textarea
                  rows="3"
                  placeholder="Tell us what skills you want to learn or exchange..."
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 bg-paper-card border-2 border-swaply-black rounded-xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || status.registrationClosed}
                  className="w-full neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-3 border-swaply-black px-8 py-4 rounded-2xl text-lg font-black shadow-hard-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>Verify Email via 6-Digit OTP →</span>
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <motion.div
              key="step-otp"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-4 space-y-6"
            >
              <div className="w-16 h-16 bg-swaply-yellow border-3 border-swaply-black rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-hard">
                ✉️
              </div>

              <div>
                <h3 className="text-2xl font-black text-swaply-black">Enter 6-Digit Verification Code</h3>
                <p className="text-sm font-bold text-swaply-black/70 mt-1">
                  We sent a 6-digit OTP code to locked email <strong className="text-swaply-coral">{formData.email}</strong>
                </p>
              </div>

              {/* OTP INPUT COMPONENT */}
              <OtpInput
                length={6}
                disabled={loading}
                onComplete={(code) => {
                  setOtpValue(code);
                  handleVerifyOtp(code);
                }}
              />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || loading}
                  className="neo-btn bg-paper-card text-swaply-black px-5 py-2.5 rounded-xl text-xs font-black shadow-hard-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Verification Code'}
                </button>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={loading}
                  className="w-full sm:w-auto neo-btn bg-swaply-mint text-swaply-black px-8 py-3.5 rounded-xl text-base font-black shadow-hard disabled:opacity-50"
                >
                  Verify OTP & Confirm Registration →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: DONE & CONFIRMED TICKET PASS */}
          {step === 'success' && registeredUser && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="text-center py-6 space-y-6"
            >
              {/* DONE CHECKMARK STAMP BADGE */}
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-emerald-500 text-white border-3 border-swaply-black rounded-full mx-auto flex items-center justify-center text-4xl shadow-hard-lg">
                  <Check className="w-12 h-12 stroke-[3.5]" />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-swaply-yellow border-2 border-swaply-black text-swaply-black text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-hard-sm whitespace-nowrap">
                  DONE • VERIFIED
                </span>
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl font-black text-swaply-black">REGISTRATION CONFIRMED! 🎉</h3>
                <p className="text-sm font-bold text-swaply-black/80 max-w-md mx-auto mt-2">
                  Welcome aboard, <span className="text-swaply-coral font-black">{registeredUser.name}</span>! We sent a registration confirmation email to <strong className="text-swaply-black underline">{registeredUser.email}</strong>.
                </p>
              </div>

              {/* STRICT POLICY BADGE */}
              <div className="inline-flex items-center gap-2 bg-[#FFF2F2] text-[#BE4D4D] border-2 border-dashed border-[#BE4D4D] px-4 py-2 rounded-xl text-xs font-black mx-auto">
                <ShieldAlert className="w-4 h-4 text-[#BE4D4D]" />
                <span>Single Registration Policy: Email Locked to {registeredUser.email}</span>
              </div>

              {/* CONFIRMED PIONEER TICKET PASS */}
              <div className="max-w-md mx-auto bg-paper-card border-3 border-swaply-black rounded-2xl p-6 shadow-hard-2xl text-left relative overflow-hidden bg-paper-dots border-t-8 border-t-emerald-500">
                <div className="flex items-center justify-between mb-3 border-b-2 border-dashed border-swaply-black/20 pb-3">
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> STATUS: CONFIRMED
                  </span>
                  <span className="text-[10px] font-bold text-swaply-black/50">
                    {new Date(registeredUser.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-[10px] font-black uppercase text-swaply-black/60 block">Official Beta Pass ID</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-3xl font-black text-swaply-coral tracking-wider">{registeredUser.betaId}</span>
                    <button onClick={copyBetaId} className="p-1.5 hover:bg-swaply-black/10 rounded-lg transition-colors" title="Copy Beta ID">
                      <Copy className="w-4 h-4 text-swaply-black" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border-t-2 border-dashed border-swaply-black/30 pt-3">
                  <div>
                    <span className="font-bold text-swaply-black/60 block">Member Name</span>
                    <span className="font-black text-swaply-black text-sm">{registeredUser.name}</span>
                  </div>
                  <div>
                    <span className="font-bold text-swaply-black/60 block">Confirmation Email</span>
                    <span className="font-black text-emerald-700 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> Sent & Logged
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onBackToHome}
                  className="neo-btn bg-swaply-coral text-white border-3 border-swaply-black px-8 py-3.5 rounded-xl text-base font-black shadow-hard flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Swaply Homepage
                </button>

                {registeredUser?.email === 'founder@swaplyone.in' && (
                  <a
                    href="/admin"
                    className="neo-badge bg-swaply-yellow text-swaply-black px-5 py-3 rounded-xl text-xs font-black shadow-hard-sm flex items-center gap-1.5 hover:bg-swaply-coral hover:text-white transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" /> Admin Dashboard
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
