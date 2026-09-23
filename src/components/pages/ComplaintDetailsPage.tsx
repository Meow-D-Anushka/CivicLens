import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockComplaints } from '../../data/mockComplaints';
import { 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

export const ComplaintDetailsPage: React.FC = () => {
  const { selectedComplaintId, selectedComplaint, complaints, confirmReportAction, navigateTo } = useApp();
  
  // Find the exact complaint matching the selected ID across mockComplaints
  const complaint = mockComplaints.find(c => c.id === selectedComplaintId) || selectedComplaint || complaints[0] || mockComplaints[0];

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
    <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
      
      {/* Top back navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigateTo('dashboard')}
          className="inline-flex items-center gap-2 editorial-meta text-black hover:text-[#525252] transition-colors cursor-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="editorial-meta text-xs">
          Complaint Record {complaint.id}
        </span>
      </div>

      {/* Page Title */}
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-5xl text-black uppercase tracking-[-0.05em]">
            Complaint Analysis
          </h1>
          <span className="px-3 py-1 border border-black text-xs font-mono uppercase bg-[#FAFAFA]">
            {complaint.id}
          </span>
        </div>
        <p className="text-[#525252] font-mono text-xs uppercase mt-2">
          {complaint.locationName} • Reported telemetry active
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Complaint Photo + Location Map */}
        <div className="space-y-8">
          
          {/* Complaint Photo */}
          <div className="bg-white border border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <span className="editorial-meta text-xs block">
              Evidence Photo
            </span>
            <div className="relative h-72 border border-black overflow-hidden bg-[#FAFAFA]">
              <img
                src={complaint.photoUrl}
                alt="Complaint street view"
                className="editorial-image w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black text-white text-[10px] font-mono uppercase px-2.5 py-1 tracking-wider border border-white/20">
                {complaint.issueType}
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white border border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="editorial-meta text-xs block">
                Location Map
              </span>
              <span className="font-mono text-xs text-[#525252] uppercase">
                GPS: {complaint.coords?.lat || '19.0330'}, {complaint.coords?.lng || '73.0297'}
              </span>
            </div>

            <div className="relative h-52 border border-black bg-white overflow-hidden">
              <svg viewBox="0 0 500 220" className="w-full h-full object-cover">
                <rect width="500" height="220" fill="#FFFFFF" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#E5E5E5" strokeWidth="20" />
                <line x1="250" y1="0" x2="250" y2="220" stroke="#E5E5E5" strokeWidth="20" />
                <circle cx="250" cy="110" r="50" fill="rgba(0,0,0,0.05)" stroke="#000000" strokeWidth="1.5" strokeDasharray="4,4" />
              </svg>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-md border-2 border-white">
                  <MapPin className="w-4 h-4 fill-white" />
                </div>
              </div>

              <div className="absolute bottom-2 left-2 bg-white border border-black px-2 py-1 text-[10px] text-black font-mono uppercase">
                {complaint.locationName}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Analysis */}
        <div className="bg-white border border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          
          <div className="flex items-center gap-2 pb-4 border-b border-black">
            <Sparkles className="w-5 h-5 text-black" />
            <h2 className="font-bold text-xl text-black uppercase tracking-tight">
              AI Telemetry Analysis
            </h2>
          </div>

          <div className="space-y-4">
            <span className="editorial-meta text-xs block">
              Triangulation Factors
            </span>

            {/* Factor 1 */}
            <div className="p-4 bg-[#FAFAFA] border border-black flex items-center justify-between">
              <div>
                <span className="editorial-meta text-[10px] block mb-1">Factor 1</span>
                <span className="text-sm font-bold text-black">Image Similarity</span>
              </div>
              <span className="font-mono text-2xl font-bold text-black">
                {complaint.factors?.imageSimilarityPercent || complaint.aiConfidence || 90}%
              </span>
            </div>

            {/* Factor 2 */}
            <div className="p-4 bg-[#FAFAFA] border border-black flex items-center justify-between">
              <div>
                <span className="editorial-meta text-[10px] block mb-1">Factor 2</span>
                <span className="text-sm font-bold text-black">Location Proximity</span>
              </div>
              <span className="font-mono text-2xl font-bold text-black">
                {complaint.factors?.proximityMeters || 15} m
              </span>
            </div>

            {/* Factor 3 */}
            <div className="p-4 bg-[#FAFAFA] border border-black flex items-center justify-between">
              <div>
                <span className="editorial-meta text-[10px] block mb-1">Factor 3</span>
                <span className="text-sm font-bold text-black">Complaint Density</span>
              </div>
              <span className="font-mono text-2xl font-bold text-black">
                {complaint.factors?.complaintDensityCount || 1} reports
              </span>
            </div>
          </div>

          {/* AI Result Block */}
          <div className="p-5 bg-[#FAFAFA] border border-black space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-black bg-black text-white">
                AI Result
              </span>
              <span className="font-bold text-base text-black uppercase">
                {complaint.aiResult || complaint.status}
              </span>
            </div>
            <p className="text-sm text-[#525252] leading-relaxed">
              “{complaint.aiExplanation || complaint.description}”
            </p>
          </div>

          {feedbackMessage && (
            <div className="p-3 bg-white border border-black text-xs font-mono uppercase text-black flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleToggleConfirm}
              className="w-full py-4 bg-black hover:bg-[#525252] text-white font-bold text-xs uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 cursor-none"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isDuplicateConfirmed ? 'Confirm Duplicate (Click to Keep Separate)' : 'Keep Separate (Click to Confirm Duplicate)'}
              </span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
