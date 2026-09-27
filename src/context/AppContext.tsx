import React, { createContext, useContext, useState, useEffect } from 'react';
import { Complaint, PageView, IssueType, DuplicateCandidate } from '../types';
import { INITIAL_COMPLAINTS } from '../data/mockComplaints';
import {
  fetchReports,
  fetchReportById,
  createReport,
  updateReportAction as apiUpdateReportAction,
  fetchGroupCandidates,
  fetchGroupMembers,
  setReportGroup as apiSetReportGroup,
  assignReport as apiAssignReport,
} from '../lib/api';

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
  loadGroupCandidates: (complaintId: string) => Promise<DuplicateCandidate[]>;
  loadGroupMembers: (complaintId: string) => Promise<Complaint[]>;
  flagAsDuplicateOf: (complaintId: string, groupWith: string) => Promise<void>;
  ungroupReport: (complaintId: string) => Promise<void>;
  assignToMaintenance: (complaintId: string, assignedTo: string | null) => Promise<void>;
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

    try {
      // Duplicate detection (perceptual photo hash + geo proximity) and the
      // AI photo-authenticity check both run server-side, against the real
      // uploaded photo and real coordinates — see backend/src/controllers/
      // reportsController.js. Nothing here is simulated.
      const newComplaint = await createReport({
        photoFile: report.photoFile,
        issueType: report.issueType,
        description: report.description,
        locationName: report.locationName || 'Unspecified Location',
        coords: report.coords,
      });

      setComplaints((prev) => [newComplaint, ...prev]);

      if (newComplaint.aiResult === 'Likely Duplicate' && newComplaint.similarComplaintId) {
        // Look for the matched report in what we already have locally first
        // to avoid an extra round trip; fall back to fetching it directly
        // (e.g. it hasn't loaded into local state yet).
        const matched =
          complaints.find((c) => c.id === newComplaint.similarComplaintId) ||
          (await fetchReportById(newComplaint.similarComplaintId).catch(() => null));

        if (matched) {
          setSubmissionResult({
            isChecking: false,
            hasMatch: true,
            pendingComplaint: newComplaint,
            matchedComplaint: matched,
          });
          return;
        }
      }

      // No confident duplicate match — take the reporter straight to the
      // dashboard so they see the new report landed.
      navigateTo('dashboard', newComplaint.id);
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

  // Nearby reports an authority can choose to group this one with. Not
  // cached in context state — the details page fetches fresh each time it
  // opens the grouping picker.
  const loadGroupCandidates = (complaintId: string) => fetchGroupCandidates(complaintId);

  const loadGroupMembers = (complaintId: string) => fetchGroupMembers(complaintId);

  // Applies an updated report to both the list and, if it's the one open on
  // the details page, the selected complaint — shared by the grouping and
  // assignment actions below.
  const applyUpdatedComplaint = (updated: Complaint) => {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedComplaint((prev) => (prev && prev.id === updated.id ? updated : prev));
  };

  const flagAsDuplicateOf = async (complaintId: string, groupWith: string) => {
    const updated = await apiSetReportGroup(complaintId, groupWith);
    applyUpdatedComplaint(updated);
  };

  const ungroupReport = async (complaintId: string) => {
    const updated = await apiSetReportGroup(complaintId, null);
    applyUpdatedComplaint(updated);
  };

  const assignToMaintenance = async (complaintId: string, assignedTo: string | null) => {
    const updated = await apiAssignReport(complaintId, assignedTo);
    applyUpdatedComplaint(updated);
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
        loadGroupCandidates,
        loadGroupMembers,
        flagAsDuplicateOf,
        ungroupReport,
        assignToMaintenance,
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
