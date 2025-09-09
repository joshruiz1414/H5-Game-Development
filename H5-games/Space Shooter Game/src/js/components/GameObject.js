class GameObject {
  constructor(x, y, width, height) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.acceleration = new Vector2(0, 0);
    this.width = width;
    this.height = height;
    this.rotation = 0;
    this.active = true;
    this.tag = "";
    this.color = "#ffffff";
  }

  update(deltaTime) {
    // Update velocity based on acceleration
    this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime));

    // Update position based on velocity
    this.position = this.position.add(this.velocity.multiply(deltaTime));

    // Reset acceleration
    this.acceleration = new Vector2(0, 0);
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Default rendering (can be overridden by subclasses)
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    ctx.restore();
  }

  // Check if this object collides with another
  collidesWith(other) {
    if (!this.active || !other.active) return false;

    const thisLeft = this.position.x - this.width / 2;
    const thisRight = this.position.x + this.width / 2;
    const thisTop = this.position.y - this.height / 2;
    const thisBottom = this.position.y + this.height / 2;

    const otherLeft = other.position.x - other.width / 2;
    const otherRight = other.position.x + other.width / 2;
    const otherTop = other.position.y - other.height / 2;
    const otherBottom = other.position.y + other.height / 2;

    return !(
      thisLeft > otherRight ||
      thisRight < otherLeft ||
      thisTop > otherBottom ||
      thisBottom < otherTop
    );
  }

  // Check if point is inside this object
  containsPoint(point) {
    const left = this.position.x - this.width / 2;
    const right = this.position.x + this.width / 2;
    const top = this.position.y - this.height / 2;
    const bottom = this.position.y + this.height / 2;

    return (
      point.x >= left && point.x <= right && point.y >= top && point.y <= bottom
    );
  }

  // Get center point of the object
  getCenter() {
    return this.position.clone();
  }

  // Get bounds as an object
  getBounds() {
    return {
      left: this.position.x - this.width / 2,
      right: this.position.x + this.width / 2,
      top: this.position.y - this.height / 2,
      bottom: this.position.y + this.height / 2,
    };
  }

  // Set position
  setPosition(x, y) {
    this.position.set(x, y);
  }

  // Set velocity
  setVelocity(x, y) {
    this.velocity.set(x, y);
  }

  // Add force (affects acceleration)
  addForce(force) {
    this.acceleration = this.acceleration.add(force);
  }

  // Destroy the object
  destroy() {
    this.active = false;
  }

  // Check if object is off screen
  isOffScreen(canvasWidth, canvasHeight) {
    const bounds = this.getBounds();
    return (
      bounds.right < 0 ||
      bounds.left > canvasWidth ||
      bounds.bottom < 0 ||
      bounds.top > canvasHeight
    );
  }
}
