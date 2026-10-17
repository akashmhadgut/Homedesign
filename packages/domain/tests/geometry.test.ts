import { expect, test } from 'vitest';
import { distance, pointsEqual } from '../src/core/math';
import { PointSchema } from '../src/schemas/geometrySchemas';

test('distance calculates correctly', () => {
  const p1 = { x: 0, y: 0 };
  const p2 = { x: 3000, y: 4000 }; // 3m by 4m
  expect(distance(p1, p2)).toBe(5000); // 5m
});

test('pointsEqual respects EPSILON', () => {
  const p1 = { x: 1000, y: 1000 };
  const p2 = { x: 1000.5, y: 1000 };
  expect(pointsEqual(p1, p2, 1)).toBe(true); // default EPSILON is 1

  const p3 = { x: 1002, y: 1000 };
  expect(pointsEqual(p1, p3, 1)).toBe(false);
});

test('Zod schemas validate geometry correctly', () => {
  const validPoint = { x: 500, y: 500 };
  expect(PointSchema.parse(validPoint)).toEqual(validPoint);

  const invalidPoint = { x: Infinity, y: 500 };
  expect(() => PointSchema.parse(invalidPoint)).toThrow();
});
