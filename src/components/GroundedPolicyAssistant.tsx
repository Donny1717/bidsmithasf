import React, { useState } from 'react';
import { 
  Search, 
  ExternalLink, 
  FileText, 
  CheckSquare, 
  Send, 
  ShieldCheck,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Scale
} from 'lucide-react';
import { GroundedSearchResult } from '../types';

interface GroundedPolicyAssistantProps {
  onExportDoc?: (title: string, content: string) => void;
  onScheduleTasks?: (tasks: string[]) => void;
}

export const GroundedPolicyAssistant: React.FC<GroundedPolicyAssistantProps> = ({
  onExportDoc,
  onScheduleTasks,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<GroundedSearchResult | null>(null);

  const samplePrompts = [
    'What are the core differences between PCR 2015 and the Procurement Act 2023?',
    'What are the mandatory requirements for Carbon Reduction Plans under PPN 06/21?',
    'How do Key Performance Indicators (KPIs) work for contracts above £5 million under the Procurement Act?',
    'What are the grounds for supplier exclusion on the statutory Central Debarment List?',
    'What are the mandatory requirements for AI transparency and disclosures under PPN 02/24?',
    'Explain the prompt payment performance rules in government supply chains (PPN 02/23 & Section 67).',
  ];

  const handleExecuteQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setQuery(queryText);
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/search-grounded-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResult(data);
    } catch (err) {
      console.error('Grounded search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Search-Grounded Policy & Procurement Act 2023 Advisor
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Powered by Gemini with real-time Google Search grounding to retrieve current UK public procurement regulations, secondary legislation, and PPN obligations.
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              id="input-grounded-query"
              type="text"
              placeholder="Ask any question regarding UK procurement rules, thresholds, PPNs, or the Procurement Act 2023..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) handleExecuteQuery(query);
              }}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-2xs"
            />
          </div>
          <button
            id="btn-submit-grounded-query"
            onClick={() => handleExecuteQuery(query)}
            disabled={isLoading || !query.trim()}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-2xs ${
              isLoading || !query.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-blue-800 hover:bg-blue-900 text-white'
            }`}
          >
            <Send className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Searching...' : 'Consult Advisor'}
          </button>
        </div>

        {/* Sample Prompt Chips */}
        <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500 font-semibold mr-1">Suggested topics:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleExecuteQuery(p)}
              className="text-[11px] bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors text-left font-medium"
            >
              {p.length > 55 ? p.slice(0, 55) + '...' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Spinner State */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-600 space-y-3 shadow-2xs">
          <RefreshCw className="w-8 h-8 mx-auto text-blue-700 animate-spin" />
          <h3 className="text-sm font-bold text-slate-900">Grounded Search in Progress</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Retrieving official statutory publications and policy notes from GOV.UK and the Cabinet Office...
          </p>
        </div>
      )}

      {/* Answer and Citations Card */}
      {!isLoading && searchResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-2xs">
          {/* Main Answer Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-bold text-slate-900">Answer for:</span>
                <span className="font-mono text-blue-800 font-semibold">"{query}"</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {new Date(searchResult.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-slate-800 text-xs leading-relaxed space-y-3 whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-200 font-sans">
              {searchResult.answer}
            </div>
          </div>

          {/* Official Grounding Citations */}
          {searchResult.citations?.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Verified GOV.UK Sources & Grounding References
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {searchResult.citations.map((cite, idx) => (
                  <a
                    key={idx}
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-white hover:bg-blue-50/50 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 flex items-center justify-between gap-2 transition-colors shadow-2xs"
                  >
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate">{cite.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{cite.url}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Follow-Ups */}
          {searchResult.suggestedFollowUps?.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Follow-Up Inquiries:
              </span>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                {searchResult.suggestedFollowUps.map((fu, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteQuery(fu)}
                    className="text-xs bg-slate-50 hover:bg-blue-50 text-blue-800 hover:text-blue-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors flex items-center gap-1.5 font-semibold"
                  >
                    <ArrowRight className="w-3 h-3 text-blue-700 shrink-0" />
                    <span>{fu}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial Landing Placeholder */}
      {!isLoading && !searchResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Procurement Act 2023 Rules</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Understand the shift to Competitive Flexible Procedures, new transparency notices, dynamic markets, and debarment mechanisms.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Landmark PPN Compliance</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verify compliance rules for PPN 06/21 (Carbon Reduction Plans), PPN 02/24 (AI Transparency), PPN 02/23 (Prompt Payment), and PPN 10/23 (Cyber Security).
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 mb-2">
              <Search className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Live Search Grounding</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Model answers are grounded against live GOV.UK announcements, providing citations to official legislation and policy notes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
