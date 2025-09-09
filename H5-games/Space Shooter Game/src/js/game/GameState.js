class GameState {
  constructor() {
    this.currentState = "menu";
    this.previousState = "menu";
    this.states = {
      menu: "menu",
      playing: "playing",
      paused: "paused",
      gameOver: "gameOver",
    };
  }

  setState(newState) {
    if (this.states[newState]) {
      this.previousState = this.currentState;
      this.currentState = newState;
      this.handleStateChange(newState);
    }
  }

  getCurrentState() {
    return this.currentState;
  }

  isPlaying() {
    return this.currentState === "playing";
  }

  isPaused() {
    return this.currentState === "paused";
  }

  isMenu() {
    return this.currentState === "menu";
  }

  isGameOver() {
    return this.currentState === "gameOver";
  }

  handleStateChange(newState) {
    const gameManager = GameManager.getInstance();

    console.log(`State change: ${this.previousState} -> ${newState}`);

    switch (newState) {
      case "menu":
        this.showMenu();
        break;
      case "playing":
        // Check if we're resuming from pause or starting fresh
        if (this.previousState === "paused") {
          console.log("Resuming from pause - continuing game");
          // Resume from pause - just hide screens and continue
          this.hideAllScreens();
          // Reset the last time to prevent large delta time jump
          gameManager.lastTime = performance.now();
          // Clear any held input
          gameManager.inputManager.clearInputs();
        } else {
          console.log("Starting fresh game");
          // Starting fresh game
          this.hideAllScreens();
          gameManager.startGame();
        }
        break;
      case "paused":
        console.log("Pausing game");
        this.showPauseScreen();
        break;
      case "gameOver":
        this.showGameOverScreen();
        break;
    }
  }

  showMenu() {
    this.hideAllScreens();
    document.getElementById("start-screen").classList.remove("hidden");
  }

  showPauseScreen() {
    this.hideAllScreens();
    document.getElementById("pause-screen").classList.remove("hidden");
  }

  showGameOverScreen() {
    this.hideAllScreens();
    const finalScoreElement = document.getElementById("final-score");
    const gameManager = GameManager.getInstance();
    finalScoreElement.textContent = gameManager.score;
    document.getElementById("game-over-screen").classList.remove("hidden");
  }

  hideAllScreens() {
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => {
      screen.classList.add("hidden");
    });
  }

  updateUI() {
    const gameManager = GameManager.getInstance();

    // Update score
    document.getElementById("score-value").textContent = gameManager.score;

    // Update lives
    if (gameManager.player) {
      document.getElementById("lives-value").textContent =
        gameManager.player.lives;
      // console.log(
      //   `UI Update - Lives: ${gameManager.player.lives}, Level: ${gameManager.level}, Score: ${gameManager.score}`
      // );
    } else {
      console.log("UI Update - No player found!");
    }

    // Update level
    document.getElementById("level-value").textContent = gameManager.level;
  }
}
