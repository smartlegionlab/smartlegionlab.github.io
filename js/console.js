let commandHistory = [];
let historyIndex = -1;

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

async function processCommand(cmd) {
    addConsoleLine(`> ${cmd}`);
    addToHistory(cmd);

    if (cmd === 'help') {
        addConsoleLine('  randpass  - Generate random password');
        addConsoleLine('  smartpass - Generate smart password');
        addConsoleLine('  calc      - Calculate expression (calc 2+2)');
        addConsoleLine('  dino      - Play Dino Jump game');
        addConsoleLine('  demo      - Smart Legion Lab DEMO');
        addConsoleLine('  history   - Show command history');
        addConsoleLine('  history -c - Clear history');
        addConsoleLine('  clear     - Clear console');
        addConsoleLine('  exit      - Close');
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