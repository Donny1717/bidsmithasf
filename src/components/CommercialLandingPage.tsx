import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Briefcase,
  TrendingUp,
  FileCheck,
  Scale,
  FileText,
  Calculator,
  Lock,
  Users,
  ChevronRight,
  ExternalLink,
  Globe,
  DollarSign,
  Clock,
  Search,
  LayoutGrid,
  Edit3,
  Layers,
  Sparkles,
  Zap,
  BookOpen
} from 'lucide-react';
import { AppTab } from './Header';
import { WhiteLabelSettings } from '../types';

interface CommercialLandingPageProps {
  onEnterWorkspace: (tab?: AppTab) => void;
  onSignInRequired: () => void;
  onOpenBrandingModal?: () => void;
  whiteLabel?: WhiteLabelSettings;
}

export function CommercialLandingPage({ onEnterWorkspace, onSignInRequired, onOpenBrandingModal, whiteLabel }: CommercialLandingPageProps) {
  const [selectedRole, setSelectedRole] = useState<'supplier' | 'buyer'>('supplier');
  const companyName = whiteLabel?.companyName || 'Apex Public Sector Advisory';
  
  // Interactive ROI Calculator State
  const [annualBidValue, setAnnualBidValue] = useState<number>(12000000);
  const [bidsPerYear, setBidsPerYear] = useState<number>(8);
  const [avgHoursPerBid, setAvgHoursPerBid] = useState<number>(35);

  // ROI Calculations
  const calculatedRiskMitigated = Math.round(annualBidValue * 0.15);
  const calculatedHoursSaved = bidsPerYear * Math.round(avgHoursPerBid * 0.65);
  const calculatedCostSavingsGbp = calculatedHoursSaved * 120; // £120/hr avg commercial bid advisory rate

  return (
    <div className="space-y-24 sm:space-y-28 pb-16">
      {/* 1. WordPress SaaS Hero Section - Extended Height & Spacious Layout */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white via-slate-50/70 to-white p-8 sm:p-16 lg:p-24 py-16 sm:py-24 lg:py-28 shadow-xs">
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 sm:space-y-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-3 rounded-full border border-blue-200 bg-blue-50/90 px-6 py-3 text-xs sm:text-sm font-bold text-blue-900 shadow-xs tracking-wide">
            <ShieldCheck className="h-4.5 w-4.5 text-blue-700 shrink-0" />
            <span>BidSmith ASF — UK Statutory Tender & Public Procurement Intelligence Platform</span>
          </div>

          {/* Main Headline - Larger Font & Balanced Optical Letter Spacing */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-slate-900 tracking-tight leading-[1.12] sm:leading-[1.10]">
            <span className="text-slate-800">{companyName}</span> — Never Lose a UK Tender to a{' '}
            <span className="text-slate-900 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 bg-clip-text text-transparent">
              Statutory Compliance Defect
            </span>
          </h1>

          {/* Subtitle - Increased size and line spacing for relaxed reading */}
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed sm:leading-loose font-normal">
            The enterprise SaaS platform grounded in the <strong className="text-slate-900 font-semibold">Procurement Act 2023</strong> and official Crown Commercial Service PPNs. Audit ITT specifications, build winning bid responses, and manage your custom branded <strong className="text-blue-800 font-semibold">Tender Workspace</strong>.
          </p>

          {/* Hero Main CTAs - Extended Button Heights and Spacing */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6">
            <button
              onClick={() => onEnterWorkspace('tender_scanner')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3.5 rounded-2xl bg-blue-800 px-10 py-5 sm:py-6 text-base sm:text-lg font-bold text-white shadow-2xl shadow-blue-900/25 hover:bg-blue-900 transition-all hover:scale-[1.02] active:scale-[0.99] min-h-[64px]"
            >
              <LayoutGrid className="h-5 w-5 shrink-0" />
              <span>Enter Tender Workspace</span>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </button>

            <button
              onClick={() => onEnterWorkspace('bid_builder')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/90 px-8 py-5 sm:py-6 text-base font-bold text-amber-950 hover:bg-amber-100 transition shadow-2xs min-h-[64px]"
            >
              <FileCheck className="h-5 w-5 text-amber-700 shrink-0" />
              <span>Launch Bid Response Writer</span>
            </button>

            <button
              onClick={() => onEnterWorkspace('registry')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-5 sm:py-6 text-base font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs min-h-[64px]"
            >
              <Search className="h-5 w-5 text-blue-700 shrink-0" />
              <span>Search PPN Registry</span>
            </button>
          </div>

          {/* Customer Workspace Branding Callout - Expanded Padding & Height */}
          <div className="p-6 sm:p-8 rounded-3xl border-2 border-blue-200/90 bg-blue-50/80 max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 text-left shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-800 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md shadow-blue-900/20">
                🏢
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 block leading-snug">Custom Workspace Header & Letterhead</span>
                <span className="text-xs sm:text-sm text-slate-600 leading-relaxed block mt-1">Customers can set their own Organization Name & Logo inside Tender Workspace</span>
              </div>
            </div>
            {onOpenBrandingModal && (
              <button
                onClick={onOpenBrandingModal}
                className="shrink-0 text-xs sm:text-sm font-bold text-blue-800 bg-white px-5 py-3 rounded-xl border border-blue-200 hover:bg-blue-50 transition shadow-2xs"
              >
                Set Name
              </button>
            )}
          </div>

          {/* Statutory Credibility Strip */}
          <div className="pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>Procurement Act 2023 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>AWE Supply Chain & Defence Aligned</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>PPN 06/21 Net Zero & CRP</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>PPN 02/24 Prompt Payment (95%)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>Section 57 Central Debarment</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Capabilities Showcase (WordPress Feature Grid) */}
      <section id="features" className="space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
            <Sparkles className="h-3.5 w-3.5 text-blue-700" />
            <span>5 Flagship Modules Included in Tender Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            What's Inside BidSmith ASF Tender Workspace?
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Everything your team needs to review tender documents, mitigate compliance risks, write winning proposals, and export executive report memos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1: Tender Compliance Audit */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs hover:border-blue-300 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center font-bold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">1. Tender Compliance Audit</h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">Scanner</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan ITT & PQQ tender specifications against the Procurement Act 2023, PPN 06/21, and PPN 02/24. Instantly detects pass/fail disqualification risks, statutory thresholds, and mandatory checklists.
              </p>
            </div>
            <button
              onClick={() => onEnterWorkspace('tender_scanner')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 transition"
            >
              <span>Open Audit Scanner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Module 2: Bid Proposal & Response Writer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs hover:border-amber-300 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                <FileCheck className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">2. Bid Response Builder</h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">AI Writer</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates complete, statutory-aligned bid response sections tailored to buyer requirements. Features Red Team evaluation scoring, evaluator rubric tips, and win strategy analysis.
              </p>
            </div>
            <button
              onClick={() => onEnterWorkspace('bid_builder')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 transition"
            >
              <span>Launch Bid Builder</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Module 3: Regulations Registry */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs hover:border-indigo-300 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center font-bold">
                <Layers className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">3. Regulations Registry</h3>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">30+ PPNs</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Indexed statutory database containing 30+ official Crown Commercial Service & Cabinet Office Procurement Policy Notes (PPNs), statutory guidance notes, and PDF policy briefs.
              </p>
            </div>
            <button
              onClick={() => onEnterWorkspace('registry')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 text-xs font-bold hover:bg-indigo-100 transition"
            >
              <span>Explore Policy Registry</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Module 4: Grounded AI Policy Advisor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs hover:border-emerald-300 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                <Search className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">4. Grounded Policy Advisor</h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">RAG AI</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask complex UK public procurement law questions. Powered by RAG grounded search to deliver accurate answers backed by direct GOV.UK citations and legal clause references.
              </p>
            </div>
            <button
              onClick={() => onEnterWorkspace('ai_assistant')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition"
            >
              <span>Ask AI Advisor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Module 5: Workspace Reports & Branding */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs hover:border-sky-300 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 flex items-center justify-center font-bold">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">5. Workspace & Letterhead</h3>
                <span className="text-[10px] font-bold bg-sky-100 text-sky-900 px-2 py-0.5 rounded">Branding</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configure your custom customer workspace name, organization logo badge, and letterhead header. Automatically propagates onto exported Google Docs and downloadable PDF audit reports.
              </p>
            </div>
            <button
              onClick={() => onEnterWorkspace('workspace_hub')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 text-xs font-bold hover:bg-sky-100 transition"
            >
              <span>View Workspace Settings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Integration Highlight */}
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-900 to-indigo-950 p-6 text-white space-y-4 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-800/80 border border-blue-400/30 text-sky-300 flex items-center justify-center font-bold">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Google Workspace Integration</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Export complete compliance memos into Google Docs with one click, and automatically sync bid checklists and statutory deadlines directly into Google Tasks.
              </p>
            </div>
            <button
              onClick={onSignInRequired}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition"
            >
              <span>Connect Google Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Dual Value Proposition (Role Switcher) */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Tailored For Every Side of UK Public Procurement
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Whether you are competing to win high-value government contracts or administering public funds under statutory procurement law.
          </p>

          {/* Switcher Tabs */}
          <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-2xl shadow-inner mt-4">
            <button
              onClick={() => setSelectedRole('supplier')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'supplier'
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              For Suppliers, Contractors & Bid Writers
            </button>
            <button
              onClick={() => setSelectedRole('buyer')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'buyer'
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4" />
              For Contracting Authorities & Buyers
            </button>
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedRole === 'supplier' ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs hover:border-blue-300 transition">
                <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Instant Disqualification Detector</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Identify automatic pass/fail pitfalls before spending weeks on a bid. Detect £5M+ PPN 06/21 Carbon Reduction Plan mandates, PPN 02/24 prompt payment compliance, and exclusion clauses.
                </p>
                <div className="pt-2 text-xs font-bold text-blue-800 flex items-center gap-1">
                  <span>99.4% Pass/Fail Accuracy</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs hover:border-blue-300 transition">
                <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Social Value & Scoring Optimization</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Align bid responses with the 5 themes of PPN 06/20 Social Value Model. Maximize your 10%–20% evaluation score with tailored qualitative commitment drafting advice.
                </p>
                <div className="pt-2 text-xs font-bold text-blue-800 flex items-center gap-1">
                  <span>Target Top Score Band</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs hover:border-blue-300 transition">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">1-Click Google Workspace Memos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Export complete compliance audit memos into Google Docs and automatically populate bid action checklists and deadlines directly in Google Tasks.
                </p>
                <div className="pt-2 text-xs font-bold text-blue-800 flex items-center gap-1">
                  <span>Seamless Team Collaboration</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs hover:border-emerald-300 transition">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <Scale className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Procurement Act 2023 Assurance</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ensure ITT tender documentation complies fully with statutory duty requirements, competitive flexible procedures, and transparency notice timelines.
                </p>
                <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <span>Statutory Buyer Compliance</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs hover:border-emerald-300 transition">
                <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Debarment & Exclusion Cross-Check</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cross-verify supplier submissions against the Section 57 Cabinet Office Central Debarment List and mandatory exclusion triggers with verifiable audit trails.
                </p>
                <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <span>Mitigate Legal Challenge Risk</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs hover:border-emerald-300 transition">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Section 52 KPI Compliance Engine</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automatically structure and evaluate the 3 mandatory Key Performance Indicators (KPIs) required for all UK public contracts exceeding £5M under the new Act.
                </p>
                <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <span>Mandatory KPI Structuring</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4. Interactive ROI & Risk Mitigation Calculator */}
      <section id="roi" className="rounded-3xl border border-slate-200 bg-white p-8 lg:p-10 shadow-2xs space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 mb-2">
              <Calculator className="h-3.5 w-3.5 text-emerald-600" />
              <span>Interactive Commercial ROI Engine</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Calculate Your Tender Risk & Efficiency Savings
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Estimate the financial value of avoided bid disqualifications and hours of statutory legal analysis saved.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders Column */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Annual Public Tender Pipeline Value (£ GBP):</span>
                <span className="text-blue-800 font-mono text-sm font-black">£{(annualBidValue / 1000000).toFixed(1)}M</span>
              </div>
              <input
                type="range"
                min={1000000}
                max={50000000}
                step={500000}
                value={annualBidValue}
                onChange={(e) => setAnnualBidValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-medium mt-1">
                <span>£1M (SME Bids)</span>
                <span>£25M</span>
                <span>£50M+ (Enterprise Frameworks)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Number of Public Bids / Procurements Submitted Per Year:</span>
                <span className="text-blue-800 font-mono text-sm font-black">{bidsPerYear} tenders</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={bidsPerYear}
                onChange={(e) => setBidsPerYear(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Average Compliance & Legal Review Hours Per Tender:</span>
                <span className="text-blue-800 font-mono text-sm font-black">{avgHoursPerBid} hrs / bid</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={avgHoursPerBid}
                onChange={(e) => setAvgHoursPerBid(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Estimated Annual Operational Impact
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-bold">
                  Pipeline Risk Protected
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">
                  £{(calculatedRiskMitigated / 1000000).toFixed(2)}M
                </span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Avoiding pass/fail disqualifications
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-bold">
                  Bid Writing Hours Saved
                </span>
                <span className="text-xl sm:text-2xl font-black text-blue-800 mt-1 block">
                  {calculatedHoursSaved} hrs / yr
                </span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Automated statutory analysis
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  Estimated Commercial Cost Savings:
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Equivalent legal consultancy & audit billable value
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-800">
                £{calculatedCostSavingsGbp.toLocaleString()} / yr
              </span>
            </div>

            <button
              onClick={() => onEnterWorkspace('tender_scanner')}
              className="w-full rounded-xl bg-blue-800 py-3.5 text-xs font-bold text-white hover:bg-blue-900 transition shadow-2xs flex items-center justify-center gap-2"
            >
              <span>Launch Tender Risk Scan in Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Official UK Government Statutory Benchmarks */}
      <section id="act2023" className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
            <Scale className="h-3.5 w-3.5 text-blue-700" />
            <span>Official Crown Commercial Service & National Audit Office Data</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Statutory Procurement Benchmarks & Official Case References
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Direct regulatory facts published by the Cabinet Office, Crown Commercial Service, and UK National Audit Office regarding tender pass/fail thresholds and buyer obligations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 flex flex-col justify-between shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 font-mono">PPN 06/21 Technical Standard</span>
                <span className="text-slate-500 font-semibold">Statutory Pass/Fail</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Mandatory Carbon Reduction Plan (CRP) Threshold
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applies to all Central Government and wider public sector contracts valued at <strong className="text-slate-800">£5 Million per annum or above</strong>. Suppliers must publish a signed board-level CRP detailing Scope 1, Scope 2, and 5 mandatory Scope 3 emissions categories. Failure to provide a compliant plan results in automatic SQ disqualification.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Cabinet Office Policy</span>
              <a
                href="https://www.gov.uk/government/publications/procurement-policy-note-0621-taking-account-of-carbon-reduction-plans-in-the-procurement-of-major-government-contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 hover:text-blue-900 flex items-center gap-1 font-bold"
              >
                Official GOV.UK Source <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 flex flex-col justify-between shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-800 font-mono">PPN 02/24 & Section 67</span>
                <span className="text-slate-500 font-semibold">Prompt Payment Metric</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                95% 60-Day Supply Chain Payment Performance
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Requires bidding suppliers on major contracts to prove that at least <strong className="text-slate-800">95% of all supply chain invoices</strong> are paid within 60 days across the preceding two 6-month reporting periods, with an average payment timeframe not exceeding 55 days.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Cabinet Office Standard</span>
              <a
                href="https://www.gov.uk/government/publications/procurement-policy-note-0224-improving-payment-performance-in-public-procurement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 hover:text-blue-900 flex items-center gap-1 font-bold"
              >
                Official GOV.UK Source <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 flex flex-col justify-between shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-800 font-mono">Procurement Act 2023</span>
                <span className="text-slate-500 font-semibold">Statutory Duties</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Section 52 KPIs & Section 57 Central Debarment
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contracting authorities must set and publicly report on at least <strong className="text-slate-800">3 Key Performance Indicators (KPIs)</strong> annually for public contracts exceeding £5M, and are legally prohibited from contracting with suppliers entered onto the statutory Central Debarment List.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">UK Primary Legislation</span>
              <a
                href="https://www.legislation.gov.uk/ukpga/2023/54/enacted"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 hover:text-blue-900 flex items-center gap-1 font-bold"
              >
                Legislation.gov.uk <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SaaS Pricing Section (id="pricing") */}
      <section id="pricing" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Transparent Commercial Plans
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Flexible tiering for commercial bid teams, legal advisors, and public sector contracting authorities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: Free Trial */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Starter</span>
              <h3 className="text-xl font-bold text-slate-900">Free Workspace</h3>
              <div className="text-2xl font-black text-slate-900">
                £0 <span className="text-xs font-normal text-slate-500">/ forever</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited 30+ PPN Document Search</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sample ITT Tender Compliance Audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom Workspace Name & Logo</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onEnterWorkspace('tender_scanner')}
              className="w-full py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs font-bold hover:bg-slate-100 transition"
            >
              Start Free Workspace
            </button>
          </div>

          {/* Tier 2: Pro Bidder */}
          <div className="rounded-2xl border-2 border-blue-800 bg-white p-6 space-y-5 flex flex-col justify-between shadow-md relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-800 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
              Most Popular
            </span>
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 block">Commercial Suppliers</span>
              <h3 className="text-xl font-bold text-slate-900">Pro Bidder Suite</h3>
              <div className="text-2xl font-black text-slate-900">
                £199 <span className="text-xs font-normal text-slate-500">/ month per workspace</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited Live Tender File Uploads & Audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Bid Proposal Writer & Red Team Scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1-Click Export to Google Docs & Tasks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Downloadable Custom Branded PDF Reports</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onEnterWorkspace('bid_builder')}
              className="w-full py-3 rounded-xl bg-blue-800 text-white text-xs font-bold hover:bg-blue-900 shadow-2xs transition"
            >
              Launch Pro Workspace
            </button>
          </div>

          {/* Tier 3: Enterprise Authority */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Public Sector & Advisory</span>
              <h3 className="text-xl font-bold text-slate-900">Enterprise Authority</h3>
              <div className="text-2xl font-black text-slate-900">
                £499 <span className="text-xs font-normal text-slate-500">/ month per organization</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Section 57 Debarment Cross-Verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-User Role Permissions & SSO</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated Statutory Compliance Advisor</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onEnterWorkspace('workspace_hub')}
              className="w-full py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs font-bold hover:bg-slate-100 transition"
            >
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </section>

      {/* 7. Bottom Conversion Banner */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-6 shadow-2xs">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Ready to Access Your Custom Tender Workspace?
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Audit ITT specifications, write winning bid proposals, and customize your organization's letterhead branding in seconds.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onEnterWorkspace('tender_scanner')}
            className="rounded-2xl bg-blue-800 px-10 py-5 text-base sm:text-lg font-bold text-white hover:bg-blue-900 transition-all hover:scale-[1.02] shadow-xl shadow-blue-900/20 flex items-center gap-3 min-h-[60px]"
          >
            <LayoutGrid className="h-5 w-5 shrink-0" />
            <span>Enter Tender Workspace Now</span>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </button>
        </div>
      </section>
    </div>
  );
}
