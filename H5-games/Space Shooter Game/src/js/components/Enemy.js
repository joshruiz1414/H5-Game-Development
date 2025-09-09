class Enemy extends GameObject {
  constructor(x, y, type = "basic") {
    super(x, y, 30, 30);
    this.tag = "enemy";
    this.type = type;
    this.health = 1;
    this.maxHealth = 1;
    this.speed = 100;
    this.score = 10;
    this.shootCooldown = 0;
    this.shootRate = 2.0;
    this.lastShootTime = 0;
    this.movementPattern = "straight";
    this.movementTime = 0;
    this.originalPosition = new Vector2(x, y);

    this.setupEnemyType(type);
  }

  setupEnemyType(type) {
    switch (type) {
      case "basic":
        this.color = "#ff4444";
        this.health = 1;
        this.maxHealth = 1;
        this.speed = 80; // Normal speed
        this.score = 10;
        this.shootRate = 3.0;
        this.movementPattern = "straight";
        this.width = 55;
        this.height = 55;
        // Use sprite image for basic enemy
        this.spriteImage = Enemy.getBasicImage();
        this.spriteRotationOffset = Math.PI;
        break;

      case "fast":
        this.color = "#ff8844";
        this.health = 1;
        this.maxHealth = 1;
        this.speed = 200;
        this.score = 20;
        this.shootRate = 2.0;
        this.movementPattern = "zigzag";
        this.width = 55;
        this.height = 55;
        // Use sprite image for fast enemy and ensure it faces downward
        this.spriteImage = Enemy.getFastImage();
        this.spriteRotationOffset = Math.PI;
        break;

      case "tank":
        this.color = "#8844ff";
        this.health = 3;
        this.maxHealth = 3;
        this.speed = 50;
        this.score = 50;
        this.shootRate = 2.3;
        this.movementPattern = "straight";
        this.width = 70;
        this.height = 70;
        // Use sprite image for tank
        this.spriteImage = Enemy.getTankImage();
        // Rotate 180 degrees so it faces downward
        this.spriteRotationOffset = Math.PI;
        break;

      case "boss":
        this.color = "#ff4488";
        this.health = 6;
        this.maxHealth = 10;
        this.speed = 30;
        this.score = 200;
        this.shootRate = 2.7;
        this.movementPattern = "boss";
        this.width = 85;
        this.height = 85;
        // Use sprite image for mini boss
        this.spriteImage = Enemy.getBossImage();
        this.spriteRotationOffset = Math.PI;
        break;

      case "swarm":
        this.color = "#44ff44";
        this.health = 1;
        this.maxHealth = 1;
        this.speed = 120;
        this.score = 15;
        this.shootRate = 4.0;
        this.movementPattern = "swarm";
        this.width = 45;
        this.height = 45;
        // Use sprite image for swarm enemy
        this.spriteImage = Enemy.getSwarmImage();
        this.spriteRotationOffset = Math.PI;
        break;

      case "sniper":
        this.color = "#ffff44";
        this.health = 2;
        this.maxHealth = 2;
        this.speed = 40;
        this.score = 30;
        this.shootRate = 5.5;
        this.movementPattern = "straight";
        this.width = 65;
        this.height = 65;
        // Use sprite image for sniper enemy
        this.spriteImage = Enemy.getSniperImage();
        this.spriteRotationOffset = Math.PI;
        break;

      case "kamikaze":
        this.color = "#ff4444";
        this.health = 1;
        this.maxHealth = 1;
        this.speed = 200;
        this.score = 25;
        this.shootRate = 0; // Doesn't shoot, just crashes
        this.movementPattern = "kamikaze";
        this.spriteImage = Enemy.getkamikazeImage();
        this.spriteRotationOffset = Math.PI;
        this.width = 50;
        this.height = 50;
        break;

      case "mega_boss":
        this.color = "#ff00ff";
        this.health = 9;
        this.maxHealth = 20;
        this.speed = 20;
        this.score = 500;
        this.shootRate = 2.6; // Reduced from 0.3 to shoot half as frequently
        this.movementPattern = "mega_boss";
        this.width = 100;
        this.height = 100;
        // Use sprite image for big boss
        this.spriteImage = Enemy.getMegaBossImage();
        this.spriteRotationOffset = Math.PI;
        break;
    }
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Update movement pattern
    this.updateMovement(deltaTime);

    // Update shooting
    this.shootCooldown -= deltaTime;
    this.movementTime += deltaTime;

    // Check if off screen - only destroy if they've been on screen for a while
    const canvas = document.getElementById("game-canvas");
    if (this.isOffScreen(canvas.width, canvas.height)) {
      // Only destroy if enemy has moved significantly from spawn position
      const distanceFromSpawn = Math.sqrt(
        Math.pow(this.position.x - this.originalPosition.x, 2) +
          Math.pow(this.position.y - this.originalPosition.y, 2)
      );

      if (distanceFromSpawn > 100) {
        this.destroy();
      }
    }
  }

  updateMovement(deltaTime) {
    switch (this.movementPattern) {
      case "straight":
        this.velocity = new Vector2(0, this.speed);
        break;

      case "zigzag":
        const zigzagSpeed = 150;
        const zigzagAmplitude = 100;
        this.velocity = new Vector2(
          Math.sin(this.movementTime * 2) * zigzagAmplitude,
          this.speed
        );
        break;

      case "boss":
        // Boss moves in a figure-8 pattern
        const bossSpeed = 50;
        const time = this.movementTime * 0.5;
        this.velocity = new Vector2(
          Math.sin(time) * bossSpeed,
          Math.sin(time * 2) * bossSpeed * 0.5
        );
        break;

      case "swarm":
        // Swarm enemies move in a circular pattern
        const swarmRadius = 50;
        const swarmSpeed = 2;
        this.velocity = new Vector2(
          Math.cos(this.movementTime * swarmSpeed) * swarmRadius,
          this.speed + Math.sin(this.movementTime * swarmSpeed) * 20
        );
        break;

      case "kamikaze":
        // Kamikaze enemies move directly toward the player
        const player = GameManager.getInstance().getPlayer();
        if (player && player.active) {
          const dx = player.position.x - this.position.x;
          const dy = player.position.y - this.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            this.velocity = new Vector2(
              (dx / distance) * this.speed,
              (dy / distance) * this.speed
            );
          }
        } else {
          this.velocity = new Vector2(0, this.speed);
        }
        break;

      case "mega_boss":
        // Mega boss moves in a complex pattern
        const megaBossSpeed = 30;
        const megaBossTime = this.movementTime * 0.3;
        this.velocity = new Vector2(
          Math.sin(megaBossTime) * megaBossSpeed +
            Math.cos(megaBossTime * 0.5) * 20,
          Math.cos(megaBossTime) * megaBossSpeed * 0.5 +
            Math.sin(megaBossTime * 0.3) * 15
        );
        break;
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Draw enemy ship
    this.drawEnemyShip(ctx);

    // Draw health bar for bosses and tanks
    if (
      this.type === "sniper" ||
      this.type === "mega_boss" ||
      this.type === "boss" ||
      this.type === "tank"
    ) {
      this.drawHealthBar(ctx);
    }

    ctx.restore();
  }

  drawEnemyShip(ctx) {
    // Generic sprite drawing function
    if (
      this.spriteImage &&
      this.spriteImage.complete &&
      this.spriteImage.naturalHeight !== 0
    ) {
      ctx.save();
      // Ensure it faces downward using rotation offset
      if (this.spriteRotationOffset) {
        ctx.rotate(this.spriteRotationOffset);
      }
      const drawWidth = this.width;
      const drawHeight = this.height;
      ctx.drawImage(
        this.spriteImage,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
      ctx.restore();
      return;
    }

    // Default: simple rectangle body (fallback if sprites not loaded)
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Enemy details based on type
    switch (this.type) {
      case "basic":
        // Simple enemy
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          -this.width / 2 + 5,
          -this.height / 2 + 5,
          this.width - 10,
          this.height - 10
        );
        break;

      case "fast":
        // Fast enemy with wings
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          -this.width / 2 + 3,
          -this.height / 2 + 3,
          this.width - 6,
          this.height - 6
        );
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2 - 3, -this.height / 2, 3, this.height);
        ctx.fillRect(this.width / 2, -this.height / 2, 3, this.height);
        break;

      case "tank":
        // Fallback tank drawing if sprite not loaded
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          -this.width / 2 + 8,
          -this.height / 2 + 8,
          this.width - 16,
          this.height - 16
        );
        break;

      case "sniper":
        // Sniper enemy with antenna
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          -this.width / 2 + 6,
          -this.height / 2 + 6,
          this.width - 12,
          this.height - 12
        );
        ctx.fillStyle = this.color;
        ctx.fillRect(-2, -this.height / 2 - 6, 4, 6);
        break;

      case "boss":
        // Boss enemy with more details
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          -this.width / 2 + 10,
          -this.height / 2 + 10,
          this.width - 20,
          this.height - 20
        );
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2 - 5, -this.height / 2, 5, this.height);
        ctx.fillRect(this.width / 2, -this.height / 2, 5, this.height);
        break;

      case "swarm":
        // Swarm enemy with dots
        ctx.fillStyle = "#ffffff";
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            ctx.fillRect(i * 6 - 2, j * 6 - 2, 4, 4);
          }
        }
        break;

      case "kamikaze":
        // Kamikaze enemy with pointed front
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }

  drawHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = 4;
    const barY = -this.height / 2 - 10;

    // Background
    ctx.fillStyle = "#333333";
    ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

    // Health
    const healthPercentage = this.health / this.maxHealth;
    ctx.fillStyle =
      healthPercentage > 0.5
        ? "#00ff00"
        : healthPercentage > 0.25
        ? "#ffff00"
        : "#ff0000";
    ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercentage, barHeight);
  }

  shoot() {
    if (this.shootCooldown <= 0) {
      this.shootCooldown = this.shootRate;
      this.lastShootTime = Date.now();

      const gameManager = GameManager.getInstance();

      // Check if we can spawn more bullets
      if (!gameManager.performanceMonitor.canSpawnObject("bullet")) {
        return;
      }

      // Different shooting patterns based on type
      switch (this.type) {
        case "basic":
          this.createEnemyBullet(0, 200);
          break;

        case "fast":
          this.createEnemyBullet(0, 250);
          break;

        case "tank":
          this.createEnemyBullet(0, 150);
          break;

        case "swarm":
          // Swarm enemies shoot in a spread pattern
          for (let i = 0; i < 2; i++) {
            const angle = (i - 0.5) * 0.6; // Spread across 2 directions
            const speed = 180;
            this.createEnemyBullet(
              Math.sin(angle) * speed,
              Math.cos(angle) * speed
            );
          }
          break;

        case "sniper":
          // Sniper shoots 1 bullet directly at player's position
          const player = gameManager.getPlayer();
          if (player && player.active) {
            // Calculate direction to player
            const dx = player.position.x - this.position.x;
            const dy = player.position.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
              // Normalize direction and apply bullet speed
              const bulletSpeed = 150;
              const velocityX = (dx / distance) * bulletSpeed;
              const velocityY = (dy / distance) * bulletSpeed;

              this.createEnemyBullet(velocityX, velocityY);
            }
          }
          break;

        case "boss":
          // Boss shoots multiple bullets
          for (let i = 0; i < 3; i++) {
            const angle = (i - 1) * 0.3;
            const speed = 200;
            this.createEnemyBullet(
              Math.sin(angle) * speed,
              Math.cos(angle) * speed
            );
          }
          break;

        case "mega_boss":
          // Mega boss shoots in a spread pattern
          for (let i = 0; i < 5; i++) {
            const angle = (i - 2) * 0.4; // Spread across 5 directions
            const speed = 150;
            this.createEnemyBullet(
              Math.sin(angle) * speed,
              Math.cos(angle) * speed
            );
          }
          break;
      }
    }
  }

  takeDamage(damage = 1) {
    this.health -= damage;

    if (this.health <= 0) {
      // Create explosion effect
      console.log(`Enemy ${this.type} destroyed! Creating explosion...`);
      this.createExplosion();

      // Add score
      GameManager.getInstance().addScore(this.score);

      // Chance to drop power-up (scales with level - reduced)
      const gameManager = GameManager.getInstance();
      const level = gameManager.level;
      const baseChance = 0.08; // 8% base chance (reduced from 12%)
      const levelBonus = Math.min(0.07, level * 0.01); // +1% per level, max 12% (reduced from 1.5% per level, max 16%)
      const totalChance = baseChance + levelBonus;

      if (Math.random() < totalChance) {
        GameManager.getInstance().enemySpawner.spawnPowerUp(
          GameManager.getInstance(),
          this.position.x,
          this.position.y
        );
      }

      this.destroy();
      return true;
    }
    return false;
  }

  createEnemyBullet(velocityX, velocityY) {
    const gameManager = GameManager.getInstance();

    // Use object pool for bullet
    const bullet = gameManager.bulletPool.get();
    bullet.position.set(this.position.x, this.position.y + this.height / 2);
    bullet.velocity.set(velocityX, velocityY);
    bullet.owner = "enemy";
    bullet.setupBulletType();
    bullet.active = true;

    gameManager.addBullet(bullet);
  }

  createExplosion() {
    const particleCount =
      this.type === "boss" ? 30 : this.type === "tank" ? 20 : 15;
    const gameManager = GameManager.getInstance();

    console.log(
      `Creating explosion with ${particleCount} particles for ${this.type} enemy`
    );

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 80 + Math.random() * 120;
      const velocity = new Vector2(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // Use object pool for particles
      const particle = gameManager.particlePool.get();
      particle.position.set(this.position.x, this.position.y);
      particle.velocity.set(velocity.x, velocity.y);
      particle.color = this.color;
      particle.life = 1.5;
      particle.maxLife = 1.5;
      particle.size = 3 + Math.random() * 4; // Larger particles
      particle.active = true;

      gameManager.addParticle(particle);
    }

    console.log(
      `Explosion created! Total particles: ${gameManager.particles.length}`
    );
  }

  static getTankImage() {
    if (!Enemy._tankImage) {
      const img = new Image();
      img.src = "src/assets/images/Tank.png";
      Enemy._tankImage = img;
    }
    return Enemy._tankImage;
  }

  static getFastImage() {
    if (!Enemy._fastImage) {
      const img = new Image();
      img.src = "src/assets/images/fast_enemy.png";
      Enemy._fastImage = img;
    }
    return Enemy._fastImage;
  }

  static getBasicImage() {
    if (!Enemy._basicImage) {
      const img = new Image();
      img.src = "src/assets/images/Basic.png";
      Enemy._basicImage = img;
    }
    return Enemy._basicImage;
  }

  static getSwarmImage() {
    if (!Enemy._swarmImage) {
      const img = new Image();
      img.src = "src/assets/images/Swarm.png";
      Enemy._swarmImage = img;
    }
    return Enemy._swarmImage;
  }

  static getSniperImage() {
    if (!Enemy._sniperImage) {
      const img = new Image();
      img.src = "src/assets/images/Sniper.png";
      Enemy._sniperImage = img;
    }
    return Enemy._sniperImage;
  }

  static getBossImage() {
    if (!Enemy._bossImage) {
      const img = new Image();
      img.src = "src/assets/images/Galaga Mini Boss Ship.png";
      Enemy._bossImage = img;
    }
    return Enemy._bossImage;
  }

  static getMegaBossImage() {
    if (!Enemy._megaBossImage) {
      const img = new Image();
      img.src = "src/assets/images/Galaga Big Boss Ship.png";
      Enemy._megaBossImage = img;
    }
    return Enemy._megaBossImage;
  }

  static getkamikazeImage() {
    if (!Enemy._kamikaze) {
      const img = new Image();
      img.src = "src/assets/images/Galaga Omnidirectional Kamikaze Ship.png";
      Enemy._kamikaze = img;
    }
    return Enemy._kamikaze;
  }
}
