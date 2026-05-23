import { PerspectiveCamera, OrthographicCamera, Environment } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './store/useGameStore';
import { Suspense, useRef } from 'react';
import { Track } from './components/Track';
import { Food } from './components/Food';
import { Obstacle } from './components/Obstacle';

// Custom Camera Controller that smoothly follows the player depending on active dimension
const CameraController = () => {
  const dimension = useGameStore((state) => state.dimension);
  const targetCamPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame((state) => {
    // Find the player object in the scene
    const player = state.scene.getObjectByName('player');
    if (!player) return;

    const playerPos = new THREE.Vector3();
    player.getWorldPosition(playerPos);

    if (dimension === '3D') {
      // 3D mode: Follow from behind and slightly above the player
      targetCamPos.current.set(
        THREE.MathUtils.lerp(state.camera.position.x, playerPos.x * 0.5, 0.08), // Soft horizontal damping
        THREE.MathUtils.lerp(state.camera.position.y, playerPos.y + 3.2, 0.1),
        THREE.MathUtils.lerp(state.camera.position.z, playerPos.z + 6.0, 0.1) // Follow behind player in Z
      );
      state.camera.position.copy(targetCamPos.current);

      // Look slightly ahead of the player
      targetLookAt.current.set(
        playerPos.x * 0.7,
        playerPos.y + 0.8,
        playerPos.z - 3.5
      );
      state.camera.lookAt(targetLookAt.current);
    } else {
      // 2D side-scroller mode (X/Y plane): Follow player's X position
      targetCamPos.current.set(
        THREE.MathUtils.lerp(state.camera.position.x, playerPos.x, 0.1),
        THREE.MathUtils.lerp(state.camera.position.y, playerPos.y + 1, 0.1),
        9.0 // Fixed Z offset
      );
      state.camera.position.copy(targetCamPos.current);

      targetLookAt.current.set(
        targetCamPos.current.x,
        targetCamPos.current.y,
        0
      );
      state.camera.lookAt(targetLookAt.current);
    }
  });

  return null;
};

export const Scene = ({ children }) => {
  const dimension = useGameStore((state) => state.dimension);

  return (
    <>
      {/* Cyberpunk Arcade Background Color */}
      <color attach="background" args={['#040407']} />

      {dimension === '3D' ? (
        <PerspectiveCamera makeDefault fov={55} position={[0, 4, 6]} far={1000} />
      ) : (
        <OrthographicCamera makeDefault zoom={65} far={100} />
      )}

      {/* Atmospheric Lighting */}
      <ambientLight intensity={0.4} />
      
      {/* Dynamic Purple/Blue Neon Key Lights */}
      <directionalLight position={[5, 10, 5]} intensity={1.2} color="#00ffff" castShadow />
      <directionalLight position={[-5, 8, -5]} intensity={0.8} color="#ff00ff" />
      
      <Environment preset="city" />

      <Suspense fallback={null}>
        <Physics debug={false}>
          <CameraController />
          
          {children}

          {dimension === '3D' ? (
            <>
              {/* Spawns the highway runner elements */}
              <Track />
              <Food />
              <Obstacle />
            </>
          ) : (
            // 2D side-scrolling static setup
            <>
              <RigidBody type="fixed" position={[0, -1, 0]} colliders="cuboid">
                <mesh receiveShadow>
                  <boxGeometry args={[120, 0.5, 3]} />
                  <meshStandardMaterial color="#0f0f15" roughness={0.8} />
                </mesh>
              </RigidBody>
              
              {/* Boundaries so player does not slide off in Z */}
              <RigidBody type="fixed" position={[0, 0, -0.6]} colliders="cuboid">
                <mesh visible={false}>
                  <boxGeometry args={[120, 10, 0.1]} />
                </mesh>
              </RigidBody>
              <RigidBody type="fixed" position={[0, 0, 0.6]} colliders="cuboid">
                <mesh visible={false}>
                  <boxGeometry args={[120, 10, 0.1]} />
                </mesh>
              </RigidBody>
            </>
          )}
        </Physics>
      </Suspense>
    </>
  );
};

