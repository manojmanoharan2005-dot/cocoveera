/**
 * File: frontend/src/components/3d/ContainerViewerCanvas.jsx
 * Purpose: Separated 3D canvas component for ContainerViewer to enable static loading, progress tracking and error boundaries.
 */
import React, { useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, useProgress, Edges } from '@react-three/drei';
import * as THREE from 'three';

// Custom Error Boundary to catch Three.js initialization and GLB asset loading exceptions
export class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Canvas Rendering/Asset load error caught:", error, errorInfo);
    if (this.props.onCatch) {
      this.props.onCatch(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-full flex items-center justify-center bg-stone-100 p-4 text-center">
          <span className="text-stone-500 font-bold text-[10px] uppercase tracking-widest bg-white border border-stone-200 shadow-sm px-3.5 py-2 rounded-full select-none">
            Interactive 3D temporarily unavailable.
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

// Progress tracker that reports loading details up to the parent HTML wrapper
function ProgressTracker({ onProgress }) {
  const { progress } = useProgress();
  
  useEffect(() => {
    if (onProgress) {
      onProgress(Math.round(progress));
    }
  }, [progress, onProgress]);

  return null;
}

function FPSMonitor({ onFail }) {
  const frameTimes = useRef([]);
  const failCount = useRef(0);
  const frameCount = useRef(0);

  useFrame((state, delta) => {
    frameCount.current += 1;
    // Skip first 60 frames (warmup) to ignore compiling and uploading lag spikes
    if (frameCount.current < 60) return;

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
          if (failCount.current > 30) {
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

// Separated LoadedModel to avoid component recreation loop anti-patterns inside ContainerMesh
function LoadedModel({ modelUrl }) {
  const gltf = useGLTF(modelUrl);
  return <primitive object={gltf.scene} scale={1.0} />;
}

function ContainerMesh({ color, wireframe, modelUrl }) {
  const ref = useRef();

  return (
    <group ref={ref} dispose={null}>
      {modelUrl ? (
        <Suspense fallback={null}>
          <LoadedModel modelUrl={modelUrl} />
        </Suspense>
      ) : (
        <>
          {/* Outer shell fallback */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[4.5, 2.5, 1.8]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.45} wireframe={wireframe} />
            <Edges threshold={15} visible={true} />
          </mesh>

          {/* Inner floor for depth perception */}
          <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.2, 1.6]} />
            <meshStandardMaterial color={'#ffffff10'} roughness={0.9} metalness={0} transparent />
          </mesh>
        </>
      )}
    </group>
  );
}

export default function ContainerViewerCanvas({
  color,
  wireframe,
  modelUrl,
  canvasRef,
  lightweight,
  onProgress,
  onFpsFail,
  onRenderError
}) {
  return (
    <CanvasErrorBoundary onCatch={onRenderError}>
      <Canvas
        ref={canvasRef}
        camera={{ position: [5, 3, 5], fov: 45 }}
        shadows={false}
        dpr={lightweight ? 1 : [1, 1.5]}
        performance={{ min: 0.5, max: 1 }}
        gl={{
          powerPreference: 'high-performance',
          antialias: false,
          alpha: true,
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ProgressTracker onProgress={onProgress} />
        <FPSMonitor onFail={onFpsFail} />
        <color attach="background" args={['#F7F9F7']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        
        <Suspense fallback={null}>
          <Center>
            <ContainerMesh color={color} wireframe={wireframe} modelUrl={modelUrl} />
          </Center>
        </Suspense>

        <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
