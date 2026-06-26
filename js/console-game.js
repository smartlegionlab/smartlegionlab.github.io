let gameInterval = null;
let gameActive = false;
let dinoY = 0;
let obstacleX = 0;
let score = 0;
let gameOutput = null;
let speed = 6;
let baseSpeed = 6;
let frameCount = 0;
let obstaclePassed = false;
let tapHandler = null;

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

function startDinoGame(consoleOutputElement) {
    if (gameActive) return;

    gameOutput = consoleOutputElement;
    gameActive = true;
    dinoY = 0;
    obstacleX = 35;
    score = 0;
    speed = baseSpeed;
    frameCount = 0;
    obstaclePassed = false;

    addGameLine('GAME START! Press SPACE to jump');
    addGameLine('');

    if (isMobile() && gameOutput && !tapHandler) {
        tapHandler = function(e) {
            if (gameActive) {
                e.stopPropagation();
                jumpDino();
            }
        };
        gameOutput.addEventListener('click', tapHandler);
    }

    gameInterval = setInterval(() => {
        if (!gameActive) return;

        frameCount++;

        if (frameCount % 10 === 0) {
            speed += 0.1;
        }

        obstacleX -= speed / 10;

        if (obstacleX < -2) {
            obstacleX = 35 + Math.floor(Math.random() * 10);
            obstaclePassed = false;
        }

        const obstaclePos = Math.floor(obstacleX);

        if (obstaclePos < 5 && !obstaclePassed) {
            obstaclePassed = true;
            score++;
        }

        if (obstaclePos >= 4 && obstaclePos <= 6 && dinoY === 0) {
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
    if (isMobile()) {
        gameDiv.style.cursor = 'pointer';
        gameDiv.onclick = function(e) {
            e.stopPropagation();
            if (gameActive) jumpDino();
        };
    }
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
    if (tapHandler && gameOutput) {
        gameOutput.removeEventListener('click', tapHandler);
        tapHandler = null;
    }
}

function jumpDino() {
    if (!gameActive) return;
    if (dinoY === 0) {
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