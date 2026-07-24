/**
 * File: frontend/src/components/3d/ContainerViewerCanvas.jsx
 * Purpose: Separated 3D canvas component for ContainerViewer to enable lazy loading and performance metrics.
 */
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, Center, useProgress, Edges } from '@react-three/drei';

function FPSMonitor({ onFail }) {
  const frameTimes = useRef([]);
  const failCount = useRef(0);
  const frameCount = useRef(0);

  useFrame((state, delta) => {
    frameCount.current += 1;
    // Skip the first 60 frames (warmup phase) to ignore startup, shader compilation, and texture uploads
    if (frameCount.current < 60) return;

    // R3F frame loop delta check (exclude huge lag spikes or inactive states)
    if (delta > 0 && delta < 0.15) {
      frameTimes.current.push(delta);
      if (frameTimes.current.length > 15) {
        frameTimes.current.shift();
      }

      if (frameTimes.current.length >= 10) {
        const avgDelta = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
        const fps = 1 / avgDelta;
        
        if (fps < 30) {
          failCount.current += 1;
          if (failCount.current > 30) { // Consistently under 30 FPS for 30 consecutive frames
            onFail();
          }
        } else {
          failCount.current = Math.max(0, failCount.current - 1);
        }
      }
    }
  });

  return null;
}

function ContainerMesh({ color, wireframe, modelUrl }) {
  const ref = useRef();

  function Model() {
    const gltf = useGLTF(modelUrl);
    return <primitive object={gltf.scene} scale={1.0} />;
  }

  return (
    <group ref={ref} dispose={null}>
      {modelUrl ? (
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      ) : (
        <>
          {/* Outer shell fallback */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[4.5, 2.5, 1.8]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.45} wireframe={wireframe} />
            <Edges threshold={15} visible={true} />
          </mesh>

          {/* Inner floor to provide depth perception */}
          <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.2, 1.6]} />
            <meshStandardMaterial color={'#ffffff10'} roughness={0.9} metalness={0} transparent />
          </mesh>
        </>
      )}
    </group>
  );
}

function LoaderOverlay() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="bg-white/90 dark:bg-gray-900/80 px-3 py-1 rounded text-xs shadow font-sans">
        Loading {Math.round(progress)}%
      </div>
    </Html>
  );
}

export default function ContainerViewerCanvas({
  color,
  wireframe,
  modelUrl,
  canvasRef,
  lightweight,
  onFpsFail
}) {
  return (
    <Canvas
      ref={canvasRef}
      shadows={false}
      camera={{ position: [6, 3, 6], fov: 45, far: lightweight ? 25 : 80 }}
      style={{ width: '100%', height: '100%' }}
      dpr={lightweight ? 1 : [1, 1.5]}
      performance={{ min: 0.5, max: 1 }}
      frameloop="demand"
      gl={{
        powerPreference: 'high-performance',
        antialias: false,
        alpha: true,
        stencil: false,
        depth: true,
        preserveDrawingBuffer: false
      }}
    >
      <FPSMonitor onFail={onFpsFail} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 6, 4]} intensity={1.2} />
      
      <Suspense fallback={<LoaderOverlay />}>
        <Center>
          <ContainerMesh color={color} wireframe={wireframe} modelUrl={modelUrl} />
        </Center>
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={4}
        maxDistance={20}
      />
    </Canvas>
  );
}
