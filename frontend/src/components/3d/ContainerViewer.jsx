import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, Environment, Center, useProgress } from '@react-three/drei';
import { Edges } from '@react-three/drei';
import { Suspense } from 'react';

function ContainerMesh({ color = '#2F7D32', wireframe = false, autoRotate = false, modelUrl = null }) {
  const ref = useRef();
  useFrame((state, delta) => {
    if (autoRotate && ref.current) ref.current.rotation.y += delta * 0.35;
  });

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
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[4.5, 2.5, 1.8]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.45} wireframe={wireframe} />
            <Edges threshold={15} visible={true} />
          </mesh>

          {/* Inner floor to provide depth perception */}
          <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.2, 1.6]} />
            <meshStandardMaterial color={'#ffffff10'} roughness={0.9} metalness={0} />
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
      <div className="bg-white/90 dark:bg-gray-900/80 px-3 py-1 rounded text-xs shadow">Loading {Math.round(progress)}%</div>
    </Html>
  );
}

export default function ContainerViewer({ width = '100%', height = 320, initialColor = '#2F7D32', modelUrl = null }) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [color, setColor] = useState(initialColor);
  const [localModelUrl, setLocalModelUrl] = useState(null);
  const fileInputRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    return () => {
      // revoke object URL when unmounting
      if (localModelUrl) URL.revokeObjectURL(localModelUrl);
    };
  }, [localModelUrl]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ width, height, minHeight: 220 }}>
      <Canvas ref={canvasRef} shadows camera={{ position: [6, 3, 6], fov: 45 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[8, 6, 4]} intensity={1.0} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <directionalLight position={[-6, 4, -4]} intensity={0.25} />
        <Environment preset="warehouse" background={false} />
        <Suspense fallback={<LoaderOverlay />}>
          <Center>
            <ContainerMesh color={color} wireframe={wireframe} autoRotate={autoRotate} modelUrl={localModelUrl || modelUrl} />
          </Center>
        </Suspense>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>

      {/* Compact toolbar */}
      <div className="absolute left-3 top-3 bg-white/85 dark:bg-gray-900/70 backdrop-blur rounded-full p-1 shadow flex items-center gap-1">
        <button title="Upload model" onClick={() => fileInputRef.current.click()} className="p-2 rounded-full hover:bg-gray-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v10" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 12v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button title="Auto rotate" onClick={() => setAutoRotate((s) => !s)} className="p-2 rounded-full hover:bg-gray-100">
          {autoRotate ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-3-6.7" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2v4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 18v4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </button>

        <button title="Snapshot" onClick={() => {
          try {
            const canvas = document.querySelector('canvas');
            const data = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = data; a.download = 'container-snapshot.png'; a.click();
          } catch (e) {
            console.error('snapshot error', e);
          }
        }} className="p-2 rounded-full hover:bg-gray-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#111827" strokeWidth="1.5"/><path d="M16 3H8v4h8V3z" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Hidden file input for local upload */}
      <input ref={fileInputRef} type="file" accept=".glb,.gltf" className="hidden" onChange={(e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        setLocalModelUrl(url);
      }} />

      {/* Bottom compact controls */}
      <div className="absolute right-3 bottom-3 bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-lg p-2 shadow-md flex items-center gap-2 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-xs">Wireframe</label>
          <input type="checkbox" checked={wireframe} onChange={() => setWireframe(s => !s)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs">Color</label>
          <input aria-label="container-color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-6 p-0 border rounded" type="color" />
        </div>
      </div>
    </div>
  );
}
