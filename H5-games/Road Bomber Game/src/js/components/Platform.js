class Platform extends Entity {
  constructor(x, y, width, height) {
    super(x, y, width, height);
  }

  draw(ctx, color) {
    super.draw(ctx, color);
  }

  update(scrollSpeed) {
    super.update(scrollSpeed);
  }

  isOffScreen() {
    return super.isOffScreen();
  }
  checkCollision(player) {
    return super.checkCollision(player);
  }
}
