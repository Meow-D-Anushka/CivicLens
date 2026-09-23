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
    <div className="max-w-3xl mx-auto px-6 py-20 relative z-10">
      <div className="mb-12">
        <span className="editorial-meta text-black mb-3 block">01 // Intake Form</span>
        <h1 className="text-5xl md:text-6xl text-black uppercase tracking-[-0.05em] mb-4">
          Report an Issue
        </h1>
        <p className="text-[#525252] text-lg font-normal">
          Submit infrastructure anomalies. AI proximity radar is active.
        </p>
      </div>

      {submissionResult && submissionResult.hasMatch ? (
        <div className="bg-white border border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 animate-reveal">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <span className="editorial-meta text-black block mb-2">Proximity Match Detected</span>
              <h2 className="text-3xl text-black uppercase mb-2">
                Existing complaint found
              </h2>
              <p className="text-[#525252]">
                System radar indicates a highly similar anomaly logged {submissionResult.pendingComplaint?.factors?.proximityMeters || 15}m from your coordinates.
              </p>
            </div>
          </div>

          <div className="bg-[#F5F5F5] border border-black/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 overflow-hidden border border-black/20 shrink-0">
                <img
                  src={submissionResult.matchedComplaint?.photoUrl || photoUrl}
                  alt="Existing complaint"
                  className="editorial-image w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="editorial-meta block mb-1 text-xs">
                  REF: {submissionResult.matchedComplaint?.id || 'CL-1042'}
                </span>
                <span className="text-sm font-bold text-black block">
                  {submissionResult.matchedComplaint?.locationName || 'Oak Street & 4th Avenue'}
                </span>
              </div>
            </div>

            <div className="text-center sm:text-right p-3 bg-white border border-black/10 w-full sm:w-auto">
              <span className="editorial-meta block mb-1 text-[10px]">Match Confidence</span>
              <span className="font-mono text-2xl font-bold text-black">
                {submissionResult.pendingComplaint?.factors?.imageSimilarityPercent || 91}%
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                const targetId = submissionResult.matchedComplaint?.id || 'CL-1042';
                clearSubmissionResult();
                navigateTo('details', targetId);
              }}
              className="w-full sm:flex-1 py-4 px-6 bg-black hover:bg-[#525252] text-white font-bold text-xs uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 cursor-none"
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
              className="w-full sm:w-auto py-4 px-6 bg-white hover:bg-[#F5F5F5] text-black font-bold text-xs uppercase tracking-[0.1em] transition-colors border border-black cursor-none"
            >
              Force Submit
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-black p-8 md:p-12 space-y-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <label className="editorial-meta block text-black mb-3">
              01. Visual Evidence
            </label>

            <div className="border border-dashed border-black/30 p-6 bg-[#FAFAFA]">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-24 overflow-hidden border border-black bg-black/5 flex items-center justify-center shrink-0">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" className="editorial-image w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-[#737373]" />
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-[#525252] mb-4">
                    Upload or select a test asset of the infrastructure anomaly.
                  </p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span className="editorial-meta mr-2 text-xs">Assets:</span>
                    {samplePhotos.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(p.url)}
                        className={`text-xs px-3 py-1.5 border transition-all cursor-none uppercase font-mono ${
                          photoUrl === p.url
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-black/20 hover:border-black'
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
            <label className="editorial-meta block text-black mb-3">
              02. Geolocation Coordinates
            </label>

            <div className="space-y-4">
              <div className="relative">
                <MapPin className="w-4 h-4 text-black absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Sector 17, Main Boulevard"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-black text-sm text-black placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-black cursor-none"
                />
              </div>

              <div className="relative h-32 w-full overflow-hidden border border-black bg-white">
                <svg viewBox="0 0 600 240" className="w-full h-full object-cover">
                  <rect width="600" height="240" fill="#ffffff" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="32" />
                  <line x1="300" y1="0" x2="300" y2="240" stroke="#f1f5f9" strokeWidth="32" />
                  <circle cx="300" cy="120" r="45" fill="rgba(0,0,0,0.05)" stroke="#000000" strokeWidth="1.5" strokeDasharray="4,4" />
                </svg>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
                  <div className="w-6 h-6 bg-black text-white flex items-center justify-center">
                    <MapPin className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="editorial-meta block text-black mb-3">
              03. Anomaly Classification
            </label>
            <div className="space-y-3">
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as ExtendedIssueType)}
                className="w-full px-4 py-3 bg-white border border-black text-sm text-black focus:outline-none focus:ring-1 focus:ring-black cursor-none appearance-none"
              >
                <option value="Light Completely Out">Light Completely Out</option>
                <option value="Flickering Continuously">Flickering Continuously</option>
                <option value="Damaged Pole / Exposed Wiring">Damaged Pole / Exposed Wiring</option>
                <option value="Light On During Daytime">Light On During Daytime</option>
                <option value="Other (specify)">Other (specify)</option>
              </select>

              {issueType === 'Other (specify)' && (
                <div className="animate-reveal">
                  <input
                    type="text"
                    value={customIssueType}
                    onChange={(e) => setCustomIssueType(e.target.value)}
                    placeholder="Please specify the issue..."
                    required
                    className="w-full px-4 py-3 bg-white border border-black text-sm text-black placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-black cursor-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="editorial-meta block text-black mb-3">
              04. Additional Context
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the severity or specific details..."
              required
              className="w-full px-4 py-3 bg-white border border-black text-sm text-black placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-black cursor-none resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="group w-full py-5 bg-black hover:bg-[#525252] text-white font-bold text-xs uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-3 cursor-none disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Running AI Radar Scan...</span>
                </>
              ) : (
                <>
                  <span>Initialize Scan & Submit</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
