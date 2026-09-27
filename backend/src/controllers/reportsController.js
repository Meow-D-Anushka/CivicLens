import * as reportsService from '../services/reportsService.js';
import { computeImageHash } from '../services/imageHashService.js';
import { findNearbyMatches, findNearbyReports, classifyMatch } from '../services/duplicateDetectionService.js';
import { analyzeImageAuthenticity } from '../services/imageAuthenticityService.js';

function toNullableNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

export async function createReport(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'A photo file is required.' });
    }

    const { issueType, description, locationName, lat, lng } = req.body;

    if (!issueType || !description || !locationName) {
      return res.status(400).json({
        success: false,
        error: 'issueType, description, and locationName are required.',
      });
    }

    const numLat = toNullableNumber(lat);
    const numLng = toNullableNumber(lng);

    // --- Real AI analysis pipeline ---
    // Everything below is computed server-side from the actual uploaded
    // photo and coordinates. The client cannot pass in its own aiResult,
    // similarity scores, or authenticity verdict — those used to be
    // trusted from the request body, which meant any client could report
    // whatever AI verdict it wanted.
    //
    // Run the (independent) perceptual hash + duplicate lookup and the
    // Gemini authenticity check concurrently to keep submission latency down.
    const photoHash = await computeImageHash(req.file.buffer);

    const [{ bestMatch, nearbyCount }, fakeCheck] = await Promise.all([
      findNearbyMatches({ photoHash, lat: numLat, lng: numLng, issueType }),
      analyzeImageAuthenticity({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        issueType,
        description,
      }),
    ]);

    const match = classifyMatch({ bestMatch, nearbyCount });

    const report = await reportsService.createReport({
      issueType,
      description,
      locationName,
      lat: numLat,
      lng: numLng,
      status: match.status,
      aiResult: match.aiResult,
      imageSimilarityPercent: match.factors.imageSimilarityPercent,
      proximityMeters: match.factors.proximityMeters,
      complaintDensityCount: match.factors.complaintDensityCount,
      aiExplanation: match.aiExplanation,
      similarComplaintId: match.similarComplaintId,
      photoBuffer: req.file.buffer,
      photoMimeType: req.file.mimetype,
      photoHash,
      fakeCheckVerdict: fakeCheck.verdict,
      fakeCheckConfidence: fakeCheck.confidence,
      fakeCheckReason: fakeCheck.reason,
    });

    res.status(201).json({ success: true, report });
  } catch (err) {
    next(err);
  }
}

export async function listReports(_req, res, next) {
  try {
    const reports = await reportsService.listReports();
    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
}

export async function getReport(req, res, next) {
  try {
    const report = await reportsService.getReportByPublicId(req.params.publicId);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
}

export async function getReportPhoto(req, res, next) {
  try {
    const photo = await reportsService.getReportPhoto(req.params.publicId);
    if (!photo) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }
    res.setHeader('Content-Type', photo.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(photo.data);
  } catch (err) {
    next(err);
  }
}

export async function updateReportAction(req, res, next) {
  try {
    const { status, confirmedAction } = req.body;
    const report = await reportsService.updateReportAction(req.params.publicId, {
      status,
      confirmedAction,
    });
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
}

// --- Authority verification: grouping duplicates + dispatching maintenance ---

export async function getCandidates(req, res, next) {
  try {
    const core = await reportsService.getReportCoreByPublicId(req.params.publicId);
    if (!core) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }
    const candidates = await findNearbyReports({
      lat: core.lat,
      lng: core.lng,
      photoHash: core.photoHash,
      issueType: core.issueType,
      excludePublicId: req.params.publicId,
    });
    res.json({ success: true, candidates });
  } catch (err) {
    next(err);
  }
}

export async function setReportGroup(req, res, next) {
  try {
    const { groupWith } = req.body;

    if (groupWith) {
      if (groupWith === req.params.publicId) {
        return res.status(400).json({ success: false, error: 'A report cannot be grouped with itself.' });
      }
      const target = await reportsService.getReportCoreByPublicId(groupWith);
      if (!target) {
        return res.status(400).json({ success: false, error: `No report found with id ${groupWith}.` });
      }
    }

    const report = await reportsService.setReportGroup(req.params.publicId, groupWith || null);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
}

export async function getGroupMembers(req, res, next) {
  try {
    const members = await reportsService.getGroupMembers(req.params.publicId);
    if (members.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }
    res.json({ success: true, members });
  } catch (err) {
    next(err);
  }
}

export async function assignReport(req, res, next) {
  try {
    const { assignedTo } = req.body;
    const report = await reportsService.assignReport(req.params.publicId, assignedTo ?? null);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
}
