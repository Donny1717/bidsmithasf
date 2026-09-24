/**
 * Foundation API client — Phase 1 (BS-NV-P1).
 * Attaches the verified identity token to every foundation call.
 */
export interface SessionMembership {
  organisationId: string;
  organisationName: string;
  workspaceId: string | null;
  workspaceName: string | null;
  role: string;
  roleLabel: string;
}

export interface FoundationSession {
  principal: {
    subject: string;
    email: string | null;
    displayName: string | null;
    method: string;
    mfaVerified: boolean;
  };
  memberships: SessionMembership[];
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function foundationFetch(
  path: string,
  idToken: string | null,
  init: RequestInit = {}
): Promise<any> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: 'Bearer ' + idToken } : {}),
      ...(init.headers || {}),
    },
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || 'Request failed (' + res.status + ')');
  }
  return data;
}

export async function createSession(idToken: string): Promise<FoundationSession> {
  return foundationFetch('/api/foundation/session', idToken, { method: 'POST' });
}
