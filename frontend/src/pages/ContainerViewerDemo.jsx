import React from 'react';
import ContainerViewer from '../components/3d/ContainerViewer';

export default function ContainerViewerDemo() {
  // Example: pass a modelUrl to load a GLTF/GLB model.
  // const exampleModelUrl = '/assets/models/container.glb';
  const exampleModelUrl = null; // leave null to use built-in box fallback

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">3D Container Viewer</h2>
      <div className="max-w-xl mx-auto">
        <p className="text-sm text-gray-600 mb-3">Try uploading a local GLB/GLTF or use the built-in preview. Compact controls are in the top-left.</p>
        <ContainerViewer height={360} initialColor="#2F7D32" modelUrl={exampleModelUrl} />
      </div>
    </div>
  );
}
