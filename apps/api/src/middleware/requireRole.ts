import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { prisma } from '@aihome/database';

export const requireWorkspaceRole = (allowedRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }

    const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
    if (!workspaceId) {
      res
        .status(400)
        .json({ error: 'BAD_REQUEST', message: 'workspaceId is required for this route' });
      return;
    }

    try {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: String(workspaceId),
            userId: req.user.id,
          },
        },
      });

      if (!membership || !allowedRoles.includes(membership.role)) {
        res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient workspace permissions' });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
