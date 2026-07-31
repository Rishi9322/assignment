import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface VisualizerProps {
  isListening: boolean;
}

const SphereVisualizer: React.FC<{ isListening: boolean }> = ({ isListening }) => {
  const meshRef = React.useRef<any>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const pulse = isListening ? 1 + Math.sin(state.clock.elapsedTime * 8) * 0.15 : 1;
    meshRef.current.scale.setScalar(pulse);
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 48, 48]} />
      <meshStandardMaterial
        color={isListening ? '#3b82f6' : '#64748b'}
        roughness={0.28}
        metalness={0.5}
      />
    </mesh>
  );
};

export const VoiceVisualizer: React.FC<VisualizerProps> = ({ isListening }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      <div className="h-48 w-full">
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
          <color attach="background" args={['#020617']} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[2, 2, 3]} intensity={1.2} />
          <pointLight position={[-3, -2, 4]} intensity={1.4} color="#60a5fa" />
          <SphereVisualizer isListening={isListening} />
          <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.8} />
        </Canvas>
      </div>
      <div className="border-t border-slate-800 px-4 py-2 text-center text-xs text-slate-500">
        {isListening ? '3D voice visualizer active' : '3D voice visualizer idle'}
      </div>
    </div>
  );
};
