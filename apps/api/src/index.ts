import express from 'express';
import { env } from './config/env';
import { projectRouter } from './routes/v1/projects';
import { aiRouter } from './routes/v1/ai';
import { versionRouter } from './routes/v1/versions';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(express.json());

// Enable CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// API Routes
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/projects/:projectId/versions', versionRouter);
app.use('/api/v1/ai', aiRouter);

// Error Handling
app.use(errorHandler);

if (require.main === module) {
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}
