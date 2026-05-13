import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const ParallaxBackground = ({ url = '/background.png', speed = 0.5 }) => {
  const mesh = useRef();
  const texture = useTexture(url);
  
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  useFrame((state, delta) => {
    if (!mesh.current) return;
    // Offset texture based on time or player position (if passed)
    // For now, just a slow constant scroll to show it works
    mesh.current.material.map.offset.x += delta * speed;
  });

  return (
    <mesh ref={mesh} position={[0, 0, -5]} scale={[40, 20, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent={true} />
    </mesh>
  );
};
