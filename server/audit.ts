/**
 * Append-only Audit Event Service — Phase 1 (BS-NV-P1)
 *
 * Every state change writes an immutable audit event with event ID, actor,
 * action, target, timestamp, result and correlation ID. There is deliberately
 * NO update or delete API. When Supabase is configured events also persist to
 * the audit_events table (append-only enforced by trigger — see migration).
 */
import crypto from 'crypto';

export type AuditResult = 'success' | 'denied' | 'error';

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  actorType: 'human' | 'machine' | 'system';
  actorId: string;
  actorEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  workspaceId: string | null;
  result: AuditResult;
  correlationId: string;
  detail: Record<string, unknown>;
}

const events: AuditEvent[] = [];
const MAX_IN_MEMORY = 10_000;

function newId(prefix: string): string {
  return prefix + '_' + crypto.randomBytes(9).toString('hex');
}

export async function recordAudit(input: {
  actorType?: 'human' | 'machine' | 'system';
  actorId: string;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  workspaceId?: string | null;
  result?: AuditResult;
  correlationId?: string;
  detail?: Record<string, unknown>;
}): Promise<AuditEvent> {
  const event: AuditEvent = {
    eventId: newId('evt'),
    timestamp: new Date().toISOString(),
    actorType: input.actorType ?? 'human',
    actorId: input.actorId,
    actorEmail: input.actorEmail ?? null,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    workspaceId: input.workspaceId ?? null,
    result: input.result ?? 'success',
    correlationId: input.correlationId ?? newId('cor'),
    detail: input.detail ?? {},
  };
  events.push(event);
  if (events.length > MAX_IN_MEMORY) events.shift();

  // Best-effort persistence; the in-memory ledger remains the fallback.
  try {
    const { getSupabaseClient } = await import('./supabase');
    const client = getSupabaseClient();
    if (client) {
      await client.from('audit_events').insert({
        event_id: event.eventId,
        timestamp: event.timestamp,
        actor_type: event.actorType,
        actor_id: event.actorId,
        actor_email: event.actorEmail,
        action: event.action,
        target_type: event.targetType,
        target_id: event.targetId,
        workspace_id: event.workspaceId,
        result: event.result,
        correlation_id: event.correlationId,
        detail: event.detail,
      });
    }
  } catch (err: any) {
    console.warn('[audit] persistence skipped:', err?.message);
  }
  return event;
}

export function queryAudit(filter: { workspaceId?: string; limit?: number }): AuditEvent[] {
  const limit = Math.min(Math.max(filter.limit ?? 200, 1), 1000);
  const list = filter.workspaceId
    ? events.filter((e) => e.workspaceId === filter.workspaceId)
    : events;
  return list.slice(-limit).reverse();
}

export function auditStats() {
  return { totalInMemory: events.length };
}
