import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  SendHorizontal,
  RefreshCw,
  X
} from 'lucide-react';
import { IssueType } from '../../types';

export const ReportIssuePage: React.FC = () => {
  const { submitNewReport, submissionResult, navigateTo, clearSubmissionResult } = useApp();

  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=600&auto=format&fit=crop&q=80'
  );
  const [locationName, setLocationName] = useState('Oak Street & 4th Avenue');
  const [issueType, setIssueType] = useState<IssueType>('Light Completely Out');
  const [description, setDescription] = useState(
    'Luminaire on the corner pole is dark. Crosswalk is unlit.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      submitNewReport({
        photoUrl,
        locationName,
        issueType,
        description,
      });
    }, 700);
  };

  const samplePhotos = [
    { label: 'Outage 1', url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=600&auto=format&fit=crop&q=80' },
    { label: 'Outage 2', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80' },
    { label: 'Flicker', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Report a Streetlight Issue
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Fill out the details below. Our AI checks for existing nearby complaints automatically.
        </p>
      </div>

      {/* Result Card: Shown After Submission */}
      {submissionResult && submissionResult.hasMatch ? (
        <div className="bg-white rounded-2xl border-2 border-amber-400 p-6 sm:p-8 shadow-lg space-y-6 animate-in fade-in duration-200">
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <div className="inline-block px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-semibold mb-1">
                AI Proximity Match
              </div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900">
                Possible existing complaint found
              </h2>
              <p className="text-slate-700 text-base font-medium mt-1">
                “A similar complaint was reported 15 m away.”
              </p>
            </div>
          </div>

          {/* AI Match Metrics Card */}
          <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-amber-300 shrink-0">
                <img
                  src={submissionResult.matchedComplaint?.photoUrl || photoUrl}
                  alt="Existing complaint"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Existing Report ID: {submissionResult.matchedComplaint?.id || 'CL-1042'}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {submissionResult.matchedComplaint?.locationName || 'Oak Street & 4th Avenue'}
                </span>
              </div>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
              <span className="text-xs text-slate-500 font-medium">Image similarity:</span>
              <span className="font-heading font-extrabold text-2xl text-amber-700">
                91%
              </span>
            </div>
          </div>

          {/* Prompt Buttons: View Existing Complaint & Submit Anyway */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const targetId = submissionResult.matchedComplaint?.id || 'CL-1042';
                clearSubmissionResult();
                navigateTo('details', targetId);
              }}
              className="w-full sm:flex-1 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-heading font-semibold text-sm sm:text-base rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View Existing Complaint</span>
            </button>

            <button
              type="button"
              onClick={() => {
                clearSubmissionResult();
                navigateTo('dashboard');
              }}
              className="w-full sm:w-auto py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-semibold text-sm sm:text-base rounded-xl transition-colors cursor-pointer border border-slate-300"
            >
              Submit Anyway
            </button>
          </div>

        </div>
      ) : (
        /* The Simple Form */
        <form 
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* 1. Upload Photo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              1. Upload Photo
            </label>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Photo Preview */}
                <div className="relative w-28 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-200 shrink-0">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 bg-black/60 rounded px-1 text-[10px] text-white">
                    Preview
                  </div>
                </div>

                {/* Upload action or quick selector */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-xs text-slate-600">
                    Snap or upload a photo of the damaged or dark streetlight fixture.
                  </p>
                  
                  {/* Preset quick test selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">Sample photos:</span>
                    {samplePhotos.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(p.url)}
                        className={`text-[11px] px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                          photoUrl === p.url
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Location with small map and GPS pin */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              2. Location with small map and GPS pin
            </label>

            <div className="space-y-3">
              <div className="relative">
                <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Oak Street & 4th Avenue"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Small Map with GPS Pin */}
              <div className="relative h-40 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <svg viewBox="0 0 600 240" className="w-full h-full object-cover">
                  {/* Map Grid Roads */}
                  <rect width="600" height="240" fill="#F1F5F9" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#CBD5E1" strokeWidth="24" />
                  <line x1="300" y1="0" x2="300" y2="240" stroke="#CBD5E1" strokeWidth="24" />
                  <line x1="140" y1="0" x2="140" y2="240" stroke="#E2E8F0" strokeWidth="12" />
                  <line x1="460" y1="0" x2="460" y2="240" stroke="#E2E8F0" strokeWidth="12" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#E2E8F0" strokeWidth="10" />
                  <line x1="0" y1="180" x2="600" y2="180" stroke="#E2E8F0" strokeWidth="10" />

                  {/* Proximity scanning radius circle */}
                  <circle cx="300" cy="120" r="45" fill="rgba(59, 130, 246, 0.15)" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4,4" />
                  
                  {/* Adjacent existing complaints pins */}
                  <circle cx="285" cy="115" r="5" fill="#EF4444" />
                  <circle cx="315" cy="128" r="5" fill="#EF4444" />
                </svg>

                {/* Primary Animated GPS Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                    <MapPin className="w-5 h-5 fill-white" />
                  </div>
                  <span className="bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow mt-1">
                    GPS: 40.7128, -74.0060
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-slate-600 border border-slate-200">
                  Interactive GIS Pinning
                </div>
              </div>
            </div>
          </div>

          {/* 3. Issue Type dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              3. Issue Type
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as IssueType)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="Light Completely Out">Light Completely Out</option>
              <option value="Flickering Continuously">Flickering Continuously</option>
              <option value="Damaged Pole / Exposed Wiring">Damaged Pole / Exposed Wiring</option>
              <option value="Light On During Daytime">Light On During Daytime</option>
            </select>
          </div>

          {/* 4. Short Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              4. Short Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief description of the issue..."
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* 5. Large “Check & Submit” button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-heading font-semibold text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Checking Nearby Complaints with AI...</span>
                </>
              ) : (
                <>
                  <span>Check & Submit</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
