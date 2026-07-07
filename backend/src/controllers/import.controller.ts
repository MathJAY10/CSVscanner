import type { Request, Response, NextFunction } from 'express';
import { CsvService } from '../services/csv.service';
import { BatchService } from '../services/batch.service';
import { AiService } from '../services/ai.service';
import { ValidationService } from '../services/validation.service';
import type { CRMLead, SkippedRecord, ImportResponse } from '../types/crm';

/**
 * Handles the CSV import request.
 */
export const importCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }
    
    // Check if it's a CSV based on mimetype or extension
    if (req.file.mimetype !== 'text/csv' && req.file.mimetype !== 'application/vnd.ms-excel' && !req.file.originalname.endsWith('.csv')) {
      res.status(400).json({ success: false, message: 'Invalid file format. Only CSV files are allowed.' });
      return;
    }

    if (req.file.size === 0) {
       res.status(400).json({ success: false, message: 'File is empty.' });
       return;
    }

    // Parse the CSV
    const rawData = await CsvService.parseCsv(req.file.buffer);

    if (rawData.length === 0) {
      res.status(400).json({ success: false, message: 'CSV contains no data rows.' });
      return;
    }

    // Phase 5: Batch Processing
    const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '20', 10);
    const batches = BatchService.chunkArray(rawData, BATCH_SIZE);

    // Phase 7: Gemini Integration
    const aiService = new AiService();
    
    // Phase 8: Validation and Merging
    const allImported: CRMLead[] = [];
    const allSkipped: SkippedRecord[] = [];

    // Note: Sequential batch processing to avoid rate limit spikes.
    for (const batch of batches) {
      // 1. Send to AI
      const aiOutput = await aiService.extractCrmFields(batch);
      
      // 2. Validate and apply business rules
      const { importedRecords, skippedRecords } = ValidationService.validateAndProcess(aiOutput);
      
      allImported.push(...importedRecords);
      allSkipped.push(...skippedRecords);
    }

    // 3. Construct final ImportResponse
    const responseData: ImportResponse = {
      success: true,
      data: {
        total_imported: allImported.length,
        total_skipped: allSkipped.length,
        imported_records: allImported,
        skipped_records: allSkipped
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};
