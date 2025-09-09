class CanvasOptimizer {
  constructor(mainCanvas) {
    this.mainCanvas = mainCanvas;
    this.mainCtx = mainCanvas.getContext("2d");

    // Safari-specific optimizations
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Create off-screen canvas for background stars
    this.starCanvas = document.createElement("canvas");
    this.starCanvas.width = mainCanvas.width;
    this.starCanvas.height = mainCanvas.height;
    this.starCtx = this.starCanvas.getContext("2d");

    // Create off-screen canvas for UI elements
    this.uiCanvas = document.createElement("canvas");
    this.uiCanvas.width = mainCanvas.width;
    this.uiCanvas.height = mainCanvas.height;
    this.uiCtx = this.uiCanvas.getContext("2d");

    // Performance settings - more conservative for Safari
    this.enableOffscreenRendering = !this.isSafari; // Disable for Safari
    this.enableBatchRendering = !this.isSafari; // Disable for Safari
    this.lastStarUpdate = 0;
    this.starUpdateInterval = this.isSafari ? 1000 / 15 : 1000 / 30; // Lower FPS for Safari

    // Batch rendering
    this.batchOperations = [];
    this.batchSize = this.isSafari ? 20 : 50; // Smaller batches for Safari

    // Safari-specific context optimizations
    this.optimizeForSafari();
  }

  // Safari-specific optimizations
  optimizeForSafari() {
    if (this.isSafari) {
      // Disable image smoothing for better performance
      this.mainCtx.imageSmoothingEnabled = false;
      this.starCtx.imageSmoothingEnabled = false;
      this.uiCtx.imageSmoothingEnabled = false;

      // Set composite operation for better performance
      this.mainCtx.globalCompositeOperation = "source-over";

      // Disable alpha blending for better performance
      this.mainCtx.globalAlpha = 1.0;
    }
  }

  // Optimize canvas context settings
  optimizeContext(ctx) {
    ctx.imageSmoothingEnabled = false; // Disable anti-aliasing for pixel art
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
  }

  // Clear all canvases
  clear() {
    this.mainCtx.fillStyle = "#000000";
    this.mainCtx.fillRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

    if (this.enableOffscreenRendering) {
      this.starCtx.fillStyle = "#000000";
      this.starCtx.fillRect(
        0,
        0,
        this.starCanvas.width,
        this.starCanvas.height
      );
    }
  }

  // Render background stars to off-screen canvas
  renderStarsToOffscreen(stars, gameTime) {
    if (!this.enableOffscreenRendering) return;

    // Only update stars periodically for performance
    if (gameTime - this.lastStarUpdate < this.starUpdateInterval) {
      return;
    }

    this.lastStarUpdate = gameTime;

    // Clear star canvas
    this.starCtx.fillStyle = "#000000";
    this.starCtx.fillRect(0, 0, this.starCanvas.width, this.starCanvas.height);

    // Render stars
    for (const star of stars) {
      this.starCtx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      this.starCtx.beginPath();
      this.starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.starCtx.fill();
    }
  }

  // Draw off-screen star canvas to main canvas
  drawStarCanvas() {
    if (this.enableOffscreenRendering) {
      this.mainCtx.drawImage(this.starCanvas, 0, 0);
    }
  }

  // Batch rendering for similar objects
  addToBatch(operation) {
    if (!this.enableBatchRendering) {
      operation();
      return;
    }

    this.batchOperations.push(operation);

    if (this.batchOperations.length >= this.batchSize) {
      this.flushBatch();
    }
  }

  flushBatch() {
    if (this.batchOperations.length === 0) return;

    // Group similar operations
    const operations = this.batchOperations.splice(0);

    // Execute all operations
    for (const operation of operations) {
      operation();
    }
  }

  // Optimize image rendering
  drawImageOptimized(ctx, image, x, y, width, height) {
    if (image.complete && image.naturalHeight !== 0) {
      ctx.drawImage(image, x, y, width, height);
    }
  }

  // Pre-render UI elements
  prerenderUI(gameManager) {
    if (!this.enableOffscreenRendering) return;

    // Clear UI canvas
    this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);

    // Render static UI elements
    this.uiCtx.fillStyle = "#00ff88";
    this.uiCtx.font = "20px Orbitron";
    this.uiCtx.fillText(`Score: ${gameManager.score}`, 20, 30);
    this.uiCtx.fillText(`Level: ${gameManager.level}`, 20, 60);
  }

  // Draw UI canvas to main canvas
  drawUICanvas() {
    if (this.enableOffscreenRendering) {
      this.mainCtx.drawImage(this.uiCanvas, 0, 0);
    }
  }

  // Resize all canvases
  resize(width, height) {
    this.mainCanvas.width = width;
    this.mainCanvas.height = height;

    if (this.enableOffscreenRendering) {
      this.starCanvas.width = width;
      this.starCanvas.height = height;
      this.uiCanvas.width = width;
      this.uiCanvas.height = height;
    }
  }

  // Get optimized context
  getContext() {
    return this.mainCtx;
  }

  // Enable/disable optimizations based on performance
  setOptimizationLevel(level) {
    switch (level) {
      case 0: // Low performance
        this.enableOffscreenRendering = false;
        this.enableBatchRendering = false;
        break;
      case 1: // Medium performance
        this.enableOffscreenRendering = true;
        this.enableBatchRendering = false;
        break;
      case 2: // High performance
        this.enableOffscreenRendering = true;
        this.enableBatchRendering = true;
        break;
    }
  }
}
