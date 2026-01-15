const maze = document.getElementById("maze");

const rows = 15;
const cols = 15;

let mazeLayout = [];
let playerPos = { x: 1, y: 1 };
const exitPos = { x: 13, y: 13 };
let cells = [];
let gameStarted = false;
let lightInterval = null;

/* ---------- MENU ---------- */
function startGame() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("howTo").style.display = "none";
  document.getElementById("game").style.display = "block";

  playerPos = { x: 1, y: 1 };
  generateMaze();
  createMaze();
  drawPlayer();

  gameStarted = true;
  lightInterval = setInterval(lightUp, 10000); // reveal every 10s
}

function showHowTo() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("howTo").style.display = "flex";
}

function backToMenu() {
  document.getElementById("howTo").style.display = "none";
  document.getElementById("menu").style.display = "flex";
}

/* ---------- MAZE GENERATION ---------- */
function generateMaze() {
  mazeLayout = Array.from({ length: rows }, () => Array(cols).fill(0));

  // borders
  for (let x = 0; x < cols; x++) {
    mazeLayout[0][x] = 1;
    mazeLayout[rows - 1][x] = 1;
  }
  for (let y = 0; y < rows; y++) {
    mazeLayout[y][0] = 1;
    mazeLayout[y][cols - 1] = 1;
  }

  // random walls
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      if (Math.random() < 0.22) mazeLayout[y][x] = 1;
    }
  }

  // ensure start and exit
  mazeLayout[1][1] = 0;
  mazeLayout[exitPos.y][exitPos.x] = 0;

  // ensure some space around player
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const ny = playerPos.y + dy, nx = playerPos.x + dx;
      if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) mazeLayout[ny][nx] = 0;
    }
  }

  // ensure some space around exit
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const ny = exitPos.y + dy, nx = exitPos.x + dx;
      if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) mazeLayout[ny][nx] = 0;
    }
  }
}

/* ---------- CREATE GRID ---------- */
function createMaze() {
  // only create the grid once
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

/* ---------- VISIBILITY ---------- */
function updateVisibility() {
  cells.forEach((row, y) => row.forEach((cell, x) => {
    if (x === playerPos.x && y === playerPos.y) {
      cell.style.background = "yellow";
      cell.style.boxShadow = "0 0 20px yellow";
    } else {
      cell.style.background = "black";
      cell.style.boxShadow = "none";
    }
  }));
}

function drawPlayer() {
  updateVisibility();
}

/* ---------- MOVEMENT ---------- */
function movePlayer(dx, dy) {
  if (!gameStarted) return;

  let x = playerPos.x + dx;
  let y = playerPos.y + dy;

  if (
    y >= 0 && y < rows &&
    x >= 0 && x < cols &&
    mazeLayout[y][x] === 0
  ) {
    playerPos = { x, y };
  } else {
    triggerJumpscare();
    playerPos = { x: 1, y: 1 };
  }

  drawPlayer();
  checkWin();
}

document.addEventListener("keydown", e => {
  if (!gameStarted) return;

  if (e.key === "ArrowUp") movePlayer(0,-1);
  if (e.key === "ArrowDown") movePlayer(0,1);
  if (e.key === "ArrowLeft") movePlayer(-1,0);
  if (e.key === "ArrowRight") movePlayer(1,0);
});

/* ---------- EVENTS ---------- */
function checkWin() {
  if (playerPos.x === exitPos.x && playerPos.y === exitPos.y) {
    alert("You escaped!");
    playerPos = { x: 1, y: 1 };
    drawPlayer();
  }
}

function triggerJumpscare() {
  const j = document.getElementById("jumpscare");
  j.style.display = "flex";
  setTimeout(() => j.style.display = "none", 800);
}

/* ---------- LIGHT-UP / REVEAL ---------- */
function lightUp() {
  if (!gameStarted) return;

  generateMaze(); // new maze

  // STEP 1: super dark - only player visible
  cells.forEach((row, y) => row.forEach((cell, x) => {
    if (x === playerPos.x && y === playerPos.y) {
      cell.style.background = "yellow";
      cell.style.boxShadow = "0 0 20px yellow";
    } else {
      cell.style.background = "black";
      cell.style.boxShadow = "none";
    }
  }));

  // STEP 2: briefly reveal maze
  setTimeout(() => {
    cells.forEach((row, y) => row.forEach((cell, x) => {
      if (mazeLayout[y][x] === 1) cell.style.background = "#555"; // walls
      else if (x === exitPos.x && y === exitPos.y) cell.style.background = "green"; // exit
      else cell.style.background = "white"; // path
    }));

    // ensure player is not inside wall
    if (mazeLayout[playerPos.y][playerPos.x] === 1) mazeLayout[playerPos.y][playerPos.x] = 0;

    // STEP 3: after 2s, revert to dark except player
    setTimeout(updateVisibility, 2000);
  }, 100);
}