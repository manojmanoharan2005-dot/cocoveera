/**
 * File: frontend/src/components/3d/ContainerViewer3DCanvas.jsx
 * Purpose: Separated 3D canvas component for ContainerViewer3D with AutoFitCamera, floor, grid and controls triggers.
 */
import React, { useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { ContainerModel } from './ContainerModel';
import { PalletModel } from './PalletModel';
import { CanvasErrorBoundary } from './ContainerViewerCanvas';

// FPS monitor to check performance
function FPSMonitor({ onFail }) {
  const frameTimes = useRef([]);
  const failCount = useRef(0);
  const frameCount = useRef(0);

  useFrame((state, delta) => {
    frameCount.current += 1;
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

// AutoFitCamera: Calculates bounding box of container & pallets and frames them perfectly
function AutoFitCamera({ containerType, palletsCount, controlsRef, pallets, resetTrigger }) {
  const { camera } = useThree();

  useEffect(() => {
    const depth = containerType === '20FT' ? 6 : 12;
    const palletsPerContainer = containerType === '20FT' ? 10 : 22;
    
    // Calculate utilization percentage
    const utilization = palletsCount / palletsPerContainer;
    const usagePct = Math.min(1, utilization);

    // Compute bounding box of active cargo on Z-axis
    const minX = -1.04;
    const maxX = 1.04;
    const minY = 0.0;
    const maxY = 2.35; // max height of cargo stack
    
    let minZ = -depth / 2 + 0.1;
    let maxZ = depth / 2 - 0.1;

    if (pallets && pallets.length > 0) {
      const zPositions = pallets.map(p => p.position[2]);
      minZ = Math.min(...zPositions) - 0.55;
      maxZ = Math.max(...zPositions) + 0.55;
    } else {
      // Empty container bounding fallback
      minZ = -depth / 2 + 0.5;
      maxZ = depth / 2 - 0.5;
    }

    const cargoLength = maxZ - minZ;
    const targetX = 0;
    const targetY = 1.17; // center Y of the cargo stacks
    const targetZ = (minZ + maxZ) / 2;

    // Determine camera distance based on utilization percentage
    let cameraDistance;
    if (usagePct === 0) {
      // Empty container zoom
      cameraDistance = containerType === '20FT' ? 8.5 : 14.0;
    } else if (usagePct < 0.3) {
      // Zoom closer to cargo if usage < 30%
      cameraDistance = Math.max(5.5, cargoLength * 1.8);
    } else if (usagePct > 0.7) {
      // Zoom out to fit entire container if usage > 70%
      cameraDistance = containerType === '20FT' ? 9.5 : 16.0;
    } else {
      // Smooth interpolation for medium utilization
      const closeDist = Math.max(5.5, cargoLength * 1.8);
      const farDist = containerType === '20FT' ? 9.5 : 16.0;
      const t = (usagePct - 0.3) / 0.4;
      cameraDistance = closeDist + t * (farDist - closeDist);
    }

    // Set isometric angles: elevation -20° (70° polar angle), azimuth Y = 35°
    const polar = (90 - 20) * (Math.PI / 180);
    const azimuth = 35 * (Math.PI / 180);

    // Position coordinates calculation
    const posX = targetX + cameraDistance * Math.sin(polar) * Math.sin(azimuth);
    const posY = targetY + cameraDistance * Math.cos(polar);
    const posZ = targetZ + cameraDistance * Math.sin(polar) * Math.cos(azimuth);

    camera.position.set(posX, posY, posZ);
    camera.lookAt(targetX, targetY, targetZ);
    camera.updateProjectionMatrix();

    // Update OrbitControls target
    if (controlsRef.current) {
      controlsRef.current.target.set(targetX, targetY, targetZ);
      controlsRef.current.update();
    }
  }, [containerType, palletsCount, pallets, camera, controlsRef, resetTrigger]);

  return null;
}

export default function ContainerViewer3DCanvas({
  containerType,
  isTransparent,
  pallets,
  lightweight,
  resetTrigger,
  zoomInTrigger,
  zoomOutTrigger,
  onProgress,
  onFpsFail,
  onRenderError
}) {
  const controlsRef = useRef();

  // Listen to Zoom In trigger from toolbar
  useEffect(() => {
    if (zoomInTrigger > 0 && controlsRef.current) {
      const controls = controlsRef.current;
      const target = controls.target;
      const cam = controls.object;
      const dir = new THREE.Vector3().subVectors(cam.position, target);
      dir.multiplyScalar(0.8); // zoom in 20%
      cam.position.addVectors(target, dir);
      controls.update();
    }
  }, [zoomInTrigger]);

  // Listen to Zoom Out trigger from toolbar
  useEffect(() => {
    if (zoomOutTrigger > 0 && controlsRef.current) {
      const controls = controlsRef.current;
      const target = controls.target;
      const cam = controls.object;
      const dir = new THREE.Vector3().subVectors(cam.position, target);
      dir.multiplyScalar(1.25); // zoom out 25%
      cam.position.addVectors(target, dir);
      controls.update();
    }
  }, [zoomOutTrigger]);

  return (
    <CanvasErrorBoundary onCatch={onRenderError}>
      <Canvas
        camera={{ position: [5, 3, 7], fov: 48, far: 1000, near: 0.1 }}
        shadows={false}
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
        style={{ width: '100%', height: '100%' }}
      >
        <ProgressTracker onProgress={onProgress} />
        <FPSMonitor onFail={onFpsFail} />
        <AutoFitCamera 
          containerType={containerType} 
          palletsCount={pallets.length} 
          controlsRef={controlsRef} 
          pallets={pallets} 
          resetTrigger={resetTrigger} 
        />
        <color attach="background" args={['#F7F9F7']} />
        
        {/* High-quality lighting: Ambient + weak Hemisphere + strong Directional */}
        <ambientLight intensity={0.9} />
        <hemisphereLight skyColor="#ffffff" groundColor="#888888" intensity={0.3} />
        <directionalLight position={[2, 12, 10]} intensity={1.3} />
        
        <Suspense fallback={null}>
          <group name="container-group" position={[0, -0.5, 0]}>
            <ContainerModel type={containerType} autoRotate={false} isTransparent={isTransparent} enableShadows={false} />
            {pallets.map((p) => (
              <PalletModel 
                key={p.id} 
                position={p.position} 
                index={p.index} 
                product={p.product} 
                enableShadows={false}
                lightweight={lightweight}
              />
            ))}
          </group>
          
          {/* Realistic light gray warehouse floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]}>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#E8ECE8" roughness={0.7} metalness={0.1} />
          </mesh>
          
          {/* Technical/Engineering warehouse grid helper */}
          <gridHelper args={[30, 30, '#888888', '#dcdcdc']} position={[0, -0.505, 0]} opacity={0.12} transparent />
        </Suspense>

        <OrbitControls 
          ref={controlsRef}
          enablePan={false}
          minDistance={4}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2 + 0.1}
          autoRotate={false}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
