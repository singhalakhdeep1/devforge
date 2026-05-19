import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const router = Router();
const authService = new AuthService();

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await authService.register(req.body);
        const tokens = authService.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        res.status(201).json({
            success: true,
            data: { user, tokens },
            message: 'User registered successfully',
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        res.json({
            success: true,
            data: result,
            message: 'Login successful',
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        const tokens = await authService.refreshTokens(refreshToken);

        res.json({
            success: true,
            data: tokens,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/auth/logout
router.post('/logout', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

// GET /api/v1/auth/google
router.get('/google', (req: Request, res: Response) => {
    res.json({ message: 'Google OAuth endpoint' });
});

// GET /api/v1/auth/github
router.get('/github', (req: Request, res: Response) => {
    res.json({ message: 'GitHub OAuth endpoint' });
});

export default router;
