class Bullet extends GameObject {
  constructor(x, y, velocityX, velocityY, owner) {
    super(x, y, 4, 8);
    this.owner = owner; // 'player' or 'enemy'
    this.damage = 1;
    this.speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    this.life = this.owner === "player" ? 8.0 : 3.0; // Player bullets last longer
    this.maxLife = this.owner === "player" ? 8.0 : 3.0;

    // Set velocity
    this.velocity = new Vector2(velocityX, velocityY);

    // Set properties based on owner
    this.setupBulletType();
  }

  setupBulletType() {
    if (this.owner === "player") {
      this.color = "#00ffff";
      this.tag = "playerBullet";
      this.width = 4;
      this.height = 12;
      this.life = 8.0;
      this.maxLife = 8.0;
    } else {
      this.color = "#ff4444";
      this.tag = "enemyBullet";
      this.width = 4;
      this.height = 8;
      this.life = 3.0;
      this.maxLife = 3.0;
    }
  }

  update(deltaTime) {
    // Debug logging for enemy bullets
    if (this.owner === "enemy" && this.tag === "enemyBullet") {
      // console.log(
      //   `Bullet update: pos=(${this.position.x.toFixed(
      //     1
      //   )}, ${this.position.y.toFixed(1)}), vel=(${this.velocity.x.toFixed(
      //     1
      //   )}, ${this.velocity.y.toFixed(1)})`
      // );
    }

    super.update(deltaTime);

    // Only player bullets bounce and have life limit
    if (this.owner === "player") {
      // Update life for player bullets
      this.life -= deltaTime;
      if (this.life <= 0) {
        this.destroy();
      }

      // Check for wall bouncing (only player bullets)
      const canvas = document.getElementById("game-canvas");
      this.checkWallBounce(canvas.width, canvas.height);
    } else {
      // Enemy bullets just check if off screen
      const canvas = document.getElementById("game-canvas");
      if (this.isOffScreen(canvas.width, canvas.height)) {
        this.destroy();
      }
    }
  }

  checkWallBounce(canvasWidth, canvasHeight) {
    const margin = 5;
    let bounced = false;

    // Check left and right walls
    if (this.position.x <= margin || this.position.x >= canvasWidth - margin) {
      this.velocity.x = -this.velocity.x;
      this.position.x = Math.max(
        margin,
        Math.min(canvasWidth - margin, this.position.x)
      );
      bounced = true;
    }

    // Check top and bottom walls
    if (this.position.y <= margin || this.position.y >= canvasHeight - margin) {
      this.velocity.y = -this.velocity.y;
      this.position.y = Math.max(
        margin,
        Math.min(canvasHeight - margin, this.position.y)
      );
      bounced = true;
    }

    // Slight velocity decay on bounce to prevent infinite bouncing
    if (bounced) {
      this.velocity = this.velocity.multiply(0.98);
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // Calculate rotation based on velocity
    this.rotation = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
    ctx.rotate(this.rotation);

    // Draw bullet with trail effect
    this.drawBullet(ctx);

    ctx.restore();
  }

  drawBullet(ctx) {
    // Bullet trail
    const trailLength = this.owner === "player" ? 20 : 15;
    const trailAlpha = 0.3;

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = trailAlpha;
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(0, -this.height / 2 - trailLength);
    ctx.stroke();

    // Main bullet
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Bullet glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.shadowBlur = 0;

    // Bullet tip
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height / 3
    );
  }

  // Check collision with other objects
  checkCollision(other) {
    if (!this.active || !other.active) return false;

    // Don't collide with particles
    if (other.tag === "particle") return false;

    // Don't collide with bullets of the same owner (except player bullets can hit player)
    if (
      other.tag === this.tag &&
      !(this.owner === "player" && other.tag === "player")
    ) {
      return false;
    }

    return this.collidesWith(other);
  }

  // Handle collision
  handleCollision(other) {
    if (other.tag === "player" && this.owner === "enemy") {
      // Enemy bullet hits player
      const livesBefore = other.lives;

      if (other.takeDamage(this.damage)) {
        // Player destroyed
      } else {
        // Player hit but not destroyed - only play sound if they actually lost a life
        if (window.audioManager && other.lives < livesBefore) {
          window.audioManager.playSound("playerHit");
        }
      }
      this.destroy();
    } else if (other.tag === "enemy" && this.owner === "player") {
      // Player bullet hits enemy
      if (other.takeDamage(this.damage)) {
        // Enemy destroyed
      }
      this.destroy();
    } else if (other.tag === "player" && this.owner === "player") {
      // Player bullet bounces back and hits player
      console.log("Player bullet hit player! Bounce-back damage!");
      const livesBefore = other.lives;

      if (other.takeDamage(this.damage)) {
        // Player destroyed
      } else {
        // Player hit but not destroyed - only play sound if they actually lost a life
        if (window.audioManager && other.lives < livesBefore) {
          window.audioManager.playSound("playerHit");
        }
      }
      this.destroy();
    }
  }
}
