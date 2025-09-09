// Main game initialization
document.addEventListener("DOMContentLoaded", () => {
  console.log("Space Shooter H5 Game - Initializing...");

  // Initialize the game manager
  const gameManager = GameManager.getInstance();

  // Add some additional event listeners for better UX
  document.addEventListener("keydown", (e) => {
    // Prevent default behavior for game keys
    if (
      [
        "Space",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "KeyP",
      ].includes(e.code)
    ) {
      e.preventDefault();
    }

    // Start background music on first key press
    if (
      window.audioManager &&
      window.audioManager.audioContext &&
      window.audioManager.audioContext.state === "suspended"
    ) {
      window.audioManager.resumeAudioContext();
    }
  });

  // Add touch support for mobile
  let touchStartX = 0;
  let touchStartY = 0;

  gameManager.canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    // Start background music on first touch
    if (
      window.audioManager &&
      window.audioManager.audioContext &&
      window.audioManager.audioContext.state === "suspended"
    ) {
      window.audioManager.resumeAudioContext();
    }
  });

  gameManager.canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // Move player based on touch
    if (gameManager.player && gameManager.player.active) {
      const newX = gameManager.player.position.x + deltaX * 0.5;
      const newY = gameManager.player.position.y + deltaY * 0.5;
      gameManager.player.setPosition(newX, newY);
    }

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  });

  gameManager.canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    // Shoot on touch end
    if (gameManager.player && gameManager.player.active) {
      gameManager.player.shoot();
    }
  });

  // Add click handler to start audio context
  gameManager.canvas.addEventListener("click", () => {
    if (window.audioManager) {
      window.audioManager.resumeAudioContext();
    }
  });

  // Add music toggle button handler
  document.getElementById("music-toggle-btn").addEventListener("click", () => {
    if (window.audioManager) {
      const isEnabled = window.audioManager.toggleMusic();
      updateMusicButtonText("music-toggle-btn", isEnabled);
    }
  });

  // Add pause screen music toggle button handler
  document
    .getElementById("music-toggle-btn-pause")
    .addEventListener("click", () => {
      if (window.audioManager) {
        const isEnabled = window.audioManager.toggleMusic();
        updateMusicButtonText("music-toggle-btn-pause", isEnabled);
        // Also update the main menu button to stay in sync
        updateMusicButtonText("music-toggle-btn", isEnabled);
      }
    });

  // Helper function to update music button text
  function updateMusicButtonText(buttonId, isEnabled) {
    const button = document.getElementById(buttonId);
    if (button) {
      if (isEnabled) {
        button.textContent = "🎵 MUSIC: ON";
        button.style.background = "";
      } else {
        button.textContent = "🎵 MUSIC: OFF";
        button.style.background = "#666666";
      }
    }
  }

  // Add window focus/blur handling
  window.addEventListener("blur", () => {
    if (gameManager.gameState.isPlaying()) {
      gameManager.gameState.setState("paused");
    }
  });

  // Add performance monitoring
  let frameCount = 0;
  let lastFpsTime = 0;

  function updateFPS(currentTime) {
    frameCount++;
    if (currentTime - lastFpsTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsTime));
      console.log(`FPS: ${fps}`, "there is no fps");
      frameCount = 0;
      lastFpsTime = currentTime;
    }
  }

  // Override the game loop to include FPS monitoring
  const originalGameLoop = gameManager.gameLoop;
  gameManager.gameLoop = function (currentTime = 0) {
    updateFPS(currentTime);
    originalGameLoop.call(this, currentTime);
  };

  console.log("Space Shooter H5 Game - Ready!");
  console.log("Controls:");
  console.log("- WASD or Arrow Keys: Move");
  console.log("- Spacebar or Mouse Click: Shoot");
  console.log("- P: Pause");
  console.log("- Touch/Mobile: Drag to move, tap to shoot");
});

// Add some utility functions for debugging
window.gameDebug = {
  spawnEnemy: (type = "basic") => {
    const gameManager = GameManager.getInstance();
    const canvas = gameManager.canvas;
    const x = Math.random() * (canvas.width - 60) + 30;
    const y = -30;
    const enemy = new Enemy(x, y, type);
    gameManager.addEnemy(enemy);
  },

  spawnPowerUp: (type = "health") => {
    const gameManager = GameManager.getInstance();
    const canvas = gameManager.canvas;
    const x = Math.random() * (canvas.width - 40) + 20;
    const y = -20;
    const powerUp = new PowerUp(x, y, type);
    gameManager.addPowerUp(powerUp);
  },

  getGameState: () => {
    const gameManager = GameManager.getInstance();
    return {
      score: gameManager.score,
      level: gameManager.level,
      playerHealth: gameManager.player ? gameManager.player.health : 0,
      enemies: gameManager.enemies.length,
      bullets: gameManager.bullets.length,
      particles: gameManager.particles.length,
    };
  },
};

// Add error handling
window.addEventListener("error", (e) => {
  console.error("Game Error:", e.error);
});

// Add unhandled promise rejection handling
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled Promise Rejection:", e.reason);
});
