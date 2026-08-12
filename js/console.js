let commandHistory = [];
let historyIndex = -1;
let mapAnimationInterval = null;
let mapAnimationTimeout = null;

const consoleToggle = document.getElementById('consoleToggle');
const devConsole = document.getElementById('devConsole');
const consoleClose = document.getElementById('consoleClose');
const consoleInput = document.getElementById('consoleInput');
const consoleOutput = document.getElementById('consoleOutput');

function clearConsole() {
    consoleOutput.innerHTML = '';
    if (typeof stopDinoGame !== 'undefined') {
        stopDinoGame();
    }
    if (typeof stopDemo !== 'undefined') {
        stopDemo();
    }
    if (mapAnimationInterval) {
        clearInterval(mapAnimationInterval);
        mapAnimationInterval = null;
    }
    if (mapAnimationTimeout) {
        clearTimeout(mapAnimationTimeout);
        mapAnimationTimeout = null;
    }
}

function addConsoleLine(text) {
    const line = document.createElement('div');
    line.style.marginBottom = '4px';
    line.style.fontFamily = 'monospace';
    line.style.fontSize = '11px';
    line.style.wordWrap = 'break-word';
    line.style.whiteSpace = 'pre-wrap';
    line.innerHTML = text;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    return line;
}

function addToHistory(cmd) {
    if (cmd && cmd.trim() !== '') {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
    }
}

function calculate(expression) {
    try {
        let expr = expression.replace(/[^0-9+\-*/().%]/g, '');
        if (!expr) return null;
        const result = Function('"use strict";return (' + expr + ')')();
        if (isNaN(result) || !isFinite(result)) return null;
        return Math.round(result * 10000) / 10000;
    } catch(e) {
        return null;
    }
}

function startRocketAnimation() {
    clearConsole();

    const container = document.createElement('div');
    container.style.textAlign = 'center';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '13px';
    container.style.lineHeight = '1.3';
    container.style.padding = '10px 0';
    container.style.position = 'relative';
    container.style.minHeight = '500px';
    container.style.background = '#0a0a0a';
    container.style.borderRadius = '4px';
    container.style.border = '1px solid #1a1a1a';
    consoleOutput.appendChild(container);

    const groundDiv = document.createElement('div');
    groundDiv.style.position = 'absolute';
    groundDiv.style.bottom = '0';
    groundDiv.style.left = '0';
    groundDiv.style.width = '100%';
    groundDiv.style.height = '40px';
    groundDiv.style.display = 'flex';
    groundDiv.style.alignItems = 'flex-end';
    groundDiv.style.justifyContent = 'center';
    groundDiv.style.color = '#00ff00';
    groundDiv.style.fontSize = '13px';
    groundDiv.style.zIndex = '2';

    const groundLine = document.createElement('div');
    groundLine.textContent = '________________________________________________________________________________';
    groundLine.style.color = '#00ff00';
    groundLine.style.opacity = '0.5';
    groundDiv.appendChild(groundLine);
    container.appendChild(groundDiv);

    const rocket = [
        '      ▲',
        '     /▲\\',
        '    / ▲ \\',
        '   /  ▲  \\',
        '  /   ▲   \\',
        ' /    ▲    \\',
        '/_____▲_____\\',
        '   ███████',
        '   ███████',
        '   ███████',
        '   ███████',
        '   ███████'
    ];

    let countdown = 3;

    const statusDiv = document.createElement('div');
    statusDiv.style.marginBottom = '15px';
    statusDiv.style.fontWeight = 'bold';
    statusDiv.style.fontSize = '16px';
    statusDiv.style.color = '#00ff00';
    statusDiv.style.position = 'relative';
    statusDiv.style.zIndex = '10';
    container.appendChild(statusDiv);

    const rocketDiv = document.createElement('div');
    rocketDiv.style.position = 'relative';
    rocketDiv.style.marginBottom = '20px';
    rocketDiv.style.zIndex = '5';
    container.appendChild(rocketDiv);

    const flameDiv = document.createElement('div');
    flameDiv.style.position = 'relative';
    flameDiv.style.marginTop = '-5px';
    flameDiv.style.zIndex = '4';
    flameDiv.style.display = 'none';
    container.appendChild(flameDiv);

    let starsContainer = null;

    function createStars() {
        starsContainer = document.createElement('div');
        starsContainer.style.position = 'absolute';
        starsContainer.style.top = '0';
        starsContainer.style.left = '0';
        starsContainer.style.width = '100%';
        starsContainer.style.height = '100%';
        starsContainer.style.pointerEvents = 'none';
        starsContainer.style.zIndex = '1';
        starsContainer.style.display = 'none';
        container.appendChild(starsContainer);

        for (let i = 0; i < 80; i++) {
            const star = document.createElement('div');
            star.style.position = 'absolute';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.color = ['#00ff00', '#ffff00', '#00ffff', '#ff00ff'][Math.floor(Math.random() * 4)];
            star.style.fontSize = (Math.random() * 8 + 4) + 'px';
            star.style.opacity = Math.random() * 0.8 + 0.2;
            star.textContent = ['*', '✦', '✧', '•', '★'][Math.floor(Math.random() * 5)];
            star.style.animation = `twinkle ${Math.random() * 2 + 1}s infinite alternate`;
            starsContainer.appendChild(star);
        }
    }

    createStars();

    function updateRocket(yOffset, showFlame = false) {
        let rocketHTML = '';
        rocket.forEach(line => {
            rocketHTML += `<div style="margin: 1px 0; color: #00ff00;">${line}</div>`;
        });
        rocketDiv.innerHTML = rocketHTML;
        rocketDiv.style.transform = `translateY(${yOffset}px)`;

        if (showFlame) {
            let flameHeight = Math.floor(Math.random() * 6 + 8);
            let flameHTML = '';
            const padding = ' '.repeat(6);
            const flameChars = ['▓', '▒', '░', '█'];

            for (let i = 0; i < flameHeight; i++) {
                const char = flameChars[Math.floor(Math.random() * flameChars.length)];
                const opacity = 0.4 + Math.random() * 0.6;
                const flicker = Math.random() > 0.3 ? '' : 'opacity: 0.2;';
                flameHTML += `<div style="margin: 0; color: #00ff00; opacity: ${opacity}; ${flicker}">${padding}${char}${char}${char}${char}${char}${char}</div>`;
            }

            flameDiv.innerHTML = flameHTML;
            flameDiv.style.display = 'block';
            flameDiv.style.transform = `translateY(${yOffset + 12}px)`;
        } else {
            flameDiv.style.display = 'none';
        }
    }

    updateRocket(0, false);

    function animateRocket() {
        if (countdown > 0) {
            statusDiv.textContent = `[SYSTEM] ROCKET PREPARING FOR LAUNCH... ${countdown}`;
            statusDiv.style.color = countdown === 1 ? '#ff4444' : '#00ff00';

            const shakeIntensity = (3 - countdown) * 3;
            if (shakeIntensity > 0) {
                rocketDiv.style.animation = `shake ${0.2}s infinite`;
            }

            countdown--;
            setTimeout(animateRocket, 1000);
        } else {
            rocketDiv.style.animation = 'none';
            statusDiv.textContent = '[SYSTEM] LAUNCH SEQUENCE INITIATED!';
            statusDiv.style.color = '#ff8800';

            groundDiv.style.opacity = '0.3';

            let yPos = 0;
            const targetY = -750;
            const step = 22;

            updateRocket(yPos, true);

            mapAnimationInterval = setInterval(() => {
                yPos -= step;
                updateRocket(yPos, true);

                if (yPos < -50 && yPos > -400) {
                    const smoke = document.createElement('div');
                    smoke.style.position = 'absolute';
                    smoke.style.bottom = '30px';
                    smoke.style.left = (Math.random() * 40 + 30) + '%';
                    smoke.style.color = '#1a1a1a';
                    smoke.style.fontSize = (Math.random() * 15 + 10) + 'px';
                    smoke.textContent = '░';
                    smoke.style.zIndex = '3';
                    smoke.style.opacity = '0.5';
                    container.appendChild(smoke);

                    setTimeout(() => {
                        smoke.style.opacity = '0';
                        smoke.style.transform = `scale(2) translateY(-30px)`;
                        smoke.style.transition = 'all 0.8s';
                        setTimeout(() => smoke.remove(), 800);
                    }, 100);
                }

                if (yPos <= targetY) {
                    clearInterval(mapAnimationInterval);
                    mapAnimationInterval = null;

                    statusDiv.textContent = '[SYSTEM] ROCKET REACHED SPACE!';
                    statusDiv.style.color = '#00ff00';
                    statusDiv.style.textShadow = '0 0 20px rgba(0,255,0,0.5)';

                    flameDiv.style.display = 'none';
                    groundDiv.style.display = 'none';

                    if (starsContainer) {
                        starsContainer.style.display = 'block';
                    }

                    mapAnimationTimeout = setTimeout(() => {
                        const redirectMsg = document.createElement('div');
                        redirectMsg.style.color = '#ffff00';
                        redirectMsg.style.fontSize = '14px';
                        redirectMsg.style.marginTop = '15px';
                        redirectMsg.style.animation = 'blink 0.5s infinite';
                        redirectMsg.textContent = '[SYSTEM] Redirecting to Site Map...';
                        container.appendChild(redirectMsg);

                        setTimeout(() => {
                            window.location.href = 'smartlegionlab-map.html';
                        }, 1500);
                    }, 2000);
                }
            }, 40);
        }
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-3px) translateY(-2px); }
            75% { transform: translateX(3px) translateY(2px); }
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
        @keyframes twinkle {
            0% { opacity: 0.2; }
            100% { opacity: 0.8; }
        }
    `;
    container.appendChild(style);

    animateRocket();
}

async function processCommand(cmd) {
    addConsoleLine(`> ${cmd}`);
    addToHistory(cmd);

    if (cmd === 'help') {
        addConsoleLine('  randpass   - Generate random password');
        addConsoleLine('  smartpass  - Generate smart password');
        addConsoleLine('  calc       - Calculate expression (calc 2+2)');
        addConsoleLine('  dino       - Play Dino Jump game');
        addConsoleLine('  demo       - Smart Legion Lab DEMO');
        addConsoleLine('  map        - Go to Site Map');
        addConsoleLine('  history    - Show command history');
        addConsoleLine('  history -c - Clear history');
        addConsoleLine('  clear      - Clear console');
        addConsoleLine('  exit       - Close console');
    }
    else if (cmd === 'randpass') {
        if (typeof SmartPassLib === 'undefined') {
            addConsoleLine('  SmartPassLib not loaded. Check static files.');
        } else {
            addConsoleLine('  Enter password length (12-100):');
            window.waitingForRandLength = true;
        }
    }
    else if (cmd === 'smartpass') {
        if (typeof SmartPassLib === 'undefined') {
            addConsoleLine('  SmartPassLib not loaded. Check static files.');
        } else {
            addConsoleLine('  Enter secret phrase (min 12 chars):');
            window.waitingForSecret = true;
        }
    }
    else if (cmd.startsWith('calc ')) {
        const expr = cmd.substring(5);
        const result = calculate(expr);
        if (result !== null) {
            addConsoleLine(`  ${expr} = ${result}`);
        } else {
            addConsoleLine('  Invalid expression');
        }
    }
    else if (cmd === 'calc') {
        addConsoleLine('  Usage: calc 2+2, calc 10*5, calc (10+5)*2');
    }
    else if (cmd === 'dino') {
        if (typeof startDinoGame === 'undefined') {
            addConsoleLine('  Game not loaded. Check static files.');
        } else {
            if (window.gameActive) {
                stopDinoGame();
            }
            addConsoleLine('  Game started! Press SPACE to jump');
            startDinoGame(consoleOutput);
        }
    }
    else if (cmd === 'demo') {
        if (typeof startDemo !== 'undefined') {
            if (window._stopDemo) {
                window._stopDemo();
                window._stopDemo = null;
            }
            setTimeout(() => startDemo(), 100);
        } else {
            addConsoleLine('  Demo module not loaded');
        }
    }
    else if (cmd === 'map') {
        if (typeof stopDinoGame !== 'undefined') {
            stopDinoGame();
        }
        if (typeof stopDemo !== 'undefined') {
            stopDemo();
        }
        startRocketAnimation();
    }
    else if (cmd === 'history') {
        if (commandHistory.length === 0) {
            addConsoleLine('  History is empty');
        } else {
            commandHistory.forEach((h, i) => {
                addConsoleLine(`  ${i + 1}. ${h}`);
            });
        }
    }
    else if (cmd === 'history -c') {
        commandHistory = [];
        historyIndex = -1;
        addConsoleLine('  History cleared');
    }
    else if (cmd === 'clear') {
        clearConsole();
    }
    else if (cmd === 'exit') {
        if (typeof stopDinoGame !== 'undefined') {
            stopDinoGame();
        }
        if (typeof stopDemo !== 'undefined') {
            stopDemo();
        }
        if (mapAnimationInterval) {
            clearInterval(mapAnimationInterval);
            mapAnimationInterval = null;
        }
        if (mapAnimationTimeout) {
            clearTimeout(mapAnimationTimeout);
            mapAnimationTimeout = null;
        }
        devConsole.style.display = 'none';
    }
    else if (cmd !== '') {
        if (window.waitingForRandLength) {
            const length = parseInt(cmd);
            if (isNaN(length) || length < 12 || length > 100) {
                addConsoleLine(`  Invalid length. Use 12-100. Try again:`);
            } else {
                addConsoleLine(`  Generating random password (${length} chars)...`);
                try {
                    const password = await SmartPassLib.generateStrongPassword(length);
                    addConsoleLine(`  Password: ${password}`);
                } catch(e) {
                    addConsoleLine(`  Error: ${e.message}`);
                }
                window.waitingForRandLength = false;
            }
        } else if (window.waitingForSecret) {
            if (cmd.length < 12) {
                addConsoleLine(`  Secret too short (${cmd.length} chars). Need at least 12. Try again:`);
            } else {
                addConsoleLine(`  Enter password length (12-100):`);
                window.smartSecret = cmd;
                window.waitingForLength = true;
                window.waitingForSecret = false;
            }
        } else if (window.waitingForLength) {
            const length = parseInt(cmd);
            if (isNaN(length) || length < 12 || length > 100) {
                addConsoleLine(`  Invalid length. Use 12-100. Try again:`);
            } else {
                addConsoleLine(`  Generating smart password...`);
                try {
                    const password = await SmartPassLib.generateSmartPassword(window.smartSecret, length);
                    addConsoleLine(`  Password (${length} chars): ${password}`);
                } catch(e) {
                    addConsoleLine(`  Error: ${e.message}`);
                }
                window.waitingForLength = false;
                window.smartSecret = null;
            }
        } else {
            addConsoleLine(`  Unknown: ${cmd}`);
        }
    }
}

if (consoleToggle) {
    consoleToggle.onclick = () => {
        if (devConsole.style.display === 'none') {
            devConsole.style.display = 'block';
            consoleInput.focus();
        } else {
            if (typeof stopDinoGame !== 'undefined') {
                stopDinoGame();
            }
            if (typeof stopDemo !== 'undefined') {
                stopDemo();
            }
            if (mapAnimationInterval) {
                clearInterval(mapAnimationInterval);
                mapAnimationInterval = null;
            }
            if (mapAnimationTimeout) {
                clearTimeout(mapAnimationTimeout);
                mapAnimationTimeout = null;
            }
            devConsole.style.display = 'none';
        }
    };
}

if (consoleClose) {
    consoleClose.onclick = () => {
        if (typeof stopDinoGame !== 'undefined') {
            stopDinoGame();
        }
        if (typeof stopDemo !== 'undefined') {
            stopDemo();
        }
        if (mapAnimationInterval) {
            clearInterval(mapAnimationInterval);
            mapAnimationInterval = null;
        }
        if (mapAnimationTimeout) {
            clearTimeout(mapAnimationTimeout);
            mapAnimationTimeout = null;
        }
        devConsole.style.display = 'none';
    };
}

if (consoleInput) {
    consoleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = consoleInput.value.trim().toLowerCase();
            if (cmd) processCommand(cmd);
            consoleInput.value = '';
            historyIndex = commandHistory.length;
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0 && historyIndex > 0) {
                historyIndex--;
                consoleInput.value = commandHistory[historyIndex];
            }
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                consoleInput.value = commandHistory[historyIndex];
            } else if (historyIndex === commandHistory.length - 1) {
                historyIndex++;
                consoleInput.value = '';
            }
        }
    });
}

const yearSpan = document.getElementById('currentYear');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}