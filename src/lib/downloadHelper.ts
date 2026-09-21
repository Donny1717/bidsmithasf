import { ProcurementDoc } from '../types';

/**
 * Universal safe blob download utility for web apps and iframe environments
 */
export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Downloads the official generated PDF for a policy document
 */
export async function downloadPolicyPdf(doc: ProcurementDoc): Promise<void> {
  const cleanRef = doc.reference.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanRef}_Official_Policy_Brief.pdf`;

  try {
    const response = await fetch(`/api/documents/${doc.id}/download?download=1`);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }
    const blob = await response.blob();
    await downloadBlob(blob, filename);
  } catch (error) {
    console.error('Download error:', error);
    // Fallback: direct window location or anchor
    const fallbackAnchor = document.createElement('a');
    fallbackAnchor.href = `/api/documents/${doc.id}/download?download=1`;
    fallbackAnchor.download = filename;
    fallbackAnchor.target = '_blank';
    fallbackAnchor.click();
  }
}

/**
 * Downloads a text/JSON string as a file
 */
export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}
