import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HomePage } from './components/pages/HomePage';
import { ReportIssuePage } from './components/pages/ReportIssuePage';
import { AdminDashboardPage } from './components/pages/AdminDashboardPage';
import { ComplaintDetailsPage } from './components/pages/ComplaintDetailsPage';

const MainPortal: React.FC = () => {
  const { currentView } = useApp();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  // Track mouse for the custom editorial cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    // Scale cursor up on interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('select') || target.closest('input')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans relative overflow-hidden selection:bg-black selection:text-white">
      
      {/* Custom Difference Cursor */}
      <div 
        className={`editorial-cursor hidden md:block ${isHovering ? 'hovering' : ''}`}
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />

      <Header />

      <main className="flex-1 w-full relative z-10 pt-24 pb-16">
        {currentView === 'home' && <HomePage />}
        {currentView === 'report' && <ReportIssuePage />}
        {currentView === 'dashboard' && <AdminDashboardPage />}
        {currentView === 'details' && <ComplaintDetailsPage />}
      </main>

      <footer className="bg-[#0A0A0A] text-white py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <h4 className="text-2xl mb-2 tracking-[-0.05em]">CivicLens</h4>
            <p className="text-[#737373] text-sm font-mono uppercase tracking-[0.1em]">Municipal Intelligence</p>
          </div>
          <div className="text-right">
            <p className="text-[#737373] text-xs">SYS_STAT: OPERATIONAL</p>
            <p className="text-[#737373] text-xs">© 2026</p>
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
