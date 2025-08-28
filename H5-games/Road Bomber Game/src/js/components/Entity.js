class Entity {
  constructor(x, y, width, height, imgSrc = null) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.imgSrc = imgSrc;
    this.img = null;

    if (imgSrc) {
      this.img = new Image();
      this.img.src = imgSrc;
    }
  }

  draw(ctx, color) {
    if (this.imgSrc) {
      ctx.drawImage(
        this.img,
        this.x,
        this.y,
        this.width + 10,
        this.height + 10
      );
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update(scrollSpeed) {
    this.x -= scrollSpeed;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  checkCollision(player) {
    // Use circular hitboxes
    const entityCenterX = this.x + this.width / 2;
    const entityCenterY = this.y + this.height / 2;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    const dx = entityCenterX - playerCenterX;
    const dy = entityCenterY - playerCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Use radius as half the width (assuming width == height)
    const entityRadius = this.width / 2;
    const playerRadius = player.width / 2;

    return distance < entityRadius + playerRadius;
  }
}
