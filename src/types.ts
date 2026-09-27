export type IssueType = 
  | 'Light Completely Out'
  | 'Flickering Continuously'
  | 'Damaged Pole / Exposed Wiring'
  | 'Light On During Daytime';

export type AIResultType = 
  | 'Likely Duplicate'
  | 'Separate Fault'
  | 'Possible Wider Outage';

export type ComplaintStatus = 
  | 'Pending'
  | 'Likely Duplicate'
  | 'Separate Fault'
  | 'Wider Outage'
  | 'Resolved';

// Verdicts from the server-side Gemini vision check run on every uploaded
// photo (see backend/src/services/imageAuthenticityService.js).
export type FakeCheckVerdict =
  | 'REAL_PHOTO'
  | 'LIKELY_AI_GENERATED'
  | 'LIKELY_MANIPULATED'
  | 'STOCK_OR_UNRELATED'
  | 'UNCLEAR';

export interface FakeCheck {
  verdict: FakeCheckVerdict;
  confidence: number; // 0-100
  reason: string;
}

export interface Complaint {
  id: string;
  photoUrl: string;
  locationName: string;
  coords: {
    lat: number;
    lng: number;
  };
  timeAgo: string;
  issueType: IssueType;
  description: string;
  status: ComplaintStatus;
  aiResult: AIResultType;
  factors: {
    imageSimilarityPercent: number; // e.g. 91
    proximityMeters: number; // e.g. 15
    complaintDensityCount: number; // e.g. 4
  };
  aiExplanation: string;
  similarComplaintId?: string;
  confirmedAction?: 'Confirmed Duplicate' | 'Kept Separate' | null;
  fakeCheck?: FakeCheck;
}

export type PageView = 'home' | 'report' | 'dashboard' | 'details';
