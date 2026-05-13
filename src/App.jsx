import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Scene } from './Scene';
import { Visuals } from './components/Visuals';
import { ParallaxBackground } from './components/ParallaxBackground';
import { useGameStore } from './store/useGameStore';
import { Suspense } from 'react';
import './App.css';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
];

function App() {
  const { dimension, setDimension, points, lives } = useGameStore();

  return (
    <KeyboardControls map={keyboardMap}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        {/* Simple HUD */}
        <div className="hud">
          <div>Points: {points}</div>
          <div>Lives: {lives}</div>
          <button onClick={() => setDimension(dimension === '2D' ? '3D' : '2D')}>
            Switch to {dimension === '2D' ? '3D' : '2D'}
          </button>
        </div>

        <Canvas shadows>
          <Scene>
            <Visuals />
            {dimension === '2D' && (
               <Suspense fallback={null}>
                  <ParallaxBackground speed={0.2} />
               </Suspense>
            )}
          </Scene>
        </Canvas>
      </div>
    </KeyboardControls>
  );
}

export default App;
