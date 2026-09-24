/**
 * Role & Permission Service — Phase 1 (BS-NV-P1)
 *
 * Server-side authorisation only. Deny by default; deny when the policy
 * service is unavailable (fail closed). Roles follow the Product Charter.
 */
import { Request, Response, NextFunction } from 'express';
import { Principal, verifyBearerToken, extractBearerToken } from './identity';

export type Role =
  | 'platform_admin'
  | 'org_owner'
  | 'bid_lead'
  | 'contributor'
  | 'evidence_owner'
  | 'reviewer'
  | 'approver'
  | 'auditor'
  | 'ai_risk_owner';

export type Permission =
  | 'workspace.read'
  | 'workspace.manage'
  | 'member.manage'
  | 'project.create'
  | 'project.read'
  | 'policy.read'
  | 'policy.write'
  | 'audit.read'
  | 'audit.export'
  | 'platform.admin';

export const ROLE_LABELS: Record<Role, string> = {
  platform_admin: 'Platform Administrator',
  org_owner: 'Organisation Owner',
  bid_lead: 'Bid Lead',
  contributor: 'Contributor',
  evidence_owner: 'Evidence Owner',
  reviewer: 'Reviewer',
  approver: 'Approver',
  auditor: 'Auditor',
  ai_risk_owner: 'AI Risk Owner',
};

const MATRIX: Record<Role, Permission[]> = {
  platform_admin: [
    'workspace.read', 'workspace.manage', 'member.manage', 'project.create',
    'project.read', 'policy.read', 'policy.write', 'audit.read', 'audit.export', 'platform.admin',
  ],
  org_owner: [
    'workspace.read', 'workspace.manage', 'member.manage', 'project.create',
    'project.read', 'policy.read', 'audit.read',
  ],
  bid_lead: ['workspace.read', 'project.create', 'project.read', 'policy.read'],
  contributor: ['workspace.read', 'project.read', 'policy.read'],
  evidence_owner: ['workspace.read', 'project.read'],
  reviewer: ['workspace.read', 'project.read', 'policy.read'],
  approver: ['workspace.read', 'project.read'],
  auditor: ['workspace.read', 'audit.read', 'audit.export'],
  ai_risk_owner: ['workspace.read', 'policy.read', 'audit.read'],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  const perms = MATRIX[role];
  if (!perms) return false; // deny by default for unknown roles
  return perms.includes(permission);
}

export interface MembershipRecord {
  organisationId: string;
  organisationName: string;
  workspaceId: string | null;
  workspaceName: string | null;
  role: Role;
}

/**
 * Membership resolution. When Supabase is configured, memberships are read
 * from the membership table. Otherwise a dev organisation with the
 * organisation-owner role is granted so the Phase 1 skeleton is testable —
 * loudly and never in production mode.
 */
export async function resolveMemberships(principal: Principal): Promise<MembershipRecord[]> {
  if (principal.method === 'dev-identity') {
    return [{
      organisationId: 'org-dev',
      organisationName: 'Development Organisation',
      workspaceId: 'ws-dev',
      workspaceName: 'Development Workspace',
      role: 'org_owner',
    }];
  }

  const { getSupabaseClient } = await import('./supabase');
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Membership service unavailable (no database configured)');
  }
  const { data, error } = await client
    .from('memberships')
    .select('organisation_id, organisations(name), workspace_id, workspaces(name), role')
    .eq('user_subject', principal.subject);
  if (error) throw new Error('Membership service unavailable: ' + error.message);
  return (data || []).map((row: any) => ({
    organisationId: row.organisation_id,
    organisationName: row.organisations?.name ?? row.organisation_id,
    workspaceId: row.workspace_id,
    workspaceName: row.workspaces?.name ?? row.workspace_id,
    role: row.role as Role,
  }));
}

export interface AuthedRequest extends Request {
  principal?: Principal;
  memberships?: MembershipRecord[];
}

/**
 * Authentication + authorisation middleware. Fails closed on identity or
 * membership service failure. Requires Bearer identity token.
 */
export function requirePermission(permission: Permission) {
  return async (req: AuthedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = extractBearerToken(req);
      if (!token) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }
      const principal = await verifyBearerToken(token);
      const memberships = await resolveMemberships(principal);
      if (memberships.length === 0) {
        res.status(403).json({ error: 'No workspace membership. Access denied.' });
        return;
      }
      if (!memberships.some((m) => roleHasPermission(m.role, permission))) {
        res.status(403).json({
          error: 'Role does not permit this action. Access denied.',
          requiredPermission: permission,
        });
        return;
      }
      req.principal = principal;
      req.memberships = memberships;
      next();
    } catch (err: any) {
      // Fail closed: identity/policy service failure => deny, not degrade.
      res.status(503).json({
        error: 'Authorisation unavailable — request denied (fail closed).',
        detail: err?.message || 'unknown error',
      });
    }
  };
}
