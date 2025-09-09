class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = {
      x: 0,
      y: 0,
      left: false,
      right: false,
    };
    this.bindEvents();
  }

  bindEvents() {
    // Keyboard events
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      e.preventDefault();
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
      e.preventDefault();
    });

    // Mouse events
    const canvas = document.getElementById("game-canvas");

    if (!canvas) {
      console.error("Canvas element 'game-canvas' not found!");
      return;
    }

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    // Also bind to document to catch mouse events outside canvas
    document.addEventListener("mousemove", (e) => {
      const canvas = document.getElementById("game-canvas");
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    // Add pointer events to document for trackpad support
    document.addEventListener("pointermove", (e) => {
      const canvas = document.getElementById("game-canvas");
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    // Add document-level mouse events as backup
    document.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.mouse.left = true;
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        this.mouse.left = false;
      }
    });

    // Add touch events for trackpad support
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.mouse.left = true;
    });

    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.mouse.left = false;
    });

    // Add pointer events for better trackpad support
    canvas.addEventListener("pointerdown", (e) => {
      if (e.button === 0) {
        this.mouse.left = true;
      }
    });

    canvas.addEventListener("pointerup", (e) => {
      if (e.button === 0) {
        this.mouse.left = false;
      }
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.mouse.left = true;
      }
      if (e.button === 2) this.mouse.right = true;
      e.preventDefault();
    });

    canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        this.mouse.left = false;
      }
      if (e.button === 2) this.mouse.right = false;
      e.preventDefault();
    });

    // Prevent context menu
    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    // Prevent default behavior for game keys
    document.addEventListener("keydown", (e) => {
      const gameKeys = [
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
      ];
      if (gameKeys.includes(e.code)) {
        e.preventDefault();
      }
    });
  }

  // Check if a key is pressed
  isKeyPressed(keyCode) {
    return this.keys[keyCode] || false;
  }

  // Check if any of the movement keys are pressed
  getMovementVector() {
    let x = 0;
    let y = 0;

    // Horizontal movement only (turret defense)
    if (this.isKeyPressed("KeyA") || this.isKeyPressed("ArrowLeft")) x -= 1;
    if (this.isKeyPressed("KeyD") || this.isKeyPressed("ArrowRight")) x += 1;

    return new Vector2(x, y);
  }

  // Check if shoot key is pressed
  isShootPressed() {
    return this.isKeyPressed("Space") || this.mouse.left;
  }

  // Check if pause key is pressed
  isPausePressed() {
    return this.isKeyPressed("KeyP");
  }

  // Get mouse position
  getMousePosition() {
    return new Vector2(this.mouse.x, this.mouse.y);
  }

  // Clear all inputs (useful for game state changes)
  clearInputs() {
    this.keys = {};
    this.mouse.left = false;
    this.mouse.right = false;
  }
}
