import { ValidationService } from './src/services/validation.service';

const mockAiOutput = {
  extracted_records: [
    {
      name: "   Valid Lead   ",
      email: "test@example.com",
      mobile_without_country_code: " 12345 ",
      crm_status: "GOOD_LEAD_FOLLOW_UP",
      data_source: "leads_on_demand",
      created_at: "2026-07-07T00:00:00Z",
      random_unknown_field: "this should be removed"
    },
    {
      name: "Skipped Lead - No email or mobile",
      email: "  ",
      mobile_without_country_code: ""
    },
    {
      name: "Invalid Enums Lead",
      email: "has_email@example.com",
      crm_status: "BOGUS_STATUS",
      data_source: "INVALID_SOURCE",
      created_at: "Not a valid date"
    }
  ]
};

try {
  const result = ValidationService.validateAndProcess(mockAiOutput);
  console.log("Imported Records:", JSON.stringify(result.importedRecords, null, 2));
  console.log("Skipped Records:", JSON.stringify(result.skippedRecords, null, 2));
} catch (e: any) {
  console.error("Validation failed:", e.message);
}
