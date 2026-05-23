import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export const Player3D = () => {
  const rb = useRef();
  const group = useRef();
  const thrusterRef = useRef();
  const leftRotor = useRef();
  const rightRotor = useRef();

  const { gameState, weight, updateDistance } = useGameStore();
  const [, getKeys] = useKeyboardControls();
  
  // Lane positions and state
  const lanes = [-2.2, 0, 2.2];
  const [activeLane, setActiveLane] = useState(1); // Start in middle lane (index 1)

  // Edge-trigger tracking for discrete key presses
  const prevLeft = useRef(false);
  const prevRight = useRef(false);

  // Constants
  const forwardSpeed = 12; // units per second
  const laneTransitionSpeed = 0.18; // lerp speed

  // Setup tag name on mount so the CameraController can find the player in the scene
  useEffect(() => {
    if (group.current) {
      group.current.name = 'player';
    }
  }, []);

  useFrame((state, delta) => {
    if (!rb.current || !group.current) return;

    // Retrieve rigid body transforms
    const position = rb.current.translation();
    const velocity = rb.current.linvel();

    // 1. DYNAMIC VISUAL SCALING (FATNESS)
    // Scale X/Z based on current weight (base 50 is scale 1.0, range 20-100)
    const scaleFactor = 1.0 + (weight - 50) / 100;
    // Keep Y height constant, grow width & depth to look fat/slim
    group.current.scale.set(scaleFactor, 1.0, scaleFactor);

    // 2. PROCEDURAL ANIMATIONS (bobbing, rotors, thrusters)
    const time = state.clock.getElapsedTime();
    
    // Smooth idle bobbing
    if (gameState === 'PLAYING') {
      group.current.position.y = Math.sin(time * 6) * 0.08;
    } else {
      group.current.position.y = Math.sin(time * 3) * 0.12;
    }

    // Spin side rotors in opposite directions
    if (leftRotor.current) leftRotor.current.rotation.y += 0.15;
    if (rightRotor.current) rightRotor.current.rotation.y -= 0.15;

    // Pulse bottom thruster flame
    if (thrusterRef.current) {
      const pulse = 0.8 + Math.sin(time * 20) * 0.25;
      thrusterRef.current.scale.set(pulse, pulse * 1.5, pulse);
    }

    // If game is not actively playing, stall and freeze player
    if (gameState !== 'PLAYING') {
      rb.current.setLinvel({ x: 0, y: Math.sin(time * 2) * 0.2, z: 0 }, true);
      
      // Dramatic crash rotation if lost
      if (gameState === 'GAMEOVER') {
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, Math.PI / 3, 0.05);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.PI / 4, 0.05);
      } else {
        group.current.rotation.set(0, 0, 0);
      }
      return;
    }

    // 3. KEYBOARD MOVEMENT CONTROL
    const { left, right, jump } = getKeys();

    // Switch lanes discretely
    if (left && !prevLeft.current) {
      if (activeLane > 0) setActiveLane((prev) => prev - 1);
    }
    if (right && !prevRight.current) {
      if (activeLane < 2) setActiveLane((prev) => prev + 1);
    }
    
    prevLeft.current = left;
    prevRight.current = right;

    // Smooth horizontal lane transition
    const targetX = lanes[activeLane];
    const newX = THREE.MathUtils.lerp(position.x, targetX, laneTransitionSpeed);

    // Apply minor banking tilt when switching lanes
    const tiltTarget = (targetX - position.x) * -0.15;
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, tiltTarget, 0.12);

    // 4. JUMP MECHANIC
    let jumpYVel = velocity.y;
    // Check if player is on the ground
    const isOnGround = position.y < 0.1;
    if (jump && isOnGround) {
      jumpYVel = 5.8; // Apply upward jump velocity
    }

    // Apply constant forward speed in Z (running from 0 towards negative Z)
    rb.current.setLinvel({ x: (newX - position.x) / delta, y: jumpYVel, z: -forwardSpeed }, true);

    // Sync distance run with the store
    updateDistance(position.z);
  });

  // Emissive color maps: red warning if dangerously heavy, cyan green if normal
  const glowColor = weight >= 85 ? '#ff0055' : '#00f6ff';

  return (
    <RigidBody
      ref={rb}
      colliders="capsule"
      enabledRotations={[false, false, false]}
      position={[0, 0.4, 0]}
    >
      {/* Set name="player" so CameraController can locate it */}
      <group ref={group} name="player">
        
        {/* Main Drone Body (High-tech Capsule) */}
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 0.35, 8, 16]} />
          <meshStandardMaterial color="#1a1a24" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Cyber Visor Eye (Glowing cyan/rose neon) */}
        <mesh position={[0, 0.12, -0.22]}>
          <boxGeometry args={[0.42, 0.1, 0.15]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>

        {/* Left Rotor Engine Bracket */}
        <mesh position={[-0.45, 0, 0]} rotation={[0, 0, Math.PI / 12]}>
          <boxGeometry args={[0.2, 0.05, 0.05]} />
          <meshStandardMaterial color="#111116" />
        </mesh>

        {/* Left Rotor Ring */}
        <mesh ref={leftRotor} position={[-0.55, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.03, 8, 16]} />
          <meshStandardMaterial color="#2d2d38" roughness={0.1} />
        </mesh>

        {/* Right Rotor Engine Bracket */}
        <mesh position={[0.45, 0, 0]} rotation={[0, 0, -Math.PI / 12]}>
          <boxGeometry args={[0.2, 0.05, 0.05]} />
          <meshStandardMaterial color="#111116" />
        </mesh>

        {/* Right Rotor Ring */}
        <mesh ref={rightRotor} position={[0.55, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.03, 8, 16]} />
          <meshStandardMaterial color="#2d2d38" roughness={0.1} />
        </mesh>

        {/* Bottom Jet Jetpack Thruster */}
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.12, 0.08, 0.15, 12]} />
          <meshStandardMaterial color="#111" roughness={0.6} />
        </mesh>

        {/* Pulsing Jet Thruster Flame */}
        <mesh ref={thrusterRef} position={[0, -0.48, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.08, 0.22, 8]} />
          <meshBasicMaterial color="#ff00a0" transparent opacity={0.8} />
        </mesh>

        {/* Jet Thruster Glow light */}
        <pointLight position={[0, -0.6, 0]} color="#ff00a0" intensity={0.6} distance={6} />
      </group>
    </RigidBody>
  );
};
