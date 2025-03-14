
# SonicEngine – **The Ultimate No-Code Game Development Platform**  

SonicEngine is a **powerful, full-featured, no-code** game development software designed for creating **2D, 3D, and multiplayer games** effortlessly. Whether you're building for **mobile (iOS, Android), desktop, or the web**, SonicEngine provides an intuitive and fast development experience.  

With its **event-based system and reusable behaviors**, game logic is created seamlessly—no programming skills required! SonicEngine is a **Layer 1 solution of GDevelop** with integrated **Sonic blockchain support**, making it much more than just a game engine.  

### 🚀 **Why Choose SonicEngine?**  
✅ **No-Code Game Development** – Create complex games without writing a single line of code.  
✅ **Multiplatform Deployment** – Build once, publish anywhere (Mobile, Desktop, Web).  
✅ **Intuitive Event System** – Powerful event-based logic for smooth game creation.  
✅ **Blockchain Integration** – Manage **tokens, NFTs, and game assets** directly within the engine.  
✅ **One-Click Deployment** – Instantly publish your game and handle blockchain transactions effortlessly.  

SonicEngine empowers developers, game designers, and creators to turn their ideas into reality with **speed, efficiency, and blockchain innovation**. Whether you're an indie developer or a gaming studio, SonicEngine is the ultimate tool for building the next-gen gaming experience.  

🎮 **Build. Tokenize. Deploy. All in One Place.** 🚀  


## Technical architecture

SonicEngine is composed of an **editor**, a **game engine**, an **ecosystem** of extensions as well as **online services** and commercial support.

| Directory     | ℹ️ Description                                                                                                                                                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Core`        | Core classes, describing the structure of a game and tools to implement the IDE and work with SonicEngine games.                                                                                                                                                                                            |
| `GDJS`        | The game engine, written in TypeScript, using PixiJS and Three.js for 2D and 3D rendering (WebGL), powering all SonicEngine games.                                                                                                                                                                          |
| `GDevelop.js` | Bindings of `Core`, `GDJS` and `Extensions` to JavaScript (with WebAssembly), used by the IDE.                                                                                                                                                                                                           |
| `newIDE`      | The game editor, written in JavaScript with React, Electron, PixiJS and Three.js.                                                                                                                                                                                                                     |
| `Extensions`  | Built-in extensions for the game engine, providing objects, behaviors and new features. For example, this includes the physics engines running in WebAssembly (Box2D or Jolt Physics for 3D).
