import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Scene } from './Scene';
import { Visuals } from './components/Visuals';
import { ParallaxBackground } from './components/ParallaxBackground';
import { useGameStore } from './store/useGameStore';
import { Suspense, useEffect, useState } from 'react';
import './App.css';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
];

function App() {
  const {
    dimension,
    setDimension,
    gameState,
    setGameState,
    reset,
    weight,
    timeLeft,
    distance,
    lives,
    dietaryPreference,
    setDietaryPreference,
    tickTimer,
    lastCollectedFoodName,
    lastCollectedFoodWeight,
  } = useGameStore();

  const [showPopup, setShowPopup] = useState(false);

  // Active game clock
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, tickTimer]);

  // Flash popup on food collection
  useEffect(() => {
    if (lastCollectedFoodName) {
      setShowPopup(true);
      const t = setTimeout(() => setShowPopup(false), 1400);
      return () => clearTimeout(t);
    }
  }, [lastCollectedFoodName, lastCollectedFoodWeight]);

  // Determine weight bar visual style
  const getWeightColorClass = () => {
    if (weight < 55) return 'weight-slim';
    if (weight < 80) return 'weight-chubby';
    return 'weight-danger';
  };

  const getDietLabel = (pref) => {
    switch (pref) {
      case 'ALL': return 'Universal (All)';
      case 'VEG': return 'Vegetarian';
      case 'VEGAN': return 'Vegan';
      case 'JAIN': return 'Jain';
      default: return 'Universal';
    }
  };

  return (
    <KeyboardControls map={keyboardMap}>
      <div className="game-container">
        
        {/* START SCREEN */}
        {gameState === 'START' && (
          <div className="overlay-screen glass-panel">
            <h1 className="neon-title text-glow-cyan">NEON SLIM-RUNNER</h1>
            <p className="game-desc">
              Sprint down the glowing cyber-highway! Collect healthy items to stay slim, dodge high-calorie dishes, and survive 60 seconds to cross the finish line.
            </p>
            
            <div className="diet-selection-box">
              <h3>SELECT YOUR DIETARY ROUTE</h3>
              <div className="diet-buttons">
                {['ALL', 'VEG', 'VEGAN', 'JAIN'].map((pref) => (
                  <button
                    key={pref}
                    className={`diet-btn ${dietaryPreference === pref ? 'active' : ''}`}
                    onClick={() => setDietaryPreference(pref)}
                  >
                    {getDietLabel(pref)}
                  </button>
                ))}
              </div>
              <p className="diet-preview-note">
                {dietaryPreference === 'ALL' && '🍔 Spawns all street foods, dairy, vegetables, and meats.'}
                {dietaryPreference === 'VEG' && '🥦 Spawns milk desserts, paneer, grains, and fruits. No meat.'}
                {dietaryPreference === 'VEGAN' && '🍇 Spawns fruits, dal, salads, and wheat rois. No dairy or ghee.'}
                {dietaryPreference === 'JAIN' && '🍌 Spawns bananas, apples, plain dals, and specific root-free grains.'}
              </p>
            </div>

            <button className="primary-btn glow-purple" onClick={reset}>
              BEGIN DASH
            </button>

            <div className="controls-guide">
              <span>⌨️ Use <b>A / D</b> (or <b>Left / Right</b>) to Switch Lanes</span>
              <span>⚡ Press <b>SPACE</b> to Jump over Barriers</span>
            </div>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === 'GAMEOVER' && (
          <div className="overlay-screen glass-panel error-border">
            <h1 className="neon-title text-glow-red pulsing">RACE TERMINATED</h1>
            
            <div className="stats-box">
              {weight >= 100 ? (
                <p className="fail-message">⚠️ You became too heavy to move! (Weight reached 100)</p>
              ) : lives <= 0 ? (
                <p className="fail-message">💥 Cyber-drone destroyed! (Lost all shields/lives)</p>
              ) : (
                <p className="fail-message">⏱️ Time ran out before you crossed the line!</p>
              )}
              
              <div className="stat-row">
                <span>Final Weight:</span>
                <span className={`stat-val ${getWeightColorClass()}`}>{weight} / 100</span>
              </div>
              <div className="stat-row">
                <span>Shields Left:</span>
                <span className="stat-val">{lives}</span>
              </div>
              <div className="stat-row">
                <span>Distance Covered:</span>
                <span className="stat-val">{Math.floor(distance)}m / 720m</span>
              </div>
            </div>

            <button className="primary-btn glow-red" onClick={reset}>
              RETRY DASH
            </button>
          </div>
        )}

        {/* VICTORY / WON SCREEN */}
        {gameState === 'WON' && (
          <div className="overlay-screen glass-panel victory-border">
            <h1 className="neon-title text-glow-green bounce-anim">VICTORY achieved</h1>
            <p className="win-sub">You successfully completed the race while keeping your weight slim!</p>

            <div className="stats-box">
              <div className="stat-row">
                <span>Final Weight:</span>
                <span className="stat-val text-glow-green">{weight} (Ideal)</span>
              </div>
              <div className="stat-row">
                <span>Active Shields:</span>
                <span className="stat-val">{lives} / 3</span>
              </div>
              <div className="stat-row">
                <span>Time Remaining:</span>
                <span className="stat-val">{timeLeft}s</span>
              </div>
              <div className="stat-row">
                <span>Dietary Route:</span>
                <span className="stat-val">{getDietLabel(dietaryPreference)}</span>
              </div>
            </div>

            <button className="primary-btn glow-green" onClick={reset}>
              DASH AGAIN
            </button>
          </div>
        )}

        {/* ACTIVE HUD - PLAYING */}
        {gameState === 'PLAYING' && (
          <>
            {/* Top HUD Bar */}
            <div className="hud-header glass-panel">
              <div className="hud-metric">
                <span className="label">SHIELDS:</span>
                <span className="value lives-val">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={`heart ${i < lives ? 'filled' : 'empty'}`}>
                      {i < lives ? '💚' : '🖤'}
                    </span>
                  ))}
                </span>
              </div>
              
              <div className="hud-metric">
                <span className="label">TIME LEFT:</span>
                <span className="value timer-val text-glow-cyan">{timeLeft}s</span>
              </div>

              <div className="hud-metric">
                <span className="label">PROGRESS:</span>
                <span className="value text-glow-purple">{Math.floor(distance)}m / 720m</span>
              </div>

              <button className="dimension-toggle-btn" onClick={() => setDimension(dimension === '2D' ? '3D' : '2D')}>
                Retro {dimension === '2D' ? '3D' : '2D'}
              </button>
            </div>

            {/* Bottom Weight Dashboard */}
            <div className="hud-footer glass-panel">
              <div className="weight-container">
                <div className="weight-labels">
                  <span>SLIM (20)</span>
                  <span className={`active-weight ${getWeightColorClass()}`}>WEIGHT: {weight} / 100</span>
                  <span>HEAVY (100)</span>
                </div>
                <div className="weight-bar-bg">
                  <div 
                    className={`weight-bar-fill ${getWeightColorClass()}`}
                    style={{ width: `${Math.max(0, Math.min(100, (weight - 20) * 1.25))}%` }}
                  />
                </div>
                {weight >= 85 && <div className="heavy-alert pulsing-fast">⚠️ DANGER: OVERWEIGHT LIMIT IMMINENT!</div>}
              </div>
            </div>

            {/* Floating Food Collection Popup Popup */}
            {showPopup && (
              <div className={`collection-popup ${lastCollectedFoodWeight < 0 ? 'popup-slim' : 'popup-fat'}`}>
                {lastCollectedFoodWeight < 0 ? (
                  <span>🥗 Ate {lastCollectedFoodName}! Slimmer (-10 Weight)</span>
                ) : (
                  <span>🍰 Ate {lastCollectedFoodName}! Fatter (+15 Weight)</span>
                )}
              </div>
            )}
          </>
        )}

        {/* 3D Canvas */}
        <Canvas shadows>
          <Scene>
            <Visuals />
            {dimension === '2D' && (
               <Suspense fallback={null}>
                  <ParallaxBackground speed={0.25} />
               </Suspense>
            )}
          </Scene>
        </Canvas>

      </div>
    </KeyboardControls>
  );
}

export default App;

