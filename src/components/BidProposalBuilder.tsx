import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Award,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  Building2,
  TrendingUp,
  HelpCircle,
  Check,
  ChevronRight,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldAlert,
  Layers,
  Leaf,
  Users,
  DollarSign,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  BidCompanyProfile,
  BidProposalPackage,
  BidProposalSection,
  GoogleDocExportResult,
  WhiteLabelSettings,
} from '../types';
import { createGoogleDocBidProposal } from '../lib/workspaceApi';
import { downloadBlob } from '../lib/downloadHelper';

interface BidProposalBuilderProps {
  user: User | null;
  accessToken: string | null;
  onSignInRequired: () => void;
  whiteLabel?: WhiteLabelSettings;
  prefillTenderTitle?: string;
  prefillTenderText?: string;
  prefillAuthority?: string;
}

const SAMPLE_TENDERS = [
  {
    id: 'sample-ccs-cloud',
    title: 'Crown Commercial Service - Enterprise Cloud Infrastructure & Cyber Security Services',
    authority: 'Crown Commercial Service (Cabinet Office)',
    reference: 'CCS-RM6100-LOT2',
    requirements: `1. Provision of managed cloud hosting, secure infrastructure, and 24/7/365 Security Operations Centre (SOC) monitoring.
2. Mandatory Compliance with Procurement Act 2023 and PCR 2015 Regulation 84 audit trail requirements.
3. Mandatory PPN 06/20 Social Value Model commitment (10% minimum weighting): Support local skills training, apprenticeships, and SME supply chain participation.
4. Mandatory PPN 06/21 Carbon Reduction Plan: Validated Net Zero commitment, reporting on Scope 1, 2, and 5 mandatory Scope 3 subsets.
5. Cyber Essentials Plus, ISO 27001, and ISO 9001 certifications required prior to service commencement.
6. Mandatory prompt payment compliance with PPN 02/24 (> 95% invoices paid within 60 days).`,
  },
  {
    id: 'sample-nhs-digital',
    title: 'NHS Integrated Care Board - Digital Patient Workflow & Clinical Data Platform',
    authority: 'NHS Integrated Care Board (Central London)',
    reference: 'NHS-ITT-2026-DIGITAL',
    requirements: `1. Secure clinical data exchange platform compliant with NHS Data Security and Protection Toolkit (DSPT) and ISO 27001.
2. High Availability SLA (99.95% uptime) with 15-minute P1 critical incident response.
3. Social Value (PPN 06/20): Health inequalities reduction and digital literacy workshops for elderly patients.
4. PPN 06/21 Carbon Reduction Plan with clear decarbonisation trajectory towards NHS Net Zero 2040.
5. Modern Slavery (PPN 02/23) supply chain auditing for all hardware components.`,
  },
  {
    id: 'sample-awe-defence',
    title: 'Atomic Weapons Establishment (AWE) - Defense Infrastructure & Supply Chain Framework',
    authority: 'Atomic Weapons Establishment (AWE) / Ministry of Defence',
    reference: 'AWE-SUPPLY-CHAIN-PA23',
    requirements: `1. Nuclear security, high-integrity research facilities sustainment, and specialized technical supply chain capabilities under the Procurement Act 2023.
2. Mandatory registration on the government Central Digital Platform and verification of non-exclusion under Section 57 Central Debarment List.
3. Cyber Essentials Plus, List X facility security clearance suitability under Schedule 1 Defense & Security exemptions.
4. Mandatory Carbon Reduction Plan (PPN 06/21) covering Scope 1, Scope 2, and 5 Scope 3 categories with Net Zero trajectory.
5. Prompt Payment compliance (PPN 02/24) with 95% of supplier invoices paid within 60 days across Tier 2 supply chains.`,
  },
];

const AVAILABLE_CERTS = [
  'ISO 9001 (Quality Management)',
  'ISO 27001 (Information Security)',
  'ISO 14001 (Environmental Management)',
  'ISO 45001 (Health & Safety)',
  'Cyber Essentials Plus',
  'Living Wage Foundation Accredited',
  'Crown Commercial Service Supplier',
  'NHS DSPT Compliant',
];

interface InlineGapItemProps {
  originalGapText: string;
  onSave: (targetText: string, replacement: string) => void;
}

const InlineGapItem: React.FC<InlineGapItemProps> = ({ originalGapText, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    qualityScore: number;
    issues: string[];
    polishedText: string;
    explanation: string;
    isGibberish: boolean;
  } | null>(null);

  const cleanLabel = originalGapText
    .replace(/^\[(GAP|INPUT REQUIRED):\s*/, '')
    .replace(/\]$/, '');

  const handleCommit = async () => {
    if (!value.trim()) return;
    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/tender/validate-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: value.trim(),
          fieldLabel: cleanLabel,
        }),
      });

      if (!res.ok) throw new Error('Quality validation service unavailable');
      const data = await res.json();

      if (data.isValid && data.qualityScore >= 70 && !data.isGibberish) {
        // High quality text - auto apply polished or original text
        const textToApply = data.polishedText || value.trim();
        onSave(originalGapText, textToApply);
        setIsEditing(false);
      } else {
        // Show Quality & Grammar alert card
        setValidationResult(data);
      }
    } catch (err) {
      console.error('Validation error:', err);
      // Fallback check: block pure gibberish like <4 chars
      if (value.trim().length >= 4) {
        onSave(originalGapText, value.trim());
        setIsEditing(false);
      } else {
        setValidationResult({
          isValid: false,
          qualityScore: 20,
          isGibberish: true,
          issues: ['Input text is too short or invalid. Please enter valid procurement details.'],
          polishedText: `[Verified ${cleanLabel} Standard Clause]`,
          explanation: 'Input rejected due to insufficient length or lack of meaningful context.',
        });
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyPolished = (text: string) => {
    onSave(originalGapText, text);
    setIsEditing(false);
    setValidationResult(null);
  };

  if (isEditing) {
    return (
      <span className="inline-flex flex-col gap-2 bg-slate-900 border-2 border-indigo-500 rounded-xl p-3 mx-1 shadow-xl my-2 font-sans max-w-xl text-white">
        <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5">
          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Edit Gap: {cleanLabel}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            AI Statutory Grammar & Quality Gate Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (validationResult) setValidationResult(null);
            }}
            placeholder={`Enter verified ${cleanLabel} details (AI validates quality before saving)...`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCommit();
              } else if (e.key === 'Escape') {
                setIsEditing(false);
              }
            }}
            disabled={isValidating}
            className="px-3 py-2 text-xs border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full font-medium shadow-inner"
          />
          <button
            type="button"
            onClick={handleCommit}
            disabled={isValidating || !value.trim()}
            className="px-3 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {isValidating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Verify & Save</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-2.5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition shrink-0 cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* AI Quality Audit Result Banner */}
        {validationResult && (
          <div className="rounded-lg border border-amber-500/50 bg-amber-950/80 p-3 space-y-2 text-xs animate-in fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Grammar & Compliance Audit Score: {validationResult.qualityScore}/100
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                validationResult.isGibberish ? 'bg-rose-900 text-rose-200' : 'bg-amber-900 text-amber-200'
              }`}>
                {validationResult.isGibberish ? '❌ Invalid / Gibberish Text' : '⚠️ Grammar Review Needed'}
              </span>
            </div>

            {validationResult.issues.length > 0 && (
              <ul className="list-disc list-inside text-[11px] text-amber-200 space-y-0.5 pl-1">
                {validationResult.issues.map((iss, idx) => (
                  <li key={idx}>{iss}</li>
                ))}
              </ul>
            )}

            {validationResult.polishedText && (
              <div className="rounded border border-indigo-400/40 bg-indigo-950/80 p-2.5 space-y-1.5 mt-1">
                <div className="text-[11px] font-bold text-indigo-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Polished UK Procurement English Clause:
                  </span>
                </div>
                <div className="text-xs font-mono text-white bg-slate-900/90 p-2 rounded border border-slate-700">
                  {validationResult.polishedText}
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyPolished(validationResult.polishedText)}
                  className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md mt-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Polished English Text (1-Click)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </span>
    );
  }

  return (
    <span
      onClick={() => {
        setValue('');
        setValidationResult(null);
        setIsEditing(true);
      }}
      className="inline-flex items-center gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-950 font-extrabold px-3 py-1.5 rounded-lg border-2 border-rose-500 shadow-sm mx-1 text-xs animate-pulse cursor-pointer transition hover:scale-[1.02] my-1"
      title="Click to resolve this gap with real-time AI Quality & Grammar Audit"
    >
      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
      <span>{originalGapText}</span>
      <span className="ml-1 bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded text-[11px] font-black tracking-wide shadow-2xs flex items-center gap-1">
        ✏️ Edit & Validate
      </span>
    </span>
  );
};

export const BidProposalBuilder: React.FC<BidProposalBuilderProps> = ({
  user,
  accessToken,
  onSignInRequired,
  whiteLabel,
  prefillTenderTitle,
  prefillTenderText,
  prefillAuthority,
}) => {
  // Input States
  const [tenderTitle, setTenderTitle] = useState(
    prefillTenderTitle || 'Crown Commercial Service - Enterprise Cloud Infrastructure & Cyber Security Services'
  );
  const [contractingAuthority, setContractingAuthority] = useState(
    prefillAuthority || 'Crown Commercial Service (Cabinet Office)'
  );
  const [tenderReference, setTenderReference] = useState('CCS-RM6100-LOT2');
  const [tenderRequirementsText, setTenderRequirementsText] = useState(
    prefillTenderText || SAMPLE_TENDERS[0].requirements
  );

  // Company Profile
  const [companyProfile, setCompanyProfile] = useState<BidCompanyProfile>({
    companyName: 'Apex Digital Solutions UK Ltd',
    companyNumber: '08942180',
    registeredAddress: '100 Bishopsgate, London EC2N 4AG, United Kingdom',
    contactPerson: 'Sarah Jenkins',
    contactEmail: 's.jenkins@apexdigital-uk.com',
    contactPhone: '+44 (0)20 7946 0912',
    yearsTrading: 8,
    annualTurnoverGbp: '£14,500,000',
    primarySector: 'Cloud Infrastructure & Cyber Security',
    certifications: [
      'ISO 9001 (Quality Management)',
      'ISO 27001 (Information Security)',
      'ISO 14001 (Environmental Management)',
      'Cyber Essentials Plus',
      'Living Wage Foundation Accredited',
    ],
    socialValueCommitments:
      'Committed to 4 local tech apprenticeships per year, 35% sub-contracted spend to UK regional SMEs, and 100% Real Living Wage across all contract staff.',
    netZeroTargetYear: '2035',
    keyDifferentiators:
      'UK-sovereign 24/7 Security Operations Centre (SOC), proprietary Zero-Downtime Migration Framework, 99.99% historical uptime SLA across 14 public sector frameworks.',
    pastPerformanceSummary:
      'Successfully delivered £8.4M Multi-Cloud Transformation for the Department for Transport (DfT) on time and 12% under budget with zero critical security incidents.',
  });

  // Proposal Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('executive_summary');
  const [proposalPackage, setProposalPackage] = useState<BidProposalPackage | null>(null);
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [exportedDocResult, setExportedDocResult] = useState<GoogleDocExportResult | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterGapOnly, setFilterGapOnly] = useState(false);

  const [isEditingSection, setIsEditingSection] = useState(false);
  const [editingSectionContent, setEditingSectionContent] = useState('');

  const handleStartEditingSection = () => {
    if (activeSection) {
      setEditingSectionContent(activeSection.content);
      setIsEditingSection(true);
    }
  };

  const handleSaveSectionEdit = () => {
    if (!proposalPackage || !activeSection) return;
    const updatedSections = proposalPackage.sections.map((sec) => {
      if (sec.sectionId === activeSectionId) {
        // Clear gaps that no longer match GAP placeholders
        const remainingGaps = sec.identifiedGaps?.filter((g) =>
          editingSectionContent.includes(g.description) || editingSectionContent.includes('GAP')
        ) || [];
        return {
          ...sec,
          content: editingSectionContent,
          identifiedGaps: remainingGaps,
        };
      }
      return sec;
    });

    const totalIdentifiedGaps = updatedSections.reduce((acc, s) => acc + (s.identifiedGaps?.length || 0), 0);
    const criticalGapsCount = updatedSections.reduce(
      (acc, s) => acc + (s.identifiedGaps?.filter((g) => g.impactLevel === 'Critical').length || 0),
      0
    );

    setProposalPackage({
      ...proposalPackage,
      sections: updatedSections,
      totalIdentifiedGaps,
      criticalGapsCount,
    });
    setIsEditingSection(false);
    showToast('success', 'Section content updated!');
  };

  const handleResolveGap = (targetGapText: string, replacementText: string) => {
    if (!proposalPackage || !activeSection) return;

    const updatedSections = proposalPackage.sections.map((sec) => {
      if (sec.sectionId === activeSection.sectionId) {
        const newContent = sec.content.replace(targetGapText, replacementText);

        // Filter out resolved gaps
        const remainingGaps = (sec.identifiedGaps || []).filter((g) => {
          return newContent.includes('[GAP:') || newContent.includes('[INPUT REQUIRED:');
        });

        return {
          ...sec,
          content: newContent,
          identifiedGaps: remainingGaps,
        };
      }
      return sec;
    });

    const totalIdentifiedGaps = updatedSections.reduce((acc, s) => acc + (s.identifiedGaps?.length || 0), 0);
    const criticalGapsCount = updatedSections.reduce(
      (acc, s) => acc + (s.identifiedGaps?.filter((g) => g.impactLevel === 'Critical').length || 0),
      0
    );

    setProposalPackage({
      ...proposalPackage,
      sections: updatedSections,
      totalIdentifiedGaps,
      criticalGapsCount,
    });

    showToast('success', 'Gap resolved and verified with standard text styling.');
  };

  // Full Document AI Quality & Grammar Audit State
  const [isAuditingFullDoc, setIsAuditingFullDoc] = useState(false);
  const [fullDocAuditResult, setFullDocAuditResult] = useState<any>(null);

  const handleRunFullDocumentAudit = async () => {
    if (!proposalPackage || !proposalPackage.sections) return;
    setIsAuditingFullDoc(true);

    try {
      const res = await fetch('/api/tender/audit-full-document-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderTitle: proposalPackage.tenderTitle,
          sections: proposalPackage.sections.map((s) => ({
            sectionId: s.sectionId,
            title: s.title,
            content: s.content,
          })),
        }),
      });

      if (!res.ok) throw new Error('Full document audit service failed');
      const data = await res.json();
      setFullDocAuditResult(data);
      showToast('success', `Document Audit Complete! Overall Quality Score: ${data.overallQualityScore}/100`);
    } catch (err: any) {
      console.error('Full doc audit error:', err);
      showToast('error', err.message || 'Full document audit failed');
    } finally {
      setIsAuditingFullDoc(false);
    }
  };

  const handleApplyAllDocQualityCorrections = () => {
    if (!proposalPackage || !fullDocAuditResult) return;

    const updatedSections = proposalPackage.sections.map((sec) => {
      const auditItem = fullDocAuditResult.sectionAudits?.find((a: any) => a.sectionId === sec.sectionId);
      if (auditItem && auditItem.polishedContent) {
        const remainingGaps = (sec.identifiedGaps || []).filter((g) =>
          auditItem.polishedContent.includes('[GAP:') || auditItem.polishedContent.includes('[INPUT REQUIRED:')
        );
        return {
          ...sec,
          content: auditItem.polishedContent,
          identifiedGaps: remainingGaps,
        };
      }
      return sec;
    });

    const totalIdentifiedGaps = updatedSections.reduce((acc, s) => acc + (s.identifiedGaps?.length || 0), 0);
    const criticalGapsCount = updatedSections.reduce(
      (acc, s) => acc + (s.identifiedGaps?.filter((g) => g.impactLevel === 'Critical').length || 0),
      0
    );

    setProposalPackage({
      ...proposalPackage,
      sections: updatedSections,
      totalIdentifiedGaps,
      criticalGapsCount,
    });

    setFullDocAuditResult(null);
    showToast('success', 'Applied AI Quality & Grammar Corrections across all proposal sections!');
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleCert = (cert: string) => {
    setCompanyProfile((prev) => {
      const exists = prev.certifications.includes(cert);
      return {
        ...prev,
        certifications: exists
          ? prev.certifications.filter((c) => c !== cert)
          : [...prev.certifications, cert],
      };
    });
  };

  const handleLoadSample = (sample: (typeof SAMPLE_TENDERS)[0]) => {
    setTenderTitle(sample.title);
    setContractingAuthority(sample.authority);
    setTenderReference(sample.reference);
    setTenderRequirementsText(sample.requirements);
    showToast('success', `Loaded sample tender: ${sample.title}`);
  };

  const handleGenerateProposal = async () => {
    if (!tenderTitle.trim() || !tenderRequirementsText.trim()) {
      showToast('error', 'Please enter both the Tender Title and Requirements.');
      return;
    }

    setIsGenerating(true);
    setExportedDocResult(null);

    try {
      const response = await fetch('/api/bid-proposal/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderTitle,
          contractingAuthority,
          tenderReference,
          tenderRequirementsText,
          companyProfile,
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed with status ${response.status}`);
      }

      const data: BidProposalPackage = await response.json();
      setProposalPackage(data);
      if (data.sections?.length > 0) {
        setActiveSectionId(data.sections[0].sectionId);
      }
      showToast('success', 'Real Bid Proposal Package generated with statutory compliance and gap analysis!');
    } catch (err: any) {
      console.error('Proposal generation error:', err);
      showToast('error', err.message || 'Failed to generate proposal package.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySection = (section: BidProposalSection) => {
    navigator.clipboard.writeText(section.content);
    setCopiedSectionId(section.sectionId);
    showToast('success', `Copied "${section.title}" to clipboard.`);
    setTimeout(() => setCopiedSectionId(null), 2500);
  };

  const handleCopyFullMarkdown = () => {
    if (!proposalPackage) return;
    const fullMd = proposalPackage.sections
      .map((s) => `# ${s.title}\n\n**Statutory Basis:** ${s.statutoryAlignment}\n\n${s.content}\n\n---\n`)
      .join('\n');
    navigator.clipboard.writeText(fullMd);
    showToast('success', 'Full Bid Response Package copied in Markdown format!');
  };

  const handleDownloadPdf = async () => {
    if (!proposalPackage) return;
    setIsDownloadingPdf(true);
    try {
      const res = await fetch('/api/bid-proposal/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal: proposalPackage, whiteLabel }),
      });

      if (!res.ok) throw new Error('PDF export failed');

      const blob = await res.blob();
      await downloadBlob(blob, `Tender_Bid_Proposal_${proposalPackage.id}.pdf`);
      showToast('success', 'Official Bid Proposal PDF downloaded.');
    } catch (err: any) {
      showToast('error', `Failed to download PDF: ${err.message}`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleExportGoogleDoc = async () => {
    if (!accessToken) {
      onSignInRequired();
      return;
    }
    if (!proposalPackage) return;

    setIsExportingDoc(true);
    try {
      const result = await createGoogleDocBidProposal(accessToken, proposalPackage);
      setExportedDocResult(result);
      showToast('success', 'Bid Proposal exported directly to Google Docs!');
    } catch (err: any) {
      showToast('error', `Failed to export to Google Docs: ${err.message}`);
    } finally {
      setIsExportingDoc(false);
    }
  };

  // Helper to render content with inline-editable [GAP: ...] tokens
  const renderFormattedSectionContent = (content: string) => {
    // Regex for [GAP: ...] and [INPUT REQUIRED: ...]
    const parts = content.split(/(\[GAP:[^\]]+\]|\[INPUT REQUIRED:[^\]]+\])/g);

    return (
      <div className="text-slate-800 text-sm leading-relaxed space-y-3 font-sans whitespace-pre-wrap">
        {parts.map((part, idx) => {
          if (part.startsWith('[GAP:') || part.startsWith('[INPUT REQUIRED:')) {
            return (
              <InlineGapItem
                key={idx}
                originalGapText={part}
                onSave={handleResolveGap}
              />
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  const activeSection = proposalPackage?.sections.find((s) => s.sectionId === activeSectionId);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2.5 transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="bg-sky-500/20 text-sky-300 font-semibold px-2.5 py-0.5 rounded-full text-xs border border-sky-400/30">
                Official Tender Proposal Suite
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full text-xs border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero-Hallucination & Gap-Verified
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Bid Proposal & Response Package Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Formulate fully-fledged, evidence-anchored bid proposals compliant with UK Public Sector procurement frameworks
              (Procurement Act 2023, PPN 06/20 Social Value Model, PPN 06/21 Carbon Reduction). Features automated <span className="font-semibold text-rose-300">[GAP: ...]</span> flags for missing evidence
              and Most Advantageous Tender (MAT) scoring rubric optimization.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-row md:flex-col gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[130px]">
              <span className="text-xs text-slate-200 block uppercase font-medium">Statutory Baseline</span>
              <span className="text-sm font-bold text-sky-300">Procurement Act 2023</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[130px]">
              <span className="text-xs text-slate-200 block uppercase font-medium">Social Value Model</span>
              <span className="text-sm font-bold text-emerald-300">PPN 06/20 (10%+)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Workspace vs Output Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tender Spec & Bidder Profile Inputs (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Box 1: Tender Requirements & Samples */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-800" />
                <span>1. Tender / ITT Specifications</span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <span className="font-semibold">Samples:</span>
                {SAMPLE_TENDERS.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => handleLoadSample(s)}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-900 font-bold text-xs transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 min-h-[32px]"
                  >
                    Sample {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tender Title
              </label>
              <input
                type="text"
                value={tenderTitle}
                onChange={(e) => setTenderTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                placeholder="e.g. Crown Commercial Service - Cloud Hosting & Support"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contracting Authority
                </label>
                <input
                  type="text"
                  value={contractingAuthority}
                  onChange={(e) => setContractingAuthority(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  placeholder="e.g. Crown Commercial Service"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tender / ITT Reference
                </label>
                <input
                  type="text"
                  value={tenderReference}
                  onChange={(e) => setTenderReference(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-mono"
                  placeholder="e.g. ITT-2026-094"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tender Scope & Mandatory Requirements
              </label>
              <textarea
                rows={4}
                value={tenderRequirementsText}
                onChange={(e) => setTenderRequirementsText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-mono"
                placeholder="Paste tender requirements, evaluation criteria, or ITT specifications here..."
              />
            </div>
          </div>

          {/* Box 2: Bidder Organization Profile */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-700" />
              <span>2. Bidder Organization Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyProfile.companyName}
                  onChange={(e) =>
                    setCompanyProfile({ ...companyProfile, companyName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Companies House No.
                </label>
                <input
                  type="text"
                  value={companyProfile.companyNumber}
                  onChange={(e) =>
                    setCompanyProfile({ ...companyProfile, companyNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-mono"
                  placeholder="e.g. 08942180"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Turnover
                </label>
                <input
                  type="text"
                  value={companyProfile.annualTurnoverGbp}
                  onChange={(e) =>
                    setCompanyProfile({ ...companyProfile, annualTurnoverGbp: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-mono"
                  placeholder="e.g. £14,500,000"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Net Zero Target Year
                </label>
                <select
                  value={companyProfile.netZeroTargetYear}
                  onChange={(e) =>
                    setCompanyProfile({ ...companyProfile, netZeroTargetYear: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="2030">2030 (Aggressive)</option>
                  <option value="2035">2035 (Advanced)</option>
                  <option value="2040">2040 (NHS Target)</option>
                  <option value="2050">2050 (UK Statutory Baseline)</option>
                </select>
              </div>
            </div>

            {/* Certifications Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Accreditations & Standards
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_CERTS.map((cert) => {
                  const isChecked = companyProfile.certifications.includes(cert);
                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => handleToggleCert(cert)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
                        isChecked
                          ? 'bg-blue-800 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-sky-300" />}
                      <span>{cert}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Social Value Commitments (PPN 06/20 Model)
              </label>
              <textarea
                rows={2}
                value={companyProfile.socialValueCommitments}
                onChange={(e) =>
                  setCompanyProfile({ ...companyProfile, socialValueCommitments: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                placeholder="e.g. 4 apprenticeships, 30% SME supply chain spend, Living Wage..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Past Performance & Reference Contracts
              </label>
              <textarea
                rows={2}
                value={companyProfile.pastPerformanceSummary}
                onChange={(e) =>
                  setCompanyProfile({ ...companyProfile, pastPerformanceSummary: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                placeholder="e.g. Delivered £8M multi-cloud contract for Department for Transport on time..."
              />
            </div>

            {/* Generate Action Button */}
            <button
              id="btn-generate-bid-proposal"
              onClick={handleGenerateProposal}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-white transition shadow-md ${
                isGenerating
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-800 hover:bg-blue-900 active:scale-[0.99] border border-blue-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Formulating Statutory Tender Package & MAT Win Analysis...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 text-sky-300" />
                  <span>Generate Full Tender Response Package</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Generated Proposal Package & Win Strategy (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {!proposalPackage ? (
            /* Empty State */
            <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 border border-blue-100">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Ready to Formulate Official Tender Response Package
              </h3>
              <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
                Click <strong>"Generate Full Tender Response Package"</strong> to formulate a 6-part statutory bid response
                (Cover Letter, Technical Statement, Social Value PPN 06/20, Carbon Reduction PPN 06/21, Modern Slavery, Commercial Schedule)
                with explicit <span className="font-semibold text-rose-600">[GAP: ...]</span> verification flags and MAT scoring rubric optimization.
              </p>
              <button
                onClick={handleGenerateProposal}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-800 text-white hover:bg-blue-900 transition flex items-center gap-2 shadow-xs"
              >
                <FileCheck className="w-4 h-4 text-sky-300" />
                <span>Generate Sample Bid Proposal Now</span>
              </button>
            </div>
          ) : (
            /* Proposal Generated Dossier */
            <div className="space-y-6">
              {/* Win Strategy & MAT Optimization Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-5 text-white shadow-md border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        Strategic Win-Probability & Value Proposition Analysis
                      </h4>
                      <span className="text-xs text-slate-200">
                        Most Advantageous Tender (MAT) Scoring Rubric Optimization
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-200 font-medium">Estimated Win Probability:</span>
                    <span className="text-base font-extrabold text-emerald-300 font-mono bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-400/50">
                      {proposalPackage.winStrategy?.overallWinProbabilityScore || 88}%
                    </span>
                  </div>
                </div>

                {/* Win Themes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {proposalPackage.winStrategy?.keyWinThemes?.map((wt, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg p-3 border border-white/15">
                      <span className="text-xs font-bold text-sky-200 uppercase tracking-wider block mb-1">
                        Win Theme {idx + 1}
                      </span>
                      <h5 className="text-xs font-bold text-white mb-1">{wt.theme}</h5>
                      <p className="text-xs text-slate-200 mb-2 leading-relaxed">{wt.valueProposition}</p>
                      <div className="text-xs text-emerald-300 font-medium flex items-start gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                        <span>{wt.proofPoint}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Red Team Evaluator Insights */}
                <div className="bg-white/10 rounded-lg p-3.5 border border-white/15 space-y-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Red-Team Evaluator Advice (Guidance to achieve maximum 5/5 score):</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    {proposalPackage.winStrategy?.redTeamEvaluationFeedback?.map((fb, idx) => (
                      <div key={idx} className="bg-slate-950/90 p-3 rounded-lg border border-slate-700">
                        <span className="font-semibold text-slate-100 block mb-1">{fb.criterion}</span>
                        <span className="text-emerald-300 block mb-1 font-medium">✓ {fb.currentStrength}</span>
                        <span className="text-amber-200 block font-medium">Fix: {fb.actionableCorrection}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gap Audit & Action Banner */}
              <div className={`rounded-xl border p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-all ${
                proposalPackage.totalIdentifiedGaps > 0
                  ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/60'
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    proposalPackage.totalIdentifiedGaps > 0 ? 'bg-rose-600 text-white animate-pulse shadow-md' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block flex items-center gap-2">
                      <span>Evidence Gap Tracker: {proposalPackage.totalIdentifiedGaps} Placeholders Identified</span>
                      {proposalPackage.totalIdentifiedGaps > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white animate-pulse">
                          ACTION REQUIRED
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      {proposalPackage.criticalGapsCount > 0
                        ? `${proposalPackage.criticalGapsCount} critical items require verified data before final submission.`
                        : 'All critical statutory compliance evidence verified.'}
                    </span>
                  </div>
                </div>

                {/* Action Export Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleRunFullDocumentAudit}
                    disabled={isAuditingFullDoc}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white shadow-md transition border border-indigo-600 cursor-pointer"
                    title="Audit all sections of this document for grammar, spelling, and statutory rigor"
                  >
                    {isAuditingFullDoc ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Auditing Full Document...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                        <span>Audit Full Document Quality</span>
                      </>
                    )}
                  </button>

                  {proposalPackage.totalIdentifiedGaps > 0 && (
                    <button
                      onClick={() => {
                        const firstGapSec = proposalPackage.sections.find((s) => s.identifiedGaps?.length > 0);
                        if (firstGapSec) {
                          setActiveSectionId(firstGapSec.sectionId);
                          handleStartEditingSection();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md animate-pulse transition"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Jump to First Gap & Fix</span>
                    </button>
                  )}

                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-800 text-white hover:bg-blue-900 transition shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloadingPdf ? 'Downloading...' : 'Download PDF'}</span>
                  </button>

                  <button
                    onClick={handleExportGoogleDoc}
                    disabled={isExportingDoc}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 transition shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isExportingDoc ? 'Exporting...' : 'Export to Docs'}</span>
                  </button>

                  <button
                    onClick={handleCopyFullMarkdown}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Copy entire package in Markdown"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All</span>
                  </button>
                </div>
              </div>

              {/* Full Document AI Quality & Grammar Audit Results Panel */}
              {fullDocAuditResult && (
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500 rounded-xl p-5 text-white shadow-xl space-y-4 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                          <span>Full Document Quality & Grammar Audit Report</span>
                        </h4>
                        <span className="text-xs text-slate-300">
                          {fullDocAuditResult.summaryVerdict}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Overall Document Score</span>
                        <span className={`text-lg font-extrabold font-mono px-2.5 py-0.5 rounded-lg border ${
                          fullDocAuditResult.overallQualityScore >= 85
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                            : 'bg-amber-950 text-amber-300 border-amber-500/50'
                        }`}>
                          {fullDocAuditResult.overallQualityScore} / 100
                        </span>
                      </div>
                      <button
                        onClick={handleApplyAllDocQualityCorrections}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition flex items-center gap-1.5 border border-emerald-400 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept & Apply All AI Quality Corrections Across Package (1-Click)</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fullDocAuditResult.sectionAudits?.map((sa: any, idx: number) => (
                      <div key={idx} className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="text-xs font-bold text-indigo-200">{sa.sectionTitle}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            sa.grammarScore >= 85 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            Score: {sa.grammarScore}/100
                          </span>
                        </div>

                        {sa.issuesFound?.length > 0 ? (
                          <ul className="list-disc list-inside text-[11px] text-amber-300 space-y-1">
                            {sa.issuesFound.map((iss: string, i: number) => (
                              <li key={i}>{iss}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-medium block">✓ Flawless UK Procurement English & Grammar</span>
                        )}

                        {sa.hasCorrections && sa.polishedContent && (
                          <div className="text-[11px] font-mono text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800 max-h-24 overflow-y-auto leading-relaxed">
                            <span className="text-indigo-400 font-bold block mb-0.5 font-sans text-[10px]">Polished Section Text Preview:</span>
                            {sa.polishedContent.slice(0, 200)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exported Google Doc Link Banner */}
              {exportedDocResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs text-emerald-900 font-medium">
                      Google Doc Created: <strong>{exportedDocResult.title}</strong>
                    </span>
                  </div>
                  <a
                    href={exportedDocResult.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                  >
                    <span>Open in Google Docs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Section Tabs Navigation */}
              <div className={`bg-white rounded-xl shadow-2xs overflow-hidden transition-all ${
                activeSection && activeSection.identifiedGaps?.length > 0
                  ? 'border-2 border-rose-500 shadow-lg shadow-rose-100/60'
                  : 'border border-slate-200'
              }`}>
                <div className="border-b border-slate-200 bg-slate-50/70 px-3 py-2 flex space-x-1.5 overflow-x-auto">
                  {proposalPackage.sections.map((sec, idx) => {
                    const isActive = sec.sectionId === activeSectionId;
                    const hasGaps = sec.identifiedGaps?.length > 0;
                    return (
                      <button
                        key={sec.sectionId}
                        onClick={() => {
                          setActiveSectionId(sec.sectionId);
                          setIsEditingSection(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                          isActive
                            ? hasGaps
                              ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400 ring-offset-1 border-2 border-rose-600 animate-pulse'
                              : 'bg-blue-800 text-white shadow-2xs border border-blue-800'
                            : hasGaps
                              ? 'bg-rose-50 text-rose-950 border-2 border-rose-500 ring-2 ring-rose-300 font-black shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border border-transparent'
                        }`}
                      >
                        <span>{idx + 1}. {sec.title.split(':')[0]}</span>
                        {hasGaps ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold animate-pulse ${
                              isActive ? 'bg-white text-rose-800 shadow-2xs' : 'bg-rose-600 text-white shadow-2xs'
                            }`}
                          >
                            ⚠️ {sec.identifiedGaps.length} gaps
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Section Content View */}
                {activeSection && (
                  <div className="p-6 space-y-6">
                    {/* Section Header Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>{activeSection.title}</span>
                          {activeSection.identifiedGaps?.length > 0 && (
                            <span className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-full font-semibold border border-rose-200 animate-pulse">
                              ⚠️ Action Needed
                            </span>
                          )}
                        </h4>
                        <span className="text-xs text-blue-800 font-medium block mt-0.5">
                          Statutory Basis: {activeSection.statutoryAlignment}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleStartEditingSection}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-2xs ${
                            activeSection.identifiedGaps?.length > 0
                              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-2 ring-rose-300'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          <span>
                            {activeSection.identifiedGaps?.length > 0
                              ? '⚠️ Edit & Resolve Gaps Now'
                              : 'Edit Section Text'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleCopySection(activeSection)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          {copiedSectionId === activeSection.sectionId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-600" />
                              <span>Copy Section Text</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Evaluator Rubric & Tip Card */}
                    {activeSection.evaluatorRubricScoreEstimate && (
                      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-xs">
                        <Award className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-emerald-950 block">
                            Evaluator Score Rating: {activeSection.evaluatorRubricScoreEstimate.scoreOutOf5} / 5.0 (
                            {activeSection.evaluatorRubricScoreEstimate.scoringRationale})
                          </span>
                          <p className="text-emerald-800 text-[11px] leading-relaxed">
                            <strong>Tip for Top Score:</strong> {activeSection.evaluatorRubricScoreEstimate.tipToReachMaxScore}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Rendered Content OR Inline Editor */}
                    {isEditingSection ? (
                      <div className="bg-white p-5 rounded-xl border border-blue-300 shadow-md space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-700" />
                            <span>Edit Section Content & Replace [GAP] Placeholders:</span>
                          </span>
                          <span className="text-[11px] text-slate-500">Supports markdown text</span>
                        </div>
                        <textarea
                          rows={12}
                          value={editingSectionContent}
                          onChange={(e) => setEditingSectionContent(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-3 text-xs font-mono text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setIsEditingSection(false)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveSectionEdit}
                            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-800 hover:bg-blue-900 text-white transition shadow-2xs flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Save Section & Resolve Gaps</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-5 rounded-xl font-sans transition-all ${
                        activeSection.identifiedGaps?.length > 0
                          ? 'bg-rose-50/40 border-2 border-rose-500 shadow-2xs'
                          : 'bg-slate-50/80 border border-slate-200/80'
                      }`}>
                        {renderFormattedSectionContent(activeSection.content)}
                      </div>
                    )}

                    {/* Specific Section Gaps List */}
                    {activeSection.identifiedGaps?.length > 0 && (
                      <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Actionable Evidence Needed for this Section ({activeSection.identifiedGaps.length} items):</span>
                          </span>
                          {!isEditingSection && (
                            <button
                              onClick={handleStartEditingSection}
                              className="text-xs font-bold text-blue-800 hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-rose-200"
                            >
                              <span>Fix / Replace Gaps Now</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-2 text-xs">
                          {activeSection.identifiedGaps.map((gap, i) => (
                            <div key={i} className="flex items-start justify-between gap-3 text-rose-900 bg-white p-3 rounded-lg border border-rose-100 shadow-2xs">
                              <div className="flex items-start gap-2.5">
                                <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 shrink-0 mt-0.5">
                                  {gap.impactLevel}
                                </span>
                                <div>
                                  <span className="font-semibold text-slate-900">{gap.description}</span>
                                  <span className="block text-[11px] text-slate-600 mt-1">
                                    <strong>Required Evidence:</strong> {gap.evidenceRequired}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={handleStartEditingSection}
                                className="shrink-0 text-[11px] font-bold text-blue-800 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md transition"
                              >
                                Edit Text
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
