//2md edit

import express from 'express';
import { 
  handleAIController, 
  getUserChatHistory, 
  getSingleChatMessages, 
  deleteChat 
} from '../controllers/aiController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Main AI Controller Routes (Protected with Auth)
router.post('/ai', authMiddleware, handleAIController);
router.post('/ask-anything', authMiddleware, handleAIController);
router.post('/expand-notes', authMiddleware, handleAIController);
router.post('/pdf-analysis', authMiddleware, handleAIController);

// 2. Chat History & Sidebar Endpoints
router.get('/history', authMiddleware, getUserChatHistory);              // Saari chats ki list
router.get('/history/:chatId', authMiddleware, getSingleChatMessages);   // Specific chat ke messages
router.delete('/history/:chatId', authMiddleware, deleteChat);           // Chat delete karne ke liye

export default router;



// import express from 'express';
// import { handleAIController } from '../controllers/aiController.js';

// const router = express.Router();

// // Ye /ai endpoint lazmi add karein kyunke frontend se request /api/ai par aa rahi hai
// router.post('/ai', handleAIController);

// // Baaki routes jo pehle se hain
// router.post('/ask-anything', handleAIController);
// router.post('/expand-notes', handleAIController);
// router.post('/pdf-analysis', handleAIController);

// export default router;