import React from 'react';
import { useApp } from '../context/AppContext';
import { Lightbulb, AlertCircle, BarChart3, Home } from 'lucide-react';
import { PageView } from '../types';

export const Header: React.FC = () => {
  const { currentView, navigateTo } = useApp();

  const navItems: { label: string; view: PageView; icon: React.ReactNode }[] = [
    { label: 'Home', view: 'home', icon: <Home className="w-4 h-4" /> },
    { label: 'Report Issue', view: 'report', icon: <AlertCircle className="w-4 h-4" /> },
    { label: 'Dashboard', view: 'dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo and Name */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
            <Lightbulb className="w-5 h-5 fill-white/20" />
          </div>
          <div className="text-left">
            <span className="font-heading font-bold text-lg text-slate-900 tracking-tight block leading-none">
              CivicLens AI
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-wide">
              Municipal Issue Portal
            </span>
          </div>
        </button>

        {/* Navigation: Home | Report Issue | Dashboard */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view || (item.view === 'dashboard' && currentView === 'details');
            return (
              <button
                key={item.label}
                onClick={() => navigateTo(item.view)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
