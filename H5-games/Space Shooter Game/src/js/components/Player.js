class Player extends GameObject {
  constructor(x, y) {
    super(x, y, 30, 30); // Circular hitbox (diameter = 30, radius = 15)
    this.tag = "player";
    this.color = "#00ff88";
    this.speed = 200;
    this.health = 3;
    this.maxHealth = 3;
    this.lives = 3;
    this.invulnerable = false;
    this.invulnerableTime = 0;
    this.shootCooldown = 0;
    this.shootRate = 0.3; // seconds between shots
    this.bulletDamage = 1; // Base bullet damage
    this.lastShootTime = 0;
    this.turretAngle = 0;
    this.radius = 15; // Circular collision radius

    // Visual effects
    this.engineParticles = [];
    this.flashTime = 0;

    // Load Galaga ship image
    this.shipImage = new Image();
    this.shipImage.src =
      "src/assets/images/242-2423952_galaga-galaga-ship-hd-png-download.png-removebg-preview.png";
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerableTime -= deltaTime;
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false;
      }
    }

    // Update shoot cooldown
    this.shootCooldown -= deltaTime;

    // Update flash effect
    if (this.flashTime > 0) {
      this.flashTime -= deltaTime;
    }

    // Update engine particles
    this.updateEngineParticles(deltaTime);

    // Keep player on screen
    this.keepOnScreen();
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Draw shield effect if active
    if (this.invulnerable && this.invulnerableTime > 0) {
      this.drawShield(ctx);
    }

    // Flash effect when hit
    if (this.flashTime > 0) {
      ctx.globalAlpha = 0.5 + Math.sin(this.flashTime * 20) * 0.5;
    }

    // Draw player ship
    this.drawShip(ctx);

    // Draw engine particles
    this.renderEngineParticles(ctx);

    ctx.restore();
  }

  drawShip(ctx) {
    // Check if image is loaded
    if (this.shipImage.complete && this.shipImage.naturalHeight !== 0) {
      // Draw the Galaga ship image
      ctx.save();
      ctx.rotate(this.turretAngle - Math.PI / 2); // Rotate based on turret angle

      // Flip the image upside down and make it larger
      const imageSize = 50; // Increased from 30 to 50 for better visibility
      const halfSize = imageSize / 2;

      // Scale and flip the image
      ctx.scale(1, -1); // Flip vertically

      // Draw the image centered
      ctx.drawImage(
        this.shipImage,
        -halfSize,
        -halfSize, // Position
        imageSize,
        imageSize // Size
      );

      ctx.restore();
    } else {
      // Fallback to original geometric shapes if image not loaded yet
      // Turret base (circle only)
      ctx.fillStyle = "#444444";
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();

      // Turret barrel attached to circle
      ctx.save();
      ctx.rotate(this.turretAngle - Math.PI / 2); // Subtract 90 degrees to correct the angle
      ctx.fillStyle = "#666666";
      ctx.fillRect(-4, 0, 8, 25); // Barrel starts from circle center
      ctx.restore();
    }
  }

  drawShield(ctx) {
    // Create a pulsing blue shield effect
    const shieldRadius = 25 + Math.sin(Date.now() * 0.005) * 3; // Pulsing effect
    const shieldAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.1; // Breathing effect

    // Outer glow
    ctx.save();
    ctx.globalAlpha = shieldAlpha * 0.5;
    ctx.fillStyle = "#0088ff";
    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Main shield
    ctx.save();
    ctx.globalAlpha = shieldAlpha;
    ctx.fillStyle = "#00aaff";
    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Inner shield
    ctx.save();
    ctx.globalAlpha = shieldAlpha * 0.7;
    ctx.fillStyle = "#44ccff";
    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius - 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Shield border
    ctx.save();
    ctx.globalAlpha = shieldAlpha;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  updateEngineParticles(deltaTime) {
    // Add new particles
    if (Math.random() < 0.3) {
      // Position particles at the bottom edge of the ship (behind it)
      const engineX = this.position.x + (Math.random() - 0.5) * 10; // Small spread
      const engineY = this.position.y + this.height / 2 + 3; // Just behind the ship

      this.engineParticles.push({
        position: new Vector2(engineX, engineY),
        velocity: new Vector2(
          (Math.random() - 0.5) * 30, // Horizontal spread
          Math.random() * 100 + 100 // Move downward faster
        ),
        life: 0.8,
        maxLife: 0.8,
        color: `hsl(${30 + Math.random() * 20}, 100%, 50%)`,
      });
    }

    // Update existing particles
    for (let i = this.engineParticles.length - 1; i >= 0; i--) {
      const particle = this.engineParticles[i];
      particle.position = particle.position.add(
        particle.velocity.multiply(deltaTime)
      );
      particle.life -= deltaTime;

      if (particle.life <= 0) {
        this.engineParticles.splice(i, 1);
      }
    }
  }

  renderEngineParticles(ctx) {
    for (const particle of this.engineParticles) {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  handleInput(inputManager, deltaTime) {
    // Movement (horizontal only for turret defense)
    const movement = inputManager.getMovementVector();
    if (movement.x !== 0) {
      this.velocity = new Vector2(movement.x * this.speed, 0);
    } else {
      this.velocity = new Vector2(0, 0);
    }

    // Aim turret at mouse
    const mousePos = inputManager.getMousePosition();

    // If mouse is at (0,0), use a default position (center of screen)
    let targetX = mousePos.x;
    let targetY = mousePos.y;

    if (mousePos.x === 0 && mousePos.y === 0) {
      // Use center of screen as default target
      const canvas = document.getElementById("game-canvas");
      targetX = canvas.width / 2;
      targetY = canvas.height / 2;
    }

    // Always calculate angle
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    this.turretAngle = Math.atan2(dy, dx); // Remove the 180 degree offset

    // Shooting
    if (inputManager.isShootPressed() && this.shootCooldown <= 0) {
      this.shoot();
    }
  }

  shoot() {
    this.shootCooldown = this.shootRate;
    this.lastShootTime = Date.now();

    const gameManager = GameManager.getInstance();

    // Check if we can spawn more bullets
    if (!gameManager.performanceMonitor.canSpawnObject("bullet")) {
      return;
    }

    // Calculate bullet direction based on turret angle
    const bulletSpeed = 400;
    const bulletOffset = 35; // Increased to spawn outside turret circle
    const bulletX = this.position.x + Math.cos(this.turretAngle) * bulletOffset;
    const bulletY = this.position.y + Math.sin(this.turretAngle) * bulletOffset;
    const velocityX = Math.cos(this.turretAngle) * bulletSpeed;
    const velocityY = Math.sin(this.turretAngle) * bulletSpeed;

    // Use object pool for bullet
    const bullet = gameManager.bulletPool.get();
    bullet.position.set(bulletX, bulletY);
    bullet.velocity.set(velocityX, velocityY);
    bullet.owner = "player";
    bullet.setupBulletType();
    bullet.damage = this.bulletDamage;
    bullet.active = true;

    gameManager.addBullet(bullet);
  }

  takeDamage(damage = 1) {
    if (this.invulnerable) return false;

    // Reduce lives directly when taking damage
    this.lives--;
    this.flashTime = 0.5;
    console.log(`Player took damage! Lives remaining: ${this.lives}`);

    if (this.lives <= 0) {
      // Game over - player destroyed
      this.destroy();
      return true;
    } else {
      // Make invulnerable for a short time
      this.invulnerable = true;
      this.invulnerableTime = 2.0;
      return false;
    }
  }

  heal(amount = 1) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  keepOnScreen() {
    const canvas = document.getElementById("game-canvas");
    const halfWidth = this.width / 2;

    // Only allow horizontal movement (turret defense)
    if (this.position.x < halfWidth) this.position.x = halfWidth;
    if (this.position.x > canvas.width - halfWidth)
      this.position.x = canvas.width - halfWidth;

    // Keep player at bottom of screen
    this.position.y = canvas.height - 60;
  }

  getHealthPercentage() {
    return this.health / this.maxHealth;
  }

  // Override collision detection to use circular collision
  collidesWith(other) {
    if (!other || !other.active || !this.active) return false;

    // Use circular collision for player
    const dx = this.position.x - other.position.x;
    const dy = this.position.y - other.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Player radius + other object radius (assuming other objects have radius property)
    const otherRadius = other.radius || (other.width + other.height) / 4; // Approximate radius for rectangular objects
    const combinedRadius = this.radius + otherRadius;

    return distance < combinedRadius;
  }
}
