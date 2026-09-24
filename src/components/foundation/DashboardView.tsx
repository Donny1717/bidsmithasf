/**
 * Dashboard — Phase 1 working product: see your identity, role and
 * workspace; perform a permitted state change; view the resulting
 * immutable audit event.
 */
import React, { useState } from 'react';
import {
  foundationFetch,
  type FoundationSession,
} from '../../lib/foundationApi';
import { GovButton, GovPanel, GovTag, StatusBanner, ErrorSummary, focusRing } from './ui';

interface DashboardProps {
  session: FoundationSession;
  idToken: string | null;
  onSessionProblem: (message: string) => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ session, idToken, onSessionProblem }) => {
  const [title, setTitle] = useState('');
  const [commencement, setCommencement] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const canCreateProject = session.memberships.some((m) =>
    ['org_owner', 'platform_admin', 'bid_lead'].includes(m.role)
  );

  const handleCreate = async () => {
    setErrors([]);
    setResult(null);
    const nextErrors: { id: string; message: string }[] = [];
    if (!title.trim()) nextErrors.push({ id: 'project-title', message: 'Enter a project title' });
    if (commencement && isNaN(Date.parse(commencement)))
      nextErrors.push({ id: 'project-date', message: 'Enter a valid commencement date' });
    if (nextErrors.length) {
      setErrors(nextErrors);
      return;
    }
    setBusy(true);
    try {
      const res = await foundationFetch('/api/foundation/projects', idToken, {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), commencementDate: commencement || undefined }),
      });
      setResult(
        'Project "' + res.project.title + '" registered. Audit event: ' + res.auditEventId
      );
      setTitle('');
      setCommencement('');
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403 || e?.status === 503) {
        onSessionProblem(e.message);
      } else {
        setErrors([{ id: 'project-title', message: e?.message || 'Request failed' }]);
      }
    } finally {
      setBusy(false);
    }
  };

  const principal = session.principal;

  return (
    <div className="space-y-6">
      <GovPanel title="Your identity">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="font-bold text-slate-600">Display name</dt>
            <dd>{principal.displayName || '—'}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-600">Email</dt>
            <dd>{principal.email || '—'}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-600">Identity method</dt>
            <dd>
              <GovTag tone="blue">{principal.method}</GovTag>{' '}
              <GovTag tone={principal.mfaVerified ? 'green' : 'grey'}>
                {principal.mfaVerified ? 'MFA verified' : 'MFA not asserted'}
              </GovTag>
            </dd>
          </div>
          <div>
            <dt className="font-bold text-slate-600">Subject</dt>
            <dd className="font-mono text-xs break-all">{principal.subject}</dd>
          </div>
        </dl>
      </GovPanel>

      <GovPanel title="Workspaces and roles">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">Your workspace memberships and assigned roles</caption>
          <thead>
            <tr className="text-left border-b-2 border-[#0b0c0c]">
              <th scope="col" className="py-2 pr-4">Organisation</th>
              <th scope="col" className="py-2 pr-4">Workspace</th>
              <th scope="col" className="py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {session.memberships.map((m, i) => (
              <tr key={i} className="border-b border-slate-300">
                <td className="py-2 pr-4">{m.organisationName}</td>
                <td className="py-2 pr-4">{m.workspaceName || '—'}</td>
                <td className="py-2">
                  <GovTag tone="blue">{m.roleLabel}</GovTag>{' '}
                  <span className="font-mono text-xs text-slate-500">{m.role}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GovPanel>

      <GovPanel title="Create a test project">
        <p className="text-sm text-slate-600 mb-4">
          A permitted state change under your role. The action and its result are written to
          the append-only audit trail. The applicable policy profile (PPN 02/24 or PPN 017)
          is selected from the procurement commencement date.
        </p>
        {!canCreateProject && (
          <div className="mb-4">
            <StatusBanner tone="info">
              Your role does not include project creation — this form will be denied and
              the denial is audited (fail closed, by design).
            </StatusBanner>
          </div>
        )}
        <ErrorSummary
          errors={errors}
          onFix={(id) => document.getElementById(id)?.focus()}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="project-title" className="block text-sm font-bold mb-1">
              Project title
            </label>
            <input
              id="project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={'w-full border-2 border-[#0b0c0c] rounded-sm px-3 py-2 text-sm ' + focusRing}
              aria-describedby="project-title-hint"
            />
            <p id="project-title-hint" className="text-xs text-slate-600 mt-1">
              For example: Home Office FM Services 2026
            </p>
          </div>
          <div>
            <label htmlFor="project-date" className="block text-sm font-bold mb-1">
              Procurement commencement date (optional)
            </label>
            <input
              id="project-date"
              type="date"
              value={commencement}
              onChange={(e) => setCommencement(e.target.value)}
              className={'w-full border-2 border-[#0b0c0c] rounded-sm px-3 py-2 text-sm ' + focusRing}
              aria-describedby="project-date-hint"
            />
            <p id="project-date-hint" className="text-xs text-slate-600 mt-1">
              On or after 24 February 2025 selects PPN 017 (Procurement Act 2023).
            </p>
          </div>
        </div>
        <div className="mt-4">
          <GovButton onClick={handleCreate} disabled={busy}>
            {busy ? 'Creating…' : 'Create project'}
          </GovButton>
        </div>
        {result && (
          <div className="mt-4">
            <StatusBanner tone="success">{result}</StatusBanner>
          </div>
        )}
      </GovPanel>
    </div>
  );
};
