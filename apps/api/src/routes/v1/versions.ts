import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireShareLink, AuthenticatedRequest, ShareLinkRequest } from '../../middleware/auth';
import { requireWorkspaceRole } from '../../middleware/requireRole';
import { DesignVersionRepository } from '../../repositories/DesignVersionRepository';
import { ProjectRepository } from '../../repositories/ProjectRepository';
import { z } from 'zod';

export const versionRouter = Router({ mergeParams: true });

// Schema for saving a new version (assumes a fully populated Canonical HouseDesign in body)
const saveVersionSchema = z.object({
  designData: z.any(), // In a real app we would Zod-validate the entire HouseDesign shape here
});

/**
 * 1. Save a new Version
 * Only users with OWNER, ADMIN, or MEMBER roles in the Workspace can save a version.
 */
versionRouter.post(
  '/',
  requireAuth,
  requireWorkspaceRole(['OWNER', 'ADMIN', 'MEMBER']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const workspaceId = req.user!.workspaceId;

      // Ensure the project belongs to the user's tenant
      const project = await ProjectRepository.findById(projectId, workspaceId);
      if (!project) {
        res.status(404).json({ error: 'NOT_FOUND', message: 'Project not found in this workspace' });
        return;
      }

      const data = saveVersionSchema.parse(req.body);
      const version = await DesignVersionRepository.saveVersion(projectId, data.designData);

      res.status(201).json(version);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * 2. List all Versions for a Project
 */
versionRouter.get(
  '/',
  requireAuth,
  requireWorkspaceRole(['OWNER', 'ADMIN', 'MEMBER']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const workspaceId = req.user!.workspaceId;

      const project = await ProjectRepository.findById(projectId, workspaceId);
      if (!project) {
        res.status(404).json({ error: 'NOT_FOUND', message: 'Project not found' });
        return;
      }

      const versions = await DesignVersionRepository.listByProject(projectId);
      res.json(versions);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * 3. Client Review View Route
 * This is protected ONLY by requireShareLink, bypassing traditional requireAuth.
 * It strictly returns only the allowed version requested via the token.
 */
versionRouter.get(
  '/:versionId/share',
  requireShareLink,
  async (req: ShareLinkRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestedVersionId = req.params.versionId;
      const shareContext = req.shareLink!;

      // Scope validation check: Ensure the token actually authorizes THIS version
      if (shareContext.designVersionId !== requestedVersionId) {
        res.status(403).json({ error: 'FORBIDDEN', message: 'Share link not valid for this version' });
        return;
      }

      const version = await DesignVersionRepository.getVersionWithData(shareContext.projectId, requestedVersionId);
      if (!version) {
        res.status(404).json({ error: 'NOT_FOUND', message: 'Version not found' });
        return;
      }

      res.json(version);
    } catch (err) {
      next(err);
    }
  }
);
