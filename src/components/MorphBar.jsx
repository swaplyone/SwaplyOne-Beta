import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Search,
  Users,
  Phone,
  Shield,
  ShieldCheck,
  Power,
  X,
  User,
  Settings,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneOff,
  ArrowRight,
  Sparkles,
  Command,
  Clock,
  XCircle,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import SwaplyLogo from './SwaplyLogo';

export default function MorphBar({
  currentUser,
  userDetails,
  onLogout,
  incomingCall,
  onAcceptCall,
  onRejectCall,
  activeCallSession,
  onHangUpCall,
  friendRequestNotice,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  securityAlertNotice,
  notificationNotice,
  notificationType = 'success'
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const barRef = useRef(null);

  // Core Morph State: 'idle' | 'search' | 'friend_request' | 'incoming_call' | 'active_call' | 'notification' | 'qr_scanner' | 'security_alert' | 'admin_panel' | 'profile'
  const [mode, setMode] = useState('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [callTimer, setCallTimer] = useState(0);

  // Active call audio/video controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  // Dynamic Session State Sync
  const [activeUser, setActiveUser] = useState(currentUser || null);
  const [userMeta, setUserMeta] = useState(userDetails || null);

  // Scroll Auto-Hide State
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Scroll Direction Listener for Auto-Hiding Morph Bar on Scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Always show if near top (<60px) or if Morph Bar is expanded in non-idle mode
      if (currentScrollY < 60 || mode !== 'idle') {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + 8) {
        // Scrolling Down -> Hide Morph Bar
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        // Scrolling Up -> Show Morph Bar
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode]);

  // Dynamic Session State Sync with Live Database Verification
  useEffect(() => {
    const syncUserSession = () => {
      try {
        const savedReg = localStorage.getItem('swaply_registered_user');
        const savedSession = localStorage.getItem('swaply_user_session');

        let emailToCheck = null;
        if (savedReg) {
          const parsed = JSON.parse(savedReg);
          if (parsed && parsed.email) emailToCheck = parsed.email;
        } else if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.email) emailToCheck = parsed.email;
        }

        if (emailToCheck) {
          // Verify with database if user registration is still active (or if details updated)
          fetch(`/api/beta/verify-user?email=${encodeURIComponent(emailToCheck)}`)
            .then(res => res.json())
            .then(data => {
              if (data.registered && data.user) {
                // Admin updated details -> sync updated pass!
                localStorage.setItem('swaply_registered_user', JSON.stringify(data.user));
                setActiveUser(data.user.email);
                setUserMeta({
                  email: data.user.email,
                  name: data.user.name,
                  beta_id: data.user.betaId,
                  is_admin: data.user.email === 'founder@swaplyone.in'
                });
              } else {
                // Admin deleted user registration -> revoke local stored pass!
                localStorage.removeItem('swaply_registered_user');
                if (savedSession) {
                  const parsed = JSON.parse(savedSession);
                  setActiveUser(parsed.email);
                  setUserMeta({
                    email: parsed.email,
                    name: parsed.name,
                    beta_id: 'Session Active',
                    is_admin: parsed.email === 'founder@swaplyone.in'
                  });
                } else {
                  setActiveUser(null);
                  setUserMeta(null);
                }
              }
            })
            .catch(() => {});
        } else {
          setActiveUser(null);
          setUserMeta(null);
        }
      } catch (e) {}
    };

    syncUserSession();
    window.addEventListener('storage', syncUserSession);
    return () => window.removeEventListener('storage', syncUserSession);
  }, [currentUser, userDetails, mode]);

  // 1. Reactive Mode Overrides based on system events
  useEffect(() => {
    if (incomingCall) {
      setMode('incoming_call');
      setIsVisible(true);
    } else if (activeCallSession) {
      setMode('active_call');
      setIsVisible(true);
    } else if (securityAlertNotice) {
      setMode('security_alert');
      setIsVisible(true);
    } else if (friendRequestNotice) {
      setMode('friend_request');
      setIsVisible(true);
    } else if (notificationNotice) {
      setMode('notification');
      setIsVisible(true);
    }
  }, [incomingCall, activeCallSession, securityAlertNotice, friendRequestNotice, notificationNotice]);

  // 2. Active Call Timer
  useEffect(() => {
    let interval = null;
    if (mode === 'active_call') {
      interval = setInterval(() => setCallTimer(prev => prev + 1), 1000);
    } else {
      setCallTimer(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode]);

  // 3. Global Ctrl+K / Cmd+K Keyboard Shortcut for Search Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMode(prev => (prev === 'search' ? 'idle' : 'search'));
      } else if (e.key === 'Escape' && mode !== 'idle' && mode !== 'active_call' && mode !== 'incoming_call') {
        setMode('idle');
      }
    };

    const handleClickOutside = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        if (mode !== 'active_call' && mode !== 'incoming_call') {
          setMode('idle');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mode]);

  // Format call duration MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDisconnect = () => {
    localStorage.removeItem('swaply_user_session');
    localStorage.removeItem('swaply_registered_user');
    setActiveUser(null);
    setUserMeta(null);
    if (onLogout) onLogout();
    setMode('idle');
  };

  // Navigation Items for Search Mode
  const quickActions = [
    { label: 'Go to Beta Registration', path: '/beta', icon: <Sparkles size={16} color="#D85B3E" /> },
    { label: 'Home Page', path: '/', icon: <Users size={16} color="#6D7B55" /> },
    { label: 'Member Settings', path: '/settings', icon: <Settings size={16} color="#4C779F" /> },
    { label: 'Privacy & Security', path: '/privacy', icon: <Shield size={16} color="#C8A76A" /> }
  ];

  if (activeUser === 'founder@swaplyone.in' || userMeta?.email === 'founder@swaplyone.in' || userMeta?.is_admin) {
    quickActions.push({ label: 'Admin Command Hub', path: '/admin', icon: <ShieldCheck size={16} color="#BE4D4D" /> });
  }

  // Smooth Spring Motion Transition Settings
  const springTransition = {
    type: 'spring',
    stiffness: 380,
    damping: 30,
    mass: 0.8
  };

  const isAuthRoute = ['/verify-email', '/verify-phone', '/verify-otp'].includes(location.pathname);

  if (isAuthRoute && !activeUser) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: 0,
        right: 0,
        zIndex: 10000,
        pointerEvents: isVisible ? 'auto' : 'none',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 16px'
      }}
      ref={barRef}
    >
      <LayoutGroup>
        <motion.div
          layout
          initial={{ opacity: 1, y: 0 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : -85
          }}
          transition={springTransition}
          style={{
            pointerEvents: isVisible ? 'auto' : 'none',
            background: '#FFFDF8',
            border: '2.5px solid #1B2233',
            boxShadow: '6px 6px 0px 0px #1B2233',
            borderRadius: mode === 'idle' ? '50px' : '24px',
            overflow: 'hidden',
            color: '#1B2233',
            fontFamily: 'var(--font-mono)'
          }}
        >
          {/* ==================== 1. IDLE MODE ==================== */}
          {mode === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.4rem 0.85rem',
                cursor: 'pointer'
              }}
            >
              <div
                onClick={() => setMode('search')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                title="Tap to open search & menu"
              >
                <SwaplyLogo size={26} color="#FFFFFF" />
                <span style={{ fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>
                  SwaplyOne
                </span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeUser ? '#6D7B55' : '#D85B3E', boxShadow: activeUser ? '0 0 6px #6D7B55' : '0 0 6px #D85B3E' }} />
              </div>

              <div style={{ width: '1.5px', height: '16px', background: 'rgba(27, 34, 51, 0.2)', margin: '0 0.1rem' }} />

              {/* Mobile-First Search Launcher Pill */}
              <button
                onClick={() => setMode('search')}
                style={{
                  background: '#F8F3EA',
                  border: '1.5px solid #1B2233',
                  borderRadius: '20px',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#1B2233'
                }}
                title="Tap to search routes and commands"
              >
                <Search size={13} color="#D85B3E" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>Search</span>
              </button>

              {/* Profile Avatar Pill */}
              <div
                onClick={() => setMode('profile')}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: activeUser ? '#6D7B55' : '#D85B3E',
                  color: '#FFF',
                  border: '1.5px solid #1B2233',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={activeUser ? `Logged in: ${activeUser}` : 'Click to Login'}
              >
                {(userMeta?.name || activeUser || 'U').substring(0, 2).toUpperCase()}
              </div>
            </motion.div>
          )}

          {/* ==================== 2. SEARCH / COMMAND MODE ==================== */}
          {mode === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: 'min(92vw, 500px)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Top Search Input Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px dashed #1B2233', paddingBottom: '0.75rem' }}>
                <Search size={20} color="#D85B3E" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to search peers, skills, Beta IDs, or commands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#1B2233'
                  }}
                />
                <button
                  onClick={() => setMode('idle')}
                  style={{ background: '#F8F3EA', border: '1.5px solid #1B2233', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  title="Close Search"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Quick Actions & Navigation List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '280px', overflowY: 'auto' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7A7A7A', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Quick Navigation
                </span>
                {quickActions
                  .filter(a => a.label.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((act, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        navigate(act.path);
                        setMode('idle');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '12px',
                        background: '#F8F3EA',
                        border: '1.5px solid #1B2233',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      {act.icon}
                      <span>{act.label}</span>
                      <ArrowRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* ==================== 3. INCOMING CALL MORPH ==================== */}
          {mode === 'incoming_call' && (
            <motion.div
              key="incoming_call"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                width: 'min(92vw, 440px)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                background: '#FFFDF8'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#D85B3E', color: '#FFF', border: '2px solid #1B2233', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                  {(incomingCall?.from || 'Node').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#BE4D4D', fontWeight: 800, textTransform: 'uppercase' }}>
                    🔒 Incoming Call Offer
                  </span>
                  <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>
                    @{incomingCall?.from || 'Unknown Peer'}
                  </h4>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    if (onAcceptCall) onAcceptCall(incomingCall?.sessionId);
                  }}
                  style={{ padding: '0.5rem 1rem', borderRadius: '50px', background: '#6D7B55', border: '2px solid #1B2233', color: '#FFF', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    if (onRejectCall) onRejectCall(incomingCall?.sessionId);
                    setMode('idle');
                  }}
                  style={{ padding: '0.5rem 1rem', borderRadius: '50px', background: '#BE4D4D', border: '2px solid #1B2233', color: '#FFF', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Decline
                </button>
              </div>
            </motion.div>
          )}

          {/* ==================== 4. ACTIVE CALL CONTROLS ==================== */}
          {mode === 'active_call' && (
            <motion.div
              key="active_call"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                width: 'min(92vw, 460px)',
                padding: '0.75rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#BE4D4D', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                  Secure Call &bull; {formatTime(callTimer)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: isMicMuted ? '#BE4D4D' : '#F8F3EA', border: '1.5px solid #1B2233', color: isMicMuted ? '#FFF' : '#1B2233', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button
                  onClick={() => setIsCamOff(!isCamOff)}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: isCamOff ? '#BE4D4D' : '#F8F3EA', border: '1.5px solid #1B2233', color: isCamOff ? '#FFF' : '#1B2233', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {isCamOff ? <CameraOff size={16} /> : <Camera size={16} />}
                </button>
                <button
                  onClick={() => {
                    if (onHangUpCall) onHangUpCall();
                    setMode('idle');
                  }}
                  style={{ padding: '0.45rem 0.85rem', borderRadius: '50px', background: '#BE4D4D', border: '1.5px solid #1B2233', color: '#FFF', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <PhoneOff size={14} /> End
                </button>
              </div>
            </motion.div>
          )}

          {/* ==================== 5. INCOMING FRIEND REQUEST MORPH ==================== */}
          {mode === 'friend_request' && (
            <motion.div
              key="friend_request"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                width: 'min(92vw, 420px)',
                padding: '0.75rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                background: '#FFF8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#D85B3E', color: '#FFF', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', border: '1.5px solid #1B2233' }}>
                  {(friendRequestNotice?.senderName || friendRequestNotice?.sender || 'P').substring(0, 2).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1B2233' }}>
                    @{friendRequestNotice?.senderName || friendRequestNotice?.sender || 'Peer'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#7A7A7A', fontFamily: 'var(--font-mono)' }}>
                    sent you a friend request
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={async () => {
                    if (friendRequestNotice?.id && onAcceptFriendRequest) {
                      await onAcceptFriendRequest(friendRequestNotice.id);
                    }
                    setMode('idle');
                  }}
                  style={{ padding: '0.4rem 0.85rem', borderRadius: '50px', background: '#6D7B55', border: '1.5px solid #1B2233', color: '#FFF', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', boxShadow: '2px 2px 0 #1B2233' }}
                >
                  Accept
                </button>
                <button
                  onClick={async () => {
                    if (friendRequestNotice?.id && onRejectFriendRequest) {
                      await onRejectFriendRequest(friendRequestNotice.id);
                    }
                    setMode('idle');
                  }}
                  style={{ padding: '0.4rem 0.85rem', borderRadius: '50px', background: '#F8F3EA', border: '1.5px solid #1B2233', color: '#1B2233', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Ignore
                </button>
              </div>
            </motion.div>
          )}

          {/* ==================== 6. NOTIFICATION CAPSULE ==================== */}
          {mode === 'notification' && (
            <motion.div
              key="notification"
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -10 }}
              style={{
                width: 'min(90vw, 420px)',
                padding: '0.65rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.6rem',
                background: notificationType === 'error' ? '#FFF5F5' : notificationType === 'warning' ? '#FEFCE8' : '#F1F6F1',
                borderRadius: '20px',
                border: notificationType === 'error' ? '2.5px solid #D85B3E' : '2.5px solid #1B2233',
                boxShadow: '4px 4px 0px 0px #1B2233'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                {notificationType === 'error' ? (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#D85B3E', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <XCircle size={16} color="#FFF" />
                  </div>
                ) : notificationType === 'warning' ? (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E5983B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertTriangle size={16} color="#FFF" />
                  </div>
                ) : notificationType === 'loading' ? (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#3B82F6', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <RefreshCw size={14} color="#FFF" className="animate-spin" />
                  </div>
                ) : notificationType === 'info' ? (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#3B82F6', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Info size={16} color="#FFF" />
                  </div>
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#6D7B55', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={16} color="#FFF" />
                  </div>
                )}
                <span style={{ fontWeight: 800, fontSize: '0.78rem', color: notificationType === 'error' ? '#9B2C2C' : '#1B2233', fontFamily: 'var(--font-mono)', minWidth: 0, overflowWrap: 'anywhere', lineHeight: 1.25 }}>
                  {notificationNotice || 'Action Completed'}
                </span>
              </div>
              <button
                onClick={() => setMode('idle')}
                style={{
                  background: '#FFFDF8',
                  border: '1.5px solid #1B2233',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="Close Notification"
              >
                <X size={12} color="#1B2233" />
              </button>
            </motion.div>
          )}

          {/* ==================== 7. PROFILE MORPH MODE ==================== */}
          {mode === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: 'min(92vw, 360px)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px dashed #1B2233', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: activeUser ? '#6D7B55' : '#D85B3E', color: '#FFF', border: '2px solid #1B2233', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    {(userMeta?.name || activeUser || 'Guest').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-display)', color: '#1B2233' }}>
                      {userMeta?.name || (activeUser ? `@${activeUser.split('@')[0]}` : 'Guest User')}
                    </h3>
                    <span style={{ fontSize: '0.73rem', color: activeUser ? '#6D7B55' : '#D85B3E', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {activeUser ? `Pass: ${userMeta?.beta_id || 'Active Member'}` : 'Session: Not Signed In'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMode('idle')}
                  style={{ background: '#F8F3EA', border: '1.5px solid #1B2233', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  title="Close Morph Bar"
                >
                  <X size={14} />
                </button>
              </div>

              {activeUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => { navigate('/beta'); setMode('idle'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', borderRadius: '12px', background: '#F8F3EA', border: '1.5px solid #1B2233', color: '#1B2233', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <User size={16} color="#D85B3E" /> View Beta Pioneer Pass
                  </button>

                  <button
                    onClick={() => { navigate('/settings'); setMode('idle'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', borderRadius: '12px', background: '#F8F3EA', border: '1.5px solid #1B2233', color: '#1B2233', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <Settings size={16} color="#4C779F" /> Account & Preferences
                  </button>

                  {(activeUser === 'founder@swaplyone.in' || userMeta?.email === 'founder@swaplyone.in') && (
                    <button
                      onClick={() => { navigate('/admin'); setMode('idle'); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', borderRadius: '12px', background: '#F8F3EA', border: '1.5px solid #1B2233', color: '#1B2233', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <ShieldCheck size={16} color="#BE4D4D" /> Admin Control Center
                    </button>
                  )}

                  <button
                    onClick={handleDisconnect}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', borderRadius: '12px', background: '#FFF0EB', border: '1.5px solid #BE4D4D', color: '#BE4D4D', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.25rem' }}
                  >
                    <Power size={16} /> Disconnect Session
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => { navigate('/login'); setMode('idle'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.66rem', padding: '0.66rem 0.85rem', borderRadius: '12px', background: '#D85B3E', border: '1.5px solid #1B2233', color: '#FFF', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <Power size={16} /> Sign In to Account
                  </button>

                  <button
                    onClick={() => { navigate('/beta'); setMode('idle'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', borderRadius: '12px', background: '#F8F3EA', border: '1.5px solid #1B2233', color: '#1B2233', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <Sparkles size={16} color="#D85B3E" /> Apply for Beta Access
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ==================== 8. SECURITY ALERT MORPH ==================== */}
          {mode === 'security_alert' && (
            <motion.div
              key="security_alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                width: 'min(92vw, 440px)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                background: '#FFF0EB'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#BE4D4D', fontWeight: 800 }}>
                <Shield size={18} />
                <span>🛡 New Login Attempt Detected</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#1B2233' }}>
                Location: New York, US &bull; Device: Chrome (macOS)
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setMode('idle')} style={{ flex: 1, padding: '0.45rem', borderRadius: '50px', background: '#6D7B55', border: '1.5px solid #1B2233', color: '#FFF', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>
                  Trust Device
                </button>
                <button onClick={() => { navigate('/settings'); setMode('idle'); }} style={{ flex: 1, padding: '0.45rem', borderRadius: '50px', background: '#BE4D4D', border: '1.5px solid #1B2233', color: '#FFF', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>
                  Review Activity
                </button>
              </div>
            </motion.div>
          )}

        </motion.div>
      </LayoutGroup>
    </div>
  );
}
