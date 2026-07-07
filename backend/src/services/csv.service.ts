import { parse } from 'csv-parse';
import { Readable } from 'stream';

export class CsvService {
  /**
   * Parses a CSV file buffer into an array of raw JSON objects.
   * Handles quoted commas, escaped quotes, empty rows, and different newline formats.
   * @param fileBuffer The CSV file buffer to parse.
   * @returns A promise that resolves to an array of raw JSON objects.
   */
  public static async parseCsv(fileBuffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const records: Record<string, string>[] = [];
      const stream = Readable.from(fileBuffer);
      
      stream
        .pipe(parse({
          columns: true,          // Treat the first row as headers
          skip_empty_lines: true, // Handle empty rows
          trim: true,             // Trim whitespace around fields
          relax_quotes: true,     // Helps with somewhat malformed quotes
        }))
        .on('data', (data) => {
          records.push(data);
        })
        .on('error', (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        })
        .on('end', () => {
          resolve(records);
        });
    });
  }
}
