import React, { createContext, useContext, useState, useEffect } from 'react';
import { Complaint, PageView, IssueType } from '../types';
import { INITIAL_COMPLAINTS } from '../data/mockComplaints';
import { fetchReports, createReport, updateReportAction as apiUpdateReportAction } from '../lib/api';

interface AppContextType {
  currentView: PageView;
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  isLoadingComplaints: boolean;
  loadError: string | null;
  submissionResult: {
    isChecking: boolean;
    hasMatch: boolean;
    pendingComplaint: Complaint | null;
    matchedComplaint: Complaint | null;
  } | null;
  submitError: string | null;
  navigateTo: (view: PageView, complaintId?: string) => void;
  submitNewReport: (report: {
    photoFile: File;
    locationName: string;
    issueType: IssueType;
    description: string;
    coords?: { lat: number; lng: number };
  }) => Promise<void>;
  confirmReportAction: (complaintId: string, action: 'Confirmed Duplicate' | 'Kept Separate') => Promise<void>;
  selectComplaint: (complaint: Complaint) => void;
  clearSubmissionResult: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Updated storage key to force cache reset and load new local images
const STORAGE_KEY = 'civic_lens_v6_final';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<PageView>('home');
  
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to parse LocalStorage", e);
      }
    }
    return INITIAL_COMPLAINTS;
  });

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [submissionResult, setSubmissionResult] = useState<{
    isChecking: boolean;
    hasMatch: boolean;
    pendingComplaint: Complaint | null;
    matchedComplaint: Complaint | null;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  }, [complaints]);

  // Load the real report list from the backend on first mount. The
  // locally-cached / mock complaints set above render immediately so the
  // UI never shows a blank state, and are replaced once the fetch resolves.
  // If the backend is unreachable, we keep whatever we already have and
  // surface the error rather than breaking the page.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const reports = await fetchReports();
        if (!cancelled) {
          setComplaints(reports);
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Could not reach the CivicLens backend.'
          );
        }
      } finally {
        if (!cancelled) setIsLoadingComplaints(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (complaints.length > 0 && !selectedComplaint) {
      setSelectedComplaint(complaints[0]);
    }
  }, [complaints, selectedComplaint]);

  const navigateTo = (view: PageView, complaintId?: string) => {
    if (complaintId) {
      const found = complaints.find((c) => c.id === complaintId);
      if (found) setSelectedComplaint(found);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const submitNewReport = async (report: {
    photoFile: File;
    locationName: string;
    issueType: IssueType;
    description: string;
    coords?: { lat: number; lng: number };
  }) => {
    setSubmitError(null);

    // Pick an existing complaint to simulate the AI proximity/visual match
    // against. There's nothing to match on the very first-ever report.
    const randomIndex = Math.floor(Math.random() * Math.min(complaints.length, 4));
    const matched = complaints.length > 0 ? complaints[randomIndex] || complaints[0] : null;

    const simPercent = Math.floor(Math.random() * (98 - 72 + 1)) + 72;
    const proxMeters = Math.floor(Math.random() * (45 - 5 + 1)) + 5;
    const density = Math.floor(Math.random() * 4) + 1;

    // Use the reporter's real coordinates when available (from the browser's
    // Geolocation API). Only fall back to a randomized placeholder near the
    // matched complaint if no real location was captured.
    const coords =
      report.coords ||
      (matched
        ? {
            lat: matched.coords.lat + (Math.random() * 0.01 - 0.005),
            lng: matched.coords.lng + (Math.random() * 0.01 - 0.005),
          }
        : undefined);

    try {
      const newComplaint = await createReport({
        photoFile: report.photoFile,
        issueType: report.issueType,
        description: report.description,
        locationName: report.locationName || 'Unspecified Location',
        coords,
        status: 'Likely Duplicate',
        aiResult: 'Likely Duplicate',
        imageSimilarityPercent: simPercent,
        proximityMeters: proxMeters,
        complaintDensityCount: density,
        aiExplanation: `${density} similar complaints found within a 50m radius with matching visual features.`,
        similarComplaintId: matched?.id,
      });

      setComplaints((prev) => [newComplaint, ...prev]);

      if (matched) {
        setSubmissionResult({
          isChecking: false,
          hasMatch: true,
          pendingComplaint: newComplaint,
          matchedComplaint: matched,
        });
      } else {
        // Nothing to compare the very first report against — just take the
        // reporter straight to the dashboard so they see it landed.
        navigateTo('dashboard', newComplaint.id);
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Could not submit the report. Please try again.'
      );
      throw err;
    }
  };

  const confirmReportAction = async (complaintId: string, action: 'Confirmed Duplicate' | 'Kept Separate') => {
    const status = action === 'Confirmed Duplicate' ? 'Likely Duplicate' : 'Separate Fault';

    // Optimistic local update so the UI feels instant.
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status, confirmedAction: action } : c))
    );
    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint((prev) => (prev ? { ...prev, status, confirmedAction: action } : null));
    }

    try {
      const updated = await apiUpdateReportAction(complaintId, { status, confirmedAction: action });
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint(updated);
      }
    } catch (err) {
      // The optimistic update above already reflects the user's choice;
      // just log it since the backend didn't persist the change.
      console.error('Failed to persist report action:', err);
    }
  };

  const clearSubmissionResult = () => {
    setSubmissionResult(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        complaints,
        selectedComplaint,
        isLoadingComplaints,
        loadError,
        submissionResult,
        submitError,
        navigateTo,
        submitNewReport,
        confirmReportAction,
        selectComplaint,
        clearSubmissionResult,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
