/**
 * Policy Registry view — versioned policy profiles with effective dates.
 */
import React, { useEffect, useState } from 'react';
import { foundationFetch } from '../../lib/foundationApi';
import { GovButton, GovPanel, GovTag, StatusBanner, ErrorSummary, focusRing } from './ui';

interface PolicyProfile {
  id: string;
  name: string;
  version: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  legislation: string;
  summary: string;
  keyObligations: string[];
  disclosureQuestions: string[];
}

export const PolicyRegistryView: React.FC<{ idToken: string | null }> = ({ idToken }) => {
  const [profiles, setProfiles] = useState<PolicyProfile[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [selected, setSelected] = useState<PolicyProfile | null>(null);
  const [selectError, setSelectError] = useState<{ id: string; message: string }[]>([]);

  useEffect(() => {
    foundationFetch('/api/foundation/policies', idToken)
      .then((d) => setProfiles(d.profiles))
      .catch((e) => setLoadError(e?.message || 'Failed to load policy registry'));
  }, [idToken]);

  const handleSelect = async () => {
    setSelectError([]);
    setSelected(null);
    if (!date) {
      setSelectError([{ id: 'policy-date', message: 'Enter a commencement date' }]);
      return;
    }
    try {
      const d = await foundationFetch(
        '/api/foundation/policies/select?commencementDate=' + encodeURIComponent(date),
        idToken
      );
      setSelected(d.profile);
    } catch (e: any) {
      setSelectError([{ id: 'policy-date', message: e?.message || 'Selection failed' }]);
    }
  };

  if (loadError) return <StatusBanner tone="error">{loadError}</StatusBanner>;

  return (
    <div className="space-y-6">
      <GovPanel title="Select the applicable policy profile">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="policy-date" className="block text-sm font-bold mb-1">
              Procurement commencement date
            </label>
            <input
              id="policy-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={'border-2 border-[#0b0c0c] rounded-sm px-3 py-2 text-sm ' + focusRing}
            />
          </div>
          <GovButton onClick={handleSelect}>Select profile</GovButton>
        </div>
        <ErrorSummary errors={selectError} onFix={(id) => document.getElementById(id)?.focus()} />
        {selected && (
          <div className="mt-4">
            <StatusBanner tone="success">
              {selected.name} ({selected.version}) applies — {selected.legislation}
            </StatusBanner>
          </div>
        )}
      </GovPanel>

      {profiles.map((p) => (
        <GovPanel key={p.id} title={p.name}>
          <div className="flex flex-wrap gap-2 mb-3">
            <GovTag tone="blue">{p.version}</GovTag>
            <GovTag tone="green">{p.legislation}</GovTag>
            <GovTag tone="grey">
              {p.effectiveFrom} → {p.effectiveTo ?? 'in force'}
            </GovTag>
          </div>
          <p className="text-sm text-slate-700 mb-3">{p.summary}</p>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
            Key obligations
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1 mb-3">
            {p.keyObligations.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
          {p.disclosureQuestions.length > 0 && (
            <>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                Disclosure questions
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {p.disclosureQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </>
          )}
        </GovPanel>
      ))}
    </div>
  );
};
