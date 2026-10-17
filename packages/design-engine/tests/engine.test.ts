import { expect, test } from 'vitest';
import { Generator } from '../src/engine/Generator';
import { DesignIntent, Plot } from '@aihome/domain';

test('Generator returns valid concept for feasible input', () => {
  const plot: Plot = {
    id: 'plot-1',
    projectId: 'proj-1',
    area: 5000000,
    frontage: 2000,
    depth: 2500,
    boundary: { vertices: [] },
    setbacks: { front: 0, rear: 0, left: 0, right: 0 },
  };

  const intent: DesignIntent = {
    schemaVersion: 1,
    projectId: 'proj-1',
    floorsRequested: 1,
    rooms: [{ id: 'r1', type: 'LIVING', minArea: 1000000 }],
    hardConstraints: [],
    softPreferences: [],
    unresolvedQuestions: [],
    sourceRequirementIds: [],
  };

  const result = Generator.generate(intent, plot, 'test-seed');
  expect(result.status).toBe('SUCCESS');
  expect(result.concepts.length).toBeGreaterThan(0);

  // Determinism check
  const result2 = Generator.generate(intent, plot, 'test-seed');
  expect(result.concepts[0].conceptId).toEqual(result2.concepts[0].conceptId);
});

test('Generator returns INPUT_INVALID when rooms exceed plot', () => {
  const plot: Plot = {
    id: 'plot-1',
    projectId: 'proj-1',
    area: 1000, // Very small plot
    frontage: 10,
    depth: 100,
    boundary: { vertices: [] },
    setbacks: { front: 0, rear: 0, left: 0, right: 0 },
  };

  const intent: DesignIntent = {
    schemaVersion: 1,
    projectId: 'proj-1',
    floorsRequested: 1,
    rooms: [
      { id: 'r1', type: 'LIVING', minArea: 5000 }, // Exceeds plot area
    ],
    hardConstraints: [],
    softPreferences: [],
    unresolvedQuestions: [],
    sourceRequirementIds: [],
  };

  const result = Generator.generate(intent, plot, 'test-seed');
  expect(result.status).toBe('INPUT_INVALID');
  expect(result.failures[0]).toBe('ROOM_MINIMUMS_EXCEED_CAPACITY');
});

test('Generator successfully creates palatial 6 BHK estate layout', () => {
  const plot: Plot = {
    id: 'plot-estate',
    projectId: 'proj-estate',
    area: 960000000,
    frontage: 30000,
    depth: 32000,
    boundary: { vertices: [
      { x: 0, y: 0 }, { x: 30000, y: 0 }, { x: 30000, y: 32000 }, { x: 0, y: 32000 }
    ] },
    setbacks: { front: 0, rear: 0, left: 0, right: 0 },
  };

  const intent: DesignIntent = {
    schemaVersion: 1,
    projectId: 'proj-estate',
    floorsRequested: 1,
    rooms: [
      { id: 'liv', type: 'LivingRoom', minArea: 40000000 },
      { id: 'kit', type: 'Kitchen', minArea: 16000000 },
      { id: 'din', type: 'DiningRoom', minArea: 18000000 },
      { id: 'b1', type: 'Bedroom', minArea: 22000000 },
      { id: 'b2', type: 'Bedroom', minArea: 16000000 },
      { id: 'b3', type: 'Bedroom', minArea: 16000000 },
      { id: 'b4', type: 'Bedroom', minArea: 16000000 },
      { id: 'b5', type: 'Bedroom', minArea: 15000000 },
      { id: 'b6', type: 'Bedroom', minArea: 15000000 },
      { id: 'ba1', type: 'Bathroom', minArea: 6000000 },
      { id: 'ba2', type: 'Bathroom', minArea: 5000000 },
      { id: 'ba3', type: 'Bathroom', minArea: 5000000 },
      { id: 'ba4', type: 'Bathroom', minArea: 5000000 },
    ],
    hardConstraints: [],
    softPreferences: [],
    unresolvedQuestions: [],
    sourceRequirementIds: [],
  };

  const result = Generator.generate(intent, plot, 'estate-seed-1');
  expect(result.status).toBe('SUCCESS');
  expect(result.concepts.length).toBeGreaterThan(0);
  const concept = result.concepts[0];
  expect(concept.houseDesign.rooms.length).toBe(intent.rooms.length);
  // Verify main entrance external door exists
  expect(concept.houseDesign.doors.some((d: any) => d.type === 'EXTERNAL')).toBe(true);
});

test('Generator successfully handles 1 BHK with Pooja & Study without missing rooms', () => {
  const plot: Plot = {
    id: 'plot-1bhk-amenities',
    projectId: 'proj-1bhk',
    area: 250000000,
    frontage: 15000,
    depth: 18000,
    boundary: { vertices: [{ x: 0, y: 0 }, { x: 15000, y: 0 }, { x: 15000, y: 18000 }, { x: 0, y: 18000 }] },
    setbacks: { front: 0, rear: 0, left: 0, right: 0 },
  };

  const intent: DesignIntent = {
    schemaVersion: 1,
    projectId: 'proj-1bhk',
    floorsRequested: 1,
    rooms: [
      { id: 'liv', type: 'LivingRoom', minArea: 20000000 },
      { id: 'kit', type: 'Kitchen', minArea: 10000000 },
      { id: 'bed', type: 'Bedroom', minArea: 16000000 },
      { id: 'bath', type: 'Bathroom', minArea: 5000000 },
      { id: 'pooja', type: 'Pooja', minArea: 6000000 },
      { id: 'study', type: 'Study', minArea: 10000000 },
    ],
    hardConstraints: [],
    softPreferences: [],
    unresolvedQuestions: [],
    sourceRequirementIds: [],
  };

  const result = Generator.generate(intent, plot, 'seed-1bhk-amenities');
  expect(result.status).toBe('SUCCESS');
  expect(result.concepts.length).toBeGreaterThan(0);
  expect(result.concepts[0].houseDesign.rooms.length).toBe(intent.rooms.length);
});

test('Generator successfully handles 3 BHK with Gym and Balcony', () => {
  const plot: Plot = {
    id: 'plot-3bhk-gym',
    projectId: 'proj-3bhk',
    area: 400000000,
    frontage: 20000,
    depth: 22000,
    boundary: { vertices: [{ x: 0, y: 0 }, { x: 20000, y: 0 }, { x: 20000, y: 22000 }, { x: 0, y: 22000 }] },
    setbacks: { front: 0, rear: 0, left: 0, right: 0 },
  };

  const intent: DesignIntent = {
    schemaVersion: 1,
    projectId: 'proj-3bhk',
    floorsRequested: 1,
    rooms: [
      { id: 'liv', type: 'LivingRoom', minArea: 25000000 },
      { id: 'din', type: 'DiningRoom', minArea: 14000000 },
      { id: 'kit', type: 'Kitchen', minArea: 12000000 },
      { id: 'b1', type: 'Bedroom', minArea: 18000000 },
      { id: 'b2', type: 'Bedroom', minArea: 14000000 },
      { id: 'b3', type: 'Bedroom', minArea: 14000000 },
      { id: 'ba1', type: 'Bathroom', minArea: 6000000 },
      { id: 'ba2', type: 'Bathroom', minArea: 5000000 },
      { id: 'gym', type: 'Gym', minArea: 15000000 },
      { id: 'balcony', type: 'Balcony', minArea: 8000000 },
    ],
    hardConstraints: [],
    softPreferences: [],
    unresolvedQuestions: [],
    sourceRequirementIds: [],
  };

  const result = Generator.generate(intent, plot, 'seed-3bhk-gym');
  expect(result.status).toBe('SUCCESS');
  expect(result.concepts.length).toBeGreaterThan(0);
  expect(result.concepts[0].houseDesign.rooms.length).toBe(intent.rooms.length);
});
