import { GoogleGenAI } from '@google/genai';
import type { AIExtractionOutput } from '../types/crm';
import { buildPrompt } from '../prompts/crm-extraction.prompt';

export class AiError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'AiError';
  }
}

export class AiService {
  private ai: GoogleGenAI;
  // Gemini 2.5 Flash is highly capable for JSON extraction and faster/cheaper for batch processing.
  private readonly MODEL_NAME = 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AiError('GEMINI_API_KEY environment variable is missing.');
    }
    
    // Initialize the official Google Gen AI SDK
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Processes a batch of raw CSV rows and extracts CRM fields using Gemini.
   * @param records Array of raw CSV row objects.
   * @returns Unvalidated AIExtractionOutput containing extracted_records.
   */
  public async extractCrmFields(records: Record<string, string>[]): Promise<AIExtractionOutput> {
    if (!records || records.length === 0) {
      return { extracted_records: [] };
    }

    const promptText = buildPrompt(records);

    try {
      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: promptText,
        config: {
          // Enforce JSON output format
          responseMimeType: 'application/json',
          // Optional tuning for extraction
          temperature: 0.1,
        }
      });

      const responseText = response.text;
      
      if (!responseText) {
        throw new AiError('Received empty response from Gemini API.');
      }

      // The response should be strictly JSON due to responseMimeType
      let parsedOutput: AIExtractionOutput;
      try {
        parsedOutput = JSON.parse(responseText) as AIExtractionOutput;
      } catch (parseError) {
        throw new AiError('Failed to parse Gemini response as JSON.', parseError);
      }
      
      // Ensure the structure loosely matches expectations before handing off to Phase 8
      if (!parsedOutput || !Array.isArray(parsedOutput.extracted_records)) {
        throw new AiError('Gemini response JSON does not contain extracted_records array.');
      }

      return parsedOutput;

    } catch (error: any) {
      // Handle known API errors or rate limits
      // Re-throw as a typed AiError so the controller/batch-manager can handle it
      if (error instanceof AiError) {
        throw error; // Already wrapped
      }
      
      const errorMessage = error?.message || 'Unknown network or API error occurred.';
      
      if (errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('429')) {
        throw new AiError(`Gemini API rate limit exceeded: ${errorMessage}`, error);
      }
      
      throw new AiError(`Gemini API request failed: ${errorMessage}`, error);
    }
  }
}
