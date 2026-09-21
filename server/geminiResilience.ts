import { GoogleGenAI } from '@google/genai';
import { jsonrepair } from 'jsonrepair';

// Verified active Gemini models per standard SDK specifications
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

/**
 * Sanitizes common LLM output artifacts like parenthetical inline descriptions,
 * e.g., `8500000 (number in GBP...)` -> `8500000` or `"readinessScore": 85 (0 to 100...)` -> `"readinessScore": 85`
 */
function sanitizeLlmJsonText(str: string): string {
  return str
    // Remove inline parenthetical comments attached to numbers or booleans: 8500000 (number in GBP) -> 8500000
    .replace(/(\d+|true|false|null)\s*\([^)]*\)/gi, '$1')
    // Remove type annotations attached to numbers or booleans: : number ... -> : 85
    .replace(/:\s*number\b[^\n,}]*/gi, ': 85')
    .replace(/:\s*boolean\b[^\n,}]*/gi, ': true')
    // Remove trailing commas before closing braces/brackets
    .replace(/,\s*([}\]])/g, '$1');
}

/**
 * Safely parses JSON from Gemini responses, handling markdown code blocks,
 * stray formatting, or unescaped characters gracefully.
 */
export function parseGeminiJson<T>(rawText: string | undefined | null, fallbackValue?: T): T {
  if (!rawText || typeof rawText !== 'string') {
    if (fallbackValue !== undefined) return fallbackValue;
    throw new Error('Empty response from Gemini');
  }

  const cleaned = rawText.trim();

  // Attempt 1: Direct JSON parse
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Continue
  }

  // Attempt 2: Extract from markdown code block ```json ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const targetText = codeBlockMatch ? codeBlockMatch[1].trim() : cleaned;

  try {
    return JSON.parse(targetText) as T;
  } catch {
    // Continue
  }

  // Attempt 3: Try jsonrepair on targetText or sanitized targetText
  try {
    const repaired = jsonrepair(sanitizeLlmJsonText(targetText));
    return JSON.parse(repaired) as T;
  } catch {
    // Continue
  }

  // Attempt 4: Extract outermost JSON object {...} or array [...] and repair
  const jsonMatch = targetText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/) || cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch && jsonMatch[0]) {
    const matchedStr = jsonMatch[0].trim();
    try {
      return JSON.parse(matchedStr) as T;
    } catch {
      try {
        const repaired = jsonrepair(sanitizeLlmJsonText(matchedStr));
        return JSON.parse(repaired) as T;
      } catch (innerErr) {
        if (fallbackValue !== undefined) return fallbackValue;
        throw new Error(`Failed to parse extracted JSON block: ${(innerErr as Error).message}`);
      }
    }
  }

  if (fallbackValue !== undefined) return fallbackValue;
  throw new Error(`Could not parse JSON from Gemini text: ${cleaned.slice(0, 150)}...`);
}

/**
 * Executes a Gemini generateContent request with multi-model fallback and exponential backoff retry.
 * Gracefully handles 503 (high demand) and 429 (quota) by cascading across active Flash & Lite models.
 */
export async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    preferredModel?: string;
  }
): Promise<any> {
  const preferred = params.preferredModel || 'gemini-3.8-flash';
  const models = [
    preferred,
    ...CANDIDATE_MODELS.filter((m) => m !== preferred),
  ];

  let lastError: any = null;

  for (let mIdx = 0; mIdx < models.length; mIdx++) {
    const model = models[mIdx];
    const maxAttempts = mIdx === 0 ? 2 : 1; // 2 attempts for preferred, 1 for fallbacks

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const isHighDemand = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand');
        const isQuota = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
        const isToolOrParamError = msg.includes('INVALID_ARGUMENT') || msg.includes('not supported') || msg.includes('400');

        // Handle tool/param or quota issues related to search grounding tools
        if ((isToolOrParamError || isQuota) && params.config?.tools) {
          try {
            const cleanConfig = { ...params.config };
            delete cleanConfig.tools;
            const fallbackResponse = await ai.models.generateContent({
              model,
              contents: params.contents,
              config: cleanConfig,
            });
            return fallbackResponse;
          } catch (retryErr: any) {
            lastError = retryErr;
          }
        }

        if (isQuota) {
          // Immediately try next candidate model
          break;
        }

        if (isHighDemand) {
          if (attempt === 1 && maxAttempts > 1) {
            // Jittered backoff before 2nd attempt on same model
            await new Promise((r) => setTimeout(r, 400 + Math.floor(Math.random() * 300)));
          } else {
            // Move to next candidate model
            break;
          }
        } else {
          // Other error, cascade to next candidate model
          break;
        }
      }
    }
  }

  throw lastError;
}

