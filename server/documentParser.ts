import * as pdfParseModule from 'pdf-parse';
import * as mammothModule from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import { generateContentWithFallback, parseGeminiJson } from './geminiResilience';

const mammoth: any = (mammothModule as any).default || mammothModule;

export interface ExtractedTenderMetadata {
  tenderTitle: string;
  contractingAuthority: string;
  sector: 'Central Government' | 'Local Authority' | 'NHS / Healthcare' | 'Defence' | 'Education' | 'Infrastructure' | 'Utilities';
  estimatedValueGbp: number;
  contractDurationYears: number;
  cleanedText: string;
  documentTypeDetected: string;
}

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

/**
 * Extracts raw text from Buffer based on mimeType and fileName
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<string> {
  const lowerName = fileName.toLowerCase();

  // 1. PDF Documents
  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    try {
      const PDFExport: any = (pdfParseModule as any).PDFParse || (pdfParseModule as any).default || pdfParseModule;
      if (typeof PDFExport === 'function') {
        try {
          const parser = new PDFExport({ data: buffer });
          if (parser && typeof parser.getText === 'function') {
            const data = await parser.getText();
            const extracted = data.text?.trim();
            if (typeof parser.destroy === 'function') {
              await parser.destroy().catch(() => {});
            }
            if (extracted && extracted.length > 5) {
              return extracted;
            }
          }
        } catch {
          // Alternative pdf-parse functional signature: pdf(buffer)
          const data = await PDFExport(buffer);
          if (data && data.text && data.text.trim().length > 5) {
            return data.text.trim();
          }
        }
      }
    } catch (err: any) {
      console.warn('pdf-parse failed:', err.message);
    }
  }

  // 2. Word Documents (.docx)
  if (lowerName.endsWith('.docx') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const extracted = result.value?.trim();
      if (extracted && extracted.length > 5) {
        return extracted;
      }
    } catch (err: any) {
      console.warn('mammoth docx parse failed:', err.message);
    }
  }

  // 3. Fallback: UTF-8 / Text
  const rawText = buffer.toString('utf-8');
  // Strip control binary characters if it was an unsupported binary format
  const sanitized = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').trim();
  return sanitized;
}

/**
 * Heuristic fallback parser when AI is unavailable or as a fast first pass
 */
function heuristicExtract(text: string, fileName: string): Partial<ExtractedTenderMetadata> {
  let tenderTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  let contractingAuthority = 'UK Public Authority';
  let sector: ExtractedTenderMetadata['sector'] = 'Central Government';
  let estimatedValueGbp = 5000000;
  let contractDurationYears = 3;

  const lower = text.toLowerCase();

  // Detect Sector & Authority
  if (lower.includes('nhs') || lower.includes('hospital') || lower.includes('trust') || lower.includes('health')) {
    sector = 'NHS / Healthcare';
    contractingAuthority = 'NHS Foundation Trust / Health Authority';
  } else if (lower.includes('council') || lower.includes('borough') || lower.includes('municipality')) {
    sector = 'Local Authority';
    contractingAuthority = 'Local Authority Council';
  } else if (lower.includes('ministry of defence') || lower.includes('mod') || lower.includes('military')) {
    sector = 'Defence';
    contractingAuthority = 'Ministry of Defence (MoD)';
  } else if (lower.includes('university') || lower.includes('school') || lower.includes('college') || lower.includes('academy')) {
    sector = 'Education';
    contractingAuthority = 'Higher Education / Academy Trust';
  } else if (lower.includes('highways') || lower.includes('network rail') || lower.includes('transport')) {
    sector = 'Infrastructure';
    contractingAuthority = 'Department for Transport / National Agency';
  } else if (lower.includes('crown commercial service') || lower.includes('ccs') || lower.includes('cabinet office')) {
    sector = 'Central Government';
    contractingAuthority = 'Crown Commercial Service (Cabinet Office)';
  }

  // Detect Estimated Value (e.g. £8.5m, £12,000,000, £500k, 10 million gbp)
  const valMatchMillion = text.match(/(?:£|GBP|\b)\s*([\d,.]+)\s*(?:million|m)\b/i);
  if (valMatchMillion) {
    const num = parseFloat(valMatchMillion[1].replace(/,/g, ''));
    if (!isNaN(num)) {
      estimatedValueGbp = Math.round(num * 1000000);
    }
  } else {
    const valMatchExact = text.match(/£\s*([\d]{1,3}(?:,\d{3})+|\d+)/);
    if (valMatchExact) {
      const num = parseInt(valMatchExact[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num > 10000) {
        estimatedValueGbp = num;
      }
    }
  }

  // Detect Contract Duration (e.g. 3 years, 48 months, 24 months, 5-year)
  const durationYearMatch = text.match(/(\d+)\s*(?:-|–|\s)?(?:year|yr|years)/i);
  if (durationYearMatch) {
    const yrs = parseInt(durationYearMatch[1], 10);
    if (yrs >= 1 && yrs <= 25) {
      contractDurationYears = yrs;
    }
  } else {
    const durationMonthMatch = text.match(/(\d+)\s*(?:-|–|\s)?(?:month|months)/i);
    if (durationMonthMatch) {
      const months = parseInt(durationMonthMatch[1], 10);
      if (months >= 6) {
        contractDurationYears = Math.round(months / 12) || 1;
      }
    }
  }

  // Detect Title from First Lines
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 5);
  if (lines.length > 0) {
    const firstGoodLine = lines.slice(0, 5).find(l => !l.startsWith('%') && !l.includes('<<') && l.length < 120);
    if (firstGoodLine) {
      tenderTitle = firstGoodLine.replace(/^#+\s*/, '');
    }
  }

  return {
    tenderTitle,
    contractingAuthority,
    sector,
    estimatedValueGbp,
    contractDurationYears,
  };
}

/**
 * Parses uploaded document buffer, extracts readable text, and extracts all 4 key metadata fields.
 */
export async function parseAndExtractTenderDocument(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<ExtractedTenderMetadata> {
  // 1. Extract Plain Text
  const rawText = await extractTextFromBuffer(buffer, fileName, mimeType);

  // If text is too short or binary garbage, handle gracefully
  let cleanedText = rawText.trim();
  if (!cleanedText || cleanedText.length < 10) {
    cleanedText = `[Uploaded Document: ${fileName}]\nSpecification text could not be extracted in plain text. Please verify the document format.`;
  }

  // 2. Perform Heuristic Extraction
  const heuristic = heuristicExtract(cleanedText, fileName);

  const fallbackResult: ExtractedTenderMetadata = {
    tenderTitle: heuristic.tenderTitle || fileName.replace(/\.[^/.]+$/, ''),
    contractingAuthority: heuristic.contractingAuthority || 'UK Public Authority',
    sector: heuristic.sector || 'Central Government',
    estimatedValueGbp: heuristic.estimatedValueGbp || 5000000,
    contractDurationYears: heuristic.contractDurationYears || 3,
    cleanedText,
    documentTypeDetected: fileName.split('.').pop()?.toUpperCase() || 'DOCUMENT',
  };

  // 3. Try Gemini Smart Extraction for 100% accuracy on real documents
  const ai = getAiClient();
  if (!ai) {
    return fallbackResult;
  }

  try {
    const sampleText = cleanedText.slice(0, 12000); // Send first 12,000 chars of tender text
    const prompt = `You are a UK public procurement specialist system.
Analyze the following uploaded tender / ITT / RFP specification document text:

FILENAME: ${fileName}
DOCUMENT CONTENT:
"""
${sampleText}
"""

Extract the exact procurement metadata. Respond ONLY with a valid JSON object matching this schema:
{
  "tenderTitle": "Exact or inferred title of the procurement/framework",
  "contractingAuthority": "Name of the UK Contracting Authority / Buyer / NHS Trust / Council / Ministry",
  "sector": "Central Government",
  "estimatedValueGbp": 8500000,
  "contractDurationYears": 4
}

Field Guidelines:
- sector: Must be one of "Central Government", "Local Authority", "NHS / Healthcare", "Defence", "Education", "Infrastructure", or "Utilities".
- estimatedValueGbp: Plain integer in GBP representing total contract value. Return 5000000 if not stated.
- contractDurationYears: Plain integer representing contract duration in years. Return 3 if not stated.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseGeminiJson<any>(response.text);
    if (parsed && typeof parsed === 'object') {
      return {
        tenderTitle: parsed.tenderTitle || fallbackResult.tenderTitle,
        contractingAuthority: parsed.contractingAuthority || fallbackResult.contractingAuthority,
        sector: parsed.sector || fallbackResult.sector,
        estimatedValueGbp: typeof parsed.estimatedValueGbp === 'number' ? parsed.estimatedValueGbp : fallbackResult.estimatedValueGbp,
        contractDurationYears: typeof parsed.contractDurationYears === 'number' ? parsed.contractDurationYears : fallbackResult.contractDurationYears,
        cleanedText,
        documentTypeDetected: fileName.split('.').pop()?.toUpperCase() || 'DOCUMENT',
      };
    }
  } catch (err: any) {
    console.warn('Gemini extraction fallback:', err.message);
  }

  return fallbackResult;
}
