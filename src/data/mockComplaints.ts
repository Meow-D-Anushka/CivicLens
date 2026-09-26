import { Complaint } from '../types';

// Offline / fallback complaint set. This renders immediately on first paint
// and is replaced as soon as the backend's report list loads successfully
// (see AppContext). It's also used if the backend is unreachable.
export const mockComplaints: Complaint[] = [
  {
    id: 'CL-1436',
    locationName: 'retibunder road, parsik nagar',
    coords: { lat: 19.2413, lng: 73.1305 },
    timeAgo: '5m ago',
    issueType: 'Flickering Continuously',
    description: 'Streetlight flickering intermittently causing visibility hazards at night.',
    status: 'Pending',
    aiResult: 'Separate Fault',
    photoUrl: '/flickering.jpg',
    factors: {
      imageSimilarityPercent: 94,
      proximityMeters: 12,
      complaintDensityCount: 1,
    },
    aiExplanation: 'No closely matching reports found within a 50m radius yet.',
    confirmedAction: null,
  },
  {
    id: 'CL-1042',
    locationName: 'Oak Street & 4th Avenue',
    coords: { lat: 19.2455, lng: 73.1352 },
    timeAgo: '10m ago',
    issueType: 'Light Completely Out',
    description: 'The pole fixture is completely dead, leaving the intersection in pitch black.',
    status: 'Separate Fault',
    aiResult: 'Separate Fault',
    photoUrl: '/broken-pole.jpg',
    factors: {
      imageSimilarityPercent: 91,
      proximityMeters: 40,
      complaintDensityCount: 1,
    },
    aiExplanation: 'Reviewed and confirmed as a standalone fault, not a duplicate.',
    confirmedAction: 'Kept Separate',
  },
  {
    id: 'CL-1045',
    locationName: 'Pine Road, Near Park',
    coords: { lat: 19.2380, lng: 73.1270 },
    timeAgo: '45m ago',
    issueType: 'Damaged Pole / Exposed Wiring',
    description: 'Pole base cracked with exposed live wiring after recent weather.',
    status: 'Pending',
    aiResult: 'Possible Wider Outage',
    photoUrl: '/broken-lamp.jpg',
    factors: {
      imageSimilarityPercent: 88,
      proximityMeters: 25,
      complaintDensityCount: 3,
    },
    aiExplanation: '3 similar complaints found within a 50m radius with matching visual features.',
    confirmedAction: null,
  },
  {
    id: 'CL-1048',
    locationName: 'Maple Drive, Block A',
    coords: { lat: 19.2430, lng: 73.1330 },
    timeAgo: '2h ago',
    issueType: 'Light On During Daytime',
    description: 'Fixture remains illuminated 24/7 wasting grid energy.',
    status: 'Likely Duplicate',
    aiResult: 'Likely Duplicate',
    photoUrl: '/defect-light.jpg',
    factors: {
      imageSimilarityPercent: 85,
      proximityMeters: 18,
      complaintDensityCount: 2,
    },
    aiExplanation: '2 similar complaints found within a 50m radius with matching visual features.',
    similarComplaintId: 'CL-1042',
    confirmedAction: null,
  },
];

export const INITIAL_COMPLAINTS = mockComplaints;
