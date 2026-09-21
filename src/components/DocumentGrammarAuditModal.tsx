import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  AlertTriangle,
  X,
  RefreshCw,
  FileText,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export interface SectionAuditData {
  sectionId: string;
  sectionTitle: string;
  originalContent: string;
  grammarScore: number;
  issuesFound: string[];
  polishedContent: string;
  hasCorrections: boolean;
}

export interface FullDocumentAuditResultData {
  overallQualityScore: number;
  totalGrammarIssuesCount: number;
  totalUnresolvedGapsCount: number;
  summaryVerdict: string;
  sectionAudits: SectionAuditData[];
}

interface DocumentGrammarAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditResult: FullDocumentAuditResultData | null;
  isLoading: boolean;
  onReRunAudit: () => void;
  onApplyAll: () => void;
  onApplySingleSection: (sectionId: string, polishedText: string) => void;
}

export const DocumentGrammarAuditModal: React.FC<DocumentGrammarAuditModalProps> = ({
  isOpen,
  onClose,
  auditResult,
  isLoading,
  onReRunAudit,
  onApplyAll,
  onApplySingleSection,
}) => {
  const [activeTabSectionId, setActiveTabSectionId] = useState<string | null>(null);
  const [appliedSections, setAppliedSections] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const currentSection = auditResult?.sectionAudits.find(
    (s) => s.sectionId === (activeTabSectionId || auditResult.sectionAudits[0]?.sectionId)
  ) || auditResult?.sectionAudits[0];

  const handleApplySingle = (sectionId: string, text: string) => {
    onApplySingleSection(sectionId, text);
    setAppliedSections((prev) => ({ ...prev, [sectionId]: true }));
  };

  const handleApplyAllWithState = () => {
    onApplyAll();
    if (auditResult) {
      const allApplied: Record<string, boolean> = {};
      auditResult.sectionAudits.forEach((s) => {
        allApplied[s.sectionId] = true;
      });
      setAppliedSections(allApplied);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">Full Document Quality & Grammar Audit</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  UK Procurement Standards
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Comprehensive linguistic, syntactic, and statutory compliance inspection across all document sections.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="p-12 text-center space-y-4 my-auto">
            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Auditing Document Quality & Grammar...</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Evaluating all paragraphs against UK Procurement Act 2023 regulations, Crown Commercial Service vocabulary, active-voice bidding syntax, and spelling accuracy.
            </p>
          </div>
        ) : !auditResult ? (
          <div className="p-12 text-center space-y-4 my-auto">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Audit Results Available</h3>
            <button
              onClick={onReRunAudit}
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Start Full Document Audit
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Summary Bar */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    OVERALL QUALITY SCORE
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xl font-black font-mono px-2.5 py-0.5 rounded-lg border ${
                      auditResult.overallQualityScore >= 85
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : auditResult.overallQualityScore >= 65
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}>
                      {auditResult.overallQualityScore} / 100
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      {auditResult.overallQualityScore >= 85 ? 'UK Gold Standard' : 'Requires Revision'}
                    </span>
                  </div>
                </div>

                <div className="border-l border-slate-200 pl-4 space-y-0.5">
                  <div className="text-xs text-slate-700 flex items-center gap-2">
                    <span className="font-bold text-slate-900">{auditResult.totalGrammarIssuesCount}</span>
                    <span>Linguistic / Grammar Improvements</span>
                  </div>
                  <div className="text-xs text-slate-700 flex items-center gap-2">
                    <span className="font-bold text-slate-900">{auditResult.totalUnresolvedGapsCount}</span>
                    <span>Unresolved Evidence Placeholders</span>
                  </div>
                </div>
              </div>

              {/* Master 1-Click Apply */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onReRunAudit}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition flex items-center gap-1.5 shadow-2xs"
                  title="Re-evaluate document with AI auditor"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Re-audit</span>
                </button>

                <button
                  onClick={handleApplyAllWithState}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition flex items-center gap-1.5 border border-emerald-500 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept & Apply All AI Polished Text (1-Click)</span>
                </button>
              </div>
            </div>

            {/* Verdict Note */}
            <div className="px-6 py-2.5 bg-indigo-50/70 border-b border-indigo-100 text-xs text-indigo-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span><strong>Audit Verdict:</strong> {auditResult.summaryVerdict}</span>
            </div>

            {/* Main Section Explorer */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              {/* Left Column: Sections List (4 cols) */}
              <div className="md:col-span-4 border-r border-slate-200 p-4 overflow-y-auto space-y-2 bg-slate-50/50">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block px-1 mb-2">
                  Document Sections ({auditResult.sectionAudits.length})
                </span>

                {auditResult.sectionAudits.map((sec) => {
                  const isSelected = sec.sectionId === (currentSection?.sectionId);
                  const isApplied = appliedSections[sec.sectionId];

                  return (
                    <button
                      key={sec.sectionId}
                      onClick={() => setActiveTabSectionId(sec.sectionId)}
                      className={`w-full text-left p-3 rounded-xl text-xs transition border cursor-pointer ${
                        isSelected
                          ? 'bg-white border-indigo-500 shadow-sm ring-2 ring-indigo-500/10'
                          : 'bg-white hover:bg-slate-100/80 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 truncate">{sec.sectionTitle}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          sec.grammarScore >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sec.grammarScore}/100
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{sec.issuesFound.length} issue(s) detected</span>
                        {isApplied ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Applied
                          </span>
                        ) : sec.hasCorrections ? (
                          <span className="text-indigo-600 font-medium">Polished draft ready</span>
                        ) : (
                          <span className="text-slate-400">Clean</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Comparison & Details (8 cols) */}
              {currentSection && (
                <div className="md:col-span-8 p-6 overflow-y-auto space-y-5 bg-white flex flex-col">
                  {/* Section Title & Action */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{currentSection.sectionTitle}</h3>
                      <p className="text-xs text-slate-500">
                        Grammar & Statutory Score: <strong className="text-slate-800 font-mono">{currentSection.grammarScore}/100</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleApplySingle(currentSection.sectionId, currentSection.polishedContent)}
                      disabled={appliedSections[currentSection.sectionId]}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                        appliedSections[currentSection.sectionId]
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 cursor-pointer'
                      }`}
                    >
                      {appliedSections[currentSection.sectionId] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied to Section</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Apply Polished Text to Section</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Issues List */}
                  {currentSection.issuesFound.length > 0 ? (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                        Issues & Enhancements Identified:
                      </span>
                      <ul className="space-y-1 text-xs text-amber-950">
                        {currentSection.issuesFound.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>No major grammatical or syntactic errors found in this section.</span>
                    </div>
                  )}

                  {/* Before vs After Comparison */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
                    {/* Original */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                          ORIGINAL DRAFT
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Current Text</span>
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {currentSection.originalContent}
                      </div>
                    </div>

                    {/* Polished */}
                    <div className="border border-emerald-300 rounded-xl p-4 bg-emerald-50/30 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>POLISHED UK PROCUREMENT ENGLISH</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold font-mono">Suggested Fix</span>
                      </div>
                      <div className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto font-medium">
                        {currentSection.polishedContent}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Audited under Procurement Act 2023 & Crown Commercial Service Guidelines</span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
