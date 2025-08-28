class Enemy extends Entity {
  constructor(x, y, width, height, imgSrc) {
    super(x, y, width, height, imgSrc);
  }

  draw(ctx) {
    super.draw(ctx);
  }

  update(scrollSpeed) {
    super.update(scrollSpeed);
  }

  isOffScreen() {
    super.isOffScreen();
  }

  checkCollision(player) {
    return super.checkCollision(player);
  }
}
