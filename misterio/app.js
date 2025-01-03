// app.js

// Variables globales
let currentCharacter = null;
let currentSceneIndex = 0;
let stories = {};
let completedStories = new Set();
let keyword = "";

// Elementos del DOM
const historyDialog = document.getElementById('history');
const systemText = document.getElementById('system');
const characterText = document.getElementById('character');
const dialogText = document.getElementById('dialog');
const choicesForm = document.getElementById('choices');
const secretInput = document.getElementById('secret');
const revealButton = document.querySelector('button');

// Cargar historias desde archivos JSON
async function loadStories() {
    const storyFiles = ['story.json'];
    for (const file of storyFiles) {
        const response = await fetch(file);
        const data = await response.json();
        Object.assign(stories, data.characters);
        keyword += data.keyword;
    }
}

// Mostrar escena actual
function displayScene() {
    const characterData = stories[currentCharacter];
    const scene = characterData.story[currentSceneIndex];

    characterText.textContent = currentCharacter;
    systemText.textContent = scene.dialogues[0].system;
    dialogText.textContent = scene.description;

    // Opciones
    choicesForm.innerHTML = '';
    Object.entries(scene.choices).forEach(([key, choice]) => {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'action';
        radio.value = key;
        radio.id = key;

        const label = document.createElement('label');
        label.htmlFor = key;
        label.textContent = choice.text;

        choicesForm.appendChild(radio);
        choicesForm.appendChild(label);
    });
}

// Manejar elección del jugador
function handleChoice(event) {
    event.preventDefault();
    const choice = choicesForm.querySelector('input[name="action"]:checked');
    if (!choice) return;

    const characterData = stories[currentCharacter];
    const scene = characterData.story[currentSceneIndex];
    const result = scene.choices[choice.value].result;

    // Mostrar resultado
    dialogText.textContent = result;

    // Avanzar a la siguiente escena o marcar historia como completa
    if (currentSceneIndex < characterData.story.length - 1) {
        currentSceneIndex++;
        setTimeout(displayScene, 2000);
    } else {
        completedStories.add(currentCharacter);
        if (completedStories.size === Object.keys(stories).length) {
            alert('¡Has completado todas las historias! Ingresa la clave final.');
        }
    }
}

// Verificar palabra clave
function checkKeyword(event) {
    event.preventDefault();
    if (secretInput.value.toUpperCase() === keyword) {
        alert('¡Felicidades! Has ganado el juego.');
    } else {
        alert('Clave incorrecta. Sigue explorando las historias.');
    }
}

// Seleccionar personaje
function selectCharacter(event) {
    if (currentCharacter) return alert('Ya has seleccionado un personaje. Completa su historia primero.');

    const selected = event.target.closest('li');
    if (!selected) return;

    currentCharacter = selected.querySelector('h2').textContent;
    currentSceneIndex = 0;
    displayScene();
    historyDialog.showModal();
}

// Inicializar juego
async function init() {
    await loadStories();
    document.querySelector('ul').addEventListener('click', selectCharacter);
    choicesForm.addEventListener('submit', handleChoice);
    revealButton.addEventListener('click', checkKeyword);
}

init();
