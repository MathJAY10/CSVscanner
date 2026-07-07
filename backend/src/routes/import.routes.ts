import { Router } from 'express';
import multer from 'multer';
import { importCsv } from '../controllers/import.controller';

const router = Router();

// Configure multer to store files in memory for fast parsing
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit as a safe default
    }
});

// POST /api/import
router.post('/', upload.single('file'), importCsv);

export default router;
