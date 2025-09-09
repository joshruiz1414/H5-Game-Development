class PerformanceMonitor {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.frameCount = 0;
    this.lastFpsTime = 0;
    this.fps = 60;
    this.frameTimes = [];
    this.maxFrameTimeHistory = 60;

    // Safari detection
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Performance settings - more conservative for Safari
    this.qualityLevel = this.isSafari ? 0 : 1; // Start with low quality on Safari
    this.targetFps = this.isSafari ? 30 : 60; // Lower target FPS for Safari
    this.minFps = this.isSafari ? 20 : 30; // Lower minimum FPS for Safari

    // Quality settings - more conservative for Safari
    this.qualitySettings = {
      0: {
        // Low quality - optimized for Safari
        maxParticles: this.isSafari ? 50 : 100,
        maxBullets: this.isSafari ? 50 : 100,
        maxEnemies: this.isSafari ? 10 : 20,
        starCount: this.isSafari ? 25 : 50,
        enableShadows: false,
        enableGlow: false,
        particleSize: 1,
      },
      1: {
        // Medium quality
        maxParticles: this.isSafari ? 50 : 100,
        maxBullets: this.isSafari ? 100 : 200,
        maxEnemies: this.isSafari ? 15 : 30,
        starCount: this.isSafari ? 50 : 100,
        enableShadows: false,
        enableGlow: this.isSafari ? false : true,
        particleSize: this.isSafari ? 1 : 2,
      },
      2: {
        // High quality - disabled for Safari
        maxParticles: this.isSafari ? 75 : 200,
        maxBullets: this.isSafari ? 150 : 300,
        maxEnemies: this.isSafari ? 20 : 50,
        starCount: this.isSafari ? 75 : 150,
        enableShadows: false,
        enableGlow: this.isSafari ? false : true,
        particleSize: this.isSafari ? 1 : 3,
      },
    };
  }

  update(currentTime) {
    this.frameCount++;

    if (currentTime - this.lastFpsTime >= 1000) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastFpsTime)
      );
      this.frameCount = 0;
      this.lastFpsTime = currentTime;

      // Adjust quality based on performance
      this.adjustQuality();
    }

    // Track frame time
    const frameTime = currentTime - this.lastFpsTime;
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxFrameTimeHistory) {
      this.frameTimes.shift();
    }
  }

  adjustQuality() {
    const avgFrameTime =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const currentFps = 1000 / avgFrameTime;

    const oldLevel = this.qualityLevel;

    if (currentFps < this.minFps && this.qualityLevel > 0) {
      // Lower quality
      this.qualityLevel--;
      console.log(
        `Performance drop detected. Lowering quality to level ${this.qualityLevel}`
      );
    } else if (currentFps > this.targetFps + 10 && this.qualityLevel < 2) {
      // Raise quality
      this.qualityLevel++;
      console.log(
        `Good performance. Raising quality to level ${this.qualityLevel}`
      );
    }

    // Update canvas optimizer if level changed
    if (oldLevel !== this.qualityLevel) {
      if (this.gameManager && this.gameManager.canvasOptimizer) {
        this.gameManager.canvasOptimizer.setOptimizationLevel(
          this.qualityLevel
        );
      }
    }
  }

  getCurrentSettings() {
    return this.qualitySettings[this.qualityLevel];
  }

  getFps() {
    return this.fps;
  }

  getQualityLevel() {
    return this.qualityLevel;
  }

  shouldRenderEffect(effectType) {
    const settings = this.getCurrentSettings();

    switch (effectType) {
      case "shadow":
        return settings.enableShadows;
      case "glow":
        return settings.enableGlow;
      default:
        return true;
    }
  }

  canSpawnObject(objectType) {
    const settings = this.getCurrentSettings();
    const gameManager = this.gameManager;

    switch (objectType) {
      case "particle":
        return gameManager.particles.length < settings.maxParticles;
      case "bullet":
        return gameManager.bullets.length < settings.maxBullets;
      case "enemy":
        return gameManager.enemies.length < settings.maxEnemies;
      default:
        return true;
    }
  }
}
