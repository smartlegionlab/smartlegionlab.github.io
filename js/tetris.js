"use strict";

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const MINI = 16;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');

const COLORS = {
    I: '#22d3ee', J: '#3b82f6', L: '#f97316',
    O: '#facc15', S: '#4ade80', T: '#a855f7', Z: '#ef4444'
};
const SHAPES = {
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    J: [[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
    L: [[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
    O: [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
    S: [[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]],
    T: [[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
    Z: [[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]
};

let board, piece, hold, queue, canHold;
let score, lines, level, best;
let dropInterval;
let dropAcc = 0;
let lastTime = 0;
let running = false;
let paused = false;
let gameOver = false;
let isRecord = false;

function shuffledBag() {
    const bag = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
}

function init() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    queue = shuffledBag();
    hold = null;
    canHold = true;
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 800;
    gameOver = false;
    spawnPiece();
    updateHud();
    drawHold();
    drawNext();
}

function spawnPiece() {
    if (queue.length === 0) queue = shuffledBag();
    const type = queue.shift();
    piece = { matrix: SHAPES[type].map(r => r.slice()), type, x: 3, y: 0 };
    canHold = true;
    if (collide(piece.matrix, piece.x, piece.y)) {
        gameOver = true;
    }
    drawNext();
}

function collide(matrix, px, py) {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (!matrix[r][c]) continue;
            const bx = px + c;
            const by = py + r;
            if (bx < 0 || bx >= COLS || by >= ROWS) return true;
            if (by >= 0 && board[by][bx]) return true;
        }
    }
    return false;
}

function rotate(matrix, dir) {
    const n = 4;
    const times = ((dir % 4) + 4) % 4;
    let m = matrix;
    for (let t = 0; t < times; t++) {
        const r = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                r[j][n - 1 - i] = m[i][j];
            }
        }
        m = r;
    }
    return m;
}

function attemptRotate(dir) {
    const m = rotate(piece.matrix, dir);
    for (const dx of [0, -1, 1, -2, 2]) {
        if (!collide(m, piece.x + dx, piece.y)) {
            piece.matrix = m;
            piece.x += dx;
            return;
        }
    }
}

function move(dirX, dirY) {
    if (gameOver || paused) return false;
    if (!collide(piece.matrix, piece.x + dirX, piece.y + dirY)) {
        piece.x += dirX;
        piece.y += dirY;
        return true;
    }
    return false;
}

function softDrop() {
    if (!move(0, 1)) lockPiece();
}

function hardDrop() {
    if (gameOver || paused) return;
    while (move(0, 1));
    lockPiece();
}

function lockPiece() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (piece.matrix[r][c]) {
                const by = piece.y + r;
                if (by >= 0) board[by][piece.x + c] = piece.type;
            }
        }
    }
    clearLines();
    if (!gameOver) {
        spawnPiece();
        if (gameOver) showGameOver();
    }
}

function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0));
            cleared++;
            r++;
        }
    }
    if (cleared > 0) {
        const pts = [0, 100, 300, 500, 800][cleared];
        score += pts * level;
        lines += cleared;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(80, 800 - (level - 1) * 70);
        updateHud();
    }
}

function holdPiece() {
    if (gameOver || paused || !canHold) return;
    canHold = false;
    if (hold) {
        const t = piece.type;
        piece = { matrix: SHAPES[hold].map(r => r.slice()), type: hold, x: 3, y: 0 };
        hold = t;
    } else {
        hold = piece.type;
        spawnPiece();
    }
    drawHold();
    drawNext();
}

function ghostY() {
    let gy = piece.y;
    while (!collide(piece.matrix, piece.x, gy + 1)) gy++;
    return gy;
}

function drawCell(c, x, y, size, color) {
    c.fillStyle = color;
    c.fillRect(x * size, y * size, size, size);
    c.fillStyle = 'rgba(255,255,255,0.28)';
    c.fillRect(x * size, y * size, size, 3);
    c.fillStyle = 'rgba(0,0,0,0.28)';
    c.fillRect(x * size, y * size + size - 3, size, 3);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(51,65,85,0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK, 0);
        ctx.lineTo(x * BLOCK, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK);
        ctx.lineTo(canvas.width, y * BLOCK);
        ctx.stroke();
    }
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) drawCell(ctx, c, r, BLOCK, COLORS[board[r][c]]);
        }
    }
    if (piece && !gameOver) {
        const gy = ghostY();
        if (gy !== piece.y) {
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (piece.matrix[r][c]) {
                        const bx = piece.x + c;
                        const by = gy + r;
                        ctx.fillStyle = 'rgba(255,255,255,0.12)';
                        ctx.fillRect(bx * BLOCK, by * BLOCK, BLOCK, BLOCK);
                    }
                }
            }
        }
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (piece.matrix[r][c] && piece.y + r >= 0) {
                    drawCell(ctx, piece.x + c, piece.y + r, BLOCK, COLORS[piece.type]);
                }
            }
        }
    }
}

function drawMini(c, type) {
    c.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!type) return;
    const m = SHAPES[type];
    for (let r = 0; r < 4; r++) {
        for (let cc = 0; cc < 4; cc++) {
            if (m[r][cc]) drawCell(c, cc, r, MINI, COLORS[type]);
        }
    }
}

function drawNext() {
    drawMini(nextCtx, queue[0]);
}

function drawHold() {
    drawMini(holdCtx, hold);
}

function updateHud() {
    const prevBest = parseInt(localStorage.getItem('tetrisBest') || '0');
    document.getElementById('score').textContent = score;
    document.getElementById('lines').textContent = lines;
    document.getElementById('level').textContent = level;
    isRecord = score > prevBest && score > 0;
    if (isRecord) localStorage.setItem('tetrisBest', score);
    best = Math.max(prevBest, score);
    document.getElementById('best').textContent = best;
}

function showGameOver() {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLines').textContent = lines;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('newRecord').style.display = isRecord ? '' : 'none';
    document.getElementById('gameOverOverlay').classList.add('active');
}

function loop(time) {
    const dt = time - lastTime;
    lastTime = time;
    if (running && !paused && !gameOver) {
        dropAcc += dt;
        if (dropAcc >= dropInterval) {
            dropAcc = 0;
            if (!move(0, 1)) lockPiece();
        }
    }
    draw();
    requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
    const k = e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(k)) e.preventDefault();
    if (k === 'p' || k === 'P') return togglePause();
    if (!running) return;
    switch (k) {
        case 'ArrowLeft': case 'a': case 'A': move(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': move(1, 0); break;
        case 'ArrowDown': case 's': case 'S': softDrop(); break;
        case 'ArrowUp': case 'x': case 'X': attemptRotate(1); break;
        case 'z': case 'Z': attemptRotate(-1); break;
        case ' ': hardDrop(); break;
        case 'c': case 'C': holdPiece(); break;
        case 'Enter': if (gameOver) startGame(); break;
    }
});

function togglePause() {
    if (!running || gameOver) return;
    paused = !paused;
    document.getElementById('pauseOverlay').classList.toggle('active', paused);
    dropAcc = 0;
}

function startGame() {
    document.getElementById('startOverlay').classList.remove('active');
    document.getElementById('gameOverOverlay').classList.remove('active');
    document.getElementById('pauseOverlay').classList.remove('active');
    init();
    running = true;
    paused = false;
    dropAcc = 0;
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('playAgainBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('resumeBtn').addEventListener('click', togglePause);

function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.bootstrap && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(el).show();
    } else {
        el.classList.add('show');
        el.style.display = 'block';
        if (!document.getElementById('tetrisModalBackdrop')) {
            const back = document.createElement('div');
            back.className = 'modal-backdrop fade show';
            back.id = 'tetrisModalBackdrop';
            document.body.appendChild(back);
        }
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.bootstrap && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(el).hide();
    } else {
        el.classList.remove('show');
        el.style.display = '';
        const back = document.getElementById('tetrisModalBackdrop');
        if (back) back.remove();
    }
}

const app = document.getElementById('tetrisApp');
const isTouch = window.matchMedia('(pointer: coarse)').matches ||
                ('ontouchstart' in window) ||
                navigator.maxTouchPoints > 0;
if (isTouch) app.classList.add('tetris-touch-on');

document.querySelectorAll('.touch-controls button').forEach(btn => {
    const action = btn.dataset.action;
    let timer = null;
    const fn = () => {
        if (action === 'pause') {
            togglePause();
            return;
        }
        if (!running || paused || gameOver) return;
        switch (action) {
            case 'left': move(-1, 0); break;
            case 'right': move(1, 0); break;
            case 'down': softDrop(); break;
            case 'rotate': attemptRotate(1); break;
            case 'hold': holdPiece(); break;
            case 'drop': hardDrop(); break;
        }
    };
    const start = e => {
        e.preventDefault();
        e.stopPropagation();
        fn();
        if (action === 'left' || action === 'right' || action === 'down') {
            timer = setInterval(fn, 110);
        }
    };
    const stop = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    };
    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend', stop, { passive: false });
    btn.addEventListener('touchcancel', stop, { passive: false });
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', stop);
    btn.addEventListener('mouseleave', stop);
});

const rotOverlay = document.getElementById('rotateOverlay');
let rotPausedByRot = false;

function syncOrientation() {
    const landscape = window.matchMedia('(orientation: landscape)').matches;
    const want = isTouch && landscape;
    rotOverlay.classList.toggle('active', want);
    if (!running || gameOver) return;
    if (want && !paused) {
        paused = true;
        rotPausedByRot = true;
    }
    if (!want && rotPausedByRot) {
        paused = false;
        rotPausedByRot = false;
        document.getElementById('pauseOverlay').classList.remove('active');
    }
}

window.addEventListener('orientationchange', syncOrientation);
window.addEventListener('resize', syncOrientation);

best = parseInt(localStorage.getItem('tetrisBest') || '0');
document.getElementById('bestStart').textContent = best;
init();
syncOrientation();
requestAnimationFrame(loop);