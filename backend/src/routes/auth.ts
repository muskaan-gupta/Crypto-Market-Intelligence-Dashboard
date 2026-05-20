import { Router, Request, Response } from 'express';
import { registerSchema, loginSchema, validate } from '../utils/validation';
import { generateToken } from '../utils/auth';
import { createUser, authenticateUser } from '../services/userService';
import logger from '../utils/logger';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = await validate(registerSchema, req.body);
    const user = await createUser(email, password);

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err: any) {
    logger.error('Registration error', err);
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = await validate(loginSchema, req.body);
    const user = await authenticateUser(email, password);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err: any) {
    logger.error('Login error', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
