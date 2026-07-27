/**
 * File: frontend/src/components/3d/ContainerPreview3DCanvas.jsx
 * Purpose: Three.js / React Three Fiber viewport engine for the Enterprise 3D Container Visualizer.
 * Supports realistic shipping containers (20FT, 40FT, 40HC), PBR materials, 9 unique category 3D models, and smooth camera views.
 */
import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Category Stacking & Model Resolver Helper
function getCategoryType(categoryName = '', productName = '') {
  const nameStr = (categoryName + ' ' + productName).toLowerCase();
  
  if (nameStr.includes('grow bag') || nameStr.includes('growbag')) {
    if (nameStr.includes('open top') || nameStr.includes('opentop')) return 'open_top_grow_bag';
    return 'grow_bag';
  }
  if (nameStr.includes('rope') || nameStr.includes('curled')) return 'curled_rope';
  if (nameStr.includes('bale') || nameStr.includes('fibre bale')) return 'coir_bale';
  if (nameStr.includes('cube')) return 'coco_cubes';
  if (nameStr.includes('briquette') || nameStr.includes('brick')) return 'briquette';
  if (nameStr.includes('geotextile') || nameStr.includes('mat') || nameStr.includes('roll')) return 'geotextile_roll';
  if (nameStr.includes('log')) return 'coir_log';
  return 'cocopeat_block'; // Default compressed block
}

// ----------------------------------------------------
// 1. PROCEDURAL CATEGORY 3D MODEL COMPONENTS (9 UNIQUE MODELS)
// ----------------------------------------------------

// 1. Cocopeat Block (Square compressed coir block with grid texture & strapping)
function CocopeatBlockMesh({ dims }) {
  const geometry = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#4A2C11', // Rich earthy coconut brown
      roughness: 0.85,
      metalness: 0.1,
    });
  }, []);

  return <mesh geometry={geometry} material={material} castShadow receiveShadow />;
}

// 2. Grow Bag (Soft white UV bag with dark soil substrate inside)
function GrowBagMesh({ dims }) {
  const bagGeo = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const bagMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#F4F4F0', // White UV treated plastic
      roughness: 0.4,
      metalness: 0.05,
    });
  }, []);

  return (
    <group>
      <mesh geometry={bagGeo} material={bagMat} castShadow receiveShadow />
      {/* Top opening accent */}
      <mesh position={[0, dims[1] / 2 + 0.005, 0]}>
        <planeGeometry args={[dims[0] * 0.9, dims[2] * 0.9]} />
        <meshStandardMaterial color="#2B1810" roughness={0.9} />
      </mesh>
    </group>
  );
}

// 3. Curled Coir Rope (Cylindrical coil model)
function CurledRopeMesh({ dims }) {
  const radius = Math.min(dims[0], dims[2]) / 2;
  const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(radius, radius, dims[1], 16), [radius, dims]);
  const ropeMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#8B5A2B', // Golden brown coir fiber
      roughness: 0.9,
      metalness: 0.0,
    });
  }, []);

  return <mesh geometry={cylinderGeo} material={ropeMat} castShadow receiveShadow />;
}

// 4. Coir Fibre Bale (Large compressed rectangular bale bound with plastic bands)
function CoirBaleMesh({ dims }) {
  const baleGeo = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const baleMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#A06D3B', // Natural golden coir
      roughness: 0.95,
      metalness: 0.0,
    });
  }, []);

  return <mesh geometry={baleGeo} material={baleMat} castShadow receiveShadow />;
}

// 5. Coco Cubes (Compact cube grid matrix)
function CocoCubesMesh({ dims }) {
  const boxGeo = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const cubeMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#3D2314',
      roughness: 0.8,
    });
  }, []);

  return <mesh geometry={boxGeo} material={cubeMat} castShadow receiveShadow />;
}

// 6. Coir Briquettes (Brick style arrangement)
function BriquetteMesh({ dims }) {
  const brickGeo = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const brickMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#5C3818',
      roughness: 0.75,
    });
  }, []);

  return <mesh geometry={brickGeo} material={brickMat} castShadow receiveShadow />;
}

// 7. Geotextile Rolls (Horizontal roll cylinder)
function GeotextileRollMesh({ dims }) {
  const radius = dims[1] / 2;
  const rollGeo = useMemo(() => new THREE.CylinderGeometry(radius, radius, dims[0], 16), [radius, dims]);
  const rollMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#6B4226',
      roughness: 0.85,
    });
  }, []);

  return (
    <mesh geometry={rollGeo} material={rollMat} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow />
  );
}

// 8. Open Top Grow Bag
function OpenTopBagMesh({ dims }) {
  const bagGeo = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const bagMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1E1E1E', // Black UV grow bag
      roughness: 0.5,
    });
  }, []);

  return (
    <group>
      <mesh geometry={bagGeo} material={bagMat} castShadow receiveShadow />
      <mesh position={[0, dims[1] / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[dims[0] * 0.95, dims[2] * 0.95]} />
        <meshStandardMaterial color="#3B2219" roughness={0.95} />
      </mesh>
    </group>
  );
}

// 9. Coir Log (Long erosion log)
function CoirLogMesh({ dims }) {
  const radius = dims[1] / 2;
  const logGeo = useMemo(() => new THREE.CylinderGeometry(radius, radius, dims[0], 16), [radius, dims]);
  const logMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#70441E',
      roughness: 0.9,
    });
  }, []);

  return <mesh geometry={logGeo} material={logMat} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow />;
}

// Universal Model Selector Router
function UniversalProductItem({ categoryType, dims }) {
  switch (categoryType) {
    case 'grow_bag':
      return <GrowBagMesh dims={dims} />;
    case 'curled_rope':
      return <CurledRopeMesh dims={dims} />;
    case 'coir_bale':
      return <CoirBaleMesh dims={dims} />;
    case 'coco_cubes':
      return <CocoCubesMesh dims={dims} />;
    case 'briquette':
      return <BriquetteMesh dims={dims} />;
    case 'geotextile_roll':
      return <GeotextileRollMesh dims={dims} />;
    case 'open_top_grow_bag':
      return <OpenTopBagMesh dims={dims} />;
    case 'coir_log':
      return <CoirLogMesh dims={dims} />;
    case 'cocopeat_block':
    default:
      return <CocopeatBlockMesh dims={dims} />;
  }
}

// ----------------------------------------------------
// 2. WOODEN PALLET WITH STACKED PRODUCTS
// ----------------------------------------------------
function PalletWithStack({ position, categoryType, itemDims }) {
  const palletWidth = 1.05;
  const palletDepth = 1.05;
  const palletHeight = 0.14;

  // Compute how many items fit on pallet
  const [l, w, h] = itemDims;
  const itemsX = Math.max(1, Math.floor(palletWidth / l));
  const itemsZ = Math.max(1, Math.floor(palletDepth / w));
  const layersY = Math.max(1, Math.min(8, Math.floor(2.0 / h)));

  const startX = -((itemsX - 1) * l) / 2;
  const startZ = -((itemsZ - 1) * w) / 2;

  return (
    <group position={position}>
      {/* Wooden Pallet Base */}
      <mesh position={[0, palletHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[palletWidth, palletHeight, palletDepth]} />
        <meshStandardMaterial color="#C2A682" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Stacked Product Units */}
      {Array.from({ length: layersY }).map((_, ly) => (
        <group key={ly} position={[0, palletHeight + ly * h + h / 2, 0]}>
          {Array.from({ length: itemsX }).map((_, ix) => (
            <group key={ix} position={[startX + ix * l, 0, 0]}>
              {Array.from({ length: itemsZ }).map((_, iz) => (
                <group key={iz} position={[0, 0, startZ + iz * w]}>
                  <UniversalProductItem categoryType={categoryType} dims={itemDims} />
                </group>
              ))}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

// ----------------------------------------------------
// 3. INDUSTRIAL SHIPPING CONTAINER MODEL (20FT / 40FT / 40HC)
// ----------------------------------------------------
function ShippingContainer({ containerType, isTransparent, doorOpen }) {
  const depth = containerType === '20FT' ? 6.0 : 12.0;
  const height = containerType === '40HC' ? 2.69 : 2.39;
  const width = 2.35;

  const wallOpacity = isTransparent ? 0.25 : 1.0;

  // Container Body Material
  const steelMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1B5E20', // Cocoveera Industrial Forest Green Paint
      roughness: 0.35,
      metalness: 0.5,
      transparent: isTransparent,
      opacity: wallOpacity,
      depthWrite: !isTransparent,
    });
  }, [isTransparent, wallOpacity]);

  // Frame Corner Castings Material
  const frameMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#0D3810',
      roughness: 0.4,
      metalness: 0.7,
    });
  }, []);

  // Wooden Floor Material
  const floorMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#8D6E63', // Plywood floor
      roughness: 0.8,
    });
  }, []);

  return (
    <group position={[0, height / 2, 0]}>
      {/* Floor */}
      <mesh position={[0, -height / 2 + 0.05, 0]} receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, height / 2 - 0.02, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, 0.04, depth]} />
        <primitive object={steelMat} attach="material" />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-width / 2 + 0.02, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.04, height, depth]} />
        <primitive object={steelMat} attach="material" />
      </mesh>
      <mesh position={[width / 2 - 0.02, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.04, height, depth]} />
        <primitive object={steelMat} attach="material" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 0, -depth / 2 + 0.02]} receiveShadow castShadow>
        <boxGeometry args={[width, height, 0.04]} />
        <primitive object={steelMat} attach="material" />
      </mesh>

      {/* Corner Frame Steel Posts */}
      <mesh position={[-width / 2, 0, depth / 2]}>
        <boxGeometry args={[0.12, height, 0.12]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      <mesh position={[width / 2, 0, depth / 2]}>
        <boxGeometry args={[0.12, height, 0.12]} />
        <primitive object={frameMat} attach="material" />
      </mesh>

      {/* Container Doors (Left & Right with 25-30 deg Partial Open Angle) */}
      <group 
        position={[-width / 2, 0, depth / 2]} 
        rotation={[0, doorOpen ? -Math.PI * 0.16 : 0, 0]}
      >
        <mesh position={[width / 4, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width / 2 - 0.02, height - 0.1, 0.06]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
      </group>

      <group 
        position={[width / 2, 0, depth / 2]} 
        rotation={[0, doorOpen ? Math.PI * 0.16 : 0, 0]}
      >
        <mesh position={[-width / 4, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width / 2 - 0.02, height - 0.1, 0.06]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

// ----------------------------------------------------
// 4. CAMERA CONTROLLER & PRESETS SWITCHER
// ----------------------------------------------------
function CameraController({ cameraPreset, autoRotate, oscillate }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    switch (cameraPreset) {
      case 'top':
        camera.position.set(0, 14, 0);
        if (controlsRef.current) controlsRef.current.target.set(0, 1, 0);
        break;
      case 'front':
        camera.position.set(0, 2.5, 10);
        if (controlsRef.current) controlsRef.current.target.set(0, 1.2, 0);
        break;
      case 'side':
        camera.position.set(12, 2.5, 0);
        if (controlsRef.current) controlsRef.current.target.set(0, 1.2, 0);
        break;
      case 'inside':
        camera.position.set(0, 1.2, 2.5);
        if (controlsRef.current) controlsRef.current.target.set(0, 1.2, -4);
        break;
      case 'perspective':
      default:
        camera.position.set(5.2, 3.4, 5.8);
        if (controlsRef.current) controlsRef.current.target.set(0, 1.1, 0);
        break;
    }
  }, [cameraPreset, camera]);

  // Oscillate sway animation around front-right perspective angle (without 360 degree spin)
  useFrame((state) => {
    if (oscillate) {
      const time = state.clock.getElapsedTime();
      const angle = Math.sin(time * 0.35) * 0.28; // Subtle oscillation around front-right angle
      camera.position.x = Math.sin(angle + 0.65) * 6.5;
      camera.position.z = Math.cos(angle + 0.65) * 6.5;
      camera.lookAt(0, 1.1, 0);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={autoRotate && !oscillate}
      autoRotateSpeed={0.8}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from rotating underneath ground
      minDistance={1.5}
      maxDistance={25}
    />
  );
}

// ----------------------------------------------------
// MAIN 3D VIEWPORT ENGINE CANVAS
// ----------------------------------------------------
export default function ContainerPreview3DCanvas({
  containerType = '40HC',
  product,
  totalQuantity = 1,
  palletItems = [],
  isTransparent = true,
  doorOpen = true,
  autoRotate = false,
  oscillate = false,
  cameraPreset = 'perspective',
  onFpsUpdate
}) {
  const maxPalletsPerContainer = containerType === '20FT' ? 10 : 22;

  // Multi-Product Dynamic Stacking Engine
  const pallets = useMemo(() => {
    const list = [];
    const depth = containerType === '20FT' ? 6.0 : 12.0;
    const rowStride = 1.05;
    const startZ = -depth / 2 + 0.6; // Back wall clearance

    // Prepare list of items to place
    const activeItems = (palletItems && palletItems.length > 0) 
      ? palletItems.filter(item => item.quantity > 0)
      : (product && totalQuantity > 0 ? [{ product, quantity: totalQuantity }] : []);

    let globalPalletIndex = 0;

    for (const item of activeItems) {
      if (globalPalletIndex >= maxPalletsPerContainer) break;

      const numPalletsToRender = Math.max(1, Math.round(item.quantity * maxPalletsPerContainer));
      const itemCatType = getCategoryType(item.product?.category, item.product?.name);
      const lCM = item.product?.specifications?.length || 30;
      const wCM = item.product?.specifications?.width || 30;
      const hCM = item.product?.specifications?.height || 12;
      const itemDims = [lCM / 100, wCM / 100, hCM / 100];

      for (let i = 0; i < numPalletsToRender; i++) {
        if (globalPalletIndex >= maxPalletsPerContainer) break;

        const row = Math.floor(globalPalletIndex / 2);
        const col = globalPalletIndex % 2;
        const x = col === 0 ? -0.55 : 0.55;
        const z = startZ + (row * rowStride);

        if (z < depth / 2) {
          list.push({
            id: `p-${item.product?._id || item.product?.slug || 'item'}-${globalPalletIndex}`,
            pos: [x, 0, z],
            categoryType: itemCatType,
            itemDims: itemDims
          });
        }
        globalPalletIndex++;
      }
    }
    return list;
  }, [containerType, palletItems, totalQuantity, product, maxPalletsPerContainer]);

  return (
    <Canvas
      camera={{ position: [5.2, 3.4, 5.8], fov: 38 }}
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
      className="w-full h-full"
    >
      {/* Lighting Setup */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.8} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024} 
      />
      <pointLight position={[-10, 10, -10]} intensity={0.6} />

      {/* Studio Environment Lighting */}
      <Environment preset="city" />

      {/* Shipping Container */}
      <ShippingContainer 
        containerType={containerType} 
        isTransparent={isTransparent} 
        doorOpen={doorOpen} 
      />

      {/* Cargo Pallets with Stacked Products */}
      {pallets.map((p) => (
        <PalletWithStack 
          key={p.id} 
          position={p.pos} 
          categoryType={p.categoryType} 
          itemDims={p.itemDims} 
        />
      ))}

      {/* Ground Contact Shadow */}
      <ContactShadows position={[0, 0, 0]} opacity={0.7} scale={18} blur={1.8} far={4} />

      {/* Camera & Controls */}
      <CameraController cameraPreset={cameraPreset} autoRotate={autoRotate} oscillate={oscillate} />
    </Canvas>
  );
}
