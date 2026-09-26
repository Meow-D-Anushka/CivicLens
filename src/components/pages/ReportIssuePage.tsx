import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { urlToFile } from '../../lib/api';
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  ArrowRight, 
  Eye, 
  RefreshCw,
  Upload,
  LocateFixed,
  X,
} from 'lucide-react';

type ExtendedIssueType = 'Light Completely Out' | 'Flickering Continuously' | 'Damaged Pole / Exposed Wiring' | 'Light On During Daytime' | 'Other (specify)';

type LocationStatus = 'idle' | 'locating' | 'success' | 'error';

// Used when the reporter doesn't attach their own photo, so the submission
// still carries a real file through to the backend (which requires one).
const DEFAULT_PHOTO_URL =
  'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=600';

export const ReportIssuePage: React.FC = () => {
  const { submitNewReport, submissionResult, navigateTo, clearSubmissionResult, submitError } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [photoError, setPhotoError] = useState<string>('');
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationError, setLocationError] = useState('');

  const [issueType, setIssueType] = useState<ExtendedIssueType>('Light Completely Out');
  const [customIssueType, setCustomIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.');
      return;
    }

    // Cap at 8MB so we don't choke the browser turning it into a data URL.
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('Image is too large (max 8MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
      setPhotoFile(file);
      setPhotoFileName(file.name);
    };
    reader.onerror = () => {
      setPhotoError('Could not read that file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoUrl('');
    setPhotoFile(null);
    setPhotoFileName('');
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectSample = async (sample: { label: string; url: string }) => {
    setPhotoError('');
    setIsLoadingSample(true);
    try {
      const filename = `${sample.label.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      const file = await urlToFile(sample.url, filename);
      setPhotoFile(file);
      setPhotoUrl(sample.url);
      setPhotoFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setPhotoError('Could not load that sample image. Please try uploading your own.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleUseMyLocation = () => {
    setLocationError('');

    if (!('geolocation' in navigator)) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setLocationStatus('locating');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          // Reverse-geocode the real coordinates into a human-readable
          // address via OpenStreetMap's free Nominatim API (no key needed).
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { Accept: 'application/json' } }
          );

          if (!res.ok) throw new Error('Reverse geocoding failed');

          const data = await res.json();
          const label = data?.display_name as string | undefined;

          setLocationName(label || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          setLocationStatus('success');
        } catch (err) {
          // Coordinates are still real and usable even if the address
          // lookup fails — just fall back to showing raw coordinates.
          setLocationName(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          setLocationStatus('success');
        }
      },
      (err) => {
        setLocationStatus('error');
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Enter the location manually below.');
        } else {
          setLocationError('Could not determine your location. Enter it manually below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setPhotoError('');

    const finalIssueType = issueType === 'Other (specify)' && customIssueType.trim() !== '' 
      ? customIssueType 
      : issueType;

    try {
      // Fall back to the default sample image so the submission always
      // carries a real file through to the backend, which requires one.
      const fileToUpload = photoFile || (await urlToFile(DEFAULT_PHOTO_URL, 'streetlight.jpg'));

      await submitNewReport({
        photoFile: fileToUpload,
        locationName,
        issueType: finalIssueType as any,
        description,
        coords: coords || undefined,
      });
    } catch {
      // submitError from context carries the message; nothing else to do here.
    } finally {
      setIsAnalyzing(false);
    }
  };

  const samplePhotos = [
    { label: 'Dark Road', url: DEFAULT_PHOTO_URL },
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
                    <>
                      <img src={photoUrl} alt="Preview" className="editorial-image w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={clearPhoto}
                        aria-label="Remove photo"
                        className="absolute top-1 right-1 w-5 h-5 bg-black text-white flex items-center justify-center cursor-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <Camera className="w-6 h-6 text-[#737373]" />
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-[#525252] mb-4">
                    Upload a real photo of the infrastructure anomaly from your device.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />

                  <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-4 py-2 border border-black bg-black text-white hover:bg-[#525252] transition-colors cursor-none uppercase font-mono flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {photoUrl ? 'Replace Photo' : 'Upload Photo'}
                    </button>
                    {photoFileName && (
                      <span className="text-xs text-[#525252] font-mono truncate max-w-[160px]">
                        {photoFileName}
                      </span>
                    )}
                  </div>

                  {photoError && (
                    <p className="text-xs text-red-600 mt-3">{photoError}</p>
                  )}

                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mt-4 pt-4 border-t border-black/10">
                    <span className="editorial-meta mr-1 text-xs">Or try a sample:</span>
                    {samplePhotos.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isLoadingSample}
                        onClick={() => handleSelectSample(p)}
                        className={`text-xs px-3 py-1.5 border transition-all cursor-none uppercase font-mono disabled:opacity-50 ${
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
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-black absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => {
                      setLocationName(e.target.value);
                      // Manual edits invalidate the captured GPS coords so we
                      // don't silently attach stale coordinates to a typed address.
                      if (coords) setCoords(null);
                      if (locationStatus !== 'idle') setLocationStatus('idle');
                    }}
                    placeholder="e.g. Sector 17, Main Boulevard"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white border border-black text-sm text-black placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-black cursor-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locationStatus === 'locating'}
                  className="shrink-0 px-4 py-3 border border-black bg-white hover:bg-[#F5F5F5] text-black text-xs uppercase font-mono tracking-[0.05em] transition-colors cursor-none flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {locationStatus === 'locating' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LocateFixed className="w-3.5 h-3.5" />
                  )}
                  <span>{locationStatus === 'locating' ? 'Locating…' : 'Use My Location'}</span>
                </button>
              </div>

              {locationStatus === 'error' && locationError && (
                <p className="text-xs text-red-600">{locationError}</p>
              )}

              {coords && locationStatus === 'success' && (
                <p className="text-xs text-[#525252] font-mono">
                  GPS lock: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </p>
              )}

              <div className="relative h-40 w-full overflow-hidden border border-black bg-white">
                {coords ? (
                  <iframe
                    key={`${coords.lat}-${coords.lng}`}
                    title="Reported location map"
                    className="w-full h-full border-0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.004}%2C${coords.lat - 0.003}%2C${coords.lng + 0.004}%2C${coords.lat + 0.003}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
                  />
                ) : (
                  <>
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

                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 pointer-events-none">
                      <span className="editorial-meta text-[10px] text-[#737373] bg-white/90 px-3 py-1 border border-black/10">
                        Map appears once a location is set
                      </span>
                    </div>
                  </>
                )}
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

          {submitError && (
            <p className="text-xs text-red-600 -mt-4">{submitError}</p>
          )}

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
