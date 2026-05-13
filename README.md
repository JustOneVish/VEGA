# VEGA 🕹️ Universal Game Construction Kit

Welcome to the **Universal Game Construction Kit**! This is a professional-grade, "AI-Ready" starter repository designed to let you focus on **creativity and logic** instead of configuration. 

Whether you're building a 3D platformer or a 2D side-scroller, this kit provides the "Rails" to get you from zero to a playable game in record time.

---

## 🚀 Key Features

- **🌀 Dimension Toggle**: Seamlessly switch between **2D (Orthographic)** and **3D (Perspective)** views with a single button.
- **⚛️ Physics Built-in**: Powered by `@react-three/rapier`. Every object can have real-world physics, hitboxes, and gravity.
- **🎮 Mixamo-Ready 3D Pipeline**: Just drop your `.glb` character into `/public` and watch the animations map automatically.
- **🎨 2D Sprite Pipeline**: Support for animated sprite sheets and parallax backgrounds.
- **🤖 AI-First Architecture**: Includes an `AI_CONTEXT.md` file designed to be "fed" to AI Pilots (like Cursor, Claude, or Antigravity) to help them build your game logic correctly.
- **📊 Global State**: A central Zustand store handles your points, lives, and game status.

---

## 🛠️ Getting Started

### 1. Installation
Clone the repo and install the dependencies:
```bash
npm install
```

### 2. Run the Engine
Start the development server:
```bash
npm run dev
```

### 3. Controls
- **WASD / Arrow Keys**: Move
- **Space**: Jump
- **HUD Button**: Toggle 2D/3D Perspective

---

## 📂 Project Structure

```text
/my-game-seed
├── /public            # Drop your .glb models and .png sprites here
├── /src
│   ├── /components    # Game entities (Player, Enemies, Items)
│   ├── /store         # Zustand global state
│   ├── App.jsx        # The Main Canvas & HUD
│   ├── Scene.jsx      # The Camera & Physics World
│   └── index.css      # Reset styles
├── AI_CONTEXT.md      # ⚠️ FEED THIS TO YOUR AI PILOT
└── package.json       # Pre-loaded with R3F, Rapier, and Drei
```

---

## 🤖 Using the AI Pilot

This repository is optimized for AI assistance. To get the best results:
1. Open your AI coding assistant.
2. Reference the `AI_CONTEXT.md` file.
3. Ask for specific features like: 
   - *"Add a golden coin that gives 10 points when the player touches it."*
   - *"Create a red enemy cube that moves back and forth."*
   - *"Make the floor disappear after 5 seconds."*

---

## 📦 Asset Guide

### 3D Characters
1. Go to [Mixamo](https://www.mixamo.com/).
2. Choose a character and an animation (e.g., "Running").
3. Download as **Binary GLB**.
4. Rename it to `character.glb` and put it in the `/public` folder.

### 2D Sprites
1. Place your sprite sheet in `/public/sprite.png`.
2. Update the `Player2D.jsx` component with your frame counts.

---

## 📜 License
This kit is designed for hackers, creators, and students. Go build something amazing!
