import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpriteAnimator, useKeyboardControls } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useState } from 'react';

export const Player2D = ({ spriteUrl = '/sprite.png' }) => {
  const rb = useRef();
  const [animation, setAnimation] = useState('idle');
  const [flip, setFlip] = useState(false);
  const [, getKeys] = useKeyboardControls();

  useFrame(() => {
    if (!rb.current) return;

    const { forward, backward, left, right, jump } = getKeys();
    const velocity = rb.current.linvel();
    const speed = 5;

    let moveX = 0;
    let moveY = velocity.y; // Default to current vertical velocity (gravity)

    // Side-scroller logic (X/Y plane)
    if (left) {
      moveX = -speed;
      setFlip(true);
      setAnimation('run');
    } else if (right) {
      moveX = speed;
      setFlip(false);
      setAnimation('run');
    } else {
      setAnimation('idle');
    }

    if (jump && Math.abs(velocity.y) < 0.1) {
      rb.current.applyImpulse({ x: 0, y: 8, z: 0 }, true);
    }

    rb.current.setLinvel({ x: moveX, y: moveY, z: 0 }, true);
  });

  return (
    <RigidBody ref={rb} colliders="cuboid" enabledRotations={[false, false, false]} position={[0, 2, 0]}>
      <group scale={[2, 2, 2]}>
        <SpriteAnimator
          position={[0, 0, 0]}
          textureDataURL={spriteUrl}
          animationName={animation}
          flipX={flip}
          loop={true}
          autoPlay={true}
          // Attendees will need to configure these based on their sprite sheet
          fps={12}
          alphaTest={0.5}
        />
      </group>
    </RigidBody>
  );
};
