import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware';
import filesController from '../controllers/files.controller';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024,
    }
});

router.post('/upload', upload.single('file'), authenticate, filesController.uploadFile);
router.get('/:id/download', authenticate, filesController.downloadFile);
router.patch('/:id/rename', authenticate, filesController.renameFile);
router.patch('/:id/move', authenticate, filesController.moveFile);
router.delete('/:id', authenticate, filesController.deleteFile);

export default router;