import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  RefreshCw, 
  Download, 
  Search, 
  Layers,
  LogOut,
  Sliders,
  FileCheck,
  Server,
  Building2,
  Edit3,
  ArrowRight,
  Home,
  LayoutGrid,
  CheckCircle2,
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';
import { WhiteLabelSettings } from '../types';

export type AppTab =
  | 'tender_scanner'
  | 'bid_builder'
  | 'doc_composition'
  | 'registry'
  | 'ai_assistant'
  | 'workspace_hub';

export type ViewMode = 'landing' | 'workspace';

interface HeaderProps {
  viewMode: ViewMode;
  onSwitchViewMode: (mode: ViewMode) => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
  onExportCsv: () => void;
  totalDocs: number;
  onOpenSystemModal?: () => void;
  onOpenDatabaseModal?: () => void;
  whiteLabel: WhiteLabelSettings;
  onOpenBrandingModal: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onSwitchViewMode,
  activeTab,
  onSelectTab,
  user,
  onSignIn,
  onSignOut,
  isSyncing,
  onTriggerSync,
  onExportCsv,
  totalDocs,
  onOpenSystemModal,
  onOpenDatabaseModal,
  whiteLabel,
  onOpenBrandingModal,
  onScrollToSection,
}) => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-xs">
      {/* Top Banner / Statutory Authority Strip */}
      <div className="bg-[#0B192C] px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-sky-500/20 text-sky-300 font-semibold px-2 py-0.5 rounded text-[11px] border border-sky-400/30">
            GOV.UK Verified Feed
          </span>
          <span className="hidden sm:inline text-slate-300 font-medium">
            Crown Commercial Service & Cabinet Office Procurement Intelligence
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Compliance Daemon</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-200 font-mono font-medium">{totalDocs} Indexed Statutes</span>
        </div>
      </div>

      {/* VIEW 1: WORDPRESS-STYLE LANDING PAGE HEADER */}
      {viewMode === 'landing' ? (
        <div className="w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Main Brand: BidSmith ASF */}
          <div
            onClick={() => onSwitchViewMode('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center shadow-md shadow-blue-900/10 border border-blue-600 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  BidSmith ASF
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  SaaS Platform
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                UK Statutory Procurement & Tender Compliance Intelligence
              </p>
            </div>
          </div>

          {/* WordPress Menu Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700">
            <button
              onClick={() => onScrollToSection?.('features')}
              className="hover:text-blue-800 transition py-1"
            >
              Platform Overview
            </button>
            <button
              onClick={() => onScrollToSection?.('act2023')}
              className="hover:text-blue-800 transition py-1"
            >
              Procurement Act 2023
            </button>
            <button
              onClick={() => onScrollToSection?.('roi')}
              className="hover:text-blue-800 transition py-1"
            >
              ROI Calculator
            </button>
            <button
              onClick={() => onScrollToSection?.('pricing')}
              className="hover:text-blue-800 transition py-1"
            >
              Pricing & Plans
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {onOpenDatabaseModal && (
              <button
                id="btn-open-db-modal-landing"
                onClick={onOpenDatabaseModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition shadow-2xs cursor-pointer"
                title="Supabase Database Configuration & Secrets"
              >
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Supabase DB</span>
              </button>
            )}

            <button
              id="btn-enter-workspace"
              onClick={() => onSwitchViewMode('workspace')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-800 hover:bg-blue-900 text-white shadow-md shadow-blue-900/10 transition hover:scale-[1.02]"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Launch Tender Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* VIEW 2: TENDER WORKSPACE HEADER (CUSTOMIZABLE WORKSPACE NAME & LOGO) */
        <div>
          {/* Workspace Top Bar */}
          <div className="w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
            {/* Customer Workspace Logo & Custom Organization Name */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md border border-white/20 shrink-0"
                style={{ backgroundColor: whiteLabel.accentColor || '#0284c7' }}
              >
                {getInitials(whiteLabel.companyName)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    BidSmith Customer Workspace
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Custom Organization Header
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {whiteLabel.companyName}
                  </h2>
                  <button
                    id="btn-edit-customer-workspace-name"
                    onClick={onOpenBrandingModal}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition shadow-2xs cursor-pointer"
                    title="Edit Customer Organization Name & Branding for Workspace Page"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Customer Name</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Workspace Global Actions */}
            <div className="flex items-center gap-2">
              {/* Back to Home / Product Site Button */}
              <button
                onClick={() => onSwitchViewMode('landing')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                title="Return to BidSmith ASF Landing Page"
              >
                <Home className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">BidSmith Home</span>
              </button>

              {/* Engine Modal Button */}
              {onOpenSystemModal && (
                <button
                  id="btn-open-system-modal"
                  onClick={onOpenSystemModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition shadow-2xs"
                  title="View Background Engine Details"
                >
                  <Server className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden md:inline">Engine</span>
                </button>
              )}

              {/* Supabase Database Modal Button */}
              {onOpenDatabaseModal && (
                <button
                  id="btn-open-db-modal-workspace"
                  onClick={onOpenDatabaseModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition shadow-2xs cursor-pointer"
                  title="Supabase Database Configuration & Secrets"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Database</span>
                </button>
              )}

              {/* Sync Button */}
              <button
                id="btn-sync-scraper"
                onClick={onTriggerSync}
                disabled={isSyncing}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  isSyncing
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs'
                }`}
                title="Sync latest policy documents from GOV.UK"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
                <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>

              {/* CSV Export */}
              <button
                id="btn-export-csv"
                onClick={onExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition shadow-2xs"
                title="Download document catalog CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Google Workspace Sign-in */}
              {user ? (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center uppercase">
                    {user.email?.[0] || 'U'}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 hidden md:inline truncate max-w-[100px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <button
                    id="btn-workspace-signout"
                    onClick={onSignOut}
                    className="text-slate-400 hover:text-rose-600 transition p-1"
                    title="Disconnect Google Workspace"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  id="btn-workspace-signin"
                  onClick={onSignIn}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-2xs transition"
                  title="Connect Google Workspace"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span className="hidden sm:inline">Connect Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Workspace Navigation Tabs */}
          <div className="w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 bg-slate-50/80 border-b border-slate-200">
            <nav role="tablist" aria-label="Tender Workspace Tabs" className="flex space-x-2 py-2 overflow-x-auto text-xs sm:text-sm font-semibold">
              <button
                id="tab-tender-scanner"
                role="tab"
                aria-selected={activeTab === 'tender_scanner'}
                onClick={() => onSelectTab('tender_scanner')}
                className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg transition whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  activeTab === 'tender_scanner'
                    ? 'bg-blue-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${activeTab === 'tender_scanner' ? 'text-sky-300' : 'text-blue-800'}`} />
                <span>1. Tender Compliance Audit</span>
                <span className={`rounded px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-wider ${
                  activeTab === 'tender_scanner' ? 'bg-blue-950 text-sky-200' : 'bg-blue-100 text-blue-900'
                }`}>
                  Scanner
                </span>
              </button>

              <button
                id="tab-bid-builder"
                role="tab"
                aria-selected={activeTab === 'bid_builder'}
                onClick={() => onSelectTab('bid_builder')}
                className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg transition whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  activeTab === 'bid_builder'
                    ? 'bg-blue-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                <FileCheck className={`w-4 h-4 ${activeTab === 'bid_builder' ? 'text-amber-300' : 'text-amber-700'}`} />
                <span>2. Bid Response Builder</span>
                <span className={`rounded px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-wider ${
                  activeTab === 'bid_builder' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-950'
                }`}>
                  AI Writer
                </span>
              </button>

              <button
                id="tab-doc-composition"
                role="tab"
                aria-selected={activeTab === 'doc_composition'}
                onClick={() => onSelectTab('doc_composition')}
                className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg transition whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  activeTab === 'doc_composition'
                    ? 'bg-blue-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                <LayoutGrid className={`w-4 h-4 ${activeTab === 'doc_composition' ? 'text-emerald-300' : 'text-emerald-700'}`} />
                <span>3. Document Composition & Templates</span>
                <span className={`rounded px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-wider ${
                  activeTab === 'doc_composition' ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-emerald-950'
                }`}>
                  God-Mode Layouts
                </span>
              </button>

              <button
                id="tab-registry"
                role="tab"
                aria-selected={activeTab === 'registry'}
                onClick={() => onSelectTab('registry')}
                className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg transition whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  activeTab === 'registry'
                    ? 'bg-blue-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                <Layers className={`w-4 h-4 ${activeTab === 'registry' ? 'text-indigo-200' : 'text-indigo-800'}`} />
                <span>4. Regulations Registry</span>
              </button>

              <button
                id="tab-ai-assistant"
                role="tab"
                aria-selected={activeTab === 'ai_assistant'}
                onClick={() => onSelectTab('ai_assistant')}
                className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg transition whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  activeTab === 'ai_assistant'
                    ? 'bg-blue-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                <Search className={`w-4 h-4 ${activeTab === 'ai_assistant' ? 'text-emerald-300' : 'text-emerald-800'}`} />
                <span>5. AI Policy Advisor</span>
              </button>

              <button
                id="tab-workspace-hub"
                role="tab"
                aria-selected={activeTab === 'workspace_hub'}
                onClick={() => onSelectTab('workspace_hub')}
                className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg transition whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  activeTab === 'workspace_hub'
                    ? 'bg-blue-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeTab === 'workspace_hub' ? 'text-amber-300' : 'text-amber-800'}`} />
                <span>6. Workspace Reports & Branding</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
