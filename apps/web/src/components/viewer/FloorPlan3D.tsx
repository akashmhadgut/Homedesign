import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Html, Text } from '@react-three/drei';
import { Geometry, Base, Subtraction } from '@react-three/csg';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { useThree } from '@react-three/fiber';
import type { HouseDesign } from '@aihome/domain';

interface FloorPlan3DProps {
  design: HouseDesign | null;
}

function SceneExporter() {
  const { scene } = useThree();

  const handleExport = () => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        const output = JSON.stringify(gltf, null, 2);
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'AiHome_Architectural_Model.gltf';
        a.click();
        URL.revokeObjectURL(url);
      },
      (error) => console.error('Export failed', error),
      {}
    );
  };

  return (
    <Html position={[-4.5, 9, -4.5]} center zIndexRange={[100, 0]}>
      <button 
        onClick={handleExport}
        className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg whitespace-nowrap transition"
      >
        Export .GLTF Model
      </button>
    </Html>
  );
}

// =========================================================================
// ARCHITECTURAL 3D INTERIOR ASSETS & FURNITURE
// =========================================================================

// 1. Palatial Master Bed with Dual Nightstands & Bedside Rug
const MasterBed = () => (
  <group>
    {/* Plush Area Rug */}
    <Box args={[2.8, 0.02, 2.8]} position={[0, 0.02, 0.2]} receiveShadow>
      <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
    </Box>
    {/* Headboard */}
    <Box args={[2.2, 1.1, 0.15]} position={[0, 0.55, -1.05]} castShadow receiveShadow>
      <meshStandardMaterial color="#334155" roughness={0.6} />
    </Box>
    {/* Bed Frame */}
    <Box args={[1.9, 0.35, 2.1]} position={[0, 0.18, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#475569" roughness={0.7} />
    </Box>
    {/* King Mattress */}
    <Box args={[1.8, 0.25, 2.0]} position={[0, 0.45, 0.05]} castShadow receiveShadow>
      <meshStandardMaterial color="#ffffff" roughness={0.9} />
    </Box>
    {/* Pillows */}
    <Box args={[0.7, 0.12, 0.4]} position={[-0.45, 0.62, -0.7]} castShadow>
      <meshStandardMaterial color="#f1f5f9" />
    </Box>
    <Box args={[0.7, 0.12, 0.4]} position={[0.45, 0.62, -0.7]} castShadow>
      <meshStandardMaterial color="#f1f5f9" />
    </Box>
    {/* Duvet / Throw Blanket */}
    <Box args={[1.82, 0.27, 1.3]} position={[0, 0.46, 0.4]} castShadow>
      <meshStandardMaterial color="#0284c7" roughness={0.8} />
    </Box>
    {/* Left Nightstand */}
    <Box args={[0.5, 0.45, 0.45]} position={[-1.25, 0.22, -0.9]} castShadow receiveShadow>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    {/* Left Lamp */}
    <Cylinder args={[0.12, 0.15, 0.25, 16]} position={[-1.25, 0.58, -0.9]} castShadow>
      <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.3} />
    </Cylinder>
    {/* Right Nightstand */}
    <Box args={[0.5, 0.45, 0.45]} position={[1.25, 0.22, -0.9]} castShadow receiveShadow>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    {/* Right Lamp */}
    <Cylinder args={[0.12, 0.15, 0.25, 16]} position={[1.25, 0.58, -0.9]} castShadow>
      <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.3} />
    </Cylinder>
    {/* Built-in Sliding Wardrobe / Dressing Closet */}
    <Box args={[2.0, 1.25, 0.5]} position={[0, 0.625, 1.35]} castShadow receiveShadow>
      <meshStandardMaterial color="#1e293b" roughness={0.4} />
    </Box>
    <Box args={[0.95, 1.2, 0.02]} position={[-0.48, 0.625, 1.1]} castShadow>
      <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.1} />
    </Box>
    <Box args={[0.95, 1.2, 0.02]} position={[0.48, 0.625, 1.1]} castShadow>
      <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.1} />
    </Box>
    {/* Wardrobe Metallic Trim Handles */}
    <Box args={[0.03, 0.35, 0.04]} position={[-0.04, 0.625, 1.08]} castShadow>
      <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
    </Box>
    <Box args={[0.03, 0.35, 0.04]} position={[0.04, 0.625, 1.08]} castShadow>
      <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
    </Box>
  </group>
);

// 2. Standard Bedroom Suite
const StandardBed = () => (
  <group>
    {/* Bed Frame */}
    <Box args={[1.6, 0.3, 2.0]} position={[0, 0.15, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#8b7355" />
    </Box>
    {/* Mattress */}
    <Box args={[1.5, 0.2, 1.9]} position={[0, 0.4, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#ffffff" />
    </Box>
    {/* Pillows */}
    <Box args={[0.6, 0.1, 0.4]} position={[-0.4, 0.55, -0.7]} castShadow>
      <meshStandardMaterial color="#e2e8f0" />
    </Box>
    <Box args={[0.6, 0.1, 0.4]} position={[0.4, 0.55, -0.7]} castShadow>
      <meshStandardMaterial color="#e2e8f0" />
    </Box>
    {/* Blanket */}
    <Box args={[1.52, 0.22, 1.2]} position={[0, 0.4, 0.35]} castShadow>
      <meshStandardMaterial color="#64748b" />
    </Box>
    {/* Nightstand */}
    <Box args={[0.45, 0.4, 0.4]} position={[1.05, 0.2, -0.8]} castShadow>
      <meshStandardMaterial color="#64748b" />
    </Box>
  </group>
);

// 3. Living Room Sectional Sofa & Media Lounge
const LivingLounge = () => (
  <group>
    {/* Designer Area Rug */}
    <Box args={[3.2, 0.02, 2.4]} position={[0, 0.02, 0]} receiveShadow>
      <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
    </Box>
    {/* Main Sofa Base */}
    <Box args={[2.4, 0.4, 0.9]} position={[0, 0.2, -0.5]} castShadow receiveShadow>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    {/* Sofa Backrest */}
    <Box args={[2.4, 0.5, 0.2]} position={[0, 0.65, -0.85]} castShadow receiveShadow>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    {/* L-Shape Chaise Extension */}
    <Box args={[0.9, 0.4, 1.2]} position={[-0.75, 0.2, 0.35]} castShadow receiveShadow>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    {/* Coffee Table */}
    <Box args={[1.2, 0.35, 0.6]} position={[0.3, 0.18, 0.1]} castShadow receiveShadow>
      <meshStandardMaterial color="#94a3b8" metalness={0.2} roughness={0.4} />
    </Box>
    {/* TV Console Unit on Wall */}
    <Box args={[2.0, 0.4, 0.35]} position={[0.2, 0.2, 1.2]} castShadow receiveShadow>
      <meshStandardMaterial color="#0f172a" />
    </Box>
    <Box args={[1.6, 0.8, 0.05]} position={[0.2, 0.8, 1.25]} castShadow>
      <meshStandardMaterial color="#020617" roughness={0.2} />
    </Box>
    {/* Potted Indoor Plant */}
    <Cylinder args={[0.2, 0.15, 0.4, 16]} position={[1.4, 0.2, -0.7]} castShadow>
      <meshStandardMaterial color="#e2e8f0" />
    </Cylinder>
    <Cylinder args={[0.28, 0.1, 0.5, 8]} position={[1.4, 0.6, -0.7]} castShadow>
      <meshStandardMaterial color="#15803d" />
    </Cylinder>
  </group>
);

// 4. Formal Dining Suite (6 to 8 Seater)
const FormalDining = () => (
  <group>
    {/* Dining Table Top */}
    <Box args={[2.2, 0.06, 1.1]} position={[0, 0.75, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#78350f" roughness={0.4} />
    </Box>
    {/* Table Base */}
    <Box args={[1.8, 0.72, 0.8]} position={[0, 0.36, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#1c1917" />
    </Box>
    {/* Chairs - Side 1 */}
    {[-0.6, 0, 0.6].map((xOffset, i) => (
      <group key={`chair-s1-${i}`} position={[xOffset, 0, -0.75]}>
        <Box args={[0.42, 0.45, 0.42]} position={[0, 0.22, 0]} castShadow>
          <meshStandardMaterial color="#334155" />
        </Box>
        <Box args={[0.42, 0.45, 0.05]} position={[0, 0.67, -0.18]} castShadow>
          <meshStandardMaterial color="#334155" />
        </Box>
      </group>
    ))}
    {/* Chairs - Side 2 */}
    {[-0.6, 0, 0.6].map((xOffset, i) => (
      <group key={`chair-s2-${i}`} position={[xOffset, 0, 0.75]}>
        <Box args={[0.42, 0.45, 0.42]} position={[0, 0.22, 0]} castShadow>
          <meshStandardMaterial color="#334155" />
        </Box>
        <Box args={[0.42, 0.45, 0.05]} position={[0, 0.67, 0.18]} castShadow>
          <meshStandardMaterial color="#334155" />
        </Box>
      </group>
    ))}
  </group>
);

// 5. Chef's Modular Kitchen with Breakfast Island Counter
const ChefKitchen = ({ width, depth }: { width: number; depth: number }) => (
  <group>
    {/* Main Counter along Wall */}
    <Box args={[width - 0.3, 0.88, 0.65]} position={[0, 0.44, -depth / 2 + 0.35]} castShadow receiveShadow>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    {/* Marble Countertop */}
    <Box args={[width - 0.3, 0.05, 0.7]} position={[0, 0.89, -depth / 2 + 0.35]} castShadow receiveShadow>
      <meshStandardMaterial color="#f8fafc" roughness={0.3} />
    </Box>
    {/* Upper Wall Cabinets */}
    <Box args={[width - 0.5, 0.65, 0.35]} position={[0, 1.15, -depth / 2 + 0.2]} castShadow receiveShadow>
      <meshStandardMaterial color="#334155" roughness={0.4} />
    </Box>
    {/* Double-door Refrigerator */}
    <Box args={[0.85, 1.25, 0.75]} position={[width / 2 - 0.55, 0.625, -depth / 2 + 0.4]} castShadow>
      <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
    </Box>
    {/* Cooktop Induction Stove */}
    <Box args={[0.7, 0.02, 0.5]} position={[-0.4, 0.92, -depth / 2 + 0.35]} castShadow>
      <meshStandardMaterial color="#0f172a" />
    </Box>
    {/* Sink Basin */}
    <Box args={[0.6, 0.02, 0.4]} position={[0.5, 0.92, -depth / 2 + 0.35]} castShadow>
      <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
    </Box>

    {/* Modern Breakfast Island Counter with Waterfall Edge */}
    <Box args={[Math.min(2.2, width * 0.7), 0.92, 0.6]} position={[0, 0.46, depth / 2 - 0.45]} castShadow receiveShadow>
      <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.05} />
    </Box>
    {/* Barstools facing the living/dining area */}
    {[-0.45, 0.45].map((bx, i) => (
      <group key={`barstool-${i}`} position={[bx, 0, depth / 2 + 0.05]}>
        <Cylinder args={[0.03, 0.03, 0.65, 8]} position={[0, 0.325, 0]} castShadow>
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </Cylinder>
        <Cylinder args={[0.18, 0.18, 0.06, 16]} position={[0, 0.65, 0]} castShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </Cylinder>
      </group>
    ))}
  </group>
);

// 6. Luxury Bathroom with Walk-in Shower & Vanity
const LuxuryBathroom = () => (
  <group>
    {/* Vanity Counter */}
    <Box args={[0.85, 0.85, 0.45]} position={[-0.3, 0.42, -0.45]} castShadow receiveShadow>
      <meshStandardMaterial color="#334155" />
    </Box>
    <Box args={[0.7, 0.7, 0.02]} position={[-0.3, 1.25, -0.66]} castShadow>
      <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
    </Box>
    {/* Modern Wall-Hung Toilet */}
    <Box args={[0.4, 0.4, 0.55]} position={[0.4, 0.2, -0.35]} castShadow receiveShadow>
      <meshStandardMaterial color="#ffffff" roughness={0.2} />
    </Box>
    {/* Glass Walk-in Shower Screen */}
    <Box args={[0.05, 2.0, 0.9]} position={[0, 1.0, 0.4]} castShadow>
      <meshStandardMaterial color="#93c5fd" transparent opacity={0.4} roughness={0.1} />
    </Box>
  </group>
);

// 7. Pooja Mandir Sacred Shrine
const PoojaMandir = () => (
  <group>
    {/* Marble Altar Platform */}
    <Box args={[1.1, 0.6, 0.6]} position={[0, 0.3, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#f8fafc" roughness={0.2} />
    </Box>
    {/* Temple Canopy Arch */}
    <Box args={[0.9, 0.9, 0.4]} position={[0, 1.0, 0]} castShadow>
      <meshStandardMaterial color="#fef08a" metalness={0.4} roughness={0.3} />
    </Box>
    {/* Sacred Diya / Brass Accent */}
    <Cylinder args={[0.08, 0.05, 0.1, 16]} position={[0, 0.65, 0]} castShadow>
      <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.5} />
    </Cylinder>
  </group>
);

// 8. Executive Study Workspace
const StudyOffice = () => (
  <group>
    {/* Executive Desk */}
    <Box args={[1.5, 0.75, 0.75]} position={[0, 0.375, -0.2]} castShadow receiveShadow>
      <meshStandardMaterial color="#451a03" />
    </Box>
    {/* Desktop Monitor */}
    <Box args={[0.6, 0.38, 0.05]} position={[0, 0.95, -0.25]} castShadow>
      <meshStandardMaterial color="#020617" />
    </Box>
    {/* Ergonomic Office Chair */}
    <Box args={[0.45, 0.45, 0.45]} position={[0, 0.225, 0.4]} castShadow>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    {/* Bookshelf */}
    <Box args={[1.2, 1.8, 0.35]} position={[0, 0.9, 0.8]} castShadow>
      <meshStandardMaterial color="#292524" />
    </Box>
  </group>
);

// 9. Outdoor Balcony Sitout with Glass Railing & Planters
const BalconyLounge = () => (
  <group>
    {/* Outdoor Coffee Table */}
    <Cylinder args={[0.35, 0.35, 0.45, 16]} position={[0, 0.22, 0]} castShadow>
      <meshStandardMaterial color="#1e293b" />
    </Cylinder>
    {/* Modern Curved Patio Armchairs */}
    <Box args={[0.55, 0.45, 0.55]} position={[-0.7, 0.22, 0]} castShadow>
      <meshStandardMaterial color="#0284c7" />
    </Box>
    <Box args={[0.55, 0.45, 0.55]} position={[0.7, 0.22, 0]} castShadow>
      <meshStandardMaterial color="#0284c7" />
    </Box>
    {/* Architectural Glass Railing with Chrome Handrail */}
    <Box args={[2.4, 0.85, 0.03]} position={[0, 0.45, 1.1]} castShadow>
      <meshStandardMaterial color="#93c5fd" transparent opacity={0.35} roughness={0.1} />
    </Box>
    <Box args={[2.42, 0.04, 0.06]} position={[0, 0.88, 1.1]} castShadow>
      <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
    </Box>
    {/* Balcony Corner Planters */}
    <Cylinder args={[0.18, 0.14, 0.4, 16]} position={[-1.0, 0.2, 0.8]} castShadow>
      <meshStandardMaterial color="#334155" />
    </Cylinder>
    <Cylinder args={[0.22, 0.08, 0.45, 8]} position={[-1.0, 0.55, 0.8]} castShadow>
      <meshStandardMaterial color="#16a34a" />
    </Cylinder>
    <Cylinder args={[0.18, 0.14, 0.4, 16]} position={[1.0, 0.2, 0.8]} castShadow>
      <meshStandardMaterial color="#334155" />
    </Cylinder>
    <Cylinder args={[0.22, 0.08, 0.45, 8]} position={[1.0, 0.55, 0.8]} castShadow>
      <meshStandardMaterial color="#16a34a" />
    </Cylinder>
  </group>
);

// =========================================================================
// MAIN 3D ARCHITECTURAL FLOOR PLAN VIEWPORT
// =========================================================================

export function FloorPlan3D({ design }: FloorPlan3DProps) {
  const [showRoof, setShowRoof] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [cutawayMode, setCutawayMode] = useState(true);
  
  const scale = 0.001;
  
  // Calculate bounding box of the entire house (Must be called unconditionally)
  const houseBounds = useMemo(() => {
    if (!design || design.rooms.length === 0) return null;
    const allVertices = design.rooms.flatMap(r => r.derivedPolygon?.vertices || []);
    if (allVertices.length === 0) return null;
    const minX = Math.min(...allVertices.map(v => v.x)) * scale;
    const maxX = Math.max(...allVertices.map(v => v.x)) * scale;
    const minY = Math.min(...allVertices.map(v => v.y)) * scale;
    const maxY = Math.max(...allVertices.map(v => v.y)) * scale;
    return {
      minX, maxX, minY, maxY,
      width: maxX - minX,
      depth: maxY - minY,
      centerX: minX + (maxX - minX) / 2,
      centerZ: minY + (maxY - minY) / 2
    };
  }, [design, scale]);

  if (!design || !houseBounds) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-slate-500 font-medium">
        No 3D design generated yet. Fill out the brief and click Generate.
      </div>
    );
  }

  const wallThickness = 0.22; // 220mm structural walls
  const wallHeight = cutawayMode ? 1.35 : 2.8; // 1.35m cutaway view, 2.8m full height

  // Dynamic camera distance tailored to estate size (from small 1BHK up to 6BHK mansion)
  const maxSpan = Math.max(houseBounds.width, houseBounds.depth);
  const cameraDistance = Math.max(16, maxSpan * 1.35);

  return (
    <div className="w-full h-[650px] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700 relative">
      {/* HUD Control Bar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={() => setCutawayMode(!cutawayMode)}
          className="bg-indigo-600/90 hover:bg-indigo-500 text-white backdrop-blur-md text-xs font-semibold px-4 py-2 rounded-lg shadow-md border border-indigo-400 transition"
        >
          {cutawayMode ? 'Cutaway 3D (1.35m)' : 'Full Walls (2.8m)'}
        </button>
        <button 
          onClick={() => setShowRoof(!showRoof)}
          className="bg-slate-800/90 hover:bg-slate-700 text-white backdrop-blur-md text-xs font-semibold px-4 py-2 rounded-lg shadow-md border border-slate-600 transition"
        >
          {showRoof ? 'View Cutaway Interior' : 'Show Roof Exterior'}
        </button>
        <button 
          onClick={() => setShowLabels(!showLabels)}
          className="bg-slate-800/90 hover:bg-slate-700 text-white backdrop-blur-md text-xs font-semibold px-4 py-2 rounded-lg shadow-md border border-slate-600 transition"
        >
          {showLabels ? 'Hide Room Tags' : 'Show Room Tags'}
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-10 bg-slate-950/80 backdrop-blur-md text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-800">
        Left Click: Rotate • Right Click: Pan • Scroll: Zoom
      </div>

      <Canvas camera={{ position: [houseBounds.centerX, cameraDistance * 0.9, houseBounds.centerZ + cameraDistance * 0.7], fov: 45 }} shadows>
        <color attach="background" args={['#0f172a']} />
        
        {/* Architectural Studio Lighting Setup */}
        <ambientLight intensity={0.65} />
        <directionalLight 
          position={[35, 45, 25]} 
          intensity={1.3} 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048} 
          shadow-camera-far={120}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-20, 25, -20]} intensity={0.4} color="#38bdf8" />
        
        <SceneExporter />
        <OrbitControls target={[houseBounds.centerX, 0, houseBounds.centerZ]} maxPolarAngle={Math.PI / 2 - 0.05} />

        {/* Estate Landscape Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[houseBounds.centerX, -0.01, houseBounds.centerZ]} receiveShadow>
          <planeGeometry args={[150, 150]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>

        <group>
          {/* 
            CSG ARCHITECTURAL WALL GENERATOR
            Solid structural envelope with room and door subtractions
          */}
          <mesh castShadow receiveShadow position={[houseBounds.centerX, wallHeight / 2, houseBounds.centerZ]}>
            <Geometry>
              <Base>
                <boxGeometry args={[houseBounds.width, wallHeight, houseBounds.depth]} />
              </Base>
              
              {design.rooms.map((room) => {
                if (!room.derivedPolygon) return null;
                const minX = Math.min(...room.derivedPolygon.vertices.map(v => v.x)) * scale;
                const maxX = Math.max(...room.derivedPolygon.vertices.map(v => v.x)) * scale;
                const minY = Math.min(...room.derivedPolygon.vertices.map(v => v.y)) * scale;
                const maxY = Math.max(...room.derivedPolygon.vertices.map(v => v.y)) * scale;

                const width = (maxX - minX);
                const depth = (maxY - minY);
                const x = minX + width / 2 - houseBounds.centerX;
                const z = minY + depth / 2 - houseBounds.centerZ;
                
                return (
                  <Subtraction key={`sub-${room.id}`} position={[x, 0, z]}>
                    <boxGeometry args={[width - wallThickness, wallHeight + 0.1, depth - wallThickness]} />
                  </Subtraction>
                );
              })}

              {/* Punch out all doors generated by the engine */}
              {design.doors && design.doors.map((door: any) => {
                const x = door._location.x * scale - houseBounds.centerX;
                const z = door._location.y * scale - houseBounds.centerZ;
                
                const dw = door._orientationAngle === 90 ? wallThickness * 2.2 : door.width * scale;
                const dd = door._orientationAngle === 0 ? wallThickness * 2.2 : door.width * scale;
                
                return (
                  <Subtraction key={door.id} position={[x, -wallHeight / 2 + (door.height * scale) / 2, z]}>
                    <boxGeometry args={[dw, door.height * scale, dd]} />
                  </Subtraction>
                );
              })}
            </Geometry>
            <meshStandardMaterial color="#f8fafc" roughness={0.75} />
          </mesh>

          {/* ROOM FLOOR SURFACES, FURNITURE & LABELS */}
          {design.rooms.map((room, roomIndex) => {
            if (!room.derivedPolygon) return null;
            const minX = Math.min(...room.derivedPolygon.vertices.map(v => v.x)) * scale;
            const maxX = Math.max(...room.derivedPolygon.vertices.map(v => v.x)) * scale;
            const minY = Math.min(...room.derivedPolygon.vertices.map(v => v.y)) * scale;
            const maxY = Math.max(...room.derivedPolygon.vertices.map(v => v.y)) * scale;

            const width = (maxX - minX);
            const depth = (maxY - minY);
            const x = minX + width / 2;
            const z = minY + depth / 2;
            
            const rType = (room.type as string).toUpperCase();

            // Assign luxury floor materials based on room designation
            let floorColor = '#b45309'; // Warm European oak hardwood floor for bedrooms
            if (rType.includes('LIVING') || rType.includes('HALL') || rType.includes('DINING')) floorColor = '#fdfbf7'; // High-gloss ivory porcelain tile
            if (rType.includes('KITCHEN')) floorColor = '#f1f5f9'; // Polished stone tile
            if (rType.includes('BATH')) floorColor = '#1e293b'; // Modern charcoal slate stone tile
            if (rType.includes('POOJA')) floorColor = '#ffffff'; // Pure pristine marble
            if (rType.includes('STUDY')) floorColor = '#78350f'; // Walnut parquet
            if (rType.includes('BALCONY')) floorColor = '#573a1e'; // Composite teak deck planks

            const isMasterBed = rType.includes('BED') && (room.name?.toLowerCase().includes('master') || roomIndex === 0);
            const displayName = room.name || room.type.toUpperCase();

            return (
              <group key={`room-content-${room.id}`} position={[x, 0, z]}>
                
                {/* Floor Surface */}
                <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                  <planeGeometry args={[width - wallThickness, depth - wallThickness]} />
                  <meshStandardMaterial color={floorColor} roughness={0.5} />
                </mesh>

                {/* 3D Room Identifier Tag */}
                {showLabels && (
                  <Text 
                    position={[0, 0.12, 0]} 
                    rotation={[-Math.PI / 2, 0, 0]} 
                    fontSize={Math.min(0.45, width * 0.12)} 
                    color="#0f172a" 
                    anchorX="center" 
                    anchorY="middle"
                    fillOpacity={0.75}
                  >
                    {displayName.toUpperCase()}
                  </Text>
                )}

                {/* Dynamic Smart Furniture Placement */}
                {rType.includes('BED') && (
                  <group position={[0, 0, 0]}>
                    {isMasterBed ? <MasterBed /> : <StandardBed />}
                  </group>
                )}
                
                {(rType.includes('LIVING') || rType.includes('HALL')) && (
                  <group position={[0, 0, 0]}>
                    <LivingLounge />
                  </group>
                )}

                {rType.includes('DINING') && (
                  <group position={[0, 0, 0]}>
                    <FormalDining />
                  </group>
                )}

                {rType.includes('KITCHEN') && (
                  <group position={[0, 0, 0]}>
                    <ChefKitchen width={width - wallThickness} depth={depth - wallThickness} />
                  </group>
                )}

                {rType.includes('BATH') && (
                  <group position={[0, 0, 0]}>
                    <LuxuryBathroom />
                  </group>
                )}

                {rType.includes('POOJA') && (
                  <group position={[0, 0, 0]}>
                    <PoojaMandir />
                  </group>
                )}

                {rType.includes('STUDY') && (
                  <group position={[0, 0, 0]}>
                    <StudyOffice />
                  </group>
                )}

                {rType.includes('BALCONY') && (
                  <group position={[0, 0, 0]}>
                    <BalconyLounge />
                  </group>
                )}

              </group>
            );
          })}
        </group>

        {/* Exterior Roof Structure */}
        {showRoof && houseBounds && (
          <mesh 
            position={[houseBounds.centerX, wallHeight + 1.2, houseBounds.centerZ]} 
            rotation={[0, Math.PI / 4, 0]} 
            castShadow
          >
            <cylinderGeometry args={[0.2, Math.max(houseBounds.width, houseBounds.depth) * 0.85, 2.4, 4]} />
            <meshStandardMaterial color="#0284c7" roughness={0.8} />
          </mesh>
        )}
      </Canvas>
    </div>
  );
}
