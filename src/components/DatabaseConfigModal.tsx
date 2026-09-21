import React, { useState, useEffect } from 'react';
import {
  Database,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  X,
  ExternalLink,
  Shield,
  Code2,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Server,
} from 'lucide-react';
import { getStoredSupabaseCredentials, saveStoredSupabaseCredentials } from '../lib/supabaseClient';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionSuccess?: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnectionSuccess,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);

  // Status & Testing states
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'credentials' | 'guide' | 'sql'>('credentials');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load stored credentials
      const { url, key } = getStoredSupabaseCredentials();
      setSupabaseUrl(url);
      setSupabaseAnonKey(key);

      // Check server database status
      fetch('/api/database/config')
        .then((res) => res.json())
        .then((data) => {
          if (data.isConfigured) {
            setIsConnected(true);
            if (!url && data.rawUrl) setSupabaseUrl(data.rawUrl);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!supabaseUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter Supabase Project URL (e.g. https://xyz.supabase.co)',
      });
      return;
    }
    if (!supabaseAnonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter Supabase Anon / Public Key',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/database/test-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl: supabaseUrl.trim(),
          supabaseAnonKey: supabaseAnonKey.trim(),
          serviceRoleKey: serviceRoleKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Supabase connection verified successfully! Database API is ready.',
        });
        setIsConnected(true);
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Unable to connect. Please verify your Project URL and Anon Key.',
        });
        setIsConnected(false);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection error: ${err.message || 'Network Error'}`,
      });
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndConnect = async () => {
    setIsSaving(true);
    try {
      // Save locally
      saveStoredSupabaseCredentials(supabaseUrl, supabaseAnonKey);

      // Save to server runtime
      const res = await fetch('/api/database/save-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl: supabaseUrl.trim(),
          supabaseAnonKey: supabaseAnonKey.trim(),
          serviceRoleKey: serviceRoleKey.trim() || undefined,
        }),
      });

      if (res.ok) {
        setIsConnected(true);
        setTestResult({
          success: true,
          message: 'Supabase credentials saved and connection established!',
        });
        onConnectionSuccess?.();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Save failed: ${err.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sqlSchemaSnippet = `-- Bidsmith ASF Database Schema for Supabase
-- Copy and run in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  company_name TEXT NOT NULL,
  tender_title TEXT NOT NULL,
  contracting_authority TEXT,
  status TEXT DEFAULT 'draft',
  compliance_score INTEGER DEFAULT 0,
  content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID REFERENCES public.bids(id) ON DELETE CASCADE,
  section_title TEXT NOT NULL,
  section_content TEXT,
  ai_suggestions TEXT,
  word_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon reads/writes for BidSmith workspace
CREATE POLICY "Public full access policy" ON public.bids FOR ALL USING (true);
CREATE POLICY "Public full access proposals" ON public.proposals FOR ALL USING (true);
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Supabase Database Connection & Secrets
                </h3>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Not Configured
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Enter Secret Keys to connect your Supabase PostgreSQL cloud database for persistent tender storage.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'credentials'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>1. Enter Secret Keys</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>2. Find Keys Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sql'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>3. SQL Schema Table</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {activeTab === 'credentials' && (
            <div className="space-y-4">
              {/* Field 1: Supabase URL */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    Supabase Project URL <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Project Settings &gt; API &gt; URL
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Supabase Project URL starts with https:// and ends with .supabase.co
                </p>
              </div>

              {/* Field 2: Supabase Anon Key */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    Supabase Anon / Public Key <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    anon public key (JWT)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showAnonKey ? 'text' : 'password'}
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnonKey(!showAnonKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Public client key for accessing data. Safe for browser and frontend use.
                </p>
              </div>

              {/* Field 3: Service Role Key (Optional) */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <label className="font-extrabold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    Supabase Service Role Key <span className="text-slate-400 font-normal">(Optional)</span>
                  </span>
                  <span className="text-[10px] text-amber-600 font-mono">Server Admin Only</span>
                </label>
                <div className="relative">
                  <input
                    type={showServiceKey ? 'text' : 'password'}
                    value={serviceRoleKey}
                    onChange={(e) => setServiceRoleKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role..."
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowServiceKey(!showServiceKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showServiceKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Test Result Feedback */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 animate-in fade-in duration-150 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      {testResult.success ? 'Test Connection Successful' : 'Test Connection Failed'}
                    </span>
                    <p className="text-[11px] leading-relaxed">{testResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Steps to retrieve API keys from Supabase Dashboard
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-indigo-950 font-medium leading-relaxed">
                  <li>
                    Log in at{' '}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold text-indigo-700 hover:text-indigo-900"
                    >
                      supabase.com/dashboard
                    </a>
                  </li>
                  <li>Click and select your project</li>
                  <li>
                    In the bottom-left menu, click gear icon <strong>Project Settings</strong>
                  </li>
                  <li>
                    Select <strong>API</strong>
                  </li>
                  <li>
                    Under <strong>Project URL</strong>: Copy URL (e.g.,{' '}
                    <code className="bg-indigo-100 px-1 py-0.5 rounded text-indigo-900">
                      https://xxxx.supabase.co
                    </code>
                    )
                  </li>
                  <li>
                    Under <strong>Project API Keys</strong>: Copy key labeled{' '}
                    <strong>anon public</strong>
                  </li>
                  <li>Paste both values into tab <strong>1. Enter Secret Keys</strong> and click Save</li>
                </ol>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Don't have a Supabase project?</h4>
                  <p className="text-[11px] text-slate-500">
                    You can create a free PostgreSQL database on the Supabase website.
                  </p>
                </div>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold inline-flex items-center gap-1.5 hover:bg-slate-800 transition"
                >
                  <span>Open Supabase Web</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  SQL Schema for Tenders & Proposals:
                </span>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <pre className="p-3.5 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed max-h-60 border border-slate-800">
                {sqlSchemaSnippet}
              </pre>
              <p className="text-[11px] text-slate-500">
                💡 How to use: Go to Supabase Dashboard &gt; <strong>SQL Editor</strong> &gt; Paste this script and click <strong>Run</strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !supabaseUrl || !supabaseAnonKey}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <Server className="w-4 h-4 text-indigo-600" />
                <span>Test Connection</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSaveAndConnect}
              disabled={isSaving || !supabaseUrl || !supabaseAnonKey}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Save & Connect</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
