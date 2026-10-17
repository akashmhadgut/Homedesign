import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    workspaceId: string; // Tenant isolation boundary
    role: string;
  };
}

export interface ShareLinkRequest extends Request {
  shareLink?: {
    id: string;
    projectId: string;
    designVersionId: string;
    scopes: string[];
  };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      workspaceId: decoded.workspaceId,
      role: decoded.role || 'MEMBER',
    };
    
    // Ensure all requests are tenant-scoped
    if (!req.user.workspaceId) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Missing workspace context' });
      return;
    }
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
};

export const requireShareLink = (req: ShareLinkRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or invalid share link token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Share link tokens might be signed with a different secret or explicitly marked
    const decoded = jwt.verify(token, env.SHARE_LINK_SECRET || env.JWT_SECRET) as any;
    
    if (decoded.tokenType !== 'SHARE_LINK') {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Invalid token type for share link' });
      return;
    }

    req.shareLink = {
      id: decoded.id,
      projectId: decoded.projectId,
      designVersionId: decoded.designVersionId,
      scopes: decoded.scopes || ['READ_VERSION'],
    };
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid, expired, or revoked share link token' });
  }
};
