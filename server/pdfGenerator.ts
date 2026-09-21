import PDFDocument from 'pdfkit';
import { ProcurementDoc } from '../src/types';

export function generateProcurementPdf(doc: ProcurementDoc, res: any, forceDownload: boolean = false) {
  const pdf = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true,
    info: {
      Title: `${doc.reference}: ${doc.title}`,
      Author: 'UK Crown Commercial Service / Cabinet Office Registry',
      Subject: `${doc.categoryName} - Statutory Compliance & Governance`,
      Keywords: doc.tags.join(', '),
      CreationDate: new Date(doc.publicationDate || Date.now()),
    },
  });

  const filename = `${doc.reference.replace(/[^a-zA-Z0-9_-]/g, '_')}_Official_Policy_Brief.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const disposition = forceDownload ? 'attachment' : 'inline';
  res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);

  pdf.pipe(res);

  // Top Header Banner
  pdf
    .rect(50, 45, 495, 4)
    .fillColor('#0284c7') // Tailwind Sky-600
    .fill();

  pdf
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor('#64748b')
    .text('GOV.UK CROWN COMMERCIAL SERVICE & CABINET OFFICE REGISTRY', 50, 56, {
      characterSpacing: 1,
    });

  pdf
    .fontSize(7)
    .font('Helvetica')
    .fillColor('#94a3b8')
    .text(`OFFICIAL PUBLIC PROCUREMENT ARCHIVE | VERIFIED RECORD`, 50, 68);

  // Document Reference & Status Badge
  pdf
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#0369a1')
    .text(doc.reference.toUpperCase(), 50, 88);

  const statusText = doc.status === 'active' ? 'STATUS: ACTIVE STATUTORY GUIDANCE' : 'STATUS: SUPERSEDED DOCUMENT';
  const statusColor = doc.status === 'active' ? '#059669' : '#d97706';

  pdf
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(statusColor)
    .text(statusText, 300, 90, { align: 'right' });

  // Main Title
  pdf
    .fontSize(15)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(doc.title, 50, 106, { width: 495, lineGap: 3 });

  // Metadata Grid Box
  const metaY = pdf.y + 10;
  pdf
    .roundedRect(50, metaY, 495, 68, 6)
    .fillColor('#f8fafc')
    .fill()
    .strokeColor('#e2e8f0')
    .stroke();

  pdf
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Category:', 62, metaY + 10)
    .font('Helvetica')
    .fillColor('#0f172a')
    .text(doc.categoryName, 120, metaY + 10, { width: 190 });

  pdf
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Publication:', 62, metaY + 24)
    .font('Helvetica')
    .fillColor('#0f172a')
    .text(doc.publicationDate, 120, metaY + 24, { width: 190 });

  pdf
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Legislation:', 62, metaY + 38)
    .font('Helvetica')
    .fillColor('#0f172a')
    .text(doc.applicableLegislation, 120, metaY + 38, { width: 190 });

  pdf
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Threshold:', 62, metaY + 52)
    .font('Helvetica')
    .fillColor('#0f172a')
    .text(doc.thresholdRelevance, 120, metaY + 52, { width: 190 });

  pdf
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Priority:', 320, metaY + 10)
    .font('Helvetica-Bold')
    .fillColor(doc.compliancePriority === 'High' ? '#dc2626' : '#2563eb')
    .text(`${doc.compliancePriority} Statutory Enforcement`, 375, metaY + 10, { width: 160 });

  pdf
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('SHA-256:', 320, metaY + 24)
    .font('Helvetica')
    .fillColor('#64748b')
    .text(doc.sha256.substring(0, 18) + '...', 375, metaY + 24, { width: 160 });

  pdf
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Gov.uk URL:', 320, metaY + 38)
    .font('Helvetica')
    .fillColor('#2563eb')
    .text('gov.uk publication archive', 375, metaY + 38, {
      link: doc.govukUrl,
      underline: true,
      width: 160,
    });

  pdf
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Target Scope:', 320, metaY + 52)
    .font('Helvetica')
    .fillColor('#0f172a')
    .text(doc.targetAudience.slice(0, 2).join(', '), 385, metaY + 52, { width: 150 });

  // Executive Summary Section
  pdf.y = metaY + 80;

  pdf
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text('EXECUTIVE POLICY SUMMARY', 50, pdf.y);

  pdf
    .rect(50, pdf.y + 2, 495, 1)
    .fillColor('#cbd5e1')
    .fill();

  pdf.moveDown(0.5);
  pdf
    .fontSize(8.5)
    .font('Helvetica')
    .fillColor('#334155')
    .text(doc.summary, 50, pdf.y, { width: 495, align: 'justify', lineGap: 3 });

  // Key Statutory Obligations & Compliance Mandates
  pdf.moveDown(1);
  if (pdf.y > 680) pdf.addPage();

  pdf
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text('MANDATORY STATUTORY OBLIGATIONS & ACTION CHECKLIST', 50, pdf.y);

  pdf
    .rect(50, pdf.y + 2, 495, 1)
    .fillColor('#cbd5e1')
    .fill();

  pdf.moveDown(0.6);

  doc.keyObligations.forEach((obligation, index) => {
    if (pdf.y > 720) pdf.addPage();

    const startY = pdf.y;
    pdf
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor('#0284c7')
      .text(`[${index + 1}]`, 50, startY);

    pdf
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor('#1e293b')
      .text(obligation, 70, startY, { width: 475, lineGap: 2 });

    pdf.moveDown(0.35);
  });

  // Stakeholder Impact Analysis
  pdf.moveDown(0.8);
  if (pdf.y > 680) pdf.addPage();

  pdf
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text('STAKEHOLDER OPERATIONAL IMPACT', 50, pdf.y);

  pdf
    .rect(50, pdf.y + 2, 495, 1)
    .fillColor('#cbd5e1')
    .fill();

  pdf.moveDown(0.6);

  // Contracting Authority Impact Box
  pdf
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .fillColor('#0369a1')
    .text('For Public Sector Buyers & Contracting Authorities:', 50, pdf.y);

  pdf
    .fontSize(8.5)
    .font('Helvetica')
    .fillColor('#334155')
    .text(doc.contractingAuthorityImpact, 50, pdf.y, { width: 495, lineGap: 2 });

  pdf.moveDown(0.6);

  // Supplier Impact Box
  if (pdf.y > 710) pdf.addPage();

  pdf
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .fillColor('#0d9488')
    .text('For Suppliers, Bidders & Economic Operators:', 50, pdf.y);

  pdf
    .fontSize(8.5)
    .font('Helvetica')
    .fillColor('#334155')
    .text(doc.supplierImpact, 50, pdf.y, { width: 495, lineGap: 2 });

  // Verification & Crown Copyright Footer on buffered pages
  const range = pdf.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    pdf.switchToPage(i);
    pdf.fontSize(7.5).font('Helvetica').fillColor('#94a3b8');
    pdf.text(
      `Cryptographic Verification SHA-256: ${doc.sha256}`,
      50,
      765,
      { align: 'center', width: 495 }
    );

    pdf.text(
      `© Crown Copyright 2024–2026. Sourced from GOV.UK Crown Commercial Service under Open Government Licence v3.0. | Page ${i + 1} of ${range.count}`,
      50,
      777,
      { align: 'center', width: 495 }
    );
  }

  pdf.end();
}

export function generateTenderAuditPdf(result: any, whiteLabel: any, res: any) {
  const pdf = new PDFDocument({
    size: 'A4',
    margin: 45,
    bufferPages: true,
    info: {
      Title: `Tender Compliance Audit: ${result.tenderTitle}`,
      Author: whiteLabel?.companyName || 'UK Procurement Intelligence Suite',
      Subject: 'Statutory RFP/ITT Tender Compliance Assessment',
      CreationDate: new Date(),
    },
  });

  const filename = `Tender_Compliance_Audit_${result.id || 'Report'}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  pdf.pipe(res);

  // Top Header Banner
  pdf.rect(45, 40, 505, 5).fillColor(whiteLabel?.accentColor || '#0284c7').fill();

  pdf
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor('#64748b')
    .text((whiteLabel?.companyName || 'UK PROCUREMENT INTELLIGENCE SAAS').toUpperCase(), 45, 52, {
      characterSpacing: 1,
    });

  pdf
    .fontSize(7)
    .font('Helvetica')
    .fillColor('#94a3b8')
    .text(`STATUTORY COMPLIANCE MATRIX • PROCUREMENT ACT 2023 & PPNS • REF: ${result.id}`, 45, 63);

  // Title & Grade Badge
  pdf
    .fontSize(15)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(result.tenderTitle, 45, 82, { width: 360, lineGap: 2 });

  const scoreColor = result.readinessScore >= 80 ? '#059669' : result.readinessScore >= 60 ? '#d97706' : '#dc2626';

  pdf
    .roundedRect(420, 80, 130, 48, 6)
    .fillColor(scoreColor)
    .fill();

  pdf
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor('#ffffff')
    .text(`${result.readinessScore}%`, 420, 87, { width: 130, align: 'center' });

  pdf
    .fontSize(7)
    .font('Helvetica-Bold')
    .fillColor('#ffffff')
    .text(result.complianceGrade, 420, 107, { width: 130, align: 'center' });

  // Summary box
  pdf.y = Math.max(pdf.y + 12, 140);
  const summaryY = pdf.y;

  pdf.fontSize(8).font('Helvetica');
  const summaryTextHeight = pdf.heightOfString(result.executiveSummary || '', { width: 485 });
  const summaryBoxHeight = Math.max(summaryTextHeight + 28, 60);

  pdf
    .roundedRect(45, summaryY, 505, summaryBoxHeight, 6)
    .fillColor('#f8fafc')
    .fill()
    .strokeColor('#e2e8f0')
    .stroke();

  pdf
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text('EXECUTIVE STATUTORY SUMMARY', 55, summaryY + 8);

  pdf
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#334155')
    .text(result.executiveSummary, 55, summaryY + 22, { width: 485, lineGap: 2 });

  pdf.y = summaryY + summaryBoxHeight + 14;

  // Critical Risks
  if (pdf.y > 680) pdf.addPage();

  pdf
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text('CRITICAL COMPLIANCE RISKS & DISQUALIFICATION TRIGGERS', 45, pdf.y);

  pdf.moveDown(0.5);

  if (result.criticalRisks && result.criticalRisks.length > 0) {
    result.criticalRisks.forEach((risk: any) => {
      const riskText = `${risk.description} — Legal Basis: ${risk.legalBasis}`;
      pdf.fontSize(7.5).font('Helvetica');
      const textH = pdf.heightOfString(riskText, { width: 485 });
      const boxH = textH + 24;

      if (pdf.y + boxH > 730) pdf.addPage();

      const curY = pdf.y;
      pdf
        .roundedRect(45, curY, 505, boxH, 4)
        .fillColor(risk.severity === 'Critical' ? '#fef2f2' : '#fffbeb')
        .fill()
        .strokeColor(risk.severity === 'Critical' ? '#fca5a5' : '#fde68a')
        .stroke();

      pdf
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor(risk.severity === 'Critical' ? '#991b1b' : '#92400e')
        .text(`[${risk.severity.toUpperCase()}] ${risk.title}`, 55, curY + 6, { width: 485 });

      pdf
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#334155')
        .text(riskText, 55, curY + 18, { width: 485, lineGap: 1.5 });

      pdf.y = curY + boxH + 8;
    });
  }

  // Matched Regulations Table
  if (pdf.y > 680) pdf.addPage();
  pdf.moveDown(0.5);

  pdf
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text('GOVERNING LEGISLATION & STATUTORY PPNS IDENTIFIED', 45, pdf.y);

  pdf.moveDown(0.5);

  if (result.matchedRegulations && result.matchedRegulations.length > 0) {
    result.matchedRegulations.forEach((reg: any) => {
      if (pdf.y > 720) pdf.addPage();

      const startY = pdf.y;
      pdf
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#0284c7')
        .text(reg.docReference, 45, startY);

      pdf
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(`: ${reg.docTitle}`, 120, startY, { width: 430 });

      pdf
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(`• Relevance: ${reg.relevanceReason}`, 55, startY + 11, { width: 495, lineGap: 1.5 });

      pdf.y = Math.max(pdf.y, startY + 25);
      pdf.moveDown(0.3);
    });
  }

  // Mandatory Action Checklist
  if (pdf.y > 670) pdf.addPage();
  pdf.moveDown(0.5);

  pdf
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text('MANDATORY BIDDER / AUTHORITY ACTION CHECKLIST', 45, pdf.y);

  pdf.moveDown(0.5);

  if (result.mandatoryChecklist && result.mandatoryChecklist.length > 0) {
    result.mandatoryChecklist.forEach((item: any, idx: number) => {
      if (pdf.y > 720) pdf.addPage();

      const startY = pdf.y;
      pdf
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(`[${idx + 1}] (${item.priority}) ${item.action}`, 45, startY, { width: 505 });

      pdf
        .fontSize(7)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(`Guidance: ${item.guidanceReference} | Required Evidence: ${item.requiredEvidence}`, 55, startY + 11, { width: 495 });

      pdf.y = startY + 24;
    });
  }

  // Stamp Footer on buffered pages
  const range = pdf.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    pdf.switchToPage(i);
    pdf.fontSize(7).font('Helvetica').fillColor('#94a3b8');
    pdf.text(
      `Generated by ${whiteLabel?.companyName || 'UK Procurement Compliance Suite'}. Grounded strictly in GOV.UK Crown Commercial Service Policy Database. | Page ${i + 1} of ${range.count}`,
      45,
      770,
      { align: 'center', width: 505 }
    );
  }

  pdf.end();
}


