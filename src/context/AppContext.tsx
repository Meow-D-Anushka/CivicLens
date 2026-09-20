import React, { createContext, useContext, useState } from 'react';
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
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(INITIAL_COMPLAINTS[0]);
  const [submissionResult, setSubmissionResult] = useState<{
    isChecking: boolean;
    hasMatch: boolean;
    pendingComplaint: Complaint | null;
    matchedComplaint: Complaint | null;
  } | null>(null);

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
    const matched = complaints[0]; // oak st matching 15m away, 91% similarity

    const newComplaint: Complaint = {
      id: newId,
      photoUrl: report.photoUrl || matched.photoUrl,
      locationName: report.locationName || 'Oak Street & 4th Avenue',
      coords: { lat: 40.7128 + 0.0001, lng: -74.0060 + 0.0001 },
      timeAgo: 'Just now',
      issueType: report.issueType,
      description: report.description,
      status: 'Likely Duplicate',
      aiResult: 'Likely Duplicate',
      factors: {
        imageSimilarityPercent: 91,
        proximityMeters: 15,
        complaintDensityCount: 4,
      },
      aiExplanation: '4 complaints are within 20 m and have highly similar photos.',
      similarComplaintId: matched.id,
    };

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
