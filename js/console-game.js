let gameInterval = null;
let gameActive = false;
let dinoY = 0;
let obstacleX = 0;
let score = 0;
let gameOutput = null;
let speed = 6;
let baseSpeed = 6;
let frameCount = 0;

function startDinoGame(consoleOutputElement) {
    if (gameActive) return;

    gameOutput = consoleOutputElement;
    gameActive = true;
    dinoY = 0;
    obstacleX = 35;
    score = 0;
    speed = baseSpeed;
    frameCount = 0;

    addGameLine('GAME START! Press SPACE to jump');
    addGameLine('');

    gameInterval = setInterval(() => {
        if (!gameActive) return;

        frameCount++;

        if (frameCount % 30 === 0 && speed < 15) {
            speed += 0.5;
        }

        obstacleX -= speed / 10;

        if (obstacleX < 0) {
            obstacleX = 35;
            score++;
        }

        const obstaclePos = Math.floor(obstacleX);
        const isCollision = (obstaclePos === 5 && dinoY === 0);

        if (isCollision) {
            addGameLine('');
            addGameLine('GAME OVER! Score: ' + score);
            addGameLine('Type "dino" to play again');
            stopDinoGame();
            return;
        }

        drawGame();
    }, 50);
}

function drawGame() {
    if (!gameOutput) return;

    let gameField = '';
    gameField += 'Score: ' + score + '  Speed: ' + speed.toFixed(1) + '\n';

    const groundLine = '═════════════════════════════════════════════';

    for (let y = 3; y >= 0; y--) {
        let line = '';
        for (let x = 0; x <= 40; x++) {
            const obstaclePos = Math.floor(obstacleX);
            if (x === 5 && y === dinoY) {
                line += dinoY === 0 ? '🦖' : '🦕';
            } else if (x === obstaclePos && y === 0) {
                line += '🌵';
            } else {
                line += ' ';
            }
        }
        gameField += line + '\n';
    }
    gameField += groundLine;

    const gameDiv = document.createElement('div');
    gameDiv.style.fontFamily = 'monospace';
    gameDiv.style.fontSize = '10px';
    gameDiv.style.whiteSpace = 'pre';
    gameDiv.style.color = '#00ff9d';
    gameDiv.style.marginBottom = '10px';
    gameDiv.innerHTML = gameField;

    if (gameOutput.lastGameDiv) {
        gameOutput.lastGameDiv.remove();
    }
    gameOutput.appendChild(gameDiv);
    gameOutput.lastGameDiv = gameDiv;
    gameOutput.scrollTop = gameOutput.scrollHeight;
}

function addGameLine(text) {
    if (!gameOutput) return;
    const line = document.createElement('div');
    line.style.marginBottom = '4px';
    line.style.fontFamily = 'monospace';
    line.style.fontSize = '11px';
    line.innerHTML = text;
    gameOutput.appendChild(line);
    gameOutput.scrollTop = gameOutput.scrollHeight;
}

function stopDinoGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    gameActive = false;
}

function jumpDino() {
    if (!gameActive) return;
    const obstaclePos = Math.floor(obstacleX);
    if (dinoY === 0 && obstaclePos !== 5) {
        dinoY = 2;
        setTimeout(() => {
            if (gameActive) dinoY = 0;
        }, 250);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameActive) {
        e.preventDefault();
        jumpDino();
    }
});