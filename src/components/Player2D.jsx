import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export const Player2D = () => {
  const rb = useRef();
  const group = useRef();
  const eyeRef = useRef();

  const { gameState, weight } = useGameStore();
  const [, getKeys] = useKeyboardControls();

  // Setup tag name on mount so the CameraController can follow
  useEffect(() => {
    if (group.current) {
      group.current.name = 'player';
    }
  }, []);

  useFrame((state, delta) => {
    if (!rb.current || !group.current) return;

    const velocity = rb.current.linvel();
    const position = rb.current.translation();

    // 1. DYNAMIC WEIGHT SCALING (Fatness)
    // In 2D, scale X and Y to look bigger/smaller flatly
    const scaleFactor = 1.0 + (weight - 50) / 100;
    group.current.scale.set(scaleFactor * 1.5, scaleFactor * 1.5, 1);

    // 2. PROCEDURAL HOVER & VISOR ANIMATION
    const time = state.clock.getElapsedTime();
    group.current.position.y = Math.sin(time * 4) * 0.06;

    if (eyeRef.current) {
      eyeRef.current.position.x = Math.sin(time * 2) * 0.08; // visor sweeps side to side
    }

    if (gameState !== 'PLAYING') {
      rb.current.setLinvel({ x: 0, y: Math.sin(time * 2) * 0.2, z: 0 }, true);
      if (gameState === 'GAMEOVER') {
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, Math.PI / 2, 0.05);
      } else {
        group.current.rotation.set(0, 0, 0);
      }
      return;
    }

    // 3. KEYBOARD SIDE-SCROLL MOVEMENT (X/Y Plane)
    const { left, right, jump } = getKeys();
    const speed = 7;
    let moveX = 0;
    let moveY = velocity.y;

    if (left) {
      moveX = -speed;
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0.15, 0.1);
    } else if (right) {
      moveX = speed;
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -0.15, 0.1);
    } else {
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0, 0.15);
    }

    // Jump
    const isOnGround = position.y < 0.1;
    if (jump && isOnGround) {
      moveY = 6.2;
    }

    // Lock Z coordinate to 0 for strict 2D physics
    rb.current.setTranslation({ x: position.x, y: position.y, z: 0 }, true);
    rb.current.setLinvel({ x: moveX, y: moveY, z: 0 }, true);
  });

  const isWarning = weight >= 85;
  const glowColor = isWarning ? '#ff0055' : '#00f6ff';

  return (
    <RigidBody
      ref={rb}
      colliders="cuboid"
      enabledRotations={[false, false, false]}
      position={[0, 0.4, 0]}
    >
      <group ref={group} name="player">
        
        {/* Procedural 2D Retro Cyber-Block */}
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.5, 0.2]} />
          <meshStandardMaterial color="#1a1a24" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Visor Eye */}
        <mesh ref={eyeRef} position={[0, 0.1, 0.11]}>
          <boxGeometry args={[0.3, 0.08, 0.05]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>

        {/* Side thrusters */}
        <mesh position={[-0.28, -0.15, 0]}>
          <boxGeometry args={[0.06, 0.16, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.28, -0.15, 0]}>
          <boxGeometry args={[0.06, 0.16, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        
      </group>
    </RigidBody>
  );
};
