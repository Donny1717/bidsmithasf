import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Scale, 
  RefreshCw, 
  FileText, 
  CheckSquare, 
  ShieldCheck, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle,
  Building,
  Users,
  Calendar,
  Layers,
  ArrowUpRight,
  FileCheck,
  Loader2,
  Maximize2,
  Eye
} from 'lucide-react';
import { ProcurementDoc, AiDocumentAnalysis, GoogleDocExportResult, GoogleTaskExportResult } from '../types';
import { createGoogleDocBriefing, createGoogleTasksChecklist } from '../lib/workspaceApi';
import { downloadPolicyPdf } from '../lib/downloadHelper';
import { User } from 'firebase/auth';

interface DocumentDetailDrawerProps {
  doc: ProcurementDoc | null;
  onClose: () => void;
  user: User | null;
  accessToken: string | null;
  onSignInRequired: () => void;
  onDocCreated: (result: GoogleDocExportResult) => void;
  onTasksCreated: (results: GoogleTaskExportResult[]) => void;
}

export const DocumentDetailDrawer: React.FC<DocumentDetailDrawerProps> = ({
  doc,
  onClose,
  user,
  accessToken,
  onSignInRequired,
  onDocCreated,
  onTasksCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai_analysis' | 'google_docs' | 'google_tasks' | 'raw_pdf'>('overview');
  const [analysis, setAnalysis] = useState<AiDocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copiedSha, setCopiedSha] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // PDF Viewer Modal & iframe State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [iframeError, setIframeError] = useState<boolean>(false);

  // Google Docs Export state
  const [isExportingDoc, setIsExportingDoc] = useState<boolean>(false);
  const [exportedDocResult, setExportedDocResult] = useState<GoogleDocExportResult | null>(null);
  const [docExportError, setDocExportError] = useState<string | null>(null);

  // Google Tasks state
  const [taskItems, setTaskItems] = useState<Array<{ title: string; dueDays: number; selected: boolean }>>([]);
  const [isSchedulingTasks, setIsSchedulingTasks] = useState<boolean>(false);
  const [scheduledTasksCount, setScheduledTasksCount] = useState<number | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  const handleDownloadDoc = async () => {
    if (!doc) return;
    setIsDownloadingPdf(true);
    try {
      await downloadPolicyPdf(doc);
    } catch (err) {
      console.error('Failed to download policy PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  useEffect(() => {
    if (!doc) return;
    setAnalysis(null);
    setExportedDocResult(null);
    setDocExportError(null);
    setScheduledTasksCount(null);
    setTaskError(null);
    setIsPdfModalOpen(false);
    setIframeLoading(true);
    setIframeError(false);

    // Populate default task items
    const defaultTasks = [
      { title: `Incorporate ${doc.reference} into Standard Selection Questionnaire (SQ)`, dueDays: 14, selected: true },
      { title: `Review contract register against ${doc.reference} threshold requirements`, dueDays: 30, selected: true },
      { title: `Brief commercial evaluation panel on ${doc.reference} scoring rules`, dueDays: 45, selected: true },
      { title: `Audit supplier compliance records for ${doc.reference}`, dueDays: 60, selected: false },
    ];
    setTaskItems(defaultTasks);
  }, [doc]);

  if (!doc) return null;

  // Derives inline PDF viewing URL (avoids forcing download header inside iframe)
  const pdfInlineUrl = doc.pdfUrl.includes('/download') 
    ? doc.pdfUrl.replace('/download', '/pdf') 
    : doc.pdfUrl.startsWith('/') 
      ? doc.pdfUrl 
      : `/api/documents/${doc.id}/pdf`;

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc }),
      });
      if (!res.ok) throw new Error('AI Analysis failed');
      const data = await res.json();
      setAnalysis(data.analysis);
      setActiveTab('ai_analysis');

      // Update task items from AI recommendations if present
      if (data.analysis?.contractingAuthorityActions?.length) {
        const aiTasks = data.analysis.contractingAuthorityActions.map((a: any, i: number) => ({
          title: a.action,
          dueDays: (i + 1) * 15,
          selected: true,
        }));
        setTaskItems(aiTasks);
      }
    } catch (err: any) {
      console.error('Failed to run AI analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopySha = () => {
    navigator.clipboard.writeText(doc.sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleExportGoogleDoc = async () => {
    if (!accessToken) {
      onSignInRequired();
      return;
    }
    setIsExportingDoc(true);
    setDocExportError(null);
    try {
      const result = await createGoogleDocBriefing(accessToken, doc, analysis);
      setExportedDocResult(result);
      onDocCreated(result);
    } catch (err: any) {
      setDocExportError(err.message || 'Failed to export to Google Docs');
    } finally {
      setIsExportingDoc(false);
    }
  };

  const handleScheduleGoogleTasks = async () => {
    if (!accessToken) {
      onSignInRequired();
      return;
    }
    const selected = taskItems.filter((t) => t.selected);
    if (selected.length === 0) {
      setTaskError('Please select at least one task to schedule.');
      return;
    }

    setIsSchedulingTasks(true);
    setTaskError(null);
    try {
      const results = await createGoogleTasksChecklist(
        accessToken,
        doc,
        selected.map((s) => ({ title: s.title, dueDays: s.dueDays }))
      );
      setScheduledTasksCount(results.length);
      onTasksCreated(results);
    } catch (err: any) {
      setTaskError(err.message || 'Failed to schedule Google Tasks');
    } finally {
      setIsSchedulingTasks(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity">
        <div className="w-full max-w-3xl bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col text-slate-900 animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-xs text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {doc.reference}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {doc.documentType}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {doc.applicableLegislation}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                {doc.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn-header-pdf-modal"
                onClick={() => {
                  setIframeLoading(true);
                  setIframeError(false);
                  setIsPdfModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Open Integrated PDF Viewer Modal"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF Viewer Modal</span>
              </button>

              <button
                id="btn-close-drawer"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 px-4 bg-white">
            <nav className="flex space-x-2 text-xs font-semibold overflow-x-auto py-2.5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'overview' ? 'bg-blue-800 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Overview & Governance
              </button>
              <button
                onClick={() => {
                  if (!analysis) handleRunAiAnalysis();
                  setActiveTab('ai_analysis');
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'ai_analysis' ? 'bg-blue-800 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                Legal Assessment
              </button>
              <button
                onClick={() => setActiveTab('google_docs')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'google_docs' ? 'bg-blue-800 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Google Docs Briefing
              </button>
              <button
                onClick={() => setActiveTab('google_tasks')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'google_tasks' ? 'bg-blue-800 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Google Tasks Action List
              </button>
              <button
                onClick={() => setActiveTab('raw_pdf')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'raw_pdf' ? 'bg-blue-800 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                PDF Viewer Tab
              </button>
            </nav>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
            
            {/* TAB 1: OVERVIEW & GOVERNANCE */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Executive Summary Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Official Policy Summary
                  </h3>
                  <p className="text-slate-800 text-xs leading-relaxed">
                    {doc.summary}
                  </p>
                </div>

                {/* Key Statutory Obligations */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Mandatory Obligations & Procedural Rules
                  </h3>
                  <ul className="space-y-2">
                    {doc.keyObligations.map((ob, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-800">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{ob}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact Matrix: Buyers vs Suppliers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-blue-800 font-bold mb-1.5">
                      <Building className="w-4 h-4" />
                      <span>Contracting Authority Impact</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      {doc.contractingAuthorityImpact}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-indigo-800 font-bold mb-1.5">
                      <Users className="w-4 h-4" />
                      <span>Supplier & Bidder Impact</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      {doc.supplierImpact}
                    </p>
                  </div>
                </div>

                {/* Technical Metadata Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
                    Technical Specifications & Integrity
                  </div>
                  <div className="divide-y divide-slate-100 text-[11px]">
                    <div className="px-4 py-2 flex justify-between">
                      <span className="text-slate-500 font-medium">Publication Date</span>
                      <span className="font-mono text-slate-800 font-semibold">{doc.publicationDate}</span>
                    </div>
                    <div className="px-4 py-2 flex justify-between">
                      <span className="text-slate-500 font-medium">Threshold Relevance</span>
                      <span className="text-slate-800 font-semibold">{doc.thresholdRelevance}</span>
                    </div>
                    <div className="px-4 py-2 flex justify-between">
                      <span className="text-slate-500 font-medium">Local Download Path</span>
                      <span className="font-mono text-slate-700">{doc.localPath}</span>
                    </div>
                    <div className="px-4 py-2 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">SHA-256 Checksum</span>
                      <div className="flex items-center gap-1.5 font-mono text-slate-700">
                        <span>{doc.sha256.slice(0, 16)}...</span>
                        <button
                          onClick={handleCopySha}
                          className="p-1 hover:text-slate-900 transition-colors"
                          title="Copy full SHA-256"
                        >
                          {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-2 flex justify-between">
                      <span className="text-slate-500 font-medium">File Size</span>
                      <span className="font-mono text-slate-800">{doc.fileSizeKb} KB ({doc.fileSizeBytes.toLocaleString()} bytes)</span>
                    </div>
                  </div>
                </div>

                {/* External Links & Download bar */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    id="btn-overview-open-pdf-modal"
                    onClick={() => {
                      setIframeLoading(true);
                      setIframeError(false);
                      setIsPdfModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs transition-colors shadow-2xs"
                  >
                    <Eye className="w-4 h-4" />
                    Open Integrated PDF Viewer
                  </button>
                  <button
                    id="btn-drawer-download-pdf"
                    onClick={handleDownloadDoc}
                    disabled={isDownloadingPdf}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors disabled:opacity-60"
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                    ) : (
                      <Download className="w-4 h-4 text-slate-700" />
                    )}
                    {isDownloadingPdf ? 'Downloading PDF...' : `Download Official PDF (${doc.fileSizeKb} KB)`}
                  </button>
                  <a
                    href={doc.govukUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on GOV.UK
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: AI LEGAL ANALYSIS */}
            {activeTab === 'ai_analysis' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-700" />
                    Legal & Statutory Assessment
                  </h3>
                  <button
                    id="btn-re-analyze"
                    onClick={handleRunAiAnalysis}
                    disabled={isAnalyzing}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Re-run Analysis'}
                  </button>
                </div>

                {isAnalyzing ? (
                  <div className="p-12 text-center text-slate-500 space-y-3">
                    <RefreshCw className="w-8 h-8 mx-auto text-blue-700 animate-spin" />
                    <p className="text-xs font-medium">Analyzing policy obligations, contractual clauses, and legal risk profiles...</p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-4">
                    {/* Risk Badge */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 shrink-0 ${analysis.riskRating === 'High' ? 'text-rose-600' : 'text-amber-600'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">Procurement Legal Risk:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            analysis.riskRating === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {analysis.riskRating}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs mt-1 leading-relaxed">
                          {analysis.riskJustification}
                        </p>
                      </div>
                    </div>

                    {/* Executive Brief */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">Commercial Executive Brief</h4>
                      <p className="text-slate-800 text-xs leading-relaxed">{analysis.executiveSummary}</p>
                    </div>

                    {/* Contracting Authority Action Plan */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-800 text-xs uppercase mb-3">Recommended Authority Action Plan</h4>
                      <div className="space-y-2">
                        {analysis.contractingAuthorityActions.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                            <span className="text-slate-800 font-medium">{item.action}</span>
                            <span className="text-[10px] font-mono text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0 font-bold">
                              {item.timeline}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Supplier Checklist */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-800 text-xs uppercase mb-3">Supplier Bidding Checklist</h4>
                      <ul className="space-y-1.5">
                        {analysis.supplierComplianceChecklist.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-800">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-600 mb-3 font-medium">Generate an instant, comprehensive compliance briefing for this document.</p>
                    <button
                      onClick={handleRunAiAnalysis}
                      className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-2xs"
                    >
                      Generate AI Legal Assessment
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GOOGLE DOCS BRIEFING EXPORT */}
            {activeTab === 'google_docs' && (
              <div className="space-y-5">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <FileText className="w-5 h-5 text-blue-700" />
                    <span>Google Docs Executive Briefing Export</span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    Export a fully formatted, ready-to-share Executive Policy Briefing document directly to your connected Google Drive and Google Docs account.
                  </p>
                  <div className="p-3 bg-white rounded-lg text-slate-600 text-[11px] space-y-1 border border-slate-200">
                    <div>• Document Title: <strong className="text-slate-900">UK Procurement Briefing - {doc.reference}: {doc.title}</strong></div>
                    <div>• Structure: Executive Summary, Mandatory Obligations, Contracting Authority Action Plan, Supplier Checklist.</div>
                    <div>• Linked to official GOV.UK verification URLs and SHA-256 integrity checksums.</div>
                  </div>

                  {docExportError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold">
                      {docExportError}
                    </div>
                  )}

                  {exportedDocResult ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        Google Doc Created Successfully!
                      </div>
                      <p className="text-slate-700 text-xs">
                        Document created: <strong>{exportedDocResult.title}</strong>
                      </p>
                      <a
                        href={exportedDocResult.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-colors"
                      >
                        <span>Open Document in Google Docs</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <button
                      id="btn-create-google-doc"
                      onClick={handleExportGoogleDoc}
                      disabled={isExportingDoc}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs ${
                        isExportingDoc
                          ? 'bg-blue-300 text-white cursor-not-allowed'
                          : 'bg-blue-800 hover:bg-blue-900 text-white'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      {isExportingDoc ? 'Creating Google Doc in your Drive...' : 'Export Briefing to Google Docs'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: GOOGLE TASKS COMPLIANCE SCHEDULER */}
            {activeTab === 'google_tasks' && (
              <div className="space-y-5">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <CheckSquare className="w-5 h-5 text-emerald-700" />
                    <span>Google Tasks Compliance Checklist</span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    Select key statutory compliance actions and automatically schedule them with due dates in your Google Tasks "UK Procurement Compliance Actions" list.
                  </p>

                  {taskError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold">
                      {taskError}
                    </div>
                  )}

                  {scheduledTasksCount !== null ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <Check className="w-4 h-4 text-emerald-600" />
                        {scheduledTasksCount} Compliance Tasks Scheduled in Google Tasks!
                      </div>
                      <p className="text-slate-700 text-xs font-medium">
                        Check your Google Tasks sidebar or app to manage deadlines and assignees.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {taskItems.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const next = [...taskItems];
                            next[idx].selected = !next[idx].selected;
                            setTaskItems(next);
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            item.selected ? 'bg-blue-50/70 border-blue-300' : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => {}} // Handled by parent div
                            className="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-0"
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-bold text-slate-900">{item.title}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Target Due Date: in {item.dueDays} days
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        id="btn-schedule-tasks"
                        onClick={handleScheduleGoogleTasks}
                        disabled={isSchedulingTasks}
                        className={`w-full mt-3 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs ${
                          isSchedulingTasks
                            ? 'bg-emerald-300 text-white cursor-not-allowed'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        <CheckSquare className="w-4 h-4" />
                        {isSchedulingTasks ? 'Scheduling in Google Tasks...' : `Push Selected Tasks to Google Tasks`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: INTEGRATED IFRAME PDF VIEWER TAB */}
            {activeTab === 'raw_pdf' && (
              <div className="space-y-3 h-full flex flex-col">
                {/* Tab PDF Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="text-xs text-slate-800 font-mono font-bold truncate max-w-xs sm:max-w-sm">
                      {doc.reference}: {doc.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id="btn-open-pdf-modal-tab"
                      onClick={() => {
                        setIframeLoading(true);
                        setIframeError(false);
                        setIsPdfModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="Expand into Integrated PDF Viewer Modal"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Expand Viewer Modal</span>
                    </button>
                    <button
                      onClick={handleDownloadDoc}
                      disabled={isDownloadingPdf}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-60"
                    >
                      {isDownloadingPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-slate-700" />
                      )}
                      <span>Download</span>
                    </button>
                    <a
                      href={doc.govukUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                      title="View Source on GOV.UK"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Integrated iframe Document Viewer Box */}
                <div className="relative flex-1 min-h-[520px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-inner">
                  <iframe
                    id="tab-pdf-iframe"
                    src={pdfInlineUrl}
                    className="w-full h-full border-0 bg-white min-h-[520px]"
                    title={`Source Document PDF - ${doc.reference}: ${doc.title}`}
                  />
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* INTEGRATED PDF VIEWER MODAL OVERLAY */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            
            {/* Modal Header Bar */}
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-5 h-5 text-sky-400 shrink-0" />
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded">
                      {doc.reference}
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">
                      ({doc.fileSizeKb} KB)
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5">
                    {doc.title}
                  </h3>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id="btn-pdf-modal-reload"
                  onClick={() => {
                    setIframeLoading(true);
                    setIframeError(false);
                    const iframe = document.getElementById('integrated-pdf-iframe') as HTMLIFrameElement;
                    if (iframe) iframe.src = pdfInlineUrl;
                  }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Reload PDF Viewer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <a
                  id="btn-pdf-modal-new-tab"
                  href={pdfInlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Open PDF in New Window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  id="btn-pdf-modal-download"
                  onClick={handleDownloadDoc}
                  disabled={isDownloadingPdf}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">Download PDF</span>
                </button>

                <button
                  id="btn-pdf-modal-close"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                  title="Close PDF Viewer Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Iframe Body */}
            <div className="relative flex-1 bg-slate-100 overflow-hidden">
              {iframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-xs space-y-3">
                  <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
                  <p className="text-xs font-semibold text-slate-700">Loading integrated PDF document previewer...</p>
                </div>
              )}

              {iframeError ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white p-6 text-center space-y-3">
                  <AlertTriangle className="w-12 h-12 text-amber-500" />
                  <h4 className="font-bold text-slate-900 text-sm">Unable to render PDF inline</h4>
                  <p className="text-xs text-slate-600 max-w-md">
                    Your browser environment may be restricting iframe PDF previews. You can download the PDF file directly or view the source on GOV.UK.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleDownloadDoc}
                      className="px-4 py-2 bg-blue-800 text-white font-bold text-xs rounded-xl shadow-2xs"
                    >
                      Download PDF File
                    </button>
                    <a
                      href={doc.govukUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200"
                    >
                      View on GOV.UK
                    </a>
                  </div>
                </div>
              ) : (
                <iframe
                  id="integrated-pdf-iframe"
                  src={pdfInlineUrl}
                  className="w-full h-full border-0 rounded-b-2xl bg-white"
                  title={`Source PDF Viewer - ${doc.reference}: ${doc.title}`}
                  onLoad={() => setIframeLoading(false)}
                  onError={() => {
                    setIframeLoading(false);
                    setIframeError(true);
                  }}
                />
              )}
            </div>

            {/* Modal Footer Status Bar */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between shrink-0 font-medium">
              <div className="flex items-center gap-2 truncate">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Crown Copyright Registry Document
                </span>
                <span className="hidden md:inline">•</span>
                <span className="font-mono text-slate-500 truncate hidden md:inline">SHA-256: {doc.sha256}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={doc.govukUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:underline font-semibold flex items-center gap-1"
                >
                  GOV.UK Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

