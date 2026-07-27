/**
 * File: frontend/src/components/3d/ContainerPreview3DCanvas.jsx
 * Purpose: Photorealistic Three.js / React Three Fiber engine for Cocoveera B2B 3D Cargo Visualizer.
 * Features 11 Master Category Product Templates, realistic wooden pallets, and realistic shipping container details.
 */
import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------
// PROCEDURAL CANVAS TEXTURE GENERATOR (SUB-MILLISECOND PBR MAPS)
// ----------------------------------------------------
function generateProceduralTexture(type = 'coir') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (type === 'bale') {
    // Golden coir fibre strands with random directional noise
    ctx.fillStyle = '#A06D3B';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 700; i++) {
      ctx.strokeStyle = i % 2 === 0 ? '#C28E58' : '#73461D';
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 45, y + (Math.random() - 0.5) * 45);
      ctx.stroke();
    }
  } else if (type === 'rope') {
    // Twisted rope helical strands
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 12) {
      ctx.fillStyle = y % 24 === 0 ? '#A67342' : '#6B3E19';
      ctx.fillRect(0, y, 256, 6);
    }
  } else if (type === 'wood') {
    // Wooden pallet grain texture
    ctx.fillStyle = '#C2A682';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 250; i++) {
      ctx.strokeStyle = '#947653';
      ctx.lineWidth = 0.5 + Math.random();
      ctx.beginPath();
      const x = Math.random() * 256;
      ctx.moveTo(x, 0);
      ctx.lineTo(x + Math.sin(i) * 10, 256);
      ctx.stroke();
    }
  } else if (type === 'geotextile' || type === 'net') {
    // Woven coir netting grid texture
    ctx.fillStyle = '#6B4226';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#4A2A14';
    ctx.lineWidth = 3;
    for (let i = 0; i < 256; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  } else {
    // Earthy peat block brown with fine fibrous speckles
    ctx.fillStyle = '#4A2C11';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#6E4522' : '#2D1808';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Category Resolver Helper (Mapping 11 Master Categories)
function getCategoryType(categoryName = '', productName = '') {
  const nameStr = (categoryName + ' ' + productName).toLowerCase();
  
  if (nameStr.includes('blueberry') || nameStr.includes('disc')) return 'blueberry_disc';
  if (nameStr.includes('substrate bag') || nameStr.includes('substratebag')) return 'substrate_bag';
  if (nameStr.includes('grow bag') || nameStr.includes('growbag')) {
    if (nameStr.includes('open top') || nameStr.includes('opentop')) return 'open_top_grow_bag';
    return 'grow_bag';
  }
  if (nameStr.includes('rope') || nameStr.includes('curled')) return 'curled_rope';
  if (nameStr.includes('bale') || nameStr.includes('fibre bale')) return 'coir_bale';
  if (nameStr.includes('blanket')) return 'erosion_blanket';
  if (nameStr.includes('net') || nameStr.includes('erosion control net')) return 'erosion_net';
  if (nameStr.includes('log') || nameStr.includes('erosion control log')) return 'coir_log';
  if (nameStr.includes('cube')) return 'coco_cubes';
  if (nameStr.includes('briquette') || nameStr.includes('brick')) return 'briquette';
  if (nameStr.includes('geotextile') || nameStr.includes('mat') || nameStr.includes('roll')) return 'geotextile_roll';
  return 'cocopeat_block';
}

// ----------------------------------------------------
// 1. PHOTOREALISTIC CATEGORY 3D MODELS (11 MASTER TEMPLATES)
// ----------------------------------------------------

// 01. Coco Cubes (Compact Cube Matrix)
function CocoCubesMesh({ dims }) {
  const mapTex = useMemo(() => generateProceduralTexture('block'), []);
  const cubeGeo = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const cubeMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: mapTex,
    color: '#3D2314',
    roughness: 0.85,
  }), [mapTex]);

  return <mesh geometry={cubeGeo} material={cubeMat} castShadow receiveShadow />;
}

// 02. Cocopeat Blocks (Compressed 5KG Block with Dual Strapping Bands)
function CocopeatBlockMesh({ dims }) {
  const mapTex = useMemo(() => generateProceduralTexture('block'), []);
  const blockGeo = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const blockMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: mapTex,
    color: '#4A2C11',
    roughness: 0.85,
    metalness: 0.05,
  }), [mapTex]);

  const strapMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1A1A1A',
    roughness: 0.3,
    metalness: 0.2,
  }), []);

  return (
    <group>
      <mesh geometry={blockGeo} material={blockMat} castShadow receiveShadow />
      <mesh position={[-dims[0] * 0.25, 0, 0]}>
        <boxGeometry args={[0.015, dims[1] + 0.002, dims[2] + 0.002]} />
        <primitive object={strapMat} attach="material" />
      </mesh>
      <mesh position={[dims[0] * 0.25, 0, 0]}>
        <boxGeometry args={[0.015, dims[1] + 0.002, dims[2] + 0.002]} />
        <primitive object={strapMat} attach="material" />
      </mesh>
    </group>
  );
}

// 03. Coir Fibre Bales (Rectangular Bale with 3 Heavy Straps)
function CoirBaleMesh({ dims }) {
  const mapTex = useMemo(() => generateProceduralTexture('bale'), []);
  const baleGeo = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const baleMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: mapTex,
    color: '#A06D3B',
    roughness: 0.95,
  }), [mapTex]);

  const strapMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E6B800',
    roughness: 0.3,
    metalness: 0.1,
  }), []);

  return (
    <group>
      <mesh geometry={baleGeo} material={baleMat} castShadow receiveShadow />
      {[-0.3, 0, 0.3].map((offset, idx) => (
        <mesh key={idx} position={[dims[0] * offset, 0, 0]}>
          <boxGeometry args={[0.02, dims[1] + 0.003, dims[2] + 0.003]} />
          <primitive object={strapMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// 04. Grow Bags (White UV Soft Bag with Soil Top & Green Accent)
function GrowBagMesh({ dims }) {
  const bagGeo = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const bagMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F5F5F0',
    roughness: 0.35,
    metalness: 0.02,
  }), []);

  const brandMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2E7D32',
    roughness: 0.4,
  }), []);

  return (
    <group>
      <mesh geometry={bagGeo} material={bagMat} castShadow receiveShadow />
      <mesh position={[0, dims[1] / 2 + 0.003, 0]}>
        <planeGeometry args={[dims[0] * 0.92, dims[2] * 0.92]} />
        <meshStandardMaterial color="#2B1810" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, dims[2] / 2 + 0.002]}>
        <planeGeometry args={[dims[0] * 0.8, dims[1] * 0.25]} />
        <primitive object={brandMat} attach="material" />
      </mesh>
    </group>
  );
}

// 05. Substrate Bags (Filled White Bag with Printed Brand & Emblem)
function SubstrateBagMesh({ dims }) {
  const bagGeo = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const bagMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FAFAFA',
    roughness: 0.3,
  }), []);

  const brandMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1B5E20',
    roughness: 0.4,
  }), []);

  return (
    <group>
      <mesh geometry={bagGeo} material={bagMat} castShadow receiveShadow />
      <mesh position={[0, 0, dims[2] / 2 + 0.002]}>
        <planeGeometry args={[dims[0] * 0.75, dims[1] * 0.4]} />
        <primitive object={brandMat} attach="material" />
      </mesh>
    </group>
  );
}

// 06. Curled Coir Rope (Helical Coir Coil with Core Opening)
function CurledRopeMesh({ dims }) {
  const mapTex = useMemo(() => generateProceduralTexture('rope'), []);
  const radius = Math.min(dims[0], dims[2]) / 2;
  const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(radius, radius, dims[1], 24), [radius, dims]);
  const ropeMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: mapTex,
    color: '#8B5A2B',
    roughness: 0.9,
  }), [mapTex]);

  return (
    <group>
      <mesh geometry={cylinderGeo} material={ropeMat} castShadow receiveShadow />
      <mesh position={[0, 0.001, 0]}>
        <cylinderGeometry args={[radius * 0.35, radius * 0.35, dims[1] + 0.004, 16]} />
        <meshStandardMaterial color="#3D2109" roughness={0.95} />
      </mesh>
    </group>
  );
}

// 07. Erosion Control Nets & Logs (Horizontal Rolled Coir Netting)
function ErosionNetMesh({ dims }) {
  const mapTex = useMemo(() => generateProceduralTexture('net'), []);
  const radius = dims[1] / 2;
  const rollGeo = useMemo(() => new THREE.CylinderGeometry(radius, radius, dims[0], 24), [radius, dims]);
  const rollMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: mapTex,
    color: '#6B4226',
    roughness: 0.9,
  }), [mapTex]);

  return (
    <mesh geometry={rollGeo} material={rollMat} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow />
  );
}

// 08. Blueberry Discs (Round Compressed Discs Stacked Vertically)
function BlueberryDiscMesh({ dims }) {
  const radius = Math.min(dims[0], dims[2]) / 2;
  const discGeo = useMemo(() => new THREE.CylinderGeometry(radius, radius, dims[1], 24), [radius, dims]);
  const discMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4A2C11',
    roughness: 0.85,
  }), []);

  return <mesh geometry={discGeo} material={discMat} castShadow receiveShadow />;
}

// 09. Erosion Control Blankets (Rolled Coir Blanket Mat)
function ErosionBlanketMesh({ dims }) {
  const mapTex = useMemo(() => generateProceduralTexture('geotextile'), []);
  const radius = dims[1] / 2;
  const rollGeo = useMemo(() => new THREE.CylinderGeometry(radius, radius, dims[0], 24), [radius, dims]);
  const rollMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: mapTex,
    color: '#5C3A1E',
    roughness: 0.9,
  }), [mapTex]);

  return (
    <mesh geometry={rollGeo} material={rollMat} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow />
  );
}

// 10. Briquettes (Compressed Brick Shape Layout)
function BriquetteMesh({ dims }) {
  const mapTex = useMemo(() => generateProceduralTexture('block'), []);
  const brickGeo = useMemo(() => new THREE.BoxGeometry(dims[0], dims[1], dims[2]), [dims]);
  const brickMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: mapTex,
    color: '#5C3818',
    roughness: 0.8,
  }), [mapTex]);

  return <mesh geometry={brickGeo} material={brickMat} castShadow receiveShadow />;
}

// 11. Coir Logs (Cylindrical Log with Rope Binding Rings)
function CoirLogMesh({ dims }) {
  const radius = dims[1] / 2;
  const logGeo = useMemo(() => new THREE.CylinderGeometry(radius, radius, dims[0], 24), [radius, dims]);
  const logMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#70441E',
    roughness: 0.95,
  }), []);

  const ringMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3D2109',
    roughness: 0.9,
  }), []);

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh geometry={logGeo} material={logMat} castShadow receiveShadow />
      {[-0.35, -0.12, 0.12, 0.35].map((offset, idx) => (
        <mesh key={idx} position={[0, dims[0] * offset, 0]}>
          <cylinderGeometry args={[radius + 0.003, radius + 0.003, 0.02, 24]} />
          <primitive object={ringMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// Universal Model Selector Router (11 Master Category Templates)
function UniversalProductItem({ categoryType, dims }) {
  switch (categoryType) {
    case 'coco_cubes':
      return <CocoCubesMesh dims={dims} />;
    case 'coir_bale':
      return <CoirBaleMesh dims={dims} />;
    case 'grow_bag':
      return <GrowBagMesh dims={dims} />;
    case 'substrate_bag':
      return <SubstrateBagMesh dims={dims} />;
    case 'curled_rope':
      return <CurledRopeMesh dims={dims} />;
    case 'erosion_net':
    case 'geotextile_roll':
      return <ErosionNetMesh dims={dims} />;
    case 'blueberry_disc':
      return <BlueberryDiscMesh dims={dims} />;
    case 'erosion_blanket':
      return <ErosionBlanketMesh dims={dims} />;
    case 'briquette':
      return <BriquetteMesh dims={dims} />;
    case 'coir_log':
      return <CoirLogMesh dims={dims} />;
    case 'cocopeat_block':
    default:
      return <CocopeatBlockMesh dims={dims} />;
  }
}

// ----------------------------------------------------
// 2. PHOTOREALISTIC WOODEN PALLET WITH STACKED PRODUCTS
// ----------------------------------------------------
function PalletWithStack({ position, categoryType, itemDims }) {
  const palletWidth = 1.05;
  const palletDepth = 1.05;
  const palletHeight = 0.14;

  const woodTex = useMemo(() => generateProceduralTexture('wood'), []);

  // Compute how many items fit on pallet
  const [l, w, h] = itemDims;
  const itemsX = Math.max(1, Math.floor(palletWidth / l));
  const itemsZ = Math.max(1, Math.floor(palletDepth / w));
  const layersY = Math.max(1, Math.min(8, Math.floor(2.0 / h)));

  const startX = -((itemsX - 1) * l) / 2;
  const startZ = -((itemsZ - 1) * w) / 2;

  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: woodTex,
    color: '#C2A682',
    roughness: 0.75,
    metalness: 0.02,
  }), [woodTex]);

  return (
    <group position={position}>
      {/* Photorealistic Wooden Pallet Base with Planks */}
      <group position={[0, palletHeight / 2, 0]}>
        {/* Top Deck Planks */}
        {[-0.42, -0.21, 0, 0.21, 0.42].map((xOffset, idx) => (
          <mesh key={idx} position={[xOffset, 0.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, 0.025, palletDepth]} />
            <primitive object={woodMat} attach="material" />
          </mesh>
        ))}
        {/* Bottom Stringer Blocks */}
        {[-0.45, 0, 0.45].map((xOff, i1) => (
          [-0.45, 0, 0.45].map((zOff, i2) => (
            <mesh key={`${i1}-${i2}`} position={[xOff, -0.03, zOff]} castShadow receiveShadow>
              <boxGeometry args={[0.12, 0.08, 0.12]} />
              <primitive object={woodMat} attach="material" />
            </mesh>
          ))
        ))}
      </group>

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
      color: '#154318', // Cocoveera Industrial Forest Green Paint
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

  useFrame((state) => {
    if (oscillate) {
      const time = state.clock.getElapsedTime();
      const angle = Math.sin(time * 0.35) * 0.28;
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
      maxPolarAngle={Math.PI / 2 - 0.05}
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
  isMini = false,
  onFpsUpdate
}) {
  const maxPalletsPerContainer = containerType === '20FT' ? 10 : 22;

  // Multi-Product Dynamic Stacking Engine
  const pallets = useMemo(() => {
    const list = [];
    const depth = containerType === '20FT' ? 6.0 : 12.0;
    const rowStride = 1.05;
    const startZ = -depth / 2 + 0.6;

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
      shadows={!isMini}
      dpr={isMini ? [1, 1.25] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: isMini ? 'low-power' : 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
      className="w-full h-full"
    >
      {/* Fast Lighting Setup */}
      <ambientLight intensity={isMini ? 0.9 : 0.8} />
      <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={isMini ? 0.7 : 0.5} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.8} 
        castShadow={!isMini} 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024} 
      />
      <pointLight position={[-10, 10, -10]} intensity={0.6} />

      {/* Studio Environment HDRI Lighting */}
      {!isMini && <Environment preset="city" />}

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
