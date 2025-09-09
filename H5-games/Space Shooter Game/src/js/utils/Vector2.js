class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // Basic operations
  add(vector) {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector) {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  }

  multiply(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  divide(scalar) {
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  // Magnitude and normalization
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2(0, 0);
    return this.divide(mag);
  }

  // Distance between two points
  distance(vector) {
    return this.subtract(vector).magnitude();
  }

  // Dot product
  dot(vector) {
    return this.x * vector.x + this.y * vector.y;
  }

  // Clone
  clone() {
    return new Vector2(this.x, this.y);
  }

  // Set values
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  // Static methods
  static zero() {
    return new Vector2(0, 0);
  }

  static random() {
    return new Vector2(Math.random() - 0.5, Math.random() - 0.5);
  }

  static fromAngle(angle) {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }
}
