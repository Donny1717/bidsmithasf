/**
 * Sign-in Gate — Phase 1 entry. Nothing in the workspace is reachable
 * without a verified identity. GOV.UK-style, fully keyboard accessible.
 */
import React, { useState } from 'react';
import { GovButton, GovPanel, GovTag, StatusBanner, focusRing } from './ui';

interface SignInGateProps {
  onGoogleSignIn: () => Promise<void>;
  onDevSignIn: (email: string) => Promise<void>;
  busy: boolean;
}

export const SignInGate: React.FC<SignInGateProps> = ({ onGoogleSignIn, onDevSignIn, busy }) => {
  const [devEmail, setDevEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDev = async () => {
    setError(null);
    try {
      await onDevSignIn(devEmail.trim() || 'dev@localhost');
    } catch (e: any) {
      setError(e?.message || 'Sign-in failed');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-5">
      <GovPanel title="Sign in to BidSmith ASF">
        <p className="text-sm text-slate-700 mb-4">
          Phase 1 requires a verified identity before any workspace action. Access is
          role-based and every action is recorded in an append-only audit trail.
        </p>
        <div className="space-y-3">
          <GovButton
            onClick={async () => {
              setError(null);
              try {
                await onGoogleSignIn();
              } catch (e: any) {
                setError(e?.message || 'Sign-in failed');
              }
            }}
            disabled={busy}
          >
            Sign in with Google
          </GovButton>
          {error && <StatusBanner tone="error">{error}</StatusBanner>}
        </div>
      </GovPanel>

      <details className="border border-slate-300 rounded-sm bg-white p-4">
        <summary className={'text-sm font-bold cursor-pointer text-[#1d70b8] ' + focusRing}>
          <GovTag tone="grey">Local development</GovTag> Use a dev identity
        </summary>
        <p className="text-xs text-slate-600 mt-2 mb-3">
          Development identities bypass Google sign-in for local testing only. They are
          disabled automatically in production and are always logged.
        </p>
        <div className="flex flex-wrap gap-2 items-end">
          <label htmlFor="dev-email" className="text-sm font-bold text-[#0b0c0c]">
            Dev email
          </label>
          <input
            id="dev-email"
            type="email"
            value={devEmail}
            onChange={(e) => setDevEmail(e.target.value)}
            placeholder="dev@localhost"
            className={
              'border-2 border-[#0b0c0c] rounded-sm px-3 py-2 text-sm ' + focusRing
            }
          />
          <GovButton variant="secondary" onClick={handleDev} disabled={busy}>
            Sign in (dev)
          </GovButton>
        </div>
      </details>
    </div>
  );
};
