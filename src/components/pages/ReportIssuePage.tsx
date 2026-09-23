import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  ArrowRight, 
  Eye, 
  RefreshCw 
} from 'lucide-react';

type ExtendedIssueType = 'Light Completely Out' | 'Flickering Continuously' | 'Damaged Pole / Exposed Wiring' | 'Light On During Daytime' | 'Other (specify)';

export const ReportIssuePage: React.FC = () => {
  const { submitNewReport, submissionResult, navigateTo, clearSubmissionResult } = useApp();

  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [locationName, setLocationName] = useState('');
  const [issueType, setIssueType] = useState<ExtendedIssueType>('Light Completely Out');
  const [customIssueType, setCustomIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    const finalIssueType = issueType === 'Other (specify)' && customIssueType.trim() !== '' 
      ? customIssueType 
      : issueType;

    setTimeout(() => {
      setIsAnalyzing(false);
      submitNewReport({
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=600',
        locationName,
        issueType: finalIssueType as any,
        description,
      });
    }, 700);
  };

  const samplePhotos = [
    { label: 'Dark Road', url: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=600' },
    { label: 'Broken Pole', url: '/broken-pole.jpg' },
    { label: 'Flickering', url: '/flickering.jpg' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 relative z-10">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="font-heading text-4xl sm:text-5xl text-white tracking-tight mb-3">
          Report an Issue
        </h1>
        <p className="text-neutral-400 text-sm md:text-base font-light">
          Submit infrastructure anomalies. AI proximity radar is active.
        </p>
      </div>

      {submissionResult && submissionResult.hasMatch ? (
        <div className="glass-panel rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-[0_0_40px_-10px_rgba(245,158,11,0.15)] animate-in fade-in duration-300">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <div className="inline-block px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] uppercase tracking-widest mb-3 border border-amber-500/20">
                Proximity Match Detected
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl text-white mb-2">
                Existing complaint found
              </h2>
              <p className="text-neutral-400 text-sm">
                System radar indicates a highly similar anomaly logged {submissionResult.pendingComplaint?.factors?.proximityMeters || 15}m from your coordinates.
              </p>
            </div>
          </div>

          <div className="bg-black/40 rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                <img
                  src={submissionResult.matchedComplaint?.photoUrl || photoUrl}
                  alt="Existing complaint"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div>
                <span className="font-mono text-[10px] text-neutral-500 tracking-widest block mb-1">
                  REF: {submissionResult.matchedComplaint?.id || 'CL-1042'}
                </span>
                <span className="text-sm font-medium text-white block">
                  {submissionResult.matchedComplaint?.locationName || 'Oak Street & 4th Avenue'}
                </span>
              </div>
            </div>

            <div className="text-center sm:text-right w-full sm:w-auto p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">Match Confidence</span>
              <span className="font-mono text-2xl text-amber-400">
                {submissionResult.pendingComplaint?.factors?.imageSimilarityPercent || 91}%
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={() => {
                const targetId = submissionResult.matchedComplaint?.id || 'CL-1042';
                clearSubmissionResult();
                navigateTo('details', targetId);
              }}
              className="w-full sm:flex-1 py-4 px-6 bg-white hover:bg-neutral-200 text-black font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View Existing Report</span>
            </button>

            <button
              type="button"
              onClick={() => {
                clearSubmissionResult();
                navigateTo('dashboard');
              }}
              className="w-full sm:w-auto py-4 px-6 bg-transparent hover:bg-white/5 text-white font-medium text-sm rounded-xl transition-colors cursor-pointer border border-white/10"
            >
              Force Submit
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-10 space-y-8">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 mb-3">
              01. Visual Evidence
            </label>

            <div className="border border-dashed border-white/20 rounded-2xl p-5 bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center shrink-0">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover opacity-90" />
                  ) : (
                    <Camera className="w-6 h-6 text-neutral-500" />
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs text-neutral-400 mb-4">
                    Upload a clear image of the infrastructure anomaly.
                  </p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mr-2">Test Assets:</span>
                    {samplePhotos.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(p.url)}
                        className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          photoUrl === p.url
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white'
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

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 mb-3">
              02. Geolocation coordinates
            </label>

            <div className="space-y-4">
              <div className="relative">
                <MapPin className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Sector 17, Main Boulevard"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              {/* Updated map code block */}
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-white/10 bg-white">
                <svg viewBox="0 0 600 240" className="w-full h-full object-cover">
                  <rect width="600" height="240" fill="#ffffff" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="32" />
                  <line x1="300" y1="0" x2="300" y2="240" stroke="#f1f5f9" strokeWidth="32" />
                  <circle cx="300" cy="120" r="45" fill="rgba(6,182,212,0.15)" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4,4" />
                </svg>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.6)] border-2 border-white">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>
              {/* End of updated map block */}

            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 mb-3">
              03. Anomaly Classification
            </label>
            <div className="space-y-3">
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as ExtendedIssueType)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer appearance-none"
              >
                <option value="Light Completely Out">Light Completely Out</option>
                <option value="Flickering Continuously">Flickering Continuously</option>
                <option value="Damaged Pole / Exposed Wiring">Damaged Pole / Exposed Wiring</option>
                <option value="Light On During Daytime">Light On During Daytime</option>
                <option value="Other (specify)">Other (specify)</option>
              </select>

              {issueType === 'Other (specify)' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    value={customIssueType}
                    onChange={(e) => setCustomIssueType(e.target.value)}
                    placeholder="Please specify the issue..."
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-cyan-500/50 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 mb-3">
              04. Additional Context
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the severity or specific details..."
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="group relative w-full inline-flex items-center justify-center p-[1px] rounded-xl overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,#8b5cf6_40%,#06b6d4_50%,transparent_60%)] animate-[spin_4s_linear_infinite]" />
              <span className="relative w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#0a0a0a] rounded-xl font-medium text-white transition-all group-hover:bg-[#151515]">
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                    <span>Running Synapse Radar...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Scan & Submit</span>
                    <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
