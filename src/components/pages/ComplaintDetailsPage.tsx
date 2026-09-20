import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  AlertTriangle, 
  Percent, 
  Maximize2,
  Navigation,
  Layers
} from 'lucide-react';

export const ComplaintDetailsPage: React.FC = () => {
  const { selectedComplaint, complaints, confirmReportAction, navigateTo } = useApp();
  
  // Default to CL-1042 if none selected
  const complaint = selectedComplaint || complaints[0];

  const [isDuplicateConfirmed, setIsDuplicateConfirmed] = useState<boolean>(
    complaint.confirmedAction === 'Confirmed Duplicate' || complaint.status === 'Likely Duplicate'
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleToggleConfirm = () => {
    if (isDuplicateConfirmed) {
      setIsDuplicateConfirmed(false);
      confirmReportAction(complaint.id, 'Kept Separate');
      setFeedbackMessage('Marked as Separate Fault. Crew dispatched independently.');
    } else {
      setIsDuplicateConfirmed(true);
      confirmReportAction(complaint.id, 'Confirmed Duplicate');
      setFeedbackMessage('Confirmed as Duplicate. Consolidated into main master ticket.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('dashboard')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="font-mono text-xs text-slate-400">
          Complaint Record {complaint.id}
        </span>
      </div>

      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900">
            Complaint Analysis
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {complaint.id}
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          {complaint.locationName} • Reported {complaint.timeAgo}
        </p>
      </div>

      {/* One Simple Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Complaint Photo + Location Map */}
        <div className="space-y-6">
          
          {/* Complaint Photo */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Complaint Photo
            </span>
            <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src={complaint.photoUrl}
                alt="Complaint street view"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded backdrop-blur-xs font-mono">
                {complaint.issueType}
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Location Map
              </span>
              <span className="text-xs text-slate-500 font-mono">
                GPS: {complaint.coords.lat}, {complaint.coords.lng}
              </span>
            </div>

            <div className="relative h-52 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <svg viewBox="0 0 500 220" className="w-full h-full object-cover">
                <rect width="500" height="220" fill="#F8FAFC" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#CBD5E1" strokeWidth="20" />
                <line x1="250" y1="0" x2="250" y2="220" stroke="#CBD5E1" strokeWidth="20" />
                <line x1="120" y1="0" x2="120" y2="220" stroke="#E2E8F0" strokeWidth="10" />
                <line x1="380" y1="0" x2="380" y2="220" stroke="#E2E8F0" strokeWidth="10" />
                
                {/* 20m Proximity radius ring */}
                <circle cx="250" cy="110" r="50" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,4" />
                
                {/* Neighboring duplicate points */}
                <circle cx="235" cy="100" r="5" fill="#F59E0B" />
                <circle cx="265" cy="120" r="5" fill="#F59E0B" />
              </svg>

              {/* Central Map Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-4 h-4 fill-white" />
                </div>
              </div>

              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-slate-700 border border-slate-200 font-medium">
                {complaint.locationName}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Analysis */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="font-heading font-bold text-xl text-slate-900">
              AI Analysis
            </h2>
          </div>

          {/* Show Only Three Factors */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Triangulation Factors
            </span>

            {/* Factor 1: Image Similarity */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Factor 1
                </span>
                <span className="text-sm font-bold text-slate-800">
                  Image Similarity
                </span>
              </div>
              <div className="text-right">
                <span className="font-heading font-extrabold text-2xl text-blue-600">
                  {complaint.factors.imageSimilarityPercent}%
                </span>
              </div>
            </div>

            {/* Factor 2: Location Proximity */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Factor 2
                </span>
                <span className="text-sm font-bold text-slate-800">
                  Location Proximity
                </span>
              </div>
              <div className="text-right">
                <span className="font-heading font-extrabold text-2xl text-amber-600">
                  {complaint.factors.proximityMeters} m
                </span>
              </div>
            </div>

            {/* Factor 3: Complaint Density */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Factor 3
                </span>
                <span className="text-sm font-bold text-slate-800">
                  Complaint Density
                </span>
              </div>
              <div className="text-right">
                <span className="font-heading font-extrabold text-2xl text-purple-600">
                  {complaint.factors.complaintDensityCount} reports
                </span>
              </div>
            </div>
          </div>

          {/* AI Result Block */}
          <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                AI Result
              </span>
              <span className="font-heading font-bold text-lg text-amber-950">
                {complaint.aiResult}
              </span>
            </div>

            {/* Short explanation */}
            <p className="text-sm text-amber-900 font-medium leading-relaxed">
              “{complaint.aiExplanation}”
            </p>
          </div>

          {/* Feedback banner if toggled */}
          {feedbackMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* One Button: Confirm / Keep Separate */}
          <div className="pt-2">
            <button
              onClick={handleToggleConfirm}
              className={`w-full py-4 font-heading font-semibold text-base rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                isDuplicateConfirmed
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isDuplicateConfirmed ? 'Confirm Duplicate (Click to Keep Separate)' : 'Keep Separate (Click to Confirm Duplicate)'}
              </span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Toggles administrative validation for the municipal dispatch queue.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
