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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header />

      {/* Main Content View Switcher */}
      <main className="flex-1 w-full pb-16">
        {currentView === 'home' && <HomePage />}
        {currentView === 'report' && <ReportIssuePage />}
        {currentView === 'dashboard' && <AdminDashboardPage />}
        {currentView === 'details' && <ComplaintDetailsPage />}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CivicLens AI • Municipal Infrastructure Department</span>
          <span>Core Flow: Report Issue → AI Checks Similar Reports → Verify Result → Dashboard</span>
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
