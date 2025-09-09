class GameManager {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.gameState = new GameState();
    this.inputManager = new InputManager();
    this.canvasOptimizer = new CanvasOptimizer(this.canvas);
    this.renderer = new Renderer(this.ctx);
    this.collisionManager = new CollisionManager();
    this.enemySpawner = new EnemySpawner();
    this.performanceMonitor = new PerformanceMonitor(this);
    const starCount = this.performanceMonitor.getCurrentSettings().starCount;
    this.renderer = new Renderer(this.ctx, starCount);
    this.spatialHash = new SpatialHash(100);

    // Object pools for better performance
    this.bulletPool = new ObjectPool(
      () => new Bullet(0, 0, 0, 0, "player"),
      (bullet) => {
        bullet.active = false;
        bullet.position.set(0, 0);
        bullet.velocity.set(0, 0);
      },
      50
    );

    this.particlePool = new ObjectPool(
      () => new Particle(0, 0, 0, 0, "#ffffff", 1.0),
      (particle) => {
        particle.active = false;
        particle.position.set(0, 0);
        particle.velocity.set(0, 0);
        particle.life = 1.0;
        particle.maxLife = 1.0;
      },
      100
    );

    // Game objects
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.powerUps = [];

    // Active power-up tracking
    this.activePowerUps = {
      shield: { active: false, timeLeft: 0, timeoutId: null },
      rapidFire: {
        active: false,
        timeLeft: 0,
        timeoutId: null,
        originalShootRate: 0.3,
      },
      powerUp: { active: false, timeLeft: 0, timeoutId: null },
    };

    // Game state
    this.score = 0;
    this.level = 1;
    this.gameTime = 0;
    this.lastTime = 0;
    this.isRunning = false;

    // Initialize audio
    window.audioManager = new AudioManager();

    this.bindEvents();
    this.init();
  }

  static getInstance() {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  init() {
    // Set canvas size
    this.resizeCanvas();

    // Start game loop
    this.gameLoop();
  }

  bindEvents() {
    // Button events
    document.getElementById("start-btn").addEventListener("click", () => {
      this.gameState.setState("playing");
    });

    document.getElementById("resume-btn").addEventListener("click", () => {
      this.gameState.setState("playing");
    });

    document.getElementById("restart-btn").addEventListener("click", () => {
      this.resetGame();
      this.gameState.setState("playing");
    });

    document.getElementById("play-again-btn").addEventListener("click", () => {
      this.resetGame();
      this.gameState.setState("playing");
    });

    // Home button events
    document.getElementById("menu-btn-pause").addEventListener("click", () => {
      this.resetGame();
      this.gameState.setState("menu");
    });

    document
      .getElementById("menu-btn-gameover")
      .addEventListener("click", () => {
        this.resetGame();
        this.gameState.setState("menu");
      });

    // How to Play screen events
    document.getElementById("how-to-play-btn").addEventListener("click", () => {
      this.showHowToPlay();
    });

    document
      .getElementById("back-to-menu-btn")
      .addEventListener("click", () => {
        this.showMainMenu();
      });

    // Window resize
    window.addEventListener("resize", () => {
      this.resizeCanvas();
    });
  }

  resizeCanvas() {
    const container = document.getElementById("game-container");
    const maxWidth = Math.min(1920, window.innerWidth - 40);
    const maxHeight = Math.min(1080, window.innerHeight - 40);

    this.canvasOptimizer.resize(maxWidth, maxHeight);
  }

  startGame() {
    this.isRunning = true;
    this.gameTime = 0;
    this.lastTime = performance.now();

    // Start background music when game starts
    if (window.audioManager) {
      window.audioManager.resumeAudioContext();
    }

    // Create player at bottom center
    this.player = new Player(this.canvas.width / 2, this.canvas.height - 60);

    // Clear all objects
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.powerUps = [];

    // Reset game state
    this.score = 0;
    this.level = 1;

    // Reset enemy spawner
    this.enemySpawner.spawnTimer = 0;
    this.enemySpawner.enemiesInWave = 0;
    this.enemySpawner.waveNumber = 1;
    this.enemySpawner.maxEnemiesInWave = 5;
    this.enemySpawner.difficulty = 1;

    // Start the first wave properly
    this.enemySpawner.startNewWave();

    // Spawn initial enemies and count them toward the wave
    this.spawnInitialEnemies();
    this.enemySpawner.enemiesInWave = 3; // Count the 3 initial enemies

    // Clear input
    this.inputManager.clearInputs();

    // Reset all active power-ups
    this.resetActivePowerUps();
  }

  resetGame() {
    this.isRunning = false;
    this.gameState.setState("menu");
  }

  resetActivePowerUps() {
    // Clear all active power-up timeouts
    if (this.activePowerUps.shield.timeoutId) {
      clearTimeout(this.activePowerUps.shield.timeoutId);
      this.activePowerUps.shield.timeoutId = null;
    }
    if (this.activePowerUps.rapidFire.timeoutId) {
      clearTimeout(this.activePowerUps.rapidFire.timeoutId);
      this.activePowerUps.rapidFire.timeoutId = null;
    }
    if (this.activePowerUps.powerUp.timeoutId) {
      clearTimeout(this.activePowerUps.powerUp.timeoutId);
      this.activePowerUps.powerUp.timeoutId = null;
    }

    // Reset all power-up states
    this.activePowerUps.shield.active = false;
    this.activePowerUps.shield.timeLeft = 0;
    this.activePowerUps.rapidFire.active = false;
    this.activePowerUps.rapidFire.timeLeft = 0;
    this.activePowerUps.powerUp.active = false;
    this.activePowerUps.powerUp.timeLeft = 0;

    // Reset player stats to original values if player exists
    if (this.player) {
      this.player.shootRate = this.activePowerUps.rapidFire.originalShootRate;
      this.player.invulnerable = false;
      this.player.invulnerableTime = 0;
      this.player.bulletDamage = 1;
    }
  }

  gameLoop(currentTime = 0) {
    // Safari-specific optimizations
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Update performance monitor
    this.performanceMonitor.update(currentTime);

    // Calculate delta time
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Limit delta time to prevent large jumps (especially important for Safari)
    const maxDeltaTime = isSafari ? 0.05 : 0.033; // 50ms for Safari, 33ms for others
    const clampedDeltaTime = Math.min(deltaTime, maxDeltaTime);

    // Update game
    this.update(clampedDeltaTime);

    // Render game
    this.render();

    // Continue loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(deltaTime) {
    if (!this.isRunning || !this.gameState.isPlaying()) {
      return;
    }

    this.gameTime += deltaTime;

    // Update spatial hash
    this.updateSpatialHash();

    // Update player
    if (this.player && this.player.active) {
      this.player.handleInput(this.inputManager, deltaTime);
      this.player.update(deltaTime);
    } else if (this.player && !this.player.active) {
      // Player destroyed
      console.log("Player is inactive, setting game over state");
      if (window.audioManager) {
        window.audioManager.playSound("gameOver");
      }
      this.gameState.setState("gameOver");
      return;
    } else if (!this.player) {
      console.log("Player object is null/undefined!");
    }

    // Update enemies
    this.updateEnemies(deltaTime);

    // Update bullets
    this.updateBullets(deltaTime);

    // Update particles
    this.updateParticles(deltaTime);

    // Update power-ups
    this.updatePowerUps(deltaTime);

    // Update enemy spawner
    this.enemySpawner.update(deltaTime, this);

    // Check collisions using spatial hash
    this.collisionManager.checkCollisionsOptimized(this);

    // Clean up destroyed objects
    this.cleanupObjects();

    // Update UI
    this.gameState.updateUI();

    // Update debug panel
    this.updateDebugPanel();

    // Check for pause
    if (this.inputManager.isPausePressed()) {
      this.gameState.setState("paused");
    }
  }

  updateEnemies(deltaTime) {
    for (const enemy of this.enemies) {
      if (enemy.active) {
        enemy.update(deltaTime);

        // Enemy shooting based on individual shootRate
        if (enemy.shootRate > 0) {
          // Only shoot if enemy has a shootRate > 0
          enemy.shoot();
        }
      }
    }
  }

  updateBullets(deltaTime) {
    for (const bullet of this.bullets) {
      if (bullet.active) {
        bullet.update(deltaTime);
      }
    }
  }

  updateParticles(deltaTime) {
    for (const particle of this.particles) {
      if (particle.active) {
        particle.update(deltaTime);
      }
    }
  }

  updatePowerUps(deltaTime) {
    for (const powerUp of this.powerUps) {
      if (powerUp.active) {
        powerUp.update(deltaTime);
      }
    }
  }

  cleanupObjects() {
    // Remove inactive enemies and return to pool
    this.enemies = this.enemies.filter((enemy) => {
      if (!enemy.active) {
        this.spatialHash.removeObject(enemy);
        return false;
      }
      return true;
    });

    // Remove inactive bullets and return to pool
    this.bullets = this.bullets.filter((bullet) => {
      if (!bullet.active) {
        this.bulletPool.release(bullet);
        return false;
      }
      return true;
    });

    // Remove inactive particles and return to pool
    this.particles = this.particles.filter((particle) => {
      if (!particle.active) {
        this.particlePool.release(particle);
        return false;
      }
      return true;
    });

    // Remove inactive power-ups
    this.powerUps = this.powerUps.filter((powerUp) => {
      if (!powerUp.active) {
        this.spatialHash.removeObject(powerUp);
        return false;
      }
      return true;
    });
  }

  render() {
    // Use canvas optimizer for better performance
    this.canvasOptimizer.clear();

    // Update and render background stars
    this.renderer.renderBackground(this.gameTime);
    // Also draw offscreen canvas if enabled (optional)
    // this.canvasOptimizer.renderStarsToOffscreen(this.renderer.stars, this.gameTime);
    // this.canvasOptimizer.drawStarCanvas();

    // Render game objects if game is running (playing or paused)
    if (this.isRunning) {
      this.renderer.renderGameObjects(this);
    }

    // Pre-render UI elements
    this.canvasOptimizer.prerenderUI(this);
    this.canvasOptimizer.drawUICanvas();

    // Flush any remaining batch operations
    this.canvasOptimizer.flushBatch();
  }

  // Object management methods
  addEnemy(enemy) {
    this.enemies.push(enemy);
    this.spatialHash.insert(enemy);
  }

  addBullet(bullet) {
    this.bullets.push(bullet);
  }

  addParticle(particle) {
    // Only add if we haven't reached the particle limit
    if (this.performanceMonitor.canSpawnObject("particle")) {
      this.particles.push(particle);
    }
  }

  addPowerUp(powerUp) {
    this.powerUps.push(powerUp);
    this.spatialHash.insert(powerUp);
  }

  // Spatial hash management
  updateSpatialHash() {
    // Update spatial hash for moving objects
    for (const enemy of this.enemies) {
      if (enemy.active) {
        this.spatialHash.updateObject(
          enemy,
          enemy.lastX || enemy.position.x,
          enemy.lastY || enemy.position.y
        );
        enemy.lastX = enemy.position.x;
        enemy.lastY = enemy.position.y;
      }
    }

    // Update spatial hash for moving power-ups
    for (const powerUp of this.powerUps) {
      if (powerUp.active) {
        this.spatialHash.updateObject(
          powerUp,
          powerUp.lastX || powerUp.position.x,
          powerUp.lastY || powerUp.position.y
        );
        powerUp.lastX = powerUp.position.x;
        powerUp.lastY = powerUp.position.y;
      }
    }
  }

  addScore(points) {
    this.score += points;
    console.log(`Score: ${this.score} (+${points})`);

    // Progressive level system - each level requires more points
    let totalPointsNeeded = 0;
    let newLevel = 1;

    // Calculate total points needed for each level
    for (let level = 1; level <= 100; level++) {
      const pointsForThisLevel = Math.floor(50 * Math.pow(1.5, level - 1)); // Exponential scaling
      totalPointsNeeded += pointsForThisLevel;

      if (this.score >= totalPointsNeeded) {
        newLevel = level + 1;
      } else {
        break;
      }
    }

    const pointsForNextLevel = Math.floor(50 * Math.pow(1.5, newLevel - 1));
    const pointsInCurrentLevel =
      this.score - (totalPointsNeeded - pointsForNextLevel);

    console.log(
      `Current level: ${this.level}, New level: ${newLevel}, Score: ${this.score}, Points needed for next level: ${pointsForNextLevel}, Progress: ${pointsInCurrentLevel}/${pointsForNextLevel}`
    );

    if (newLevel > this.level) {
      this.level = newLevel;
      console.log(`Level up! New level: ${this.level}`);
      // Increase difficulty
      this.enemySpawner.increaseDifficulty();

      // Spawn extra life power-up at level 15, then every 8 levels after that (reduced frequency)
      if (newLevel === 15 || (newLevel > 15 && (newLevel - 15) % 5 === 0)) {
        this.spawnExtraLifePowerUp();
      }
    }
  }

  spawnExtraLifePowerUp() {
    if (this.player && this.player.active) {
      // Spawn extra life power-up at top center of screen
      const x = this.canvas.width / 2;
      const y = -30; // Start off-screen and scroll down

      const extraLifePowerUp = new PowerUp(x, y, "extraLife");
      this.addPowerUp(extraLifePowerUp);

      // Show notification that extra life is available
      this.showPowerUpMessage("EXTRA LIFE AVAILABLE!", "#ff0000");
    }
  }

  createExtraLifeEffect() {
    // Create particles around the player
    if (this.player) {
      for (let i = 0; i < 20; i++) {
        const particle = new Particle(
          this.player.position.x + (Math.random() - 0.5) * 100,
          this.player.position.y + (Math.random() - 0.5) * 100,
          "#00ff00", // Green particles
          2.0 // Longer life
        );
        this.addParticle(particle);
      }
    }
  }

  showExtraLifeMessage() {
    const message = `EXTRA LIFE! Level ${this.level}`;
    this.showDebugMessage(message);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      const debugMessage = document.getElementById("debug-message");
      if (debugMessage) {
        debugMessage.style.display = "none";
      }
    }, 3000);
  }

  getPlayer() {
    return this.player;
  }

  getEnemies() {
    return this.enemies;
  }

  getBullets() {
    return this.bullets;
  }

  getParticles() {
    return this.particles;
  }

  getPowerUps() {
    return this.powerUps;
  }

  spawnInitialEnemies() {
    // Spawn 3 initial enemies at visible positions
    for (let i = 0; i < 3; i++) {
      const x = (this.canvas.width / 4) * (i + 1);
      const y = 50 + i * 30; // Start them visible on screen
      const enemy = new Enemy(x, y, "basic");
      this.addEnemy(enemy);
    }
  }

  updateDebugPanel() {
    const enemyCountElement = document.getElementById("enemy-count");
    const fpsDisplayElement = document.getElementById("fps-display");
    const qualityLevelElement = document.getElementById("quality-level");
    const particleCountElement = document.getElementById("particle-count");
    const bulletCountElement = document.getElementById("bullet-count");
    const levelElement = document.getElementById("level-value");

    if (enemyCountElement) {
      enemyCountElement.textContent = this.enemies.length;
    }
    if (fpsDisplayElement) {
      fpsDisplayElement.textContent = this.performanceMonitor.getFps();
    }
    if (qualityLevelElement) {
      const qualityNames = ["Low", "Medium", "High"];
      qualityLevelElement.textContent =
        qualityNames[this.performanceMonitor.getQualityLevel()];
    }
    if (particleCountElement) {
      particleCountElement.textContent = this.particles.length;
    }
    if (bulletCountElement) {
      bulletCountElement.textContent = this.bullets.length;
    }
    if (levelElement) {
      levelElement.textContent = this.level;
    }

    // Update power-up status
    this.updatePowerUpStatus();
  }

  updatePowerUpStatus() {
    if (this.player && this.player.active) {
      // Update active power-up timers
      this.updateActivePowerUpTimers();

      // Build status string for active power-ups
      let activePowerUps = [];

      if (
        this.activePowerUps.shield.active &&
        this.activePowerUps.shield.timeLeft > 0
      ) {
        activePowerUps.push(
          `🛡️ Shield: ${this.activePowerUps.shield.timeLeft.toFixed(1)}s`
        );
      }

      if (
        this.activePowerUps.rapidFire.active &&
        this.activePowerUps.rapidFire.timeLeft > 0
      ) {
        activePowerUps.push(
          `🔥 Rapid Fire: ${this.activePowerUps.rapidFire.timeLeft.toFixed(1)}s`
        );
      }

      if (
        this.activePowerUps.powerUp.active &&
        this.activePowerUps.powerUp.timeLeft > 0
      ) {
        activePowerUps.push(
          `⚡ ${
            this.player.bulletDamage
          }x Damage: ${this.activePowerUps.powerUp.timeLeft.toFixed(1)}s`
        );
      }

      // Update the active power-ups display
      const activePowerUpsElement = document.getElementById("active-power-ups");
      if (activePowerUpsElement) {
        if (activePowerUps.length > 0) {
          activePowerUpsElement.innerHTML = activePowerUps.join("<br>");
        } else {
          activePowerUpsElement.textContent = "None";
        }
      }
    }
  }

  updateActivePowerUpTimers() {
    // Don't update timers when game is paused
    if (this.gameState.isPaused()) {
      return;
    }

    // Update shield timer
    if (this.activePowerUps.shield.active) {
      this.activePowerUps.shield.timeLeft -= 0.016; // Approximate frame time
      if (this.activePowerUps.shield.timeLeft <= 0) {
        this.activePowerUps.shield.active = false;
        this.activePowerUps.shield.timeLeft = 0;
      }
    }

    // Update rapid fire timer
    if (this.activePowerUps.rapidFire.active) {
      this.activePowerUps.rapidFire.timeLeft -= 0.016;
      if (this.activePowerUps.rapidFire.timeLeft <= 0) {
        this.activePowerUps.rapidFire.active = false;
        this.activePowerUps.rapidFire.timeLeft = 0;
      }
    }

    // Update power-up timer
    if (this.activePowerUps.powerUp.active) {
      this.activePowerUps.powerUp.timeLeft -= 0.016;
      if (this.activePowerUps.powerUp.timeLeft <= 0) {
        this.activePowerUps.powerUp.active = false;
        this.activePowerUps.powerUp.timeLeft = 0;
      }
    }
  }

  showDebugMessage(message) {
    const debugText = document.getElementById("debug-text");
    const debugMessage = document.getElementById("debug-message");

    if (debugText && debugMessage) {
      debugText.textContent = message;
      debugMessage.style.display = "block";
    }
  }

  showPowerUpMessage(message, color = "#ffffff") {
    // Create or get power-up message element
    let powerUpMessage = document.getElementById("power-up-message");
    if (!powerUpMessage) {
      powerUpMessage = document.createElement("div");
      powerUpMessage.id = "power-up-message";
      powerUpMessage.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: ${color};
        padding: 15px 25px;
        border: 2px solid ${color};
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        opacity: 1;
        transition: opacity 0.5s ease-out;
      `;
      document.getElementById("game-container").appendChild(powerUpMessage);
    }

    // Show message
    powerUpMessage.textContent = message;
    powerUpMessage.style.color = color;
    powerUpMessage.style.borderColor = color;
    powerUpMessage.style.opacity = "1";
    powerUpMessage.style.display = "block";

    // Fade out after 2 seconds
    setTimeout(() => {
      powerUpMessage.style.opacity = "0";
      setTimeout(() => {
        powerUpMessage.style.display = "none";
      }, 500);
    }, 2000);
  }

  showHowToPlay() {
    // Hide start screen and show how to play screen
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("how-to-play-screen").classList.remove("hidden");
  }

  showMainMenu() {
    // Hide how to play screen and show start screen
    document.getElementById("how-to-play-screen").classList.add("hidden");
    document.getElementById("start-screen").classList.remove("hidden");
  }
}
