import express from 'express';
import { handleAIController } from '../controllers/aiController.js';

const router = express.Router();

// Ye /ai endpoint lazmi add karein kyunke frontend se request /api/ai par aa rahi hai
router.post('/ai', handleAIController);

// Baaki routes jo pehle se hain
router.post('/ask-anything', handleAIController);
router.post('/expand-notes', handleAIController);
router.post('/pdf-analysis', handleAIController);

export default router;