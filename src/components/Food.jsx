import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';

// Individual Food Item Component
const FoodItem = ({ food, position }) => {
  const [collected, setCollected] = useState(false);
  const adjustWeight = useGameStore((state) => state.adjustWeight);
  const gameState = useGameStore((state) => state.gameState);

  if (collected || gameState === 'START') {
    // Force reset collected state if game goes back to START screen
    if (collected && gameState === 'START') {
      setCollected(false);
    }
    return null;
  }

  const handleCollision = (e) => {
    if (collected) return;
    // Rapier intersection triggers: check if it's the player
    // In our player component, we will tag the rigid body or check name
    setCollected(true);
    
    // Healthy foods have score >= 6.
    // If healthy: player gets slimmer (weight decreases, e.g. -10).
    // If unhealthy: player gets fatter (weight increases, e.g. +15).
    const isHealthy = food.healthScore >= 6;
    const amount = isHealthy ? -10 : 15;
    adjustWeight(amount, food.name);
  };

  const isHealthy = food.healthScore >= 6;
  // Green for healthy (slim), red-orange for unhealthy (fat)
  const color = isHealthy ? '#00ff88' : '#ff5500';

  // Procedural geometry based on food type
  let geometry = null;
  const fType = (food.type || '').toLowerCase();
  
  if (fType.includes('fruit')) {
    // Apple/orange sphere
    geometry = (
      <group>
        <mesh castShadow>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.1} metalness={0.6} />
        </mesh>
        {/* Apple stem */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
      </group>
    );
  } else if (fType.includes('sweet') || fType.includes('dessert') || food.name.toLowerCase().includes('donut') || food.name.toLowerCase().includes('jalebi')) {
    // Torus (donut/jalebi shape)
    geometry = (
      <mesh castShadow>
        <torusGeometry args={[0.26, 0.09, 8, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.3} metalness={0.5} />
      </mesh>
    );
  } else if (fType.includes('salad') || fType.includes('soup') || fType.includes('dal') || fType.includes('soup')) {
    // Cylinder-bowl (healthy salad bowl)
    geometry = (
      <group>
        {/* Bowl */}
        <mesh castShadow>
          <cylinderGeometry args={[0.36, 0.22, 0.22, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Content */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.04, 16]} />
          <meshStandardMaterial color="#2d5e2d" roughness={0.8} />
        </mesh>
      </group>
    );
  } else if (!isHealthy) {
    // Stack of cylinders (Samosa / Burger shape)
    geometry = (
      <group>
        {/* Bottom Bun */}
        <mesh castShadow position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.08, 16]} />
          <meshStandardMaterial color="#e0a96d" roughness={0.6} />
        </mesh>
        {/* Patty (Glowing Neon Bad Food Core) */}
        <mesh castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.1, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.4} />
        </mesh>
        {/* Top Bun */}
        <mesh castShadow position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.34, 0.3, 0.1, 16]} />
          <meshStandardMaterial color="#e0a96d" roughness={0.6} />
        </mesh>
      </group>
    );
  } else {
    // Sleek geometric diamond shape (healthy grains/mains)
    geometry = (
      <mesh castShadow>
        <octahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.1} metalness={0.9} />
      </mesh>
    );
  }

  return (
    <RigidBody
      type="fixed"
      position={position}
      sensor
      colliders="ball"
      onIntersectionEnter={handleCollision}
    >
      <group>
        <FloatingMesh foodId={food.id}>
          {geometry}
        </FloatingMesh>
      </group>
    </RigidBody>
  );
};

// Handles floating and rotation logic per mesh
const FloatingMesh = ({ children, foodId }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    // Smooth hover bobbing
    meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2.5 + foodId) * 0.15 + 0.6;
    // Rotation
    meshRef.current.rotation.y += 0.025;
  });

  return <group ref={meshRef}>{children}</group>;
};

// Layout Generator Spawner
export const Food = () => {
  const filteredFoods = useGameStore((state) => state.filteredFoods);
  const gameState = useGameStore((state) => state.gameState);

  // Generate food items layout along Z axis
  const foodList = useMemo(() => {
    if (!filteredFoods || filteredFoods.length === 0) return [];

    const items = [];
    const lanes = [-2.2, 0, 2.2]; // Align with lanes
    
    // Seeded random helper to make the track layout stable for a single run
    let seed = 12345;
    const seededRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Spawning rows every 25 units down the track from Z = -20 to Z = -700
    for (let z = -25; z > -700; z -= 25) {
      // Decide how many foods in this row (1 or 2)
      const numFoods = seededRandom() > 0.45 ? 2 : 1;
      
      // Shuffle lane indices using seeded random
      const laneIndices = [0, 1, 2];
      for (let i = laneIndices.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [laneIndices[i], laneIndices[j]] = [laneIndices[j], laneIndices[i]];
      }

      for (let k = 0; k < numFoods; k++) {
        const lane = lanes[laneIndices[k]];
        const foodIndex = Math.floor(seededRandom() * filteredFoods.length);
        const food = filteredFoods[foodIndex];

        items.push({
          id: `f-${z}-${lane}`,
          food: food,
          position: [lane, 0, z],
        });
      }
    }
    return items;
  }, [filteredFoods, gameState === 'START']); // Regenerate layout when starting/resetting

  return (
    <group>
      {foodList.map((item) => (
        <FoodItem key={item.id} food={item.food} position={item.position} />
      ))}
    </group>
  );
};
