import sharp from 'sharp';

// Perceptual hash (difference hash / "dHash") — robust to re-compression,
// resizing, and minor cropping, which is exactly the kind of near-duplicate
// two different phones photographing the same broken streetlight produce.
// A byte-for-byte or cryptographic hash (e.g. md5/sha256) would only catch
// the *exact same file* being re-uploaded, which is rarely what happens in
// practice.
//
// How it works: shrink the image to a tiny (HASH_WIDTH+1) x HASH_HEIGHT
// grayscale grid, then record — for each row — whether each pixel is
// brighter or darker than the pixel to its right. That sequence of
// brighter/darker bits is stable even when the photo is scaled, re-saved as
// a different quality JPEG, or shot from a very slightly different angle,
// because it only depends on the coarse gradient structure of the image,
// not exact pixel values.
const HASH_WIDTH = 16;
const HASH_HEIGHT = 16;
export const HASH_BIT_LENGTH = HASH_WIDTH * HASH_HEIGHT; // 256 bits

/**
 * Computes a perceptual hash for an image buffer, returned as a hex string.
 * Returns null if the image can't be decoded (e.g. corrupt upload) — callers
 * should treat that as "no hash available" rather than fail the request,
 * since duplicate detection is a bonus signal, not a hard requirement.
 */
export async function computeImageHash(buffer) {
  try {
    const { data, info } = await sharp(buffer)
      .rotate() // apply EXIF orientation before resizing
      .resize(HASH_WIDTH + 1, HASH_HEIGHT, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    const bits = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width - 1; x++) {
        const left = data[y * width + x];
        const right = data[y * width + x + 1];
        bits.push(left > right ? 1 : 0);
      }
    }

    return bitsToHex(bits);
  } catch (err) {
    console.error('[imageHash] Failed to hash image:', err.message);
    return null;
  }
}

function bitsToHex(bits) {
  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    const nibble = (bits[i] << 3) | (bits[i + 1] << 2) | (bits[i + 2] << 1) | (bits[i + 3] || 0);
    hex += nibble.toString(16);
  }
  return hex;
}

function hexToBits(hex) {
  const bits = [];
  for (const char of hex) {
    const nibble = parseInt(char, 16);
    bits.push((nibble >> 3) & 1, (nibble >> 2) & 1, (nibble >> 1) & 1, nibble & 1);
  }
  return bits;
}

/** Hamming distance between two hex-encoded perceptual hashes. */
export function hammingDistance(hexA, hexB) {
  if (!hexA || !hexB) return HASH_BIT_LENGTH; // treat "unknown" as maximally different
  const bitsA = hexToBits(hexA);
  const bitsB = hexToBits(hexB);
  const len = Math.min(bitsA.length, bitsB.length);
  let distance = 0;
  for (let i = 0; i < len; i++) {
    if (bitsA[i] !== bitsB[i]) distance++;
  }
  return distance;
}

/** Converts a Hamming distance into a 0-100 "similarity" percentage. */
export function similarityPercent(distance) {
  const pct = Math.round((1 - distance / HASH_BIT_LENGTH) * 100);
  return Math.max(0, Math.min(100, pct));
}
