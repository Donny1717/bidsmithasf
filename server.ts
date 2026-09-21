import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  getAllDocuments,
  getDocumentById,
  getScraperStatus,
  runScraperSync,
  generateCsvExport,
} from './server/scraperEngine';
import {
  analyzeProcurementDocument,
  performGroundedSearch,
  analyzeTenderCompliance,
  autoFixTenderComplianceError,
  validateTextQualityAndGrammar,
  auditFullDocumentQuality,
} from './server/gemini';
import { generateProcurementPdf, generateTenderAuditPdf } from './server/pdfGenerator';
import { parseAndExtractTenderDocument } from './server/documentParser';
import { generateBidProposalPackage } from './server/bidProposalEngine';
import { generateBidProposalPdf } from './server/bidProposalPdfGenerator';
import {
  getSupabaseConfig,
  testSupabaseConnection,
  setRuntimeSupabaseConfig,
} from './server/supabase';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'UK Public Procurement Registry & Scraper Backend',
      timestamp: new Date().toISOString(),
    });
  });

  // Document Registry Endpoints
  app.get('/api/documents', (req, res) => {
    const { category, documentType, status, search } = req.query;
    const docs = getAllDocuments({
      category: typeof category === 'string' ? category : undefined,
      documentType: typeof documentType === 'string' ? documentType : undefined,
      status: typeof status === 'string' ? status : undefined,
      search: typeof search === 'string' ? search : undefined,
    });
    res.json({
      total: docs.length,
      documents: docs,
    });
  });

  app.get('/api/documents/:id', (req, res) => {
    const doc = getDocumentById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(doc);
  });

  // Dynamic Official PDF Generator & Stream Endpoint
  app.get(['/api/documents/:id/pdf', '/api/documents/:id/download'], (req, res) => {
    const doc = getDocumentById(req.params.id);
    if (!doc) {
      return res.status(404).send('Document not found in procurement registry');
    }
    const isDownload = req.path.includes('/download') || req.query.download === '1' || req.query.download === 'true';
    try {
      generateProcurementPdf(doc, res, isDownload);
    } catch (err: any) {
      res.status(500).send(`Error generating policy document PDF: ${err.message}`);
    }
  });

  // CSV Export Endpoint
  app.get('/api/documents/export/csv', (req, res) => {
    const csvData = generateCsvExport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="uk_procurement_registry_index.csv"');
    res.send(csvData);
  });

  // JSON Export Endpoint
  app.get('/api/documents/export/json', (req, res) => {
    const docs = getAllDocuments();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="uk_procurement_registry_catalog.json"');
    res.json({
      title: 'UK Public Procurement Document Registry',
      exportedAt: new Date().toISOString(),
      count: docs.length,
      documents: docs,
    });
  });

  // Scraper Engine Endpoints
  app.get('/api/scraper/status', (req, res) => {
    const status = getScraperStatus();
    res.json(status);
  });

  app.post('/api/scraper/sync', async (req, res) => {
    try {
      const result = await runScraperSync();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Scraper sync failed' });
    }
  });

  // Python Script Source Endpoint
  app.get('/api/scraper/python-script', (req, res) => {
    try {
      const scriptPath = path.join(process.cwd(), 'uk_procurement_scraper.py');
      if (fs.existsSync(scriptPath)) {
        const content = fs.readFileSync(scriptPath, 'utf-8');
        res.type('text/plain').send(content);
      } else {
        res.status(404).send('# Error: uk_procurement_scraper.py not found on server.');
      }
    } catch (err: any) {
      res.status(500).send(`# Server error: ${err.message}`);
    }
  });

  // AI Analysis Endpoints
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { docId, doc } = req.body;
      let targetDoc = doc;
      if (!targetDoc && docId) {
        targetDoc = getDocumentById(docId);
      }
      if (!targetDoc) {
        return res.status(400).json({ error: 'Document data or valid docId required' });
      }

      const analysis = await analyzeProcurementDocument(targetDoc);
      res.json({ analysis });
    } catch (error: any) {
      console.error('API /api/ai/analyze error:', error);
      res.status(500).json({ error: error.message || 'AI analysis failed' });
    }
  });

  app.post('/api/ai/search-grounded-query', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query string is required' });
      }

      const result = await performGroundedSearch(query);
      res.json(result);
    } catch (error: any) {
      console.error('API /api/ai/search-grounded-query error:', error);
      res.status(500).json({ error: error.message || 'Grounded search failed' });
    }
  });

  // Tender / RFP Compliance Matrix Endpoints (Flagship Feature)
  app.post('/api/tender/analyze', async (req, res) => {
    try {
      const requestData = req.body;
      if (!requestData || !requestData.tenderTitle || !requestData.tenderText) {
        return res.status(400).json({ error: 'tenderTitle and tenderText are required for compliance scanning.' });
      }

      const result = await analyzeTenderCompliance(requestData);
      res.json(result);
    } catch (error: any) {
      console.error('API /api/tender/analyze error:', error);
      res.status(500).json({ error: error.message || 'Tender compliance evaluation failed' });
    }
  });

  app.post('/api/tender/export-pdf', (req, res) => {
    try {
      const { result, whiteLabel } = req.body;
      if (!result || !result.tenderTitle) {
        return res.status(400).json({ error: 'Valid compliance result payload required' });
      }
      generateTenderAuditPdf(result, whiteLabel, res);
    } catch (error: any) {
      console.error('API /api/tender/export-pdf error:', error);
      res.status(500).json({ error: error.message || 'PDF export failed' });
    }
  });

  app.post('/api/tender/auto-fix', async (req, res) => {
    try {
      const { riskTitle, riskDescription, legalBasis, mitigationRecommendation, tenderText } = req.body;
      if (!riskTitle) {
        return res.status(400).json({ error: 'riskTitle is required for Auto-Fix suggestion.' });
      }

      const autoFixResult = await autoFixTenderComplianceError({
        riskTitle,
        riskDescription,
        legalBasis,
        mitigationRecommendation,
        tenderText: tenderText || '',
      });
      res.json(autoFixResult);
    } catch (error: any) {
      console.error('API /api/tender/auto-fix error:', error);
      res.status(500).json({ error: error.message || 'Auto-Fix generation failed' });
    }
  });

  // AI Quality & Grammar Inspector Endpoint
  app.post('/api/tender/validate-quality', async (req, res) => {
    try {
      const { text, fieldLabel, contextDescription } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'text parameter is required for quality inspection.' });
      }

      const validation = await validateTextQualityAndGrammar({
        text,
        fieldLabel,
        contextDescription,
      });

      res.json(validation);
    } catch (error: any) {
      console.error('API /api/tender/validate-quality error:', error);
      res.status(500).json({ error: error.message || 'Text quality validation failed' });
    }
  });

  // AI Document-Wide Quality & Grammar Audit Endpoint
  app.post('/api/tender/audit-full-document-quality', async (req, res) => {
    try {
      const { sections, tenderTitle } = req.body;
      if (!sections || !Array.isArray(sections)) {
        return res.status(400).json({ error: 'sections array is required for document audit.' });
      }

      const auditResult = await auditFullDocumentQuality({
        sections,
        tenderTitle,
      });

      res.json(auditResult);
    } catch (error: any) {
      console.error('API /api/tender/audit-full-document-quality error:', error);
      res.status(500).json({ error: error.message || 'Full document audit failed' });
    }
  });

  // Tender Document Ingestion & Smart Metadata Extraction
  app.post('/api/tender/parse-document', async (req, res) => {
    try {
      const { fileBase64, fileName, mimeType, rawText } = req.body;

      if (!fileBase64 && !rawText) {
        return res.status(400).json({ error: 'fileBase64 or rawText is required.' });
      }

      let buffer: Buffer;
      if (fileBase64) {
        // Strip data:*;base64, header if present
        const base64Clean = fileBase64.replace(/^data:[^;]+;base64,/, '');
        buffer = Buffer.from(base64Clean, 'base64');
      } else {
        buffer = Buffer.from(rawText, 'utf-8');
      }

      const extracted = await parseAndExtractTenderDocument(
        buffer,
        fileName || 'Uploaded_Tender_Document.pdf',
        mimeType
      );

      res.json(extracted);
    } catch (error: any) {
      console.error('API /api/tender/parse-document error:', error);
      res.status(500).json({ error: error.message || 'Document parsing and extraction failed' });
    }
  });

  // Flagship Bid Proposal & Response Package Generator
  app.post('/api/bid-proposal/generate', async (req, res) => {
    try {
      const requestData = req.body;
      if (!requestData || !requestData.tenderTitle || !requestData.companyProfile) {
        return res.status(400).json({ error: 'tenderTitle and companyProfile are required for proposal generation.' });
      }

      const proposal = await generateBidProposalPackage(requestData);
      res.json(proposal);
    } catch (error: any) {
      console.error('API /api/bid-proposal/generate error:', error);
      res.status(500).json({ error: error.message || 'Bid proposal package generation failed' });
    }
  });

  app.post('/api/bid-proposal/export-pdf', (req, res) => {
    try {
      const { proposal, whiteLabel } = req.body;
      if (!proposal || !proposal.tenderTitle || !proposal.sections) {
        return res.status(400).json({ error: 'Valid proposal payload required' });
      }
      generateBidProposalPdf(proposal, res, whiteLabel, true);
    } catch (error: any) {
      console.error('API /api/bid-proposal/export-pdf error:', error);
      res.status(500).json({ error: error.message || 'Proposal PDF generation failed' });
    }
  });

  // Supabase Database Connection & Secrets Management
  app.get('/api/database/config', (req, res) => {
    res.json(getSupabaseConfig());
  });

  app.post('/api/database/test-supabase', async (req, res) => {
    try {
      const { supabaseUrl, supabaseAnonKey } = req.body;
      if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(400).json({
          success: false,
          message: 'Both supabaseUrl and supabaseAnonKey are required to test connection.',
        });
      }
      const testResult = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
      res.json(testResult);
    } catch (error: any) {
      console.error('API /api/database/test-supabase error:', error);
      res.status(500).json({ success: false, message: error.message || 'Supabase connection test failed' });
    }
  });

  app.post('/api/database/save-supabase', (req, res) => {
    try {
      const { supabaseUrl, supabaseAnonKey } = req.body;
      if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(400).json({ error: 'supabaseUrl and supabaseAnonKey are required' });
      }
      setRuntimeSupabaseConfig(supabaseUrl, supabaseAnonKey);
      res.json({ success: true, message: 'Supabase configuration saved to active server runtime.' });
    } catch (error: any) {
      console.error('API /api/database/save-supabase error:', error);
      res.status(500).json({ error: error.message || 'Failed to save Supabase config' });
    }
  });


  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UK Procurement Registry server running on http://localhost:${PORT}`);
  });
}

startServer();
