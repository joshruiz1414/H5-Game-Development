class SpatialHash {
  constructor(cellSize = 100) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  getKey(x, y) {
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);
    return `${gridX},${gridY}`;
  }

  insert(obj) {
    const key = this.getKey(obj.position.x, obj.position.y);
    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }
    this.grid.get(key).add(obj);
  }

  clear() {
    this.grid.clear();
  }

  getNearby(obj, radius = 100) {
    const nearby = new Set();
    const centerX = obj.position.x;
    const centerY = obj.position.y;

    const minGridX = Math.floor((centerX - radius) / this.cellSize);
    const maxGridX = Math.floor((centerX + radius) / this.cellSize);
    const minGridY = Math.floor((centerY - radius) / this.cellSize);
    const maxGridY = Math.floor((centerY + radius) / this.cellSize);

    for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
      for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
        const key = `${gridX},${gridY}`;
        const cell = this.grid.get(key);
        if (cell) {
          for (const otherObj of cell) {
            if (otherObj !== obj) {
              const dx = otherObj.position.x - centerX;
              const dy = otherObj.position.y - centerY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance <= radius) {
                nearby.add(otherObj);
              }
            }
          }
        }
      }
    }

    return nearby;
  }

  updateObject(obj, oldX, oldY) {
    const oldKey = this.getKey(oldX, oldY);
    const newKey = this.getKey(obj.position.x, obj.position.y);

    if (oldKey !== newKey) {
      const oldCell = this.grid.get(oldKey);
      if (oldCell) {
        oldCell.delete(obj);
        if (oldCell.size === 0) {
          this.grid.delete(oldKey);
        }
      }

      if (!this.grid.has(newKey)) {
        this.grid.set(newKey, new Set());
      }
      this.grid.get(newKey).add(obj);
    }
  }

  removeObject(obj) {
    const key = this.getKey(obj.position.x, obj.position.y);
    const cell = this.grid.get(key);
    if (cell) {
      cell.delete(obj);
      if (cell.size === 0) {
        this.grid.delete(key);
      }
    }
  }
}
