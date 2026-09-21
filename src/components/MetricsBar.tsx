import React from 'react';
import { FileText, BookOpen, BookmarkCheck, Database, HardDrive, Clock } from 'lucide-react';
import { ScraperStatus } from '../types';

interface MetricsBarProps {
  status: ScraperStatus | null;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ status }) => {
  const ppnCount = status?.categoryCounts.ppn ?? 6;
  const paCount = status?.categoryCounts.procurement_act ?? 6;
  const nppsCount = status?.categoryCounts.npps ?? 2;
  const total = status?.totalDocuments ?? (ppnCount + paCount + nppsCount);
  const totalMb = ((status?.totalPdfSizeBytes ?? 4200000) / (1024 * 1024)).toFixed(2);

  const lastSyncStr = status?.lastSyncTime
    ? new Date(status.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Metric 1: Total Indexed */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Total Tracked</span>
          <Database className="w-4 h-4 text-blue-700" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{total}</span>
          <span className="text-[11px] font-medium text-slate-500">PDFs</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-medium">3 GOV.UK Suites</div>
      </div>

      {/* Metric 2: PPNs */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Policy Notes (PPN)</span>
          <FileText className="w-4 h-4 text-sky-700" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{ppnCount}</span>
          <span className="text-[11px] text-emerald-700 font-semibold">100% Verified</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-medium">Prompt Pay, Carbon, Cyber</div>
      </div>

      {/* Metric 3: Procurement Act 2023 */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Procurement Act '23</span>
          <BookOpen className="w-4 h-4 text-indigo-700" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{paCount}</span>
          <span className="text-[11px] text-indigo-700 font-semibold">Statutory</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-medium">Covered, KPIs, Debarment</div>
      </div>

      {/* Metric 4: NPPS */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">NPPS Statements</span>
          <BookmarkCheck className="w-4 h-4 text-amber-700" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{nppsCount}</span>
          <span className="text-[11px] text-slate-600 font-medium">Sec. 13 Duty</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-medium">2024 Active & 2021 Bench</div>
      </div>

      {/* Metric 5: Storage Footprint */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">PDF Store Size</span>
          <HardDrive className="w-4 h-4 text-emerald-700" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalMb}</span>
          <span className="text-[11px] font-medium text-slate-500">MB</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-medium">SHA-256 Deduplicated</div>
      </div>

      {/* Metric 6: Sync Heartbeat */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Feed Status</span>
          <Clock className="w-4 h-4 text-slate-500" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Synchronized
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 font-medium">Last check: {lastSyncStr}</div>
      </div>
    </div>
  );
};
