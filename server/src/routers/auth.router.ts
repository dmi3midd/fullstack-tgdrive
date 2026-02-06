import { Router } from 'express';
import { body, cookie } from 'express-validator';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    authController.registration
);
router.post('/login',
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    authController.login
);
router.post('/logout',
    cookie('refreshToken').notEmpty().isJWT(),
    authController.logout
);
router.post('/refresh',
    cookie('refreshToken').notEmpty().isJWT(),
    authController.refresh
);
router.get('/me',
    authenticate,
    authController.getMe
);

export default router;