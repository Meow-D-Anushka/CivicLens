import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { currentView, navigateTo } = useApp();

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl z-50 glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-[0_0_20px_-10px_rgba(139,92,246,0.2)]">
      {/* Logo */}
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigateTo('home')}
      >
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]"></div>
        <span className="font-heading text-2xl tracking-tight text-white mt-1">CivicLens</span>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-6">
        <button 
          onClick={() => navigateTo('home')}
          className={`text-[11px] uppercase tracking-widest font-medium transition-colors hover:text-white ${currentView === 'home' ? 'text-white' : 'text-neutral-400'}`}
        >
          System
        </button>
        <button 
          onClick={() => navigateTo('dashboard')}
          className={`text-[11px] uppercase tracking-widest font-medium transition-colors hover:text-white ${currentView === 'dashboard' ? 'text-white' : 'text-neutral-400'}`}
        >
          Dashboard
        </button>
      </nav>

      {/* CTA Button */}
      <button 
        onClick={() => navigateTo('report')}
        className="bg-white text-black px-5 py-2 rounded-full text-xs font-semibold hover:bg-neutral-200 transition-colors"
      >
        Report Issue
      </button>
    </header>
  );
};
