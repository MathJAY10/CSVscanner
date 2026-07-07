import { z } from 'zod';
import type { CRMLead, SkippedRecord, CrmStatus, DataSource } from '../types/crm';

const CrmStatusEnum = z.enum(['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE']);
const DataSourceEnum = z.enum(['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots', '']);

// Stage 1 Schema: Validate that Gemini returned the expected structural shape
const AiExtractionSchema = z.object({
  extracted_records: z.array(z.record(z.string(), z.unknown()))
});

export class ValidationService {
  /**
   * Validates the AI output and applies all business rules to separate records into imported and skipped.
   * @param aiOutput The raw JSON parsed from Gemini.
   */
  public static validateAndProcess(aiOutput: unknown): { importedRecords: CRMLead[], skippedRecords: SkippedRecord[] } {
    // Stage 1: Schema Validation
    const schemaValidation = AiExtractionSchema.safeParse(aiOutput);
    if (!schemaValidation.success) {
      throw new Error(`Invalid AI Output Structure: ${schemaValidation.error.message}`);
    }

    const records = schemaValidation.data.extracted_records;
    const importedRecords: CRMLead[] = [];
    const skippedRecords: SkippedRecord[] = [];

    // Stage 2: Business Validation
    for (const rawRecord of records) {
      // Cast safely since we know it's a record of unknowns at this point
      const safeRecord = rawRecord as Record<string, any>;
      
      const email = this.trimString(safeRecord.email);
      const mobile = this.trimString(safeRecord.mobile_without_country_code);

      // Rule 1: Missing both email and mobile -> skip
      if (!email && !mobile) {
        skippedRecords.push({
          raw_data: safeRecord,
          reason: 'Missing both email and mobile_without_country_code'
        });
        continue;
      }

      // Rule 2: crm_status validation
      let validCrmStatus: CrmStatus | undefined = undefined;
      const parsedStatus = CrmStatusEnum.safeParse(safeRecord.crm_status);
      if (parsedStatus.success) {
        validCrmStatus = parsedStatus.data;
      } else {
        // Fallback to undefined for invalid/missing status based on architecture logic
        validCrmStatus = undefined;
      }

      // Rule 3: data_source validation
      let validDataSource: DataSource = '';
      const parsedSource = DataSourceEnum.safeParse(safeRecord.data_source);
      if (parsedSource.success) {
        validDataSource = parsedSource.data;
      } else {
        validDataSource = '';
      }

      // Rule 4: created_at validation
      let validCreatedAt: string | undefined = undefined;
      if (typeof safeRecord.created_at === 'string' && safeRecord.created_at.trim() !== '') {
        const date = new Date(safeRecord.created_at);
        if (!isNaN(date.getTime())) {
          validCreatedAt = safeRecord.created_at; 
        } else {
          validCreatedAt = undefined;
        }
      }

      // Rule 7: Build a new CRMLead (Never mutate original object)
      // Rule 6: Ignore unknown AI properties (By mapping explicitly)
      // Rule 5: Trim whitespace (Via trimString wrapper)
      const crmLead: CRMLead = {
        name: this.trimString(safeRecord.name),
        email: email,
        country_code: this.trimString(safeRecord.country_code),
        mobile_without_country_code: mobile,
        company: this.trimString(safeRecord.company),
        city: this.trimString(safeRecord.city),
        state: this.trimString(safeRecord.state),
        country: this.trimString(safeRecord.country),
        lead_owner: this.trimString(safeRecord.lead_owner),
        crm_note: this.trimString(safeRecord.crm_note),
        possession_time: this.trimString(safeRecord.possession_time),
        description: this.trimString(safeRecord.description),
        crm_status: validCrmStatus,
        data_source: validDataSource,
        created_at: validCreatedAt
      };

      // Strip undefined fields to strictly match TypeScript definitions for omitted optional fields
      const cleanLead = Object.fromEntries(
        Object.entries(crmLead).filter(([_, v]) => v !== undefined && v !== null)
      ) as CRMLead;

      importedRecords.push(cleanLead);
    }

    return {
      importedRecords,
      skippedRecords
    };
  }

  private static trimString(value: any): string | undefined {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    }
    return undefined;
  }
}
