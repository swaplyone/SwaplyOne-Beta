import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Lock, Mail, Eye, EyeOff, CheckCircle2, ArrowLeft, KeyRound, User, UserPlus } from 'lucide-react';
import { useMorphBar } from '../context/MorphBarContext';
import { BinderClip, MaskingTape } from '../components/PaperCraft';

export default function LoginPage() {
  const navigate = useNavigate();
  const { showMorphBar } = useMorphBar();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('swaply_user_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session && session.email) {
          setActiveSession(session);
          setEmail(session.email || '');
          setName(session.name || '');
        }
      }
    } catch (e) {}
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      showMorphBar({
        type: 'error',
        title: 'Missing Email',
        message: 'Please enter your account email address.'
      });
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'founder@swaplyone.in';

    const userSession = {
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      isAdmin: isAdmin,
      loggedInAt: new Date().toISOString()
    };

    localStorage.setItem('swaply_user_session', JSON.stringify(userSession));

    showMorphBar({
      type: 'success',
      title: 'Login Successful',
      message: isAdmin ? 'Welcome back, Founder! Admin privileges active.' : `Logged in as ${cleanEmail}.`,
      duration: 4000
    });

    setTimeout(() => {
      setLoading(false);
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/beta');
      }
    }, 500);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) {
      showMorphBar({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please enter your full name and valid email address.'
      });
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const userSession = {
      name: cleanName,
      email: cleanEmail,
      loggedInAt: new Date().toISOString()
    };

    localStorage.setItem('swaply_user_session', JSON.stringify(userSession));

    showMorphBar({
      type: 'success',
      title: 'Account Created',
      message: `Session initialized for ${cleanEmail}. Proceeding to Beta verification...`,
      duration: 4000
    });

    setTimeout(() => {
      setLoading(false);
      navigate('/beta');
    }, 500);
  };

  const handleSignOut = () => {
    localStorage.removeItem('swaply_user_session');
    localStorage.removeItem('swaply_registered_user');
    setActiveSession(null);
    setEmail('');
    setName('');
    setPassword('');
    showMorphBar({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been disconnected from your Swaply session.'
    });
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto relative selection:bg-swaply-yellow">
      
      {/* NAVIGATION RETURN BUTTON */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="neo-btn bg-paper-cream hover:bg-paper-dark text-swaply-black px-4 py-2 rounded-xl text-xs font-bold shadow-hard-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Swaply Homepage
        </button>
      </div>

      {/* PAGE HEADER */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 bg-swaply-yellow text-swaply-black border-3 border-swaply-black px-4 py-1.5 rounded-full shadow-hard text-xs font-black rotate-[-1deg] mb-3">
          <Sparkles className="w-4 h-4 text-swaply-coral fill-swaply-coral" />
          <span>SWAPLY PORTAL</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-swaply-black tracking-tight">
          {activeTab === 'login' ? (
            <>Sign In to <span className="bg-swaply-coral text-white border-2 border-swaply-black px-3 py-0.5 rounded-xl shadow-hard rotate-[1.5deg] inline-block">Swaply</span></>
          ) : (
            <>Create Your <span className="bg-swaply-yellow text-swaply-black border-2 border-swaply-black px-3 py-0.5 rounded-xl shadow-hard rotate-[-1.5deg] inline-block">Account</span></>
          )}
        </h1>

        <p className="mt-3 text-sm font-bold text-swaply-black/75 max-w-xs mx-auto">
          {activeTab === 'login'
            ? 'Access your account or admin dashboard console.'
            : 'Register your profile details to claim your Pioneer Beta Pass.'}
        </p>
      </div>

      {/* LOGIN / REGISTER TABS */}
      <div className="flex rounded-2xl bg-paper-card border-3 border-swaply-black p-1.5 shadow-hard mb-6">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'login'
              ? 'bg-swaply-coral text-white border-2 border-swaply-black shadow-hard-sm'
              : 'text-swaply-black/70 hover:text-swaply-black'
          }`}
        >
          <User className="w-4 h-4" /> Sign In
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'register'
              ? 'bg-swaply-yellow text-swaply-black border-2 border-swaply-black shadow-hard-sm'
              : 'text-swaply-black/70 hover:text-swaply-black'
          }`}
        >
          <UserPlus className="w-4 h-4" /> Register Account
        </button>
      </div>

      {/* LOGIN / REGISTER PAPER CARD */}
      <div className="neo-card rounded-3xl p-6 sm:p-8 bg-paper-cream relative bg-paper-grid border-3 shadow-hard-2xl">
        <BinderClip className="absolute -top-5 left-10" />
        <MaskingTape className="absolute -top-3 right-12" />

        {activeSession ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 bg-swaply-mint border-3 border-swaply-black rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-hard">
              <CheckCircle2 className="w-9 h-9 text-swaply-black" />
            </div>

            <div>
              <span className="bg-swaply-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                CURRENTLY LOGGED IN
              </span>
              <h3 className="text-2xl font-black text-swaply-black mt-2">Active Session Found</h3>
              <p className="text-xs font-bold text-swaply-black/70 mt-1">
                Account Email: <strong className="text-swaply-coral">{activeSession.email}</strong>
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => navigate(activeSession.isAdmin ? '/admin' : '/beta')}
                className="w-full neo-btn bg-swaply-coral text-white border-3 border-swaply-black px-6 py-3.5 rounded-xl text-sm font-black shadow-hard flex items-center justify-center gap-2"
              >
                <span>Continue to {activeSession.isAdmin ? 'Admin Dashboard' : 'Beta Portal'} →</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full neo-btn bg-paper-card text-swaply-black border-2 border-swaply-black px-5 py-3 rounded-xl text-xs font-bold shadow-hard-sm"
              >
                Sign Out / Switch Account
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: SIGN IN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="border-b-2 border-swaply-black/20 pb-3 flex items-center justify-between">
                  <span className="text-sm font-black text-swaply-black flex items-center gap-2">
                    <Lock className="w-4 h-4 text-swaply-coral" /> Member Sign In
                  </span>
                  <span className="text-[10px] font-black text-swaply-black/50 uppercase tracking-wider">
                    SECURE ACCESS
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-swaply-black/80 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-swaply-coral" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-paper-card border-2 border-swaply-black rounded-xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-swaply-black/80 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-swaply-coral" /> Password / Passcode
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-paper-card border-2 border-swaply-black rounded-xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-swaply-black/60 hover:text-swaply-black"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-swaply-black/80 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-swaply-black text-swaply-coral focus:ring-0 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-swaply-coral hover:underline font-black"
                  >
                    Need an account? Register →
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-3 border-swaply-black px-8 py-4 rounded-2xl text-base font-black shadow-hard-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Sign In to Account →</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="border-b-2 border-swaply-black/20 pb-3 flex items-center justify-between">
                  <span className="text-sm font-black text-swaply-black flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-swaply-coral" /> Create New Member Profile
                  </span>
                  <span className="text-[10px] font-black text-swaply-black/50 uppercase tracking-wider">
                    NEW REGISTRATION
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-swaply-black/80 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-swaply-coral" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-paper-card border-2 border-swaply-black rounded-xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-swaply-black/80 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-swaply-coral" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-paper-card border-2 border-swaply-black rounded-xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm"
                  />
                </div>

                <div className="bg-swaply-yellow/20 border-2 border-dashed border-swaply-black/30 p-3 rounded-xl text-xs font-bold text-swaply-black/75 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-swaply-coral flex-shrink-0" />
                  <span>Email will be verified with a 6-digit OTP code on the Beta page to prevent fake accounts.</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full neo-btn bg-swaply-yellow hover:bg-swaply-craft text-swaply-black border-3 border-swaply-black px-8 py-4 rounded-2xl text-base font-black shadow-hard-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Create Account & Verify OTP →</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

    </div>
  );
}
