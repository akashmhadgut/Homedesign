import React, { useState, useRef } from 'react';
import type { HouseDesign, Room, Polygon } from '@aihome/domain';
import { doPolygonsIntersect, isPolygonContained } from '@aihome/domain';

interface FloorPlanSvgProps {
  design: HouseDesign | null;
  onDesignUpdate?: (newDesign: HouseDesign) => void;
  readOnly?: boolean;
}

export function FloorPlanSvg({ design, onDesignUpdate, readOnly = false }: FloorPlanSvgProps) {
  if (!design) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
        No design generated yet. Fill out the brief and click Generate.
      </div>
    );
  }

  const { plotReference, rooms } = design;

  // Interaction State
  const [offsets, setOffsets] = useState<Record<string, {x: number, y: number}>>({});
  const [dragging, setDragging] = useState<{id: string, startX: number, startY: number, startOffsetX: number, startOffsetY: number} | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Helper to convert screen coordinates to SVG viewBox coordinates
  const getSvgPoint = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const point = svgRef.current.createSVGPoint();
    
    if ('touches' in e) {
      point.x = e.touches[0].clientX;
      point.y = e.touches[0].clientY;
    } else {
      point.x = (e as React.MouseEvent).clientX;
      point.y = (e as React.MouseEvent).clientY;
    }
    
    return point.matrixTransform(svgRef.current.getScreenCTM()!.inverse());
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent, roomId: string) => {
    if (readOnly) return;
    const pt = getSvgPoint(e);
    const currOffset = offsets[roomId] || { x: 0, y: 0 };
    setDragging({
      id: roomId,
      startX: pt.x,
      startY: pt.y,
      startOffsetX: currOffset.x,
      startOffsetY: currOffset.y,
    });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging) return;
    const pt = getSvgPoint(e);
    const dx = pt.x - dragging.startX;
    const dy = pt.y - dragging.startY;
    
    setOffsets(prev => ({
      ...prev,
      [dragging.id]: {
        x: dragging.startOffsetX + dx,
        y: dragging.startOffsetY + dy,
      }
    }));
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    
    const roomId = dragging.id;
    const room = rooms.find(r => r.id === roomId);
    if (room && room.derivedPolygon && plotReference && typeof plotReference !== 'string' && plotReference.boundary) {
      // Calculate the new polygon
      const offset = offsets[roomId] || { x: 0, y: 0 };
      const newPolygon: Polygon = {
        vertices: room.derivedPolygon.vertices.map(v => ({ x: v.x + offset.x, y: v.y + offset.y }))
      };
      
      let isValid = true;

      // 1. Check if entirely contained in plot
      if (!isPolygonContained(plotReference.boundary, newPolygon)) {
        isValid = false;
      }
      
      // 2. Check overlap with other rooms
      if (isValid) {
        for (const otherRoom of rooms) {
          if (otherRoom.id === roomId || !otherRoom.derivedPolygon) continue;
          
          const otherOffset = offsets[otherRoom.id] || { x: 0, y: 0 };
          const otherPolygon: Polygon = {
            vertices: otherRoom.derivedPolygon.vertices.map(v => ({ x: v.x + otherOffset.x, y: v.y + otherOffset.y }))
          };
          
          if (doPolygonsIntersect(newPolygon, otherPolygon)) {
            isValid = false;
            break;
          }
        }
      }
      
      // Snap back if invalid
      if (!isValid) {
        setOffsets(prev => {
          const next = { ...prev };
          next[roomId] = { x: dragging.startOffsetX, y: dragging.startOffsetY };
          return next;
        });
      } else if (onDesignUpdate) {
        // If valid and we have an update callback, bake the offset into the global design!
        const updatedRooms = rooms.map(r => {
          if (r.id === roomId && r.derivedPolygon) {
            return {
              ...r,
              derivedPolygon: {
                vertices: r.derivedPolygon.vertices.map(v => ({ x: v.x + offset.x, y: v.y + offset.y }))
              }
            };
          }
          return r;
        });
        
        onDesignUpdate({ ...design, rooms: updatedRooms });
        
        // Reset local visual offset since it's now in the vertices
        setOffsets(prev => {
          const next = { ...prev };
          delete next[roomId];
          return next;
        });
      }
    }

    setDragging(null);
  };
  // Calculate bounding box for the viewBox from the plot boundary
  let minX = 0, minY = 0, maxX = 10000, maxY = 10000;
  if (plotReference && typeof plotReference !== 'string' && plotReference.boundary) {
    const vertices = plotReference.boundary.vertices;
    if (vertices.length > 0) {
      minX = Math.min(...vertices.map(v => v.x));
      minY = Math.min(...vertices.map(v => v.y));
      maxX = Math.max(...vertices.map(v => v.x));
      maxY = Math.max(...vertices.map(v => v.y));
    }
  }

  // Add padding so plot boundary is clearly visible
  const padding = 500;
  const viewBox = `${minX - padding} ${minY - padding} ${(maxX - minX) + padding * 2} ${(maxY - minY) + padding * 2}`;


  return (
    <div className="w-full h-[600px] overflow-hidden bg-white border rounded-lg shadow-sm">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-crosshair touch-none"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Plot boundary */}
        {plotReference && typeof plotReference !== 'string' && plotReference.boundary && (
          <polygon
            points={plotReference.boundary.vertices.map(v => `${v.x},${v.y}`).join(' ')}
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="15"
            strokeDasharray="30,30"
          />
        )}

        {/* Rooms */}
        {rooms.map((room: Room) => {
          if (!room.derivedPolygon) return null;
          const offset = offsets[room.id] || { x: 0, y: 0 };
          const pts = room.derivedPolygon.vertices.map(v => ({ x: v.x + offset.x, y: v.y + offset.y }));

          const roomMinX = Math.min(...pts.map(v => v.x));
          const roomMinY = Math.min(...pts.map(v => v.y));
          const roomMaxX = Math.max(...pts.map(v => v.x));
          const roomMaxY = Math.max(...pts.map(v => v.y));
          
          const cx = (roomMinX + roomMaxX) / 2;
          const cy = (roomMinY + roomMaxY) / 2;
          const w = roomMaxX - roomMinX;
          const d = roomMaxY - roomMinY;
          
          // Color tinting per room type
          const rType = (room.type as string).toUpperCase();
          let roomBg = "#ffffff";
          if (rType.includes('LIVING') || rType.includes('HALL')) roomBg = "#f8fafc";
          if (rType.includes('DINING')) roomBg = "#f1f5f9";
          if (rType.includes('BED')) roomBg = "#faf5ff";
          if (rType.includes('KITCHEN')) roomBg = "#ecfdf5";
          if (rType.includes('BATH')) roomBg = "#f1f5f9";
          if (rType.includes('POOJA')) roomBg = "#fffbeb";
          if (rType.includes('STUDY')) roomBg = "#f5f3ff";
          if (rType.includes('BALCONY')) roomBg = "#f3f4f6";

          const areaSqM = ((w * d) / 1000000).toFixed(1);
          const areaSqFt = Math.round((w * d) / 1000000 * 10.764);
          const displayName = room.name || room.type.toUpperCase();

          return (
            <g 
              key={room.id} 
              onMouseDown={(e) => handlePointerDown(e, room.id)}
              onTouchStart={(e) => handlePointerDown(e, room.id)}
              className={readOnly ? "" : "cursor-move"}
              style={{ transition: dragging ? 'none' : 'transform 0.1s' }}
            >
              {/* Thick architectural walls */}
              <polygon
                points={pts.map(v => `${v.x},${v.y}`).join(' ')}
                fill={dragging?.id === room.id ? "#e2e8f0" : roomBg}
                stroke="#0f172a"
                strokeWidth="220"
                strokeLinejoin="miter"
                className="hover:opacity-95 transition-all"
              />
              {/* Inner subtle blueprint border */}
              <polygon
                points={pts.map(v => `${v.x},${v.y}`).join(' ')}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="30"
              />
              <text
                x={cx}
                y={cy - 60}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="130"
                fontWeight="700"
                fill="#1e293b"
                letterSpacing="3"
              >
                {displayName.toUpperCase()}
              </text>
              <text
                x={cx}
                y={cy + 40}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="90"
                fontWeight="500"
                fill="#475569"
              >
                {(w / 1000).toFixed(1)}m × {(d / 1000).toFixed(1)}m
              </text>
              <text
                x={cx}
                y={cy + 130}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="75"
                fill="#64748b"
              >
                {areaSqM} m² ({areaSqFt} sq ft)
              </text>
            </g>
          );
        })}

        {/* Doors with AutoCAD-style Swing Arcs */}
        {design.doors && design.doors.map((door: any) => {
          const isVert = door._orientationAngle === 90;
          const w = isVert ? 220 : door.width;
          const h = isVert ? door.width : 220;
          const isMain = door.type === 'EXTERNAL';

          return (
            <g key={door.id}>
              {/* Wall opening cutout */}
              <rect 
                x={door._location.x - w / 2} 
                y={door._location.y - h / 2} 
                width={w} 
                height={h} 
                fill="#ffffff" 
              />
              {/* Swing Arc */}
              <path
                d={isVert
                  ? `M ${door._location.x} ${door._location.y - door.width / 2} A ${door.width} ${door.width} 0 0 1 ${door._location.x + door.width / 2} ${door._location.y}`
                  : `M ${door._location.x - door.width / 2} ${door._location.y} A ${door.width} ${door.width} 0 0 1 ${door._location.x} ${door._location.y + door.width / 2}`
                }
                fill="none"
                stroke={isMain ? "#3b82f6" : "#f59e0b"}
                strokeWidth="25"
                strokeDasharray="40,25"
                opacity="0.8"
              />
              {/* Door Leaf */}
              <rect 
                x={isVert ? door._location.x - 12 : door._location.x - door.width / 2} 
                y={isVert ? door._location.y - door.width / 2 : door._location.y - 12} 
                width={isVert ? 24 : door.width} 
                height={isVert ? door.width : 24} 
                fill={isMain ? "#2563eb" : "#d97706"} 
                rx="6"
              />
              {/* External Main Entrance Indicator */}
              {isMain && (
                <g transform={`translate(${door._location.x}, ${door._location.y - 300})`}>
                  <rect x="-350" y="-120" width="700" height="180" rx="40" fill="#2563eb" />
                  <text x="0" y="-15" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="90" fontWeight="bold">
                    MAIN ENTRANCE
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
