/**
 * Policy Registry — Phase 1 (BS-NV-P1)
 *
 * Holds versioned policy profiles with effective dates instead of
 * hard-coding a single PPN. Selection is by procurement commencement date.
 */
export interface PolicyProfile {
  id: string;
  name: string;
  version: string;
  effectiveFrom: string; // ISO date
  effectiveTo: string | null;
  legislation: string;
  summary: string;
  keyObligations: string[];
  disclosureQuestions: string[];
}

export const POLICY_PROFILES: PolicyProfile[] = [
  {
    id: 'ppn-02-24',
    name: 'PPN 02/24 — Supplier due diligence & payment transparency',
    version: 'v1.0',
    effectiveFrom: '2024-03-01',
    effectiveTo: '2025-02-23',
    legislation: 'Public Contracts Regulations 2015',
    summary:
      'Applies to relevant procurements commenced before 24 February 2025 under the PCR 2015 regime.',
    keyObligations: [
      'Supplier fraud/insolvency due diligence checks',
      'Prompt payment reporting expectations',
      'Exclusion and debarment checks',
    ],
    disclosureQuestions: [],
  },
  {
    id: 'ppn-017',
    name: 'PPN 017 — Improving transparency of AI use in procurement',
    version: 'v1.0',
    effectiveFrom: '2025-02-24',
    effectiveTo: null,
    legislation: 'Procurement Act 2023 / Procurement Regulations 2024',
    summary:
      'Applies to relevant procurements commenced from 24 February 2025 under the Procurement Act 2023 regime. Encourages AI-use transparency, accuracy checks and proportionate due diligence.',
    keyObligations: [
      'Disclose AI use in tender preparation where asked',
      'Check accuracy, robustness and credibility of AI-assisted content',
      'Protect confidential information when using AI tools',
      'Separate AI used for bid drafting from AI in proposed service delivery',
    ],
    disclosureQuestions: [
      'Did you use AI to help prepare this tender?',
      'What checks did you perform on the accuracy of AI-assisted content?',
      'Does AI form part of the proposed service delivery?',
    ],
  },
];

/** Select the applicable profile for a procurement commencement date. */
export function selectPolicyProfile(commencementDate: string): PolicyProfile {
  const d = new Date(commencementDate).toISOString().slice(0, 10);
  const match = POLICY_PROFILES.find(
    (p) => d >= p.effectiveFrom && (p.effectiveTo === null || d <= p.effectiveTo)
  );
  if (!match) {
    throw new Error('No policy profile applies to commencement date: ' + commencementDate);
  }
  return match;
}
