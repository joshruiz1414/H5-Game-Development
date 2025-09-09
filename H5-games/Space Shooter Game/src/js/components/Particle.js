class Particle extends GameObject {
  constructor(x, y, velocityX, velocityY, color, life = 1.0) {
    super(x, y, 2, 2);
    this.tag = "particle";
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.velocity = new Vector2(velocityX, velocityY);
    this.gravity = new Vector2(0, 50);
    this.friction = 0.98;
    this.size = 2 + Math.random() * 3;
    this.alpha = 1.0;
    this.fadeRate = 0.5;
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Apply gravity
    this.velocity = this.velocity.add(this.gravity.multiply(deltaTime));

    // Apply friction
    this.velocity = this.velocity.multiply(this.friction);

    // Update life
    this.life -= deltaTime;
    this.alpha = this.life / this.maxLife;

    // Update size (shrink over time)
    this.size = Math.max(0.5, this.size - deltaTime * 2);

    // Destroy when life is over
    if (this.life <= 0 || this.size <= 0.5) {
      this.destroy();
    }
  }

  render(ctx) {
    if (!this.active) return;

    const gameManager = GameManager.getInstance();
    const settings = gameManager.performanceMonitor.getCurrentSettings();

    ctx.save();
    ctx.globalAlpha = this.alpha;

    // Draw particle with conditional glow effect
    ctx.fillStyle = this.color;

    if (gameManager.performanceMonitor.shouldRenderEffect("glow")) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 5;
    }

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    if (gameManager.performanceMonitor.shouldRenderEffect("glow")) {
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
