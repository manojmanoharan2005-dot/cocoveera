/**
 * File: frontend/src/components/3d/ContainerModel.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const ContainerModel = ({ type = '20FT', autoRotate = true, isTransparent = true }) => {
  const group = useRef();
  
  // Dimensions
  const depth = type === '20FT' ? 6 : 12;
  const width = 2.4;
  const height = 2.6;
  const wallThickness = 0.1;

  const containerMaterial = new THREE.MeshStandardMaterial({
    color: isTransparent ? '#A5D6A7' : '#1B5E20', // Light glass tint for X-Ray, solid green for Solid View
    transparent: isTransparent,
    opacity: isTransparent ? 0.15 : 1.0,
    roughness: isTransparent ? 0.1 : 0.7,
    metalness: isTransparent ? 0.5 : 0.3,
  });

  const interiorMaterial = new THREE.MeshStandardMaterial({
    color: '#2E7D32',
    roughness: 0.9,
    metalness: 0.1,
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: '#4a3b2c', // Wood-like floor
    roughness: 0.9,
  });

  return (
    <group ref={group} position={[0, height / 2, 0]}>
      {/* Floor */}
      <mesh receiveShadow position={[0, -height / 2, 0]}>
        <boxGeometry args={[width, wallThickness, depth]} />
        <meshStandardMaterial color="#4a3b2c" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[width, wallThickness, depth]} />
        <meshPhysicalMaterial 
          color={isTransparent ? '#ffffff' : '#1B5E20'}
          transparent={isTransparent}
          opacity={isTransparent ? 0.2 : 1.0}
          roughness={isTransparent ? 0.05 : 0.7}
          metalness={isTransparent ? 0.1 : 0.3}
          transmission={isTransparent ? 0.9 : 0.0}
          thickness={isTransparent ? 0.1 : 0}
          clearcoat={isTransparent ? 1.0 : 0.0}
        />
      </mesh>

      {/* Left Wall */}
      <mesh castShadow receiveShadow position={[-width / 2, 0, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshPhysicalMaterial 
          color={isTransparent ? '#ffffff' : '#1B5E20'}
          transparent={isTransparent}
          opacity={isTransparent ? 0.2 : 1.0}
          roughness={isTransparent ? 0.05 : 0.7}
          metalness={isTransparent ? 0.1 : 0.3}
          transmission={isTransparent ? 0.9 : 0.0}
          thickness={isTransparent ? 0.1 : 0}
          clearcoat={isTransparent ? 1.0 : 0.0}
        />
        
        {/* Exterior Branding */}
        <Text
          position={[-wallThickness / 2 - 0.01, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          COCOVEERA
        </Text>
        <Text
          position={[-wallThickness / 2 - 0.01, -0.8, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.3}
          color={isTransparent ? '#ffffff' : '#A5D6A7'}
          anchorX="center"
          anchorY="middle"
        >
          {type} FCL EXPORT GRADE
        </Text>
      </mesh>

      {/* Right Wall */}
      <mesh castShadow receiveShadow position={[width / 2, 0, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshPhysicalMaterial 
          color={isTransparent ? '#ffffff' : '#1B5E20'}
          transparent={isTransparent}
          opacity={isTransparent ? 0.2 : 1.0}
          roughness={isTransparent ? 0.05 : 0.7}
          metalness={isTransparent ? 0.1 : 0.3}
          transmission={isTransparent ? 0.9 : 0.0}
          thickness={isTransparent ? 0.1 : 0}
          clearcoat={isTransparent ? 1.0 : 0.0}
        />
        
        {/* Exterior Branding */}
        <Text
          position={[wallThickness / 2 + 0.01, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          COCOVEERA
        </Text>
      </mesh>

      {/* Back Wall */}
      <mesh castShadow receiveShadow position={[0, 0, -depth / 2]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshPhysicalMaterial 
          color={isTransparent ? '#ffffff' : '#1B5E20'}
          transparent={isTransparent}
          opacity={isTransparent ? 0.2 : 1.0}
          roughness={isTransparent ? 0.05 : 0.7}
          metalness={isTransparent ? 0.1 : 0.3}
          transmission={isTransparent ? 0.9 : 0.0}
          thickness={isTransparent ? 0.1 : 0}
          clearcoat={isTransparent ? 1.0 : 0.0}
        />
      </mesh>

      {/* Open Doors (Wide open 135 degrees) */}
      <mesh castShadow receiveShadow position={[-1.624, 0, depth / 2 + 0.424]} rotation={[0, -Math.PI * 0.75, 0]}>
        <boxGeometry args={[1.2, height, wallThickness / 2]} />
        <meshPhysicalMaterial 
          color={isTransparent ? '#ffffff' : '#1B5E20'}
          transparent={isTransparent}
          opacity={isTransparent ? 0.2 : 1.0}
          roughness={isTransparent ? 0.05 : 0.7}
          metalness={isTransparent ? 0.1 : 0.3}
          transmission={isTransparent ? 0.9 : 0.0}
          thickness={isTransparent ? 0.1 : 0}
          clearcoat={isTransparent ? 1.0 : 0.0}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[1.624, 0, depth / 2 + 0.424]} rotation={[0, Math.PI * 0.75, 0]}>
        <boxGeometry args={[1.2, height, wallThickness / 2]} />
        <meshPhysicalMaterial 
          color={isTransparent ? '#ffffff' : '#1B5E20'}
          transparent={isTransparent}
          opacity={isTransparent ? 0.2 : 1.0}
          roughness={isTransparent ? 0.05 : 0.7}
          metalness={isTransparent ? 0.1 : 0.3}
          transmission={isTransparent ? 0.9 : 0.0}
          thickness={isTransparent ? 0.1 : 0}
          clearcoat={isTransparent ? 1.0 : 0.0}
        />
      </mesh>
    </group>
  );
};
