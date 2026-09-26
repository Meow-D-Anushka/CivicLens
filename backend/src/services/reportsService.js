import { pool } from '../db/pool.js';

// Shapes a DB row into the same fields the frontend's `Complaint` type
// expects. `photoUrl` is a relative API path — the frontend prefixes it
// with its configured API base URL since frontend and backend are deployed
// separately.
function mapRow(row) {
  return {
    id: row.public_id,
    photoUrl: `/api/reports/${row.public_id}/photo`,
    locationName: row.location_name,
    coords:
      row.lat !== null && row.lng !== null
        ? { lat: Number(row.lat), lng: Number(row.lng) }
        : undefined,
    createdAt: row.created_at,
    issueType: row.issue_type,
    description: row.description,
    status: row.status,
    aiResult: row.ai_result || undefined,
    factors: {
      imageSimilarityPercent: row.image_similarity_percent ?? 0,
      proximityMeters: row.proximity_meters ?? 0,
      complaintDensityCount: row.complaint_density_count ?? 0,
    },
    aiExplanation: row.ai_explanation || '',
    similarComplaintId: row.similar_complaint_id || undefined,
    confirmedAction: row.confirmed_action || null,
  };
}

export async function createReport({
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
  photoBuffer,
  photoMimeType,
}) {
  const insertResult = await pool.query(
    `INSERT INTO reports (
       issue_type, description, location_name, lat, lng, status, ai_result,
       image_similarity_percent, proximity_meters, complaint_density_count,
       ai_explanation, similar_complaint_id, photo, photo_mime_type
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING id`,
    [
      issueType,
      description,
      locationName,
      lat ?? null,
      lng ?? null,
      status ?? 'Pending',
      aiResult ?? null,
      imageSimilarityPercent ?? null,
      proximityMeters ?? null,
      complaintDensityCount ?? null,
      aiExplanation ?? null,
      similarComplaintId ?? null,
      photoBuffer,
      photoMimeType,
    ]
  );

  const { id } = insertResult.rows[0];
  const publicId = `CL-${1000 + id}`;

  const updateResult = await pool.query(
    `UPDATE reports SET public_id = $1 WHERE id = $2 RETURNING *`,
    [publicId, id]
  );

  return mapRow(updateResult.rows[0]);
}

export async function listReports() {
  // Deliberately excludes the `photo` column — the list view only needs
  // metadata, and skipping the bytea payload keeps this fast for the
  // admin dashboard even as reports (and their images) pile up.
  const result = await pool.query(
    `SELECT id, public_id, issue_type, description, location_name, lat, lng,
            status, ai_result, image_similarity_percent, proximity_meters,
            complaint_density_count, ai_explanation, similar_complaint_id,
            confirmed_action, created_at
     FROM reports
     ORDER BY created_at DESC`
  );
  return result.rows.map(mapRow);
}

export async function getReportByPublicId(publicId) {
  const result = await pool.query(
    `SELECT id, public_id, issue_type, description, location_name, lat, lng,
            status, ai_result, image_similarity_percent, proximity_meters,
            complaint_density_count, ai_explanation, similar_complaint_id,
            confirmed_action, created_at
     FROM reports WHERE public_id = $1`,
    [publicId]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export async function getReportPhoto(publicId) {
  const result = await pool.query(
    `SELECT photo, photo_mime_type FROM reports WHERE public_id = $1`,
    [publicId]
  );
  if (result.rows.length === 0) return null;
  return { data: result.rows[0].photo, mimeType: result.rows[0].photo_mime_type };
}

export async function updateReportAction(publicId, { status, confirmedAction }) {
  const result = await pool.query(
    `UPDATE reports
     SET status = COALESCE($1, status),
         confirmed_action = COALESCE($2, confirmed_action)
     WHERE public_id = $3
     RETURNING id, public_id, issue_type, description, location_name, lat, lng,
               status, ai_result, image_similarity_percent, proximity_meters,
               complaint_density_count, ai_explanation, similar_complaint_id,
               confirmed_action, created_at`,
    [status ?? null, confirmedAction ?? null, publicId]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}
