const maze = document.getElementById("maze");

/* ---------- CONSTANTS ---------- */
const rows = 15;
const cols = 15;
const exitPos = { x: 13, y: 13 };

const difficultySettings = {
  easy:   { wallChance: 0.12 },
  normal: { wallChance: 0.22 },
  hard:   { wallChance: 0.35 }
};

/* ---------- GAME STATE ---------- */
let mazeLayout = [];
let cells = [];
let playerPos = { x: 1, y: 1 };

let level = 1;
let timeLeft = 60;
let timerInterval = null;
let lightInterval = null;
let gameStarted = false;
let currentDifficulty = "normal";

/* ---------- MENU ---------- */
function startGame() {
  currentDifficulty = document.getElementById("difficulty").value;

  level = 1;
  gameStarted = true;

  document.getElementById("menu").style.display = "none";
  document.getElementById("howTo").style.display = "none";
  document.getElementById("game").style.display = "block";

  setupLevel();
  lightInterval = setInterval(lightUp, 10000);
}

function showHowTo() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("howTo").style.display = "flex";
}

function backToMenu() {
  document.getElementById("howTo").style.display = "none";
  document.getElementById("menu").style.display = "flex";
}

/* ---------- LEVEL ---------- */
function setupLevel() {
  playerPos = { x: 1, y: 1 };

  // Time decreases per level
  timeLeft = Math.max(60 - (level - 1) * 10, 20);

  document.getElementById("levelText").textContent = `Level: ${level}`;
  document.getElementById("timeText").textContent = `Time: ${timeLeft}`;

  generateMaze();
  createMaze();
  drawPlayer();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timeText").textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0) gameOver();
  }, 1000);
}

/* ---------- MAZE GENERATION ---------- */
function generateMaze() {
  mazeLayout = Array.from({ length: rows }, () => Array(cols).fill(1));

  // Clear borders
  for (let i = 0; i < rows; i++) {
    mazeLayout[0][i] = mazeLayout[rows - 1][i] = 1;
    mazeLayout[i][0] = mazeLayout[i][cols - 1] = 1;
  }

  // --- STEP 1: carve guaranteed path ---
  let x = 1;
  let y = 1;
  mazeLayout[y][x] = 0;

  while (x !== exitPos.x || y !== exitPos.y) {
    if (Math.random() < 0.5 && x < exitPos.x) x++;
    else if (y < exitPos.y) y++;
    mazeLayout[y][x] = 0;
  }

  // --- STEP 2: add walls based on difficulty ---
  const chance = difficultySettings[currentDifficulty].wallChance;

  for (let yy = 1; yy < rows - 1; yy++) {
    for (let xx = 1; xx < cols - 1; xx++) {
      if (mazeLayout[yy][xx] === 0) continue; // keep path
      if (Math.random() < chance) mazeLayout[yy][xx] = 1;
      else mazeLayout[yy][xx] = 0;
    }
  }

  // Ensure start & exit are clear
  mazeLayout[1][1] = 0;
  mazeLayout[exitPos.y][exitPos.x] = 0;

  // Clear space around start
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      mazeLayout[1 + dy][1 + dx] = 0;
    }
  }
}

/* ---------- GRID ---------- */
// only create the grid once
function createMaze() {
  if (cells.length > 0) return;

  maze.innerHTML = "";
  cells = [];

  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (mazeLayout[y][x] === 1) cell.classList.add("wall");
      maze.appendChild(cell);
      row.push(cell);
    }
    cells.push(row);
  }
}

/* ---------- PLAYER ---------- */
function drawPlayer() {
  cells.forEach((row, y) =>
    row.forEach((cell, x) => {
      cell.style.background = "black";
      cell.style.boxShadow = "none";

      if (x === playerPos.x && y === playerPos.y) {
        cell.style.background = "yellow";
        cell.style.boxShadow = "0 0 20px yellow";
      }
    })
  );
}

function movePlayer(dx, dy) {
  if (!gameStarted) return;

  const nx = playerPos.x + dx;
  const ny = playerPos.y + dy;

  if (mazeLayout[ny][nx] === 0) {
    playerPos = { x: nx, y: ny };
  } else {
    triggerJumpscare();
    playerPos = { x: 1, y: 1 };
  }

  drawPlayer();
  checkWin();
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") movePlayer(0, -1);
  if (e.key === "ArrowDown") movePlayer(0, 1);
  if (e.key === "ArrowLeft") movePlayer(-1, 0);
  if (e.key === "ArrowRight") movePlayer(1, 0);
});

/* ---------- EVENTS ---------- */
function checkWin() {
  if (playerPos.x === exitPos.x && playerPos.y === exitPos.y) {
    level++;
    setupLevel();
  }
}

function gameOver() {
  clearInterval(timerInterval);
  clearInterval(lightInterval);
  gameStarted = false;

  alert("Time's up! Game Over.");

  document.getElementById("game").style.display = "none";
  document.getElementById("menu").style.display = "flex";
}

function triggerJumpscare() {
  const j = document.getElementById("jumpscare");
  j.style.display = "flex";

  setTimeout(() => {
    j.style.display = "none";
  }, 700);
}


/* ---------- LIGHT REVEAL ---------- */
function lightUp() {
  if (!gameStarted) return;

  cells.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (mazeLayout[y][x] === 1) cell.style.background = "#555";
      else if (x === exitPos.x && y === exitPos.y) cell.style.background = "green";
      else cell.style.background = "white";
    })
  );

  setTimeout(drawPlayer, 2000);
}

