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

  // SIGN IN WITH PASSWORD VERIFICATION VIA FIREBASE/API
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showMorphBar({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please enter both your email address and password.'
      });
      return;
    }

    setLoading(true);
    showMorphBar({
      type: 'loading',
      title: 'Verifying Credentials...',
      message: 'Connecting to secure authentication server...'
    });

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('swaply_user_session', JSON.stringify(data.user));
        showMorphBar({
          type: 'success',
          title: 'Sign In Successful',
          message: data.user.isAdmin ? 'Welcome Founder! Admin console unlocked.' : `Welcome back, ${data.user.name}! Redirecting to Home...`,
          duration: 4000
        });

        setTimeout(() => {
          setLoading(false);
          if (data.user.isAdmin) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 500);
      } else {
        showMorphBar({
          type: 'error',
          title: 'Authentication Failed',
          message: data.message || 'Invalid email or password.'
        });
        setLoading(false);
      }
    } catch (err) {
      showMorphBar({
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to authentication server.'
      });
      setLoading(false);
    }
  };

  // CREATE NEW ACCOUNT WITH PASSWORD SAVED IN FIREBASE/DB
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showMorphBar({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please enter your full name, email address, and password.'
      });
      return;
    }

    if (password.length < 6) {
      showMorphBar({
        type: 'warning',
        title: 'Weak Password',
        message: 'Password must be at least 6 characters long.'
      });
      return;
    }

    setLoading(true);
    showMorphBar({
      type: 'loading',
      title: 'Creating Account...',
      message: 'Securing account credentials...'
    });

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('swaply_user_session', JSON.stringify(data.user));
        showMorphBar({
          type: 'success',
          title: '🎉 Account Created Successfully!',
          message: `Welcome @${data.user.name}! Redirecting to Home...`,
          duration: 4000
        });

        setTimeout(() => {
          setLoading(false);
          navigate('/');
        }, 500);
      } else {
        showMorphBar({
          type: 'error',
          title: 'Registration Failed',
          message: data.message || 'Unable to register account.'
        });
        setLoading(false);
      }
    } catch (err) {
      showMorphBar({
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to authentication server.'
      });
      setLoading(false);
    }
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
    <div className="min-h-screen pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto relative selection:bg-swaply-yellow">
      
      {/* NAVIGATION RETURN BUTTON */}
      <div className="mb-5">
        <button
          onClick={() => navigate('/')}
          className="neo-btn bg-paper-cream hover:bg-paper-dark text-swaply-black px-4 py-2 rounded-xl text-xs font-bold shadow-hard-sm flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </button>
      </div>

      {/* PAGE HEADER */}
      <div className="text-center mb-6 relative">
        <div className="inline-flex items-center gap-2 bg-swaply-yellow text-swaply-black border-2 border-swaply-black px-4 py-1 rounded-full shadow-hard-sm text-xs font-black mb-2">
          <Sparkles className="w-3.5 h-3.5 text-swaply-coral fill-swaply-coral" />
          <span>SWAPLY AUTHENTICATION</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-swaply-black tracking-tight">
          {activeTab === 'login' ? 'Sign In to Swaply' : 'Create Your Account'}
        </h1>

        <p className="mt-2 text-xs sm:text-sm font-bold text-swaply-black/75 max-w-xs mx-auto">
          {activeTab === 'login'
            ? 'Sign in with your email and password credentials.'
            : 'Register your secure member account.'}
        </p>
      </div>

      {/* LOGIN / REGISTER TABS */}
      <div className="flex rounded-2xl bg-paper-card border-2 border-swaply-black p-1.5 shadow-hard mb-5">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'login'
              ? 'bg-swaply-coral text-white border border-swaply-black shadow-hard-sm'
              : 'text-swaply-black/70 hover:text-swaply-black'
          }`}
        >
          <User className="w-4 h-4" /> Sign In
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'register'
              ? 'bg-swaply-yellow text-swaply-black border border-swaply-black shadow-hard-sm'
              : 'text-swaply-black/70 hover:text-swaply-black'
          }`}
        >
          <UserPlus className="w-4 h-4" /> Register Account
        </button>
      </div>

      {/* LOGIN / REGISTER CARD */}
      <div className="neo-card rounded-3xl p-6 sm:p-8 bg-paper-cream border-3 border-swaply-black shadow-hard-2xl relative">

        {activeSession ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 bg-swaply-mint border-2 border-swaply-black rounded-2xl mx-auto flex items-center justify-center shadow-hard-sm">
              <CheckCircle2 className="w-8 h-8 text-swaply-black" />
            </div>

            <div>
              <span className="bg-swaply-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                CURRENTLY LOGGED IN
              </span>
              <h3 className="text-xl font-black text-swaply-black mt-2">Active Session Found</h3>
              <p className="text-xs font-bold text-swaply-black/70 mt-1">
                Account Email: <strong className="text-swaply-coral">{activeSession.email}</strong>
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => navigate(activeSession.isAdmin ? '/admin' : '/')}
                className="w-full neo-btn bg-swaply-coral text-white border-2 border-swaply-black py-3.5 rounded-2xl text-xs font-black shadow-hard flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to {activeSession.isAdmin ? 'Admin Console' : 'Homepage'} →</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full neo-btn bg-paper-card text-swaply-black border-2 border-swaply-black py-3 rounded-2xl text-xs font-bold shadow-hard-sm cursor-pointer"
              >
                Sign Out / Switch Account
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: SIGN IN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="border-b-2 border-swaply-black/20 pb-3 flex items-center justify-between">
                  <span className="text-xs font-black text-swaply-black flex items-center gap-1.5 uppercase">
                    <Lock className="w-4 h-4 text-swaply-coral" /> Member Sign In
                  </span>
                  <span className="text-[10px] font-black text-swaply-black/50 uppercase">
                    PASSWORD REQUIRED
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-swaply-black mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-swaply-coral" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-swaply-black rounded-2xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-swaply-black mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-swaply-coral" /> Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter account password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-swaply-black rounded-2xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-swaply-black/60 hover:text-swaply-black cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-swaply-black pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
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
                    className="text-swaply-coral hover:underline font-black cursor-pointer"
                  >
                    Need an account? Register →
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-2 border-swaply-black py-4 rounded-2xl text-sm font-black shadow-hard flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <span>Verifying Password...</span> : <span>Sign In & Go to Home →</span>}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="border-b-2 border-swaply-black/20 pb-3 flex items-center justify-between">
                  <span className="text-xs font-black text-swaply-black flex items-center gap-1.5 uppercase">
                    <UserPlus className="w-4 h-4 text-swaply-coral" /> Create Account Profile
                  </span>
                  <span className="text-[10px] font-black text-swaply-black/50 uppercase">
                    DIRECT REGISTRATION
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-swaply-black mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-swaply-coral" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-swaply-black rounded-2xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-swaply-black mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-swaply-coral" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-swaply-black rounded-2xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-swaply-black mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-swaply-coral" /> Set Password * <span className="text-[10px] font-normal text-swaply-black/60">(min 6 chars)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Create a secure password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-swaply-black rounded-2xl text-sm font-bold text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-swaply-black/60 hover:text-swaply-black cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-swaply-yellow/20 border-2 border-dashed border-swaply-black/30 p-3 rounded-2xl text-[11px] font-bold text-swaply-black/80 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-swaply-coral flex-shrink-0" />
                  <span>Saves your credentials in Firebase database. Redirects directly to Homepage.</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full neo-btn bg-swaply-yellow hover:bg-swaply-craft text-swaply-black border-2 border-swaply-black py-4 rounded-2xl text-sm font-black shadow-hard flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <span>Securing Account...</span> : <span>Create Account & Go to Home →</span>}
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
