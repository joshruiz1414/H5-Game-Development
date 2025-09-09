class PowerUp extends GameObject {
  constructor(x, y, type = "health") {
    super(x, y, 20, 20);
    this.tag = "powerUp";
    this.type = type;
    this.life = 10.0; // seconds
    this.maxLife = 10.0;
    this.bobTime = 0;
    this.bobAmplitude = 5;
    this.bobSpeed = 2;

    this.setupPowerUpType();
  }

  setupPowerUpType() {
    switch (this.type) {
      case "health":
        this.color = "#ff8800";
        this.effect = "heal";
        this.value = 1;
        this.width = 30;
        this.height = 30;
        this.spriteImage = PowerUp.getImage("health");
        this.spriteRotationOffset = Math.PI;
        break;
      case "power":
        this.color = "#ffff00";
        this.effect = "powerUp";
        this.value = 1;
        this.width = 30;
        this.height = 30;
        this.spriteImage = PowerUp.getImage("power");
        this.spriteRotationOffset = Math.PI;
        break;
      case "shield":
        this.color = "#00ffff";
        this.effect = "shield";
        this.value = 5.0; // seconds
        this.width = 30;
        this.height = 30;
        this.spriteImage = PowerUp.getImage("shield");
        this.spriteRotationOffset = Math.PI;
        break;
      case "rapidFire":
        this.color = "#ff00ff";
        this.effect = "rapidFire";
        this.value = 10.0; // seconds
        this.width = 30;
        this.height = 30;
        this.spriteImage = PowerUp.getImage("rapidFire");
        this.spriteRotationOffset = Math.PI;
        break;
      case "extraLife":
        this.color = "#ff0000";
        this.effect = "extraLife";
        this.value = 1;
        this.width = 30;
        this.height = 30;
        this.spriteImage = PowerUp.getImage("extraLife");
        this.spriteRotationOffset = Math.PI;
        break;
    }
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Bobbing animation
    this.bobTime += deltaTime;

    // Move down slowly (like enemies)
    this.velocity = new Vector2(0, 80);

    // Check if off screen (destroy if missed)
    const canvas = document.getElementById("game-canvas");
    if (this.position.y > canvas.height + 50) {
      this.destroy();
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // Bobbing effect
    const bobOffset =
      Math.sin(this.bobTime * this.bobSpeed) * this.bobAmplitude;
    ctx.translate(0, bobOffset);

    // Draw power-up
    this.drawPowerUp(ctx);

    ctx.restore();
  }

  drawPowerUp(ctx) {
    // Main body
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.shadowBlur = 0;

    // ctx.fillText(symbol, 0, 0);

    // Pulsing effect
    const pulse = 0.5 + 0.5 * Math.sin(this.bobTime * 4);
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      -this.width / 2 - 2,
      -this.height / 2 - 2,
      this.width + 4,
      this.height + 4
    );
    ctx.globalAlpha = 1;

    if (this.spriteImage) {
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
  }

  applyToPlayer(player) {
    switch (this.effect) {
      case "heal":
        // Increase lives up to maximum of 3
        if (player.lives < 3) {
          player.lives++;
          // Show quick fade message
          GameManager.getInstance().showPowerUpMessage(
            "HEALTH! +1 Life",
            "#ff8800"
          );
        } else {
          // Show message that player is already at max lives
          GameManager.getInstance().showPowerUpMessage(
            "MAX HEALTH! (3/3)",
            "#ff8800"
          );
        }
        break;
      case "powerUp":
        const originalBulletDamage = player.bulletDamage;

        // Clear any existing power-up timeout
        if (GameManager.getInstance().activePowerUps.powerUp.timeoutId) {
          clearTimeout(
            GameManager.getInstance().activePowerUps.powerUp.timeoutId
          );
        }

        // Temporarily increase bullet damage to 3
        player.bulletDamage = 3;
        GameManager.getInstance().showPowerUpMessage(
          "POWER UP! 10 seconds of 3x damage bullets",
          "#ffff00"
        );

        // Activate power-up timer
        GameManager.getInstance().activePowerUps.powerUp.active = true;
        GameManager.getInstance().activePowerUps.powerUp.timeLeft = 10.0;

        // Reset after 10 seconds
        const powerUpTimeoutId = setTimeout(() => {
          if (player.active) {
            player.bulletDamage = originalBulletDamage;
            GameManager.getInstance().activePowerUps.powerUp.active = false;
          }
        }, 10000);

        // Store the timeout ID so we can clear it later
        GameManager.getInstance().activePowerUps.powerUp.timeoutId =
          powerUpTimeoutId;
        break;
      case "shield":
        // Clear any existing shield timeout
        if (GameManager.getInstance().activePowerUps.shield.timeoutId) {
          clearTimeout(
            GameManager.getInstance().activePowerUps.shield.timeoutId
          );
        }

        player.invulnerable = true;
        player.invulnerableTime = 10; // 15 seconds
        this.createShieldEffect(player);
        GameManager.getInstance().showPowerUpMessage(
          "SHIELD! 10 seconds of invulnerability",
          "#00ffff"
        );

        // Activate shield timer
        GameManager.getInstance().activePowerUps.shield.active = true;
        GameManager.getInstance().activePowerUps.shield.timeLeft = 10;

        // Reset after 15 seconds
        const shieldTimeoutId = setTimeout(() => {
          if (player.active) {
            player.invulnerable = false;
            player.invulnerableTime = 0;
            GameManager.getInstance().activePowerUps.shield.active = false;
          }
        }, 15000);

        // Store the timeout ID so we can clear it later
        GameManager.getInstance().activePowerUps.shield.timeoutId =
          shieldTimeoutId;
        break;
      case "rapidFire":
        // Clear any existing rapid fire timeout
        if (GameManager.getInstance().activePowerUps.rapidFire.timeoutId) {
          clearTimeout(
            GameManager.getInstance().activePowerUps.rapidFire.timeoutId
          );
        }

        player.shootRate = 0.1; // Rapid fire
        GameManager.getInstance().showPowerUpMessage(
          "RAPID FIRE! 10 seconds of fast shooting",
          "#ff00ff"
        );

        // Activate rapid fire timer
        GameManager.getInstance().activePowerUps.rapidFire.active = true;
        GameManager.getInstance().activePowerUps.rapidFire.timeLeft = 10.0;

        // Reset after 10 seconds
        const rapidFireTimeoutId = setTimeout(() => {
          if (player.active) {
            player.shootRate =
              GameManager.getInstance().activePowerUps.rapidFire.originalShootRate;
            GameManager.getInstance().activePowerUps.rapidFire.active = false;
          }
        }, 10000);

        // Store the timeout ID so we can clear it later
        GameManager.getInstance().activePowerUps.rapidFire.timeoutId =
          rapidFireTimeoutId;
        break;
      case "extraLife":
        // Give extra life up to maximum of 5
        console.log(
          `Extra life power-up collected! Current lives: ${player.lives}`
        );
        if (player.lives < 5) {
          player.lives++;
          console.log(`Extra life added! New lives: ${player.lives}`);
          // Show quick fade message
          GameManager.getInstance().showPowerUpMessage(
            "EXTRA LIFE! +1 Life",
            "#ff0000"
          );
        } else {
          console.log(
            `Extra life power-up collected but already at max lives (5/5)`
          );
          // Show message that player is already at max lives
          GameManager.getInstance().showPowerUpMessage(
            "MAX LIVES! (5/5)",
            "#ff0000"
          );
        }
        break;
    }
  }

  createPowerUpEffect(x, y, color) {
    // Create power-up collection particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 50;
      const velocity = new Vector2(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      GameManager.getInstance().addParticle(
        new Particle(x, y, velocity.x, velocity.y, color, 0.5)
      );
    }
  }

  createShieldEffect(player) {
    // Add shield visual effect to player
    player.shieldActive = true;
    player.shieldTime = this.value;

    // Create shield particles
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const radius = 30;
      const x = player.position.x + Math.cos(angle) * radius;
      const y = player.position.y + Math.sin(angle) * radius;

      GameManager.getInstance().addParticle(
        new Particle(x, y, 0, 0, "#00ffff", this.value)
      );
    }
  }

  static getImage(type) {
    switch (type) {
      case "health":
        if (!PowerUp._healthImage) {
          const img = new Image();
          img.src = "src/assets/images/Galaga Health Power-up.png";
          PowerUp._healthImage = img;
        }
        return PowerUp._healthImage;
      case "power":
        if (!PowerUp._powerImage) {
          const img = new Image();
          img.src = "src/assets/images/Galaga Power Power-up.png";
          PowerUp._powerImage = img;
        }
        return PowerUp._powerImage;
      case "shield":
        if (!PowerUp._shieldImage) {
          const img = new Image();
          img.src = "src/assets/images/Galaga Shield Power-up.png";
          PowerUp._shieldImage = img;
        }
        return PowerUp._shieldImage;
      case "rapidFire":
        if (!PowerUp._rapidFireImage) {
          const img = new Image();
          img.src = "src/assets/images/Galaga Rapid Fire Power-up.png";
          PowerUp._rapidFireImage = img;
        }
        return PowerUp._rapidFireImage;
      case "extraLife":
        if (!PowerUp._extraLifeImage) {
          const img = new Image();
          img.src = "src/assets/images/Galaga Extra Life Power-up.png";
          PowerUp._extraLifeImage = img;
        }
        return PowerUp._extraLifeImage;
    }
  }
}
