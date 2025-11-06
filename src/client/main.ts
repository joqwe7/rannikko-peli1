import { GameClient } from './GameClient';

let gameClient: GameClient;

document.addEventListener('DOMContentLoaded', () => {
    gameClient = new GameClient();
    setupEventListeners();
});

function setupEventListeners() {
    const joinButton = document.querySelector('button[onclick="joinGame()"]');
    if (joinButton) {
        // Remove the inline onclick handler and add our event listener
        joinButton.removeAttribute('onclick');
        joinButton.addEventListener('click', handleJoinGame);
    }
}

async function handleJoinGame() {
    const nameInput = document.getElementById('playerName') as HTMLInputElement;
    const roleSelect = document.getElementById('playerRole') as HTMLSelectElement;
    const loginScreen = document.getElementById('login');
    const gameContainer = document.getElementById('gameContainer');

    if (!nameInput || !roleSelect || !loginScreen || !gameContainer) {
        console.error('Required elements not found');
        return;
    }

    const name = nameInput.value.trim();
    const role = roleSelect.value;

    if (!name) {
        alert('Please enter your name');
        return;
    }

    // Hide login screen and show game
    loginScreen.style.display = 'none';
    gameContainer.style.display = 'block';

    // Join the game
    gameClient.join(name, role);
}

// Make joinGame available globally for the HTML button
(window as any).joinGame = handleJoinGame;
(window as any).useSpecialAbility = () => {
    const player = gameClient?.getCurrentPlayer();
    if (player) {
        gameClient?.useSpecialAbility(player.role);
    }
};