import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';

// Individual Obstacle Component
const ObstacleItem = ({ position }) => {
  const loseLife = useGameStore((state) => state.loseLife);
  const glowRef = useRef();

  useFrame((state) => {
    if (!glowRef.current) return;
    const pulse = 0.5 + Math.sin(state.clock.getElapsedTime() * 8) * 0.4;
    glowRef.current.material.emissiveIntensity = pulse;
  });

  const handleCollision = (e) => {
    loseLife();
  };

  return (
    <RigidBody
      type="fixed"
      position={position}
      colliders={false}
      onCollisionEnter={handleCollision}
    >
      <CuboidCollider args={[0.9, 0.45, 0.12]} position={[0, 0.45, 0]} />
      <group>
        {/* Left Stand */}
        <mesh position={[-0.9, 0.4, 0]} castShadow>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color="#22222a" roughness={0.4} />
        </mesh>
        {/* Right Stand */}
        <mesh position={[0.9, 0.4, 0]} castShadow>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color="#22222a" roughness={0.4} />
        </mesh>

        {/* Diagonal Warning Plate */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.8, 0.24, 0.08]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.5} />
        </mesh>

        {/* Pulsing Neon Warning Core Beam */}
        <mesh ref={glowRef} position={[0, 0.72, 0]}>
          <boxGeometry args={[1.7, 0.1, 0.1]} />
          <meshStandardMaterial
            color="#ff0055"
            emissive="#ff0055"
            emissiveIntensity={0.8}
            roughness={0.1}
          />
        </mesh>
      </group>
    </RigidBody>
  );
};

// Spawner that generates obstacles down the track
export const Obstacle = () => {
  const gameState = useGameStore((state) => state.gameState);

  const obstacles = useMemo(() => {
    const list = [];
    const lanes = [-2.2, 0, 2.2];
    
    let seed = 98765;
    const seededRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let z = -45; z > -680; z -= 45 + Math.floor(seededRandom() * 15)) {
      const laneIndex = Math.floor(seededRandom() * lanes.length);
      const lane = lanes[laneIndex];

      list.push({
        id: `obs-${z}-${lane}`,
        position: [lane, 0, z],
      });
    }
    return list;
  }, [gameState === 'START']);

  return (
    <group>
      {obstacles.map((obs) => (
        <ObstacleItem key={obs.id} position={obs.position} />
      ))}
    </group>
  );
};
