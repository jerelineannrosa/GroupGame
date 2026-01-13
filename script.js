let mazeLayout = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,0,0,1,0,1,0,0,0,0,1],
  [1,0,1,0,1,1,0,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const maze = document.getElementById("maze");
const rows = mazeLayout.length;
const cols = mazeLayout[0].length;

let playerPos = { x: 1, y: 1 };
const exitPos = { x: 13, y: 13 };
let cells = [];

function generateMaze() {
  mazeLayout = Array.from({length: rows}, () => Array(cols).fill(0));
  // set borders to 1
  for (let x = 0; x < cols; x++) {
    mazeLayout[0][x] = 1;
    mazeLayout[rows-1][x] = 1;
  }
  for (let y = 0; y < rows; y++) {
    mazeLayout[y][0] = 1;
    mazeLayout[y][cols-1] = 1;
  }
  // random walls, lower probability
  for (let y = 1; y < rows-1; y++) {
    for (let x = 1; x < cols-1; x++) {
      if (Math.random() < 0.2) mazeLayout[y][x] = 1;
    }
  }
  // ensure start and exit are 0
  mazeLayout[1][1] = 0;
  mazeLayout[exitPos.y][exitPos.x] = 0;
  // ensure some path around start
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      let ny = 1 + dy, nx = 1 + dx;
      if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) mazeLayout[ny][nx] = 0;
    }
  }
  // ensure some path around exit
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      let ny = exitPos.y + dy, nx = exitPos.x + dx;
      if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) mazeLayout[ny][nx] = 0;
    }
  }
}

function createMaze() {
  maze.innerHTML = "";
  cells = [];

  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
      const div = document.createElement("div");
      div.classList.add("cell");

      if (mazeLayout[y][x] === 1) div.classList.add("wall");

      maze.appendChild(div);
      row.push(div);
    }
    cells.push(row);
  }

  updateVisibility();
}

function playScarySound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime); // low frequency for scary
    gainNode.gain.setValueAtTime(1, audioContext.currentTime); // loud
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1); // 1 second
  } catch (e) {
    // fallback, do nothing
  }
}

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

document.addEventListener("keydown", e => {
  let { x, y } = playerPos;

  if (e.key === "ArrowUp") y--;
  if (e.key === "ArrowDown") y++;
  if (e.key === "ArrowLeft") x--;
  if (e.key === "ArrowRight") x++;

  // ✅ bounds + wall check (FIX)
  if (
    y >= 0 && y < rows &&
    x >= 0 && x < cols &&
    mazeLayout[y][x] === 0
  ) {
    playerPos = { x, y };
  } else {
    // hit wall, die
    playerPos = { x: 1, y: 1 };
    playScarySound();
    const jumpscare = document.getElementById('jumpscare');
    jumpscare.style.display = 'flex';
    setTimeout(() => jumpscare.style.display = 'none', 1000);
  }

  drawPlayer();
  checkWin();
});

function checkWin() {
  if (playerPos.x === exitPos.x && playerPos.y === exitPos.y) {
    alert("You escaped the maze!");
    playerPos = { x: 1, y: 1 };
    drawPlayer();
  }
}

function lightUp() {
  generateMaze();
  // if player is on wall, move to nearby path
  if (mazeLayout[playerPos.y][playerPos.x] === 1) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        let ny = playerPos.y + dy, nx = playerPos.x + dx;
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && mazeLayout[ny][nx] === 0) {
          playerPos = {x: nx, y: ny};
          break;
        }
      }
      if (mazeLayout[playerPos.y][playerPos.x] === 0) break;
    }
  }
  // update classes several times
  cells.forEach((row, y) => row.forEach((cell, x) => {
    if (mazeLayout[y][x] === 1) {
      cell.classList.add("wall");
    } else {
      cell.classList.remove("wall");
    }
  }));
  // set reveal styles
  cells.forEach((row, y) => row.forEach((cell, x) => {
    if (x === playerPos.x && y === playerPos.y) {
      cell.style.background = "yellow";
    } else if (mazeLayout[y][x] === 1) {
      cell.style.background = "#555";
    } else if (x === exitPos.x && y === exitPos.y) {
      cell.style.background = "green";
    } else {
      cell.style.background = "white";
    }
  }));
  setTimeout(() => updateVisibility(), 3000);
}

function startLightUp() {
  setInterval(lightUp, 10000);
}


createMaze();
startLightUp();
