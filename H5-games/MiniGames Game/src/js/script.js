// Main Game Manager
const GameManager = {
  currentGame: null,
  screens: {
    mainMenu: document.getElementById("main-menu-screen"),
    // Button Game screens
    buttonHome: document.getElementById("button-home-screen"),
    buttonHowToPlay: document.getElementById("button-how-to-play-screen"),
    buttonGame: document.getElementById("button-game-screen"),
    buttonGameOver: document.getElementById("button-game-over-screen"),
    // Snake Game screens
    snakeHome: document.getElementById("snake-home-screen"),
    snakeHowToPlay: document.getElementById("snake-how-to-play-screen"),
    snakeGame: document.getElementById("snake-game-screen"),
    snakeGameOver: document.getElementById("snake-game-over-screen"),
  },

  init() {
    // Play background music when game initializes
    BackgroundMusic.init();

    this.setupMainMenuListeners();
    ButtonGame.init();
    SnakeGame.init();
    this.showScreen("mainMenu");
  },

  showScreen(screenName) {
    // Hide all screens
    Object.values(this.screens).forEach((screen) => {
      screen.classList.remove("active");
    });

    // Show target screen
    this.screens[screenName].classList.add("active");
  },

  setupMainMenuListeners() {
    document
      .getElementById("button-game-select")
      .addEventListener("click", () => {
        this.currentGame = "button";
        this.showScreen("buttonHome");
      });

    document
      .getElementById("snake-game-select")
      .addEventListener("click", () => {
        this.currentGame = "snake";
        this.showScreen("snakeHome");
      });
  },
};

// --- Background Music Module ---
const BackgroundMusic = {
  audio: null,
  isPlaying: false,

  init() {
    this.audio = new Audio("src/assets/audio/Minigame_background_music.mp3");
    this.audio.loop = true;
    this.audio.volume = 0.5;

    // Try to play music after user interaction (required by browsers)
    document.addEventListener("click", this.tryPlay.bind(this), { once: true });
  },

  tryPlay() {
    if (!this.isPlaying) {
      this.audio
        .play()
        .then(() => {
          this.isPlaying = true;
        })
        .catch(() => {
          // Playback failed, will try again on next click
          document.addEventListener("click", this.tryPlay.bind(this), {
            once: true,
          });
        });
    }
  },

  mute() {
    if (this.audio) this.audio.muted = true;
  },

  unmute() {
    if (this.audio) this.audio.muted = false;
  },
};

// Button Game Module
const ButtonGame = {
  state: {
    score: 0,
    timeLeft: 15,
    gameActive: false,
    buttonClickTime: 0,
    gameTimer: null,
    buttonTimeout: null,
    highScore: 0,
    penaltyButtons: [], // Track multiple penalty buttons
  },

  elements: {
    // Button game elements
    buttonStartBtn: document.getElementById("button-start-btn"),
    buttonHowToPlayBtn: document.getElementById("button-how-to-play-btn"),
    buttonBackToMain: document.getElementById("button-back-to-main"),
    buttonBackToHomeBtn: document.getElementById("button-back-to-home-btn"),
    buttonPlayAgainBtn: document.getElementById("button-play-again-btn"),
    buttonBackToMenuBtn: document.getElementById("button-back-to-menu-btn"),
    buttonBackToMainBtn: document.getElementById("button-back-to-main-btn"),
    reactionButton: document.getElementById("reaction-button"),
    penaltyButton: document.getElementById("penalty-button"),
    gameArea: document.getElementById("button-game-area"),
    currentScore: document.getElementById("button-current-score"),
    timeLeft: document.getElementById("button-time-left"),
    finalScore: document.getElementById("button-final-score"),
    highScoreDisplay: document.getElementById("button-high-score-display"),
    newHighScoreMsg: document.getElementById("button-new-high-score"),
  },

  init() {
    this.loadHighScore();
    this.setupEventListeners();
  },

  loadHighScore() {
    const savedHighScore = localStorage.getItem("buttonGameHighScore");
    if (savedHighScore) {
      this.state.highScore = parseInt(savedHighScore);
      this.elements.highScoreDisplay.textContent = this.state.highScore;
    }
  },

  saveHighScore() {
    localStorage.setItem(
      "buttonGameHighScore",
      this.state.highScore.toString()
    );
    this.elements.highScoreDisplay.textContent = this.state.highScore;
  },

  setupEventListeners() {
    this.elements.buttonStartBtn.addEventListener("click", () =>
      this.startGame()
    );
    this.elements.buttonHowToPlayBtn.addEventListener("click", () =>
      GameManager.showScreen("buttonHowToPlay")
    );
    this.elements.buttonBackToMain.addEventListener("click", () =>
      GameManager.showScreen("mainMenu")
    );
    this.elements.buttonBackToHomeBtn.addEventListener("click", () =>
      GameManager.showScreen("buttonHome")
    );
    this.elements.buttonPlayAgainBtn.addEventListener("click", () =>
      this.startGame()
    );
    this.elements.buttonBackToMenuBtn.addEventListener("click", () =>
      GameManager.showScreen("buttonHome")
    );
    this.elements.buttonBackToMainBtn.addEventListener("click", () =>
      GameManager.showScreen("mainMenu")
    );
    this.elements.reactionButton.addEventListener("click", () =>
      this.handleButtonClick()
    );
    this.elements.penaltyButton.addEventListener("click", () =>
      this.handlePenaltyClick()
    );

    // Visual feedback for button clicks
    this.elements.reactionButton.addEventListener("mousedown", () => {
      this.elements.reactionButton.style.transform = "scale(0.9)";
    });
    this.elements.reactionButton.addEventListener("mouseup", () => {
      this.elements.reactionButton.style.transform = "scale(1)";
    });
    this.elements.penaltyButton.addEventListener("mousedown", () => {
      this.elements.penaltyButton.style.transform = "scale(0.9)";
    });
    this.elements.penaltyButton.addEventListener("mouseup", () => {
      this.elements.penaltyButton.style.transform = "scale(1)";
    });
  },

  startGame() {
    this.resetGameState();
    GameManager.showScreen("buttonGame");
    this.state.gameActive = true;

    // Start the game timer
    this.state.gameTimer = setInterval(() => this.updateTimer(), 1000);

    // Show first buttons after a short delay
    setTimeout(() => this.spawnButtons(), 1000);
  },

  resetGameState() {
    this.state.score = 0;
    this.state.timeLeft = 15;
    this.state.gameActive = false;

    // Clear any existing timers
    if (this.state.gameTimer) {
      clearInterval(this.state.gameTimer);
    }
    if (this.state.buttonTimeout) {
      clearTimeout(this.state.buttonTimeout);
    }

    // Update UI
    this.elements.currentScore.textContent = "0";
    this.elements.timeLeft.textContent = "15";
    this.elements.reactionButton.style.display = "none";
    this.elements.penaltyButton.style.display = "none";
  },

  updateTimer() {
    this.state.timeLeft--;
    this.elements.timeLeft.textContent = this.state.timeLeft;

    if (this.state.timeLeft <= 0) {
      this.endGame();
    }
  },

  spawnButtons() {
    if (!this.state.gameActive) return;

    // Hide reaction button
    this.elements.reactionButton.style.display = "none";

    // Remove old penalty buttons
    this.state.penaltyButtons.forEach((btn) => btn.remove());
    this.state.penaltyButtons = [];

    const gameArea = this.elements.gameArea;

    // Get game area dimensions
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;
    const buttonSize = 80;
    const headerHeight = 80;

    // Calculate boundaries for random positioning
    const maxX = areaWidth - buttonSize - 20;
    const maxY = areaHeight - buttonSize - 20;
    const minX = 20;
    const minY = headerHeight + 20;

    // Position reaction button
    let reactionX = Math.random() * (maxX - minX) + minX;
    let reactionY = Math.random() * (maxY - minY) + minY;

    this.elements.reactionButton.style.left = reactionX + "px";
    this.elements.reactionButton.style.top = reactionY + "px";
    this.elements.reactionButton.style.display = "block";
    this.elements.reactionButton.classList.add("button-spawn-animate");
    setTimeout(() => {
      this.elements.reactionButton.classList.remove("button-spawn-animate");
    }, 300);

    // Random number of penalty buttons (1 to 5)
    const penaltyCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < penaltyCount; i++) {
      let penaltyX,
        penaltyY,
        distance,
        attempts = 0;
      do {
        penaltyX = Math.random() * (maxX - minX) + minX;
        penaltyY = Math.random() * (maxY - minY) + minY;
        distance = Math.sqrt(
          Math.pow(penaltyX - reactionX, 2) + Math.pow(penaltyY - reactionY, 2)
        );
        attempts++;
        // Avoid overlap with reaction button and other penalty buttons
        let overlap = this.state.penaltyButtons.some((btn) => {
          return (
            Math.abs(btn.offsetLeft - penaltyX) < buttonSize &&
            Math.abs(btn.offsetTop - penaltyY) < buttonSize
          );
        });
        if (attempts > 20 || (distance >= 120 && !overlap)) break;
      } while (true);

      // Create penalty button element
      const penaltyBtn = document.createElement("button");
      penaltyBtn.className = "penalty-btn button-spawn-animate";
      penaltyBtn.textContent = "Avoid Me!";
      penaltyBtn.style.position = "absolute";
      penaltyBtn.style.left = penaltyX + "px";
      penaltyBtn.style.top = penaltyY + "px";
      penaltyBtn.style.width = buttonSize + "px";
      penaltyBtn.style.height = buttonSize + "px";
      penaltyBtn.style.zIndex = 2;

      // Add click event
      penaltyBtn.addEventListener("click", () => this.handlePenaltyClick());

      // Visual feedback
      penaltyBtn.addEventListener("mousedown", () => {
        penaltyBtn.style.transform = "scale(0.9)";
      });
      penaltyBtn.addEventListener("mouseup", () => {
        penaltyBtn.style.transform = "scale(1)";
      });

      // Remove animation class after animation completes
      setTimeout(() => {
        penaltyBtn.classList.remove("button-spawn-animate");
      }, 300);

      // Add to game area and track
      gameArea.appendChild(penaltyBtn);
      this.state.penaltyButtons.push(penaltyBtn);
    }

    // Record the time when buttons appear
    this.state.buttonClickTime = Date.now();

    // Auto-hide buttons after 3 seconds and spawn new ones
    this.state.buttonTimeout = setTimeout(() => {
      if (this.state.gameActive) {
        this.spawnButtons();
      }
    }, 3000);
  },

  handleButtonClick() {
    if (!this.state.gameActive) return;

    // Calculate reaction time
    const reactionTime = Date.now() - this.state.buttonClickTime;

    // Calculate score based on reaction time
    let points = Math.max(100 - Math.floor(reactionTime / 10), 10);

    // Bonus points for very fast reactions
    if (reactionTime < 300) {
      points += 50;
    } else if (reactionTime < 500) {
      points += 25;
    }

    this.state.score += points;
    this.elements.currentScore.textContent = this.state.score;

    this.hideButtonsAndSpawnNext();
  },

  handlePenaltyClick() {
    if (!this.state.gameActive) return;

    // Deduct 10 points (but don't let score go below 0)
    this.state.score = Math.max(0, this.state.score - 10);
    this.elements.currentScore.textContent = this.state.score;

    this.hideButtonsAndSpawnNext();
  },

  hideButtonsAndSpawnNext() {
    // Hide reaction button
    this.elements.reactionButton.style.display = "none";
    // Remove penalty buttons
    this.state.penaltyButtons.forEach((btn) => btn.remove());
    this.state.penaltyButtons = [];

    // Clear the auto-hide timeout
    if (this.state.buttonTimeout) {
      clearTimeout(this.state.buttonTimeout);
    }

    // Spawn next buttons after a short delay
    setTimeout(() => {
      if (this.state.gameActive) {
        this.spawnButtons();
      }
    }, 200 + Math.random() * 800);
  },

  endGame() {
    this.state.gameActive = false;

    // Clear timers
    if (this.state.gameTimer) {
      clearInterval(this.state.gameTimer);
    }
    if (this.state.buttonTimeout) {
      clearTimeout(this.state.buttonTimeout);
    }

    // Hide reaction button
    this.elements.reactionButton.style.display = "none";
    // Remove penalty buttons
    this.state.penaltyButtons.forEach((btn) => btn.remove());
    this.state.penaltyButtons = [];

    // Update final score
    this.elements.finalScore.textContent = this.state.score;

    // Check for new high score
    let isNewHighScore = false;
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      this.saveHighScore();
      isNewHighScore = true;
    }

    // Show/hide new high score message
    if (isNewHighScore) {
      this.elements.newHighScoreMsg.style.display = "block";
    } else {
      this.elements.newHighScoreMsg.style.display = "none";
    }

    // Show game over screen after a brief delay
    setTimeout(() => {
      GameManager.showScreen("buttonGameOver");
    }, 500);
  },
};

// Snake Game Module
const SnakeGame = {
  state: {
    score: 0,
    gameActive: false,
    highScore: 0,
    snake: [{ x: 200, y: 200 }],
    direction: { x: 0, y: 0 },
    food: { x: 0, y: 0 },
    gameLoop: null,
  },

  elements: {
    snakeStartBtn: document.getElementById("snake-start-btn"),
    snakeHowToPlayBtn: document.getElementById("snake-how-to-play-btn"),
    snakeBackToMain: document.getElementById("snake-back-to-main"),
    snakeBackToHomeBtn: document.getElementById("snake-back-to-home-btn"),
    snakePlayAgainBtn: document.getElementById("snake-play-again-btn"),
    snakeBackToMenuBtn: document.getElementById("snake-back-to-menu-btn"),
    snakeBackToMainBtn: document.getElementById("snake-back-to-main-btn"),
    canvas: document.getElementById("snake-canvas"),
    currentScore: document.getElementById("snake-current-score"),
    snakeLength: document.getElementById("snake-length"),
    finalScore: document.getElementById("snake-final-score"),
    finalLength: document.getElementById("snake-final-length"),
    highScoreDisplay: document.getElementById("snake-high-score-display"),
    newHighScoreMsg: document.getElementById("snake-new-high-score"),
  },

  init() {
    this.ctx = this.elements.canvas.getContext("2d");
    this.gridSize = 20;
    this.tileCount = this.elements.canvas.width / this.gridSize;

    this.loadHighScore();
    this.setupEventListeners();
    this.generateFood();
  },

  loadHighScore() {
    const savedHighScore = localStorage.getItem("snakeGameHighScore");
    if (savedHighScore) {
      this.state.highScore = parseInt(savedHighScore);
      this.elements.highScoreDisplay.textContent = this.state.highScore;
    }
  },

  saveHighScore() {
    localStorage.setItem("snakeGameHighScore", this.state.highScore.toString());
    this.elements.highScoreDisplay.textContent = this.state.highScore;
  },

  setupEventListeners() {
    this.elements.snakeStartBtn.addEventListener("click", () =>
      this.startGame()
    );
    this.elements.snakeHowToPlayBtn.addEventListener("click", () =>
      GameManager.showScreen("snakeHowToPlay")
    );
    this.elements.snakeBackToMain.addEventListener("click", () =>
      GameManager.showScreen("mainMenu")
    );
    this.elements.snakeBackToHomeBtn.addEventListener("click", () =>
      GameManager.showScreen("snakeHome")
    );
    this.elements.snakePlayAgainBtn.addEventListener("click", () =>
      this.startGame()
    );
    this.elements.snakeBackToMenuBtn.addEventListener("click", () =>
      GameManager.showScreen("snakeHome")
    );
    this.elements.snakeBackToMainBtn.addEventListener("click", () =>
      GameManager.showScreen("mainMenu")
    );

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (!this.state.gameActive) return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (this.state.direction.y === 0) {
            this.state.direction = { x: 0, y: -this.gridSize };
          }
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (this.state.direction.y === 0) {
            this.state.direction = { x: 0, y: this.gridSize };
          }
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (this.state.direction.x === 0) {
            this.state.direction = { x: -this.gridSize, y: 0 };
          }
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (this.state.direction.x === 0) {
            this.state.direction = { x: this.gridSize, y: 0 };
          }
          break;
      }
    });
  },

  startGame() {
    this.resetGameState();
    GameManager.showScreen("snakeGame");
    this.state.gameActive = true;

    // Start game loop
    this.state.gameLoop = setInterval(() => this.update(), 150);
  },

  resetGameState() {
    this.state.score = 0;
    this.state.gameActive = false;
    this.state.snake = [{ x: 200, y: 200 }];
    this.state.direction = { x: 0, y: 0 };

    if (this.state.gameLoop) {
      clearInterval(this.state.gameLoop);
    }

    this.generateFood();
    this.updateUI();
    this.draw();
  },

  generateFood() {
    this.state.food = {
      x: Math.floor(Math.random() * this.tileCount) * this.gridSize,
      y: Math.floor(Math.random() * this.tileCount) * this.gridSize,
    };

    // Make sure food doesn't spawn on snake
    for (let segment of this.state.snake) {
      if (segment.x === this.state.food.x && segment.y === this.state.food.y) {
        this.generateFood();
        return;
      }
    }
  },

  update() {
    if (!this.state.gameActive) return;

    // Don't update if snake isn't moving yet
    if (this.state.direction.x === 0 && this.state.direction.y === 0) {
      this.draw(); // Still draw the initial state
      return;
    }

    const head = {
      x: this.state.snake[0].x + this.state.direction.x,
      y: this.state.snake[0].y + this.state.direction.y,
    };

    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= this.elements.canvas.width ||
      head.y < 0 ||
      head.y >= this.elements.canvas.height
    ) {
      this.endGame();
      return;
    }

    // Check self collision
    for (let segment of this.state.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        this.endGame();
        return;
      }
    }

    this.state.snake.unshift(head);

    // Check food collision
    if (head.x === this.state.food.x && head.y === this.state.food.y) {
      this.state.score += 10;
      this.generateFood();
    } else {
      this.state.snake.pop();
    }

    this.updateUI();
    this.draw();
  },

  updateUI() {
    this.elements.currentScore.textContent = this.state.score;
    this.elements.snakeLength.textContent = this.state.snake.length;
  },

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    this.ctx.fillRect(
      0,
      0,
      this.elements.canvas.width,
      this.elements.canvas.height
    );

    // Draw snake
    this.ctx.fillStyle = "#00cec9";
    for (let segment of this.state.snake) {
      this.ctx.fillRect(
        segment.x,
        segment.y,
        this.gridSize - 2,
        this.gridSize - 2
      );
    }

    // Draw food
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.fillRect(
      this.state.food.x,
      this.state.food.y,
      this.gridSize - 2,
      this.gridSize - 2
    );
  },

  endGame() {
    this.state.gameActive = false;

    if (this.state.gameLoop) {
      clearInterval(this.state.gameLoop);
    }

    // Update final score
    this.elements.finalScore.textContent = this.state.score;
    this.elements.finalLength.textContent = this.state.snake.length;

    // Check for new high score
    let isNewHighScore = false;
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      this.saveHighScore();
      isNewHighScore = true;
    }

    // Show/hide new high score message
    if (isNewHighScore) {
      this.elements.newHighScoreMsg.style.display = "block";
    } else {
      this.elements.newHighScoreMsg.style.display = "none";
    }

    // Show game over screen after a brief delay
    setTimeout(() => {
      GameManager.showScreen("snakeGameOver");
    }, 500);
  },
};

// Handle window resize for button game
window.addEventListener("resize", () => {
  if (ButtonGame.state.gameActive) {
    const reactionVisible =
      ButtonGame.elements.reactionButton.style.display === "block";
    const penaltyVisible =
      ButtonGame.elements.penaltyButton.style.display === "block";

    if (reactionVisible || penaltyVisible) {
      const gameArea = ButtonGame.elements.gameArea;
      let needsRepositioning = false;

      if (reactionVisible) {
        const reactionRect =
          ButtonGame.elements.reactionButton.getBoundingClientRect();
        if (
          reactionRect.right > gameArea.clientWidth ||
          reactionRect.bottom > gameArea.clientHeight
        ) {
          needsRepositioning = true;
        }
      }

      if (penaltyVisible) {
        const penaltyRect =
          ButtonGame.elements.penaltyButton.getBoundingClientRect();
        if (
          penaltyRect.right > gameArea.clientWidth ||
          penaltyRect.bottom > gameArea.clientHeight
        ) {
          needsRepositioning = true;
        }
      }

      if (needsRepositioning) {
        ButtonGame.spawnButtons();
      }
    }
  }
});

// Prevent context menu on right click
document.addEventListener("contextmenu", (e) => e.preventDefault());

// Initialize the game manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => GameManager.init());
