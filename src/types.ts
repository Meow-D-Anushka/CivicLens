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
}

export type PageView = 'home' | 'report' | 'dashboard' | 'details';
