import express from 'express';
import { saveDesign, getDesignById, uploadRoomImage } from '../controllers/customizationController.js';
import { optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', optionalAuth, upload.single('room_image'), saveDesign);
router.get('/:id', getDesignById);
router.post('/room-image', optionalAuth, upload.single('image'), uploadRoomImage);

export default router;
