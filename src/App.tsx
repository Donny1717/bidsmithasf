import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header, AppTab, ViewMode } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { DocumentRegistryView } from './components/DocumentRegistryView';
import { DocumentDetailDrawer } from './components/DocumentDetailDrawer';
import { GroundedPolicyAssistant } from './components/GroundedPolicyAssistant';
import { WorkspaceHub } from './components/WorkspaceHub';
import { TenderComplianceScanner } from './components/TenderComplianceScanner';
import { BidProposalBuilder } from './components/BidProposalBuilder';
import { DocumentCompositionSuite } from './components/DocumentCompositionSuite';
import { CommercialLandingPage } from './components/CommercialLandingPage';
import { LandingPage } from './components/LandingPage';
import { SystemEngineModal } from './components/SystemEngineModal';
import { WorkspaceBrandingModal } from './components/WorkspaceBrandingModal';
import { DatabaseConfigModal } from './components/DatabaseConfigModal';
import { AppFooter } from './components/AppFooter';
import { initAuth, googleSignIn, logout } from './lib/firebaseAuth';
import {
  ProcurementDoc,
  ScraperStatus,
  GoogleDocExportResult,
  GoogleTaskExportResult,
  WhiteLabelSettings,
} from './types';
import { INITIAL_PROCUREMENT_DOCUMENTS } from './data/procurementData';

const DEFAULT_WHITE_LABEL: WhiteLabelSettings = {
  companyName: 'Apex Public Sector Advisory',
  reportHeaderTitle: 'UK STATUTORY TENDER COMPLIANCE AUDIT',
  referencePrefix: 'APEX-AUDIT-2026',
  accentColor: '#0284c7',
  complianceWatermark: true,
};

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('bidsmith_view_mode');
    return saved === 'workspace' || saved === 'landing' ? saved : 'landing';
  });

  const [activeTab, setActiveTab] = useState<AppTab>('tender_scanner');
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Document state
  const [documents, setDocuments] = useState<ProcurementDoc[]>(INITIAL_PROCUREMENT_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<ProcurementDoc | null>(null);
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState<boolean>(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState<boolean>(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState<boolean>(false);

  // SaaS & White-label customer workspace state
  const [whiteLabel, setWhiteLabelState] = useState<WhiteLabelSettings>(() => {
    const saved = localStorage.getItem('bidsmith_whitelabel');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_WHITE_LABEL;
  });

  const handleUpdateWhiteLabel = (updated: WhiteLabelSettings) => {
    setWhiteLabelState(updated);
    localStorage.setItem('bidsmith_whitelabel', JSON.stringify(updated));
  };

  const handleSwitchViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('bidsmith_view_mode', mode);
  };

  const handleEnterWorkspace = (initialTab?: AppTab) => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    handleSwitchViewMode('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Workspace tracking state
  const [createdDocs, setCreatedDocs] = useState<GoogleDocExportResult[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<GoogleTaskExportResult[]>([]);

  // Bid Proposal Prefill state
  const [bidPrefill, setBidPrefill] = useState<{
    title?: string;
    text?: string;
    authority?: string;
  } | null>(null);

  const handleNavigateToBidBuilder = (title: string, text: string, authority: string) => {
    setBidPrefill({ title, text, authority });
    setActiveTab('bid_builder');
    setViewMode('workspace');
  };

  const handleScrollToSection = (sectionId: string) => {
    if (viewMode !== 'landing') {
      setViewMode('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    // Initial load from backend API
    loadDocuments();
    loadScraperStatus();

    return () => unsubscribe();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
        }
      }
    } catch (err) {
      console.warn('Using initial seed documents:', err);
    }
  };

  const loadScraperStatus = async () => {
    try {
      const res = await fetch('/api/scraper/status');
      if (res.ok) {
        const data = await res.json();
        setScraperStatus(data);
      }
    } catch (err) {
      console.warn('Scraper status fetch notice:', err);
    }
  };

  const handleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (error: any) {
      const isUserDismissal =
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.message?.includes('popup-closed-by-user') ||
        error?.message?.includes('cancelled-popup-request');

      if (!isUserDismissal) {
        console.warn('Sign-in notice:', error?.message || error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/scraper/sync', { method: 'POST' });
      if (res.ok) {
        await loadDocuments();
        await loadScraperStatus();
      }
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/documents/export/csv';
  };

  const handleExportSelectedCsv = (selectedDocs: ProcurementDoc[]) => {
    const headers = [
      'id',
      'reference',
      'title',
      'category',
      'category_name',
      'document_type',
      'publication_date',
      'status',
      'target_audience',
      'pdf_url',
      'local_path',
      'file_size_kb',
      'sha256',
      'govuk_url',
      'summary',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = selectedDocs.map((doc) => [
      escapeCsv(doc.id),
      escapeCsv(doc.reference),
      escapeCsv(doc.title),
      escapeCsv(doc.category),
      escapeCsv(doc.categoryName),
      escapeCsv(doc.documentType),
      escapeCsv(doc.publicationDate),
      escapeCsv(doc.status),
      escapeCsv(doc.targetAudience.join('; ')),
      escapeCsv(doc.pdfUrl),
      escapeCsv(doc.localPath),
      doc.fileSizeKb,
      escapeCsv(doc.sha256),
      escapeCsv(doc.govukUrl),
      escapeCsv(doc.summary),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected_uk_procurement_docs_${selectedDocs.length}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-sky-100 selection:text-sky-900">
      {/* Dynamic Navigation Header (WordPress SaaS Landing vs Tender Workspace Header) */}
      <Header
        viewMode={viewMode}
        onSwitchViewMode={handleSwitchViewMode}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSyncing={isSyncing}
        onTriggerSync={handleTriggerSync}
        onExportCsv={handleExportCsv}
        totalDocs={documents.length}
        onOpenSystemModal={() => setIsSystemModalOpen(true)}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        whiteLabel={whiteLabel}
        onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main App Canvas */}
      <main className="flex-1 w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12 lg:py-14">
        {/* VIEW 1: WORDPRESS-STYLE SAAS PRODUCT LANDING PAGE */}
        {viewMode === 'landing' && (
          <LandingPage
            onEnterWorkspace={handleEnterWorkspace}
            onSignInRequired={handleSignIn}
            onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
            whiteLabel={whiteLabel}
          />
        )}

        {/* VIEW 2: TENDER WORKSPACE APP VIEW */}
        {viewMode === 'workspace' && (
          <div className="space-y-6">
            {/* Metric Summary Bar */}
            <MetricsBar status={scraperStatus} />

            {/* Tab 1: Flagship Tender Compliance Scanner */}
            {activeTab === 'tender_scanner' && (
              <TenderComplianceScanner
                user={user}
                accessToken={accessToken}
                onSignInRequired={handleSignIn}
                onDocCreated={(newDoc) => setCreatedDocs((prev) => [newDoc, ...prev])}
                onTasksCreated={(newTasks) => setScheduledTasks((prev) => [...newTasks, ...prev])}
                whiteLabel={whiteLabel}
                onNavigateToBidBuilder={handleNavigateToBidBuilder}
              />
            )}

            {/* Tab 2: Flagship Bid Proposal & Response Package Builder */}
            {activeTab === 'bid_builder' && (
              <BidProposalBuilder
                user={user}
                accessToken={accessToken}
                onSignInRequired={handleSignIn}
                whiteLabel={whiteLabel}
                prefillTenderTitle={bidPrefill?.title}
                prefillTenderText={bidPrefill?.text}
                prefillAuthority={bidPrefill?.authority}
              />
            )}

            {/* Tab 3: Document Composition Suite & Bespoke Layouts */}
            {activeTab === 'doc_composition' && (
              <DocumentCompositionSuite user={user} />
            )}

            {/* Tab 3: Regulations Registry */}
            {activeTab === 'registry' && (
              <DocumentRegistryView
                documents={documents}
                onSelectDocument={(doc) => setSelectedDoc(doc)}
                onOpenAiAnalysis={(doc) => setSelectedDoc(doc)}
                onExportSelectedCsv={handleExportSelectedCsv}
              />
            )}

            {/* Tab 4: Grounded Policy Advisor */}
            {activeTab === 'ai_assistant' && <GroundedPolicyAssistant />}

            {/* Tab 5: Workspace & Reports Hub */}
            {activeTab === 'workspace_hub' && (
              <WorkspaceHub
                user={user}
                accessToken={accessToken}
                onSignIn={handleSignIn}
                onSignOut={handleSignOut}
                createdDocs={createdDocs}
                scheduledTasks={scheduledTasks}
                documents={documents}
                whiteLabel={whiteLabel}
                onUpdateWhiteLabel={handleUpdateWhiteLabel}
                onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Slide-over Detail Drawer */}
      <DocumentDetailDrawer
        doc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        user={user}
        accessToken={accessToken}
        onSignInRequired={handleSignIn}
        onDocCreated={(newDoc) => setCreatedDocs((prev) => [newDoc, ...prev])}
        onTasksCreated={(newTasks) => setScheduledTasks((prev) => [...newTasks, ...prev])}
      />

      {/* Background Engine Modal */}
      <SystemEngineModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        status={scraperStatus}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
      />

      {/* Workspace Letterhead & Branding Modal */}
      <WorkspaceBrandingModal
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        whiteLabel={whiteLabel}
        onSave={handleUpdateWhiteLabel}
      />

      {/* Supabase Database Credentials & Connection Modal */}
      <DatabaseConfigModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />

      {/* Application Comprehensive Footer */}
      <AppFooter />
    </div>
  );
}

export default App;
