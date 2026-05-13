import { useGameStore } from '../store/useGameStore';
import { Player3D } from './Player3D';
import { Player2D } from './Player2D';
import { Suspense } from 'react';

export const Visuals = () => {
  const dimension = useGameStore((state) => state.dimension);

  return (
    <Suspense fallback={<mesh><boxGeometry /><meshStandardMaterial color="gray" /></mesh>}>
      {dimension === '3D' ? (
        <Player3D />
      ) : (
        <Player2D />
      )}
    </Suspense>
  );
};
