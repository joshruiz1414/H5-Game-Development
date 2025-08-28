class Coin extends Entity {
  constructor(x, y, width, height = width, imgSrc) {
    super(x, y, width, height, imgSrc);
    this.collected = false;
  }

  draw(ctx) {
    debugger;
    if (this.collected) return;
    if (this.imgSrc) {
      super.draw(ctx);
    } else {
      this.size = this.width; // Assuming width and height are equal for a coin
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        this.x + this.size / 2,
        this.y + this.size / 2,
        this.size / 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "yellow";
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }
  }

  update(scrollSpeed) {
    super.update(scrollSpeed);
  }

  isOffScreen() {
    return super.isOffScreen();
  }

  checkCollision(player) {
    if (this.collected) return false;
    return super.checkCollision(player);
  }
}
