import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  ExternalLink, 
  Download, 
  Scale, 
  SlidersHorizontal,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  Shield,
  FileCheck,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { ProcurementDoc, DocumentCategory, DocumentStatus, DocumentType } from '../types';
import { downloadPolicyPdf } from '../lib/downloadHelper';

interface DocumentRegistryViewProps {
  documents: ProcurementDoc[];
  onSelectDocument: (doc: ProcurementDoc) => void;
  onOpenAiAnalysis: (doc: ProcurementDoc) => void;
  onExportSelectedCsv: (selectedDocs: ProcurementDoc[]) => void;
}

export const DocumentRegistryView: React.FC<DocumentRegistryViewProps> = ({
  documents,
  onSelectDocument,
  onOpenAiAnalysis,
  onExportSelectedCsv,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLegislation, setSelectedLegislation] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const handleDownloadDoc = async (doc: ProcurementDoc) => {
    setDownloadingDocId(doc.id);
    try {
      await downloadPolicyPdf(doc);
    } catch (err) {
      console.error('Failed to download document:', err);
    } finally {
      setDownloadingDocId(null);
    }
  };

  // Filter logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Category filter
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false;
      }
      // Doc Type filter
      if (selectedDocType !== 'all' && doc.documentType !== selectedDocType) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && doc.status !== selectedStatus) {
        return false;
      }
      // Legislation filter
      if (selectedLegislation !== 'all' && !doc.applicableLegislation.includes(selectedLegislation)) {
        return false;
      }
      // Year filter
      if (selectedYear !== 'all' && !doc.publicationDate.startsWith(selectedYear)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = doc.reference.toLowerCase().includes(q);
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesSummary = doc.summary.toLowerCase().includes(q);
        const matchesTag = doc.tags.some((t) => t.toLowerCase().includes(q));
        const matchesObligation = doc.keyObligations.some((o) => o.toLowerCase().includes(q));
        if (!matchesRef && !matchesTitle && !matchesSummary && !matchesTag && !matchesObligation) {
          return false;
        }
      }
      return true;
    });
  }, [documents, selectedCategory, selectedDocType, selectedStatus, selectedLegislation, selectedYear, searchQuery]);

  // Batch selection handlers
  const handleToggleSelectAll = () => {
    if (selectedDocIds.size === filteredDocuments.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(filteredDocuments.map((d) => d.id)));
    }
  };

  const handleToggleSelectDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedDocIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedDocIds(next);
  };

  const selectedDocsList = useMemo(() => {
    return documents.filter((d) => selectedDocIds.has(d.id));
  }, [documents, selectedDocIds]);

  const getCategoryBadge = (category: DocumentCategory) => {
    switch (category) {
      case 'ppn':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">PPN</span>;
      case 'procurement_act':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">Act 2023</span>;
      case 'npps':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">NPPS</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Policy</span>;
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
          </span>
        );
      case 'superseded':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Superseded
          </span>
        );
      case 'forthcoming':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" /> Forthcoming
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Pills Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              id="cat-tab-all"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              All Documents ({documents.length})
            </button>
            <button
              id="cat-tab-ppn"
              onClick={() => setSelectedCategory('ppn')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'ppn'
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              Procurement Policy Notes ({documents.filter((d) => d.category === 'ppn').length})
            </button>
            <button
              id="cat-tab-procurement-act"
              onClick={() => setSelectedCategory('procurement_act')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'procurement_act'
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              Procurement Act 2023 Guidance ({documents.filter((d) => d.category === 'procurement_act').length})
            </button>
            <button
              id="cat-tab-npps"
              onClick={() => setSelectedCategory('npps')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'npps'
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              National Policy Statement ({documents.filter((d) => d.category === 'npps').length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              id="view-mode-table"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              id="view-mode-grid"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="input-registry-search"
              type="text"
              placeholder="Search reference, title, obligations, tags (e.g. Carbon, £5M, KPIs)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />
          </div>

          {/* Doc Type Dropdown */}
          <div>
            <select
              id="select-doc-type"
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            >
              <option value="all">All Document Types</option>
              <option value="Policy Note">Policy Notes</option>
              <option value="Statutory Guidance">Statutory Guidance</option>
              <option value="Implementation Guide">Implementation Guides</option>
              <option value="Technical Standard">Technical Standards</option>
              <option value="Policy Statement">Policy Statements</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              id="select-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="superseded">Superseded Only</option>
              <option value="forthcoming">Forthcoming</option>
            </select>
          </div>

          {/* Year Dropdown */}
          <div>
            <select
              id="select-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            >
              <option value="all">All Publication Years</option>
              <option value="2024">2024 (Procurement Act suite)</option>
              <option value="2023">2023</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
        </div>

        {/* Batch Selection Banner */}
        {selectedDocIds.size > 0 && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-blue-900">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              <strong>{selectedDocIds.size}</strong> documents selected
            </span>
            <div className="flex items-center gap-2">
              <button
                id="btn-export-selected-csv"
                onClick={() => onExportSelectedCsv(selectedDocsList)}
                className="px-3 py-1 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors"
              >
                Export Selected ({selectedDocIds.size}) to CSV
              </button>
              <button
                id="btn-clear-selection"
                onClick={() => setSelectedDocIds(new Set())}
                className="px-2 py-1 text-slate-600 hover:text-slate-900 text-xs font-medium underline"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Results View */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-2xs">
          <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No matching procurement documents found</h3>
          <p className="text-xs text-slate-600 mt-1">Try clearing or adjusting your search keywords and filter criteria.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* DENSE TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={selectedDocIds.size === filteredDocuments.length && filteredDocuments.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 text-blue-700 focus:ring-0"
                    />
                  </th>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Title & Summary</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Document Type</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Size</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredDocuments.map((doc) => {
                  const isSelected = selectedDocIds.has(doc.id);
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => onSelectDocument(doc)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectDoc(doc.id, e as any)}
                          className="rounded border-slate-300 text-blue-700 focus:ring-0"
                        />
                      </td>

                      {/* Reference Badge */}
                      <td className="p-3 font-mono font-bold text-blue-800 whitespace-nowrap">
                        {doc.reference}
                      </td>

                      {/* Title & Key Tags */}
                      <td className="p-3 max-w-md">
                        <div className="font-semibold text-slate-900 line-clamp-1">{doc.title}</div>
                        <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{doc.summary}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {doc.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              #{tag}
                            </span>
                          ))}
                          {doc.thresholdRelevance && (
                            <span className="text-[9px] font-bold bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                              {doc.thresholdRelevance.length > 25 ? doc.thresholdRelevance.slice(0, 25) + '...' : doc.thresholdRelevance}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3 whitespace-nowrap">
                        {getCategoryBadge(doc.category)}
                      </td>

                      {/* Document Type */}
                      <td className="p-3 whitespace-nowrap text-slate-600 text-[11px] font-medium">
                        {doc.documentType}
                      </td>

                      {/* Publication Date */}
                      <td className="p-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {doc.publicationDate}
                      </td>

                      {/* Status */}
                      <td className="p-3 whitespace-nowrap">
                        {getStatusBadge(doc.status)}
                      </td>

                      {/* File Size */}
                      <td className="p-3 whitespace-nowrap text-right text-slate-500 font-mono text-[11px]">
                        {doc.fileSizeKb} KB
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-ai-analyze-${doc.id}`}
                            onClick={() => onOpenAiAnalysis(doc)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-700 hover:text-blue-900 transition-colors"
                            title="Statutory Compliance & Legal Analysis"
                          >
                            <Scale className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadDoc(doc)}
                            disabled={downloadingDocId === doc.id}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
                            title="Download Verified Official PDF"
                          >
                            {downloadingDocId === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => onSelectDocument(doc)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                            title="View Full Document Metadata"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const isSelected = selectedDocIds.has(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className={`bg-white border rounded-xl p-5 transition-all hover:border-blue-400 hover:shadow-md cursor-pointer flex flex-col justify-between shadow-2xs ${
                  isSelected ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/30' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {doc.reference}
                      </span>
                      {getCategoryBadge(doc.category)}
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>

                  {/* Title & Summary */}
                  <h4 className="mt-3 text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {doc.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {doc.summary}
                  </p>

                  {/* Key Obligations Bullet Preview */}
                  <div className="mt-3.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-700" /> Key Obligation Preview
                    </div>
                    <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                      {doc.keyObligations[0]}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-2 font-medium">
                    <span>{doc.publicationDate}</span>
                    <span>•</span>
                    <span className="font-mono">{doc.fileSizeKb} KB</span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenAiAnalysis(doc)}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <Scale className="w-3 h-3" /> Legal Brief
                    </button>
                    <button
                      onClick={() => handleDownloadDoc(doc)}
                      disabled={downloadingDocId === doc.id}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition disabled:opacity-50"
                      title="Download PDF"
                    >
                      {downloadingDocId === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
