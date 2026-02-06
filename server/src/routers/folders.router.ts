import { Router } from 'express';
import foldersController from '../controllers/folders.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, foldersController.createFolder);
router.get('/', authenticate, foldersController.getFolderContents);
router.get('/tree', authenticate, foldersController.getTree);
router.patch('/:id', authenticate, foldersController.renameFolder);
router.patch('/:id/move', authenticate, foldersController.moveFolder);
router.delete('/:id', authenticate, foldersController.deleteFolder);

export default router;