// Variables globales
let board = Array(9).fill(null);
let currentPlayer = "X";
let gameMode = "1v1"; // "1v1" o "1vIA"
let difficulty = "easy"; // "easy", "medium", "hard"
let timer;
let timeLeft = 10; // Tiempo en segundos por turno
const scores = { X: 0, O: 0 };

// Crear el tablero
function createBoard() {
  const boardElement = document.getElementById("board");
  boardElement.innerHTML = "";
  board.forEach((cell, index) => {
    const cellElement = document.createElement("li");
    cellElement.className = "cell";
    cellElement.textContent = cell;
    cellElement.onclick = () => makeMove(index);
    boardElement.appendChild(cellElement);
  });
  updateScores();
}

// Actualizar puntajes
function updateScores() {
  document.getElementById("scoreX").textContent = `X: ${scores.X}`;
  document.getElementById("scoreO").textContent = `O: ${scores.O}`;
}

// Verificar ganador
function checkWinner(boardState = board) {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
    [0, 4, 8], [2, 4, 6]             // Diagonales
  ];
  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return [boardState[a], combo];
    }
  }
  return null;
}

// Mover jugador
function makeMove(index) {
  if (board[index] || checkWinner(board)) return;

  board[index] = currentPlayer;
  createBoard();

  if (checkWinner(board)) {
    endGame(`${currentPlayer} gana`);
    scores[currentPlayer]++;
    return;
  }

  if (board.every(cell => cell !== null)) {
    endGame("Empate");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";

  if (gameMode === "1vIA" && currentPlayer === "O") {
    setTimeout(aiMove, 500); // Retraso simulado para la IA
  }

  resetTimer();
  startTimer();
}

// Terminar el juego
function endGame(message) {
  alert(message);
  saveGameRecord(message);
  board = Array(9).fill(null);
  currentPlayer = "X";
  document.querySelectorAll("input[name='gameMode']").forEach(radio => {
    radio.checked = false;
  });
  createBoard();
  resetTimer();
}

// Movimiento de la IA
function aiMove() {
  const emptyCells = board.map((cell, index) => (cell === null ? index : null)).filter(x => x !== null);

  if (difficulty === "easy") {
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[randomIndex] = "O";
  } else if (difficulty === "medium") {
    for (const index of emptyCells) {
      board[index] = "O";
      if (checkWinner(board)) return (board[index] = "O");
      board[index] = "X";
      if (checkWinner(board)) return (board[index] = "O");
      board[index] = null;
    }
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[randomIndex] = "O";
  } else {
    const bestMove = minimax([...board], 0, true);
    board[bestMove.index] = "O";
  }

  currentPlayer = "X";
  createBoard();
}

// Algoritmo Minimax
function minimax(newBoard, depth, isMaximizing) {
  const winner = checkWinner(newBoard);
  if (winner) {
    return winner[0] === "X" ? -10 + depth : 10 - depth; // Penalización por profundidad
  }
  if (newBoard.every(cell => cell !== null)) return 0; // Empate

  const scores = [];
  const emptyCells = newBoard.map((cell, index) => (cell === null ? index : null)).filter(x => x !== null);

  emptyCells.forEach(index => {
    newBoard[index] = isMaximizing ? "O" : "X";
    const score = minimax(newBoard, depth + 1, !isMaximizing);
    scores.push({ index, score });
    newBoard[index] = null;
  });

  if (isMaximizing) {
    return depth === 0 ? scores.reduce((best, move) => (move.score > best.score ? move : best), scores[0]) : Math.max(...scores.map(s => s.score));
  } else {
    return Math.min(...scores.map(s => s.score));
  }
}

// Cronómetro
function startTimer() {
  const timerElement = document.getElementById("timer");
  timerElement.textContent = `Tiempo restante: ${timeLeft} segundos`;
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `Tiempo restante: ${timeLeft} segundos`;
    if (timeLeft === 0) {
      clearInterval(timer);
      endGame(`${currentPlayer} pierde por tiempo`);
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 10;
  const timerElement = document.getElementById("timer");
  timerElement.textContent = "";
}

// Cambiar modo de juego
const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
gameModeRadios.forEach(radio => {
  radio.addEventListener("change", (e) => {
    if (e.target.checked) {
      setGameMode(radio.value);
    }
  });
});

function setGameMode(mode) {

  gameMode = mode;
  board = Array(9).fill(null);
  createBoard();
  if (mode === "1vIA") {
    aiMove();
  }
}

// Cambiar dificultad

const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
difficultyRadios.forEach(radio => {
  radio.addEventListener("change", (e) => {
    setDifficulty(radio.id);
  });
});

function setDifficulty(level) {
  difficulty = level;
  board = Array(9).fill(null);
  currentPlayer = "X";
  document.querySelector(`input[name="difficulty"][id="${level}"]`).checked = true;
}

// Cambiar tema
document.querySelector("#btnTheme").addEventListener('click', (e) => {
  const theme = e.target.closest("button").dataset.theme
  setTheme(theme)
  if (theme == "dark") {
    e.target.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/>
    </svg>`
  } else {
    e.target.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
    <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/>
    </svg>`
  }
})
function setTheme(theme) {
  if (theme == "dark") {
    document.querySelector("#btnTheme").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/></svg>`
    document.querySelector("#btnTheme").setAttribute("data-theme", "light")
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.querySelector("#btnTheme").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
    <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/>
    </svg>`
    document.documentElement.setAttribute("data-theme", "dark");
    document.querySelector("#btnTheme").setAttribute("data-theme", "dark")
  }
}

// Guardar registro de partida
function saveGameRecord(result) {
  const gameRecord = {
    date: new Date().toLocaleString(),
    mode: gameMode,
    difficulty: difficulty,
    result: result
  };

  let records = JSON.parse(localStorage.getItem('tatetiRecords') || '[]');
  records.unshift(gameRecord); // Agregar al inicio del array
  if (records.length > 3) records = records.slice(0, 3); // Mantener solo los últimos 10 registros
  localStorage.setItem('tatetiRecords', JSON.stringify(records));
  displayRecords();
}

// Mostrar registros
function displayRecords() {
  const records = JSON.parse(localStorage.getItem('tatetiRecords')) || [];
  const recordsList = document.querySelector('#records ul');
  recordsList.innerHTML = '';
  records.forEach(record => {
    const li = document.createElement('li');
    li.innerHTML = `
      <time>${record.date}</time> -
      <p> ${record.result} </p> -
      <span>
      Modo: ${record.mode === "1vIA" ? "vs IA" : "1 vs 1"} -
      ${`(${record.difficulty})`}
      </span>
    `;
    recordsList.appendChild(li);
  });
}

// Inicializar
window.onload = function () {
  setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setGameMode("1v1");
  setDifficulty("easy");
  createBoard();
  displayRecords();
}
