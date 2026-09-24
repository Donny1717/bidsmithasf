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
import {
  requireApiKey,
  generalRateLimiter,
  aiRateLimiter,
} from './server/auth';
import {
  verifyBearerToken,
  extractBearerToken,
} from './server/identity';
import {
  requirePermission,
  ROLE_LABELS,
} from './server/rbac';
import { POLICY_PROFILES, selectPolicyProfile } from './server/policyRegistry';
import { recordAudit, queryAudit, auditStats } from './server/audit';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ── Security middleware (Phase 1/2 hardening) ──────────────────────────────
  // Trust the first proxy hop so req.ip reflects the real client behind
  // Cloud Run / reverse proxies, keeping rate-limit buckets accurate.
  app.set('trust proxy', 1);

  // General rate limiting across the API surface.
  app.use('/api', generalRateLimiter);

  // API-key gate + tighter limit for expensive AI/LLM-backed routes.
  // Health check and read-only document registry stay open for now.
  app.use('/api/ai', requireApiKey, aiRateLimiter);
  app.use('/api/tender', requireApiKey, aiRateLimiter);
  app.use('/api/bid-proposal', requireApiKey, aiRateLimiter);

  // Admin/privileged routes: API key required, general limit.
  app.use('/api/database', requireApiKey);
  app.use('/api/scraper/sync', requireApiKey);

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
      return res.status(404).json({ 
error: 'Document not found' });
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
      i
f (fs.existsSync(scriptPath)) {
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
      res.status(500).json({ err
or: error.message || 'Text quality validation failed' });
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
      if (!requestData || !requestData.tenderT
itle || !requestData.companyProfile) {
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
      if (!supabaseUrl || !su
pabaseAnonKey) {
        return res.status(400).json({ error: 'supabaseUrl and supabaseAnonKey are required' });
      }
      setRuntimeSupabaseConfig(supabaseUrl, supabaseAnonKey);
      res.json({ success: true, message: 'Supabase configuration saved to active server runtime.' });
    } catch (error: any) {
      console.error('API /api/database/save-supabase error:', error);
      res.status(500).json({ error: error.message || 'Failed to save Supabase config' });
    }
  });


  // ── Phase 1 Foundation (BS-NV-P1) ─────────────────────────────────────────
  // Session: exchange a verified identity token for principal + memberships.
  app.post('/api/foundation/session', async (req: any, res) => {
    try {
      const token = extractBearerToken(req);
      if (!token) {
        return res.status(401).json({ error: 'Authentication required.' });
      }
      const principal = await verifyBearerToken(token);
      const { resolveMemberships } = await import('./server/rbac');
      const memberships = await resolveMemberships(principal);
      await recordAudit({
        actorId: principal.subject,
        actorEmail: principal.email,
        action: 'session.create',
        targetType: 'session',
        result: 'success',
        detail: { method: principal.method },
      });
      res.json({
        principal: {
          subject: principal.subject,
          email: principal.email,
          displayName: principal.displayName,
          method: principal.method,
          mfaVerified: principal.mfaVerified,
        },
        memberships: memberships.map((m) => ({
          organisationId: m.organisationId,
          organisationName: m.organisationName,
          workspaceId: m.workspaceId,
          workspaceName: m.workspaceName,
          role: m.role,
          roleLabel: ROLE_LABELS[m.role],
        })),
      });
    } catch (err: any) {
      try {
        await recordAudit({
          actorId: 'unknown',
          action: 'session.create',
          targetType: 'session',
          result: 'denied',
          detail: { reason: err?.message || 'verification failed' },
        });
      } catch {
        /* audit must not block the denial response */
      }
      res.status(401).json({ error: 'Sign-in failed: ' + (err?.message || 'invalid identity') });
    }
  });

  // Policy registry: versioned profiles with effective dates.
  app.get('/api/foundation/policies', requirePermission('policy.read'), (req: any, res) => {
    res.json({ profiles: POLICY_PROFILES });
  });

  app.get('/api/foundation/policies/select', requirePermission('policy.read'), (req: any, res) => {
    const commencement = String(req.query.commencementDate || '');
    try {
      const profile = selectPolicyProfile(commencement);
      res.json({ profile });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Projects: a permitted state change for the Phase 1 exit demo.
  app.get('/api/foundation/projects', requirePermission('project.read'), async (req: any, res) => {
    const workspaceId = req.memberships?.[0]?.workspaceId ?? null;
    await recordAudit({
      actorId: req.principal!.subject,
      actorEmail: req.principal!.email,
      action: 'project.list',
      targetType: 'project',
      workspaceId,
      result: 'success',
    });
    res.json({ projects: [] }); // Phase 1 skeleton: list API wired, storage next phase.
  });

  app.post('/api/foundation/projects', requirePermission('project.create'), async (req: any, res) => {
    const { title, commencementDate } = req.body || {};
    const workspaceId = req.memberships?.[0]?.workspaceId ?? null;
    if (!title || typeof title !== 'string') {
      await recordAudit({
        actorId: req.principal!.subject,
        actorEmail: req.principal!.email,
        action: 'project.create',
        targetType: 'project',
        workspaceId,
        result: 'denied',
        detail: { reason: 'title required' },
      });
      return res.status(400).json({ error: 'title is required.' });
    }
    let policyProfileId: string | null = null;
    if (commencementDate) {
      try {
        policyProfileId = selectPolicyProfile(String(commencementDate)).id;
      } catch (err: any) {
        return res.status(400).json({ error: err.message });
      }
    }
    const eventId = await recordAudit({
      actorId: req.principal!.subject,
      actorEmail: req.principal!.email,
      action: 'project.create',
      targetType: 'project',
      targetId: title,
      workspaceId,
      result: 'success',
      detail: { title, commencementDate, policyProfileId },
    });
    res.status(201).json({
      project: { title, commencementDate: commencementDate ?? null, policyProfileId, status: 'active' },
      auditEventId: eventId.eventId,
    });
  });

  // Audit viewer: read the immutable ledger.
  app.get('/api/foundation/audit', requirePermission('audit.read'), async (req: any, res) => {
    const limit = Number(req.query.limit) || 200;
    const list = queryAudit({ limit });
    await recordAudit({
      actorId: req.principal!.subject,
      actorEmail: req.principal!.email,
      action: 'audit.view',
      targetType: 'audit_event',
      workspaceId: null,
      result: 'success',
      detail: { count: list.length },
    });
    res.json({ events: list, stats: auditStats() });
  });

  // Version endpoint (Phase 1 engineering controls).
  app.get('/api/version', (req, res) => {
    res.json({
      service: 'bidsmith-asf',
      phase: '1-foundation',
      version: process.env.APP_VERSION || '0.0.0-dev',
      buildTime: process.env.BUILD_TIME || null,
    });
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
