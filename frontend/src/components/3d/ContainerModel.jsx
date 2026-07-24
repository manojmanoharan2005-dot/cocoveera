/**
 * File: frontend/src/components/3d/ContainerModel.jsx
 * Purpose: Reusable React UI component for the container mesh with professional logistics transparent settings.
 */
import React, { useMemo, useEffect } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const ContainerModel = React.memo(({ type = '20FT', autoRotate = true, isTransparent = true, enableShadows = false }) => {
  // Dimensions
  const depth = type === '20FT' ? 6 : 12;
  const width = 2.4;
  const height = 2.6;
  const wallThickness = 0.1;

  // Helper to create professional wall material with depthWrite disabled for rendering cargo on top
  const createWallMaterial = (color, opacity) => {
    return new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity,
      roughness: 0.35, // steel shininess
      metalness: 0.8, // metallic corrugated finish
      side: THREE.DoubleSide,
      depthWrite: false // Crucial: forces opaque products to always render on top/above transparent walls
    });
  };

  // Memoize materials to prevent recreating them on every render
  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a3b2c', // Wood floor
    roughness: 0.9,
    metalness: 0.1,
  }), []);

  // Opacities: Roof: 0.15, Left: 0.20, Right: 0.20, Back: 0.10
  const leftWallMaterial = useMemo(() => createWallMaterial(isTransparent ? '#ffffff' : '#1B5E20', isTransparent ? 0.20 : 0.20), [isTransparent]);
  const rightWallMaterial = useMemo(() => createWallMaterial(isTransparent ? '#ffffff' : '#1B5E20', isTransparent ? 0.20 : 0.20), [isTransparent]);
  const backWallMaterial = useMemo(() => createWallMaterial(isTransparent ? '#ffffff' : '#1B5E20', isTransparent ? 0.20 : 0.10), [isTransparent]);
  const ceilingMaterial = useMemo(() => createWallMaterial(isTransparent ? '#ffffff' : '#1B5E20', isTransparent ? 0.20 : 0.15), [isTransparent]);
  const doorMaterial = useMemo(() => createWallMaterial(isTransparent ? '#ffffff' : '#1B5E20', 0.0), [isTransparent]); // Front doors invisible

  // Memoize geometries to prevent recreating them on every render
  const floorGeom = useMemo(() => new THREE.BoxGeometry(width, wallThickness, depth), [width, wallThickness, depth]);
  const ceilingGeom = useMemo(() => new THREE.BoxGeometry(width, wallThickness, depth), [width, wallThickness, depth]);
  const sideWallGeom = useMemo(() => new THREE.BoxGeometry(wallThickness, height, depth), [wallThickness, height, depth]);
  const backWallGeom = useMemo(() => new THREE.BoxGeometry(width, height, wallThickness), [width, height, wallThickness]);
  const doorGeom = useMemo(() => new THREE.BoxGeometry(1.2, height, wallThickness / 2), [height, wallThickness]);

  // Clean up materials and geometries on unmount
  useEffect(() => {
    return () => {
      floorMaterial.dispose();
      leftWallMaterial.dispose();
      rightWallMaterial.dispose();
      backWallMaterial.dispose();
      ceilingMaterial.dispose();
      doorMaterial.dispose();

      floorGeom.dispose();
      ceilingGeom.dispose();
      sideWallGeom.dispose();
      backWallGeom.dispose();
      doorGeom.dispose();
    };
  }, [
    floorMaterial,
    leftWallMaterial,
    rightWallMaterial,
    backWallMaterial,
    ceilingMaterial,
    doorMaterial,
    floorGeom,
    ceilingGeom,
    sideWallGeom,
    backWallGeom,
    doorGeom
  ]);

  return (
    <group position={[0, height / 2, 0]}>
      {/* Floor - Solid Opaque */}
      <mesh receiveShadow={enableShadows} position={[0, -height / 2, 0]} geometry={floorGeom} material={floorMaterial} />

      {/* Ceiling - Translucent (Roof: 0.15 opacity) */}
      <mesh position={[0, height / 2, 0]} geometry={ceilingGeom} material={ceilingMaterial} />

      {/* Left Wall - Translucent (Left wall: 0.20 opacity) */}
      <mesh position={[-width / 2, 0, 0]} geometry={sideWallGeom} material={leftWallMaterial}>
        {/* Exterior Branding Watermark (opacity < 10%, text size reduced to 0.4) */}
        <Text
          position={[-wallThickness / 2 - 0.01, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.4}
          color="white"
          fillOpacity={0.08}
          anchorX="center"
          anchorY="middle"
        >
          COCOVEERA
        </Text>
        <Text
          position={[-wallThickness / 2 - 0.01, -0.8, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.2}
          color="white"
          fillOpacity={0.08}
          anchorX="center"
          anchorY="middle"
        >
          {type} FCL EXPORT GRADE
        </Text>
      </mesh>

      {/* Right Wall - Translucent (Right wall: 0.20 opacity) */}
      <mesh position={[width / 2, 0, 0]} geometry={sideWallGeom} material={rightWallMaterial}>
        {/* Exterior Branding Watermark (opacity < 10%, text size reduced to 0.4) */}
        <Text
          position={[wallThickness / 2 + 0.01, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.4}
          color="white"
          fillOpacity={0.08}
          anchorX="center"
          anchorY="middle"
        >
          COCOVEERA
        </Text>
      </mesh>

      {/* Back Wall - Translucent (Back wall: 0.10 opacity) */}
      <mesh position={[0, 0, -depth / 2]} geometry={backWallGeom} material={backWallMaterial} />

      {/* Open Doors (Front wall) - Hidden completely during inspection */}
      <mesh visible={false} position={[-1.624, 0, depth / 2 + 0.424]} rotation={[0, -Math.PI * 0.75, 0]} geometry={doorGeom} material={doorMaterial} />
      <mesh visible={false} position={[1.624, 0, depth / 2 + 0.424]} rotation={[0, Math.PI * 0.75, 0]} geometry={doorGeom} material={doorMaterial} />
    </group>
  );
});

ContainerModel.displayName = 'ContainerModel';
