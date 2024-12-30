
const board = document.getElementById('board');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start');
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
const themeRadios = document.querySelectorAll('input[name="theme"]');
let gridSize = 4;
let mines = 3;
let cells = [];
let timer;
let time = 0;
let gameOver = false;

function getMinesCount() {
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    switch (difficulty) {
        case 'medium': return 5;
        case 'hard': return 7;
        default: return 3;
    }
}

function startGame() {
    clearInterval(timer);
    time = 0;
    timerDisplay.textContent = 'Tiempo: 00:00';
    board.innerHTML = '';
    gameOver = false;
    cells = [];
    mines = getMinesCount();

    generateBoard();
    startTimer();
}

function generateBoard() {
    const minePositions = generateMines();

    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('li');
        cell.classList.add('empty');
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(cell));
        board.appendChild(cell);
        cells.push({ element: cell, isMine: minePositions.includes(i), revealed: false });
    }
}

function generateMines() {
    const positions = [];
    while (positions.length < mines) {
        const randomPos = Math.floor(Math.random() * gridSize * gridSize);
        if (!positions.includes(randomPos)) positions.push(randomPos);
    }
    return positions;
}

function handleCellClick(cell) {
    if (gameOver) return;

    const index = parseInt(cell.dataset.index);
    const currentCell = cells[index];

    if (currentCell.isMine) {
        revealAllMines();
        gameOver = true;
        clearInterval(timer);
        alert('¡Perdiste!');
        return;
    }

    revealCell(index);

    if (checkWin()) {
        clearInterval(timer);
        alert('¡Ganaste!');
    }
}

function revealCell(index) {
    const cell = cells[index];
    if (cell.revealed) return;

    cell.revealed = true;
    cell.element.classList.add('reveal');
}

function revealAllMines() {
    cells.forEach(cell => {
        if (cell.isMine) {
            cell.element.classList.add('mine');
        }
    });
}

function checkWin() {
    return cells.filter(cell => !cell.isMine && !cell.revealed).length === 0;
}

function startTimer() {
    timer = setInterval(() => {
        time++;
        const minutes = String(Math.floor(time / 60)).padStart(2, '0');
        const seconds = String(time % 60).padStart(2, '0');
        timerDisplay.textContent = `Tiempo: ${minutes}:${seconds}`;
    }, 1000);
}

const defaultTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', defaultTheme);
Array.from(themeRadios).find(radio => radio.value === defaultTheme).checked = true;
themeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        document.documentElement.setAttribute('data-theme', radio.value);
    });
});

startButton.addEventListener('click', startGame);