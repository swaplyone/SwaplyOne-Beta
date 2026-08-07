import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import DynamicIslandNav from './components/DynamicIslandNav';
import Footer from './components/Footer';
import JoinModal from './components/JoinModal';
import { useLenis } from './hooks/useLenis';
import { checkIsPreloaded } from './utils/frameCache';
import LoadingPage from './pages/LoadingPage';
import { MorphBarProvider } from './context/MorphBarContext';

// Pages
import HomePage from './pages/HomePage';
import BetaPage from './pages/BetaPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import FounderPage from './pages/FounderPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AdminWrapper() {
  const navigate = useNavigate();
  return <AdminDashboardPage onBackToHome={() => navigate('/')} />;
}

function AppContent() {
  // Initialize Lenis smooth scroll synchronized with GSAP ScrollTrigger
  useLenis();

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  return (
    <MorphBarProvider>
      <div className="min-h-screen bg-paper text-swaply-black flex flex-col font-sans selection:bg-swaply-yellow selection:text-swaply-black relative">
        
        {/* FLOATING DYNAMIC ISLAND NAVBAR */}
        <DynamicIslandNav onOpenJoinModal={() => setIsJoinModalOpen(true)} />

        {/* ROUTES */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage onOpenJoinModal={() => setIsJoinModalOpen(true)} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/beta" element={<BetaPage onOpenJoinModal={() => setIsJoinModalOpen(true)} />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/founder" element={<FounderPage onOpenJoinModal={() => setIsJoinModalOpen(true)} />} />
            <Route path="/admin" element={<AdminWrapper />} />
            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* GLOBAL FOOTER */}
        <Footer onOpenJoinModal={() => setIsJoinModalOpen(true)} />

        {/* JOIN MODAL */}
        <JoinModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
        />

      </div>
    </MorphBarProvider>
  );
}

export default function App() {
  const [isPreloaded, setIsPreloaded] = useState(() => checkIsPreloaded());

  return (
    <AnimatePresence mode="wait">
      {!isPreloaded ? (
        <LoadingPage key="loading-page" onComplete={() => setIsPreloaded(true)} />
      ) : (
        <Router key="main-app">
          <AppContent />
        </Router>
      )}
    </AnimatePresence>
  );
}
