import { expect, test, describe, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';
import { prisma } from '@aihome/database';

// Mock prisma for isolated security testing
vi.mock('@aihome/database', () => ({
  prisma: {
    workspaceMember: {
      findUnique: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
    },
  },
}));

describe('Project Security & Authorization', () => {
  const validToken = jwt.sign({ id: 'user-1', email: 'test@test.com', workspaceId: 'ws-1' }, env.JWT_SECRET);

  test('Returns 401 when missing token', async () => {
    const res = await request(app).get('/api/v1/projects?workspaceId=ws-1');
    expect(res.status).toBe(401);
  });

  test('Returns 403 when user is not a member of the workspace', async () => {
    // Mock prisma to return null (no membership)
    (prisma.workspaceMember.findUnique as any).mockResolvedValue(null);

    const res = await request(app)
      .get('/api/v1/projects?workspaceId=ws-1')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN');
  });

  test('Returns 200 when user is a member of the workspace', async () => {
    // Mock prisma to return valid membership
    (prisma.workspaceMember.findUnique as any).mockResolvedValue({ role: 'MEMBER' });
    (prisma.project.findMany as any).mockResolvedValue([]);

    const res = await request(app)
      .get('/api/v1/projects?workspaceId=ws-1')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
