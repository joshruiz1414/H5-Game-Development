class Renderer {
  constructor(ctx, starCount) {
    this.ctx = ctx;
    this.starCount = starCount;
    this.stars = this.generateStars();

    // Safari detection and optimizations
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.optimizeForSafari();
  }

  // Safari-specific optimizations
  optimizeForSafari() {
    if (this.isSafari) {
      // Disable image smoothing for better performance
      this.ctx.imageSmoothingEnabled = false;

      // Set composite operation for better performance
      this.ctx.globalCompositeOperation = "source-over";

      // Disable alpha blending for better performance
      this.ctx.globalAlpha = 1.0;

      // Reduce star count for Safari
      this.starCount = Math.min(this.starCount, 50);
    }
  }

  generateStars() {
    const stars = [];
    for (let i = 0; i < this.starCount; i++) {
      stars.push({
        x: Math.random() * this.ctx.canvas.width,
        y: Math.random() * this.ctx.canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 50 + 20,
        brightness: Math.random() * 0.5 + 0.5,
      });
    }
    return stars;
  }

  renderBackground(gameTime) {
    // Update star positions
    for (const star of this.stars) {
      star.y += star.speed * 0.016; // Assuming ~60 FPS
      if (star.y > this.ctx.canvas.height) {
        star.y = -5;
        star.x = Math.random() * this.ctx.canvas.width;
      }
    }

    // Draw stars directly if not using CanvasOptimizer offscreen
    if (!window.GameUsesOffscreenStars) {
      for (const star of this.stars) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  renderGameObjects(gameManager) {
    const settings = gameManager.performanceMonitor.getCurrentSettings();

    // Render particles first (background)
    for (const particle of gameManager.getParticles()) {
      particle.render(this.ctx);
    }

    // Render power-ups
    for (const powerUp of gameManager.getPowerUps()) {
      powerUp.render(this.ctx);
    }

    // Render bullets
    for (const bullet of gameManager.getBullets()) {
      bullet.render(this.ctx);
    }

    // Render enemies
    const enemies = gameManager.getEnemies();
    for (const enemy of enemies) {
      if (enemy.active) {
        enemy.render(this.ctx);
      }
    }

    // Render player last (foreground)
    if (gameManager.getPlayer()) {
      gameManager.getPlayer().render(this.ctx);
    }
  }

  renderUI(gameManager) {
    // Render score
    this.ctx.fillStyle = "#00ff88";
    this.ctx.font = "20px Orbitron";
    this.ctx.fillText(`Score: ${gameManager.score}`, 20, 30);

    // Render level
    this.ctx.fillText(`Level: ${gameManager.level}`, 20, 60);

    // Render player health bar
    if (gameManager.getPlayer()) {
      this.renderHealthBar(gameManager.getPlayer());
    }
  }

  renderHealthBar(player) {
    const barWidth = 200;
    const barHeight = 10;
    const x = 20;
    const y = this.ctx.canvas.height - 30;

    // Background
    this.ctx.fillStyle = "#333333";
    this.ctx.fillRect(x, y, barWidth, barHeight);

    // Health
    const healthPercentage = player.getHealthPercentage();
    this.ctx.fillStyle =
      healthPercentage > 0.5
        ? "#00ff00"
        : healthPercentage > 0.25
        ? "#ffff00"
        : "#ff0000";
    this.ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);

    // Border
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, barWidth, barHeight);
  }
}
