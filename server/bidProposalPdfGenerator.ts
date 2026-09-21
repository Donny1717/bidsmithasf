import PDFDocument from 'pdfkit';
import { BidProposalPackage, WhiteLabelSettings } from '../src/types';

function cleanPdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[^\x00-\x7F\xA0-\xFF]/g, '') // remove non-latin1 garbled bytes
    .replace(/ã®K/g, '')
    .trim();
}

export function generateBidProposalPdf(
  pkg: BidProposalPackage,
  res: any,
  whiteLabel?: WhiteLabelSettings,
  forceDownload: boolean = true
) {
  const pdf = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true,
    info: {
      Title: `Tender Bid Proposal Response - ${pkg.tenderTitle}`,
      Author: pkg.companyProfile.companyName || 'BidSmith ASF Procurement Intelligence',
      Subject: 'Official UK Public Sector Tender Response & Compliance Dossier',
      CreationDate: new Date(),
    },
  });

  const safeFilename = `Tender_Bid_Proposal_${pkg.tenderTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35)}_${pkg.id}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const disposition = forceDownload ? 'attachment' : 'inline';
  res.setHeader('Content-Disposition', `${disposition}; filename="${safeFilename}"`);

  pdf.pipe(res);

  const accentColor = whiteLabel?.accentColor || '#1e3a8a'; // Deep Navy Blue
  const secondaryColor = '#0284c7'; // Sky-600

  // Cover / Header Banner
  pdf.rect(50, 45, 495, 6).fillColor(accentColor).fill();

  pdf
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor('#64748b')
    .text(
      whiteLabel?.reportHeaderTitle || 'OFFICIAL UK PUBLIC SECTOR TENDER SUBMISSION & COMPLIANCE DOSSIER',
      50,
      58,
      { characterSpacing: 1 }
    );

  pdf
    .fontSize(7)
    .font('Helvetica')
    .fillColor('#94a3b8')
    .text('GOV.UK CROWN COMMERCIAL SERVICE & PROCUREMENT ACT 2023 ALIGNED RESPONSE', 50, 70);

  // Proposal Title & Reference
  pdf
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(secondaryColor)
    .text(`PROPOSAL DOSSIER ID: ${pkg.id}`, 50, 88);

  pdf
    .fontSize(15)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(`Tender Response: ${pkg.tenderTitle}`, 50, 104, { width: 495, lineGap: 3 });

  // Contracting Authority & Bidder Box
  const metaY = pdf.y + 10;
  pdf
    .roundedRect(50, metaY, 495, 76, 6)
    .fillColor('#f8fafc')
    .fill()
    .strokeColor('#cbd5e1')
    .stroke();

  pdf
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Contracting Authority:', 62, metaY + 10)
    .font('Helvetica')
    .fillColor('#0f172a')
    .text(pkg.contractingAuthority, 170, metaY + 10, { width: 310 });

  pdf
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Tender Reference:', 62, metaY + 24)
    .font('Helvetica')
    .fillColor('#0f172a')
    .text(pkg.tenderReference || 'ITT Notice Spec', 170, metaY + 24, { width: 310 });

  pdf
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Submitting Bidder:', 62, metaY + 38)
    .font('Helvetica')
    .fillColor('#0f172a')
    .text(pkg.companyProfile.companyName || 'Bidder Organization', 170, metaY + 38, { width: 310 });

  pdf
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Win Probability Estimate:', 62, metaY + 52)
    .font('Helvetica-Bold')
    .fillColor('#059669')
    .text(`${pkg.winStrategy?.overallWinProbabilityScore || 88}% (Most Advantageous Tender)`, 170, metaY + 52, { width: 170 });

  pdf
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Evidence Gaps:', 345, metaY + 52)
    .font('Helvetica-Bold')
    .fillColor(pkg.criticalGapsCount > 0 ? '#dc2626' : '#059669')
    .text(`${pkg.totalIdentifiedGaps} Items (${pkg.criticalGapsCount} Critical)`, 420, metaY + 52, { width: 115 });

  pdf.y = metaY + 86;

  // Executive Win Strategy Box
  if (pkg.winStrategy && pkg.winStrategy.keyWinThemes?.length > 0) {
    if (pdf.y > 680) pdf.addPage();

    pdf
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(accentColor)
      .text('Executive Value Proposition & Core Win Themes', 50, pdf.y);
    pdf.moveDown(0.4);

    pkg.winStrategy.keyWinThemes.forEach((wt, idx) => {
      if (pdf.y > 710) pdf.addPage();

      pdf
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#1e293b')
        .text(`${idx + 1}. ${wt.theme}: `, { continued: true })
        .font('Helvetica')
        .fillColor('#334155')
        .text(wt.valueProposition, { width: 495, lineGap: 2 });

      pdf
        .fontSize(8)
        .font('Helvetica-Oblique')
        .fillColor('#64748b')
        .text(`• Proof Point: ${wt.proofPoint}`, { indent: 12, width: 483 });
      pdf.moveDown(0.4);
    });
    pdf.moveDown(0.6);
  }

  // Iterate Proposal Sections
  pkg.sections.forEach((sec) => {
    // Page break if near bottom
    if (pdf.y > 660) {
      pdf.addPage();
    } else {
      pdf.moveDown(0.8);
    }

    const secHeaderY = pdf.y;
    pdf
      .roundedRect(50, secHeaderY, 495, 22, 4)
      .fillColor('#0f172a')
      .fill();

    pdf
      .fontSize(9.5)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text(sec.title.toUpperCase(), 60, secHeaderY + 6, { width: 475 });

    pdf.y = secHeaderY + 28;

    pdf
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#0369a1')
      .text(`STATUTORY ALIGNMENT: ${sec.statutoryAlignment}`, 50, pdf.y);
    pdf.moveDown(0.5);

    // Clean markdown formatting
    const rawLines = sec.content.split('\n');
    rawLines.forEach((line) => {
      let trimmed = cleanPdfText(line);
      if (!trimmed) {
        pdf.moveDown(0.2);
        return;
      }

      // Ignore markdown table alignment lines like |:---:| or : : : :
      if (/^[:|\s\-\+]+$/.test(trimmed) || trimmed === ': : : :') {
        return;
      }

      // Format markdown table rows nicely
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean);
        trimmed = cells.join('  —  ');
      }

      // Clean headers and bold tags
      trimmed = trimmed
        .replace(/^#{1,6}\s*/, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/`(.*?)`/g, '$1');

      if (pdf.y > 720) {
        pdf.addPage();
      }

      if (trimmed.includes('[GAP:') || trimmed.includes('[INPUT REQUIRED:')) {
        pdf
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .fillColor('#b91c1c')
          .text(`  ⚠ ${trimmed}`, 50, pdf.y, { width: 495, lineGap: 2 });
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('& -')) {
        const cleanBullet = trimmed.replace(/^&\s*/, '');
        pdf
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor('#334155')
          .text(`   ${cleanBullet}`, 50, pdf.y, { width: 495, lineGap: 2 });
      } else {
        pdf
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor('#1e293b')
          .text(trimmed, 50, pdf.y, { width: 495, lineGap: 2 });
      }
      pdf.moveDown(0.25);
    });

    // Evaluator tip
    if (sec.evaluatorRubricScoreEstimate?.tipToReachMaxScore) {
      pdf.moveDown(0.4);
      const tipText = `Evaluator Scoring Tip (Target 5/5): ${sec.evaluatorRubricScoreEstimate.tipToReachMaxScore}`;

      pdf.fontSize(8).font('Helvetica-Bold');
      const textHeight = pdf.heightOfString(tipText, { width: 475 });
      const boxHeight = textHeight + 12;

      if (pdf.y + boxHeight > 730) {
        pdf.addPage();
      }

      const tipY = pdf.y;
      pdf
        .roundedRect(50, tipY, 495, boxHeight, 4)
        .fillColor('#f0fdf4')
        .fill()
        .strokeColor('#bbf7d0')
        .stroke();

      pdf
        .fillColor('#166534')
        .text(tipText, 60, tipY + 6, { width: 475, lineGap: 1.5 });

      pdf.y = tipY + boxHeight + 6;
    }
  });

  // Stamp page numbers on all buffered pages
  const range = pdf.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    pdf.switchToPage(i);

    // Temporarily save y position or draw explicitly without creating new pages
    pdf
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text(
        `BidSmith ASF Bid Proposal Suite | Reference: ${pkg.id} | Page ${i + 1} of ${range.count} | Official Tender Response`,
        50,
        770,
        { align: 'center', width: 495, lineBreak: false }
      );
  }

  pdf.end();
}

