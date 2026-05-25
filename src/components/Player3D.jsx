import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export const Player3D = () => {
  const rb = useRef();
  const group = useRef();

  // Limb refs for procedural running human animation
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();

  const { gameState, weight, distance, updateDistance } = useGameStore();
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

  // Teleport the player back to start when the game returns to START or reset
  useEffect(() => {
    if ((gameState === 'START' || gameState === 'PLAYING') && rb.current) {
      rb.current.setTranslation({ x: 0, y: 0.64, z: 0 }, true);
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      setActiveLane(1);
    }
  }, [gameState]);

  useFrame((state, delta) => {
    if (!rb.current || !group.current) return;

    // Retrieve rigid body transforms
    const position = rb.current.translation();
    const velocity = rb.current.linvel();

    // 1. SYNCHRONOUS TELEPORT reset guard (instantly catches Z = -720 race conditions before any ticks compute)
    if (gameState === 'PLAYING' && Math.abs(position.z) > 100 && distance === 0) {
      rb.current.setTranslation({ x: 0, y: 0.64, z: 0 }, true);
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      setActiveLane(1);
      return;
    }

    // 2. DYNAMIC VISUAL SCALING (FATNESS)
    // Scale X/Z based on current weight (base 50 is scale 1.0, range 20-100)
    const scaleFactor = 1.0 + (weight - 50) / 100;
    // Keep Y height constant, grow width & depth to look fat/slim
    group.current.scale.set(scaleFactor, 1.0, scaleFactor);

    // 3. PROCEDURAL HUMAN ANIMATIONS (bobbing, limb swinging)
    const time = state.clock.getElapsedTime();
    
    if (gameState === 'PLAYING') {
      // Gentle running bounce/bobbing
      group.current.position.y = Math.sin(time * 6) * 0.05;
      
      // Swing limbs like a running human runner
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * 12) * 0.7;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(time * 12) * 0.7;
      
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.sin(time * 12) * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time * 12) * 0.6;
    } else {
      // Gentle idle breathing bob
      group.current.position.y = Math.sin(time * 2.5) * 0.03;
      
      // Return limbs to neutral position smoothly when not playing
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.1);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.1);
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1);

      // Free stall if game over or won
      rb.current.setLinvel({ x: 0, y: Math.sin(time * 2) * 0.1, z: 0 }, true);

      // Dramatic crash rotation if lost
      if (gameState === 'GAMEOVER') {
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, Math.PI / 3, 0.05);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.PI / 4, 0.05);
      } else {
        group.current.rotation.set(0, 0, 0);
      }
      return;
    }

    // 4. KEYBOARD MOVEMENT CONTROL
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

    // Apply banking tilt when switching lanes
    const tiltTarget = (targetX - position.x) * -0.12;
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, tiltTarget, 0.12);

    // 5. JUMP MECHANIC
    let jumpYVel = velocity.y;
    // Check if player is resting on or close to the ground (resting Y is around 0.64)
    // and vertical velocity is near zero to prevent double jumping
    const isOnGround = position.y < 0.75 && Math.abs(velocity.y) < 0.15;
    if (jump && isOnGround) {
      jumpYVel = 6.2; // Apply upward jump velocity
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
      colliders={false}
      enabledRotations={[false, false, false]}
      position={[0, 0.64, 0]}
    >
      <CapsuleCollider args={[0.42, 0.22]} position={[0, 0.22, 0]} />
      
      {/* Set name="player" so CameraController can locate it */}
      <group ref={group} name="player">
        
        {/* Head */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" roughness={0.4} />
        </mesh>
        
        {/* Cyber Visor Eye (Glowing cyan/rose neon) */}
        <mesh position={[0, 0.68, -0.12]}>
          <boxGeometry args={[0.3, 0.06, 0.1]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>

        {/* Torso (Body) */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.38, 0.54, 0.22]} />
          <meshStandardMaterial color="#161622" roughness={0.3} metalness={0.8} />
        </mesh>
        
        {/* Glowing Suit Strip */}
        <mesh position={[0, 0.22, -0.12]}>
          <boxGeometry args={[0.06, 0.4, 0.02]} />
          <meshBasicMaterial color={glowColor} />
        </mesh>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.24, 0.38, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <boxGeometry args={[0.08, 0.36, 0.08]} />
            <meshStandardMaterial color="#161622" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.24, 0.38, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <boxGeometry args={[0.08, 0.36, 0.08]} />
            <meshStandardMaterial color="#161622" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.12, -0.05, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <boxGeometry args={[0.1, 0.44, 0.1]} />
            <meshStandardMaterial color="#0b0b10" roughness={0.5} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.12, -0.05, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <boxGeometry args={[0.1, 0.44, 0.1]} />
            <meshStandardMaterial color="#0b0b10" roughness={0.5} />
          </mesh>
        </group>
        
      </group>
    </RigidBody>
  );
};
