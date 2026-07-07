export class BatchService {
  /**
   * Splits an array of records into smaller chunks of a specified size.
   * @param records The array of records to chunk.
   * @param batchSize The maximum size of each chunk. Must be greater than 0.
   * @returns An array of chunks.
   */
  public static chunkArray<T>(records: T[], batchSize: number): T[][] {
    if (batchSize <= 0) {
      throw new Error('Batch size must be greater than 0.');
    }

    if (!records || records.length === 0) {
      return [];
    }

    const batches: T[][] = [];
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    return batches;
  }
}
