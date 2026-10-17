import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { AIService } from '../../services/AIService';

export const aiRouter = Router();
const aiService = new AIService();

// Disable auth for MVP local testing
// aiRouter.use(requireAuth);

aiRouter.post('/extract-intent', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'BAD_REQUEST', message: 'prompt string is required' });
      return;
    }

    const intent = await aiService.extractIntent(prompt);
    res.json(intent);
  } catch (err: any) {
    next(err);
  }
});
