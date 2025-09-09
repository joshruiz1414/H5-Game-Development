# Space Shooter H5 Game

A modern HTML5 space shooter game built with JavaScript, smooth gameplay, particle effects, and responsive design.

## Features

### Core Gameplay
- **Controls**: WASD/Arrow keys for movement, Spacebar/Mouse for shooting
- **Multiple Enemy Types**: Basic, Fast, Tank, and Boss enemies with unique movements
- **Power-ups**: Health, Power, Shield, and Rapid Fire upgrades
- **Progressive Difficulty**: Increasing challenge with waves and levels
- **Particle Effects**: Explosions, engine trails, and visual feedback

### Technical Features
- **Audio System**: Sound effects for collisions
- **Collision Detection**: AABB collision system

### Visual Design
- **UI**: sci-fi inspired interface
- **Animated Background**: Scrolling star field effect
- **Visual Effects**: Glowing bullets, particle trails
- **Color Scheme**: Neon green/cyan theme with dark space background

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Click "START GAME" to begin playing

### Controls
- **Movement**: WASD or Arrow Keys
- **Shoot**: Spacebar or Mouse Click, Use mouse to aim
- **Pause**: P key

## Game Mechanics

### Player Ship
- **Health**: 3 lives with invulnerability after taking damage
- **Weapon System**: Single shot with variable damage (1x base, 3x with power-up)
- **Movement**: Horizontal Movement Only

### Enemy Types
- **Basic (Red)**: Standard enemy, 1 health, straight movement
- **Fast (Orange)**: Quick enemy, 1 health, zigzag movement
- **Tank (Blue)**: Heavy enemy, 3 health, slower but tougher
- **Swarm (Green)**: Small enemy, 1 health, circular movement
- **Sniper (Yellow)**: Accurate enemy, 2 health, straight movement, shoots 1 bullet directly at player every 1.5 seconds
- **Kamikaze (Red)**: Suicide enemy, 1 health, moves toward player, doesn't shoot
- **Boss (Pink)**: Large enemy, 6 health, figure-8 movement, shoots 3 bullets
- **Mega Boss (Magenta)**: Massive enemy, 9 health, complex movement, shoots 5 bullets

### Power-ups
- **Health**: Restore 1 health point
- **Power**: Increase bullet damage to 3x for 10 seconds
- **Shield**: Temporary invulnerability (10 seconds)
- **Rapid Fire**: Increased fire rate (10 seconds)
- **Extra Life**: Gain 1 additional life (max 5)

**Drop Rates**: Power-ups have reduced drop rates for balanced gameplay. Extra life power-ups are rare and also spawn automatically at certain levels.

### Scoring System
- Basic Enemy: 10 points
- Fast Enemy: 20 points
- Swarm Enemy: 15 points
- Sniper Enemy: 30 points
- Kamikaze Enemy: 25 points
- Tank Enemy: 50 points
- Boss Enemy: 200 points
- Mega Boss Enemy: 500 points

## Development

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

## Future Enhancements

### Planned Features
- **Multiplayer Support**: Real-time multiplayer gameplay
- **Achievement System**: Unlockable achievements and rewards
- **Leaderboard**: local high scores
- **Custom Skins**: Player and enemy ship customization
- **Level Editor**: Create custom enemy formations
- **Save System**: Progress persistence and settings


**Enjoy playing Space Shooter!** 