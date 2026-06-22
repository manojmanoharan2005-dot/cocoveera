import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const HologramNode = ({ position, Icon, active, color = '#2E7D32', label, isFinal }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      // Gentle rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {/* 3D Holographic Base Sphere */}
      <mesh position={[0, 0, -0.2]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial 
          color={active ? color : '#333'} 
          emissive={active ? color : '#000'}
          emissiveIntensity={active ? 1.5 : 0}
          transparent
          opacity={0.15}
          wireframe={!active}
        />
      </mesh>

      <Html transform distanceFactor={10} zIndexRange={[100, 0]}>
        <div 
          className="flex flex-col items-center justify-center transition-all duration-700"
          style={{
            opacity: active ? 1 : 0.2,
            transform: `scale(${active ? 1 : 0.8})`,
            filter: active ? 'drop-shadow(0 0 20px rgba(46,125,50,0.4))' : 'none',
          }}
        >
          {isFinal ? (
            <div className="w-40 h-40 flex items-center justify-center relative">
               <img src="/logo.webp" alt="Cocoveera" className="w-32 h-32 object-contain relative z-10" />
               <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
            </div>
          ) : (
            <>
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl relative overflow-hidden">
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
                <Icon size={48} color={active ? '#fff' : '#888'} strokeWidth={1.5} />
              </div>
            </>
          )}
        </div>
      </Html>
    </group>
  );
};

export const EnergyRoute = ({ points, activeProgress = 0 }) => {
  const lineRef = useRef();
  
  // Create a curve from points
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));

  useFrame((state) => {
    if (lineRef.current) {
      // We can animate material properties if needed
      lineRef.current.material.dashOffset -= 0.02;
    }
  });

  return (
    <group>
      {/* Base faint line */}
      <mesh>
        <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
        <meshBasicMaterial color="#333" transparent opacity={0.3} />
      </mesh>
      
      {/* Glowing active line */}
      {activeProgress > 0 && (
        <mesh ref={lineRef}>
          <tubeGeometry args={[curve, 64, 0.06, 8, false]} />
          <meshBasicMaterial 
            color="#4ade80" 
            transparent 
            opacity={0.8}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  );
};
