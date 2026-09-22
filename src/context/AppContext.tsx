import React, { createContext, useContext, useState, useEffect } from 'react';
import { Complaint, PageView, IssueType } from '../types';
import { INITIAL_COMPLAINTS } from '../data/mockComplaints';

interface AppContextType {
  currentView: PageView;
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  submissionResult: {
    isChecking: boolean;
    hasMatch: boolean;
    pendingComplaint: Complaint | null;
    matchedComplaint: Complaint | null;
  } | null;
  navigateTo: (view: PageView, complaintId?: string) => void;
  submitNewReport: (report: {
    photoUrl: string;
    locationName: string;
    issueType: IssueType;
    description: string;
  }) => void;
  confirmReportAction: (complaintId: string, action: 'Confirmed Duplicate' | 'Kept Separate') => void;
  selectComplaint: (complaint: Complaint) => void;
  clearSubmissionResult: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<PageView>('home');
  
  // 1. Initialize from LocalStorage so data survives page refreshes during your demo
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('civic_lens_complaints');
      if (saved) return JSON.parse(saved);
    }
    return INITIAL_COMPLAINTS;
  });

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  const [submissionResult, setSubmissionResult] = useState<{
    isChecking: boolean;
    hasMatch: boolean;
    pendingComplaint: Complaint | null;
    matchedComplaint: Complaint | null;
  } | null>(null);

  // 2. Auto-save to LocalStorage whenever complaints change
  useEffect(() => {
    localStorage.setItem('civic_lens_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Set initial selected complaint once complaints load
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

  const submitNewReport = (report: {
    photoUrl: string;
    locationName: string;
    issueType: IssueType;
    description: string;
  }) => {
    const newId = `CL-${Math.floor(1050 + Math.random() * 900)}`;
    
    // Pick a random existing complaint to be the "match" so it varies
    const randomIndex = Math.floor(Math.random() * Math.min(complaints.length, 5));
    const matched = complaints[randomIndex] || complaints[0];

    // Generate dynamic "AI" numbers so the UI looks like it's doing real processing
    const simPercent = Math.floor(Math.random() * (98 - 72 + 1)) + 72; // Between 72% and 98%
    const proxMeters = Math.floor(Math.random() * (45 - 5 + 1)) + 5;   // Between 5m and 45m
    const density = Math.floor(Math.random() * 4) + 1;

    const newComplaint: Complaint = {
      id: newId,
      photoUrl: report.photoUrl || matched.photoUrl,
      locationName: report.locationName || 'Unspecified Location',
      coords: { 
        lat: 40.7128 + (Math.random() * 0.01 - 0.005), 
        lng: -74.0060 + (Math.random() * 0.01 - 0.005) 
      },
      timeAgo: 'Just now',
      issueType: report.issueType,
      description: report.description,
      status: 'Likely Duplicate',
      aiResult: 'Likely Duplicate',
      factors: {
        imageSimilarityPercent: simPercent,
        proximityMeters: proxMeters,
        complaintDensityCount: density,
      },
      aiExplanation: `${density} similar complaints found within a 50m radius with matching visual features.`,
      similarComplaintId: matched.id,
    };

    // 3. CRITICAL FIX: Actually add the new complaint to the feed!
    setComplaints((prev) => [newComplaint, ...prev]);

    setSubmissionResult({
      isChecking: false,
      hasMatch: true,
      pendingComplaint: newComplaint,
      matchedComplaint: matched,
    });
  };

  const confirmReportAction = (complaintId: string, action: 'Confirmed Duplicate' | 'Kept Separate') => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: action === 'Confirmed Duplicate' ? 'Likely Duplicate' : 'Separate Fault',
            confirmedAction: action,
          };
        }
        return c;
      })
    );

    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint((prev) =>
        prev
          ? {
              ...prev,
              status: action === 'Confirmed Duplicate' ? 'Likely Duplicate' : 'Separate Fault',
              confirmedAction: action,
            }
          : null
      );
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
        submissionResult,
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
