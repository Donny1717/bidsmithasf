import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckSquare, 
  ExternalLink, 
  Plus, 
  Clock, 
  Sliders,
  CheckCircle2,
  Building,
  ArrowUpRight,
  ShieldCheck,
  Palette,
  LogOut,
  RefreshCw,
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleDocExportResult, GoogleTaskExportResult, ProcurementDoc, WhiteLabelSettings } from '../types';
import { fetchUserGoogleTasks, createGoogleDocBriefing } from '../lib/workspaceApi';

interface WorkspaceHubProps {
  user: User | null;
  accessToken: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
  createdDocs: GoogleDocExportResult[];
  scheduledTasks: GoogleTaskExportResult[];
  documents: ProcurementDoc[];
  whiteLabel?: WhiteLabelSettings;
  onUpdateWhiteLabel?: (settings: WhiteLabelSettings) => void;
  onOpenDatabaseModal?: () => void;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  user,
  accessToken,
  onSignIn,
  onSignOut,
  createdDocs,
  scheduledTasks,
  documents,
  whiteLabel,
  onUpdateWhiteLabel,
  onOpenDatabaseModal,
}) => {
  const [liveGoogleTasks, setLiveGoogleTasks] = useState<any[]>([]);
  const [isLoadingLiveTasks, setIsLoadingLiveTasks] = useState<boolean>(false);
  const [isCreatingMasterBrief, setIsCreatingMasterBrief] = useState<boolean>(false);
  const [masterDocResult, setMasterDocResult] = useState<GoogleDocExportResult | null>(null);

  // White label local form state
  const [companyName, setCompanyName] = useState<string>(whiteLabel?.companyName || 'Apex Public Sector Advisory');
  const [reportHeaderTitle, setReportHeaderTitle] = useState<string>(whiteLabel?.reportHeaderTitle || 'UK STATUTORY TENDER COMPLIANCE AUDIT');
  const [referencePrefix, setReferencePrefix] = useState<string>(whiteLabel?.referencePrefix || 'APEX-AUDIT-2026');
  const [accentColor, setAccentColor] = useState<string>(whiteLabel?.accentColor || '#0284c7');
  const [savedBrandingToast, setSavedBrandingToast] = useState<boolean>(false);

  const loadLiveTasks = async () => {
    if (!accessToken) return;
    setIsLoadingLiveTasks(true);
    try {
      const items = await fetchUserGoogleTasks(accessToken);
      setLiveGoogleTasks(items);
    } catch (err) {
      console.error('Error fetching live Google Tasks:', err);
    } finally {
      setIsLoadingLiveTasks(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadLiveTasks();
    }
  }, [accessToken]);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateWhiteLabel) {
      onUpdateWhiteLabel({
        companyName,
        reportHeaderTitle,
        referencePrefix,
        accentColor,
        complianceWatermark: true,
      });
    }
    setSavedBrandingToast(true);
    setTimeout(() => setSavedBrandingToast(false), 3000);
  };

  const handleCreateMasterBriefing = async () => {
    if (!accessToken) {
      onSignIn();
      return;
    }
    setIsCreatingMasterBrief(true);
    try {
      const doc = documents[0] || {
        id: 'master-01',
        reference: 'UK-PROCUREMENT-SUITE-2024',
        title: 'Comprehensive UK Procurement Regulatory Briefing 2024/2025',
        category: 'procurement_act',
        categoryName: 'Procurement Act 2023 & PPN Consolidated Overview',
        documentType: 'Statutory Guidance',
        publicationDate: '2024-05-15',
        lastUpdated: '2024-05-15',
        status: 'active',
        targetAudience: ['All Contracting Authorities', 'Commercial Directors', 'Procurement Leads'],
        pdfUrl: 'https://www.gov.uk/government/collections/procurement-act-2023-guidance-documents',
        localPath: 'downloads/procurement_act/master_summary.pdf',
        fileSizeBytes: 1048576,
        fileSizeKb: 1024,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        scrapedAt: new Date().toISOString(),
        govukUrl: 'https://www.gov.uk/government/collections/procurement-act-2023-guidance-documents',
        summary: 'Consolidated statutory briefing covering Procurement Act 2023 key regulations, landmark PPNs, and NPPS obligations.',
        keyObligations: [
          'Publish dynamic market notices and pipeline transparency notifications',
          'Enforce 30-day prompt payment down the entire public supply chain (PPN 02/24)',
          'Mandate Carbon Reduction Plans for major contracts above £5M (PPN 06/21)',
          'Track and publish statutory KPIs for contracts exceeding £5M threshold',
        ],
        contractingAuthorityImpact: 'Requires updated standard procurement documents, revised evaluation scorecards, and digital platform integration.',
        supplierImpact: 'Suppliers must register once on the central digital platform and maintain compliance declarations.',
        applicableLegislation: 'Both / Transition',
        thresholdRelevance: 'Central & Sub-central public contracts > Thresholds',
        tags: ['Procurement Act 2023', 'PPN', 'NPPS', 'Statutory Guidance'],
        compliancePriority: 'High',
      } as ProcurementDoc;

      const result = await createGoogleDocBriefing(accessToken, doc);
      setMasterDocResult(result);
    } catch (err) {
      console.error('Failed to create master brief:', err);
    } finally {
      setIsCreatingMasterBrief(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Status Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Google Workspace & Reports Hub
                </h2>
                {user ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Connected
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Generate official Executive Briefings in Google Docs, sync compliance checklists to Google Tasks, and customize report branding.
              </p>
            </div>
          </div>

          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900">{user.displayName || user.email}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Scopes: Docs, Drive, Tasks</div>
                </div>
                <button
                  id="btn-workspace-hub-disconnect"
                  onClick={onSignOut}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                id="btn-workspace-hub-connect"
                onClick={onSignIn}
                className="px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-2xs transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Sign in with Google Workspace
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Persistence & Supabase Database Configuration Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-tight">Supabase Cloud Database (PostgreSQL)</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Production Storage
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Connect Supabase Secret Keys to persist tenders, bid proposal drafts, and compliance logs across all devices.
            </p>
          </div>
        </div>

        {onOpenDatabaseModal && (
          <button
            onClick={onOpenDatabaseModal}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Database className="w-4 h-4" />
            <span>Manage Supabase Keys & Connection</span>
          </button>
        )}
      </div>

      {/* Two Column Grid: Google Docs Section & Google Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Google Docs Briefing Archive */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">Generated Google Docs</h3>
            </div>
            <button
              onClick={handleCreateMasterBriefing}
              disabled={isCreatingMasterBrief || !user}
              className={`text-xs px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold flex items-center gap-1.5 transition shadow-2xs ${
                !user ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {isCreatingMasterBrief ? 'Creating...' : 'New Master Briefing'}
            </button>
          </div>

          {masterDocResult && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-medium">
              <span className="font-bold">{masterDocResult.title}</span>
              <a
                href={masterDocResult.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold flex items-center gap-1 shadow-2xs"
              >
                <span>Open</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          )}

          {createdDocs.length === 0 && !masterDocResult ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-800">No Google Docs generated yet.</p>
              <p className="text-[11px] text-slate-600 leading-relaxed max-w-sm mx-auto">
                Run a Tender Compliance Audit or open any regulation in the Registry to export an executive briefing memo directly to Google Docs.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {createdDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{doc.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Created: {new Date(doc.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <a
                    href={doc.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 hover:text-blue-900 transition shrink-0 shadow-2xs"
                    title="Open in Google Docs"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Google Tasks Action Items */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Google Tasks Checklist</h3>
            </div>
            {user && (
              <button
                onClick={loadLiveTasks}
                disabled={isLoadingLiveTasks}
                className="text-xs text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition"
                title="Refresh Google Tasks"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLiveTasks ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {!user ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-3">
              <CheckSquare className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">Connect your Google Workspace to view live compliance tasks.</p>
              <button
                onClick={onSignIn}
                className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-2xs transition"
              >
                Connect Workspace
              </button>
            </div>
          ) : liveGoogleTasks.length > 0 ? (
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {liveGoogleTasks.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900">{t.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {t.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  {t.due && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Due: {new Date(t.due).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : scheduledTasks.length > 0 ? (
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {scheduledTasks.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900">{t.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono font-medium">
                    List: {t.listTitle} • Due: {new Date(t.due).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-2">
              <CheckSquare className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-800">No compliance tasks scheduled yet.</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Click "Add Actions to Google Tasks" inside the Tender Compliance Scanner to push action items.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: White-Label Report Customization */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Report Branding & White-Label Settings</h3>
              <p className="text-xs text-slate-600">
                Customize the firm name, header title, reference code, and accent theme on generated PDF audit memos and Google Docs.
              </p>
            </div>
          </div>
          {savedBrandingToast && (
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1 font-bold animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSaveBranding} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Company / Advisory Firm</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              placeholder="e.g. Apex Public Sector Advisory"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Audit Report Title</label>
            <input
              type="text"
              value={reportHeaderTitle}
              onChange={(e) => setReportHeaderTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              placeholder="e.g. UK STATUTORY TENDER COMPLIANCE AUDIT"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Reference Prefix</label>
            <input
              type="text"
              value={referencePrefix}
              onChange={(e) => setReferencePrefix(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              placeholder="e.g. APEX-AUDIT-2026"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Theme Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-8 w-10 bg-transparent rounded cursor-pointer border border-slate-300"
              />
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow-2xs transition"
              >
                Apply Branding
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

