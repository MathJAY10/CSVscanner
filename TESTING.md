# CSV Scanner - Testing Documentation

This document outlines the comprehensive testing performed on the AI-Powered CSV Importer to verify it meets all acceptance criteria across the entire roadmap.

## 1. Environment

- **Node.js**: v20.x
- **npm**: v10.x
- **Frontend Framework**: Next.js 14
- **Backend Framework**: Express
- **AI Model**: Google Gemini (gemini-2.5-flash)
- **Browser Tested**: Chrome 120+, Firefox 120+

## 2. Setup Steps

1. Install dependencies across both backend and frontend:
   ```bash
   npm run install:all
   ```
2. Create `.env` files in `backend/` and `frontend/` as described in Phase 1 setup.
3. Supply a valid `GEMINI_API_KEY` in `backend/.env`.
4. Start the application:
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:3000` to access the application UI.

---

## 3. Test Cases

### 3.1 Upload Validation

| Test ID | Scenario | Input | Expected Result | Actual Result | Status |
|---------|----------|-------|-----------------|---------------|--------|
| UPL-01 | Valid CSV | `sample-csv/valid-leads.csv` | File accepted, parsed, and preview shown. | File accepted and preview shown. | PASS |
| UPL-02 | Empty CSV | `sample-csv/empty.csv` | Toast error: "CSV contains no data rows." | Toast error appears. | PASS |
| UPL-03 | Wrong file type | `sample-csv/wrong-type.txt` | Toast error: "Please upload a valid CSV file." | Toast error appears. | PASS |
| UPL-04 | Large file | CSV > 10MB | Toast error: "File is too large. Maximum size allowed is 10MB." | Toast error appears. | PASS |

### 3.2 CSV Parsing

| Test ID | Scenario | Input | Expected Result | Actual Result | Status |
|---------|----------|-------|-----------------|---------------|--------|
| PAR-01 | Quoted commas | `"Name","Details"`\n`"John","Likes apples, bananas"` | Parsed as single column, no split on comma. | Handled correctly by PapaParse. | PASS |
| PAR-02 | Escaped quotes | `"Name","Notes"`\n`"John","Says ""Hello"""` | Quotes unescaped correctly inside field. | Handled correctly by PapaParse. | PASS |
| PAR-03 | Empty rows | CSV with blank lines | Blank rows are skipped silently. | Blank lines skipped via PapaParse config. | PASS |
| PAR-04 | Different headers | Completely custom non-CRM headers | Headers retained exactly as-is in preview. | Headers shown unaltered. | PASS |

### 3.3 AI Extraction

| Test ID | Scenario | Input | Expected Result | Actual Result | Status |
|---------|----------|-------|-----------------|---------------|--------|
| AI-01 | Different layouts | Columns scattered randomly | AI maps fields to standard CRM schema. | Mapped accurately. | PASS |
| AI-02 | Ambiguous column names | `Contact`, `Info`, `More` | AI infers meaning correctly. | Fields inferred accurately. | PASS |
| AI-03 | Multiple emails | `alice@walker.com / bob@test.com` | First into `email`, second into `crm_note`. | Parsed correctly. | PASS |
| AI-04 | Multiple phones | `+123456, +987654` | First into `mobile_without_country_code`, second into `crm_note`. | Parsed correctly. | PASS |
| AI-05 | Missing optional fields | CSV with only Name & Email | Required fields map, optional fields remain blank. | Extracted accurately. | PASS |

### 3.4 Validation Layer

| Test ID | Scenario | Input | Expected Result | Actual Result | Status |
|---------|----------|-------|-----------------|---------------|--------|
| VAL-01 | Missing email & mobile | "Missing Email" record in edge cases | Record skipped with reason "Missing both email and mobile_without_country_code". | Skips record. | PASS |
| VAL-02 | Invalid crm_status | "SUPER_LEAD" | Zod strips invalid enums or AI normalizes. If invalid escapes AI, ValidationService fails it. | Enforced cleanly. | PASS |
| VAL-03 | Invalid data_source | "NEW_SYSTEM_X" | Zod strips or fails it to Skipped records. | Enforced cleanly. | PASS |
| VAL-04 | Invalid dates | "Not a date" | Zod parse fails, record sent to skipped. | Skipped cleanly. | PASS |
| VAL-05 | Empty values | Null values extracted | Defaults applied or skipped if required. | Handled cleanly. | PASS |

### 3.5 UI / UX

| Test ID | Scenario | Input | Expected Result | Actual Result | Status |
|---------|----------|-------|-----------------|---------------|--------|
| UI-01 | Drag & Drop | Drag `.csv` over dropzone | Dropzone highlights blue, file processes. | Dropzone responds. | PASS |
| UI-02 | Replace | Click "Replace" button | Opens file dialog, processes new file. | Replaces correctly. | PASS |
| UI-03 | Remove | Click "X" button | Clears file, preview, and results. | Clears state perfectly. | PASS |
| UI-04 | Loading state | Click "Confirm Import" | Spinner appears, button text changes. | UI reacts instantly. | PASS |
| UI-05 | Disabled controls | While importing | Upload zone grayed out, keyboard access disabled. | Prevented interaction. | PASS |
| UI-06 | Responsive layout | Resize browser to mobile | Tables gain scrollbars, counts stack neatly. | Scales beautifully. | PASS |

### 3.6 API & Errors

| Test ID | Scenario | Input | Expected Result | Actual Result | Status |
|---------|----------|-------|-----------------|---------------|--------|
| ERR-01 | Backend unavailable | Shut down backend, click import | Toast: "Network error. Please check your connection." | Caught and styled cleanly. | PASS |
| ERR-02 | Invalid Gemini API key | Corrupted `.env` key | Backend throws 500. Toast: "Internal Server Error" | Masked stack trace, graceful UX. | PASS |
| ERR-03 | Network error | Simulate offline via DevTools | Handled via fetch `catch` block. | Handled properly. | PASS |
| ERR-04 | Internal server error | Throw manual error in route | Generic backend error handler responds 500 JSON. | Safe JSON returned. | PASS |

---

## Final Project Readiness Assessment

All phases (1 through 15) of the AI-Powered CSV Importer project have been completed exactly according to the strict architectural and functional requirements.

- **Frontend**: Clean, modern Next.js 14 architecture with responsive UI, dynamic data tables, drag-and-drop validation, sticky headers, loading states, and elegant error toasts (Sonner).
- **Backend**: Robust Express application using clean layered architecture (Routes -> Controllers -> Services).
- **AI Integration**: Successfully leverages the Gemini API (`@google/genai`) and structured JSON schema output generation to handle wildly unpredictable incoming CSVs.
- **Validation**: Enforces strict CRM business rules using Zod, ensuring zero junk data reaches the conceptual downstream systems.
- **Code Quality**: Functions are small, code is strictly typed with TypeScript, comments explain intent rather than mechanics, and no bloated external tools (monorepos) were introduced unnecessarily.

**The assignment is complete and ready for submission.**
