import React, { useState } from 'react';
import { History, X, RotateCcw, Clock, Sparkles } from 'lucide-react';

export interface VersionSnapshot {
  id: string;
  savedAt: string;
  note: string;
  wordCount: number;
  sections: Array<{ id: string; title: string; subTitle?: string; content: string }>;
  preset?: string;
}

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: VersionSnapshot[];
  onRestoreVersion: (version: VersionSnapshot) => void;
  onSaveManualSnapshot: (note: string) => void;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  versions,
  onRestoreVersion,
  onSaveManualSnapshot,
}) => {
  const [customNote, setCustomNote] = useState('');
  const [previewVersion, setPreviewVersion] = useState<VersionSnapshot | null>(null);

  if (!isOpen) return null;

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveManualSnapshot(customNote.trim() || 'Manual Snapshot');
    setCustomNote('');
  };

  const selectedForPreview = previewVersion || versions[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">Revision History & Cloud Snapshots</h2>
              <p className="text-xs text-slate-400">Restore previous AI rewrites or manual edits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Named Snapshot Form */}
        <form onSubmit={handleCreateSnapshot} className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Name this version (e.g., Pre-Audit Final Draft)..."
            className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Save Snapshot</span>
          </button>
        </form>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* List column */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
              Saved Revisions ({versions.length})
            </span>
            {versions.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-2">No snapshots saved yet.</p>
            ) : (
              versions.map((v, idx) => {
                const isSelected = selectedForPreview?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setPreviewVersion(v)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-white border-indigo-500 shadow-sm ring-2 ring-indigo-500/10'
                        : 'bg-white hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 truncate max-w-[130px]">{v.note}</span>
                      {idx === 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(v.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span>{v.wordCount} words</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Preview column */}
          <div className="md:col-span-7 p-5 overflow-y-auto bg-white flex flex-col justify-between">
            {selectedForPreview ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{selectedForPreview.note}</h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {new Date(selectedForPreview.savedAt).toLocaleString()} • {selectedForPreview.wordCount} words
                    </p>
                  </div>
                  <button
                    onClick={() => onRestoreVersion(selectedForPreview)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 border border-emerald-500 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore This Version</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Section Preview ({selectedForPreview.sections.length} Sections)
                  </span>
                  {selectedForPreview.sections.map((sec) => (
                    <div key={sec.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-800">{sec.title}</div>
                      <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">
                        {sec.content || '(Empty section)'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center my-auto text-xs text-slate-400">Select a version to preview</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
