/**
 * File: frontend/src/components/3d/PalletModel.jsx
 * Purpose: Reusable React UI component for the frontend optimized for rendering performance and memory.
 */
import React, { useMemo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

// Custom texture loader that resizes textures in memory to reduce GPU memory footprint
function useOptimizedTexture(url, lightweight) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) return;

    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (!active) return;

      // Rescale dynamically: 512px for mobile/lightweight, 1024px for desktop
      const maxDim = lightweight ? 512 : 1024;
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }

      const optTexture = new THREE.CanvasTexture(canvas);
      optTexture.generateMipmaps = true;
      optTexture.minFilter = THREE.LinearMipmapLinearFilter;
      optTexture.magFilter = THREE.LinearFilter;
      optTexture.anisotropy = 1; // Explicitly disable anisotropy
      optTexture.needsUpdate = true;

      // Dispose of old texture if it changes
      setTexture((prev) => {
        if (prev) prev.dispose();
        return optTexture;
      });
    };

    img.onerror = () => {
      console.warn('Failed to load image texture, fallback used:', url);
    };

    img.src = url;

    return () => {
      active = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [url, lightweight]);

  // Clean up texture when hook unmounts
  useEffect(() => {
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [texture]);

  return texture;
}

export const PalletModel = React.memo(({ position, index, product, enableShadows = false, lightweight = false }) => {
  const palletWidth = 1.0;
  const palletDepth = 1.1;
  const palletHeight = 0.15;
  const loadHeight = 2.2;

  const category = product?.category || 'Coco Peat Products';
  const isGrowBag = category.toLowerCase().includes('grow bag') || category.toLowerCase().includes('growbag');
  const isBag = category.toLowerCase().includes('bag') && !isGrowBag;
  const isDisc = category.toLowerCase().includes('disc');

  // Load the optimized texture dynamically
  const imageUrl = product?.images?.[0] || 'https://placehold.co/400x400/eeeeee/999999?text=Image+Not+Available';
  const texture = useOptimizedTexture(imageUrl, lightweight);

  // Memoize materials to prevent recreating them on every frame
  const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8b5a2b',
    roughness: 1.0,
  }), []);

  const wrapMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.5,
    metalness: 0.1,
    transparent: true,
    opacity: 0.15,
  }), []);

  const productMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture || null,
    color: '#ffffff',
    roughness: isDisc ? 0.9 : (isBag ? 0.9 : 1.0),
  }), [texture, isDisc, isBag]);

  const labelMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff' }), []);
  const barcodeMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000000' }), []);

  // Memoize base geometries to prevent recreating them on every frame
  const palletGeom = useMemo(() => new THREE.BoxGeometry(palletWidth, palletHeight, palletDepth), []);
  const wrapGeom = useMemo(() => new THREE.BoxGeometry(palletWidth * 0.95, loadHeight, palletDepth * 0.95), []);
  const labelGeom = useMemo(() => new THREE.PlaneGeometry(0.6, 0.4), []);
  const barcodeGeom = useMemo(() => new THREE.PlaneGeometry(0.4, 0.04), []);

  // Calculate stack parameters and create geometry once based on product type
  const stackParams = useMemo(() => {
    if (isGrowBag) {
      const radius = 0.14;
      const height = 0.25;
      const cols = 3;
      const rows = 3;
      // Reduce layers on low-end/lightweight devices to save polygons
      const layers = lightweight ? 5 : 8;
      const count = cols * rows * layers;
      const geom = new THREE.CylinderGeometry(radius, radius, height, 8); // 8 radial segments (low-poly)
      return {
        geom,
        cols,
        rows,
        layers,
        count,
        getPos: (x, y, z) => [
          (x - (cols - 1) / 2) * (radius * 2.2),
          palletHeight + (height / 2) + (y * height),
          (z - (rows - 1) / 2) * (radius * 2.2)
        ]
      };
    } else if (isBag) {
      const w = 0.3;
      const h = 0.4;
      const d = 0.15;
      const cols = 3;
      const rows = 6;
      const layers = lightweight ? 3 : 5;
      const count = cols * rows * layers;
      const geom = new THREE.BoxGeometry(w, h, d);
      return {
        geom,
        cols,
        rows,
        layers,
        count,
        getPos: (x, y, z) => [
          (x - (cols - 1) / 2) * (w + 0.02),
          palletHeight + (h / 2) + (y * h),
          (z - (rows - 1) / 2) * (d + 0.02)
        ]
      };
    } else if (isDisc) {
      const radius = 0.15;
      const height = 0.05;
      const cols = 3;
      const rows = 3;
      const layers = lightweight ? 22 : 44;
      const count = cols * rows * layers;
      const geom = new THREE.CylinderGeometry(radius, radius, height, 8); // 8 radial segments (low-poly)
      return {
        geom,
        cols,
        rows,
        layers,
        count,
        getPos: (x, y, z) => [
          (x - (cols - 1) / 2) * (radius * 2.1),
          palletHeight + (height / 2) + (y * height),
          (z - (rows - 1) / 2) * (radius * 2.1)
        ]
      };
    } else {
      // Default: Blocks (Bricks)
      const w = 0.3;
      const h = 0.15;
      const d = 0.15;
      const cols = 3;
      const rows = 6;
      const layers = lightweight ? 8 : 14;
      const count = cols * rows * layers;
      const geom = new THREE.BoxGeometry(w, h, d);
      return {
        geom,
        cols,
        rows,
        layers,
        count,
        getPos: (x, y, z) => [
          (x - (cols - 1) / 2) * (w + 0.01),
          palletHeight + (h / 2) + (y * h),
          (z - (rows - 1) / 2) * (d + 0.01)
        ]
      };
    }
  }, [isGrowBag, isBag, isDisc, lightweight]);

  // Handle disposal of all resources on unmount
  useEffect(() => {
    return () => {
      // Geometries
      palletGeom.dispose();
      wrapGeom.dispose();
      labelGeom.dispose();
      barcodeGeom.dispose();
      if (stackParams?.geom) {
        stackParams.geom.dispose();
      }

      // Materials
      woodMaterial.dispose();
      wrapMaterial.dispose();
      productMaterial.dispose();
      labelMaterial.dispose();
      barcodeMaterial.dispose();
    };
  }, [
    palletGeom,
    wrapGeom,
    labelGeom,
    barcodeGeom,
    stackParams,
    woodMaterial,
    wrapMaterial,
    productMaterial,
    labelMaterial,
    barcodeMaterial
  ]);

  // Instanced Mesh ref to apply individual item transformations
  const instancedMeshRef = useRef();

  useEffect(() => {
    if (!instancedMeshRef.current || !stackParams) return;
    const mesh = instancedMeshRef.current;
    const temp = new THREE.Object3D();
    let idx = 0;

    for (let y = 0; y < stackParams.layers; y++) {
      for (let x = 0; x < stackParams.cols; x++) {
        for (let z = 0; z < stackParams.rows; z++) {
          const [posX, posY, posZ] = stackParams.getPos(x, y, z);
          temp.position.set(posX, posY, posZ);
          temp.updateMatrix();
          mesh.setMatrixAt(idx++, temp.matrix);
        }
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [stackParams]);

  return (
    <group position={position}>
      {/* Wooden Pallet Base */}
      <mesh castShadow={enableShadows} receiveShadow={enableShadows} position={[0, palletHeight / 2, 0]} geometry={palletGeom} material={woodMaterial} />
      
      {/* Shaped Product Stack (Optimized Instanced Mesh) */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[stackParams.geom, productMaterial, stackParams.count]}
        castShadow={enableShadows}
        receiveShadow={enableShadows}
      />

      {/* Wrapped Load */}
      <mesh castShadow={enableShadows} receiveShadow={enableShadows} position={[0, palletHeight + loadHeight / 2, 0]} geometry={wrapGeom} material={wrapMaterial} />

      {/* Shipping Label on the side of the pallet */}
      <group position={[palletWidth / 2 + 0.01, palletHeight + loadHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]} geometry={labelGeom} material={labelMaterial} />
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
        <mesh position={[0, -0.06, 0.01]} geometry={barcodeGeom} material={barcodeMaterial} />
      </group>
    </group>
  );
});

PalletModel.displayName = 'PalletModel';
