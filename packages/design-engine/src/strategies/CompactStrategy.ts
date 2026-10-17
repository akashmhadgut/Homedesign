import { HouseDesign, Point, Polygon, getPolygonBoundingBox } from '@aihome/domain';
import { CompiledConstraintSet, GeneratedConcept } from '../core/types';
import { Validator } from '../engine/Validator';
import { Analyzer } from '../engine/Analyzer';

export class CompactStrategy {
  public static generate(context: CompiledConstraintSet, seed: string): GeneratedConcept | null {
    const mockDesign: HouseDesign = {
      schemaVersion: 1,
      id: `concept-${seed}`,
      projectId: context.plot.projectId,
      revision: 1,
      units: 'mm',
      plotReference: context.plot,
      orientation: { northAngle: 0, referenceType: 'PROJECT' },
      floors: [{ id: 'f1', index: 0, name: 'Ground Floor', elevation: 0, height: 3000 }],
      rooms: [],
      walls: [],
      doors: [],
      windows: [],
      staircases: [],
      furniture: [],
      dimensions: [],
      constraints: [],
      preferences: [],
    };

    // Calculate buildable area constraints
    const buildableBB = context.buildableRegion && context.buildableRegion.vertices.length > 0 
      ? getPolygonBoundingBox(context.buildableRegion) 
      : { minX: 0, minY: 0, maxX: 30000, maxY: 30000 };

    const maxWidth = buildableBB.maxX - buildableBB.minX;
    const maxHeight = buildableBB.maxY - buildableBB.minY;

    // Room classification with full architectural taxonomy
    const allRooms = [...context.requiredRooms];
    const beds = allRooms.filter(r => {
      const t = (r.type as string).toUpperCase();
      return t.includes('BED') || t.includes('MASTER') || t.includes('GUEST') || t.includes('KIDS') || t.includes('DORM');
    });
    const baths = allRooms.filter(r => {
      const t = (r.type as string).toUpperCase();
      return t.includes('BATH') || t.includes('TOILET') || t.includes('WASH') || t.includes('POWDER') || t.includes('WC') || t.includes('RESTROOM');
    });
    const living = allRooms.find(r => {
      const t = (r.type as string).toUpperCase();
      return t.includes('LIV') || t.includes('HALL') || t.includes('LOUNGE') || t.includes('FAMILY');
    });
    const kitchens = allRooms.filter(r => {
      const t = (r.type as string).toUpperCase();
      return t.includes('KITCH') || t.includes('PANTRY') || t.includes('SCULLERY') || t.includes('COOK');
    });
    const dining = allRooms.find(r => (r.type as string).toUpperCase().includes('DIN'));
    const pooja = allRooms.find(r => {
      const t = (r.type as string).toUpperCase();
      return t.includes('POOJ') || t.includes('MANDIR') || t.includes('TEMPLE') || t.includes('PRAY');
    });
    const study = allRooms.find(r => {
      const t = (r.type as string).toUpperCase();
      return t.includes('STUD') || t.includes('OFFIC') || t.includes('LIB') || t.includes('WORK');
    });
    const balcony = allRooms.find(r => {
      const t = (r.type as string).toUpperCase();
      return t.includes('BALC') || t.includes('TERRACE') || t.includes('SITOUT') || t.includes('DECK') || t.includes('PATIO') || t.includes('PORCH');
    });
    const utility = allRooms.find(r => {
      const t = (r.type as string).toUpperCase();
      return t.includes('UTIL') || t.includes('STORE') || t.includes('SERV') || t.includes('LAUND');
    });
    const gym = allRooms.find(r => {
      const t = (r.type as string).toUpperCase();
      return t.includes('GYM') || t.includes('FIT') || t.includes('THEAT') || t.includes('GAME');
    });

    const isFlippedX = seed.includes('var1') || seed.includes('var3');
    const isFlippedY = false;

    // Helper to add transformed rooms & doors
    const createLayoutHelper = (W: number, H: number, startX: number, startY: number) => {
      const transformX = (x: number) => isFlippedX ? (startX + W) - (x - startX) : x;
      const transformY = (y: number) => isFlippedY ? (startY + H) - (y - startY) : y;

      const addRoom = (req: any, basex1: number, basex2: number, basey1: number, basey2: number, customName?: string) => {
        const tx1 = transformX(basex1);
        const tx2 = transformX(basex2);
        const ty1 = transformY(basey1);
        const ty2 = transformY(basey2);
        const x1 = Math.min(tx1, tx2);
        const x2 = Math.max(tx1, tx2);
        const y1 = Math.min(ty1, ty2);
        const y2 = Math.max(ty1, ty2);

        mockDesign.rooms.push({
          id: req.id,
          floorId: 'f1',
          type: req.type as any,
          name: customName || req.name || (req.type === 'Bedroom' && mockDesign.rooms.filter(r => (r.type as string).toUpperCase().includes('BED')).length === 0 ? 'Master Suite' : `Room ${req.type}`),
          boundaryWallIds: [],
          derivedPolygon: {
            vertices: [
              { x: x1, y: y1 },
              { x: x2, y: y1 },
              { x: x2, y: y2 },
              { x: x1, y: y2 }
            ]
          },
          area: (x2 - x1) * (y2 - y1),
          tags: [],
        });
      };

      const addDoor = (basex: number, basey: number, baseAngle: number, width: number = 900, type: string = 'INTERIOR') => {
        const x = transformX(basex);
        const y = transformY(basey);
        (mockDesign.doors as any[]).push({
          id: `door-${Math.random().toString(36).substring(7)}`,
          floorId: 'f1',
          wallId: 'virtual',
          width,
          height: 2100,
          positionAlongWall: 0,
          swing: 0,
          type,
          _location: { x, y },
          _orientationAngle: baseAngle
        });
      };

      return { addRoom, addDoor };
    };

    // =========================================================================
    // CASE 0: 1 OR 2 ROOM MINIMAL CONCEPT
    // =========================================================================
    if (allRooms.length <= 2) {
      const totalReq = allRooms.reduce((sum, r) => sum + r.minArea, 0) * 1.15;
      let W = Math.min(maxWidth, Math.sqrt(totalReq * 1.25));
      let H = totalReq / W;
      if (H > maxHeight) { H = maxHeight; W = Math.min(maxWidth, totalReq / H); }

      const startX = buildableBB.minX + Math.max(0, (maxWidth - W) / 2);
      const startY = buildableBB.minY + Math.max(0, (maxHeight - H) / 2);
      const { addRoom, addDoor } = createLayoutHelper(W, H, startX, startY);

      if (allRooms.length === 1) {
        addRoom(allRooms[0], startX, startX + W, startY, startY + H);
        addDoor(startX + W / 2, startY, 0, 1200, 'EXTERNAL');
      } else {
        const h1 = H * (allRooms[0].minArea / (allRooms[0].minArea + allRooms[1].minArea));
        addRoom(allRooms[0], startX, startX + W, startY, startY + h1);
        addRoom(allRooms[1], startX, startX + W, startY + h1, startY + H);
        addDoor(startX + W / 2, startY, 0, 1200, 'EXTERNAL');
        addDoor(startX + W / 2, startY + h1, 0, 900);
      }
    } else {
      // =========================================================================
      // PROFESSIONAL ARCHITECTURAL SPACE PLANNING ENGINE (1 BHK to 8+ BHK)
      // True 3-Zone Builder Architecture:
      // Zone 1 (Left Wing): Culinary & Auxiliary (Kitchen -> Dining -> Bed 2 -> Bath 2)
      // Zone 2 (Center Spine): Social & Circulation (Grand Living -> Balcony / Foyer)
      // Zone 3 (Right Wing): Private Sanctuary (Master Suite -> Master Bath -> Bed 3 -> Bath 3)
      // =========================================================================

      interface SpatialSlice {
        rooms: Array<{ req: any; name?: string; isOuter?: boolean }>;
        minAreaTotal: number;
        doorType?: 'INTERNAL_CONNECT' | 'HALLWAY' | 'EN_SUITE' | 'SLIDING';
      }

      const westSlices: SpatialSlice[] = [];
      const centerSlices: SpatialSlice[] = [];
      const eastSlices: SpatialSlice[] = [];

      const calcBathMinArea = (b: any) => Math.max(b.minArea * 2.4, 11000000);

      // -----------------------------------------------------------------------
      // 1. LEFT WING: Culinary & Auxiliary Zone
      // -----------------------------------------------------------------------
      if (kitchens[0]) {
        westSlices.push({
          rooms: [{ req: kitchens[0], name: 'Gourmet Kitchen' }],
          minAreaTotal: kitchens[0].minArea
        });
      }

      // Dining MUST be immediately adjacent to Kitchen to share a direct serving partition
      if (dining) {
        westSlices.push({
          rooms: [{ req: dining, name: 'Formal Dining Hall' }],
          minAreaTotal: dining.minArea
        });
      }

      if (utility) {
        westSlices.push({
          rooms: [{ req: utility, name: 'Utility & Scullery' }],
          minAreaTotal: utility.minArea * 1.5
        });
      }

      // Guest / Secondary Bedroom in Left Wing
      if (beds[1]) {
        westSlices.push({
          rooms: [{ req: beds[1], name: 'Bedroom Suite 2' }],
          minAreaTotal: beds[1].minArea
        });
        if (baths[1]) {
          westSlices.push({
            rooms: [{ req: baths[1], name: 'En-Suite Bath 2', isOuter: true }],
            minAreaTotal: calcBathMinArea(baths[1]),
            doorType: 'EN_SUITE'
          });
        }
      }

      // Additional even-indexed bedrooms go to Left Wing rear
      for (let i = 3; i < beds.length; i += 2) {
        westSlices.push({
          rooms: [{ req: beds[i], name: `Bedroom Suite ${i + 1}` }],
          minAreaTotal: beds[i].minArea
        });
        if (baths[i]) {
          westSlices.push({
            rooms: [{ req: baths[i], name: `En-Suite Bath ${i + 1}`, isOuter: true }],
            minAreaTotal: calcBathMinArea(baths[i]),
            doorType: 'EN_SUITE'
          });
        }
      }

      // -----------------------------------------------------------------------
      // 2. CENTER SPINE: Public Social & Circulation Core
      // -----------------------------------------------------------------------
      if (living) {
        centerSlices.push({
          rooms: [{ req: living, name: 'Grand Living Lounge' }],
          minAreaTotal: living.minArea
        });
      }

      // In Center Spine, Pooja provides a tranquil central prayer sanctum
      if (pooja) {
        centerSlices.push({
          rooms: [{ req: pooja, name: 'Pooja Mandir' }],
          minAreaTotal: pooja.minArea * 1.5
        });
      }

      if (study) {
        centerSlices.push({
          rooms: [{ req: study, name: 'Executive Study' }],
          minAreaTotal: study.minArea
        });
      }

      if (balcony) {
        centerSlices.push({
          rooms: [{ req: balcony, name: 'Balcony Deck' }],
          minAreaTotal: balcony.minArea,
          doorType: 'SLIDING'
        });
      }

      // -----------------------------------------------------------------------
      // 3. RIGHT WING: Private Sanctuary Zone
      // -----------------------------------------------------------------------
      if (beds[0]) {
        eastSlices.push({
          rooms: [{ req: beds[0], name: 'Master Suite' }],
          minAreaTotal: beds[0].minArea
        });
      }

      if (baths[0]) {
        eastSlices.push({
          rooms: [{ req: baths[0], name: 'Master En-Suite Bath', isOuter: true }],
          minAreaTotal: calcBathMinArea(baths[0]),
          doorType: 'EN_SUITE'
        });
      }

      // Secondary Bedroom 3 in Right Wing
      if (beds[2]) {
        eastSlices.push({
          rooms: [{ req: beds[2], name: 'Bedroom Suite 3' }],
          minAreaTotal: beds[2].minArea
        });
        if (baths[2]) {
          eastSlices.push({
            rooms: [{ req: baths[2], name: 'En-Suite Bath 3', isOuter: true }],
            minAreaTotal: calcBathMinArea(baths[2]),
            doorType: 'EN_SUITE'
          });
        }
      }

      // Additional odd-indexed bedrooms go to Right Wing rear
      for (let i = 4; i < beds.length; i += 2) {
        eastSlices.push({
          rooms: [{ req: beds[i], name: `Bedroom Suite ${i + 1}` }],
          minAreaTotal: beds[i].minArea
        });
        if (baths[i]) {
          eastSlices.push({
            rooms: [{ req: baths[i], name: `En-Suite Bath ${i + 1}`, isOuter: true }],
            minAreaTotal: calcBathMinArea(baths[i]),
            doorType: 'EN_SUITE'
          });
        }
      }

      if (gym) {
        eastSlices.push({
          rooms: [{ req: gym, name: 'Fitness Gym & Media Room' }],
          minAreaTotal: gym.minArea
        });
      }

      // Collect any remaining unplaced rooms
      const placedIds = new Set<string>();
      [...westSlices, ...centerSlices, ...eastSlices].forEach(s => s.rooms.forEach(r => placedIds.add(r.req.id)));
      
      allRooms.forEach(r => {
        if (!placedIds.has(r.id)) {
          const isBath = (r.type as string).toUpperCase().includes('BATH') || (r.type as string).toUpperCase().includes('TOILET');
          const targetSlices = eastSlices.length <= westSlices.length ? eastSlices : westSlices;
          targetSlices.push({
            rooms: [{ req: r, name: (r as any).name || `Room ${r.type}`, isOuter: isBath }],
            minAreaTotal: isBath ? calcBathMinArea(r) : r.minArea,
            doorType: isBath ? 'EN_SUITE' : 'HALLWAY'
          });
          placedIds.add(r.id);
        }
      });

      // -----------------------------------------------------------------------
      // FOOTPRINT & PROPORTION OPTIMIZATION
      // Ensures generous architectural proportions without skinny tunnel rooms
      // -----------------------------------------------------------------------
      const getMinSliceHeight = (s: SpatialSlice) => {
        const t = (s.rooms[0]?.req?.type as string || '').toUpperCase();
        if (t.includes('BATH') || t.includes('TOILET')) return 2600;
        if (t.includes('BED')) return 3600;
        if (t.includes('LIV')) return 4800;
        if (t.includes('DIN') || t.includes('KITCH')) return 3600;
        return 3000;
      };

      const minHWest = westSlices.reduce((sum, s) => sum + getMinSliceHeight(s), 0);
      const minHCenter = centerSlices.reduce((sum, s) => sum + getMinSliceHeight(s), 0);
      const minHEast = eastSlices.reduce((sum, s) => sum + getMinSliceHeight(s), 0);
      const minRequiredH = Math.max(minHWest, minHCenter, minHEast);

      const totalWestMinArea = Math.max(1, westSlices.reduce((sum, s) => sum + s.minAreaTotal, 0));
      const totalCenterMinArea = Math.max(1, centerSlices.reduce((sum, s) => sum + s.minAreaTotal, 0));
      const totalEastMinArea = Math.max(1, eastSlices.reduce((sum, s) => sum + s.minAreaTotal, 0));
      const grandTotalMin = allRooms.reduce((sum, r) => sum + r.minArea, 0);

      const targetArea = Math.max(
        grandTotalMin * 1.25,
        totalWestMinArea / 0.30,
        totalCenterMinArea / 0.34,
        totalEastMinArea / 0.30
      );

      // Desired width: 3 wings, each ~4.0m to 4.5m wide
      const idealWingW = 4200;
      const minRequiredW = idealWingW * 3;
      let H = Math.min(maxHeight, Math.max(minRequiredH, Math.sqrt(targetArea * 1.1)));
      let W = Math.min(maxWidth, Math.max(minRequiredW, targetArea / H));
      if (W * H < targetArea) {
        H = Math.min(maxHeight, targetArea / W);
      }

      const startX = buildableBB.minX + Math.max(0, (maxWidth - W) / 2);
      const startY = buildableBB.minY + Math.max(0, (maxHeight - H) / 2);
      const { addRoom, addDoor } = createLayoutHelper(W, H, startX, startY);

      // Width breakdown: West 33%, Center 34%, East 33%
      const westW = 0.33 * W;
      const centerW = 0.34 * W;
      const eastW = 0.33 * W;

      const westX1 = startX;
      const westX2 = startX + westW;

      const centerX1 = westX2;
      const centerX2 = centerX1 + centerW;

      const eastX1 = centerX2;
      const eastX2 = startX + W;

      // -----------------------------------------------------------------------
      // 1. Render West Wing Slices
      // -----------------------------------------------------------------------
      let currWY = startY;
      westSlices.forEach((slice, sIdx) => {
        const sliceH = H * (slice.minAreaTotal / totalWestMinArea);
        const y1 = currWY;
        const y2 = currWY + sliceH;
        currWY += sliceH;

        const roomObj = slice.rooms[0];
        addRoom(roomObj.req, westX1, westX2, y1, y2, roomObj.name);

        const isBath = (roomObj.req.type as string || '').toUpperCase().includes('BATH') || (roomObj.req.type as string || '').toUpperCase().includes('TOILET');

        if (isBath) {
          // Attached en-suite door connecting directly to the bedroom above on interior wall
          // NEVER on the spine wall facing the living room!
          addDoor(westX1 + westW / 2, y1, 0, 800);
        } else if (roomObj.name?.includes('Kitchen')) {
          // Serving opening to Dining below (if dining exists) or archway to living
          if (westSlices[sIdx + 1]?.rooms[0]?.name?.includes('Dining')) {
            addDoor(westX1 + westW / 2, y2, 0, 1000);
          } else {
            addDoor(westX2, y1 + sliceH / 2, 90, 900);
          }
        } else if (roomObj.name?.includes('Dining')) {
          // Direct connecting opening from Dining into Living Lounge
          addDoor(westX2, y1 + sliceH / 2, 90, 1200);
        } else {
          // Door from central hallway/spine into room
          addDoor(westX2, y1 + Math.min(1500, sliceH * 0.4), 90, 900);
        }
      });

      // -----------------------------------------------------------------------
      // 2. Render Central Spine Slices
      // -----------------------------------------------------------------------
      let currCY = startY;
      centerSlices.forEach((slice, sIdx) => {
        const sliceH = H * (slice.minAreaTotal / totalCenterMinArea);
        const y1 = currCY;
        const y2 = currCY + sliceH;
        currCY += sliceH;

        const roomObj = slice.rooms[0];
        addRoom(roomObj.req, centerX1, centerX2, y1, y2, roomObj.name);

        if (sIdx === 0) {
          // Grand Main Exterior Entrance Double Door at front
          addDoor(centerX1 + centerW / 2, startY, 0, 1200, 'EXTERNAL');
        } else if (slice.doorType === 'SLIDING') {
          // Sliding glass deck door
          addDoor(centerX1 + centerW / 2, y1, 0, 1500);
        } else {
          // Accessible connecting opening from previous central space
          addDoor(centerX1 + centerW / 2, y1, 0, 1200);
        }
      });

      // -----------------------------------------------------------------------
      // 3. Render East Wing Slices
      // -----------------------------------------------------------------------
      let currEY = startY;
      eastSlices.forEach((slice, sIdx) => {
        const sliceH = H * (slice.minAreaTotal / totalEastMinArea);
        const y1 = currEY;
        const y2 = currEY + sliceH;
        currEY += sliceH;

        const roomObj = slice.rooms[0];
        addRoom(roomObj.req, eastX1, eastX2, y1, y2, roomObj.name);

        const isBath = (roomObj.req.type as string || '').toUpperCase().includes('BATH') || (roomObj.req.type as string || '').toUpperCase().includes('TOILET');

        if (isBath) {
          // Attached en-suite door connecting directly to bedroom above on interior wall
          // NEVER on the spine wall facing the living room!
          addDoor(eastX1 + eastW / 2, y1, 0, 800);
        } else {
          // Door from central lounge/spine into room
          addDoor(eastX1, y1 + Math.min(1500, sliceH * 0.4), 90, 900);
        }
      });
    }

    const validation = Validator.validateDesign(mockDesign, context);

    if (!validation.valid) {
      console.warn("Layout validation warnings/errors:", validation.errors);
      return null;
    }

    const analysis = Analyzer.analyzeDesign(mockDesign, context);

    return {
      conceptId: `concept-${seed}`,
      strategy: 'COMPACT',
      houseDesign: mockDesign,
      hardValidation: validation,
      preferenceEvaluations: analysis,
    };
  }
}

