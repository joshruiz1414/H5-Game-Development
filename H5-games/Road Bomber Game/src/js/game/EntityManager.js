class EntityManager {
  constructor(holeWidth, enemySize, spawnInterval) {
    this.holes = [];
    this.enemies = [];
    this.coins = [];
    this.holeWidth = 180;
    this.enemySize = 50;
    this.spawnInterval = 90; // frames
    this.scrollSpeed = 6; //speed of scroll
    this.frameCount = 0;
    this.gameOver = false;
  }

  drawHoles(ctx) {
    this.holes.forEach((hole) => {
      hole.draw(ctx, "#070607ff");
    });
  }

  drawEnemies(ctx) {
    this.enemies.forEach((enemy) => {
      enemy.draw(ctx);
    });
  }

  drawCoins(ctx) {
    this.coins.forEach((coin) => coin.draw(ctx));
  }

  updateEntities(canvasWidth, canvasHeight) {
    // Move holes and enemies
    this.holes.forEach((hole) => {
      hole.update(this.scrollSpeed);
    });
    this.enemies.forEach((enemy) => {
      enemy.update(this.scrollSpeed);
    });

    // Move coins
    this.coins.forEach((coin) => coin.update(this.scrollSpeed));

    // Remove off-screen holes and enemies
    while (this.holes.length && this.holes[0].isOffScreen()) this.holes.shift();
    while (this.enemies.length && this.enemies[0].isOffScreen())
      this.enemies.shift();

    // Remove off-screen coins
    while (this.coins.length && this.coins[0].isOffScreen()) this.coins.shift();

    // Spawn new holes/enemies
    const minHoleWidth = 50;
    const maxHoleWidth = 850;
    this.frameCount++;
    // increase scroll speed every 500 frames
    if (this.frameCount % 500 === 0 && this.scrollSpeed < 25) {
      this.scrollSpeed += 1; // increase but cap at 30
    }

    // spawn interval rate
    if (this.frameCount % 1000 === 0 && this.spawnInterval > 30) {
      this.spawnInterval -= 10; // decrease but cap at 30
    }

    if (this.frameCount % this.spawnInterval === 0) {
      // Randomly decide to spawn a hole or enemy
      if (Math.random() < 0.5) {
        // Hole
        const newHoleY = Math.random() < 0.5 ? canvasHeight - 20 : 0;
        const newHoleWidth = Math.floor(
          Math.random() * (maxHoleWidth - minHoleWidth + 1) + minHoleWidth
        );

        if (!isHoleOverlap(canvasWidth, newHoleY, newHoleWidth, this.holes)) {
          const newHole = new Hole(canvasWidth, newHoleY, newHoleWidth, 20);
          // should not create until check if overlap
          this.holes.push(newHole);
        }
      } else {
        // Enemy
        const enemy_img_path = "src/assets/images/red_bomb.png";
        const max_height = 20;
        const min_height = canvasHeight - 20 - this.enemySize;
        let newEnemyY =
          Math.random() * (min_height - max_height + 1) + max_height; // avoid spawning too close to edges
        let newEnemyX =
          Math.random() * (100 + canvasWidth - canvasWidth) + canvasWidth;
        if (
          !isEnemyOverlap(canvasWidth, newEnemyY, this.enemies, this.enemySize)
        ) {
          const newEnemy = new Enemy(
            canvasWidth,
            newEnemyY,
            this.enemySize,
            this.enemySize,
            enemy_img_path
          );
          this.enemies.push(newEnemy);
        }

        if (Math.random() < 0.8) {
          let num_enemies_to_create = Math.floor(Math.random() * (4 - 1) + 1);
          for (
            let num_enemies = 0;
            num_enemies < num_enemies_to_create;
            num_enemies++
          ) {
            let newEnemyY =
              Math.random() * (min_height - max_height + 1) + max_height; // avoid spawning too close to edges
            let newEnemyX =
              Math.random() * (100 + canvasWidth - canvasWidth) + canvasWidth;
            if (
              !isEnemyOverlap(
                newEnemyX,
                newEnemyY,
                this.enemies,
                this.enemySize
              )
            ) {
              const newEnemy = new Enemy(
                newEnemyX,
                newEnemyY,
                this.enemySize,
                this.enemySize,
                enemy_img_path
              );
              this.enemies.push(newEnemy);
            }
          }
        }
      }
    }
    let num_coins_to_spawn = Math.random() * (5 - 1) + 1;
    // Spawn coins occasionally
    if (this.frameCount % 120 === 0) {
      for (let i = 0; i < num_coins_to_spawn; i++) {
        const coinY =
          Math.random() * (canvasHeight - 40 - this.enemySize - 40) + 40; // near ceiling
        const coinX =
          Math.random() * (150 + canvasWidth - canvasWidth) + canvasWidth;
        if (
          !isCoinOverlap(
            coinX,
            coinY,
            40,
            this.coins,
            this.enemies,
            this.enemySize
          )
        ) {
          const newCoin = new Coin(
            coinX,
            coinY,
            40,
            40,
            "src/assets/images/coin_image.png"
          );
          this.coins.push(newCoin);
        }
      }
    }

    return this.scrollSpeed;
  }

  checkCollisions(player, canvas, floorY, ceilingY) {
    // Check if player is over a hole (on the floor)

    this.holes.forEach((hole) => {
      hole.checkCollision(player, canvas, floorY, ceilingY);
    });
    // Game over if player falls below canvas
    if (player.y >= canvas.height || player.y <= 0) {
      return true;
    }

    // Check collision with enemies
    for (const enemy of this.enemies) {
      if (enemy.checkCollision(player)) {
        return true;
      }
    }

    return false;
  }

  checkCoinCollection(player) {
    let collectedCount = 0;
    this.coins.forEach((coin) => {
      if (coin.checkCollision(player)) {
        coin.collected = true;
        collectedCount++;
      }
    });
    return collectedCount;
  }

  restart() {
    this.holes = [];
    this.enemies = [];
    this.coins = [];
    this.frameCount = 0;
    this.gameOver = false;
    this.scrollSpeed = 6;
    this.spawnInterval = 90;
  }
}

function isHoleOverlap(newHoleX, newHoleY, newHoleWidth, holes) {
  return holes.some(
    (hole) =>
      newHoleX < hole.x + hole.width &&
      newHoleX + newHoleWidth > hole.x &&
      newHoleY === hole.y
  );
}

function isEnemyOverlap(newEnemyX, newEnemY, enemies, enemySize) {
  return enemies.some(
    (enemy) =>
      newEnemyX < enemy.x + enemySize &&
      newEnemyX + enemySize > enemy.x &&
      newEnemY < enemy.y + enemySize &&
      newEnemY + enemySize > enemy.y
  );
}

function isCoinOverlap(coinX, coinY, coinSize, coins, enemies, enemySize) {
  // Check overlap with existing coins
  const coinOverlap = coins.some(
    (coin) =>
      !coin.collected &&
      coinX < coin.x + coin.width &&
      coinX + coinSize > coin.x &&
      coinY < coin.y + coin.width &&
      coinY + coinSize > coin.y
  );
  // Check overlap with enemies
  const enemyOverlap = enemies.some(
    (enemy) =>
      coinX < enemy.x + enemySize &&
      coinX + coinSize > enemy.x &&
      coinY < enemy.y + enemySize &&
      coinY + coinSize > enemy.y
  );
  return coinOverlap || enemyOverlap;
}
