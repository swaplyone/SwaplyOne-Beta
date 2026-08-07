import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, UserCheck, CheckCircle2, ArrowLeft, Send, Lock, Copy, RefreshCw, Users, ShieldCheck, Mail, Check, ShieldAlert, AtSign, Globe, Briefcase, FileText } from 'lucide-react';
import { useMorphBar } from '../context/MorphBarContext';
import { OtpInput } from './OtpInput';

export default function BetaTesterPage({ onBackToHome, onOpenJoinModal }) {
  const { showMorphBar } = useMorphBar();
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'success'

  // Structured Beta Registration Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    occupation: 'Student',
    country: 'United States',
    referralSource: 'Social Media',
    betaReason: '',
    agreeTerms: true,
    agreePrivacy: true,
    agreeUpdates: true
  });

  const [isEmailLocked, setIsEmailLocked] = useState(false);

  // Live Username Availability Check State
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: true,
    message: ''
  });
  const usernameCheckTimeout = useRef(null);

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
          const parts = (session.name || '').split(' ');
          const fName = parts[0] || '';
          const lName = parts.slice(1).join(' ') || '';
          const uName = session.email.split('@')[0].replace(/[^a-z0-9_]/g, '');

          setFormData(prev => ({
            ...prev,
            firstName: prev.firstName || fName,
            lastName: prev.lastName || lName,
            username: prev.username || uName,
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

  // Live Username Availability Checker
  const handleUsernameChange = (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setFormData(prev => ({ ...prev, username: clean }));

    if (!clean || clean.length < 3) {
      setUsernameStatus({ checking: false, available: true, message: '' });
      return;
    }

    setUsernameStatus({ checking: true, available: true, message: 'Checking availability...' });

    if (usernameCheckTimeout.current) clearTimeout(usernameCheckTimeout.current);

    usernameCheckTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        setUsernameStatus({
          checking: false,
          available: data.available,
          message: data.message
        });
      } catch (err) {
        setUsernameStatus({ checking: false, available: true, message: 'Username valid.' });
      }
    }, 350);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/beta/status');
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (err) {
      console.warn('Status fetch error:', err.message);
    }
  };

  // STEP 1: Submit Form -> Send OTP Code & Switch to OTP Screen
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showMorphBar({
        type: 'error',
        title: 'Missing Name',
        message: 'Please enter your First Name and Last Name.'
      });
      return;
    }

    if (!formData.username.trim()) {
      showMorphBar({
        type: 'error',
        title: 'Missing Username',
        message: 'Please choose a unique username handle.'
      });
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      showMorphBar({
        type: 'error',
        title: 'Valid Email Required',
        message: 'Please enter a valid email address.'
      });
      return;
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      showMorphBar({
        type: 'warning',
        title: 'Agreements Required',
        message: 'Please accept Terms & Conditions and Privacy Policy.'
      });
      return;
    }

    setLoading(true);
    showMorphBar({
      type: 'loading',
      title: 'Sending Verification Code...',
      message: `Sending 6-digit OTP code to ${formData.email}`
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
          title: 'Code Sent!',
          message: `6-digit code sent to ${formData.email}`,
          duration: 5000
        });
        setCooldown(data.cooldownSeconds || 60);
        setStep('otp');
      } else {
        showMorphBar({
          type: 'error',
          title: 'Unable to Send Code',
          message: data.message || 'Error requesting verification code.'
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

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    showMorphBar({
      type: 'loading',
      title: 'Resending Verification Code...',
      message: `Sending new OTP code to ${formData.email}`
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
          title: 'Code Resent!',
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

  // STEP 2: Verify OTP & Claim Beta Pass
  const handleVerifyOtp = async (codeToVerify) => {
    const code = codeToVerify || otpValue;
    if (!code || code.length < 6) {
      showMorphBar({
        type: 'warning',
        title: 'Enter 6 Digits',
        message: 'Please enter all 6 digits of your code.'
      });
      return;
    }

    setLoading(true);
    showMorphBar({
      type: 'loading',
      title: 'Verifying Code...',
      message: 'Checking code against secure verification server'
    });

    try {
      const verifyRes = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: code })
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        showMorphBar({
          type: 'error',
          title: 'Verification Failed',
          message: verifyData.message || 'Incorrect verification code.'
        });
        setLoading(false);
        return;
      }

      showMorphBar({
        type: 'success',
        title: 'Email Verified!',
        message: 'Issuing your Pioneer Beta Pass...'
      });

      const regRes = await fetch('/api/beta/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          occupation: formData.occupation,
          country: formData.country,
          referralSource: formData.referralSource,
          betaReason: formData.betaReason,
          track: 'pioneer',
          verificationToken: verifyData.verificationToken
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
          title: '🎉 Beta Pass Claimed!',
          message: `Confirmation email sent to ${regData.user.email}. Beta Pass: ${regData.user.betaId}`,
          duration: 7000
        });

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
          message: regData.message || 'Unable to complete registration.'
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
    <div className="min-h-screen bg-paper pt-20 sm:pt-24 pb-20 px-3.5 sm:px-6 lg:px-8 max-w-2xl mx-auto relative overflow-hidden">
      
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute top-10 right-1/2 translate-x-1/2 w-96 h-96 bg-swaply-yellow/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <div className="text-center mb-6 space-y-2">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-black text-swaply-black/70 hover:text-swaply-coral mb-1 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </button>

        <h1 className="text-3xl sm:text-4xl font-black text-swaply-black tracking-tight leading-tight">
          Claim Your Beta Pass
        </h1>
        <p className="text-xs sm:text-sm font-bold text-swaply-black/75 max-w-sm mx-auto">
          Complete your profile details to receive your 1-on-1 video Beta Pass.
        </p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ==================== STEP 1: SINGLE-PAGE REGISTRATION FORM ==================== */}
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-paper-cream border-3 border-swaply-black rounded-3xl p-5 sm:p-7 shadow-hard relative">

              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* 1. BASIC INFORMATION */}
                <div className="space-y-3.5">
                  <div className="border-b-2 border-dashed border-swaply-black/20 pb-2">
                    <span className="text-xs font-black uppercase text-swaply-black tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-swaply-coral" /> Basic Information
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* FIRST NAME */}
                    <div>
                      <label className="block text-xs font-black uppercase text-swaply-black mb-1">
                        First Name <span className="text-swaply-coral">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jordan"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full bg-white border-2 border-swaply-black rounded-2xl px-4 py-3 text-base sm:text-sm font-bold text-swaply-black placeholder:text-swaply-black/40 focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm"
                      />
                    </div>

                    {/* LAST NAME */}
                    <div>
                      <label className="block text-xs font-black uppercase text-swaply-black mb-1">
                        Last Name <span className="text-swaply-coral">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Smith"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full bg-white border-2 border-swaply-black rounded-2xl px-4 py-3 text-base sm:text-sm font-bold text-swaply-black placeholder:text-swaply-black/40 focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm"
                      />
                    </div>
                  </div>

                  {/* USERNAME WITH LIVE AVAILABILITY CHECK */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-black uppercase text-swaply-black flex items-center gap-1">
                        <AtSign className="w-3.5 h-3.5 text-swaply-coral" /> Username <span className="text-swaply-coral">*</span>
                      </label>
                      {usernameStatus.message && (
                        <span className={`text-[11px] font-extrabold flex items-center gap-1 ${
                          usernameStatus.checking ? 'text-amber-700' : usernameStatus.available ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {usernameStatus.checking && <RefreshCw className="w-3 h-3 animate-spin" />}
                          {usernameStatus.available === true && <Check className="w-3 h-3" />}
                          {usernameStatus.available === false && <ShieldAlert className="w-3 h-3" />}
                          {usernameStatus.message}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-swaply-black/50 text-sm">@</span>
                      <input
                        type="text"
                        required
                        placeholder="jordansmith"
                        value={formData.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        className="w-full bg-white border-2 border-swaply-black rounded-2xl pl-8 pr-4 py-3 text-base sm:text-sm font-bold text-swaply-black placeholder:text-swaply-black/40 focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm"
                      />
                    </div>
                  </div>

                  {/* EMAIL ADDRESS */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-black uppercase text-swaply-black flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-swaply-coral" /> Email Address <span className="text-swaply-coral">*</span>
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
                      className={`w-full border-2 border-swaply-black rounded-2xl px-4 py-3 text-base sm:text-sm font-bold shadow-hard-sm focus:outline-none ${
                        isEmailLocked ? 'bg-slate-100 text-swaply-black/70 cursor-not-allowed' : 'bg-white text-swaply-black focus:ring-2 focus:ring-swaply-yellow'
                      }`}
                    />
                  </div>
                </div>

                {/* 2. ABOUT YOU */}
                <div className="space-y-3.5 pt-2">
                  <div className="border-b-2 border-dashed border-swaply-black/20 pb-2">
                    <span className="text-xs font-black uppercase text-swaply-black tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-swaply-coral" /> About You
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* OCCUPATION */}
                    <div>
                      <label className="block text-xs font-black uppercase text-swaply-black mb-1">
                        Occupation <span className="text-swaply-coral">*</span>
                      </label>
                      <select
                        value={formData.occupation}
                        onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                        className="w-full bg-white border-2 border-swaply-black rounded-2xl px-4 py-3 text-base sm:text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm cursor-pointer"
                      >
                        <option value="Student">Student</option>
                        <option value="Working Professional">Working Professional</option>
                        <option value="Freelancer">Freelancer</option>
                        <option value="Founder">Founder</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* COUNTRY */}
                    <div>
                      <label className="block text-xs font-black uppercase text-swaply-black mb-1 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-swaply-coral" /> Country <span className="text-swaply-coral">*</span>
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full bg-white border-2 border-swaply-black rounded-2xl px-4 py-3 text-base sm:text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm cursor-pointer"
                      >
                        <option value="United States">United States</option>
                        <option value="India">India</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                        <option value="Australia">Australia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Other Country">Other Country</option>
                      </select>
                    </div>
                  </div>

                  {/* HOW DID YOU HEAR ABOUT SWAPLYONE */}
                  <div>
                    <label className="block text-xs font-black uppercase text-swaply-black mb-1">
                      How did you hear about SwaplyOne?
                    </label>
                    <select
                      value={formData.referralSource}
                      onChange={(e) => setFormData(prev => ({ ...prev, referralSource: e.target.value }))}
                      className="w-full bg-white border-2 border-swaply-black rounded-2xl px-4 py-3 text-base sm:text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm cursor-pointer"
                    >
                      <option value="Social Media">Social Media (X / LinkedIn / Instagram)</option>
                      <option value="Friend / Referral">Friend or Colleague Referral</option>
                      <option value="Tech Community">Tech Community / Developer Forum</option>
                      <option value="Search Engine">Search Engine (Google / Bing)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* WHY JOIN BETA (MAX 300 CHARS) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-black uppercase text-swaply-black">
                        Why do you want to join the beta? <span className="text-swaply-black/50">(Optional)</span>
                      </label>
                      <span className={`text-[11px] font-black ${formData.betaReason.length > 280 ? 'text-rose-700' : 'text-swaply-black/60'}`}>
                        {formData.betaReason.length} / 300
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={300}
                      placeholder="Tell us what skills you want to exchange during 1-on-1 video calls..."
                      value={formData.betaReason}
                      onChange={(e) => setFormData(prev => ({ ...prev, betaReason: e.target.value }))}
                      className="w-full bg-white border-2 border-swaply-black rounded-2xl p-3.5 text-base sm:text-sm font-bold text-swaply-black placeholder:text-swaply-black/40 focus:outline-none focus:ring-2 focus:ring-swaply-yellow shadow-hard-sm"
                    />
                  </div>
                </div>

                {/* 3. AGREEMENTS CHECKBOXES */}
                <div className="space-y-2 pt-2 border-t-2 border-dashed border-swaply-black/20">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-swaply-black select-none">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                      className="w-4 h-4 rounded border-2 border-swaply-black text-swaply-coral focus:ring-0 cursor-pointer mt-0.5"
                    />
                    <span>I agree to the Terms & Conditions <span className="text-swaply-coral">*</span></span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-swaply-black select-none">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agreePrivacy}
                      onChange={(e) => setFormData(prev => ({ ...prev, agreePrivacy: e.target.checked }))}
                      className="w-4 h-4 rounded border-2 border-swaply-black text-swaply-coral focus:ring-0 cursor-pointer mt-0.5"
                    />
                    <span>I agree to the Privacy Policy <span className="text-swaply-coral">*</span></span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-swaply-black/80 select-none">
                    <input
                      type="checkbox"
                      checked={formData.agreeUpdates}
                      onChange={(e) => setFormData(prev => ({ ...prev, agreeUpdates: e.target.checked }))}
                      className="w-4 h-4 rounded border-2 border-swaply-black text-swaply-coral focus:ring-0 cursor-pointer mt-0.5"
                    />
                    <span>I agree to receive beta updates via email (Optional)</span>
                  </label>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || status.registrationClosed}
                    className="w-full neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-2 border-swaply-black py-4 rounded-2xl text-sm font-black shadow-hard flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Sending OTP Code...</span>
                    ) : (
                      <>
                        <span>Send OTP Verification Code →</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </motion.div>
        )}

        {/* ==================== STEP 2: OTP VERIFICATION SCREEN ==================== */}
        {step === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-paper-cream border-3 border-swaply-black rounded-3xl p-6 sm:p-8 shadow-hard relative text-center space-y-5">
              
              <div className="w-14 h-14 bg-swaply-yellow border-2 border-swaply-black rounded-2xl mx-auto flex items-center justify-center shadow-hard-sm">
                <Mail className="w-7 h-7 text-swaply-black" />
              </div>

              <div>
                <h3 className="text-xl font-black text-swaply-black">Enter Verification Code</h3>
                <p className="text-xs font-bold text-swaply-black/70 mt-1">
                  We have sent a 6-digit code to <strong className="text-swaply-coral">{formData.email}</strong>.
                </p>
              </div>

              {/* 6-DIGIT OTP INPUT */}
              <div className="py-2">
                <OtpInput
                  value={otpValue}
                  onChange={setOtpValue}
                  onComplete={(code) => handleVerifyOtp(code)}
                />
              </div>

              {/* VERIFY BUTTON */}
              <button
                onClick={() => handleVerifyOtp()}
                disabled={loading || otpValue.length < 6}
                className="w-full neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-2 border-swaply-black py-3.5 rounded-2xl text-sm font-black shadow-hard flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <span>Verifying Code...</span> : <span>Verify & Claim Beta Pass →</span>}
              </button>

              {/* RESEND & CHANGE EMAIL OPTIONS */}
              <div className="flex items-center justify-between text-xs font-black pt-2 border-t border-dashed border-swaply-black/20">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || loading}
                  className="text-swaply-coral hover:underline disabled:opacity-40"
                >
                  {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-swaply-black/70 hover:text-swaply-black"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== STEP 3: REGISTRATION CONFIRMED TICKET PASS ==================== */}
        {step === 'success' && registeredUser && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto space-y-6 text-center"
          >
            {/* OFFICIAL PIONEER TICKET PASS */}
            <div className="bg-paper-cream border-3 border-swaply-black rounded-3xl p-6 sm:p-8 shadow-hard relative overflow-hidden text-left space-y-5">
              
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
                  <h3 className="text-xl font-black text-swaply-black">
                    {registeredUser.name} <span className="text-xs font-bold text-swaply-coral">(@{registeredUser.username || registeredUser.name.toLowerCase().replace(/\s+/g, '')})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-swaply-black/60 block">OCCUPATION</span>
                    <p className="font-bold text-swaply-black">{registeredUser.occupation || 'Member'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-swaply-black/60 block">COUNTRY</span>
                    <p className="font-bold text-swaply-black">{registeredUser.country || 'Global'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-swaply-black/60 block">REGISTERED EMAIL</span>
                  <p className="text-sm font-bold text-swaply-black truncate">{registeredUser.email}</p>
                </div>
              </div>

              <div className="bg-emerald-100 border-2 border-emerald-600 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-emerald-900">Registration Completed!</h4>
                  <p className="text-[11px] font-bold text-emerald-800">
                    Welcome email sent to <strong>{registeredUser.email}</strong>.
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
