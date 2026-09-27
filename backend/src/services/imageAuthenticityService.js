import { env } from '../config/env.js';

const MODEL = 'gemini-2.5-flash';
const API_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

// Verdicts the model is asked to choose from. Kept as plain strings (not an
// enum table) since this is describing an AI judgement, not a fixed backend
// state machine.
const VALID_VERDICTS = [
  'REAL_PHOTO',
  'LIKELY_AI_GENERATED',
  'LIKELY_MANIPULATED',
  'STOCK_OR_UNRELATED',
  'UNCLEAR',
];

const SYSTEM_PROMPT = `You are an image-forensics assistant for a civic issue-reporting app (broken streetlights, potholes, damaged infrastructure, etc). A citizen has uploaded a photo as evidence for a complaint. Decide whether the photo looks like a genuine, unedited camera photo of a real-world scene, or whether it shows signs of being AI-generated, digitally manipulated, a stock/stolen image, or unrelated to the stated issue.

Look for: unnatural textures or lighting inconsistent with a real photo, telltale AI-generation artifacts (warped geometry, impossible reflections, garbled fine detail), signs of cloning/splicing or edited regions, watermarks or framing typical of stock photography, or a scene that plainly does not match the described issue/category.

Respond with ONLY a compact JSON object, no markdown, no commentary, in exactly this shape:
{"verdict": one of ${JSON.stringify(VALID_VERDICTS)}, "confidence": integer 0-100 (how confident you are in the verdict), "matchesDescription": boolean (does the image plausibly show the described issue type/description), "reason": a single short sentence (under 25 words) explaining the verdict in plain language for a non-technical municipal reviewer}`;

/**
 * Asks Gemini's vision model whether an uploaded report photo looks like a
 * genuine, unedited photo of the described issue. Never throws — a
 * misconfigured key, network hiccup, or bad model response degrades to an
 * "UNCLEAR / not checked" result rather than blocking report submission,
 * since authenticity screening is an assistive signal, not a gate.
 */
export async function analyzeImageAuthenticity({ buffer, mimeType, issueType, description }) {
  if (!env.geminiApiKey) {
    return {
      verdict: 'UNCLEAR',
      confidence: 0,
      matchesDescription: null,
      reason: 'AI authenticity check is not configured on this server (missing GEMINI_API_KEY).',
    };
  }

  try {
    const base64 = buffer.toString('base64');

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nReported issue type: ${issueType}\nReporter's description: ${description}`,
            },
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        maxOutputTokens: 200,
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let response;
    try {
      response = await fetch(API_URL(env.geminiApiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[imageAuthenticity] Gemini API error:', response.status, errText);
      return {
        verdict: 'UNCLEAR',
        confidence: 0,
        matchesDescription: null,
        reason: 'Authenticity check failed (AI service error) — reviewed manually.',
      };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return {
        verdict: 'UNCLEAR',
        confidence: 0,
        matchesDescription: null,
        reason: 'Authenticity check returned no result — reviewed manually.',
      };
    }

    return parseModelResponse(text);
  } catch (err) {
    console.error('[imageAuthenticity] Failed:', err.message);
    return {
      verdict: 'UNCLEAR',
      confidence: 0,
      matchesDescription: null,
      reason: 'Authenticity check could not complete — reviewed manually.',
    };
  }
}

function parseModelResponse(text) {
  try {
    // The model is asked for pure JSON, but strip a stray ```json fence
    // defensively in case it doesn't fully comply.
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const verdict = VALID_VERDICTS.includes(parsed.verdict) ? parsed.verdict : 'UNCLEAR';
    const confidence = Number.isFinite(parsed.confidence)
      ? Math.max(0, Math.min(100, Math.round(parsed.confidence)))
      : 0;
    const matchesDescription = typeof parsed.matchesDescription === 'boolean' ? parsed.matchesDescription : null;
    const reason = typeof parsed.reason === 'string' && parsed.reason.trim() ? parsed.reason.trim() : 'No explanation provided.';

    return { verdict, confidence, matchesDescription, reason };
  } catch (err) {
    console.error('[imageAuthenticity] Could not parse model response:', text);
    return {
      verdict: 'UNCLEAR',
      confidence: 0,
      matchesDescription: null,
      reason: 'Authenticity check returned an unreadable result — reviewed manually.',
    };
  }
}

export const AUTHENTICITY_VERDICTS = VALID_VERDICTS;
