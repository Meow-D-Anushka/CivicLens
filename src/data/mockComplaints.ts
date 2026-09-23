import { Complaint } from '../types';

export const mockComplaints: Complaint[] = [
  {
    id: 'CL-1436',
    locationName: 'retibunder road, parsik nagar',
    issueType: 'Flickering Continuously',
    description: 'Streetlight flickering intermittently causing visibility hazards at night.',
    status: 'Pending Review',
    photoUrl: '/flickering.jpg',
    aiConfidence: 94,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CL-1042',
    locationName: 'Oak Street & 4th Avenue',
    issueType: 'Light Completely Out',
    description: 'The pole fixture is completely dead, leaving the intersection in pitch black.',
    status: 'Verified Outage',
    photoUrl: '/broken-pole.jpg',
    aiConfidence: 91,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'CL-1045',
    locationName: 'Pine Road, Near Park',
    issueType: 'Damaged Pole / Exposed Wiring',
    description: 'Pole base cracked with exposed live wiring after recent weather.',
    status: 'Pending Review',
    photoUrl: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=600',
    aiConfidence: 88,
    createdAt: new Date(Date.now() - 2700000).toISOString(),
  },
  {
    id: 'CL-1048',
    locationName: 'Maple Drive, Block A',
    issueType: 'Light On During Daytime',
    description: 'Fixture remains illuminated 24/7 wasting grid energy.',
    status: 'Duplicate',
    photoUrl: 'https://images.unsplash.com/photo-1517409265814-726715694c92?auto=format&fit=crop&q=80&w=600',
    aiConfidence: 85,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  }
];
