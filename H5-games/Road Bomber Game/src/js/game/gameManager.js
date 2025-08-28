const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");
const player = new Player(
  200,
  20,
  30,
  30,
  12,
  "src/assets/images/Car_right.png"
);
const entity = new EntityManager(180, 50, 90);
const floor = new Platform(0, canvas.height - 20, canvas.width, 20);
const ceiling = new Platform(0, 0, canvas.width, 20);
let ceilingY = 20;
let floorY = canvas.height - player.height - 20;

let gameOver = false;
let distance = 0;
let scrollSpeed = 0;
let distanceHighScore = 0;
let coinsHighScore = 0;
let coinsCollected = 0;

const distanceHUD = document.getElementById("distanceHUD");
const distanceText = document.getElementById("distanceText");
const coinsText = document.getElementById("coinsText");

const gameOverScreen = document.getElementById("gameOverScreen");
const highScoreTextDistance = document.getElementById("highScoreTextDistance");
const highScoreTextCoins = document.getElementById("highScoreTextCoins");
const playAgainBtn = document.getElementById("playAgainBtn");
const mainMenuBtn = document.getElementById("mainMenuBtn");

const bgMusic = document.getElementById("bgMusic");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ceilingY = 20;
  floorY = canvas.height - player.height - 20;
  // Update platform sizes
  floor.x = 0;
  floor.y = canvas.height - 20;
  floor.width = canvas.width;
  floor.height = 20;

  ceiling.x = 0;
  ceiling.y = 0;
  ceiling.width = canvas.width;
  ceiling.height = 20;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // call once at start

function drawFloorAndCeiling() {
  // Floor
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
  // Ceiling
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(0, 0, canvas.width, 20);
}

function showGameOverScreen() {
  highScoreTextDistance.textContent =
    "Distance HighScore: " + Math.floor(distanceHighScore);
  highScoreTextCoins.textContent =
    "Coins HighScore: " + Math.floor(coinsHighScore);
  gameOverScreen.classList.remove("hidden");
  if (bgMusic) bgMusic.pause();
}

function hideGameOverScreen() {
  gameOverScreen.classList.add("hidden");
  canvas.style.display = "block";
}

function startGame() {
  if (bgMusic) {
    bgMusic.volume = 0.5; // Optional: set volume
    bgMusic.play();
  }
  update();
}

function update() {
  if (gameOver) {
    // Update high score if needed
    if (distance > distanceHighScore) {
      distanceHighScore = distance;
    }
    if (coinsCollected > coinsHighScore) {
      coinsHighScore = coinsCollected;
    }
    distanceHUD.classList.add("hidden");
    showGameOverScreen();
    return;
  }
  //update entities
  scrollSpeed = entity.updateEntities(canvas.width, canvas.height);
  gameOver = entity.checkCollisions(player, canvas, floorY, ceilingY);
  //update player
  player.update();
  //floor.update(scrollSpeed);
  //ceiling.update(scrollSpeed);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //drawFloorAndCeiling();
  ceiling.draw(ctx, "blue");
  floor.draw(ctx, "green");

  //draw entities
  entity.drawHoles(ctx);
  entity.drawEnemies(ctx);
  entity.drawCoins(ctx); // Draw coins
  player.draw(ctx);

  // Coin collection
  coinsCollected += entity.checkCoinCollection(player);

  distance += scrollSpeed * 0.01;

  // Update HUD

  // Update values
  distanceText.textContent = `Distance: ${Math.floor(distance)}`;
  coinsText.textContent = `Coins: ${coinsCollected}`;

  // Show HUD if hidden
  distanceHUD.classList.remove("hidden");

  requestAnimationFrame(update);
}

document.addEventListener("keydown", function (event) {
  // Only handle spacebar if game is not over
  if (event.code === "Space" && !gameOver) {
    event.preventDefault(); // prevent scrolling
    // Toggle targetY between ceiling and floor
    player.targetY = player.targetY === floorY ? ceilingY : floorY;
  }
});

// Button event listeners:
playAgainBtn.addEventListener("click", function () {
  hideGameOverScreen();
  resizeCanvas();
  entity.restart();
  player.restart();
  coinsCollected = 0;
  distance = 0;
  gameOver = false;
  if (bgMusic) bgMusic.play();
  update();
});

mainMenuBtn.addEventListener("click", function () {
  document.location.reload();
});
