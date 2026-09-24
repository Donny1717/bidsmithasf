import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { FoundationHeader, AppTab } from './components/foundation/FoundationHeader';
import { SignInGate } from './components/foundation/SignInGate';
import { DashboardView } from './components/foundation/DashboardView';
import { PolicyRegistryView } from './components/foundation/PolicyRegistryView';
import { AuditViewer } from './components/foundation/AuditViewer';
import { MetricsBar } from './components/MetricsBar';
import { DocumentRegistryView } from './components/DocumentRegistryView';
import { DocumentDetailDrawer } from './components/DocumentDetailDrawer';
import { GroundedPolicyAssistant } from './components/GroundedPolicyAssistant';
import { WorkspaceHub } from './components/WorkspaceHub';
import { TenderComplianceScanner } from './components/TenderComplianceScanner';
import { BidProposalBuilder } from './components/BidProposalBuilder';
import { DocumentCompositionSuite } from './components/DocumentCompositionSuite';
import { LandingPage } from './components/LandingPage';
import { SystemEngineModal } from './components/SystemEngineModal';
import { WorkspaceBrandingModal } from './components/WorkspaceBrandingModal';
import { DatabaseConfigModal } from './components/DatabaseConfigModal';
import { AppFooter } from './components/AppFooter';
import { initAuth, googleSignIn, logout } from './lib/firebaseAuth';
import { createSession, type FoundationSession } from './lib/foundationApi';
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
  // Auth + session (Phase 1)
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [session, setSession] = useState<FoundationSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // Navigation
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>(
    () => (localStorage.getItem('bidsmith_view_mode') === 'workspace' ? 'workspace' : 'landing')
  );
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // Registry + scraper state
  const [documents, setDocuments] = useState<ProcurementDoc[]>(INITIAL_PROCUREMENT_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<ProcurementDoc | null>(null);
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);

  // Workspace tracking
  const [createdDocs, setCreatedDocs] = useState<GoogleDocExportResult[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<GoogleTaskExportResult[]>([]);
  const [bidPrefill, setBidPrefill] = useState<{ title?: string; text?: string; authority?: string } | null>(null);

  // White-label settings
  const [whiteLabel, setWhiteLabelState] = useState<WhiteLabelSettings>(() => {
    const saved = localStorage.getItem('bidsmith_whitelabel');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return DEFAULT_WHITE_LABEL;
  });

  const handleUpdateWhiteLabel = (updated: WhiteLabelSettings) => {
    setWhiteLabelState(updated);
    localStorage.setItem('bidsmith_whitelabel', JSON.stringify(updated));
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      async (currentUser: User | null, _token: string | null) => {
        setUser(currentUser);
        if (currentUser) {
          const token = await currentUser.getIdToken();
          setIdToken(token);
          try {
            setSession(await createSession(token));
            setSessionError(null);
          } catch (e: any) {
            setSession(null);
            setSessionError(e?.message || 'Session could not be established');
          }
        } else {
          setIdToken(null);
          setSession(null);
        }
      },
      () => {
        setUser(null);
        setIdToken(null);
        setSession(null);
      }
    );

    loadDocuments();
    loadScraperStatus();
    return () => unsubscribe();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        if (data.documents && data.documents.length > 0) setDocuments(data.documents);
      }
    } catch (err) {
      console.warn('Using initial seed documents:', err);
    }
  };

  const loadScraperStatus = async () => {
    try {
      const res = await fetch('/api/scraper/status');
      if (res.ok) setScraperStatus(await res.json());
    } catch (err) {
      console.warn('Scraper status fetch notice:', err);
    }
  };

  const establishSession = async (token: string) => {
    try {
      setSession(await createSession(token));
      setSessionError(null);
    } catch (e: any) {
      setSession(null);
      setSessionError(e?.message || 'Session could not be established');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        setUser(result.user);
        const token = await result.user.getIdToken();
        setIdToken(token);
        await establishSession(token);
      }
    } catch (error: any) {
      const dismissed =
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.message?.includes('popup-closed-by-user');
      if (!dismissed) console.warn('Sign-in notice:', error?.message || error);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleDevSignIn = async (email: string) => {
    setAuthBusy(true);
    try {
      const token = 'dev-identity:' + email;
      setIdToken(token);
      await establishSession(token);
      setUser({ email } as User);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign-out error:', error);
    }
    setUser(null);
    setIdToken(null);
    setSession(null);
    setViewMode('landing');
    localStorage.setItem('bidsmith_view_mode', 'landing');
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

  const handleNavigateToBidBuilder = (title: string, text: string, authority: string) => {
    setBidPrefill({ title, text, authority });
    setActiveTab('bid_builder');
    setViewMode('workspace');
  };

  const handleSessionProblem = (message: string) => {
    setSessionError(message);
  };

  const signedIn = Boolean(user && session);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-sky-100 selection:text-sky-900">
      {viewMode === 'landing' ? (
        <>
          <div className="bg-[#0b0c0c] text-white text-xs px-4 py-1.5 flex items-center justify-between">
            <span className="font-bold">BidSmith ASF</span>
            <span>Phase 1 · Secure Foundation · Sign-in required for workspace</span>
          </div>
          <LandingPage
            onEnterWorkspace={() => {
              setViewMode('workspace');
              localStorage.setItem('bidsmith_view_mode', 'workspace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSignInRequired={handleGoogleSignIn}
            onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
            whiteLabel={whiteLabel}
          />
        </>
      ) : (
        <>
          <FoundationHeader
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            user={user}
            session={session}
            onSignOut={handleSignOut}
            isSyncing={isSyncing}
            onTriggerSync={handleTriggerSync}
            onExportCsv={handleExportCsv}
            onOpenSystemModal={() => setIsSystemModalOpen(true)}
            onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
            onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
          />

          <main id="main-content" className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
            <div aria-live="polite">
              {sessionError && (
                <div className="mb-6 border-l-4 border-[#b0392b] bg-red-50 text-red-900 p-3 text-sm font-medium rounded-sm">
                  {sessionError}
                </div>
              )}
            </div>

            {!signedIn ? (
              <SignInGate
                onGoogleSignIn={handleGoogleSignIn}
                onDevSignIn={handleDevSignIn}
                busy={authBusy}
              />
            ) : (
              <div className="space-y-6">
                {activeTab === 'dashboard' && (
                  <DashboardView
                    session={session!}
                    idToken={idToken}
                    onSessionProblem={handleSessionProblem}
                  />
                )}
                {activeTab === 'policies' && <PolicyRegistryView idToken={idToken} />}
                {activeTab === 'audit' && <AuditViewer idToken={idToken} />}

                {activeTab === 'tender_scanner' && (
                  <TenderComplianceScanner
                    user={user}
                    accessToken={idToken}
                    onSignInRequired={handleGoogleSignIn}
                    onDocCreated={(newDoc) => setCreatedDocs((prev) => [newDoc, ...prev])}
                    onTasksCreated={(newTasks) => setScheduledTasks((prev) => [...prev, ...newTasks])}
                    whiteLabel={whiteLabel}
                    onNavigateToBidBuilder={handleNavigateToBidBuilder}
                  />
                )}
                {activeTab === 'bid_builder' && (
                  <BidProposalBuilder
                    user={user}
                    accessToken={idToken}
                    onSignInRequired={handleGoogleSignIn}
                    whiteLabel={whiteLabel}
                    prefillTenderTitle={bidPrefill?.title}
                    prefillTenderText={bidPrefill?.text}
                    prefillAuthority={bidPrefill?.authority}
                  />
                )}
                {activeTab === 'doc_composition' && <DocumentCompositionSuite user={user} />}
                {activeTab === 'registry' && (
                  <>
                    <MetricsBar status={scraperStatus} />
                    <DocumentRegistryView
                      documents={documents}
                      onSelectDocument={(doc) => setSelectedDoc(doc)}
                      onOpenAiAnalysis={(doc) => setSelectedDoc(doc)}
                      onExportSelectedCsv={() => handleExportCsv()}
                    />
                  </>
                )}
                {activeTab === 'ai_assistant' && <GroundedPolicyAssistant />}
                {activeTab === 'workspace_hub' && (
                  <WorkspaceHub
                    user={user}
                    accessToken={idToken}
                    onSignIn={handleGoogleSignIn}
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
        </>
      )}

      <DocumentDetailDrawer
        doc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        user={user}
        accessToken={idToken}
        onSignInRequired={handleGoogleSignIn}
        onDocCreated={(newDoc) => setCreatedDocs((prev) => [newDoc, ...prev])}
        onTasksCreated={(newTasks) => setScheduledTasks((prev) => [...prev, ...newTasks])}
      />

      <SystemEngineModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        status={scraperStatus}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
      />
      <WorkspaceBrandingModal
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        whiteLabel={whiteLabel}
        onSave={handleUpdateWhiteLabel}
      />
      <DatabaseConfigModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />
      <AppFooter />
    </div>
  );
}

export default App;
