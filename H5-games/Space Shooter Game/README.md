# Space Shooter H5 Game

A modern HTML5 space shooter game built with JavaScript, smooth gameplay, particle effects, and responsive design.

## 🎮 Features

### Core Gameplay
- **Smooth Controls**: WASD/Arrow keys for movement, Spacebar/Mouse for shooting
- **Multiple Enemy Types**: Basic, Fast, Tank, and Boss enemies with unique behaviors
- **Power-ups**: Health, Power, Shield, and Rapid Fire upgrades
- **Progressive Difficulty**: Increasing challenge with waves and levels
- **Particle Effects**: Explosions, engine trails, and visual feedback

### Technical Features
- **Audio System**: Procedurally generated sound effects
- **Collision Detection**: Precise AABB collision system
- **Performance Optimized**: 60 FPS gameplay with efficient rendering

### Visual Design
- **Modern UI**: sci-fi inspired interface
- **Animated Background**: Scrolling star field effect
- **Visual Effects**: Glowing bullets, particle trails, screen flash
- **Color Scheme**: Neon green/cyan theme with dark space background

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Click "START GAME" to begin playing

### Controls
- **Movement**: WASD or Arrow Keys
- **Shoot**: Spacebar or Mouse Click
- **Pause**: P key

## 🎯 Game Mechanics

### Player Ship
- **Health**: 3 lives with invulnerability after taking damage
- **Weapon System**: Single shot with variable damage (1x base, 3x with power-up)
- **Movement**: Horizontal Movement Only

### Enemy Types
- **Basic (Red)**: Standard enemy, 1 health, straight movement, shoots every 3 seconds
- **Fast (Orange)**: Quick enemy, 1 health, zigzag movement, shoots every 2 seconds
- **Tank (Blue)**: Heavy enemy, 3 health, slower but tougher, shoots every 1.5 seconds
- **Swarm (Green)**: Small enemy, 1 health, circular movement, shoots 2 bullets every 4 seconds
- **Sniper (Yellow)**: Accurate enemy, 2 health, straight movement, shoots 1 bullet directly at player every 1.5 seconds
- **Kamikaze (Red)**: Suicide enemy, 1 health, moves toward player, doesn't shoot
- **Boss (Pink)**: Large enemy, 8 health, figure-8 movement, shoots 3 bullets every 0.8 seconds
- **Mega Boss (Magenta)**: Massive enemy, 12 health, complex movement, shoots 5 bullets every 0.6 seconds

### Power-ups
- **Health (+)**: Restore 1 health point
- **Power (P)**: Increase bullet damage to 3x for 10 seconds
- **Shield (S)**: Temporary invulnerability (10 seconds)
- **Rapid Fire (R)**: Increased fire rate (10 seconds)
- **Extra Life (💖)**: Gain 1 additional life (max 5)

**Drop Rates**: Power-ups have reduced drop rates for balanced gameplay. Extra life power-ups are particularly rare and also spawn automatically at certain levels.

### Scoring System
- Basic Enemy: 10 points
- Fast Enemy: 20 points
- Swarm Enemy: 15 points
- Sniper Enemy: 30 points
- Kamikaze Enemy: 25 points
- Tank Enemy: 50 points
- Boss Enemy: 200 points
- Mega Boss Enemy: 500 points

## 🛠️ Development

### Key Classes

#### GameManager
- Central game controller
- Manages game loop, object lifecycle, and state
- Handles input, rendering, and collision detection

#### Player
- Player ship with movement, shooting, and health
- Power level system with different weapon configurations
- Engine particle effects and visual feedback

#### Enemy
- Multiple enemy types with unique behaviors
- AI movement patterns and shooting mechanics
- Health bars for larger enemies

#### CollisionManager
- Efficient collision detection system
- Handles bullet-enemy, player-enemy, and power-up collisions
- Creates particle effects for impacts

### Adding New Features

#### New Enemy Type
1. Add enemy type to `Enemy.js` setupEnemyType()
2. Update `EnemySpawner.js` chooseEnemyType()
3. Add visual design in drawEnemyShip()

#### New Power-up
1. Create new power-up type in `PowerUp.js`
2. Add effect logic in applyToPlayer()
3. Update spawn logic in EnemySpawner

#### New Visual Effect
1. Create particle system in `Particle.js`
2. Add rendering in `Renderer.js`
3. Integrate with collision or game events

## 🎨 Customization

### Visual Customization
- Modify colors in CSS variables
- Update particle effects and animations
- Change enemy and player ship designs

### Gameplay Customization
- Adjust difficulty in `EnemySpawner.js`
- Modify player stats in `Player.js`
- Change scoring system in `GameManager.js`

### Audio Customization
- Add new sound effects in `AudioManager.js`
- Modify existing sound generation functions
- Implement background music system

## 🐛 Debugging

## 🔮 Future Enhancements

### Planned Features
- **Multiplayer Support**: Real-time multiplayer gameplay
- **Achievement System**: Unlockable achievements and rewards
- **Leaderboard**: local high scores
- **Custom Skins**: Player and enemy ship customization
- **Level Editor**: Create custom enemy formations
- **Save System**: Progress persistence and settings

### Technical Improvements
- **WebGL Rendering**: Hardware-accelerated graphics
- **Web Workers**: Background processing for complex AI
- **Service Workers**: Offline support and caching
- **WebAssembly**: Performance-critical code optimization

**Enjoy playing Space Shooter! 🚀** 