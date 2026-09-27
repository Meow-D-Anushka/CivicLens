import { Complaint, AIResultType, ComplaintStatus, IssueType, FakeCheck, DuplicateCandidate } from '../types';

const RAW_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

// Shape returned by the backend (see backend/src/services/reportsService.js).
interface ApiReport {
  id: string;
  photoUrl: string;
  locationName: string;
  coords?: { lat: number; lng: number };
  createdAt: string;
  issueType: string;
  description: string;
  status: string;
  aiResult?: string;
  factors: {
    imageSimilarityPercent: number;
    proximityMeters: number;
    complaintDensityCount: number;
  };
  aiExplanation: string;
  similarComplaintId?: string;
  confirmedAction: 'Confirmed Duplicate' | 'Kept Separate' | null;
  groupId?: string;
  assignedTo?: string | null;
  assignedAt?: string | null;
  fakeCheck?: FakeCheck;
}

// Shape returned by GET /:publicId/candidates (see duplicateDetectionService.js).
interface ApiCandidate {
  publicId: string;
  locationName: string;
  issueType: string;
  status: string;
  groupId?: string;
  createdAt: string;
  proximityMeters: number;
  imageSimilarityPercent: number;
  sameIssueType: boolean;
}

function timeAgoFrom(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function toComplaint(report: ApiReport): Complaint {
  return {
    id: report.id,
    // The backend returns a relative path — it doesn't know its own public
    // URL, and frontend/backend are deployed separately — so prefix it here.
    photoUrl: `${API_BASE}${report.photoUrl}`,
    locationName: report.locationName,
    coords: report.coords || { lat: 0, lng: 0 },
    timeAgo: timeAgoFrom(report.createdAt),
    issueType: report.issueType as IssueType,
    description: report.description,
    status: report.status as ComplaintStatus,
    aiResult: (report.aiResult as AIResultType) || 'Separate Fault',
    factors: report.factors,
    aiExplanation: report.aiExplanation,
    similarComplaintId: report.similarComplaintId,
    confirmedAction: report.confirmedAction,
    groupId: report.groupId,
    assignedTo: report.assignedTo ?? null,
    assignedAt: report.assignedAt ?? null,
    fakeCheck: report.fakeCheck,
  };
}

function toCandidate(candidate: ApiCandidate): DuplicateCandidate {
  return {
    id: candidate.publicId,
    locationName: candidate.locationName,
    issueType: candidate.issueType as IssueType,
    status: candidate.status as ComplaintStatus,
    groupId: candidate.groupId,
    createdAt: candidate.createdAt,
    proximityMeters: candidate.proximityMeters,
    imageSimilarityPercent: candidate.imageSimilarityPercent,
    sameIssueType: candidate.sameIssueType,
  };
}

async function parseJsonOrThrow(res: Response): Promise<any> {
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON body (e.g. a proxy error page) — fall through to the
    // generic status-based error below.
  }
  if (!res.ok || !body?.success) {
    throw new Error(body?.error || `Request failed with status ${res.status}`);
  }
  return body;
}

export async function fetchReports(): Promise<Complaint[]> {
  const res = await fetch(`${API_BASE}/api/reports`);
  const body = await parseJsonOrThrow(res);
  return (body.reports as ApiReport[]).map(toComplaint);
}

export async function fetchReportById(id: string): Promise<Complaint | null> {
  const res = await fetch(`${API_BASE}/api/reports/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  const body = await parseJsonOrThrow(res);
  return toComplaint(body.report as ApiReport);
}

export interface NewReportPayload {
  photoFile: File;
  issueType: string;
  description: string;
  locationName: string;
  coords?: { lat: number; lng: number };
}

// Duplicate-detection and photo-authenticity results are computed entirely
// server-side from the uploaded photo (perceptual hashing + a Gemini vision
// check) — the client only supplies the report's own fields below, and the
// backend ignores any AI-result fields even if sent, so they can't be spoofed.
export async function createReport(payload: NewReportPayload): Promise<Complaint> {
  const formData = new FormData();
  formData.append('photo', payload.photoFile, payload.photoFile.name || 'photo.jpg');
  formData.append('issueType', payload.issueType);
  formData.append('description', payload.description);
  formData.append('locationName', payload.locationName);

  if (payload.coords) {
    formData.append('lat', String(payload.coords.lat));
    formData.append('lng', String(payload.coords.lng));
  }

  const res = await fetch(`${API_BASE}/api/reports`, { method: 'POST', body: formData });
  const body = await parseJsonOrThrow(res);
  return toComplaint(body.report as ApiReport);
}

export async function updateReportAction(
  id: string,
  action: { status?: string; confirmedAction?: string }
): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/api/reports/${encodeURIComponent(id)}/action`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  const body = await parseJsonOrThrow(res);
  return toComplaint(body.report as ApiReport);
}

// --- Authority verification: grouping duplicates + dispatching maintenance ---

// Nearby reports an authority reviewer can consider grouping this report
// with — ranked by photo similarity then distance, same as the AI's own
// auto-classification but surfaced as a full list for a human to choose from.
export async function fetchGroupCandidates(id: string): Promise<DuplicateCandidate[]> {
  const res = await fetch(`${API_BASE}/api/reports/${encodeURIComponent(id)}/candidates`);
  const body = await parseJsonOrThrow(res);
  return (body.candidates as ApiCandidate[]).map(toCandidate);
}

// Every report already consolidated under the same duplicate group as `id`
// (the group's root report included).
export async function fetchGroupMembers(id: string): Promise<Complaint[]> {
  const res = await fetch(`${API_BASE}/api/reports/${encodeURIComponent(id)}/group`);
  if (res.status === 404) return [];
  const body = await parseJsonOrThrow(res);
  return (body.members as ApiReport[]).map(toComplaint);
}

// Flags `id` as a duplicate of `groupWith`, consolidating it into that
// report's group. Pass `groupWith: null` to split a report back out on its own.
export async function setReportGroup(id: string, groupWith: string | null): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/api/reports/${encodeURIComponent(id)}/group`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupWith }),
  });
  const body = await parseJsonOrThrow(res);
  return toComplaint(body.report as ApiReport);
}

// Dispatches `id` to a maintenance worker/crew. Pass `assignedTo: null` to clear it.
export async function assignReport(id: string, assignedTo: string | null): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/api/reports/${encodeURIComponent(id)}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedTo }),
  });
  const body = await parseJsonOrThrow(res);
  return toComplaint(body.report as ApiReport);
}

/**
 * Converts an image URL (e.g. one of the bundled "sample photo" quick-picks)
 * into a File, so it can be uploaded through the same multipart flow as a
 * real device photo.
 */
export async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not load that sample image.');
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}
