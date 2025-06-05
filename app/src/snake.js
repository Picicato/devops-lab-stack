const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const grid = 20;
let count = 0;

let snake = {
  x: 160,
  y: 160,
  dx: grid,
  dy: 0,
  cells: [],
  maxCells: 4,
  score: 0
};

let apple = {
  x: 320,
  y: 320
};

// Send event to backend
function logEvent(type, payload = {}) {
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, timestamp: Date.now(), ...payload })
  }).catch((err) => console.error("logEvent error:", err));
}

// Random apple position
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Main game loop
function loop() {
  requestAnimationFrame(loop);

  if (++count < 4) return;
  count = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snake.x += snake.dx;
  snake.y += snake.dy;

  // Screen wrap
  if (snake.x < 0) snake.x = canvas.width - grid;
  else if (snake.x >= canvas.width) snake.x = 0;
  if (snake.y < 0) snake.y = canvas.height - grid;
  else if (snake.y >= canvas.height) snake.y = 0;

  // Snake movement
  snake.cells.unshift({ x: snake.x, y: snake.y });
  if (snake.cells.length > snake.maxCells) snake.cells.pop();

  // Draw apple
  ctx.fillStyle = "red";
  ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

  // Draw snake and handle collisions
  ctx.fillStyle = "lime";
  snake.cells.forEach((cell, index) => {
    ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

    // Eat apple
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;
      snake.score++;
      apple.x = getRandomInt(0, 20) * grid;
      apple.y = getRandomInt(0, 20) * grid;

      logEvent("apple_eaten", {
        score: snake.score,
        position: { x: apple.x, y: apple.y }
      });
    }

    // Check self-collision
    for (let i = index + 1; i < snake.cells.length; i++) {
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        logEvent("game_over", { score: snake.score });

        // Reset
        snake.x = 160;
        snake.y = 160;
        snake.dx = grid;
        snake.dy = 0;
        snake.cells = [];
        snake.maxCells = 4;
        snake.score = 0;
        apple.x = getRandomInt(0, 20) * grid;
        apple.y = getRandomInt(0, 20) * grid;
      }
    }
  });
}

// Input handling
document.addEventListener("keydown", (e) => {
  if (e.which === 37 && snake.dx === 0) {
    snake.dx = -grid;
    snake.dy = 0;
  } else if (e.which === 38 && snake.dy === 0) {
    snake.dy = -grid;
    snake.dx = 0;
  } else if (e.which === 39 && snake.dx === 0) {
    snake.dx = grid;
    snake.dy = 0;
  } else if (e.which === 40 && snake.dy === 0) {
    snake.dy = grid;
    snake.dx = 0;
  }
});

// Start loop
requestAnimationFrame(loop);
