import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';

export const Track = () => {
  const laneWidth = 2.2; // Width of each lane
  const length = 750; // Total length of the track
  const startZ = 10;
  const endZ = -length;

  // Generate repeating side pillars for a sense of speed
  const pillars = [];
  for (let z = 0; z > -720; z -= 30) {
    pillars.push({ id: `p-left-${z}`, position: [-4, 2, z], color: '#ff007f' });
    pillars.push({ id: `p-right-${z}`, position: [4, 2, z], color: '#00f6ff' });
  }

  // Generate dashed lane dividing markings
  const dashes = [];
  for (let z = 0; z > -720; z -= 10) {
    dashes.push({ id: `d-1-${z}`, position: [-laneWidth / 2, 0.01, z] });
    dashes.push({ id: `d-2-${z}`, position: [laneWidth / 2, 0.01, z] });
  }

  return (
    <group>
      {/* Physics Floor - Static */}
      <RigidBody type="fixed" position={[0, -0.25, -360]} colliders="cuboid">
        <mesh receiveShadow>
          <boxGeometry args={[10, 0.5, length]} />
          <meshStandardMaterial color="#0f0f15" roughness={0.8} metalness={0.2} />
        </mesh>
      </RigidBody>

      {/* Visual Road Gridlines & Aesthetics */}
      {/* Central Road Mesh with Neon Glow Borders */}
      <mesh position={[0, 0.001, -360]}>
        <planeGeometry args={[7.5, length]} />
        <meshStandardMaterial color="#07070a" roughness={0.9} />
      </mesh>

      {/* Neon Side Boundaries (Left & Right rails) */}
      <mesh position={[-3.8, 0.05, -360]}>
        <boxGeometry args={[0.1, 0.1, length]} />
        <meshBasicMaterial color="#7f00ff" />
      </mesh>
      <mesh position={[3.8, 0.05, -360]}>
        <boxGeometry args={[0.1, 0.1, length]} />
        <meshBasicMaterial color="#7f00ff" />
      </mesh>

      {/* Dashed Lane Markings */}
      {dashes.map((dash) => (
        <mesh key={dash.id} position={dash.position} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 3]} />
          <meshBasicMaterial color="#333344" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Glowing Speed Pillars */}
      {pillars.map((pillar) => (
        <group key={pillar.id} position={pillar.position}>
          {/* Vertical Pillar */}
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
            <meshStandardMaterial color="#1a1a24" roughness={0.5} />
          </mesh>
          {/* Neon cap */}
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color={pillar.color} />
          </mesh>
          {/* Small point light for some pillars to give atmospheric glow */}
          {pillar.position[2] % 120 === 0 && (
            <pointLight position={[0, 2, 0]} color={pillar.color} intensity={0.5} distance={15} />
          )}
        </group>
      ))}

      {/* START LINE AESTHETICS */}
      <group position={[0, 0.01, 2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7.5, 1]} />
          <meshBasicMaterial color="#00ff66" transparent opacity={0.3} />
        </mesh>
        <Text
          position={[0, 2, 0]}
          fontSize={1.2}
          color="#00ff66"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI, 0]} // Face the camera at start
        >
          START
        </Text>
      </group>

      {/* FINISH LINE GATE AESTHETICS (Z = -720) */}
      <group position={[0, 0, -720]}>
        {/* Left Post */}
        <mesh position={[-4, 4, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 8, 16]} />
          <meshStandardMaterial color="#222" roughness={0.4} />
        </mesh>
        {/* Right Post */}
        <mesh position={[4, 4, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 8, 16]} />
          <meshStandardMaterial color="#222" roughness={0.4} />
        </mesh>
        {/* Crossbar */}
        <mesh position={[0, 8, 0]}>
          <boxGeometry args={[8.4, 0.4, 0.8]} />
          <meshStandardMaterial color="#222" roughness={0.4} />
        </mesh>
        {/* Glowing Sign */}
        <mesh position={[0, 6.8, 0]}>
          <boxGeometry args={[6, 1.5, 0.2]} />
          <meshStandardMaterial color="#000" roughness={0.2} metalness={0.8} />
        </mesh>
        <Text
          position={[0, 6.8, 0.12]}
          fontSize={0.8}
          color="#ff00ff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          FINISH
        </Text>
        {/* Big Neon Glow bar under FINISH */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[7.5, 0.1, 1]} />
          <meshBasicMaterial color="#ff00ff" />
        </mesh>
        <pointLight position={[0, 7, 1]} color="#ff00ff" intensity={2} distance={20} />
      </group>
    </group>
  );
};
