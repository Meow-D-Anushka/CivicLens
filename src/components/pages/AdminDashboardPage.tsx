import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, AIResultType } from '../../types';
import { 
  FileText, 
  CheckCircle2, 
  Copy, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { complaints, selectedComplaint, selectComplaint, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'duplicates' | 'outages'>('all');

  // Stats
  const totalReports = 248;
  const uniqueIssues = 84;
  const duplicates = 142;
  const widerOutages = 22;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Likely Duplicate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Likely Duplicate
          </span>
        );
      case 'Wider Outage':
      case 'Possible Wider Outage':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Wider Outage
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Separate Fault
          </span>
        );
    }
  };

  const current = selectedComplaint || complaints[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Municipal Operations Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time streetlight reports, spatial clustering, and AI deduplication.
          </p>
        </div>

        <button
          onClick={() => navigateTo('report')}
          className="self-start sm:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          + Submit New Report
        </button>
      </div>

      {/* 4 Small Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Reports */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 block mb-1">
            Total Reports
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              {totalReports}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">+14 today</span>
          </div>
        </div>

        {/* Card 2: Unique Issues */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 block mb-1">
            Unique Issues
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-blue-700">
              {uniqueIssues}
            </span>
            <span className="text-[11px] text-blue-600 font-medium">Filtered</span>
          </div>
        </div>

        {/* Card 3: Duplicates */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 block mb-1">
            Duplicates
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-600">
              {duplicates}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold">57% saved</span>
          </div>
        </div>

        {/* Card 4: Possible Wider Outages */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 block mb-1">
            Possible Wider Outages
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-red-600">
              {widerOutages}
            </span>
            <span className="text-[11px] text-red-700 font-medium">3 active clusters</span>
          </div>
        </div>

      </div>

      {/* Main Content: Map + Recent Complaints List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Large City Map with Simple Colored Pins (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h2 className="font-heading font-bold text-base text-slate-900">
                City Streetlight Grid Map
              </h2>
            </div>
            
            {/* Simple Map Legend */}
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Unique
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Duplicate
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Outage
              </span>
            </div>
          </div>

          {/* Map Canvas */}
          <div className="relative flex-1 min-h-[360px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <svg viewBox="0 0 700 400" className="w-full h-full object-cover">
              {/* Background City Grid */}
              <rect width="700" height="400" fill="#F8FAFC" />
              
              {/* River line */}
              <path d="M 0 260 Q 200 240 380 300 T 700 220" fill="none" stroke="#E0F2FE" strokeWidth="36" />
              <path d="M 0 260 Q 200 240 380 300 T 700 220" fill="none" stroke="#BAE6FD" strokeWidth="20" />

              {/* Major arterial avenues */}
              <line x1="0" y1="120" x2="700" y2="120" stroke="#CBD5E1" strokeWidth="18" />
              <line x1="0" y1="200" x2="700" y2="200" stroke="#E2E8F0" strokeWidth="12" />
              <line x1="0" y1="320" x2="700" y2="320" stroke="#CBD5E1" strokeWidth="16" />

              {/* Cross Streets */}
              <line x1="160" y1="0" x2="160" y2="400" stroke="#CBD5E1" strokeWidth="14" />
              <line x1="320" y1="0" x2="320" y2="400" stroke="#E2E8F0" strokeWidth="12" />
              <line x1="480" y1="0" x2="480" y2="400" stroke="#CBD5E1" strokeWidth="16" />
              <line x1="600" y1="0" x2="600" y2="400" stroke="#E2E8F0" strokeWidth="10" />

              {/* Wider Outage Cluster Area Halo */}
              <circle cx="480" cy="120" r="50" fill="rgba(239, 68, 68, 0.12)" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4,4" />
            </svg>

            {/* Interactive Pins */}
            {complaints.map((c, index) => {
              const isSelected = current.id === c.id;
              
              // Coordinates mapping onto our svg 700x400
              const pinCoords: Record<string, { top: string; left: string }> = {
                'CL-1042': { top: '30%', left: '23%' },
                'CL-1039': { top: '32%', left: '26%' },
                'CL-1045': { top: '30%', left: '69%' },
                'CL-1048': { top: '50%', left: '46%' },
                'CL-1051': { top: '80%', left: '68%' },
              };
              const pos = pinCoords[c.id] || { top: `${25 + index * 15}%`, left: `${30 + index * 12}%` };

              const pinColor = 
                c.aiResult === 'Possible Wider Outage'
                  ? 'bg-red-600 text-white'
                  : c.aiResult === 'Likely Duplicate'
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-600 text-white';

              return (
                <button
                  key={c.id}
                  onClick={() => selectComplaint(c)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full shadow-md transition-transform duration-150 cursor-pointer ${pinColor} ${
                    isSelected ? 'scale-125 ring-4 ring-blue-400 z-20' : 'hover:scale-110 z-10'
                  }`}
                  title={`${c.id}: ${c.locationName}`}
                >
                  <MapPin className="w-4 h-4 fill-white" />
                </button>
              );
            })}

            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 border border-slate-200 shadow-xs">
              Showing 5 Active Pin Markers • Click a pin to inspect
            </div>
          </div>
        </div>

        {/* Right: Small Recent Complaints List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h2 className="font-heading font-bold text-base text-slate-900 mb-3">
              Recent Complaints
            </h2>

            {/* List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {complaints.map((item) => {
                const isSelected = current.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => selectComplaint(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Photo */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                      <img
                        src={item.photoUrl}
                        alt="Complaint thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[11px] font-bold text-slate-500">
                          {item.id}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {item.timeAgo}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-800 truncate">
                        {item.locationName}
                      </h4>

                      <div className="mt-1">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Small Detail Panel: Rendered for the Currently Selected Complaint */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Selected: {current.id}
              </span>
              <span className="text-xs text-slate-500">• {current.issueType}</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 mt-1">
              {current.locationName}
            </h3>
          </div>

          <button
            onClick={() => navigateTo('details', current.id)}
            className="self-start sm:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Full AI Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Detail Panel Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* 1. Complaint photo */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              Complaint Photo
            </span>
            <div className="h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src={current.photoUrl}
                alt="Complaint detailed photo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 2. Location details & Similar complaints */}
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Location Details
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {current.locationName}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {current.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Similar Nearby Complaints
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded font-medium text-slate-700">
                  {current.factors.complaintDensityCount} reported within 20m
                </span>
                <span className="text-xs text-slate-500">
                  Proximity: {current.factors.proximityMeters}m
                </span>
              </div>
            </div>
          </div>

          {/* 3. AI Result */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                AI Deduplication Result
              </span>

              <div className="mb-2">
                {getStatusBadge(current.aiResult)}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {current.aiExplanation}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-500">Image match:</span>
              <span className="font-bold text-slate-800">{current.factors.imageSimilarityPercent}%</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
