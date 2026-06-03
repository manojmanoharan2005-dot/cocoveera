/**
 * File: frontend/src/components/3d/PalletModel.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

// Procedural pallet and product load
export const PalletModel = ({ position, index, product }) => {
  const palletWidth = 1.0;
  const palletDepth = 1.1;
  const palletHeight = 0.15;
  const loadHeight = 1.4;

  const category = product?.category || 'Coco Peat Products';
  const isGrowBag = category.toLowerCase().includes('bag');
  const isDisc = category.toLowerCase().includes('disc');
  const isPot = category.toLowerCase().includes('pot');

  let productHex = '#3e2723'; // Default dark brown coco peat
  if (isGrowBag) productHex = '#f5f5f5'; // White bags
  else if (isPot) productHex = '#d7ccc8'; // Light tan
  else if (isDisc) productHex = '#4e342e'; // Darker brown

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: '#8b5a2b',
    roughness: 1.0,
  });

  const wrapMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.7,
  });

  const productMaterial = new THREE.MeshStandardMaterial({
    color: productHex,
    roughness: 0.9,
  });

  return (
    <group position={position}>
      {/* Wooden Pallet Base */}
      <mesh castShadow receiveShadow position={[0, palletHeight / 2, 0]}>
        <boxGeometry args={[palletWidth, palletHeight, palletDepth]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>
      
      {/* Wrapped Load */}
      <mesh castShadow receiveShadow position={[0, palletHeight + loadHeight / 2, 0]}>
        <boxGeometry args={[palletWidth * 0.95, loadHeight, palletDepth * 0.95]} />
        <primitive object={wrapMaterial} attach="material" />
      </mesh>

      {/* Product inside wrap (visible through semi-transparent wrap) */}
      <mesh castShadow position={[0, palletHeight + loadHeight / 2, 0]}>
        <boxGeometry args={[palletWidth * 0.9, loadHeight * 0.98, palletDepth * 0.9]} />
        <primitive object={productMaterial} attach="material" />
      </mesh>

      {/* Shipping Label on the side of the pallet */}
      <group position={[palletWidth / 2 + 0.01, palletHeight + loadHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <Text
          position={[0, 0.1, 0.01]}
          fontSize={0.06}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          COCOVEERA EXPORT
        </Text>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.04}
          color="#333333"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.5}
          textAlign="center"
        >
          {category.toUpperCase()}
        </Text>
        <Text
          position={[0, -0.12, 0.01]}
          fontSize={0.03}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          PALLET #{index + 1}
        </Text>
        {/* Fake barcode lines */}
        <mesh position={[0, -0.06, 0.01]}>
          <planeGeometry args={[0.4, 0.04]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>
    </group>
  );
};
