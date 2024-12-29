import { setTheme, addClass, removeClass, getElement, getElements } from "./js/helpers.js";

const themeSwitcher = getElements('[name="theme"]');
const defaultTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
themeSwitcher.forEach((input) => input.addEventListener('change', (e) => setTheme(e.target.value)));
setTheme(defaultTheme);

// Game logic

const form = getElement('#upload');
const puzzle = getElement('#puzzle');
let pieces = Array.from(getElements('.puzzle_piece'));
let timer;
let timeLeft = 300; // 5 minutes

// Drag and drop and click file
const dropArea = getElement('label[for="image"]');
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    addClass('label[for="image"]', 'dragover');
});
dropArea.addEventListener('dragleave', () => { });
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();

    const files = e.dataTransfer.files; // Archivos locales
    const url = e.dataTransfer.getData('text/uri-list'); // URL externa

    if (files.length > 0) {
        // Procesar archivos locales
        setInputFiles(files[0]);
    } else if (url) {
        // Procesar imágenes desde URL
        loadImageFromUrl(url);
    } else {
        alert('No se ha podido cargar la imagen');
    }
});

function setInputFiles(file) {
    const input = getElement('#image');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files; // Actualiza el input
    showPreview(input); // Muestra vista previa
}

function loadImageFromUrl(url) {
    const img = new Image();
    img.src = url;
    img.crossOrigin = 'anonymous'; // Evita problemas de CORS
    img.onload = function () {
        // Crear un canvas para convertir la imagen a un archivo
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convertir a blob
        canvas.toBlob((blob) => {
            const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
            setInputFiles(file);
        }, 'image/jpeg');
    };
}

function showPreview(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        // Mostrar imagen como fondo
        dropArea.style.backgroundImage = `url(${e.target.result})`;
        dropArea.style.backgroundSize = 'contain';
        dropArea.style.backgroundRepeat = 'no-repeat';
        dropArea.innerText = ''; // Ocultar texto
    };
    reader.readAsDataURL(file);
}

// Actualiza vista previa al cambiar manualmente
getElement('#image').addEventListener('change', (e) => showPreview(e.target));



form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = getElement('#image');
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.width = puzzle.clientWidth;
        img.height = puzzle.clientHeight;
        img.onload = function () {
            createPuzzle(img);
            startTimer();
        };
    };
    reader.readAsDataURL(file);
});

function createPuzzle(img) {
    console.log(img.width);
    pieces.forEach((piece, index) => {
        const pieceSize = piece.clientHeight; // Assuming 4x4 grid
        const row = Math.floor(index / 4);
        const col = index % 4;
        console.log(pieceSize);
        console.log("row: " + row, "col: " + col);
        piece.style.backgroundImage = `url(${img.src})`;
        piece.style.backgroundSize = `${img.width}px ${img.height}px`;
        piece.style.backgroundRepeat = 'no-repeat';
        piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
        piece.draggable = true;
        piece.dataset.index = `${row}-${col}`;

        piece.addEventListener('dragstart', handleDragStart);
        piece.addEventListener('dragover', handleDragOver);
        piece.addEventListener('drop', handleDrop);
    });
    shufflePieces();
}

function shufflePieces() {
    pieces.sort(() => Math.random() - 0.5);
    pieces.forEach(piece => puzzle.appendChild(piece));
}

let draggedElement;

function handleDragStart(event) {
    draggedElement = event.target;
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    const target = event.target;
    if (target.classList.contains('puzzle_piece')) {
        const draggedIndex = draggedElement.dataset.index;
        const targetIndex = target.dataset.index;

        const draggedBg = draggedElement.style.backgroundPosition;
        const targetBg = target.style.backgroundPosition;

        draggedElement.dataset.index = targetIndex;
        target.dataset.index = draggedIndex;

        draggedElement.style.backgroundPosition = targetBg;
        target.style.backgroundPosition = draggedBg;

        checkWin();
    }
}

function checkWin() {
    const isSolved = pieces.every((piece, index) => {
        const [row, col] = piece.dataset.index.split('-');
        return index === parseInt(row) * 4 + parseInt(col);
    });

    if (isSolved) {
        clearInterval(timer);
        alert('¡Felicidades! Has resuelto el rompecabezas.');
    }
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 300;
    updateTimerDisplay();

    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('¡Tiempo agotado! Inténtalo de nuevo.');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = `Tiempo restante: ${Math.floor(timeLeft / 60)}:${('0' + (timeLeft % 60)).slice(-2)}`;
}
