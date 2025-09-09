class EnemySpawner {
  constructor() {
    this.spawnTimer = 0;
    this.spawnRate = 1.5; // seconds between spawns (faster initial spawn)
    this.maxEnemies = 10;
    this.difficulty = 1;
    this.waveNumber = 1;
    this.enemiesInWave = 0;
    this.maxEnemiesInWave = 5;
    this.waveTimer = 0;
    this.waveDelay = 3.0; // seconds between waves
    this.bossSpawnTimer = 0;
    this.bossSpawnRate = 30.0; // seconds between boss spawns
  }

  update(deltaTime, gameManager) {
    this.spawnTimer += deltaTime;
    this.waveTimer += deltaTime;
    this.bossSpawnTimer += deltaTime;

    // Check performance limits before spawning
    const maxEnemies =
      gameManager.performanceMonitor.getCurrentSettings().maxEnemies;
    const currentEnemies = gameManager.getEnemies().length;

    // Spawn regular enemies continuously
    if (
      this.spawnTimer >= this.spawnRate &&
      currentEnemies < maxEnemies &&
      gameManager.performanceMonitor.canSpawnObject("enemy")
    ) {
      this.spawnEnemy(gameManager);
      this.spawnTimer = 0;
      this.enemiesInWave++;

      // Start new wave if we've spawned enough enemies
      if (this.enemiesInWave >= this.maxEnemiesInWave) {
        this.startNewWave();
      }
    }

    // Spawn boss
    if (this.bossSpawnTimer >= this.bossSpawnRate) {
      this.spawnBoss(gameManager);
      this.bossSpawnTimer = 0;
    }
  }

  startNewWave() {
    this.waveNumber++;
    this.enemiesInWave = 0;
    this.waveTimer = 0;
    this.maxEnemiesInWave = Math.min(15, 5 + this.waveNumber);
    this.spawnRate = Math.max(0.3, 2.0 - this.waveNumber * 0.1);

    // Special wave events (much delayed for early levels)
    if (this.waveNumber >= 30 && this.waveNumber % 15 === 0) {
      // Mega boss wave (every 15 waves, starting at wave 30)
      this.spawnMegaBossWave();
    } else if (this.waveNumber >= 15 && this.waveNumber % 8 === 0) {
      // Boss wave (every 8 waves, starting at wave 15)
      this.spawnBossWave();
    } else if (this.waveNumber % 4 === 0) {
      // Swarm wave (every 4 waves, starts immediately)
      this.spawnSwarmWave();
    }
  }

  spawnMegaBossWave() {
    const gameManager = GameManager.getInstance();
    const canvas = gameManager.canvas;

    // Spawn mega boss in center - much lower spawn position
    const megaBoss = new Enemy(canvas.width / 2, 35, "mega_boss");
    gameManager.addEnemy(megaBoss);

    // Spawn supporting enemies
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = Math.random() * (canvas.width - 60) + 30;
        const enemy = new Enemy(x, -30, "swarm");
        gameManager.addEnemy(enemy);
      }, i * 1000);
    }
  }

  spawnBossWave() {
    const gameManager = GameManager.getInstance();
    const canvas = gameManager.canvas;

    // Spawn boss - much lower spawn position
    const boss = new Enemy(canvas.width / 2, 35, "boss");
    gameManager.addEnemy(boss);

    // Spawn supporting enemies
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const x = Math.random() * (canvas.width - 60) + 30;
        const enemy = new Enemy(x, -30, "fast");
        gameManager.addEnemy(enemy);
      }, i * 1500);
    }
  }

  spawnSwarmWave() {
    const gameManager = GameManager.getInstance();
    const canvas = gameManager.canvas;

    // Spawn swarm of enemies
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const x = Math.random() * (canvas.width - 60) + 30;
        const enemy = new Enemy(x, -30, "swarm");
        gameManager.addEnemy(enemy);
      }, i * 300);
    }
  }

  spawnEnemy(gameManager) {
    const canvas = gameManager.canvas;
    const x = Math.random() * (canvas.width - 60) + 30;
    const y = -20; // Spawn enemies just off-screen at the top

    // Choose enemy type based on difficulty and wave
    const enemyType = this.chooseEnemyType();
    const enemy = new Enemy(x, y, enemyType);

    gameManager.addEnemy(enemy);
  }

  // Spawn power-ups occasionally
  spawnPowerUp(gameManager, x, y) {
    const rand = Math.random();
    let powerUpType = "health"; // Default

    // 2% chance for extra life power-up (significantly reduced from 8%)
    if (rand < 0.02) {
      powerUpType = "extraLife";
    } else if (rand < 0.2) {
      powerUpType = "health";
    } else if (rand < 0.45) {
      powerUpType = "power";
    } else if (rand < 0.7) {
      powerUpType = "shield";
    } else {
      powerUpType = "rapidFire";
    }

    const powerUp = new PowerUp(x, y, powerUpType);
    gameManager.addPowerUp(powerUp);
  }

  spawnBoss(gameManager) {
    const canvas = gameManager.canvas;
    const x = canvas.width / 2;
    const y = 35;

    const boss = new Enemy(x, y, "boss");
    gameManager.addEnemy(boss);
  }

  chooseEnemyType() {
    const rand = Math.random();
    const difficulty = this.difficulty;
    const wave = this.waveNumber;

    // Mega boss appears every 15 waves (but only after wave 15)
    if (wave >= 15 && wave % 15 === 0 && rand < 0.15) {
      return "mega_boss";
    }

    // Boss appears every 8 waves (but only after wave 15)
    if (wave >= 12 && wave % 8 === 0 && rand < 0.2) {
      return "boss";
    }

    // Difficulty-based enemy selection (much reduced boss chances for early levels)
    if (difficulty >= 15 && rand < 0.015) {
      return "mega_boss";
    } else if (difficulty >= 12 && rand < 0.09) {
      return "boss";
    } else if (difficulty >= 5 && rand < 0.1) {
      return "sniper";
    } else if (difficulty >= 4 && rand < 0.15) {
      return "kamikaze";
    } else if (difficulty >= 3 && rand < 0.4) {
      return "swarm";
    } else if (difficulty >= 2 && rand < 0.5) {
      return "tank";
    } else if (difficulty >= 1 && rand < 0.6) {
      return "fast";
    } else {
      return "basic";
    }
  }

  increaseDifficulty() {
    this.difficulty++;
    this.maxEnemies = Math.min(15, 10 + this.difficulty);
    this.spawnRate = Math.max(0.3, this.spawnRate - 0.1);
  }

  // Spawn enemies in formation
  spawnFormation(gameManager, formationType) {
    const canvas = gameManager.canvas;

    switch (formationType) {
      case "line":
        this.spawnLineFormation(gameManager, canvas);
        break;
      case "v":
        this.spawnVFormation(gameManager, canvas);
        break;
      case "circle":
        this.spawnCircleFormation(gameManager, canvas);
        break;
      case "random":
        this.spawnRandomFormation(gameManager, canvas);
        break;
    }
  }

  spawnLineFormation(gameManager, canvas) {
    const enemyCount = 5;
    const spacing = canvas.width / (enemyCount + 1);

    for (let i = 1; i <= enemyCount; i++) {
      const x = spacing * i;
      const y = -30 - i * 20; // Staggered formation

      const enemyType = this.chooseEnemyType();
      const enemy = new Enemy(x, y, enemyType);
      gameManager.addEnemy(enemy);
    }
  }

  spawnVFormation(gameManager, canvas) {
    const centerX = canvas.width / 2;
    const baseY = -30;

    // Center enemy
    const centerEnemy = new Enemy(centerX, baseY, this.chooseEnemyType());
    gameManager.addEnemy(centerEnemy);

    // V formation
    for (let i = 1; i <= 2; i++) {
      const leftX = centerX - i * 40;
      const rightX = centerX + i * 40;
      const y = baseY - i * 30;

      const leftEnemy = new Enemy(leftX, y, this.chooseEnemyType());
      const rightEnemy = new Enemy(rightX, y, this.chooseEnemyType());

      gameManager.addEnemy(leftEnemy);
      gameManager.addEnemy(rightEnemy);
    }
  }

  spawnCircleFormation(gameManager, canvas) {
    const centerX = canvas.width / 2;
    const centerY = -100;
    const radius = 80;
    const enemyCount = 6;

    for (let i = 0; i < enemyCount; i++) {
      const angle = (Math.PI * 2 * i) / enemyCount;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const enemy = new Enemy(x, y, this.chooseEnemyType());
      gameManager.addEnemy(enemy);
    }
  }

  spawnRandomFormation(gameManager, canvas) {
    const enemyCount = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < enemyCount; i++) {
      const x = Math.random() * (canvas.width - 60) + 30;
      const y = -30 - Math.random() * 100;

      const enemy = new Enemy(x, y, this.chooseEnemyType());
      gameManager.addEnemy(enemy);
    }
  }

  // Get current wave info
  getWaveInfo() {
    return {
      waveNumber: this.waveNumber,
      enemiesInWave: this.enemiesInWave,
      maxEnemiesInWave: this.maxEnemiesInWave,
      difficulty: this.difficulty,
    };
  }
}
