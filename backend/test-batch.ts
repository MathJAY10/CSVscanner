import { BatchService } from './src/services/batch.service';

const records = Array.from({ length: 23 }, (_, i) => ({ id: i }));

console.log("0 rows (batchSize=20):", BatchService.chunkArray([], 20));
console.log("5 rows (batchSize=20): Batches sizes ->", BatchService.chunkArray(records.slice(0, 5), 20).map(b => b.length));
console.log("20 rows (batchSize=20): Batches sizes ->", BatchService.chunkArray(records.slice(0, 20), 20).map(b => b.length));
console.log("23 rows (batchSize=20): Batches sizes ->", BatchService.chunkArray(records, 20).map(b => b.length));
