import React, { useState } from 'react';
import { Building2, X, Check, Palette, Sparkles, FileText, ShieldCheck } from 'lucide-react';
import { WhiteLabelSettings } from '../types';

interface WorkspaceBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  whiteLabel: WhiteLabelSettings;
  onSave: (updated: WhiteLabelSettings) => void;
}

const ACCENT_COLOR_OPTIONS = [
  { name: 'Sky Blue (Default)', hex: '#0284c7', bgClass: 'bg-sky-600' },
  { name: 'Crown Navy', hex: '#1e3a8a', bgClass: 'bg-blue-900' },
  { name: 'Emerald Green', hex: '#059669', bgClass: 'bg-emerald-600' },
  { name: 'Royal Indigo', hex: '#4f46e5', bgClass: 'bg-indigo-600' },
  { name: 'Amber Gold', hex: '#d97706', bgClass: 'bg-amber-600' },
  { name: 'Rose Red', hex: '#e11d48', bgClass: 'bg-rose-600' },
];

export function WorkspaceBrandingModal({
  isOpen,
  onClose,
  whiteLabel,
  onSave,
}: WorkspaceBrandingModalProps) {
  const [companyName, setCompanyName] = useState(whiteLabel.companyName);
  const [reportHeaderTitle, setReportHeaderTitle] = useState(whiteLabel.reportHeaderTitle);
  const [referencePrefix, setReferencePrefix] = useState(whiteLabel.referencePrefix);
  const [accentColor, setAccentColor] = useState(whiteLabel.accentColor);
  const [complianceWatermark, setComplianceWatermark] = useState(whiteLabel.complianceWatermark);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      companyName: companyName.trim() || 'My Organization Workspace',
      reportHeaderTitle: reportHeaderTitle.trim() || 'UK TENDER COMPLIANCE AUDIT',
      referencePrefix: referencePrefix.trim() || 'WORK-2026',
      accentColor,
      complianceWatermark,
    });
    onClose();
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center font-bold text-sky-300">
              {getInitials(companyName)}
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Set Workspace Name & Branding</h3>
              <p className="text-xs text-slate-300">
                Customizes your workspace letterhead, PDF exports, and audit reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Workspace / Company Name */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Workspace / Customer Organization Name *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Digital Solutions UK or Siam Advisory Ltd"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              This name will be your primary workspace header and official document letterhead.
            </p>
          </div>

          {/* Report Header Title */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Official Report / Document Subtitle
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={reportHeaderTitle}
                onChange={(e) => setReportHeaderTitle(e.target.value)}
                placeholder="e.g. UK STATUTORY TENDER COMPLIANCE AUDIT"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Reference Prefix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Reference Code Prefix
              </label>
              <input
                type="text"
                value={referencePrefix}
                onChange={(e) => setReferencePrefix(e.target.value)}
                placeholder="e.g. APEX-AUDIT-2026"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono font-bold text-slate-800"
              />
            </div>

            {/* Compliance Watermark Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Statutory Stamp
              </label>
              <button
                type="button"
                onClick={() => setComplianceWatermark(!complianceWatermark)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                  complianceWatermark
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                <span>{complianceWatermark ? 'Stamped Verified' : 'Standard'}</span>
                <ShieldCheck className={`w-4 h-4 ${complianceWatermark ? 'text-emerald-700' : 'text-slate-400'}`} />
              </button>
            </div>
          </div>

          {/* Accent Color Palette */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Workspace & Export Letterhead Accent Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ACCENT_COLOR_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.hex}
                  onClick={() => setAccentColor(opt.hex)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition ${
                    accentColor === opt.hex
                      ? 'border-blue-800 bg-blue-50/60 ring-2 ring-blue-700/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${opt.bgClass} shrink-0`} />
                  <span className="truncate text-[11px]">{opt.name.split(' ')[0]}</span>
                  {accentColor === opt.hex && <Check className="w-3.5 h-3.5 text-blue-800 ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Preview Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Letterhead Header Preview
            </span>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black"
                  style={{ backgroundColor: accentColor }}
                >
                  {getInitials(companyName)}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">{companyName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{referencePrefix}-001</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Audit Ready
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 shadow-2xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Workspace Letterhead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
