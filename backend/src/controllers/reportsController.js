import * as reportsService from '../services/reportsService.js';

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

    const {
      issueType,
      description,
      locationName,
      lat,
      lng,
      status,
      aiResult,
      imageSimilarityPercent,
      proximityMeters,
      complaintDensityCount,
      aiExplanation,
      similarComplaintId,
    } = req.body;

    if (!issueType || !description || !locationName) {
      return res.status(400).json({
        success: false,
        error: 'issueType, description, and locationName are required.',
      });
    }

    const report = await reportsService.createReport({
      issueType,
      description,
      locationName,
      lat: toNullableNumber(lat),
      lng: toNullableNumber(lng),
      status,
      aiResult,
      imageSimilarityPercent: toNullableNumber(imageSimilarityPercent),
      proximityMeters: toNullableNumber(proximityMeters),
      complaintDensityCount: toNullableNumber(complaintDensityCount),
      aiExplanation,
      similarComplaintId,
      photoBuffer: req.file.buffer,
      photoMimeType: req.file.mimetype,
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
