process.env.JWT_SECRET = 'test-secret-1234567890';
process.env.DATABASE_URL = 'mongodb://localhost:27017/test';
process.env.GEMINI_API_KEY = 'dummy-key';

import { expect, test, describe } from 'vitest';
import { AIService } from '../src/services/AIService';
import { SmartArchitecturalParser } from '../src/services/SmartArchitecturalParser';

describe('AIService & SmartArchitecturalParser', () => {
  test('extractIntent parses 6 BHK big house requirements', async () => {
    const service = new AIService();
    const intent = await service.extractIntent('I want a big house with 6 BHK, pooja room, study room, dining and vastu.');
    
    expect(intent.plotWidth).toBeGreaterThanOrEqual(25000);
    expect(intent.plotDepth).toBeGreaterThanOrEqual(28000);
    expect(intent.preferences.vastu).toBe(true);
    
    const bedCount = intent.rooms.filter((r: any) => r.type === 'Bedroom').length;
    expect(bedCount).toBe(6);
    
    const bathCount = intent.rooms.filter((r: any) => r.type === 'Bathroom').length;
    expect(bathCount).toBeGreaterThanOrEqual(4);

    expect(intent.rooms.some((r: any) => r.type === 'LivingRoom')).toBe(true);
    expect(intent.rooms.some((r: any) => r.type === 'Kitchen')).toBe(true);
    expect(intent.rooms.some((r: any) => r.type === 'DiningRoom')).toBe(true);
    expect(intent.rooms.some((r: any) => r.type === 'Pooja')).toBe(true);
    expect(intent.rooms.some((r: any) => r.type === 'Study')).toBe(true);
  });

  test('extractIntent parses 2 BHK standard requirements', async () => {
    const service = new AIService();
    const intent = await service.extractIntent('2 BHK modern flat with kitchen and 2 bathrooms');
    
    const bedCount = intent.rooms.filter((r: any) => r.type === 'Bedroom').length;
    expect(bedCount).toBe(2);
    expect(intent.rooms.some((r: any) => r.type === 'LivingRoom')).toBe(true);
    expect(intent.rooms.some((r: any) => r.type === 'Kitchen')).toBe(true);
  });
});
