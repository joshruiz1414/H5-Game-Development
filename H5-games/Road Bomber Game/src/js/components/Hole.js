class Hole extends Entity {
  constructor(x, y, width, height) {
    super(x, y, width, height);
  }

  draw(ctx) {
    ctx.clearRect(this.x, this.y, this.width, this.height);
  }

  update(scrollSpeed) {
    super.update(scrollSpeed);
  }

  isOffScreen() {
    super.isOffScreen();
  }

  checkCollision(player, canvas, floorY, ceilingY) {
    if (
      player.x >= this.x &&
      player.x + player.width <= this.x + this.width &&
      player.y === floorY &&
      this.y === canvas.height - 20
    ) {
      player.targetY = canvas.height; // Fall down
    } else if (
      player.x >= this.x &&
      player.x + player.width <= this.x + this.width &&
      player.y === ceilingY &&
      this.y === 0
    ) {
      player.targetY = -50; // Fall up
    }
  }
}
