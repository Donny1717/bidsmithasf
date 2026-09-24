/**
 * Identity Provider Abstraction — Phase 1 (BS-NV-P1)
 *
 * Human identities are verified server-side. Machine identities are separate
 * (Phase 3) and are NOT accepted here. Verification fails closed: if the
 * identity service is unreachable or the token is invalid, deny.
 *
 * Primary provider: Firebase Auth (Google-issued ID token), verified against
 * Google's public tokeninfo endpoint. Audience must match the configured
 * Firebase project. Dev fallback is opt-in and loudly warned.
 */
import fs from 'fs';
import path from 'path';

export interface Principal {
  /** Stable subject identifier from the identity provider. */
  subject: string;
  email: string | null;
  displayName: string | null;
  /** How this principal was authenticated. */
  method: 'firebase-id-token' | 'dev-identity';
  /** True when the provider asserted MFA on this session. */
  mfaVerified: boolean;
}

function getFirebaseProjectId(): string | null {
  if (process.env.FIREBASE_PROJECT_ID) return process.env.FIREBASE_PROJECT_ID;
  try {
    const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(cfgPath)) {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      if (cfg.projectId) return cfg.projectId;
    }
  } catch {
    /* fall through */
  }
  return null;
}

function devAuthAllowed(): boolean {
  return (
    process.env.ALLOW_DEV_AUTH === '1' ||
    (process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_AUTH !== '0')
  );
}

let lastDevWarn = 0;

/**
 * Verify a Bearer token into a Principal. Throws on any failure — callers
 * must deny (fail closed) rather than degrade.
 */
export async function verifyBearerToken(token: string): Promise<Principal> {
  if (!token) throw new Error('Missing bearer token');

  // Dev identity: explicit opt-in, non-production default.
  if (token.startsWith('dev-identity:')) {
    if (!devAuthAllowed()) {
      throw new Error('Dev identities are disabled');
    }
    const now = Date.now();
    if (now - lastDevWarn > 60_000) {
      lastDevWarn = now;
      console.warn(
        '[identity] DEV identity accepted (ALLOW_DEV_AUTH). Never enable in production.'
      );
    }
    const email = token.slice('dev-identity:'.length) || 'dev@localhost';
    return {
      subject: 'dev:' + email,
      email,
      displayName: email.split('@')[0],
      method: 'dev-identity',
      mfaVerified: false,
    };
  }

  // Firebase/Google ID token verification via Google's public endpoint.
  const projectId = getFirebaseProjectId();
  if (!projectId) {
    throw new Error('Identity provider is not configured (FIREBASE_PROJECT_ID)');
  }
  const res = await fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token)
  );
  if (!res.ok) throw new Error('Identity verification failed (token rejected)');
  const info: any = await res.json();
  if (!info || !info.sub) throw new Error('Identity verification failed (no subject)');
  if (info.aud !== projectId) throw new Error('Token audience mismatch');
  if (info.email_verified === 'false' || info.email_verified === false) {
    throw new Error('Identity email is not verified');
  }
  const amr: string[] = Array.isArray(info.amr) ? info.amr : [];
  return {
    subject: String(info.sub),
    email: info.email ?? null,
    displayName: info.name ?? null,
    method: 'firebase-id-token',
    mfaVerified: amr.some((a) => a.startsWith('mfa')),
  };
}

/** Extract bearer token from an Express Request. */
export function extractBearerToken(req: any): string | null {
  const h = req.headers.authorization;
  if (typeof h === 'string' && h.toLowerCase().startsWith('bearer ')) {
    return h.slice(7).trim() || null;
  }
  return null;
}
