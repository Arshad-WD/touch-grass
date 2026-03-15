import { NextResponse } from 'next/server';
import crypto from 'crypto';
import * as exifr from 'exifr';

// ──────────────────────────────────────────────────
// /api/verify — 4-Layer Anti-Cheat Pipeline
// ──────────────────────────────────────────────────
// 1. Already verified today? (KV)
// 2. Image hash → duplicate check (KV)
// 3. EXIF date → reject >6h old photos; GPS cross-check
// 4. Groq AI Vision → outdoor / AI / stock / screenshot / indoor / grass
// 5. On success → store hash + mark verified
// ──────────────────────────────────────────────────

console.log('GROQ_API_KEY configured:', !!process.env.GROQ_API_KEY);

// Helper: KV wrapper that falls back gracefully when env vars are missing
async function kvGet(key: string): Promise<any> {
  try {
    const { kv } = await import('@vercel/kv');
    return await kv.get(key);
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: any, opts?: Record<string, any>): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv');
    if (opts) {
      await (kv.set as any)(key, value, opts);
    } else {
      await kv.set(key, value);
    }
  } catch {
    // KV not configured — skip storage
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, lat, lng, address } = body;

    if (!imageBase64) {
      return NextResponse.json({
        verified: false,
        reason: 'No image provided.',
        confidence: 'high',
      });
    }

    if (!address || address === '0x0') {
      return NextResponse.json({
        verified: false,
        reason: 'Wallet not connected. Please connect your wallet first.',
        confidence: 'high',
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // ── LAYER 1: Already verified today? ──
    const alreadyVerifiedToday = await kvGet(`verified:${address}:${today}`);
    if (alreadyVerifiedToday) {
      return NextResponse.json({
        verified: false,
        reason: 'You have already verified today. Come back tomorrow!',
        confidence: 'high',
        cheatDetected: 'already_verified_today',
      });
    }

    // ── LAYER 2: Image Hash — Duplicate Detection ──
    const imageHash = crypto
      .createHash('sha256')
      .update(imageBase64)
      .digest('hex');

    const existingHash = await kvGet(`image_hash:${imageHash}`);
    if (existingHash) {
      return NextResponse.json({
        verified: false,
        reason: 'This photo has already been used for a previous verification. Go outside and take a fresh photo today.',
        confidence: 'high',
        cheatDetected: 'duplicate_image',
      });
    }

    // ── LAYER 3: EXIF Date + GPS Cross-check ──
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    let exif: any = null;
    try {
      exif = await exifr.parse(imageBuffer, {
        pick: ['DateTimeOriginal', 'CreateDate', 'GPSLatitude', 'GPSLongitude'],
      });
    } catch {
      // No EXIF data — proceed without this check
    }

    if (exif?.DateTimeOriginal) {
      const photoDate = new Date(exif.DateTimeOriginal);
      const now = new Date();
      const hoursDiff = (now.getTime() - photoDate.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 6) {
        return NextResponse.json({
          verified: false,
          reason: `This photo was taken ${Math.floor(hoursDiff)} hours ago. You must upload a photo taken within the last 6 hours.`,
          confidence: 'high',
          cheatDetected: 'old_photo',
        });
      }

      if (exif.GPSLatitude != null && exif.GPSLongitude != null && lat && lng) {
        const exifLat = exif.GPSLatitude;
        const exifLng = exif.GPSLongitude;
        const providedLat = parseFloat(lat);
        const providedLng = parseFloat(lng);
        const distance = Math.sqrt(
          Math.pow(exifLat - providedLat, 2) +
          Math.pow(exifLng - providedLng, 2)
        );

        if (distance > 0.01) {
          return NextResponse.json({
            verified: false,
            reason: 'GPS location in photo does not match your provided location.',
            confidence: 'high',
            cheatDetected: 'gps_mismatch',
          });
        }
      }
    }

    // ── LAYER 4: Groq AI Vision ──
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json(
        {
          verified: false,
          reason: 'Verification service not configured. Contact support.',
          confidence: 'low',
        },
        { status: 503 }
      );
    }

    const prompt = `You are an extremely strict anti-cheat judge for a DeFi app. Users MUST physically go outside and touch real grass to earn yield. Many people will try to cheat you.

ANALYZE this image and answer these checks:

1. isOutdoor: Is this CLEARLY outdoors? Must show real sky, sunlight, or open environment. Indoors with a window = false.

2. isAIGenerated: Any signs of AI generation? Perfect textures, unnatural lighting, warped details, dreamlike quality = true. Be aggressive — if unsure, say true.

3. isStockPhoto: Professional photography? Perfect composition, staged scene, model quality = true.

4. isScreenshot: Any UI elements, browser chrome, screen artifacts, another photo of a photo = true.

5. isIndoor: Inside a building, greenhouse, mall, or any enclosed space = true. Even with plants.

6. hasGrass: Can you see ACTUAL grass, soil, leaves, or natural ground? Must be the main subject. Grass must be real and visible up close.

RULES:
- If confidence is low → verified = false
- If no clear grass/nature visible → verified = false
- If photo is blurry/dark but clearly outdoors with nature → verified = true
- When in doubt → verified = false

GPS: lat ${lat}, lng ${lng}

Respond ONLY with this exact JSON, no markdown:
{
  "verified": boolean,
  "reason": "one sentence, be specific about what you saw",
  "confidence": "high" | "medium" | "low",
  "checks": {
    "isOutdoor": boolean,
    "isAIGenerated": boolean,
    "isStockPhoto": boolean,
    "isScreenshot": boolean,
    "isIndoor": boolean,
    "hasGrass": boolean
  }
}`;

    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${imageBase64}` },
                },
                { type: 'text', text: prompt },
              ],
            },
          ],
          max_tokens: 300,
          temperature: 0.1,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq API error:', errText);
      return NextResponse.json(
        { verified: false, reason: 'AI verification service error. Please try again.', confidence: 'low' },
        { status: 502 }
      );
    }

    const groqData = await groqResponse.json();
    const rawText = groqData.choices?.[0]?.message?.content?.trim() || '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Groq response:', rawText);
      return NextResponse.json(
        { verified: false, reason: 'AI returned an invalid response. Please try again.', confidence: 'low' },
        { status: 500 }
      );
    }

    // ── Post-Groq cheat-specific rejections ──
    if (parsed.checks?.isAIGenerated) {
      return NextResponse.json({
        verified: false,
        reason: 'This appears to be an AI-generated image. Please take a real photo.',
        confidence: parsed.confidence || 'high',
        cheatDetected: 'ai_generated',
      });
    }

    if (parsed.checks?.isStockPhoto) {
      return NextResponse.json({
        verified: false,
        reason: 'This looks like a stock photo. Please take a genuine photo of yourself outside.',
        confidence: parsed.confidence || 'high',
        cheatDetected: 'stock_photo',
      });
    }

    if (parsed.checks?.isScreenshot) {
      return NextResponse.json({
        verified: false,
        reason: 'This appears to be a screenshot. Please upload a real photo.',
        confidence: parsed.confidence || 'high',
        cheatDetected: 'screenshot',
      });
    }

    if (parsed.checks?.isIndoor) {
      return NextResponse.json({
        verified: false,
        reason: 'This looks like an indoor photo. You need to go outside!',
        confidence: parsed.confidence || 'high',
        cheatDetected: 'indoors',
      });
    }

    // Reject if no actual grass detected
    if (!parsed.checks?.hasGrass) {
      return NextResponse.json({
        verified: false,
        reason: 'No grass or natural ground visible in the photo. Show us the grass!',
        confidence: parsed.confidence || 'high',
        cheatDetected: 'no_grass',
      });
    }

    // Reject if low confidence
    if (parsed.confidence === 'low') {
      return NextResponse.json({
        verified: false,
        reason: 'Could not verify outdoor activity with confidence. Try a clearer photo.',
        confidence: 'low',
        cheatDetected: 'low_confidence',
      });
    }

    // ── LAYER 5: Store on success only ──
    if (parsed.verified) {
      await kvSet(`image_hash:${imageHash}`, {
        address,
        usedAt: new Date().toISOString(),
        lat,
        lng,
      });

      await kvSet(`verified:${address}:${today}`, true, { ex: 86400 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { verified: false, reason: 'Internal server error during verification.', confidence: 'low' },
      { status: 500 }
    );
  }
}
