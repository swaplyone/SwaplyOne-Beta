import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, ShieldCheck, Download, Trash2, Search, RefreshCw, Mail, Activity, Settings, Plus, Minus, ArrowLeft, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import { useMorphBar } from '../context/MorphBarContext';
import { getApiUrl, fetchWithRetry } from '../config/apiConfig';

export default function AdminDashboardPage({ onBackToHome }) {
  const navigate = useNavigate();
  const { showMorphBar } = useMorphBar();
  const [hasFounderSession, setHasFounderSession] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);

  // Dashboard Data
  const [stats, setStats] = useState({
    totalRegistered: 0,
    maxLimit: 150,
    remainingSlots: 150,
    registrationEnabled: true,
    otpsSent: 0,
    emailsSent: 0
  });

  const [users, setUsers] = useState([]);
  const [betaUsers, setBetaUsers] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('beta_users'); // 'beta_users' | 'users' | 'logs'
  const [loading, setLoading] = useState(false);

  // Live Session Synchronizer: Lock Dashboard instantly if Founder logs out
  useEffect(() => {
    const checkFounderSession = () => {
      try {
        const savedSession = localStorage.getItem('swaply_user_session');
        const savedReg = localStorage.getItem('swaply_registered_user');

        let email = null;
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.email) email = parsed.email.toLowerCase();
        } else if (savedReg) {
          const parsed = JSON.parse(savedReg);
          if (parsed && parsed.email) email = parsed.email.toLowerCase();
        }

        const isFounder = email === 'founder@swaplyone.in';
        setHasFounderSession(isFounder);

        if (!isFounder) {
          if (authenticated) {
            setAuthenticated(false);
            showMorphBar({
              type: 'warning',
              title: 'Dashboard Locked',
              message: 'Founder session ended. Admin Control Center requires an active Founder login.'
            });
          }
        }
      } catch (e) {
        setHasFounderSession(false);
        setAuthenticated(false);
      }
    };

    checkFounderSession();

    window.addEventListener('storage', checkFounderSession);
    const interval = setInterval(checkFounderSession, 600);

    return () => {
      window.removeEventListener('storage', checkFounderSession);
      clearInterval(interval);
    };
  }, [authenticated, showMorphBar]);

  // Fetch Dashboard Data on Unlock
  useEffect(() => {
    if (authenticated && hasFounderSession) {
      fetchDashboardData();
    }
  }, [authenticated, hasFounderSession]);

  // Passcode authentication (Requires active Founder login session)
  const handleLogin = (e) => {
    e.preventDefault();

    if (!hasFounderSession) {
      showMorphBar({
        type: 'error',
        title: 'Sign In Required',
        message: 'You must sign in to founder@swaplyone.in first.'
      });
      return;
    }

    if (passcode.trim() === 'lichisw@26') {
      setAuthenticated(true);
      showMorphBar({
        type: 'success',
        title: 'Admin Access Granted',
        message: 'Welcome Founder! Admin Control Center unlocked.'
      });
      fetchDashboardData();
    } else {
      setPassError(true);
      showMorphBar({
        type: 'error',
        title: 'Access Denied',
        message: 'Invalid admin passcode.'
      });
    }
  };

  const handleLockDashboard = () => {
    try {
      localStorage.removeItem('swaply_user_session');
      localStorage.removeItem('swaply_registered_user');
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    setAuthenticated(false);
    showMorphBar({
      type: 'info',
      title: 'Dashboard Locked',
      message: 'Founder session disconnected. Admin console locked.'
    });
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch admin endpoints with automatic retries for cold-start resilience
      const [statsRes, usersRes, betaRes, logsRes] = await Promise.all([
        fetchWithRetry(getApiUrl('/api/admin/stats')),
        fetchWithRetry(getApiUrl('/api/admin/users')),
        fetchWithRetry(getApiUrl('/api/admin/beta-users')),
        fetchWithRetry(getApiUrl('/api/admin/email-logs'))
      ]);

      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData);
      }

      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users || []);
      }

      const betaData = await betaRes.json();
      if (betaData.success) {
        setBetaUsers(betaData.betaUsers || []);
      }

      const logsData = await logsRes.json();
      if (logsData.success) {
        setEmailLogs(logsData.logs || []);
      }
    } catch (err) {
      console.warn('Admin Dashboard data fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update registration limit or toggle status
  const handleUpdateSettings = async (newLimit, newEnabled) => {
    const targetLimit = newLimit !== undefined ? newLimit : stats.maxLimit;
    const targetEnabled = newEnabled !== undefined ? newEnabled : stats.registrationEnabled;

    try {
      const res = await fetch(getApiUrl('/api/admin/settings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxLimit: targetLimit, enabled: targetEnabled })
      });
      const data = await res.json();

      if (data.success) {
        showMorphBar({
          type: 'success',
          title: 'Settings Updated',
          message: `Limit set to ${data.settings.maxLimit}, Enabled: ${data.settings.enabled}`
        });
        fetchDashboardData();
      }
    } catch (err) {
      showMorphBar({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update admin settings.'
      });
    }
  };

  // Delete Registered Account User
  const handleDeleteUserAccount = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete the registered account for ${userName}?`)) return;

    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${userId}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showMorphBar({
          type: 'success',
          title: 'Account Deleted',
          message: `${userName} account removed.`
        });
        fetchDashboardData();
      }
    } catch (err) {
      showMorphBar({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Could not remove user account.'
      });
    }
  };

  // Delete Beta Pass Record ONLY (Leaves User Account Intact!)
  const handleDeleteBetaUser = async (betaUserId, betaUserName, betaId) => {
    if (!window.confirm(`Delete Beta Pass (${betaId}) for ${betaUserName}? This will remove their Beta Pass access, but their account details remain untouched.`)) return;

    try {
      const res = await fetch(getApiUrl(`/api/admin/beta-users/${betaUserId}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showMorphBar({
          type: 'success',
          title: 'Beta Pass Removed',
          message: data.message || `Beta Pass (${betaId}) removed. Account details remain untouched.`
        });
        fetchDashboardData();
      }
    } catch (err) {
      showMorphBar({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Could not remove Beta Pass record.'
      });
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open('/api/admin/export-csv', '_blank');
    showMorphBar({
      type: 'info',
      title: 'Downloading CSV',
      message: 'Exporting registered beta users roster.'
    });
  };

  // Filtered Lists
  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBetaUsers = betaUsers.filter(u =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.betaId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // PASSCODE / SESSION LOCK SCREEN
  if (!authenticated) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center bg-paper selection:bg-swaply-yellow">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neo-card rounded-3xl p-8 max-w-md w-full bg-paper-cream border-3 shadow-hard-2xl text-center relative"
        >
          {!hasFounderSession ? (
            /* CASE 1: NOT LOGGED IN AS FOUNDER -> BLOCK ACCESS & REDIRECT TO LOGIN */
            <div className="space-y-5">
              <div className="w-16 h-16 bg-rose-500 text-white border-3 border-swaply-black rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-hard">
                🛡️
              </div>
              <div>
                <span className="bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  FOUNDER LOGIN REQUIRED
                </span>
                <h2 className="text-2xl font-black text-swaply-black mt-2">Admin Access Restricted</h2>
                <p className="text-xs font-bold text-swaply-black/75 mt-2 leading-relaxed">
                  You must be signed in to the official Founder account (<strong className="text-swaply-coral">founder@swaplyone.in</strong>) to access the Admin Control Center.
                </p>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-2 border-swaply-black py-3.5 rounded-2xl text-xs font-black shadow-hard flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In to Founder Account →</span>
                </button>

                <button
                  onClick={onBackToHome}
                  className="w-full neo-btn bg-paper-card text-swaply-black border-2 border-swaply-black py-3 rounded-2xl text-xs font-bold shadow-hard-sm cursor-pointer"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          ) : (
            /* CASE 2: LOGGED IN AS FOUNDER -> PROMPT FOR 2FA ADMIN PASSCODE */
            <>
              <div className="w-16 h-16 bg-swaply-yellow border-3 border-swaply-black rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-hard mb-4">
                🔒
              </div>
              <h2 className="text-3xl font-black text-swaply-black">2FA Admin Unlock</h2>
              <p className="text-xs font-bold text-swaply-black/70 mt-1 mb-6">
                Signed in as <strong className="text-swaply-coral">founder@swaplyone.in</strong>.<br />Enter admin passcode to unlock controls.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter Passcode..."
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPassError(false);
                  }}
                  className="w-full px-4 py-3 bg-paper-card border-2 border-swaply-black rounded-xl text-center text-base font-black text-swaply-black focus:outline-none focus:ring-2 focus:ring-swaply-coral shadow-hard-sm"
                />

                <button
                  type="submit"
                  className="w-full neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-2 border-swaply-black py-3.5 rounded-2xl text-base font-black shadow-hard cursor-pointer transition-all active:translate-y-0.5"
                >
                  Unlock Control Center →
                </button>
              </form>

              <div className="mt-6 pt-4 border-t-2 border-swaply-black/15 flex justify-between text-xs font-bold">
                <button
                  onClick={() => {
                    localStorage.removeItem('swaply_user_session');
                    localStorage.removeItem('swaply_registered_user');
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className="text-rose-600 hover:underline"
                >
                  Sign Out
                </button>

                <button
                  onClick={onBackToHome}
                  className="text-swaply-black/70 hover:text-swaply-coral flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Homepage
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto selection:bg-swaply-yellow">
      
      {/* TOP ADMIN HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-swaply-black text-white border-2 border-swaply-black px-3 py-1 rounded-full text-xs font-black mb-2 shadow-hard-sm">
            <ShieldCheck className="w-4 h-4 text-swaply-yellow" />
            <span>SWAPLYONE ADMIN CONTROL CENTER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-swaply-black">
            Beta Registration Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="neo-btn bg-paper-card hover:bg-paper-dark text-swaply-black border-2 border-swaply-black px-3.5 py-2 rounded-xl text-xs font-black shadow-hard-sm flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={handleExportCsv}
            className="neo-btn bg-swaply-mint hover:bg-emerald-300 text-swaply-black border-2 border-swaply-black px-3.5 py-2 rounded-xl text-xs font-black shadow-hard-sm flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={handleLockDashboard}
            className="neo-btn bg-swaply-coral hover:bg-swaply-orange text-white border-2 border-swaply-black px-3.5 py-2 rounded-xl text-xs font-black shadow-hard-sm cursor-pointer transition-all active:translate-y-0.5"
          >
            Lock Dashboard
          </button>
        </div>
      </div>

      {/* STATS METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="neo-card bg-paper-cream rounded-2xl p-4 border-3 shadow-hard">
          <span className="text-[10px] font-black uppercase text-swaply-black/60 block">Registered Beta Users</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-swaply-black">{stats.totalRegistered}</span>
            <span className="text-xs font-bold text-swaply-black/60">/ {stats.maxLimit} limit</span>
          </div>
        </div>

        <div className="neo-card bg-swaply-yellow rounded-2xl p-4 border-3 shadow-hard">
          <span className="text-[10px] font-black uppercase text-swaply-black/80 block">Remaining Slots</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-swaply-black">{stats.remainingSlots}</span>
            <span className="text-xs font-extrabold text-swaply-black/80">Available</span>
          </div>
        </div>

        <div className="neo-card bg-paper-card rounded-2xl p-4 border-3 shadow-hard">
          <span className="text-[10px] font-black uppercase text-swaply-black/60 block">Status</span>
          <div className="mt-1 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${stats.registrationEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-lg font-black text-swaply-black">
              {stats.registrationEnabled ? 'ACTIVE & OPEN' : 'PAUSED / CLOSED'}
            </span>
          </div>
        </div>

        <div className="neo-card bg-swaply-blue/20 rounded-2xl p-4 border-3 shadow-hard">
          <span className="text-[10px] font-black uppercase text-swaply-black/60 block">Emails Sent</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-swaply-black">{stats.emailsSent}</span>
            <span className="text-xs font-bold text-swaply-black/60">Log Records</span>
          </div>
        </div>
      </div>

      {/* QUICK LIMIT CONTROL PANEL */}
      <div className="neo-card bg-paper-card rounded-2xl p-6 border-3 shadow-hard-lg mb-8">
        <h3 className="text-lg font-black text-swaply-black mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-swaply-coral" />
          Registration Limit & Status Control
        </h3>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Limit Adjustment Controls */}
          <div>
            <span className="text-xs font-extrabold text-swaply-black/70 block mb-2">Adjust Max Registration Limit</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateSettings(Math.max(1, stats.maxLimit - 10))}
                className="neo-btn bg-paper-cream text-swaply-black px-3 py-1.5 rounded-lg text-xs font-black"
              >
                -10
              </button>
              <button
                onClick={() => handleUpdateSettings(Math.max(1, stats.maxLimit - 1))}
                className="neo-btn bg-paper-cream text-swaply-black px-3 py-1.5 rounded-lg text-xs font-black"
              >
                -1
              </button>
              <span className="px-4 py-1.5 bg-swaply-black text-swaply-yellow font-black text-lg rounded-xl border-2 border-swaply-black">
                {stats.maxLimit} Users
              </span>
              <button
                onClick={() => handleUpdateSettings(stats.maxLimit + 1)}
                className="neo-btn bg-paper-cream text-swaply-black px-3 py-1.5 rounded-lg text-xs font-black"
              >
                +1
              </button>
              <button
                onClick={() => handleUpdateSettings(stats.maxLimit + 10)}
                className="neo-btn bg-paper-cream text-swaply-black px-3 py-1.5 rounded-lg text-xs font-black"
              >
                +10
              </button>
            </div>
          </div>

          {/* Toggle Registration On/Off */}
          <div>
            <span className="text-xs font-extrabold text-swaply-black/70 block mb-2">Toggle System Status</span>
            <button
              onClick={() => handleUpdateSettings(stats.maxLimit, !stats.registrationEnabled)}
              className={`neo-btn px-6 py-2.5 rounded-xl text-sm font-black shadow-hard-sm ${
                stats.registrationEnabled
                  ? 'bg-swaply-coral text-white'
                  : 'bg-swaply-mint text-swaply-black'
              }`}
            >
              {stats.registrationEnabled ? 'Pause Beta Registration' : 'Enable Beta Registration'}
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD TAB NAVIGATION */}
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-swaply-black/20 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('beta_users')}
          className={`neo-btn px-4 py-2 rounded-xl text-xs font-black shadow-hard-sm ${
            activeTab === 'beta_users' ? 'bg-swaply-yellow text-swaply-black border-2 border-swaply-black' : 'bg-paper-card text-swaply-black/70'
          }`}
        >
          Beta Pass Roster ({betaUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`neo-btn px-4 py-2 rounded-xl text-xs font-black shadow-hard-sm ${
            activeTab === 'users' ? 'bg-swaply-coral text-white border-2 border-swaply-black' : 'bg-paper-card text-swaply-black/70'
          }`}
        >
          Registered Accounts ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`neo-btn px-4 py-2 rounded-xl text-xs font-black shadow-hard-sm ${
            activeTab === 'logs' ? 'bg-swaply-yellow text-swaply-black border-2 border-swaply-black' : 'bg-paper-card text-swaply-black/70'
          }`}
        >
          Email & System Logs ({emailLogs.length})
        </button>
      </div>

      {/* TAB 1: BETA PASS ROSTER TABLE */}
      {activeTab === 'beta_users' && (
        <div className="neo-card bg-paper-cream rounded-2xl p-6 border-3 shadow-hard-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-swaply-black flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-swaply-coral" />
                Beta Pass Claims Roster
              </h3>
              <p className="text-xs font-bold text-swaply-black/60 mt-0.5">
                Users who claimed a 1-on-1 video Beta Pass. Deleting a Beta Pass record does not delete their main user account.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-swaply-black/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Beta ID, name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-paper-card border-2 border-swaply-black rounded-xl text-xs font-bold text-swaply-black focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold text-swaply-black">
              <thead>
                <tr className="border-b-2 border-swaply-black/30 text-swaply-black/70">
                  <th className="pb-3 px-2">BETA ID</th>
                  <th className="pb-3 px-2">NAME</th>
                  <th className="pb-3 px-2">EMAIL</th>
                  <th className="pb-3 px-2">OCCUPATION</th>
                  <th className="pb-3 px-2">COUNTRY</th>
                  <th className="pb-3 px-2">CLAIMED DATE</th>
                  <th className="pb-3 px-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredBetaUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-swaply-black/50 font-bold">
                      No Beta Pass registrations found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBetaUsers.map((u) => (
                    <tr key={u.id} className="border-b border-swaply-black/10 hover:bg-paper-card/50 transition-colors">
                      <td className="py-3 px-2 font-black text-swaply-coral">{u.betaId}</td>
                      <td className="py-3 px-2 font-black">{u.name}</td>
                      <td className="py-3 px-2 text-swaply-black/80">{u.email}</td>
                      <td className="py-3 px-2 text-swaply-black/80">{u.occupation || 'Member'}</td>
                      <td className="py-3 px-2 text-swaply-black/80">{u.country || 'Global'}</td>
                      <td className="py-3 px-2 text-swaply-black/60">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleDeleteBetaUser(u.id, u.name, u.betaId)}
                          className="p-1.5 bg-swaply-coral/20 hover:bg-swaply-coral text-swaply-coral hover:text-white rounded-lg transition-colors"
                          title="Delete Beta Pass Record Only"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTERED USER ACCOUNTS TABLE */}
      {activeTab === 'users' && (
        <div className="neo-card bg-paper-cream rounded-2xl p-6 border-3 shadow-hard-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-swaply-black flex items-center gap-2">
                <Users className="w-5 h-5 text-swaply-coral" />
                Registered User Accounts
              </h3>
              <p className="text-xs font-bold text-swaply-black/60 mt-0.5">
                Users registered via email & password sign-up.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-swaply-black/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-paper-card border-2 border-swaply-black rounded-xl text-xs font-bold text-swaply-black focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold text-swaply-black">
              <thead>
                <tr className="border-b-2 border-swaply-black/30 text-swaply-black/70">
                  <th className="pb-3 px-2">NAME</th>
                  <th className="pb-3 px-2">EMAIL</th>
                  <th className="pb-3 px-2">ACCOUNT ID</th>
                  <th className="pb-3 px-2">REGISTERED DATE</th>
                  <th className="pb-3 px-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-swaply-black/50 font-bold">
                      No registered accounts found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-swaply-black/10 hover:bg-paper-card/50 transition-colors">
                      <td className="py-3 px-2 font-black">{u.name}</td>
                      <td className="py-3 px-2 text-swaply-black/80">{u.email}</td>
                      <td className="py-3 px-2 font-mono text-[11px] text-swaply-black/60">{u.id}</td>
                      <td className="py-3 px-2 text-swaply-black/60">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleDeleteUserAccount(u.id, u.name)}
                          className="p-1.5 bg-swaply-coral/20 hover:bg-swaply-coral text-swaply-coral hover:text-white rounded-lg transition-colors"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EMAIL LOGS */}
      {activeTab === 'logs' && (
        <div className="neo-card bg-paper-cream rounded-2xl p-6 border-3 shadow-hard-lg">
          <h3 className="text-xl font-black text-swaply-black mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-swaply-coral" />
            Sent Email & System Logs
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {emailLogs.length === 0 ? (
              <p className="text-xs text-center py-6 font-bold text-swaply-black/50">No email logs recorded yet.</p>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className="p-3 bg-paper-card border-2 border-swaply-black/40 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-swaply-black uppercase">{log.emailType}</span>
                      <span className="text-[10px] bg-swaply-black/10 px-2 py-0.5 rounded-md font-bold">{log.to}</span>
                    </div>
                    <p className="font-bold text-swaply-black/70 mt-0.5">{log.subject}</p>
                  </div>
                  <div className="text-right max-w-xs">
                    <span className="text-[10px] font-bold text-swaply-black/50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`block font-black text-[10px] uppercase ${log.status === 'SENT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {log.status}
                    </span>
                    {log.error && (
                      <span className="text-[9px] font-bold text-rose-600 block truncate" title={log.error}>
                        {log.error}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
