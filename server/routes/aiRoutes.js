import express from 'express';
import { generateArtSpec, analyzeRoom, recommend } from '../controllers/aiController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/generate-art', generateArtSpec);
router.post('/analyze-room', upload.single('custom_image'), analyzeRoom);
router.post('/recommend', recommend);

export default router;
