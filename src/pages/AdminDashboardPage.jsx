import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, ShieldCheck, Download, Trash2, Search, RefreshCw, Mail, Activity, Settings, Plus, Minus, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useMorphBar } from '../context/MorphBarContext';

export default function AdminDashboardPage({ onBackToHome }) {
  const { showMorphBar } = useMorphBar();
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
  const [emailLogs, setEmailLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'settings' | 'logs'
  const [loading, setLoading] = useState(false);

  // Passcode authentication
  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim() === 'lichisw@26') {
      setAuthenticated(true);
      showMorphBar({
        type: 'success',
        title: 'Admin Access Granted',
        message: 'Welcome to Swaply Beta Control Center.'
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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData);
      }

      // 2. Fetch Users
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      // 3. Fetch Email Logs
      const logsRes = await fetch('/api/admin/email-logs');
      const logsData = await logsRes.json();
      if (logsData.success) {
        setEmailLogs(logsData.logs);
      }
    } catch (err) {
      showMorphBar({
        type: 'error',
        title: 'Data Load Error',
        message: 'Failed to fetch admin dashboard metrics.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update registration limit or toggle status
  const handleUpdateSettings = async (newLimit, newEnabled) => {
    const targetLimit = newLimit !== undefined ? newLimit : stats.maxLimit;
    const targetEnabled = newEnabled !== undefined ? newEnabled : stats.registrationEnabled;

    try {
      const res = await fetch('/api/admin/settings', {
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

  // Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showMorphBar({
          type: 'success',
          title: 'User Deleted',
          message: `${userName} removed from Swaply Beta roster.`
        });
        fetchDashboardData();
      }
    } catch (err) {
      showMorphBar({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Could not remove user.'
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

  // Filtered Users
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.betaId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // PASSCODE LOCK SCREEN
  if (!authenticated) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center bg-paper selection:bg-swaply-yellow">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neo-card rounded-3xl p-8 max-w-md w-full bg-paper-cream border-3 shadow-hard-2xl text-center relative"
        >
          <div className="w-16 h-16 bg-swaply-yellow border-3 border-swaply-black rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-hard mb-4">
            🔒
          </div>
          <h2 className="text-3xl font-black text-swaply-black">Admin Access</h2>
          <p className="text-xs font-bold text-swaply-black/70 mt-1 mb-6">
            Enter secure admin passcode to access Swaply Control Center.
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
              className="w-full neo-btn bg-swaply-coral text-white border-3 border-swaply-black py-3.5 rounded-xl text-base font-black shadow-hard"
            >
              Unlock Control Center →
            </button>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-swaply-black/15">
            <button
              onClick={onBackToHome}
              className="text-xs font-bold text-swaply-black/70 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Swaply Homepage
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto selection:bg-swaply-yellow">
      
      {/* TOP ADMIN HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-swaply-black text-white px-3 py-1 rounded-full text-xs font-black mb-2">
            <ShieldCheck className="w-4 h-4 text-swaply-yellow" />
            <span>SWAPLY ADMIN CONTROL CENTER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-swaply-black">
            Beta Registration Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="neo-btn bg-paper-card text-swaply-black px-3.5 py-2 rounded-xl text-xs font-bold shadow-hard-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={handleExportCsv}
            className="neo-btn bg-swaply-mint text-swaply-black px-3.5 py-2 rounded-xl text-xs font-black shadow-hard-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => setAuthenticated(false)}
            className="neo-btn bg-swaply-coral text-white px-3 py-2 rounded-xl text-xs font-bold shadow-hard-sm"
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
      <div className="flex items-center gap-3 border-b-2 border-swaply-black/20 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`neo-btn px-4 py-2 rounded-xl text-xs font-black shadow-hard-sm ${
            activeTab === 'users' ? 'bg-swaply-yellow text-swaply-black' : 'bg-paper-card text-swaply-black/70'
          }`}
        >
          Registered Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`neo-btn px-4 py-2 rounded-xl text-xs font-black shadow-hard-sm ${
            activeTab === 'logs' ? 'bg-swaply-yellow text-swaply-black' : 'bg-paper-card text-swaply-black/70'
          }`}
        >
          Email & System Logs ({emailLogs.length})
        </button>
      </div>

      {/* TAB 1: USERS TABLE */}
      {activeTab === 'users' && (
        <div className="neo-card bg-paper-cream rounded-2xl p-6 border-3 shadow-hard-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-black text-swaply-black flex items-center gap-2">
              <Users className="w-5 h-5 text-swaply-coral" />
              Registered Pioneer Members
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-swaply-black/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, ID..."
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
                  <th className="pb-3 px-2">TRACK</th>
                  <th className="pb-3 px-2">SKILLS</th>
                  <th className="pb-3 px-2">DATE</th>
                  <th className="pb-3 px-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-swaply-black/50 font-bold">
                      No registered users found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-swaply-black/10 hover:bg-paper-card/50 transition-colors">
                      <td className="py-3 px-2 font-black text-swaply-coral">{u.betaId}</td>
                      <td className="py-3 px-2 font-black">{u.name}</td>
                      <td className="py-3 px-2 text-swaply-black/80">{u.email}</td>
                      <td className="py-3 px-2 uppercase text-[10px] font-black">
                        <span className={`px-2 py-0.5 rounded-md border border-swaply-black/30 ${u.track === 'hunter' ? 'bg-swaply-coral text-white' : 'bg-swaply-yellow text-swaply-black'}`}>
                          {u.track}
                        </span>
                      </td>
                      <td className="py-3 px-2">{u.skillsToTest}</td>
                      <td className="py-3 px-2 text-swaply-black/60">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 bg-swaply-coral/20 hover:bg-swaply-coral text-swaply-coral hover:text-white rounded-lg transition-colors"
                          title="Delete User"
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
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-swaply-black/50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="block font-black text-emerald-600 text-[10px] uppercase">{log.status}</span>
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
