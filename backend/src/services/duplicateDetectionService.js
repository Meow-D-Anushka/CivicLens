import { pool } from '../db/pool.js';
import { hammingDistance, similarityPercent } from './imageHashService.js';

// Reports within this radius of each other are considered "nearby" for both
// duplicate matching and the wider-outage density count.
const PROXIMITY_RADIUS_METERS = 150;

// Similarity thresholds for classifying the best nearby match.
const DUPLICATE_SIMILARITY_THRESHOLD = 75;

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two lat/lng points, in meters. */
function haversineMeters(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Compares a new report's photo hash and coordinates against every existing
 * report that has both a hash and coordinates, and finds:
 *  - the single best-matching nearby report (highest image similarity within
 *    the proximity radius), if any
 *  - how many other reports fall within that same radius at all (used as a
 *    "wider outage" density signal even when no single photo matches well)
 *
 * Runs as a full table scan in JS rather than a PostGIS spatial query —
 * reasonable at this project's scale, and avoids requiring a PostGIS
 * extension on the Aiven Postgres instance. Revisit with an earth_distance /
 * PostGIS index if the reports table grows into the tens of thousands.
 */
export async function findNearbyMatches({ photoHash, lat, lng, issueType, excludePublicId }) {
  if (lat == null || lng == null) {
    return { bestMatch: null, nearbyCount: 0 };
  }

  const result = await pool.query(
    `SELECT public_id, lat, lng, photo_hash, issue_type
     FROM reports
     WHERE lat IS NOT NULL AND lng IS NOT NULL AND public_id IS NOT NULL
       AND public_id != COALESCE($1, '')`,
    [excludePublicId || null]
  );

  let bestMatch = null;
  let nearbyCount = 0;

  for (const row of result.rows) {
    const distanceMeters = haversineMeters(lat, lng, Number(row.lat), Number(row.lng));
    if (distanceMeters > PROXIMITY_RADIUS_METERS) continue;

    nearbyCount++;

    if (!photoHash || !row.photo_hash) continue;

    const distanceBits = hammingDistance(photoHash, row.photo_hash);
    const similarity = similarityPercent(distanceBits);

    if (!bestMatch || similarity > bestMatch.imageSimilarityPercent) {
      bestMatch = {
        publicId: row.public_id,
        imageSimilarityPercent: similarity,
        proximityMeters: Math.round(distanceMeters),
        sameIssueType: row.issue_type === issueType,
      };
    }
  }

  return { bestMatch, nearbyCount };
}

/**
 * Turns the raw match data into the fields the rest of the app displays:
 * an aiResult label, the three "triangulation factor" numbers, and a plain-
 * language explanation.
 */
export function classifyMatch({ bestMatch, nearbyCount }) {
  if (bestMatch && bestMatch.imageSimilarityPercent >= DUPLICATE_SIMILARITY_THRESHOLD) {
    return {
      aiResult: 'Likely Duplicate',
      status: 'Likely Duplicate',
      similarComplaintId: bestMatch.publicId,
      factors: {
        imageSimilarityPercent: bestMatch.imageSimilarityPercent,
        proximityMeters: bestMatch.proximityMeters,
        complaintDensityCount: Math.max(nearbyCount, 1),
      },
      aiExplanation: `${bestMatch.imageSimilarityPercent}% visual match with report ${bestMatch.publicId}, reported ${bestMatch.proximityMeters}m away — likely the same underlying fault.`,
    };
  }

  if (nearbyCount >= 3) {
    return {
      aiResult: 'Possible Wider Outage',
      status: 'Pending',
      similarComplaintId: bestMatch?.publicId,
      factors: {
        imageSimilarityPercent: bestMatch?.imageSimilarityPercent ?? 0,
        proximityMeters: bestMatch?.proximityMeters ?? 0,
        complaintDensityCount: nearbyCount,
      },
      aiExplanation: `${nearbyCount} separate complaints found within a ${PROXIMITY_RADIUS_METERS}m radius, but no single strong photo match — may indicate a wider grid/area fault rather than one repeated report.`,
    };
  }

  return {
    aiResult: 'Separate Fault',
    status: 'Pending',
    similarComplaintId: bestMatch?.publicId,
    factors: {
      imageSimilarityPercent: bestMatch?.imageSimilarityPercent ?? 0,
      proximityMeters: bestMatch?.proximityMeters ?? 0,
      complaintDensityCount: nearbyCount,
    },
    aiExplanation:
      nearbyCount > 0
        ? `${nearbyCount} report(s) found nearby, but photo similarity was too low to call this a duplicate.`
        : `No closely matching reports found within a ${PROXIMITY_RADIUS_METERS}m radius.`,
  };
}
