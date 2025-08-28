class Player {
  constructor(x, y, width, height, transitionSpeed, imgSrc = null) {
    this.starting_y = y;
    this.starting_x = x;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.transitionSpeed = transitionSpeed;

    this.imgSrc = imgSrc;
    this.img = new Image();
    this.img.src = imgSrc;

    this.targetY = y; // Initial targetY is the starting y position
  }

  draw(ctx) {
    if (this.imgSrc) {
      ctx.drawImage(
        this.img,
        this.x - 10,
        this.y - 10,
        this.width + 20,
        this.height + 30
      );
    } else {
      ctx.fillStyle = "blue";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update() {
    // Smooth transition to targetY
    if (Math.abs(this.y - this.targetY) > this.transitionSpeed) {
      if (this.y < this.targetY) {
        this.y += this.transitionSpeed;
      } else {
        this.y -= this.transitionSpeed;
      }
    } else {
      this.y = this.targetY;
    }
  }

  restart() {
    this.y = this.starting_y;
    this.x = this.starting_x;
    this.targetY = this.y;
  }
}
