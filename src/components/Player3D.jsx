import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF, useKeyboardControls } from '@react-three/drei';
import { RigidBody, vec3 } from '@react-three/rapier';
import * as THREE from 'three';

export const Player3D = ({ modelUrl = '/character.glb' }) => {
  const rb = useRef();
  const group = useRef();
  const [currentAnimation, setCurrentAnimation] = useState('Idle');
  
  // Load model
  const { nodes, materials, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, group);

  const [, getKeys] = useKeyboardControls();

  useEffect(() => {
    if (actions[currentAnimation]) {
      actions[currentAnimation].reset().fadeIn(0.5).play();
      return () => actions[currentAnimation].fadeOut(0.5);
    }
  }, [currentAnimation, actions]);

  useFrame((state, delta) => {
    if (!rb.current) return;

    const { forward, backward, left, right, jump } = getKeys();
    
    const velocity = rb.current.linvel();
    const movement = new THREE.Vector3(0, 0, 0);

    const speed = 5;
    
    if (forward) movement.z -= speed;
    if (backward) movement.z += speed;
    if (left) movement.x -= speed;
    if (right) movement.x += speed;

    // Apply movement
    rb.current.setLinvel({ x: movement.x, y: velocity.y, z: movement.z }, true);

    // Rotation
    if (movement.length() > 0) {
      const angle = Math.atan2(movement.x, movement.z);
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        angle,
        0.15
      );
      setCurrentAnimation('Run');
    } else {
      setCurrentAnimation('Idle');
    }

    // Jump
    if (jump && Math.abs(velocity.y) < 0.1) {
      rb.current.applyImpulse({ x: 0, y: 5, z: 0 }, true);
    }
  });

  return (
    <RigidBody ref={rb} colliders="capsule" enabledRotations={[false, false, false]} position={[0, 2, 0]}>
      <group ref={group}>
        <primitive object={nodes.Scene || nodes.RootNode || Object.values(nodes)[0]} />
      </group>
    </RigidBody>
  );
};

// Pre-load common path
// useGLTF.preload('/character.glb');
