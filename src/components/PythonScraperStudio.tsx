import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Play, 
  Settings, 
  FileCode, 
  RefreshCw, 
  ShieldCheck, 
  Sliders, 
  ExternalLink,
  GitBranch
} from 'lucide-react';

export const PythonScraperStudio: React.FC = () => {
  const [pythonCode, setPythonCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isLoadingScript, setIsLoadingScript] = useState<boolean>(true);

  // Configuration parameters
  const [cliMode, setCliMode] = useState<'backfill' | 'monitor' | 'stats'>('backfill');
  const [rateLimitDelay, setRateLimitDelay] = useState<number>(1.8);
  const [outputDir, setOutputDir] = useState<string>('downloads');
  const [csvFilename, setCsvFilename] = useState<string>('procurement_registry_index.csv');
  const [userAgent, setUserAgent] = useState<string>('UKProcurementRegistryBot/1.0 (+https://gov.uk-procurement-registry; info@procurement-registry.gov.uk)');
  const [isDryRun, setIsDryRun] = useState<boolean>(false);

  // Terminal Runner Simulation state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/scraper/python-script')
      .then((res) => res.text())
      .then((code) => {
        setPythonCode(code);
        setIsLoadingScript(false);
      })
      .catch((err) => {
        console.error('Failed to load python script:', err);
        setIsLoadingScript(false);
      });
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uk_procurement_scraper.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunSimulation = () => {
    setIsExecuting(true);
    setTerminalLogs([]);

    const addLog = (msg: string) => {
      setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const simulatedSequence = [
      `$ python uk_procurement_scraper.py --mode ${cliMode} --delay ${rateLimitDelay} --output-dir ${outputDir} --csv-path ${csvFilename}${isDryRun ? ' --dry-run' : ''}`,
      `[INFO] Initializing UKProcurementScraper (User-Agent: ${userAgent.slice(0, 35)}...)`,
      `[INFO] Checking GOV.UK robots.txt compliance at https://www.gov.uk/robots.txt...`,
      `[INFO] robots.txt parsed successfully. Crawl paths /government/collections/* and /government/publications/* are ALLOWED.`,
      `[INFO] Loaded existing entries from ${csvFilename} (14 records found).`,
      `[INFO] === Crawling Collection: Procurement Policy Notes (PPNs) ===`,
      `[DEBUG] Polite rate-limit sleep: ${rateLimitDelay.toFixed(2)}s`,
      `[INFO] Discovered 6 publication documents under PPN collection landing page.`,
      `[INFO] Fetching metadata for PPN 02/24: Improving Payment Performance...`,
      `[INFO] Downloading PDF: PPN_0224_Improving_Payment_Performance.pdf (240.1 KB)...`,
      `[INFO] Saved: ${outputDir}/ppn/2024/PPN_02_24_Improving_Payment_Performance.pdf (SHA256: 9f8e4d3a...)`,
      `[INFO] === Crawling Collection: Procurement Act 2023 Guidance Suite ===`,
      `[DEBUG] Polite rate-limit sleep: ${(rateLimitDelay + 0.2).toFixed(2)}s`,
      `[INFO] Discovered 6 statutory guidance modules under Procurement Act 2023 collection.`,
      `[INFO] Verified PA23-GUIDE-01: Covered Procurement (473.8 KB, SHA256: 6c7d8e9f...)`,
      `[INFO] === Crawling Collection: National Procurement Policy Statement ===`,
      `[DEBUG] Polite rate-limit sleep: ${(rateLimitDelay - 0.1).toFixed(2)}s`,
      `[INFO] Verified NPPS 2024 Statement (291.4 KB, SHA256: 2c3d4e5f...)`,
      `[INFO] Updating master CSV index at ${csvFilename}...`,
      `[SUCCESS] Scrape complete. All 14 procurement guidance PDFs indexed and categorized.`,
    ];

    simulatedSequence.forEach((log, index) => {
      setTimeout(() => {
        addLog(log);
        if (index === simulatedSequence.length - 1) {
          setIsExecuting(false);
        }
      }, (index + 1) * 300);
    });
  };

  const commandString = `python uk_procurement_scraper.py --mode ${cliMode} --delay ${rateLimitDelay} --output-dir ${outputDir} --csv-path ${csvFilename}${isDryRun ? ' --dry-run' : ''}`;

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                uk_procurement_scraper.py
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> robots.txt Compliant
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-2">
              Production Python Scraper & PDF Harvester Studio
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Standalone script equipped with automated GOV.UK robots.txt compliance validation, polite exponential backoff, SHA-256 deduplication, category-based directory filing, and automated CSV registry generation.
            </p>
          </div>

          {/* Download & Copy Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-copy-python-code"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'Copied Script' : 'Copy Code'}
            </button>
            <button
              id="btn-download-python-script"
              onClick={handleDownloadScript}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4" />
              Download .py Script
            </button>
          </div>
        </div>

        {/* CLI Command Generator Strip */}
        <div className="mt-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-800 overflow-x-auto">
            <span className="text-blue-700 font-bold">$</span>
            <span className="font-medium">{commandString}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(commandString);
            }}
            className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            Copy Command
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Configurator + Live Terminal Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Parameter Tuning */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-700" />
            CLI Parameter Tuner
          </h3>

          {/* Mode Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Operation Mode (--mode)</label>
            <select
              value={cliMode}
              onChange={(e) => setCliMode(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-700"
            >
              <option value="backfill">backfill (Full historical crawl & download)</option>
              <option value="monitor">monitor (Continuous polling loop for new PDFs)</option>
              <option value="stats">stats (Summarize current index counts)</option>
            </select>
          </div>

          {/* Rate-Limit Delay */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <label>Rate-Limit Delay (--delay)</label>
              <span className="font-mono text-blue-800 font-bold">{rateLimitDelay}s</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={rateLimitDelay}
              onChange={(e) => setRateLimitDelay(parseFloat(e.target.value))}
              className="w-full accent-blue-800 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 font-medium">Recommended &gt;= 1.5s per GOV.UK webmaster etiquette.</p>
          </div>

          {/* Output Directory */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">PDF Output Directory (--output-dir)</label>
            <input
              type="text"
              value={outputDir}
              onChange={(e) => setOutputDir(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* CSV Filename */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Master CSV Index Path (--csv-path)</label>
            <input
              type="text"
              value={csvFilename}
              onChange={(e) => setCsvFilename(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* User-Agent String */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">User-Agent Header (--user-agent)</label>
            <textarea
              rows={2}
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-800 font-mono focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* Dry-Run Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="check-dryrun"
              checked={isDryRun}
              onChange={(e) => setIsDryRun(e.target.checked)}
              className="rounded border-slate-300 text-blue-800 focus:ring-0"
            />
            <label htmlFor="check-dryrun" className="text-xs font-medium text-slate-700 cursor-pointer">
              Enable Dry-Run Mode (Simulate without downloading)
            </label>
          </div>

          {/* Run Simulator Button */}
          <button
            id="btn-run-terminal-sim"
            onClick={handleRunSimulation}
            disabled={isExecuting}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs ${
              isExecuting
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            <Play className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
            {isExecuting ? 'Running Scraper Execution...' : 'Run Terminal Execution Simulation'}
          </button>
        </div>

        {/* Right 2 Cols: Live Terminal Console */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col shadow-inner overflow-hidden">
          {/* Terminal Window Top Bar */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2">bash - uk_procurement_scraper</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Python 3.11 Runtime</div>
          </div>

          {/* Terminal Output Area */}
          <div className="flex-1 p-4 font-mono text-xs text-slate-300 space-y-1.5 overflow-y-auto max-h-[420px] min-h-[300px]">
            <div className="text-slate-400"># Ready. Click "Run Terminal Execution Simulation" above or copy the script to run locally.</div>
            {terminalLogs.map((log, idx) => (
              <div
                key={idx}
                className={`${
                  log.includes('[SUCCESS]')
                    ? 'text-emerald-400 font-bold'
                    : log.includes('[INFO]')
                    ? 'text-blue-300'
                    : log.includes('[DEBUG]')
                    ? 'text-slate-400'
                    : log.startsWith('$')
                    ? 'text-amber-300 font-bold'
                    : 'text-slate-200'
                }`}
              >
                {log}
              </div>
            ))}
            {isExecuting && (
              <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                <span>&gt; Processing HTTP request stream...</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Code Inspector Box */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <FileCode className="w-4 h-4 text-blue-700" />
            <span>Python Source Code: uk_procurement_scraper.py</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="text-xs text-slate-700 font-semibold hover:text-slate-900 px-3 py-1 bg-white rounded-lg border border-slate-200 flex items-center gap-1.5 shadow-2xs"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCode ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-200 bg-slate-950 overflow-x-auto max-h-[360px] leading-relaxed">
          <code>{pythonCode}</code>
        </pre>
      </div>

    </div>
  );
};
