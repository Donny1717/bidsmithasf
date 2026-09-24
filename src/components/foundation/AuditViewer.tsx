/**
 * Audit Viewer — read-only view of the append-only audit ledger.
 */
import React, { useEffect, useState } from 'react';
import { foundationFetch } from '../../lib/foundationApi';
import { GovPanel, GovTag, StatusBanner } from './ui';

interface AuditEvent {
  eventId: string;
  timestamp: string;
  actorType: string;
  actorId: string;
  actorEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  result: string;
  correlationId: string;
}

export const AuditViewer: React.FC<{ idToken: string | null }> = ({ idToken }) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    foundationFetch('/api/foundation/audit?limit=200', idToken)
      .then((d) => setEvents(d.events))
      .catch((e) => {
        if (e?.status === 403) setDenied(true);
        else setError(e?.message || 'Failed to load audit trail');
      });
  }, [idToken]);

  if (denied)
    return (
      <StatusBanner tone="info">
        Your role does not include audit read access. This denial is by design and is
        itself recorded in the audit trail.
      </StatusBanner>
    );
  if (error) return <StatusBanner tone="error">{error}</StatusBanner>;

  return (
    <GovPanel title={'Audit trail (' + events.length + ' events)'}>
      <p className="text-sm text-slate-600 mb-4">
        Append-only: events can never be edited or deleted. Each entry identifies actor,
        action, target, time, result and correlation ID.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <caption className="sr-only">Append-only audit events</caption>
          <thead>
            <tr className="text-left border-b-2 border-[#0b0c0c]">
              <th scope="col" className="py-2 pr-3">Time</th>
              <th scope="col" className="py-2 pr-3">Actor</th>
              <th scope="col" className="py-2 pr-3">Action</th>
              <th scope="col" className="py-2 pr-3">Target</th>
              <th scope="col" className="py-2 pr-3">Result</th>
              <th scope="col" className="py-2">Correlation</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.eventId} className="border-b border-slate-300 align-top">
                <td className="py-2 pr-3 whitespace-nowrap">{e.timestamp.replace('T', ' ').slice(0, 19)}</td>
                <td className="py-2 pr-3">{e.actorEmail || e.actorId}</td>
                <td className="py-2 pr-3 font-mono">{e.action}</td>
                <td className="py-2 pr-3">
                  {e.targetType}
                  {e.targetId ? ': ' + e.targetId : ''}
                </td>
                <td className="py-2 pr-3">
                  <GovTag tone={e.result === 'success' ? 'green' : e.result === 'denied' ? 'red' : 'grey'}>
                    {e.result}
                  </GovTag>
                </td>
                <td className="py-2 font-mono text-slate-500">{e.correlationId}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-500">
                  No audit events recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GovPanel>
  );
};
