# AI Pilot Context: Universal Game Construction Kit

We are using **React-Three-Fiber** with **@react-three/rapier** for physics and **Zustand** for state management. 

## Technical Standards
- **Physics**: Use `<RigidBody>` for all moving entities. 
    - `type="fixed"` for floors, walls, and static obstacles.
    - `type="dynamic"` for characters and movable objects.
    - `colliders="cuboid"` or `"capsule"` are preferred.
- **Inputs**: Always use the `useKeyboardControls` hook from `@react-three/drei`. The keys are mapped as: `forward`, `backward`, `left`, `right`, `jump`.
- **State**: Global game state (points, lives, dimension) is in `src/store/useGameStore.js`.
- **Modularity**: Keep components under 50 lines. Logic that can be reused should go into `src/hooks`.
- **Dimension Switching**: The camera and movement planes switch between 2D (X/Y) and 3D (X/Z). Check `useGameStore().dimension` to adjust logic.

## Common Snippets

### Spawning a Collectible (Coin)
```jsx
<RigidBody type="fixed" colliders="cuboid" sensor onIntersectionEnter={() => addPoints(10)}>
  <mesh>
    <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
    <meshStandardMaterial color="gold" />
  </mesh>
</RigidBody>
```

### Making the Player Jump
```jsx
if (jump && Math.abs(velocity.y) < 0.1) {
  rb.current.applyImpulse({ x: 0, y: 5, z: 0 }, true);
}
```

### Ending the Game
```jsx
const loseLife = useGameStore((state) => state.loseLife);
const setGameState = useGameStore((state) => state.setGameState);

if (lives <= 0) {
  setGameState('GAMEOVER');
}
```

## Asset Pipelines
- **3D**: Drop Mixamo GLB files into `/public/character.glb`. The `Player3D` component maps animations automatically.
- **2D**: Drop sprite sheets into `/public/sprite.png`. The `Player2D` component uses `SpriteAnimator`.
