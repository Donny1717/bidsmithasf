import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ExternalLink,
  Download,
  Share2,
  TrendingUp,
  Scale,
  ListTodo,
  Layers,
  ArrowRight,
  FileCheck,
  CheckSquare,
  Square,
  Briefcase,
  AlertOctagon,
  Copy,
  Info,
  Clock,
  Sparkles,
  Wand2,
  Check,
} from 'lucide-react';
import {
  TenderAnalysisRequest,
  TenderComplianceResult,
  UserRole,
  TenderChecklistAction,
  WhiteLabelSettings,
  GoogleDocExportResult,
  GoogleTaskExportResult,
} from '../types';
import { createGoogleDocCustom, createGoogleTasks } from '../lib/workspaceApi';
import { downloadBlob } from '../lib/downloadHelper';
import { User } from 'firebase/auth';

interface TenderComplianceScannerProps {
  user: User | null;
  accessToken: string | null;
  onSignInRequired: () => void;
  onDocCreated?: (doc: GoogleDocExportResult) => void;
  onTasksCreated?: (tasks: GoogleTaskExportResult[]) => void;
  whiteLabel?: WhiteLabelSettings;
  onNavigateToBidBuilder?: (tenderTitle: string, tenderText: string, authority: string) => void;
}

const SAMPLE_TENDERS: Array<{
  name: string;
  authority: string;
  value: number;
  sector: 'Central Government' | 'Local Authority' | 'NHS / Healthcare' | 'Infrastructure';
  role: UserRole;
  description: string;
  sampleText: string;
}> = [
  {
    name: 'Crown Commercial Service – Cloud & Cyber Secure Hosting Framework',
    authority: 'Crown Commercial Service (Cabinet Office)',
    value: 8500000,
    sector: 'Central Government',
    role: 'supplier_bidder',
    description: 'Central Government £8.5M procurement with mandatory PPN 06/21 Net Zero, Cyber Essentials Plus, and Prompt Payment.',
    sampleText: `INVITATION TO TENDER (ITT) - REFERENCE: CCS/CLOUD/2026/09
PROJECT TITLE: High-Security Government Cloud Hosting & AI Data Ingestion Infrastructure
ESTIMATED VALUE: £8,500,000 GBP (4-Year Call-off Framework)
CONTRACTING AUTHORITY: Crown Commercial Service on behalf of Cabinet Office and Central Departments.

1. SCOPE & OBJECTIVES
The Authority requires an enterprise cloud data hosting and sovereign security infrastructure under the Procurement Act 2023. Bidders must deliver high availability (99.99%), automated data replication, and strict supply chain resilience.

2. MANDATORY SELECTION CRITERIA (PASS / FAIL)
2.1 Statutory Grounds of Exclusion: Confirmation that neither the bidder nor any consortium members/subcontractors are listed on the Cabinet Office Central Debarment List under Section 57 of the Procurement Act 2023.
2.2 Carbon Reduction Plan (PPN 06/21): As this procurement exceeds the £5,000,000 threshold, all bidders must submit a fully compliant Carbon Reduction Plan (CRP) confirmed by a company director. The CRP must report Scope 1, Scope 2, and the 5 defined Scope 3 greenhouse gas categories, with a clear Net Zero commitment by 2050.
2.3 Prompt Payment Performance (PPN 02/23): Bidders must demonstrate payment of 95% of invoices within 60 days across their supply chain in the last two 6-month reporting periods.
2.4 AI Transparency & Model Controls (PPN 02/24): Bidders must complete Annex B AI disclosure questions and ensure no non-public government tender data is used to train AI models.
2.5 Cyber Security Model (PPN 10/23): Mandatory Cyber Essentials Plus certification valid at the date of tender submission.

3. AWARD CRITERIA & SOCIAL VALUE
- Quality & Technical Solution: 60%
- Commercial / Pricing: 25%
- Social Value (PPN 06/20): 15% (Focusing on Theme 1: Tackling Economic Inequality and Theme 3: Fighting Climate Change).

4. CONTRACT GOVERNANCE & KPIS
In accordance with Section 52 of the Procurement Act 2023, the Authority has established 3 statutory Key Performance Indicators (KPIs) to be assessed and published annually.`,
  },
  {
    name: 'NHS Trust – Digital Patient Electronic Record Integration',
    authority: 'NHS Foundation Trust',
    value: 3200000,
    sector: 'NHS / Healthcare',
    role: 'contracting_authority',
    description: 'NHS procurement (£3.2M) examining buyer duties under Procurement Act 2023, DSPT standards, and transparency notices.',
    sampleText: `REQUEST FOR PROPOSAL (RFP) - REF: NHS-EPR-2026-V2
TITLE: Integrated Clinical Electronic Patient Record (EPR) & Interoperability Engine
ESTIMATED VALUE: £3,200,000 GBP
AUTHORITY: Mid-Yorkshire NHS Foundation Trust

1. OVERVIEW & PROCUREMENT STRATEGY
The Trust is procuring a next-generation electronic patient record system under the Competitive Flexible Procedure authorized by Section 20 of the Procurement Act 2023.

2. BUYER STATUTORY COMPLIANCE CHECK
2.1 National Procurement Policy Statement (NPPS): Regard must be given to local health resilience, NHS Net Zero goals, and SME participation.
2.2 Mandatory Notices Required: Planned Procurement Notice published on Find a Tender / Central Digital Platform; Tender Notice; and post-award Contract Details Notice within statutory 30-day window.
2.3 Data Security & Protection Toolkit (DSPT): Suppliers must meet Standards Exceeded or Standards Met level alongside Cyber Essentials.
2.4 Payment Terms: Standard 30-day invoice payment from receipt of valid invoice must be enforced across Tier 1 and Tier 2 supply chains.`,
  },
  {
    name: 'City Council – Sustainable Waste & Facilities Management',
    authority: 'Manchester City Council',
    value: 1200000,
    sector: 'Local Authority',
    role: 'supplier_bidder',
    description: 'Local authority tender (£1.2M) focusing on local social value, modern slavery checks, and living wage.',
    sampleText: `TENDER SPECIFICATION - REF: MCC/FAC/2026/44
PROJECT: Sustainable Municipal Facilities Cleaning and Waste Decarbonization
ESTIMATED CONTRACT VALUE: £1,200,000 GBP over 3 years
BUYER: Manchester City Council

1. MANDATORY REQUIREMENTS
- Real Living Wage accreditation for all staff deployed under this contract.
- Modern Slavery Statement and completed MSAT risk assessment (PPN 02/23).
- 100% Zero-waste-to-landfill operational commitment.
- Social Value commitment of 20% weighting addressing local youth apprenticeships and clean fleet operations.`,
  },
  {
    name: 'AWE Atomic Weapons Establishment – Defense Infrastructure & Procurement Act 2023 Framework',
    authority: 'Atomic Weapons Establishment (AWE) / Ministry of Defence',
    value: 12500000,
    sector: 'Infrastructure',
    role: 'supplier_bidder',
    description: 'AWE Defense & Nuclear Supply Chain Framework (£12.5M) under the Procurement Act 2023 with mandatory Central Digital Platform registration, Schedule 1 Defense Exemptions, PPN 06/21 Carbon Reduction, and Central Debarment screening.',
    sampleText: `INVITATION TO TENDER (ITT) - REFERENCE: AWE/SUPPLY-CHAIN/PA23/2026
PROJECT TITLE: Nuclear Security, High-Integrity Research & Defense Facilities Sustainment
ESTIMATED VALUE: £12,500,000 GBP (5-Year Strategic Supply Chain Agreement)
CONTRACTING AUTHORITY: Atomic Weapons Establishment (AWE) on behalf of Ministry of Defence.

1. EXECUTIVE OVERVIEW & PROCUREMENT ACT 2023 FRAMEWORK
In accordance with the Procurement Act 2023 (effective 24 February 2025), AWE is conducting this procurement via the Central Digital Platform and Find a Tender service. This procurement supports national defense capability and nuclear site safety.

2. MANDATORY SELECTION CRITERIA (PASS / FAIL)
2.1 Central Digital Platform Registration: Bidders and primary sub-contractors must be fully registered on the government Central Digital Platform with valid supplier identifier details.
2.2 Statutory Exclusion Grounds (Section 57 & Central Debarment List): Self-declaration confirming that neither the bidder nor any supply chain partner is listed on the Cabinet Office Central Debarment List or excluded under Schedule 6.
2.3 Cyber Security & Defense Assurance (PPN 10/23): Mandatory Cyber Essentials Plus certification and List X facility clearance suitability where applicable under Schedule 1 Defense & Security exemptions.
2.4 Carbon Reduction Plan (PPN 06/21): Mandatory verified Carbon Reduction Plan covering Scope 1, 2, and defined Scope 3 categories with Net Zero commitment.
2.5 Prompt Payment & SME Supply Chain Access (PPN 02/23): Minimum 95% 60-day invoice payment record across Tier 2 supply chains and compliance with AWE SME Lotting guidelines.

3. AWARD CRITERIA
- Technical Capability & Defense Quality Assurance: 50%
- Commercial Value & Open Book Pricing: 30%
- Social Value & National Priorities (NPPS Section 13): 20% (Focusing on UK Defense Skills & Net Zero Nuclear Facilities).`,
  },
];

export function TenderComplianceScanner({
  user,
  accessToken,
  onSignInRequired,
  onDocCreated,
  onTasksCreated,
  whiteLabel,
  onNavigateToBidBuilder,
}: TenderComplianceScannerProps) {
  // Input form state
  const [tenderTitle, setTenderTitle] = useState<string>('Crown Commercial Service – Cloud & Cyber Secure Hosting Framework');
  const [contractingAuthority, setContractingAuthority] = useState<string>('Crown Commercial Service (Cabinet Office)');
  const [estimatedValueGbp, setEstimatedValueGbp] = useState<number>(8500000);
  const [contractDurationYears, setContractDurationYears] = useState<number>(4);
  const [sector, setSector] = useState<'Central Government' | 'Local Authority' | 'NHS / Healthcare' | 'Defence' | 'Education' | 'Infrastructure' | 'Utilities'>('Central Government');
  const [userRole, setUserRole] = useState<UserRole>('supplier_bidder');
  const [tenderText, setTenderText] = useState<string>(SAMPLE_TENDERS[0].sampleText);

  // Analysis execution state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [parsedNotification, setParsedNotification] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<TenderComplianceResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Workspace export state
  const [isExportingDoc, setIsExportingDoc] = useState<boolean>(false);
  const [isExportingTasks, setIsExportingTasks] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});

  // Auto-Fix AI state & handlers
  const [autoFixingRiskId, setAutoFixingRiskId] = useState<string | null>(null);
  const [autoFixSuggestions, setAutoFixSuggestions] = useState<
    Record<string, { suggestedText: string; explanation: string; statutoryBasis: string }>
  >({});
  const [fixedRiskIds, setFixedRiskIds] = useState<Record<string, boolean>>({});
  const [isAutoFixingAll, setIsAutoFixingAll] = useState<boolean>(false);

  const handleAutoFixRisk = async (risk: {
    id: string;
    title: string;
    description?: string;
    legalBasis?: string;
    mitigationRecommendation?: string;
  }) => {
    setAutoFixingRiskId(risk.id);
    try {
      const res = await fetch('/api/tender/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskTitle: risk.title,
          riskDescription: risk.description,
          legalBasis: risk.legalBasis,
          mitigationRecommendation: risk.mitigationRecommendation,
          tenderText,
        }),
      });
      if (!res.ok) throw new Error('Auto-Fix AI service unavailable');
      const data = await res.json();
      setAutoFixSuggestions((prev) => ({
        ...prev,
        [risk.id]: data,
      }));
    } catch (err: any) {
      console.error('Auto-Fix error:', err);
      setStatusToast({
        type: 'error',
        message: `Auto-Fix failed: ${err.message}`,
      });
    } finally {
      setAutoFixingRiskId(null);
    }
  };

  const handleAcceptAutoFix = (riskId: string) => {
    const suggestion = autoFixSuggestions[riskId];
    if (!suggestion) return;

    const newClause = `\n\n/* [AUTO-FIX APPLIED: Procurement Act 2023 Compliant Clause] */\n${suggestion.suggestedText}`;
    setTenderText((prev) => prev.trim() + newClause);

    setFixedRiskIds((prev) => ({ ...prev, [riskId]: true }));
    setStatusToast({
      type: 'success',
      message: 'Procurement Act 2023 compliant text correction applied to Tender Specification!',
    });
  };

  const handleDismissAutoFix = (riskId: string) => {
    setAutoFixSuggestions((prev) => {
      const copy = { ...prev };
      delete copy[riskId];
      return copy;
    });
  };

  const handleAutoFixAllGaps = async () => {
    setIsAutoFixingAll(true);
    try {
      const res = await fetch('/api/tender/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskTitle: 'Comprehensive Procurement Act 2023 & PPN Model Clauses Specification Fix',
          riskDescription: 'Missing mandatory Carbon Reduction Plan (PPN 06/21), Prompt Payment (PPN 02/23), AI Disclosure (PPN 02/24), Section 57 Debarment confirmation, and Cyber Essentials Plus (PPN 10/23)',
          legalBasis: 'Procurement Act 2023 & Cabinet Office PPN Framework',
          mitigationRecommendation: 'Append complete statutory model clauses to tender text',
          tenderText,
        }),
      });
      if (!res.ok) throw new Error('Auto-Fix All failed');
      const data = await res.json();
      const newClause = `\n\n/* [STATUTORY AUTO-FIX: Procurement Act 2023 & PPN Model Clauses] */\n${data.suggestedText}`;
      setTenderText((prev) => prev.trim() + newClause);
      setStatusToast({
        type: 'success',
        message: 'All detected statutory gaps auto-fixed and appended to Tender Specification!',
      });
    } catch (err: any) {
      setStatusToast({
        type: 'error',
        message: `Auto-Fix All failed: ${err.message}`,
      });
    } finally {
      setIsAutoFixingAll(false);
    }
  };

  useEffect(() => {
    if (statusToast) {
      const timer = setTimeout(() => setStatusToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusToast]);

  const handleSelectSample = (sample: typeof SAMPLE_TENDERS[0]) => {
    setTenderTitle(sample.name);
    setContractingAuthority(sample.authority);
    setEstimatedValueGbp(sample.value);
    setSector(sample.sector);
    setUserRole(sample.role);
    setTenderText(sample.sampleText);
    setAnalysisResult(null);
    setErrorMsg(null);
    setParsedNotification(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setErrorMsg(null);
    setParsedNotification(null);

    const fileName = file.name;
    const mimeType = file.type;

    try {
      // Read file as base64 for reliable binary transmission (PDF, DOCX, etc.)
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/tender/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64Data,
          fileName,
          mimeType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Document parsing failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.tenderTitle) setTenderTitle(data.tenderTitle);
      if (data.contractingAuthority) setContractingAuthority(data.contractingAuthority);
      if (data.sector) setSector(data.sector);
      if (typeof data.estimatedValueGbp === 'number') setEstimatedValueGbp(data.estimatedValueGbp);
      if (typeof data.contractDurationYears === 'number') setContractDurationYears(data.contractDurationYears);
      if (data.cleanedText) setTenderText(data.cleanedText);

      setParsedNotification(
        `Parsed ${data.documentTypeDetected || 'Document'} successfully: Auto-filled authority (${data.contractingAuthority}), sector (${data.sector}), value (£${(data.estimatedValueGbp / 1000000).toFixed(1)}M), and duration (${data.contractDurationYears} yrs).`
      );
    } catch (err: any) {
      console.warn('Backend parsing error, falling back to text reader:', err);
      // Fallback: simple text reader
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setTenderText(text);
          setTenderTitle(fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
          setParsedNotification(`Loaded ${fileName}. Please verify the 4 tender parameters.`);
        }
      };
      reader.readAsText(file);
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleRunScan = async () => {
    if (!tenderTitle.trim() || !tenderText.trim()) {
      setErrorMsg('Please enter both a Tender Title and Document Specification Text.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    const payload: TenderAnalysisRequest = {
      tenderTitle,
      contractingAuthority,
      estimatedValueGbp: Number(estimatedValueGbp) || undefined,
      contractDurationYears: Number(contractDurationYears) || undefined,
      sector,
      userRole,
      tenderText,
      applicableLegislationMode: 'Procurement Act 2023',
    };

    try {
      const response = await fetch('/api/tender/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result: TenderComplianceResult = await response.json();
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMsg(err.message || 'Failed to analyze tender. Please retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleExportGoogleDoc = async () => {
    if (!analysisResult) return;
    if (!accessToken) {
      onSignInRequired();
      return;
    }

    setIsExportingDoc(true);
    try {
      const title = `${whiteLabel?.referencePrefix || 'COMPLIANCE'}: ${analysisResult.tenderTitle} - Statutory Audit`;
      const content = `# UK Public Procurement Compliance Audit
**Tender:** ${analysisResult.tenderTitle}
**Estimated Value:** ${analysisResult.estimatedValueGbp ? `£${(analysisResult.estimatedValueGbp / 1000000).toFixed(2)}M GBP` : 'Above Statutory Threshold'}
**User Perspective:** ${analysisResult.userRole === 'supplier_bidder' ? 'Supplier / Bidding Enterprise' : 'Contracting Authority Buyer'}
**Compliance Readiness Score:** ${analysisResult.readinessScore}% (${analysisResult.complianceGrade})
**Audited At:** ${new Date(analysisResult.scanTimestamp).toLocaleString()}

---

## 1. Executive Statutory Summary
${analysisResult.executiveSummary}

---

## 2. Identified UK Statutory Regulations & PPNs
${analysisResult.matchedRegulations
  .map(
    (reg) =>
      `### ${reg.docReference} – ${reg.docTitle}
- **Mandatory Status:** ${reg.isMandatoryPassFail ? 'PASS/FAIL MANDATORY CRITERION' : 'Standard Evaluation Duty'}
- **Governing Scope:** ${reg.statutoryThreshold}
- **Application:** ${reg.relevanceReason}
- **Official GOV.UK Source:** ${reg.citationUrl}`
  )
  .join('\n\n')}

---

## 3. Critical Compliance Risks & Disqualification Triggers
${analysisResult.criticalRisks
  .map(
    (risk) =>
      `### [${risk.severity.toUpperCase()}] ${risk.title}
- **Legal Basis:** ${risk.legalBasis}
- **Risk Impact:** ${risk.description}
- **Actionable Mitigation:** ${risk.mitigationRecommendation}`
  )
  .join('\n\n')}

---

## 4. Mandatory Action & Evidence Checklist
${analysisResult.mandatoryChecklist
  .map(
    (item, idx) =>
      `[ ] ${idx + 1}. **${item.action}** (${item.priority})
   - *Guidance:* ${item.guidanceReference}
   - *Required Evidence:* ${item.requiredEvidence}`
  )
  .join('\n\n')}

---

## 5. Strategic Directives
- **Social Value Strategy (PPN 06/20):** Minimum Suggested Weighting ${analysisResult.socialValueStrategy.minimumSuggestedWeighting}. Priority Themes: ${analysisResult.socialValueStrategy.recommendedThemes.join(', ')}.
- **Net Zero & Carbon Reduction (PPN 06/21):** CRP Mandatory: ${analysisResult.netZeroAdvice.crpRequired ? 'YES (Scope 1, 2, and 5 Scope 3 categories required)' : 'No'}. Schedule Reference: ${analysisResult.netZeroAdvice.contractScheduleReference}.
- **Recommended Procedure:** ${analysisResult.procurementProcedureRecommendation.procedureType}. Justification: ${analysisResult.procurementProcedureRecommendation.justification}.

*Document generated by UK Public Procurement Registry & Tender Compliance Suite.*`;

      const result = await createGoogleDocCustom(accessToken, title, content);
      if (onDocCreated) {
        onDocCreated({
          docId: result.documentId,
          title: title,
          docUrl: `https://docs.google.com/document/d/${result.documentId}/edit`,
          createdAt: new Date().toISOString(),
          docRef: analysisResult.id,
        });
      }
      setStatusToast({
        type: 'success',
        message: 'Tender Compliance Audit Memo successfully created in your Google Docs!',
      });
    } catch (err: any) {
      console.error('Export doc error:', err);
      setStatusToast({
        type: 'error',
        message: `Export failed: ${err.message}`,
      });
    } finally {
      setIsExportingDoc(false);
    }
  };

  const handleExportGoogleTasks = async () => {
    if (!analysisResult) return;
    if (!accessToken) {
      onSignInRequired();
      return;
    }

    setIsExportingTasks(true);
    try {
      const taskListTitle = `Tender Audit: ${analysisResult.tenderTitle.substring(0, 30)}...`;
      const tasksToCreate = analysisResult.mandatoryChecklist.map((item) => ({
        title: `[${item.priority}] ${item.action}`,
        notes: `Guidance: ${item.guidanceReference}\nRequired Evidence: ${item.requiredEvidence}\nTender: ${analysisResult.tenderTitle}`,
        dueDaysFromNow: item.priority === 'Immediate' ? 3 : item.priority === 'Pre-Submission' ? 14 : 30,
      }));

      const created = await createGoogleTasks(accessToken, taskListTitle, tasksToCreate);
      if (onTasksCreated) {
        onTasksCreated(
          created.map((t) => ({
            taskId: t.id,
            title: t.title,
            listTitle: taskListTitle,
            createdAt: new Date().toISOString(),
            docRef: analysisResult.id,
          }))
        );
      }
      setStatusToast({
        type: 'success',
        message: `${created.length} mandatory compliance actions exported to Google Tasks!`,
      });
    } catch (err: any) {
      console.error('Export tasks error:', err);
      setStatusToast({
        type: 'error',
        message: `Tasks export failed: ${err.message}`,
      });
    } finally {
      setIsExportingTasks(false);
    }
  };

  const handleDownloadExecutivePdf = async () => {
    if (!analysisResult) return;
    setIsDownloadingPdf(true);
    try {
      const res = await fetch('/api/tender/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result: analysisResult,
          whiteLabel: whiteLabel || {
            companyName: 'UK Crown Commercial & Tender Intelligence Suite',
            accentColor: '#0284c7',
          },
        }),
      });

      if (!res.ok) throw new Error('PDF generation failed');

      const blob = await res.blob();
      await downloadBlob(blob, `Tender_Compliance_Audit_${analysisResult.id}.pdf`);
      setStatusToast({
        type: 'success',
        message: 'PDF Compliance Audit Memo generated and downloaded.',
      });
    } catch (err: any) {
      console.error('PDF download error:', err);
      setStatusToast({
        type: 'error',
        message: 'Failed to generate PDF audit memo. Please retry.',
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!analysisResult) return;
    const text = `**UK Procurement Compliance Audit: ${analysisResult.tenderTitle}**
Score: ${analysisResult.readinessScore}% (${analysisResult.complianceGrade})

Summary:
${analysisResult.executiveSummary}

Key Regulations:
${analysisResult.matchedRegulations.map((r) => `- ${r.docReference} (${r.docTitle})`).join('\n')}

Critical Risks:
${analysisResult.criticalRisks.map((k) => `- [${k.severity}] ${k.title}: ${k.mitigationRecommendation}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero Explanation */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#000000] p-6 shadow-md text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-200">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
              <span>BidSmith ASF • UK Public Procurement Statutory Compliance Standard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {whiteLabel?.companyName ? `${whiteLabel.companyName} — ` : ''}Tender & RFP Compliance Matrix Scanner
            </h1>
            <p className="text-sm text-slate-200 max-w-3xl leading-relaxed">
              Upload or paste tender documentation (ITT/RFP/Specification) to scan against the <strong>Procurement Act 2023</strong>, <strong>PPN 06/21 (Net Zero)</strong>, <strong>PPN 02/24 (Prompt Payment)</strong>, <strong>PPN 06/20 (Social Value)</strong>, and the <strong>Central Debarment List</strong>. Receive an instant readiness score, pass/fail disqualification analysis, and actionable Google Workspace compliance memos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-right backdrop-blur-xs">
              <span className="text-xs text-slate-200 block font-medium">Statutory Accuracy</span>
              <span className="text-sm font-bold text-emerald-300 flex items-center justify-end gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Grounded
              </span>
            </div>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="mt-6 border-t border-white/15 pt-4">
          <span className="text-xs font-bold text-slate-200 mb-2 block uppercase tracking-wider">
            Quick-Load Real UK Procurement Samples:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {SAMPLE_TENDERS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample)}
                className="text-left rounded-lg border border-white/20 bg-white/10 p-3 hover:border-sky-300 hover:bg-white/20 transition group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-300 min-h-[44px]"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-sky-200">
                  <span className="truncate">{sample.name}</span>
                  <span className="text-xs text-sky-200 shrink-0 ml-1 font-mono font-bold">£{(sample.value / 1000000).toFixed(1)}M</span>
                </div>
                <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">{sample.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inline Toast Notification */}
      {statusToast && (
        <div
          className={`rounded-xl p-4 flex items-center justify-between text-xs font-semibold shadow-md transition-all animate-in fade-in ${
            statusToast.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusToast.message}</span>
          </div>
          <button
            onClick={() => setStatusToast(null)}
            className="text-slate-500 hover:text-slate-800 ml-3 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Form & Scanner Input */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Document Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-700" />
              1. Tender Parameters & Context
            </h2>

            {/* Role Switcher */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Evaluation Perspective (Target Audience):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUserRole('supplier_bidder')}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    userRole === 'supplier_bidder'
                      ? 'border-blue-700 bg-blue-50 text-blue-900 shadow-2xs font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5 text-blue-700" />
                  Supplier / Bidder
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('contracting_authority')}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    userRole === 'contracting_authority'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 shadow-2xs font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5 text-emerald-700" />
                  Public Authority Buyer
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tender Title / Framework Reference:
              </label>
              <input
                type="text"
                value={tenderTitle}
                onChange={(e) => setTenderTitle(e.target.value)}
                placeholder="e.g. Crown Commercial Service Cloud Framework..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 focus:outline-none"
              />
            </div>

            {/* Authority & Sector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Contracting Authority:
                </label>
                <input
                  type="text"
                  value={contractingAuthority}
                  onChange={(e) => setContractingAuthority(e.target.value)}
                  placeholder="e.g. NHS Trust, Council..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Public Sector Domain:
                </label>
                <select
                  value={sector}
                  onChange={(e: any) => setSector(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 focus:outline-none"
                >
                  <option value="Central Government">Central Government (Crown)</option>
                  <option value="Local Authority">Local Authority / Council</option>
                  <option value="NHS / Healthcare">NHS & Healthcare</option>
                  <option value="Defence">Defence & Security</option>
                  <option value="Education">Education & Universities</option>
                  <option value="Infrastructure">Infrastructure & Transport</option>
                  <option value="Utilities">Utilities & Energy</option>
                </select>
              </div>
            </div>

            {/* Value & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Estimated Value (£ GBP):
                </label>
                <input
                  type="number"
                  value={estimatedValueGbp}
                  onChange={(e) => setEstimatedValueGbp(Number(e.target.value))}
                  placeholder="8500000"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 focus:outline-none font-mono"
                />
                {estimatedValueGbp >= 5000000 && (
                  <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <AlertTriangle className="h-3 w-3 text-amber-600" /> Exceeds £5M Threshold (PPN 06/21 & PPN 02/23 Active)
                  </span>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Duration (Years):
                </label>
                <input
                  type="number"
                  value={contractDurationYears}
                  onChange={(e) => setContractDurationYears(Number(e.target.value))}
                  placeholder="4"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* File Upload or Direct Paste */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Tender Specification / RFP Text:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoFixAllGaps}
                    disabled={isAutoFixingAll}
                    className="text-[11px] font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 transition shadow-2xs cursor-pointer disabled:opacity-50"
                    title="AI auto-fixes missing Procurement Act 2023 & PPN statutory clauses"
                  >
                    {isAutoFixingAll ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-700 border-t-transparent" />
                        <span>Auto-Fixing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-indigo-700 animate-pulse" />
                        <span>Auto-Fix Field Gaps (AI)</span>
                      </>
                    )}
                  </button>
                  <label className={`cursor-pointer text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                    isParsingFile 
                      ? 'bg-blue-50 text-blue-700 pointer-events-none' 
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {isParsingFile ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
                        <span>Parsing Document...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3 text-blue-700" />
                        <span>Upload Tender (PDF, DOCX, TXT)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.md,.rtf,.json"
                      onChange={handleFileUpload}
                      disabled={isParsingFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {parsedNotification && (
                <div className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] text-emerald-800 flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block">Parameters Auto-Extracted</span>
                    <span className="text-emerald-700">{parsedNotification}</span>
                  </div>
                </div>
              )}

              <textarea
                value={tenderText}
                onChange={(e) => setTenderText(e.target.value)}
                rows={9}
                placeholder="Paste the requirements, Selection Questionnaire (SQ) questions, or award criteria here..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50/50 p-3 text-xs text-slate-800 font-mono focus:bg-white focus:border-blue-700 focus:ring-1 focus:ring-blue-700 focus:outline-none resize-y leading-relaxed"
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleRunScan}
              disabled={isAnalyzing}
              className="w-full rounded-xl bg-blue-800 hover:bg-blue-900 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Scanning against UK Legislation Database...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Run Statutory Compliance Scan</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Scan Results Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {!analysisResult && !isAnalyzing && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-2xs">
              <div className="h-16 w-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-4 shadow-2xs">
                <Scale className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Awaiting Tender Specification</h3>
              <p className="text-xs text-slate-600 max-w-md mt-1 leading-relaxed font-medium">
                Click <strong>Run Statutory Compliance Scan</strong> or pick one of the sample UK Government tenders to analyze obligations under the Procurement Act 2023 and PPN frameworks.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> PPN 06/21 Net Zero
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> PPN 02/24 AI Transparency
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> PPN 02/23 Prompt Payment
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Section 57 Debarment Check
                </span>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="rounded-2xl border border-blue-200 bg-white p-12 text-center flex flex-col items-center justify-center min-h-[460px] space-y-4 shadow-2xs">
              <div className="h-14 w-14 rounded-full border-4 border-blue-700 border-t-transparent animate-spin mb-2" />
              <h3 className="text-base font-bold text-slate-900">Cross-Referencing UK Procurement Statutes</h3>
              <p className="text-xs text-slate-600 max-w-md">
                Checking value thresholds, mandatory pass/fail criteria, Central Debarment criteria, Social Value 10% weighting, and Cyber Essentials model schedules...
              </p>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Score & Executive Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                      Statutory Compliance Result • Scan Ref: {analysisResult.id}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                      {analysisResult.tenderTitle}
                    </h2>
                  </div>

                  {/* Score Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium">Readiness Score</div>
                      <div className="text-xs font-bold text-slate-800">
                        {analysisResult.complianceGrade}
                      </div>
                    </div>
                    <div
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-md ${
                        analysisResult.readinessScore >= 80
                          ? 'bg-emerald-600'
                          : analysisResult.readinessScore >= 60
                          ? 'bg-amber-600'
                          : 'bg-rose-600'
                      }`}
                    >
                      {analysisResult.readinessScore}%
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-blue-700" />
                    Executive Statutory Assessment
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {analysisResult.executiveSummary}
                  </p>
                </div>

                {/* Quick Export Actions Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={handleExportGoogleDoc}
                    disabled={isExportingDoc}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
                  >
                    <FileCheck className="h-3.5 w-3.5 text-blue-700" />
                    <span>{isExportingDoc ? 'Exporting...' : 'Export to Google Docs'}</span>
                  </button>

                  <button
                    onClick={handleExportGoogleTasks}
                    disabled={isExportingTasks}
                    className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition shadow-2xs"
                  >
                    <ListTodo className="h-3.5 w-3.5 text-amber-700" />
                    <span>{isExportingTasks ? 'Scheduling...' : 'Add Actions to Google Tasks'}</span>
                  </button>

                  <button
                    onClick={handleDownloadExecutivePdf}
                    disabled={isDownloadingPdf}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-700" />
                    <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Executive PDF'}</span>
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-600" />
                    <span>{copiedNotification ? 'Copied!' : 'Copy Summary'}</span>
                  </button>
                </div>
              </div>

              {/* Next Step Banner: Direct Transition to Bid Proposal Builder */}
              {onNavigateToBidBuilder && (
                <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white shadow-md border border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Next Phase
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        Ready to Draft the Full Bid Submission?
                      </h4>
                    </div>
                    <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
                      Transform this audit directly into a 6-part formal Bid Proposal Package with explicit gap placeholders (`[GAP: ...]`), PPN 06/20 social value model clauses, and MAT win-probability scoring optimization.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateToBidBuilder(
                        analysisResult.tenderTitle,
                        tenderText,
                        analysisResult.contractingAuthority
                      )
                    }
                    className="shrink-0 px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 active:scale-95 min-h-[44px] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <FileCheck className="h-4 w-4 text-slate-950" />
                    <span>Generate Bid Proposal Now</span>
                    <ArrowRight className="h-4 w-4 text-slate-950" />
                  </button>
                </div>
              )}

              {/* Critical Risks Section */}
              {analysisResult.criticalRisks.length > 0 && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 space-y-3">
                  <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-700" />
                    Critical Disqualification Risks & Red Flags
                  </h3>

                  <div className="space-y-2.5">
                    {analysisResult.criticalRisks.map((risk) => {
                      const isFixed = !!fixedRiskIds[risk.id];
                      const suggestion = autoFixSuggestions[risk.id];
                      const isFixingThis = autoFixingRiskId === risk.id;

                      return (
                        <div
                          key={risk.id}
                          className={`rounded-xl border p-4 space-y-3 transition shadow-2xs ${
                            isFixed
                              ? 'border-emerald-300 bg-emerald-50/40'
                              : 'border-rose-200 bg-white'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                            <span className="font-bold text-rose-950 flex items-center gap-2">
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-mono font-bold ${
                                  isFixed
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                                }`}
                              >
                                {isFixed ? 'RESOLVED' : risk.severity}
                              </span>
                              <span className={isFixed ? 'line-through text-slate-600 font-semibold' : ''}>
                                {risk.title}
                              </span>
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                              Basis: {risk.legalBasis}
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 leading-relaxed">{risk.description}</p>

                          <div className="text-xs text-emerald-950 bg-emerald-50 border border-emerald-300 rounded-lg p-3 font-medium leading-relaxed">
                            <strong className="font-bold text-emerald-950">Mitigation:</strong> {risk.mitigationRecommendation}
                          </div>

                          {/* Auto-Fix Section */}
                          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                            {isFixed ? (
                              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 rounded-lg px-3 py-2">
                                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                                <span>Procurement Act 2023 Compliant Replacement Clause Applied!</span>
                              </div>
                            ) : suggestion ? (
                              <div className="rounded-xl border-2 border-indigo-500 bg-indigo-50/70 p-3.5 space-y-2.5 animate-in fade-in">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />
                                    <span>AI Suggested Procurement Act 2023 Compliant Text Replacement</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
                                    {suggestion.statutoryBasis}
                                  </span>
                                </div>

                                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                                  {suggestion.explanation}
                                </p>

                                <div className="rounded-lg border border-indigo-200 bg-white p-3 text-xs text-slate-900 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto shadow-2xs">
                                  {suggestion.suggestedText}
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptAutoFix(risk.id)}
                                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>Accept & Apply Correction (1-Click)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDismissAutoFix(risk.id)}
                                    className="py-2 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition cursor-pointer"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <span className="text-[11px] text-slate-600 font-medium">
                                  Need a compliant Procurement Act 2023 text replacement clause?
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAutoFixRisk(risk)}
                                  disabled={isFixingThis}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition disabled:opacity-50 cursor-pointer"
                                >
                                  {isFixingThis ? (
                                    <>
                                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      <span>Generating AI Fix...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                                      <span>Auto-Fix with AI</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Governing Legislation & PPN Matrix */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-700" />
                  Governing Statutory Regulations & PPNs Detected
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.matchedRegulations.map((reg, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col justify-between space-y-2 hover:bg-slate-100/70 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-blue-800">{reg.docReference}</span>
                          {reg.isMandatoryPassFail ? (
                            <span className="rounded bg-rose-100 border border-rose-300 px-2 py-0.5 text-xs font-mono font-bold text-rose-950">
                              PASS / FAIL
                            </span>
                          ) : (
                            <span className="rounded bg-slate-200 border border-slate-300 px-2 py-0.5 text-xs text-slate-900 font-bold">
                              Award Duty
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-950 line-clamp-1">
                          {reg.docTitle}
                        </h4>
                        <p className="text-xs text-slate-800 mt-1 line-clamp-2 leading-relaxed font-medium">
                          {reg.relevanceReason}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-700 font-semibold truncate max-w-[170px]">
                          {reg.governingClause}
                        </span>
                        <a
                          href={reg.citationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-800 hover:text-blue-950 flex items-center gap-1 font-bold underline underline-offset-2"
                        >
                          GOV.UK <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Checklist */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-emerald-700" />
                    Mandatory Action & Evidence Checklist
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {Object.values(completedTaskIds).filter(Boolean).length} /{' '}
                    {analysisResult.mandatoryChecklist.length} completed
                  </span>
                </div>

                <div className="space-y-2">
                  {analysisResult.mandatoryChecklist.map((item) => {
                    const isDone = !!completedTaskIds[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleTaskCompletion(item.id)}
                        className={`rounded-xl border p-3.5 cursor-pointer transition flex items-start gap-3 ${
                          isDone
                            ? 'border-emerald-200 bg-emerald-50/70 text-slate-500'
                            : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="mt-0.5 text-blue-700 shrink-0">
                          {isDone ? (
                            <CheckSquare className="h-4 w-4 text-emerald-700" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                            <div className="flex items-center gap-2">
                              <span className={isDone ? 'line-through text-slate-500' : 'text-slate-900 font-bold'}>{item.action}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                  item.priority === 'Immediate'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : item.priority === 'Pre-Submission'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {item.priority}
                              </span>
                            </div>

                            {!isDone && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAutoFixRisk({
                                    id: item.id,
                                    title: item.action,
                                    description: `Mandatory evidence required: ${item.requiredEvidence}`,
                                    legalBasis: item.guidanceReference,
                                    mitigationRecommendation: `Draft Procurement Act 2023 compliant text for ${item.action}`,
                                  });
                                }}
                                disabled={autoFixingRiskId === item.id}
                                className="text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition shrink-0 cursor-pointer"
                              >
                                {autoFixingRiskId === item.id ? (
                                  <>
                                    <div className="h-2.5 w-2.5 animate-spin rounded-full border border-indigo-700 border-t-transparent" />
                                    <span>Fixing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3 text-indigo-600" />
                                    <span>Auto-Fix Clause</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            <strong className="text-slate-700">Guidance:</strong> {item.guidanceReference} •{' '}
                            <strong className="text-slate-700">Evidence Required:</strong> {item.requiredEvidence}
                          </div>

                          {/* Auto-Fix Suggestion for Checklist Item */}
                          {autoFixSuggestions[item.id] && !isDone && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="mt-2 rounded-lg border-2 border-indigo-400 bg-indigo-50 p-2.5 space-y-2 text-xs"
                            >
                              <div className="font-bold text-indigo-950 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                  Suggested Compliant Evidence Text
                                </span>
                                <span className="text-[9px] font-mono font-bold bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded">
                                  {autoFixSuggestions[item.id].statutoryBasis}
                                </span>
                              </div>
                              <div className="p-2 bg-white rounded border border-indigo-200 text-[11px] font-mono whitespace-pre-wrap text-slate-900 leading-relaxed max-h-36 overflow-y-auto">
                                {autoFixSuggestions[item.id].suggestedText}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptAutoFix(item.id);
                                    toggleTaskCompletion(item.id);
                                  }}
                                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept & Mark Done (1-Click)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDismissAutoFix(item.id);
                                  }}
                                  className="py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-[11px] rounded transition cursor-pointer"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strategic Insights Grid: Social Value + Net Zero */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Social Value Advice */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-2xs">
                  <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-700" />
                    Social Value Strategy (PPN 06/20)
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {analysisResult.socialValueStrategy.modelClausesAdvice}
                  </p>
                  <div className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100 font-medium">
                    <div>
                      <strong className="text-slate-800">Suggested Weighting:</strong>{' '}
                      {analysisResult.socialValueStrategy.minimumSuggestedWeighting}
                    </div>
                    <div>
                      <strong className="text-slate-800">Themes:</strong>{' '}
                      {analysisResult.socialValueStrategy.recommendedThemes.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Net Zero Advice */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-2xs">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                    Carbon Reduction & Net Zero (PPN 06/21)
                  </h4>
                  <div className="text-xs text-slate-700">
                    {analysisResult.netZeroAdvice.crpRequired ? (
                      <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                        Mandatory Carbon Reduction Plan (CRP) Required
                      </span>
                    ) : (
                      <span>CRP not statutory mandatory under £5M threshold</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100 font-medium">
                    <div>
                      <strong className="text-slate-800">Scope Coverage:</strong>{' '}
                      {analysisResult.netZeroAdvice.requiredScopes.join(', ')}
                    </div>
                    <div>
                      <strong className="text-slate-800">Schedule:</strong>{' '}
                      {analysisResult.netZeroAdvice.contractScheduleReference}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
