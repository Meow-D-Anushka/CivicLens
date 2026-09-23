import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { currentView, navigateTo } = useApp();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-black/10 px-6 py-5 flex items-center justify-between">
      <div 
        className="flex items-center cursor-pointer"
        onClick={() => navigateTo('home')}
      >
        <span className="font-bold text-2xl tracking-[-0.05em] text-black uppercase">CivicLens</span>
      </div>

      <nav className="hidden md:flex items-center gap-10">
        <button 
          onClick={() => navigateTo('home')}
          className={`editorial-meta transition-colors cursor-none ${currentView === 'home' ? 'text-black' : 'text-[#737373] hover:text-black'}`}
        >
          System
        </button>
        <button 
          onClick={() => navigateTo('dashboard')}
          className={`editorial-meta transition-colors cursor-none ${currentView === 'dashboard' ? 'text-black' : 'text-[#737373] hover:text-black'}`}
        >
          Dashboard
        </button>
      </nav>

      <button 
        onClick={() => navigateTo('report')}
        className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#525252] transition-colors cursor-none"
      >
        Report Issue
      </button>
    </header>
  );
};
