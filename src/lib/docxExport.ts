import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';

export interface DocxExportSection {
  id: string;
  title: string;
  subTitle?: string;
  content: string;
}

export interface DocxExportOptions {
  tenderTitle: string;
  companyName: string;
  presetName?: string;
  sections: DocxExportSection[];
}

export async function generateAndDownloadDocx(options: DocxExportOptions): Promise<void> {
  const { tenderTitle, companyName, sections, presetName } = options;

  // Build document sections
  const docParagraphs: (Paragraph | Table)[] = [];

  // Title & Metadata Block
  docParagraphs.push(
    new Paragraph({
      text: companyName.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: tenderTitle,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Document Specification: UK Statutory Tender Submission Dossier | Layout Preset: ${presetName || 'Swiss Modernist'}`,
          italics: true,
          size: 20,
          color: '555555',
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Metadata Table
  const table = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: 'Bidding Enterprise', style: 'Bold' })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: companyName })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: 'Statutory Baseline', style: 'Bold' })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: 'Procurement Act 2023 / PPN 06/20 / PPN 06/21' })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: 'Generated Date', style: 'Bold' })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: new Date().toLocaleDateString('en-GB') })],
          }),
        ],
      }),
    ],
  });

  docParagraphs.push(table);
  docParagraphs.push(new Paragraph({ spacing: { after: 400 } }));

  // Each content section
  for (const sec of sections) {
    docParagraphs.push(
      new Paragraph({
        text: sec.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 120 },
      })
    );

    if (sec.subTitle) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sec.subTitle,
              italics: true,
              color: '333333',
            }),
          ],
          spacing: { after: 160 },
        })
      );
    }

    // Split content paragraphs
    const paragraphs = sec.content.split('\n\n');
    for (const p of paragraphs) {
      if (!p.trim()) continue;
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: p.trim(),
              size: 22, // 11pt
            }),
          ],
          spacing: { after: 180, line: 360 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `${companyName.replace(/[^a-z0-9]/gi, '_')}_${tenderTitle.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}_Proposal.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
