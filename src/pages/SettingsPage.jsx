import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, User, Mail, Shield, Power, Sparkles, ArrowLeft, CheckCircle2, Bell, Video, Mic, Lock, RefreshCw, Trash2, Key, Check } from 'lucide-react';
import { useMorphBar } from '../context/MorphBarContext';
import { BinderClip, MaskingTape } from '../components/PaperCraft';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { showMorphBar } = useMorphBar();

  const [session, setSession] = useState(null);
  const [registeredUser, setRegisteredUser] = useState(null);

  // Preference Toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoCamera, setAutoCamera] = useState(true);
  const [autoMic, setAutoMic] = useState(true);
  const [p2pPrivacy, setP2pPrivacy] = useState(true);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('swaply_user_session');
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }
    } catch (e) {}

    try {
      const savedReg = localStorage.getItem('swaply_registered_user');
      if (savedReg) {
        setRegisteredUser(JSON.parse(savedReg));
      }
    } catch (e) {}
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('swaply_user_session');
    localStorage.removeItem('swaply_registered_user');
    setSession(null);
    setRegisteredUser(null);
    showMorphBar({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been disconnected from your SwaplyOne session.'
    });
  };

  const handleSavePreferences = () => {
    showMorphBar({
      type: 'success',
      title: 'Preferences Saved',
      message: 'Your hardware and privacy settings have been updated.'
    });
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto relative selection:bg-swaply-yellow">
      
      {/* RETURN & HEADER ACTION BUTTONS */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/')}
          className="neo-btn bg-paper-cream hover:bg-paper-dark text-swaply-black border-2 border-swaply-black px-4 py-2.5 rounded-2xl text-xs font-black shadow-hard-sm flex items-center gap-2 cursor-pointer transition-all active:translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </button>

        {session ? (
          <button
            onClick={handleSignOut}
            className="neo-btn bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-800 border-2 border-swaply-black px-4 py-2.5 rounded-2xl text-xs font-black shadow-hard-sm flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5"
          >
            <Power className="w-4 h-4" /> Sign Out Session
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-2 border-swaply-black px-5 py-2.5 rounded-2xl text-xs font-black shadow-hard-sm cursor-pointer transition-all active:translate-y-0.5"
          >
            Sign In to Account →
          </button>
        )}
      </div>

      {/* PAGE HEADER */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 bg-swaply-yellow text-swaply-black border-2 border-swaply-black px-4 py-1.5 rounded-full shadow-hard text-xs font-black rotate-[-1deg] mb-3">
          <Settings className="w-4 h-4 text-swaply-coral fill-swaply-coral" />
          <span>SWAPLYONE PREFERENCES</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-swaply-black tracking-tight">
          Member <span className="bg-swaply-coral text-white border-2 border-swaply-black px-3 py-0.5 rounded-xl shadow-hard rotate-[1.5deg] inline-block">Settings</span>
        </h1>

        <p className="mt-3 text-xs sm:text-sm font-bold text-swaply-black/75 max-w-md mx-auto">
          Manage your login status, pioneer beta pass, hardware permissions, and WebRTC privacy settings.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* 1. LOGIN / LOGOUT STATUS CARD */}
        <div className="neo-card rounded-3xl p-6 sm:p-8 bg-paper-cream relative border-3 border-swaply-black shadow-hard">
          <BinderClip className="absolute -top-5 left-8" />

          <div className="flex flex-wrap items-center justify-between border-b-2 border-dashed border-swaply-black/20 pb-4 mb-4 gap-2">
            <h3 className="text-lg font-black text-swaply-black flex items-center gap-2">
              <User className="w-5 h-5 text-swaply-coral" />
              Account & Session Status
            </h3>

            {session ? (
              <span className="bg-emerald-100 text-emerald-900 border-2 border-emerald-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> LOGGED IN
              </span>
            ) : (
              <span className="bg-rose-100 text-rose-900 border-2 border-rose-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                NOT LOGGED IN
              </span>
            )}
          </div>

          {session ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white border-2 border-swaply-black p-4 rounded-2xl shadow-hard-sm">
                  <span className="font-bold text-swaply-black/60 uppercase text-[10px] block mb-1">Account Email</span>
                  <span className="font-black text-swaply-black text-sm flex items-center gap-1.5 truncate">
                    <Mail className="w-4 h-4 text-swaply-coral flex-shrink-0" /> {session.email}
                  </span>
                </div>

                <div className="bg-white border-2 border-swaply-black p-4 rounded-2xl shadow-hard-sm">
                  <span className="font-bold text-swaply-black/60 uppercase text-[10px] block mb-1">Beta Pass Status</span>
                  <span className="font-black text-swaply-coral text-sm flex items-center gap-1.5 truncate">
                    <Sparkles className="w-4 h-4 text-swaply-yellow fill-swaply-yellow flex-shrink-0" />
                    {registeredUser?.betaId || 'Verification Pending'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => navigate('/beta')}
                  className="neo-btn bg-swaply-yellow hover:bg-swaply-craft text-swaply-black border-2 border-swaply-black px-5 py-3 rounded-2xl text-xs font-black shadow-hard cursor-pointer transition-all active:translate-y-0.5 flex items-center gap-1.5"
                >
                  <span>View Beta Ticket Pass →</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="neo-btn bg-white hover:bg-rose-50 text-rose-700 border-2 border-swaply-black px-4 py-2.5 rounded-2xl text-xs font-black shadow-hard-sm flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5"
                >
                  <Power className="w-3.5 h-3.5" /> Disconnect Session
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <p className="text-xs font-bold text-swaply-black/70 max-w-sm mx-auto">
                You are currently browsing as a guest. Sign in to access 1-on-1 video call rooms and beta pioneer privileges.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-2 border-swaply-black px-6 py-3.5 rounded-2xl text-xs font-black shadow-hard cursor-pointer transition-all active:translate-y-0.5 inline-flex items-center gap-2"
              >
                <span>Sign In to Your Account →</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. HARDWARE & PRIVACY PREFERENCES */}
        <div className="neo-card rounded-3xl p-6 sm:p-8 bg-paper-cream relative border-3 border-swaply-black shadow-hard">
          <MaskingTape className="absolute -top-3 right-10" />

          <div className="border-b-2 border-dashed border-swaply-black/20 pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-swaply-black flex items-center gap-2">
              <Shield className="w-5 h-5 text-swaply-coral" />
              Hardware & Privacy Controls
            </h3>
            <span className="text-[10px] font-black text-swaply-black/60 uppercase tracking-wider bg-white border border-swaply-black px-2.5 py-0.5 rounded-full">
              WebRTC P2P
            </span>
          </div>

          <div className="space-y-3.5">
            {/* EMAIL ALERTS */}
            <label className="flex items-center justify-between p-4 bg-white border-2 border-swaply-black rounded-2xl shadow-hard-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-swaply-yellow/30 border-2 border-swaply-black rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 text-swaply-black" />
                </div>
                <div>
                  <span className="text-xs font-black text-swaply-black block">Email Verification Alerts</span>
                  <span className="text-[11px] font-bold text-swaply-black/60">Receive 6-digit OTP codes and beta updates</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-swaply-black text-swaply-coral cursor-pointer focus:ring-0"
              />
            </label>

            {/* CAMERA PERMISSION */}
            <label className="flex items-center justify-between p-4 bg-white border-2 border-swaply-black rounded-2xl shadow-hard-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 border-2 border-swaply-black rounded-xl flex items-center justify-center">
                  <Video className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <span className="text-xs font-black text-swaply-black block">Auto Camera Permission</span>
                  <span className="text-[11px] font-bold text-swaply-black/60">Enable HD video stream upon entering room</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoCamera}
                onChange={(e) => setAutoCamera(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-swaply-black text-swaply-coral cursor-pointer focus:ring-0"
              />
            </label>

            {/* MICROPHONE PERMISSION */}
            <label className="flex items-center justify-between p-4 bg-white border-2 border-swaply-black rounded-2xl shadow-hard-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 border-2 border-swaply-black rounded-xl flex items-center justify-center">
                  <Mic className="w-4 h-4 text-amber-800" />
                </div>
                <div>
                  <span className="text-xs font-black text-swaply-black block">Auto Microphone Permission</span>
                  <span className="text-[11px] font-bold text-swaply-black/60">Enable WebRTC audio input on call start</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoMic}
                onChange={(e) => setAutoMic(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-swaply-black text-swaply-coral cursor-pointer focus:ring-0"
              />
            </label>

            {/* SAVE BUTTON */}
            <div className="pt-3">
              <button
                onClick={handleSavePreferences}
                className="w-full neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-2 border-swaply-black py-3.5 rounded-2xl text-xs font-black shadow-hard cursor-pointer transition-all active:translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Save System Preferences
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
