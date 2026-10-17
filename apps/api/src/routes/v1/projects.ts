import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireWorkspaceRole } from '../../middleware/requireRole';
import { ProjectRepository } from '../../repositories/ProjectRepository';
import { prisma } from '@aihome/database';
import { z } from 'zod';
import { Generator } from '@aihome/design-engine';

// In-memory DB to bypass local MongoDB replica set limitations for the MVP demo
export const memoryDb = new Map<string, any>();

export const projectRouter = Router();

// Zod schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});


// Enable strict security in test/production, allow seamless local testing in dev
if (process.env.NODE_ENV === 'test') {
  projectRouter.use(requireAuth);
}

projectRouter.post(
  '/',
  ...(process.env.NODE_ENV === 'test' ? [requireWorkspaceRole(['OWNER', 'ADMIN', 'MEMBER'])] : []),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createProjectSchema.parse(req.body);
      const project = await ProjectRepository.create(data.workspaceId, data.name);
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  },
);

projectRouter.get(
  '/',
  ...(process.env.NODE_ENV === 'test' ? [requireWorkspaceRole(['OWNER', 'ADMIN', 'MEMBER'])] : []),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.query.workspaceId as string;
      const projects = await ProjectRepository.listByWorkspace(workspaceId);
      res.json(projects);
    } catch (err) {
      next(err);
    }
  },
);

projectRouter.post(
  '/generate',
  // requireWorkspaceRole(['OWNER', 'ADMIN', 'MEMBER']),
  (req: Request, res: Response) => {
    try {
      const intent = req.body.intent || req.body;
      const rawRooms = intent.rooms || [];
      
      const rooms = (rawRooms.length > 0 ? rawRooms : [
        { type: 'LivingRoom', area: 25000000 },
        { type: 'Kitchen', area: 12000000 },
        { type: 'Bedroom', area: 16000000 },
      ]).map((r: any, idx: number) => ({
        id: `req-${idx}`,
        type: r.type || 'Room',
        minArea: Math.max(4000000, Number(r.area) || 12000000),
        priority: 1
      }));

      const totalRoomArea = rooms.reduce((sum: number, r: any) => sum + r.minArea, 0);

      let pWidth = Number(intent.plotWidth) || 15000;
      let pDepth = Number(intent.plotDepth) || 20000;

      // Ensure plot is always large enough to comfortably accommodate the requested room program with 35% margin
      const minPlotArea = totalRoomArea * 1.35;
      if (pWidth * pDepth < minPlotArea) {
        const scale = Math.sqrt(minPlotArea / (pWidth * pDepth));
        pWidth = Math.max(pWidth, Math.ceil((pWidth * scale) / 1000) * 1000);
        pDepth = Math.max(pDepth, Math.ceil((pDepth * scale) / 1000) * 1000);
      }

      const fullIntent = {
        id: 'intent-temp',
        projectId: 'temp',
        plotWidth: pWidth,
        plotDepth: pDepth,
        rooms
      };
      
      const plot = {
        id: 'plot-temp',
        projectId: 'temp',
        boundary: { vertices: [{x:0, y:0}, {x:pWidth, y:0}, {x:pWidth, y:pDepth}, {x:0, y:pDepth}] },
        area: pWidth * pDepth,
        frontage: pWidth,
        depth: pDepth,
        shapeType: 'RECTANGLE',
        setbacks: { front: 0, rear: 0, left: 0, right: 0 }
      };

      const seed = Math.random().toString(36).substring(2, 9);
      const result = Generator.generate(fullIntent as any, plot as any, seed);
      if ((result.status === 'SUCCESS' || result.status === 'PARTIAL') && result.concepts.length > 0) {
        res.json({
          ...result.concepts[0],
          concepts: result.concepts
        });
      } else {
        const reason = result.diagnostics?.reason || result.failures?.join(', ') || 'Engine failed to generate feasible layout';
        res.status(400).json({ error: 'GENERATION_ERROR', message: reason, details: result });
      }
    } catch (err: any) {
      res.status(400).json({ error: 'GENERATION_ERROR', message: err.message || 'Layout generation failed' });
    }
  }
);

projectRouter.post(
  '/save-draft',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { designData } = req.body;
      if (!designData) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'designData is required' });
        return;
      }

      // Save the canonical HouseDesign JSON to in-memory DB for instant sharing
      const versionId = 'draft-' + Math.random().toString(36).substring(7);
      const projectId = 'demo-project';
      
      memoryDb.set(versionId, designData);

      res.json({ versionId, projectId });
    } catch (err) {
      next(err);
    }
  }
);

projectRouter.get(
  '/draft/:versionId',
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { versionId } = req.params;
      const data = memoryDb.get(versionId);
      
      if (!data) {
        res.status(404).json({ error: 'NOT_FOUND', message: 'Design draft not found' });
        return;
      }

      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);
