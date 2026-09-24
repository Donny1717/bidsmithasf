/**
 * API Security Middleware — BidSmith ASF
 *
 * Evidence-first, accountable platform: every API call must be attributable
 * and bounded. Implements:
 *  - requireApiKey: Bearer/`x-api-key` authentication against API_KEYS env allowlist.
 *    If API_KEYS is unset the server runs in development mode and warns loudly.
 *  - rateLimit: in-memory sliding-window limiter (per IP + route class).
 *
 * Phase note: this is the Phase 1/2 hardening step from the 4-phase plan.
 * The future Model Gateway (Phase 3) will sit behind these same controls.
 */
import { Request, Response, NextFunction } from 'express';

/** Comma-separated list of enabled API keys. Unset = development mode (open). */
function getApiKeys(): string[] {
  const raw = process.env.API_KEYS;
  if (!raw || !raw.trim()) return [];
  return raw.split(',').map((k) => k.trim()).filter(Boolean);
}

/** Length-safe comparison to avoid trivially leaking key length via timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // still do a comparison pass to keep timing roughly constant
    let acc = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      acc |= a.charCodeAt(i % a.length) ^ b.charCodeAt(i % b.length);
    }
    return false;
  }
  let acc = 0;
  for (let i = 0; i < a.length; i++) acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return acc === 0;
}

function extractKey(req: Request): string | null {
  const header = req.headers['x-api-key'];
  if (typeof header === 'string' && header.length > 0) return header;
  const auth = req.headers.authorization;
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim() || null;
  }
  return null;
}

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const keys = getApiKeys();
  if (keys.length === 0) {
    // Development mode: no keys configured. Log once per request path class is noisy,
    // so log at most every 60s.
    const now = Date.now();
    if (!(requireApiKey as any)._lastWarn || now - (requireApiKey as any)._lastWarn > 60_000) {
      (requireApiKey as any)._lastWarn = now;
      console.warn(
        '[auth] API_KEYS is not set — running in OPEN DEVELOPMENT MODE. ' +
          'Set API_KEYS before any public/go-to-market deployment.'
      );
    }
    next();
    return;
  }
  const presented = extractKey(req);
  if (!presented || !keys.some((k) => safeEqual(k, presented))) {
    res.status(401).json({
      error: 'Unauthorized: a valid API key is required (x-api-key header or Bearer token).',
    });
    return;
  }
  next();
}

interface WindowEntry {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, WindowEntry>();

// Periodic cleanup so the map does not grow unbounded in long-lived processes.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number, windowMs: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > windowMs * 2) buckets.delete(key);
  }
}

export function rateLimit(opts: { windowMs: number; max: number; name: string }) {
  const { windowMs, max, name } = opts;
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    cleanup(now, windowMs);
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = name + ':' + ip;
    const entry = buckets.get(key);
    if (!entry || now - entry.windowStart >= windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(max - 1));
      next();
      return;
    }
    entry.count += 1;
    const remaining = Math.max(0, max - entry.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    if (entry.count > max) {
      const retryAfterSec = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      res.setHeader('Retry-After', String(Math.max(1, retryAfterSec)));
      res.status(429).json({
        error: 'Rate limit exceeded. Please retry shortly.',
        scope: name,
        retryAfterSeconds: Math.max(1, retryAfterSec),
      });
      return;
    }
    next();
  };
}

/** General API limit: 120 requests / minute / IP */
export const generalRateLimiter = rateLimit({ windowMs: 60_000, max: 120, name: 'api' });

/** Expensive AI/LLM-backed routes: 20 requests / minute / IP */
export const aiRateLimiter = rateLimit({ windowMs: 60_000, max: 20, name: 'ai' });
