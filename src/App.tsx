import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HomePage } from './components/pages/HomePage';
import { ReportIssuePage } from './components/pages/ReportIssuePage';
import { AdminDashboardPage } from './components/pages/AdminDashboardPage';
import { ComplaintDetailsPage } from './components/pages/ComplaintDetailsPage';

const MainPortal: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* Ambient Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[rgba(139,92,246,0.12)] blur-[120px] animate-float-slow" />
        <div className="absolute top-[40%] right-[10%] w-[450px] h-[450px] rounded-full bg-[rgba(6,182,212,0.08)] blur-[120px] animate-float-delayed" />
      </div>

      {/* Top Header */}
      <Header />

      {/* Main Content View Switcher */}
      <main className="flex-1 w-full pb-16 relative z-10">
        {currentView === 'home' && <HomePage />}
        {currentView === 'report' && <ReportIssuePage />}
        {currentView === 'dashboard' && <AdminDashboardPage />}
        {currentView === 'details' && <ComplaintDetailsPage />}
      </main>

      {/* Synapse Footer */}
      <footer className="border-t border-white/5 bg-[#050505] py-6 text-center text-xs text-neutral-400 relative z-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CivicLens AI • Municipal Infrastructure Department</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-neutral-300 font-medium">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainPortal />
    </AppProvider>
  );
}
