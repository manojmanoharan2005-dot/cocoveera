/**
 * File: frontend/src/components/3d/ContainerViewer3D.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { ContainerModel } from './ContainerModel';
import { PalletModel } from './PalletModel';

export const ContainerViewer3D = ({ containerType, totalQuantity, autoRotate, palletItems = [] }) => {
  const pallets = [];
  const depth = containerType === '20FT' ? 6 : 12;
  const startZ = -depth / 2 + 0.6; // Start from back wall
  
  let totalIndex = 0;
  
  for (const item of palletItems) {
    for (let i = 0; i < item.quantity; i++) {
      const row = Math.floor(totalIndex / 2);
      const col = totalIndex % 2;
      const x = col === 0 ? -0.55 : 0.55; // Left or Right side
      const z = startZ + (row * 1.15); // Distance from back wall
      
      // Prevent visually overflowing the container if user selects > capacity
      if (z < depth / 2) {
        pallets.push(<PalletModel key={totalIndex} position={[x, 0.05, z]} index={totalIndex} product={item.product} />);
      }
      totalIndex++;
    }
  }

  return (
    <div className="w-full h-[250px] sm:h-[500px] bg-[#F7F9F7] cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden shadow-inner relative border border-stone-200/60">
      {totalQuantity === 0 && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <p className="text-stone-500 font-bold text-xs uppercase tracking-widest px-4 py-2 bg-white rounded-full shadow-sm">
            Container is Empty
          </p>
        </div>
      )}
      
      <Canvas camera={{ position: [5, 3, 7], fov: 45 }} shadows dpr={[1, 2]}>
        <color attach="background" args={['#F7F9F7']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          castShadow 
          position={[10, 15, 10]} 
          intensity={1.2} 
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        <directionalLight position={[-10, 5, -10]} intensity={0.4} />

        <Suspense fallback={null}>
          <group position={[0, -0.5, 0]}>
            <ContainerModel type={containerType} autoRotate={autoRotate} />
            {pallets}
          </group>
          
          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.6} 
            scale={20} 
            blur={1.5} 
            far={4} 
            color="#1B5E20"
          />
        </Suspense>

        <OrbitControls 
          enablePan={false}
          minDistance={4}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 + 0.1}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-200/50 shadow-sm">
          <p className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">
            Drag to Rotate • Scroll to Zoom
          </p>
        </div>
      </div>
    </div>
  );
};
