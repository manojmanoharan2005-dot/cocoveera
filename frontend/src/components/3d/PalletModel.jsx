/**
 * File: frontend/src/components/3d/PalletModel.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';

// Procedural pallet and product load
export const PalletModel = ({ position, index, product }) => {
  const palletWidth = 1.0;
  const palletDepth = 1.1;
  const palletHeight = 0.15;
  const loadHeight = 1.3;

  const category = product?.category || 'Coco Peat Products';
  const isGrowBag = category.toLowerCase().includes('grow bag') || category.toLowerCase().includes('growbag');
  const isBag = category.toLowerCase().includes('bag') && !isGrowBag;
  const isDisc = category.toLowerCase().includes('disc');

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: '#8b5a2b',
    roughness: 1.0,
  });

  const wrapMaterial = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.2,
    transmission: 0.6,
  });

  // Load the product image to use as the shape
  const imageUrl = product?.images?.[0] || 'https://placehold.co/400x400/eeeeee/999999?text=Image+Not+Available';
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  const renderProductStack = () => {
    const items = [];
    if (isGrowBag) {
      // Cylinders (Grow Bags)
      const radius = 0.14;
      const height = 0.25;
      const cols = 3;
      const rows = 3;
      const layers = 5;
      for (let y = 0; y < layers; y++) {
        for (let x = 0; x < cols; x++) {
          for (let z = 0; z < rows; z++) {
            const posX = (x - (cols - 1) / 2) * (radius * 2.2);
            const posZ = (z - (rows - 1) / 2) * (radius * 2.2);
            const posY = palletHeight + (height / 2) + (y * height);
            items.push(
              <mesh key={`gb-${x}-${y}-${z}`} position={[posX, posY, posZ]} castShadow>
                <cylinderGeometry args={[radius, radius, height, 16]} />
                <meshStandardMaterial map={texture} color="#ffffff" roughness={0.9} />
              </mesh>
            );
          }
        }
      }
    } else if (isBag) {
      // Standing Pouch / 5KG bags
      const w = 0.3;
      const h = 0.4;
      const d = 0.15;
      const cols = 3;
      const rows = 6;
      const layers = 3;
      for (let y = 0; y < layers; y++) {
        for (let x = 0; x < cols; x++) {
          for (let z = 0; z < rows; z++) {
            const posX = (x - (cols - 1) / 2) * (w + 0.02);
            const posZ = (z - (rows - 1) / 2) * (d + 0.02);
            const posY = palletHeight + (h / 2) + (y * h);
            items.push(
              <mesh key={`bg-${x}-${y}-${z}`} position={[posX, posY, posZ]} castShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial map={texture} color="#ffffff" roughness={0.9} />
              </mesh>
            );
          }
        }
      }
    } else if (isDisc) {
      // Discs
      const radius = 0.15;
      const height = 0.05;
      const cols = 3;
      const rows = 3;
      const layers = 24;
      for (let y = 0; y < layers; y++) {
        for (let x = 0; x < cols; x++) {
          for (let z = 0; z < rows; z++) {
            const posX = (x - (cols - 1) / 2) * (radius * 2.1);
            const posZ = (z - (rows - 1) / 2) * (radius * 2.1);
            const posY = palletHeight + (height / 2) + (y * height);
            items.push(
              <mesh key={`dsc-${x}-${y}-${z}`} position={[posX, posY, posZ]} castShadow>
                <cylinderGeometry args={[radius, radius, height, 16]} />
                <meshStandardMaterial map={texture} color="#ffffff" roughness={0.9} />
              </mesh>
            );
          }
        }
      }
    } else {
      // Default: Blocks (Bricks)
      const w = 0.3;
      const h = 0.15;
      const d = 0.15;
      const cols = 3;
      const rows = 6;
      const layers = 8;
      for (let y = 0; y < layers; y++) {
        for (let x = 0; x < cols; x++) {
          for (let z = 0; z < rows; z++) {
            const posX = (x - (cols - 1) / 2) * (w + 0.01);
            const posZ = (z - (rows - 1) / 2) * (d + 0.01);
            const posY = palletHeight + (h / 2) + (y * h);
            items.push(
              <mesh key={`blk-${x}-${y}-${z}`} position={[posX, posY, posZ]} castShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial map={texture} color="#ffffff" roughness={1.0} />
              </mesh>
            );
          }
        }
      }
    }
    return items;
  };

  return (
    <group position={position}>
      {/* Wooden Pallet Base */}
      <mesh castShadow receiveShadow position={[0, palletHeight / 2, 0]}>
        <boxGeometry args={[palletWidth, palletHeight, palletDepth]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>
      
      {/* Shaped Product Stack */}
      {renderProductStack()}

      {/* Wrapped Load */}
      <mesh castShadow receiveShadow position={[0, palletHeight + loadHeight / 2, 0]}>
        <boxGeometry args={[palletWidth * 0.95, loadHeight, palletDepth * 0.95]} />
        <primitive object={wrapMaterial} attach="material" />
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
