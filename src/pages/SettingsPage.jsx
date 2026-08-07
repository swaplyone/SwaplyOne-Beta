import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, User, Mail, Shield, Power, Sparkles, ArrowLeft, CheckCircle2, Bell, Video, Mic, Lock, RefreshCw, Trash2 } from 'lucide-react';
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
      message: 'You have been disconnected from your Swaply session.'
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
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto relative selection:bg-swaply-yellow">
      
      {/* RETURN BUTTON */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="neo-btn bg-paper-cream hover:bg-paper-dark text-swaply-black px-4 py-2 rounded-xl text-xs font-bold shadow-hard-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </button>

        {session ? (
          <button
            onClick={handleSignOut}
            className="neo-btn bg-[#FFF0EB] hover:bg-swaply-coral hover:text-white text-[#BE4D4D] border-2 border-[#BE4D4D] px-4 py-2 rounded-xl text-xs font-black shadow-hard-sm flex items-center gap-1.5 transition-colors"
          >
            <Power className="w-3.5 h-3.5" /> Sign Out Session
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="neo-btn bg-swaply-coral text-white px-4 py-2 rounded-xl text-xs font-black shadow-hard-sm"
          >
            Sign In to Account
          </button>
        )}
      </div>

      {/* HEADER */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 bg-swaply-yellow text-swaply-black border-3 border-swaply-black px-4 py-1.5 rounded-full shadow-hard text-xs font-black rotate-[-1deg] mb-3">
          <Settings className="w-4 h-4 text-swaply-coral fill-swaply-coral" />
          <span>ACCOUNT & SYSTEM PREFERENCES</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-swaply-black tracking-tight">
          Member <span className="bg-swaply-coral text-white border-2 border-swaply-black px-3 py-0.5 rounded-xl shadow-hard rotate-[1.5deg] inline-block">Settings</span>
        </h1>

        <p className="mt-3 text-sm font-bold text-swaply-black/75 max-w-md mx-auto">
          Manage your login status, hardware permissions, and WebRTC privacy settings.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* 1. LOGIN / LOGOUT STATUS CARD */}
        <div className="neo-card rounded-3xl p-6 sm:p-8 bg-paper-cream relative bg-paper-grid border-3 shadow-hard-xl">
          <BinderClip className="absolute -top-5 left-8" />

          <div className="flex items-center justify-between border-b-2 border-swaply-black/20 pb-4 mb-4">
            <h3 className="text-lg font-black text-swaply-black flex items-center gap-2">
              <User className="w-5 h-5 text-swaply-coral" />
              Account & Session Status
            </h3>

            {session ? (
              <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 🟢 LOGGED IN
              </span>
            ) : (
              <span className="bg-swaply-black/10 text-swaply-black/70 border border-swaply-black/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                🔴 NOT LOGGED IN
              </span>
            )}
          </div>

          {session ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white border-2 border-swaply-black p-3.5 rounded-xl">
                  <span className="font-bold text-swaply-black/60 block mb-0.5">Account Email</span>
                  <span className="font-black text-swaply-black text-sm flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-swaply-coral" /> {session.email}
                  </span>
                </div>

                <div className="bg-white border-2 border-swaply-black p-3.5 rounded-xl">
                  <span className="font-bold text-swaply-black/60 block mb-0.5">Beta Pass Status</span>
                  <span className="font-black text-swaply-coral text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-swaply-yellow fill-swaply-yellow" />
                    {registeredUser?.betaId || 'Pass Verification Pending'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => navigate('/beta')}
                  className="neo-btn bg-swaply-yellow text-swaply-black px-4 py-2 rounded-xl text-xs font-black shadow-hard-sm"
                >
                  View Beta Pioneer Ticket Pass →
                </button>

                <button
                  onClick={handleSignOut}
                  className="text-xs font-bold text-swaply-coral hover:underline flex items-center gap-1"
                >
                  <Power className="w-3.5 h-3.5" /> Disconnect Session
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <p className="text-xs font-bold text-swaply-black/70">
                You are currently browsing as a guest. Sign in to access 1-on-1 video call rooms and beta privileges.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="neo-btn bg-swaply-coral text-white border-2 border-swaply-black px-6 py-3 rounded-xl text-xs font-black shadow-hard"
              >
                Sign In to Your Account →
              </button>
            </div>
          )}
        </div>

        {/* 2. HARDWARE & PRIVACY PREFERENCES */}
        <div className="neo-card rounded-3xl p-6 sm:p-8 bg-paper-cream relative bg-paper-grid border-3 shadow-hard-xl">
          <MaskingTape className="absolute -top-3 right-10" />

          <div className="border-b-2 border-swaply-black/20 pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-swaply-black flex items-center gap-2">
              <Shield className="w-5 h-5 text-swaply-coral" />
              Hardware & Privacy Controls
            </h3>
            <span className="text-[10px] font-black text-swaply-black/50 uppercase">P2P PROTOCOL</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-white border-2 border-swaply-black rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-swaply-coral" />
                <div>
                  <span className="text-xs font-black text-swaply-black block">Email Verification Alerts</span>
                  <span className="text-[10px] font-bold text-swaply-black/60">Receive OTP codes and beta pass updates</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-swaply-black text-swaply-coral cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white border-2 border-swaply-black rounded-xl">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-swaply-mint" />
                <div>
                  <span className="text-xs font-black text-swaply-black block">Auto Camera Permission</span>
                  <span className="text-[10px] font-bold text-swaply-black/60">Enable HD video input on room entry</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoCamera}
                onChange={(e) => setAutoCamera(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-swaply-black text-swaply-coral cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white border-2 border-swaply-black rounded-xl">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-swaply-yellow" />
                <div>
                  <span className="text-xs font-black text-swaply-black block">Auto Microphone Permission</span>
                  <span className="text-[10px] font-bold text-swaply-black/60">Enable WebRTC audio stream on call start</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoMic}
                onChange={(e) => setAutoMic(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-swaply-black text-swaply-coral cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleSavePreferences}
                className="neo-btn bg-swaply-coral text-white border-2 border-swaply-black px-6 py-3 rounded-xl text-xs font-black shadow-hard"
              >
                Save System Preferences
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
