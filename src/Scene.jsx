import { PerspectiveCamera, OrthographicCamera, Environment, ContactShadows } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { useGameStore } from './store/useGameStore';
import { Suspense } from 'react';

export const Scene = ({ children }) => {
  const dimension = useGameStore((state) => state.dimension);

  return (
    <>
      {dimension === '3D' ? (
        <PerspectiveCamera makeDefault position={[5, 5, 10]} fov={50} />
      ) : (
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={50} />
      )}

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Environment preset="city" />

      <Suspense fallback={null}>
        <Physics debug>
          {children}
          
          {/* Default Floor for testing */}
          <RigidBody type="fixed" position={[0, -1, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[20, 0.5, 20]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          </RigidBody>
        </Physics>
      </Suspense>

      <ContactShadows opacity={0.5} scale={10} blur={1} far={10} resolution={256} color="#000000" />
    </>
  );
};

// Need to import RigidBody from rapier
import { RigidBody } from '@react-three/rapier';
