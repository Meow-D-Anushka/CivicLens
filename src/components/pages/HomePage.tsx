import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      
      {/* Main Hero Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        
        {/* Left: Text & Primary Action */}
        <div className="flex-1 text-left space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Municipal Service</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-[1.15]">
            Report a Streetlight Problem
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
            Our AI checks nearby complaints to reduce duplicates and identify possible wider outages.
          </p>

          <div className="pt-2">
            {/* One Large Primary Button */}
            <button
              onClick={() => navigateTo('report')}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-heading font-semibold text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Report an Issue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant AI Verification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>GPS Proximity Match</span>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Animated Map */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner overflow-hidden">
            
            <div className="relative h-64 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              {/* Map Canvas */}
              <svg viewBox="0 0 600 400" className="w-full h-full object-cover">
                {/* Background Grid */}
                <rect width="600" height="400" fill="#F8FAFC" />
                
                {/* Roads */}
                <line x1="0" y1="150" x2="600" y2="150" stroke="#E2E8F0" strokeWidth="30" />
                <line x1="0" y1="280" x2="600" y2="280" stroke="#F1F5F9" strokeWidth="20" />
                <line x1="200" y1="0" x2="200" y2="400" stroke="#E2E8F0" strokeWidth="30" />
                <line x1="450" y1="0" x2="450" y2="400" stroke="#F1F5F9" strokeWidth="24" />
                
                {/* Radar/Scanning Animation */}
                <circle cx="300" cy="150" r="80" fill="rgba(59, 130, 246, 0.1)" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6,6">
                  <animate attributeName="r" values="0;120" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="300" cy="150" r="40" fill="rgba(59, 130, 246, 0.2)" />
              </svg>

              {/* Center GPS Pin */}
              <div className="absolute top-[37.5%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl border-4 border-white animate-bounce">
                  <MapPin className="w-5 h-5 fill-white" />
                </div>
              </div>
              
              {/* Float badge matching previous design */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-lg p-2.5 shadow-md border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">Nearby Check</span>
                  <span className="text-[11px] text-slate-500">15m radius scan</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                  Active AI Radar
                </span>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-400 mt-2">
              Illustration: Smart GIS Pinning & Visual Deduplication
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
