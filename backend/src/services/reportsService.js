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
    groupId: row.group_id || undefined,
    assignedTo: row.assigned_to || null,
    assignedAt: row.assigned_at || null,
    fakeCheck: row.fake_check_verdict
      ? {
          verdict: row.fake_check_verdict,
          confidence: row.fake_check_confidence ?? 0,
          reason: row.fake_check_reason || '',
        }
      : undefined,
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
  photoHash,
  fakeCheckVerdict,
  fakeCheckConfidence,
  fakeCheckReason,
}) {
  const insertResult = await pool.query(
    `INSERT INTO reports (
       issue_type, description, location_name, lat, lng, status, ai_result,
       image_similarity_percent, proximity_meters, complaint_density_count,
       ai_explanation, similar_complaint_id, photo, photo_mime_type,
       photo_hash, fake_check_verdict, fake_check_confidence, fake_check_reason
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
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
      photoHash ?? null,
      fakeCheckVerdict ?? null,
      fakeCheckConfidence ?? null,
      fakeCheckReason ?? null,
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
            confirmed_action, group_id, assigned_to, assigned_at, created_at,
            fake_check_verdict, fake_check_confidence, fake_check_reason
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
            confirmed_action, group_id, assigned_to, assigned_at, created_at,
            fake_check_verdict, fake_check_confidence, fake_check_reason
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

const RETURNING_COLUMNS = `id, public_id, issue_type, description, location_name, lat, lng,
               status, ai_result, image_similarity_percent, proximity_meters,
               complaint_density_count, ai_explanation, similar_complaint_id,
               confirmed_action, group_id, assigned_to, assigned_at, created_at,
               fake_check_verdict, fake_check_confidence, fake_check_reason`;

export async function updateReportAction(publicId, { status, confirmedAction }) {
  const result = await pool.query(
    `UPDATE reports
     SET status = COALESCE($1, status),
         confirmed_action = COALESCE($2, confirmed_action)
     WHERE public_id = $3
     RETURNING ${RETURNING_COLUMNS}`,
    [status ?? null, confirmedAction ?? null, publicId]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

/**
 * Returns the bare fields needed to search for grouping candidates around a
 * report — its coordinates, photo hash, and issue type — without pulling the
 * photo bytea itself.
 */
export async function getReportCoreByPublicId(publicId) {
  const result = await pool.query(
    `SELECT lat, lng, photo_hash, issue_type FROM reports WHERE public_id = $1`,
    [publicId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    lat: row.lat !== null ? Number(row.lat) : null,
    lng: row.lng !== null ? Number(row.lng) : null,
    photoHash: row.photo_hash,
    issueType: row.issue_type,
  };
}

/**
 * An authority reviewer's manual call that one report is a duplicate of
 * another (`groupWith`), or — passing `groupWith: null` — that a
 * previously-grouped report should be split back out on its own.
 *
 * Grouping stamps this report's `group_id` with the root's public_id (and
 * gives the root a self-referencing `group_id` too, if it didn't already
 * have one, so every member of the cluster — root included — can be found
 * with one `WHERE COALESCE(group_id, public_id) = <root>` query) and marks
 * this report Likely Duplicate. Ungrouping clears group_id and reverts the
 * status to Separate Fault, mirroring the existing confirm/keep-separate
 * action semantics used elsewhere in the app.
 */
export async function setReportGroup(publicId, groupWith) {
  if (groupWith) {
    await pool.query(
      `UPDATE reports SET group_id = $1 WHERE public_id = $1 AND group_id IS NULL`,
      [groupWith]
    );
    const result = await pool.query(
      `UPDATE reports
       SET group_id = $1,
           status = 'Likely Duplicate',
           confirmed_action = 'Confirmed Duplicate',
           similar_complaint_id = $1
       WHERE public_id = $2
       RETURNING ${RETURNING_COLUMNS}`,
      [groupWith, publicId]
    );
    if (result.rows.length === 0) return null;
    return mapRow(result.rows[0]);
  }

  const result = await pool.query(
    `UPDATE reports
     SET group_id = NULL,
         status = 'Separate Fault',
         confirmed_action = 'Kept Separate'
     WHERE public_id = $1
     RETURNING ${RETURNING_COLUMNS}`,
    [publicId]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

/** Every report sharing a duplicate-group root with `publicId` (root included). */
export async function getGroupMembers(publicId) {
  const result = await pool.query(
    `WITH target AS (
       SELECT COALESCE(group_id, public_id) AS root FROM reports WHERE public_id = $1
     )
     SELECT id, public_id, issue_type, description, location_name, lat, lng,
            status, ai_result, image_similarity_percent, proximity_meters,
            complaint_density_count, ai_explanation, similar_complaint_id,
            confirmed_action, group_id, assigned_to, assigned_at, created_at,
            fake_check_verdict, fake_check_confidence, fake_check_reason
     FROM reports, target
     WHERE COALESCE(reports.group_id, reports.public_id) = target.root
     ORDER BY created_at ASC`,
    [publicId]
  );
  return result.rows.map(mapRow);
}

/**
 * Dispatches a report to a maintenance worker/crew (or, passing
 * `assignedTo: null`, clears an existing assignment). Assigning a report
 * that's still Pending/Separate Fault/Wider Outage moves its status to
 * Assigned; unassigning an Assigned report moves it back to Pending. A
 * report already Resolved (or otherwise manually set) keeps its status.
 */
export async function assignReport(publicId, assignedTo) {
  const trimmed = assignedTo && assignedTo.trim() ? assignedTo.trim() : null;

  const result = await pool.query(
    `UPDATE reports
     SET assigned_to = $1,
         assigned_at = CASE WHEN $1 IS NOT NULL THEN now() ELSE NULL END,
         status = CASE
           WHEN $1 IS NOT NULL AND status IN ('Pending', 'Separate Fault', 'Wider Outage') THEN 'Assigned'
           WHEN $1 IS NULL AND status = 'Assigned' THEN 'Pending'
           ELSE status
         END
     WHERE public_id = $2
     RETURNING ${RETURNING_COLUMNS}`,
    [trimmed, publicId]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}
