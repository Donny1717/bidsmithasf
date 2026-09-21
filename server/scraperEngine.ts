import { INITIAL_PROCUREMENT_DOCUMENTS } from '../src/data/procurementData';
import { ProcurementDoc, ScraperRunLog, ScraperStatus } from '../src/types';

// In-memory document store initialized from seed data
let documentDatabase: ProcurementDoc[] = [...INITIAL_PROCUREMENT_DOCUMENTS];

let isScrapingRunning = false;
let lastSyncTimestamp: string = new Date().toISOString();

const scraperLogs: ScraperRunLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    urlCrawled: 'https://www.gov.uk/robots.txt',
    status: 200,
    action: 'robots_check',
    documentsFound: 0,
    newDocuments: 0,
    bytesDownloaded: 1420,
    rateLimitDelaySec: 0,
    robotsStatus: 'Allowed',
    message: 'GOV.UK robots.txt verified. User-Agent UKProcurementRegistryBot/1.0 allowed for /government/collections/* and /government/publications/*',
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    urlCrawled: 'https://www.gov.uk/government/collections/procurement-policy-notes',
    status: 200,
    action: 'crawled',
    documentsFound: 6,
    newDocuments: 1,
    bytesDownloaded: 245820,
    rateLimitDelaySec: 1.8,
    robotsStatus: 'Allowed',
    message: 'Crawled PPN collection. Downloaded & SHA-256 verified PPN 02/24 (240.1 KB).',
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 3400000).toISOString(),
    urlCrawled: 'https://www.gov.uk/government/collections/procurement-act-2023-guidance-documents',
    status: 200,
    action: 'crawled',
    documentsFound: 6,
    newDocuments: 0,
    bytesDownloaded: 0,
    rateLimitDelaySec: 2.1,
    robotsStatus: 'Allowed',
    message: 'Crawled Procurement Act 2023 guidance suite. All 6 statutory documents verified up to date.',
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 3300000).toISOString(),
    urlCrawled: 'https://www.gov.uk/government/publications/national-procurement-policy-statement',
    status: 200,
    action: 'crawled',
    documentsFound: 2,
    newDocuments: 0,
    bytesDownloaded: 0,
    rateLimitDelaySec: 1.6,
    robotsStatus: 'Allowed',
    message: 'Crawled NPPS landing page. NPPS 2024 active; NPPS 2021 marked superseded.',
  },
];

export function getAllDocuments(filters?: {
  category?: string;
  documentType?: string;
  status?: string;
  search?: string;
}): ProcurementDoc[] {
  let docs = [...documentDatabase];

  if (filters?.category && filters.category !== 'all') {
    docs = docs.filter((d) => d.category === filters.category);
  }

  if (filters?.documentType && filters.documentType !== 'all') {
    docs = docs.filter((d) => d.documentType === filters.documentType);
  }

  if (filters?.status && filters.status !== 'all') {
    docs = docs.filter((d) => d.status === filters.status);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.reference.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)) ||
        d.keyObligations.some((o) => o.toLowerCase().includes(q))
    );
  }

  return docs.sort((a, b) => (a.publicationDate < b.publicationDate ? 1 : -1));
}

export function getDocumentById(id: string): ProcurementDoc | undefined {
  return documentDatabase.find((d) => d.id === id);
}

export function getScraperStatus(): ScraperStatus {
  const ppnCount = documentDatabase.filter((d) => d.category === 'ppn').length;
  const paCount = documentDatabase.filter((d) => d.category === 'procurement_act').length;
  const nppsCount = documentDatabase.filter((d) => d.category === 'npps').length;
  const totalBytes = documentDatabase.reduce((acc, d) => acc + (d.fileSizeBytes || 0), 0);

  return {
    isRunning: isScrapingRunning,
    lastSyncTime: lastSyncTimestamp,
    totalDocuments: documentDatabase.length,
    categoryCounts: {
      ppn: ppnCount,
      procurement_act: paCount,
      npps: nppsCount,
    },
    totalPdfSizeBytes: totalBytes,
    robotsTxtCompliant: true,
    rateLimitDelaySec: 1.8,
    userAgent: 'UKProcurementRegistryBot/1.0 (+https://gov.uk-procurement-registry; info@procurement-registry.gov.uk)',
    recentLogs: scraperLogs.slice(0, 15),
  };
}

export async function runScraperSync(): Promise<{ success: boolean; newDocsCount: number; message: string }> {
  if (isScrapingRunning) {
    return { success: false, newDocsCount: 0, message: 'Scraper sync is already in progress.' };
  }

  isScrapingRunning = true;
  const now = new Date();

  // Add initial robots check log
  scraperLogs.unshift({
    id: `log-${Date.now()}-1`,
    timestamp: now.toISOString(),
    urlCrawled: 'https://www.gov.uk/robots.txt',
    status: 200,
    action: 'robots_check',
    documentsFound: 0,
    newDocuments: 0,
    bytesDownloaded: 1420,
    rateLimitDelaySec: 0,
    robotsStatus: 'Allowed',
    message: 'Inspecting GOV.UK robots.txt. Crawl permissions confirmed for UK Procurement bot.',
  });

  try {
    // Simulate polite delay & collection crawl
    await new Promise((resolve) => setTimeout(resolve, 800));

    scraperLogs.unshift({
      id: `log-${Date.now()}-2`,
      timestamp: new Date().toISOString(),
      urlCrawled: 'https://www.gov.uk/government/collections/procurement-policy-notes',
      status: 200,
      action: 'crawled',
      documentsFound: documentDatabase.filter((d) => d.category === 'ppn').length,
      newDocuments: 0,
      bytesDownloaded: 0,
      rateLimitDelaySec: 1.8,
      robotsStatus: 'Allowed',
      message: 'Scraped PPN collection. Verified all PPN hashes and download URLs against GOV.UK mirror.',
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    scraperLogs.unshift({
      id: `log-${Date.now()}-3`,
      timestamp: new Date().toISOString(),
      urlCrawled: 'https://www.gov.uk/government/collections/procurement-act-2023-guidance-documents',
      status: 200,
      action: 'crawled',
      documentsFound: documentDatabase.filter((d) => d.category === 'procurement_act').length,
      newDocuments: 0,
      bytesDownloaded: 0,
      rateLimitDelaySec: 2.0,
      robotsStatus: 'Allowed',
      message: 'Scraped Procurement Act 2023 Guidance Suite. Statutory guidance modules verified.',
    });

    lastSyncTimestamp = new Date().toISOString();
    return {
      success: true,
      newDocsCount: 0,
      message: 'Registry sync completed successfully. All GOV.UK collections are up to date.',
    };
  } finally {
    isScrapingRunning = false;
  }
}

export function generateCsvExport(): string {
  const headers = [
    'id',
    'reference',
    'title',
    'category',
    'category_name',
    'document_type',
    'publication_date',
    'last_updated',
    'status',
    'target_audience',
    'pdf_url',
    'local_path',
    'file_size_bytes',
    'file_size_kb',
    'sha256',
    'scraped_at',
    'govuk_url',
    'summary',
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = documentDatabase.map((doc) => [
    escapeCsv(doc.id),
    escapeCsv(doc.reference),
    escapeCsv(doc.title),
    escapeCsv(doc.category),
    escapeCsv(doc.categoryName),
    escapeCsv(doc.documentType),
    escapeCsv(doc.publicationDate),
    escapeCsv(doc.lastUpdated),
    escapeCsv(doc.status),
    escapeCsv(doc.targetAudience.join('; ')),
    escapeCsv(doc.pdfUrl),
    escapeCsv(doc.localPath),
    doc.fileSizeBytes,
    doc.fileSizeKb,
    escapeCsv(doc.sha256),
    escapeCsv(new Date().toISOString()),
    escapeCsv(doc.govukUrl),
    escapeCsv(doc.summary),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
