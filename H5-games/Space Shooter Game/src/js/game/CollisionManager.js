class CollisionManager {
  constructor() {
    this.collisionPairs = [
      { tag1: "playerBullet", tag2: "enemy" },
      { tag1: "enemyBullet", tag2: "player" },
      { tag1: "player", tag2: "enemy" },
      { tag1: "player", tag2: "powerUp" },
    ];
  }

  checkCollisions(gameManager) {
    const player = gameManager.getPlayer();
    const enemies = gameManager.getEnemies();
    const bullets = gameManager.getBullets();
    const powerUps = gameManager.getPowerUps();

    // Check bullet collisions
    this.checkBulletCollisions(bullets, enemies, player);

    // Check player-enemy collisions
    if (player && player.active) {
      this.checkPlayerEnemyCollisions(player, enemies);
    }

    // Check player-powerup collisions
    if (player && player.active) {
      this.checkPlayerPowerUpCollisions(player, powerUps);
    }
  }

  checkCollisionsOptimized(gameManager) {
    const player = gameManager.getPlayer();
    const bullets = gameManager.getBullets();

    // Check bullet collisions using spatial hash
    this.checkBulletCollisionsOptimized(
      bullets,
      player,
      gameManager.spatialHash
    );

    // Check player collisions using spatial hash
    if (player && player.active) {
      this.checkPlayerCollisionsOptimized(player, gameManager.spatialHash);
    }
  }

  checkBulletCollisions(bullets, enemies, player) {
    for (const bullet of bullets) {
      if (!bullet.active) continue;

      // Check player bullets vs enemies
      if (bullet.owner === "player") {
        for (const enemy of enemies) {
          if (enemy.active && bullet.checkCollision(enemy)) {
            bullet.handleCollision(enemy);
            break; // Bullet can only hit one enemy
          }
        }

        // Check player bullets vs player (bounce-back damage)
        if (player && player.active && bullet.checkCollision(player)) {
          bullet.handleCollision(player);
        }
      }
      // Check enemy bullets vs player
      else if (bullet.owner === "enemy" && player && player.active) {
        if (bullet.checkCollision(player)) {
          bullet.handleCollision(player);
        }
      }
    }
  }

  checkPlayerEnemyCollisions(player, enemies) {
    for (const enemy of enemies) {
      if (enemy.active && player.collidesWith(enemy)) {
        // Player takes damage
        if (player.takeDamage(1)) {
          // Player destroyed
        }

        // Enemy takes damage
        enemy.takeDamage(1);

        // Create collision particles
        this.createCollisionParticles(player.position.x, player.position.y);
      }
    }
  }

  checkPlayerPowerUpCollisions(player, powerUps) {
    for (const powerUp of powerUps) {
      if (powerUp.active && player.collidesWith(powerUp)) {
        powerUp.applyToPlayer(player);
        powerUp.destroy();
      }
    }
  }

  createCollisionParticles(x, y) {
    const particleCount = 10;
    const gameManager = GameManager.getInstance();

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 100 + Math.random() * 100;
      const velocity = new Vector2(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // Use object pool for particles
      const particle = gameManager.particlePool.get();
      particle.position.set(x, y);
      particle.velocity.set(velocity.x, velocity.y);
      particle.color = "#ffff00";
      particle.life = 0.8;
      particle.maxLife = 0.8;
      particle.active = true;

      gameManager.addParticle(particle);
    }
  }

  checkBulletCollisionsOptimized(bullets, player, spatialHash) {
    for (const bullet of bullets) {
      if (!bullet.active) continue;

      if (bullet.owner === "player") {
        // Get nearby enemies using spatial hash
        const nearbyEnemies = spatialHash.getNearby(bullet, 50);
        for (const enemy of nearbyEnemies) {
          if (
            enemy.active &&
            enemy.tag === "enemy" &&
            bullet.checkCollision(enemy)
          ) {
            bullet.handleCollision(enemy);
            break;
          }
        }

        // Check player bullets vs player (bounce-back damage)
        if (player && player.active && bullet.checkCollision(player)) {
          bullet.handleCollision(player);
        }
      } else if (bullet.owner === "enemy" && player && player.active) {
        if (bullet.checkCollision(player)) {
          bullet.handleCollision(player);
        }
      }
    }
  }

  checkPlayerCollisionsOptimized(player, spatialHash) {
    // Get nearby objects using spatial hash; use a larger radius to ensure pickups are detected
    const nearbyObjects = spatialHash.getNearby(player, 80);

    for (const obj of nearbyObjects) {
      if (!obj.active) continue;

      if (obj.tag === "enemy" && player.collidesWith(obj)) {
        // Store lives before damage
        const livesBefore = player.lives;

        // Player takes damage
        if (player.takeDamage(1)) {
          // Player destroyed
        } else {
          // Player hit but not destroyed - only play sound if they actually lost a life
          if (window.audioManager && player.lives < livesBefore) {
            window.audioManager.playSound("playerHit");
          }
        }

        // Enemy takes damage
        obj.takeDamage(1);

        // Create collision particles
        this.createCollisionParticles(player.position.x, player.position.y);
      } else if (obj.tag === "powerUp" && player.collidesWith(obj)) {
        obj.applyToPlayer(player);
        obj.destroy();

        // Play power-up sound
        if (window.audioManager) {
          window.audioManager.playSound("powerup");
        }
      }
    }
  }

  // Check if two objects are colliding (AABB)
  isColliding(obj1, obj2) {
    if (!obj1.active || !obj2.active) return false;

    const bounds1 = obj1.getBounds();
    const bounds2 = obj2.getBounds();

    return !(
      bounds1.right < bounds2.left ||
      bounds1.left > bounds2.right ||
      bounds1.bottom < bounds2.top ||
      bounds1.top > bounds2.bottom
    );
  }

  // Get collision response vector
  getCollisionResponse(obj1, obj2) {
    const bounds1 = obj1.getBounds();
    const bounds2 = obj2.getBounds();

    const overlapX = Math.min(
      bounds1.right - bounds2.left,
      bounds2.right - bounds1.left
    );
    const overlapY = Math.min(
      bounds1.bottom - bounds2.top,
      bounds2.bottom - bounds1.top
    );

    if (overlapX < overlapY) {
      return new Vector2(overlapX, 0);
    } else {
      return new Vector2(0, overlapY);
    }
  }
}
