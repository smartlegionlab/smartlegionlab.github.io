"use strict";

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const TILE = 40;
const COLS = 13;
const ROWS = 13;
const W = COLS * TILE;
const H = ROWS * TILE;
const TANK = 32;

const DIRS = [
    { dc: 0, dr: -1, dx: 0, dy: -1 },
    { dc: 1, dr: 0, dx: 1, dy: 0 },
    { dc: 0, dr: 1, dx: 0, dy: 1 },
    { dc: -1, dr: 0, dx: -1, dy: 0 },
];

const MAPS = [
    [ ".............",
      ".BBB..S..BBB.", ".B.B..S..B.B.", ".....W.W.....", ".B..W...W..B.",
      ".BB.......BB.", ".....B.B.....", ".BB.......BB.", ".B..W...W..B.",
      ".....W.W.....", ".B.B..B..B.B.", ".BBB.....BBB.", "....BB-E-BB.." ],
    [ "......S......",
      "..BB...BB..S.", "..B.B.B.B..S.", "....B.B.....", "..B.B.B.B..B.",
      "..BB...BB..B.", "....SSSS.....", ".BB.......BB.", ".B...S.S...B.",
      ".....W.W.....", ".BBB..B..BBB.", "....B...B....", "....BBEBB...." ],
    [ ".............",
      "..B.B...B.B..", "..B.B...B.B..", "BB.B.B.B.B.BB", "..B.B...B.B..",
      "..B.BBB.B.B..", ".B.B.B.B.B.B.", "....T.B.T....", "...T....T....",
      "..T..W.W..T..", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".....SSS.....",
      "..BB.S.S.BB..", "..B..SSS..B..", ".....S.S.....", "..B.......B..",
      ".BB.BBB.BB.B.", "....B.B.B....", ".BB.B.B.B.BB.", "..B.......B..",
      "..B.W...W.B..", ".B.B.B.B.B.B.", ".BBB.bbb.BBB.", "....BBEBB...." ],
    [ ".............",
      ".B.B...B.B.B.", "..........B..", "B...B.B.B...B", "........BBBB.",
      ".B.....B.....", "....TTTTT....", ".....B.B.....", "BBBB.........",
      "B...B.B.B...B", "..B..........", ".B.B...B.B.B.", "....BBEBB...." ],
    [ "TTTT.....TTTT",
      "TBBB...BBBT..", "TBB...W..BBT.", "TT..W.W.W..T.", "T.B.W...W.BT.",
      "T..B.....B.T.", "...BB.BB.BB..", "T..B.....B.T.", "T.B.W...W.BT.",
      "TT..W.W.W..T.", "TBB...W..BBT.", "TBBB...BBBT..", "....BBEBB...." ],
    [ ".....SSS.....",
      ".BBB.S.S.BBB.", ".BBS.SSS.SBB.", "....S.S.....", ".B........B..",
      ".BBBB..BBBB..", ".....B.B.....", ".BBBB..BBBB..", ".B........B..",
      "....W.W.W....", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ "......S......",
      ".....S.S.....", ".BB..S.S..BB.", ".BBB.W.W.BBB.", "....W.W.W....",
      ".BB.......BB.", "..B.BBB.B.B..", ".BBB..B..BBB.", ".B.S.....S.B.",
      "..B.S...S.B..", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      "..B.......B..", "..B.B.B.B.B..", ".B.B.S.S.B.B.", "....B...B....",
      "..W.W...W.W..", "..B.B.B.B.B..", "..S.......S..", "......T......",
      "....T.T.T....", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      "......B......", "..B...B...B..", "..B.B.B.B.B..", "..BB...BB....",
      "....S...S....", "..B.B.B.B.B..", ".B..B.B.B..B.", ".B....B....B.",
      "..W.......W..", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".....TTT.....",
      "....TBBB.T....", "..BB.T.B.TBB..", ".B.B.T.T.B.B.", ".B..B...B..B.",
      ".BB.BBB.B.BB.", ".....B.B.....", ".BB.BBB.B.BB.", "..B..W.W..B..",
      ".B...W.W...B.", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      "...S.S...S.S.", "...S.S...S.S.", "BB.....BB.....", "...B...B...S.",
      ".B.B.B.B.B.B.", "..S...W...S..", ".B.B.B.B.B.B.", "...B...B...S.",
      "BB.....B.....", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ "..........B.B",
      "...B.B.B.B.B.", "..B.B.B.B....", ".B.....B.B...", "...B.B...B.B.",
      ".B.....B.B.B.", "..B.B.B.B....", ".B.....B.B.B.", "...B.B...B.B.",
      "....W.W......", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ "TTTT......TTT",
      "TBBBB....BBT.", "TBB.....BBBT.", "..S.....S....", "..S.BBB.S....",
      "..B.B.B.B.B..", "..B.B.B.B.B..", "......W......", "...B.W.W.B...",
      "...B.W.W.B...", "...B.....B...", ".............", "....BBEBB...." ],
    [ ".....S.S.....",
      "..B..S.S..B..", "..B.B.B.B.B..", ".B.B.S.S.B.B.", "..B.......B..",
      ".BB...B...BB.", "....S.B.S....", ".BB...B...BB.", "..B.......B..",
      "...B.W.W.B...", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      "...B.B.B.B...", "...B.B.B.B...", "...B.B.B.B...", "BBB.B.B.B.BBB",
      "...S.....S...", "BBB.B.B.B.BBB", "...B.B.B.B...", "...B.B.B.B...",
      "...W.W.W.W...", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ "......T......",
      "..B...T...B..", "..B.B.T.B.B..", "....B.T.B....", "..B.B.B.B.B..",
      "..S.......S..", "..S.BBB.B.S..", "..B.......B..", ".B.B.B.B.B.B.",
      ".B...W...B...", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      ".....B.B.....", ".....B.B.....", ".B...B.B...B.", ".B...BBB...B.",
      ".B.B.....B.B.", "..B..SSS..B..", "..B..SSS..B..", "..B.B.B.B.B..",
      "....T.T.T....", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      "..B.B...B.B..", "..S.S...S.S..", "....B...B....", "BB.B.B.B.B.BB",
      ".....B.B.....", "...S.B.B.S...", ".....B.B.....", "BB.B.B.B.B.BB",
      "....W.W.W....", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ "TTT.......TTT",
      "TBB.B...B.BT.", "TB..B.B.B..T.", "....B...B....", "...S.B.B.S...",
      "...S.....S...", "BB...........BB", "....B.B.B....", "...W.....W...",
      "...W.....W...", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      "......B......", "......B......", "....B.B.B....", "..B.B.B.B.B..",
      "..B..B.B..B..", "..S..B.B..S..", "..B..B.B..B..", "..B.B.B.B.B..",
      "....B.B.B....", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ "TBBBB..BBBBT.",
      "TBB....BBB.T.", "TB....BBB..T.", "....BBB......", "...BBB...B...",
      "..BBB..B.B...", ".BBB...B.B.B.", "..BB..B.B.B..", "...B.B.B.B...",
      "....B.B.B....", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      "..B.B.B.B.B..", "..B.B.B.B.B..", "..B.B.B.B.B..", "..S.B.B.B.S..",
      "....BBB.BB...", ".......B.....", "....B.B.BB...", "..S.B.B.B.S..",
      "..B.B.B.B.B..", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      "...BB...BB...", "...B.B.B.B...", "...BB...BB...", "...B.B.B.B...",
      ".BB.BBB.B.BB.", "....B.B.B....", ".BB.BBB.B.BB.", "...B.B.B.B...",
      "...B.W.W.B...", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".....TTT.....",
      "....TB.BT....", "..TTB.BBTT...", ".T..B.B..T...", ".T.BBBB.B.T..",
      "....B.B.B....", "...SS...SS...", "....B.B.B....", "..B.B.B.B.B..",
      "..B.W.W.W.B..", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      "..SS.......B.", "..SB.B.B.B..B.", "..S.B.B.B.B..", "..S.B.B.B.B..",
      "....B.B.B.B..", "...SS...SS...", "...BB.B.BB...", "....B.B.B....",
      "...B.W.W.B...", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ "TTTTT.....TTT",
      "TBBBB....BBT.", "TB........BT.", ".B.B.B.B.B.B.", ".B.B.B.B.B.B.",
      ".....SSS.....", ".....SB.S....", ".....SSS.....", ".B.B.B.B.B.B.",
      "....W...W....", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      "...B.......B.", "...B.B.B.B.B.", "...B.BBB.B.B.", "...B.BBB.B.B.",
      "..B.B.....B.B", "..SS...B...SS.", "..B.B.....B.B", "...B.B.B.B.B.",
      "...B.W.W.B.B.", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".....TTT.....",
      "....T...T....", "...TT...TT...", "....TBBB.T....", ".....B.B.....",
      "....B.T.B....", "...B.TTT.B...", "...W.....W...", "..B.W...W.B..",
      "..B...W...B..", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      "...B.B.B.B...", "...B.B.B.B...", "...B.B.B.B...", "...BB.B.BB...",
      "....B.B.B....", "...SS...SS...", "....B.B.B....", "...BB.B.BB...",
      "...W.W.W.W...", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ "T...SSSS...T.",
      "TB..S....S.BT.", "TB..S....S.BT.", "...S....S....", "...SSSSSS....",
      "...S....S....", "...S....S....", "...SSSSSS....", "....B.B.B....",
      "....T.T.T....", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".............",
      ".B.B.B.B.B.B.", ".B.B.B.B.B.B.", ".....B.B.....", "BBBB.B.B.BBBB",
      ".....B.B.....", ".B.B.B.B.B.B.", "..S.S.S.S.S..", "..S.......S..",
      "..S.W...W.S..", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ ".....SSS.....",
      ".S..S.S.S..S.", ".S..S.S.S..S.", ".S.........S.", ".S.SSSSSSS.S.",
      ".S.S.....S.S.", ".S.S.....S.S.", ".S.SSSSSSS.S.", ".S.........S.",
      "...W.W.W.W...", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ "......S......",
      ".....S.S.....", "....S...S....", "...S.SSS.S...", "..S.S...S.S..",
      "..S.......S..", "..S.......S..", "..S.......S..", "..S.......S..",
      "...S.W.W.S...", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
    [ "SSSS.....SSSS",
      "S..S.....S..S", "S..S.....S..S", "....B.B.B....", "....B.B.B....",
      "....B.B.B....", "...SS...SS...", "....B.B.B....", "....B.B.B....",
      "....W.W.W....", ".B.B.....B.B.", ".BBB.....BBB.", "....BBEBB...." ],
];

const SPAWN = [{ c: 0, r: 0 }, { c: 6, r: 0 }, { c: 12, r: 0 }];
const P_START = [{ c: 1, r: 11 }, { c: 11, r: 11 }];

const ENEMY_TYPES = {
    basic: { hp: 1, speed: 1.7, score: 100, color: '#d8d8cc', fire: 3.2 },
    fast: { hp: 1, speed: 4.4, score: 200, color: '#7fd0ff', fire: 2.6 },
    power: { hp: 1, speed: 2.5, score: 300, color: '#ffb34d', fire: 1.4 },
    armor: { hp: 4, speed: 1.5, score: 400, color: '#d0a0ff', fire: 3.0 },
};

const state = {
    mode: 'menu',
    paused: false,
    score: 0,
    p1: 0,
    p2: 0,
    lives: 3,
    level: 1,
    toSpawn: 0,
    spawnTimer: 1.0,
    baseAlive: true,
    numPlayers: 1,
};

let grid = [];
let players = [];
let enemies = [];
let bullets = [];
let powerups = [];
let particles = [];
const keys = {};
let selLevel = 1;
let actx = null;
let sndOn = true;

function ac() {
    if (!actx) {
        const A = window.AudioContext || window.webkitAudioContext;
        if (A) actx = new A();
    }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
}

function tone(freq, dur, type, vol, slideTo) {
    const a = ac();
    if (!a || !sndOn) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || 'square';
    const t = a.currentTime;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
}

function noise(dur, vol, ff) {
    const a = ac();
    if (!a || !sndOn) return;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = ff || 900;
    const g = a.createGain();
    const t = a.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(a.destination);
    src.start(t);
}

function shootSound(w) {
    tone(w === 'p2' ? 520 : 640, 0.09, 'square', 0.09, 280);
    noise(0.05, 0.04, 1600);
}

function bangSound() {
    noise(0.35, 0.32, 900);
    tone(120, 0.28, 'sawtooth', 0.16, 40);
}

function bonusSound() {
    tone(660, 0.09, 'sine', 0.18);
    setTimeout(() => tone(880, 0.12, 'sine', 0.18), 90);
}

function grenadeSound() {
    noise(0.5, 0.45, 600);
    tone(90, 0.5, 'sawtooth', 0.22, 30);
}

function gameOverSound() {
    tone(400, 0.25, 'sawtooth', 0.18, 100);
    setTimeout(() => tone(190, 0.5, 'sawtooth', 0.18, 45), 250);
}

function shade(hex, amt) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    let n = parseInt(c, 16);
    let r = (n >> 16) & 255;
    let g = (n >> 8) & 255;
    let b = n & 255;
    r = Math.max(0, Math.min(255, r + amt));
    g = Math.max(0, Math.min(255, g + amt));
    b = Math.max(0, Math.min(255, b + amt));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function buildGrid(level) {
    const rows = MAPS[Math.min(MAPS.length - 1, Math.max(0, level - 1))];
    grid = [];
    for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        const line = (rows[r] || '').padEnd(COLS, '.');
        for (let c = 0; c < COLS; c++) {
            let ch = line[c];
            if (ch === '-' || ch === ' ' || ch === undefined) ch = '.';
            if (ch === 'b') ch = 'B';
            grid[r][c] = ch;
        }
    }
}

function setTile(c, r, ch) {
    if (c >= 0 && c < COLS && r >= 0 && r < ROWS) grid[r][c] = ch;
}

function makeTank(c, r, dir, isPlayer, type) {
    const cfg = type ? ENEMY_TYPES[type] : { hp: 1, speed: 3.6, color: '#f0c040' };
    return {
        c, r, dir, isPlayer,
        type: type || 'player',
        pi: -1,
        power: 0,
        firePause: 0,
        moving: false,
        moveFrom: { c, r },
        moveTo: { c, r },
        progress: 0,
        speed: cfg.speed,
        hp: cfg.hp,
        color: cfg.color,
        alive: true,
        invuln: 0,
        spawnProtect: isPlayer ? 0 : 1.2,
        decide: 0.4,
    };
}

function activeTanks() {
    const a = [];
    for (const p of players) if (p.tank && p.tank.alive) a.push(p.tank);
    for (const e of enemies) if (e.alive) a.push(e);
    return a;
}

function tankCells(t) {
    if (t.moving) return [{ c: t.c, r: t.r }, { c: t.moveTo.c, r: t.moveTo.r }];
    return [{ c: t.c, r: t.r }];
}

function isCellOccupied(c, r, ex) {
    for (const t of activeTanks()) {
        if (t === ex) continue;
        for (const cell of tankCells(t)) {
            if (cell.c === c && cell.r === r) return true;
        }
    }
    return false;
}

function tileBlocked(c, r) {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return true;
    const ch = grid[r][c];
    return ch === 'B' || ch === 'S' || ch === 'W' || ch === 'E';
}

function tryStartMove(t, dir) {
    if (!t.alive) return false;
    t.dir = dir;
    const d = DIRS[dir];
    const nc = t.c + d.dc;
    const nr = t.r + d.dr;
    if (tileBlocked(nc, nr)) return false;
    if (isCellOccupied(nc, nr, t)) return false;
    t.moving = true;
    t.progress = 0;
    t.moveFrom = { c: t.c, r: t.r };
    t.moveTo = { c: nc, r: nr };
    return true;
}

function tankCenter(t) {
    const cx = t.c * TILE + TILE / 2;
    const cy = t.r * TILE + TILE / 2;
    if (t.moving) {
        const d = DIRS[t.dir];
        return { x: cx + d.dc * TILE * t.progress, y: cy + d.dr * TILE * t.progress };
    }
    return { x: cx, y: cy };
}

function tankRect(t) {
    const p = tankCenter(t);
    const h = TANK / 2;
    return { x: p.x - h + 2, y: p.y - h + 2, w: TANK - 4, h: TANK - 4 };
}

function pointInRect(x, y, R) {
    return x >= R.x && x <= R.x + R.w && y >= R.y && y <= R.y + R.h;
}

function addScore(pid, v) {
    if (pid === 0) state.p1 += v;
    else if (pid === 1) state.p2 += v;
    state.score = state.p1 + state.p2;
}

function fire(t) {
    const p = tankCenter(t);
    const d = DIRS[t.dir];
    let speed = t.isPlayer ? (t.power >= 1 ? 7.5 : 6) : (t.type === 'power' ? 5 : 3);
    let power = t.isPlayer ? (t.power >= 2 ? 2 : 1) : 1;
    bullets.push({
        x: p.x + d.dx * 10,
        y: p.y + d.dy * 10,
        dir: t.dir,
        speed,
        owner: t.isPlayer ? 'player' : 'enemy',
        pid: t.isPlayer ? t.pi : null,
        power,
        dead: false,
    });
}

function updateBullets(dt) {
    for (const b of bullets) {
        if (b.dead) continue;
        const d = DIRS[b.dir];
        const sp = b.speed * TILE;
        b.x += d.dx * sp * dt;
        b.y += d.dy * sp * dt;
        if (b.x < 0 || b.y < 0 || b.x > W || b.y > H) {
            b.dead = true;
            continue;
        }
        const c = Math.floor(b.x / TILE);
        const r = Math.floor(b.y / TILE);
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            const ch = grid[r][c];
            if (ch === 'B') {
                setTile(c, r, '.');
                spawnSparkle(c * TILE + TILE / 2, r * TILE + TILE / 2);
                b.dead = true;
                continue;
            }
            if (ch === 'S') {
                if (b.power >= 2) setTile(c, r, '.');
                b.dead = true;
                continue;
            }
            if (ch === 'E') {
                baseDestroyed();
                b.dead = true;
                continue;
            }
        }
        for (const t of activeTanks()) {
            if (t.spawnProtect > 0) continue;
            if (pointInRect(b.x, b.y, tankRect(t))) {
                if (b.owner === 'player' && t.isPlayer) continue;
                if (b.owner === 'enemy' && !t.isPlayer) continue;
                hitTank(t, b);
                b.dead = true;
                break;
            }
        }
    }
    bullets = bullets.filter(b => !b.dead);
}

function hitTank(t, b) {
    if (t.isPlayer && t.invuln > 0) return;
    t.hp--;
    spawnSparkle(tankCenter(t).x, tankCenter(t).y);
    if (t.hp > 0) return;
    t.alive = false;
    explode(tankCenter(t).x, tankCenter(t).y, t.color);
    if (!t.isPlayer) {
        addScore(b.pid, ENEMY_TYPES[t.type].score);
        bangSound();
        maybeDropPower(t);
    } else {
        playerDead(t.pi);
    }
}

function playerDead(pi) {
    state.lives--;
    if (players[pi]) {
        players[pi].tank = null;
        players[pi].respawn = state.lives >= 0 ? 2.0 : Infinity;
    }
    bangSound();
}

function updatePlayer(i, dt) {
    const t = players[i].tank;
    if (!t || !t.alive) return;
    if (t.invuln > 0) t.invuln -= dt;
    let d = t.dir;
    if (i === 0) {
        if (keys.KeyW) d = 0;
        if (keys.KeyS) d = 2;
        if (keys.KeyA) d = 3;
        if (keys.KeyD) d = 1;
    } else {
        if (keys.ArrowUp) d = 0;
        if (keys.ArrowDown) d = 2;
        if (keys.ArrowLeft) d = 3;
        if (keys.ArrowRight) d = 1;
    }
    if (t.moving) {
        t.progress += t.speed * dt;
        if (t.progress >= 1) {
            t.progress = 1;
            t.c = t.moveTo.c;
            t.r = t.moveTo.r;
            t.moving = false;
        }
    } else {
        if (d === ((t.dir + 2) % 4)) t.dir = d;
        tryStartMove(t, d);
    }
    t.firePause -= dt;
    const fireKey = i === 0 ? (keys.Space || keys.KeyF) : (keys.KeyL || keys.Enter);
    const my = bullets.filter(b => b.owner === 'player' && b.pid === i && !b.dead).length;
    const maxB = (t.power >= 2 ? 2 : 1);
    if (fireKey && t.firePause <= 0 && my < maxB) {
        fire(t);
        t.firePause = 0.34;
        shootSound(i === 0 ? 'p1' : 'p2');
    }
}

function pickType() {
    const l = state.level;
    const r = Math.random();
    const power = l >= 3 ? 0.2 : 0;
    const armor = l >= 4 ? (l >= 7 ? 0.2 : 0.12) : 0;
    const fast = l >= 2 ? 0.18 : 0;
    if (r < power) return 'power';
    if (r < power + armor) return 'armor';
    if (r < power + armor + fast) return 'fast';
    return 'basic';
}

function spawnEnemy() {
    for (const s of SPAWN) {
        if (!isCellOccupied(s.c, s.r) && !tileBlocked(s.c, s.r)) {
            const e = makeTank(s.c, s.r, 2, false, pickType());
            enemies.push(e);
            state.toSpawn--;
            state.spawnTimer = Math.max(0.6, 2.2 - state.level * 0.05);
            return;
        }
    }
}

function updateEnemies(dt) {
    for (const e of enemies) {
        if (!e.alive) continue;
        if (e.spawnProtect > 0) e.spawnProtect -= dt;
        if (e.moving) {
            e.progress += e.speed * dt;
            if (e.progress >= 1) {
                e.progress = 1;
                e.c = e.moveTo.c;
                e.r = e.moveTo.r;
                e.moving = false;
                e.decide = 0;
            }
        } else {
            e.decide -= dt;
            if (e.decide <= 0) {
                let nd = Math.floor(Math.random() * 4);
                if (Math.random() < 0.3) nd = 2;
                e.decide = 0.5 + Math.random() * 1.4;
                if (!tryStartMove(e, nd)) e.decide = 0.2;
            } else {
                if (!tryStartMove(e, e.dir)) e.decide = Math.min(e.decide, 0.1);
            }
        }
        if (e.fireCd === undefined) e.fireCd = 2;
        e.fireCd -= dt;
        if (e.fireCd <= 0) {
            if (!e.moving) {
                fire(e);
                shootSound('enemy');
                e.fireCd = ENEMY_TYPES[e.type].fire * (0.7 + Math.random() * 0.8);
            }
        }
    }
    enemies = enemies.filter(e => e.alive);
}

function maybeDropPower(e) {
    if (Math.random() < 0.28) {
        const types = ['S', 'L', 'M', 'O'];
        powerups.push({ c: e.c, r: e.r, type: types[Math.floor(Math.random() * types.length)], alive: true });
    }
}

function collectPower(p, t) {
    const r = tankRect(t);
    const pc = p.c * TILE + TILE / 2;
    const pr = p.r * TILE + TILE / 2;
    if (!pointInRect(pc, pr, r)) return;
    if (p.type === 'S') t.power = Math.min(2, (t.power || 0) + 1);
    else if (p.type === 'L') t.invuln = 8;
    else if (p.type === 'M') grenade(t.pi);
    else if (p.type === 'O') state.lives++;
    p.alive = false;
    bonusSound();
    cast({ type: p.type, c: p.c, r: p.r });
}

function grenade(pid) {
    grenadeSound();
    for (const e of enemies) {
        e.alive = false;
        addScore(pid, ENEMY_TYPES[e.type].score);
        explode(tankCenter(e).x, tankCenter(e).y, e.color);
    }
    enemies = [];
}

function spawnSparkle(x, y, big) {
    for (let i = 0; i < (big ? 8 : 5); i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 30 + Math.random() * 60;
        particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.25 + Math.random() * 0.2, color: big ? '#fff' : '#ffd27a', s: 3 });
    }
}

function explode(x, y, col) {
    for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 40 + Math.random() * 80;
        particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.4 + Math.random() * 0.4, color: Math.random() < 0.4 ? '#ffd27a' : col, s: 4 });
    }
}

function cast(p) {
    const col = { S: '#ffe27a', L: '#9fe8ae', M: '#ff8a7a', O: '#ff9ae0' }[p.type];
    for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2;
        particles.push({ x: p.c * TILE + TILE / 2, y: p.r * TILE + TILE / 2, vx: Math.cos(a) * 50, vy: Math.sin(a) * 50, life: 0.4, color: col, s: 5 });
    }
}

function updateParticles(dt) {
    for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
    }
    particles = particles.filter(p => p.life > 0);
}

function baseDestroyed() {
    if (!state.baseAlive) return;
    state.baseAlive = false;
    setTile(6, 12, '.');
    spawnSparkle(6 * TILE + TILE / 2, 12 * TILE + TILE / 2, true);
    bangSound();
    gameOver('Base destroyed');
}

function resetLevel() {
    buildGrid(state.level);
    enemies = [];
    bullets = [];
    powerups = [];
    particles = [];
    state.toSpawn = Math.min(6 + Math.floor((state.level + 1) * 1.5), 16);
    state.spawnTimer = 1.0;
    state.baseAlive = true;
    players = [];
    for (let i = 0; i < state.numPlayers; i++) {
        const t = makeTank(P_START[i].c, P_START[i].r, 2, true, null);
        t.pi = i;
        t.invuln = 3;
        players.push({ tank: t, start: { ...P_START[i] }, respawn: 0, pi: i });
    }
    updateHud();
}

function newGame(num) {
    state.mode = 'playing';
    state.paused = false;
    state.score = 0;
    state.p1 = 0;
    state.p2 = 0;
    state.lives = 3;
    state.level = selLevel;
    state.numPlayers = num;
    document.getElementById('overOverlay').classList.remove('active');
    document.getElementById('menuOverlay').classList.remove('active');
    document.getElementById('pauseOverlay').classList.remove('active');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    resetLevel();
    ac();
}

function readBest() {
    try { return parseInt(localStorage.getItem('tanks_best') || '0', 10) || 0; } catch (e) { return 0; }
}

function writeBest(v) {
    try { localStorage.setItem('tanks_best', String(v)); } catch (e) {}
}

function gameOver(title) {
    if (state.mode === 'over') return;
    state.mode = 'over';
    document.getElementById('overTitle').textContent = title;
    document.getElementById('finScore').textContent = state.score;
    document.getElementById('finLevel').textContent = state.level;
    let html = '<div style="display:flex;gap:30px;justify-content:center;font-size:15px">' +
        '<span>🟡 Player 1: <b style="color:#ffc107">' + state.p1 + '</b></span>';
    if (state.numPlayers > 1) {
        html += '<span>🟢 Player 2: <b style="color:#8ee0b0">' + state.p2 + '</b></span>';
    }
    html += '</div>';
    document.getElementById('finPlayers').innerHTML = html;
    let win = '';
    if (state.numPlayers > 1) {
        if (state.p1 > state.p2) win = '🏆 Winner: Player 1';
        else if (state.p2 > state.p1) win = '🏆 Winner: Player 2';
        else win = '🤝 Draw!';
    } else {
        win = state.score > 0 ? '🎉 Great game!' : '💪 Never give up!';
    }
    document.getElementById('finWinner').textContent = win;
    const best = Math.max(readBest(), state.score);
    writeBest(best);
    document.getElementById('finBest').textContent = best;
    document.getElementById('overOverlay').classList.add('active');
    gameOverSound();
}

function updateHud() {
    document.getElementById('score').textContent = state.numPlayers > 1 ? 'P1:' + state.p1 + ' / P2:' + state.p2 : state.score;
    document.getElementById('level').textContent = state.level;
    document.getElementById('lives').textContent = Math.max(0, state.lives);
    document.getElementById('left').textContent = state.toSpawn + enemies.filter(e => e.alive).length;
}

function updateGame(dt) {
    updateHud();
    if (state.toSpawn > 0) {
        state.spawnTimer -= dt;
        const cap = Math.min(4, 3 + Math.floor(state.level / 2));
        const onf = enemies.filter(e => e.alive).length;
        if (state.spawnTimer <= 0 && onf < cap) spawnEnemy();
    }
    for (let i = 0; i < players.length; i++) {
        const pl = players[i];
        if (pl.tank === null) {
            if (pl.respawn !== Infinity) {
                pl.respawn -= dt;
                if (pl.respawn <= 0) {
                    pl.tank = makeTank(pl.start.c, pl.start.r, 2, true, null);
                    pl.tank.pi = i;
                    pl.tank.invuln = 3;
                }
            }
        } else {
            updatePlayer(i, dt);
        }
    }
    const anyAlive = players.some(p => p.tank && p.tank.alive);
    const anyPending = players.some(p => p.tank === null && p.respawn !== Infinity);
    if (!anyAlive && !anyPending && state.baseAlive) {
        gameOver('All lives lost');
        return;
    }
    updateEnemies(dt);
    updateBullets(dt);
    for (const p of powerups) {
        if (p.alive) {
            for (const pl of players) {
                if (pl.tank && pl.tank.alive) collectPower(p, pl.tank);
            }
        }
    }
    powerups = powerups.filter(p => p.alive);
    updateParticles(dt);
    if (state.toSpawn <= 0 && enemies.length === 0 && anyAlive) {
        if (state.level >= MAPS.length) {
            gameOver('All 35 levels completed!');
            return;
        }
        state.level++;
        resetLevel();
        spawnFlashLevel();
    }
}

function spawnFlashLevel() {
    for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2;
        particles.push({ x: 6 * TILE + TILE / 2, y: 5 * TILE, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, life: 0.5, color: '#9fe8ae', s: 4 });
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) drawTile(c, r, grid[r][c]);
    }
    for (const p of powerups) drawPower(p);
    for (const e of enemies) if (e.alive) drawTank(e);
    for (const p of players) if (p.tank && p.tank.alive) drawTank(p.tank);
    for (const b of bullets) {
        ctx.fillStyle = b.owner === 'player' ? '#fff' : '#ffd27a';
        ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
    }
    for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
    }
    ctx.globalAlpha = 1;
}

function drawTile(c, r, ch) {
    const x = c * TILE;
    const y = r * TILE;
    if (ch === 'B') drawBrick(x, y);
    else if (ch === 'S') drawSteel(x, y);
    else if (ch === 'W') drawWater(x, y);
    else if (ch === 'T') drawTree(x, y);
    else if (ch === 'E') drawBase(x, y);
}

function drawBrick(x, y) {
    ctx.fillStyle = '#c9783a';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = '#7a3d12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + TILE / 3);
    ctx.lineTo(x + TILE, y + TILE / 3);
    ctx.moveTo(x, y + 2 * TILE / 3);
    ctx.lineTo(x + TILE, y + 2 * TILE / 3);
    ctx.moveTo(x + TILE / 3, y);
    ctx.lineTo(x + TILE / 3, y + TILE / 3);
    ctx.moveTo(x + 2 * TILE / 3, y + TILE / 3);
    ctx.lineTo(x + 2 * TILE / 3, y + 2 * TILE / 3);
    ctx.moveTo(x + TILE / 6, y + 2 * TILE / 3);
    ctx.lineTo(x + TILE / 6, y + TILE);
    ctx.moveTo(x + 5 * TILE / 6, y + 2 * TILE / 3);
    ctx.lineTo(x + 5 * TILE / 6, y + TILE);
    ctx.stroke();
}

function drawSteel(x, y) {
    ctx.fillStyle = '#c9cfd8';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = '#8d939e';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
    ctx.beginPath();
    ctx.moveTo(x + 2, y + TILE / 2);
    ctx.lineTo(x + TILE - 2, y + TILE / 2);
    ctx.moveTo(x + TILE / 2, y + 2);
    ctx.lineTo(x + TILE / 2, y + TILE - 2);
    ctx.stroke();
    ctx.fillStyle = '#a9b0bb';
    ctx.fillRect(x + TILE / 2 - 4, y + TILE / 2 - 4, 8, 8);
}

function drawWater(x, y) {
    ctx.fillStyle = '#2a6fb0';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = '#7fb7e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + TILE / 2, y + TILE / 2, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + TILE / 2 + 2, y + TILE / 2 + 1, 3, 0, Math.PI * 2);
    ctx.stroke();
}

function drawTree(x, y) {
    ctx.fillStyle = '#0e3b18';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = '#2f8f3a';
    ctx.font = '28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🌲', x + TILE / 2, y + TILE / 2 + 10);
    ctx.textAlign = 'left';
}

function drawBase(x, y) {
    ctx.fillStyle = '#f0f0e8';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + TILE / 2 - 2, y + 6, 4, 6);
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 26);
    ctx.lineTo(x + TILE / 2, y + 16);
    ctx.lineTo(x + TILE - 6, y + 26);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x + 6, y + 26, TILE - 12, 5);
}

function drawTank(t) {
    const p = tankCenter(t);
    const col = t.isPlayer ? (t.pi === 0 ? '#f0c040' : '#60d0a0') : t.color;
    const colR = t.isPlayer && t.invuln > 0 ? (Math.floor(Date.now() / 120) % 2 ? '#fff' : col) : col;
    ctx.save();
    ctx.translate(Math.round(p.x), Math.round(p.y));
    ctx.fillStyle = colR;
    ctx.strokeStyle = shade(colR, -70);
    ctx.lineWidth = 2;
    rr(-15, -15, 30, 30, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = shade(colR, -40);
    if (t.dir === 0 || t.dir === 2) {
        ctx.fillRect(-15, -11, 6, 22);
        ctx.fillRect(9, -11, 6, 22);
    } else {
        ctx.fillRect(-11, -15, 22, 6);
        ctx.fillRect(-11, 9, 22, 6);
    }
    const d = DIRS[t.dir];
    ctx.strokeStyle = shade(colR, -90);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(d.dx * 18, d.dy * 18);
    ctx.stroke();
    ctx.fillStyle = shade(colR, 30);
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    if (t.type === 'armor') {
        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.fillText(String(t.hp), -4, -18);
    }
    ctx.restore();
    if (t.isPlayer && t.invuln > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.strokeStyle = 'rgba(255,255,255,.8)';
        ctx.lineWidth = 2;
        rr(p.x - 18, p.y - 18, 36, 36, 4);
        ctx.stroke();
    }
}

function drawPower(p) {
    const x = p.c * TILE;
    const y = p.r * TILE;
    const col = { S: '#ffe27a', L: '#9fe8ae', M: '#ff8a7a', O: '#ff9ae0' }[p.type];
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 8, y + 8, TILE - 16, TILE - 16);
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 8, y + 8, TILE - 16, TILE - 16);
    ctx.fillStyle = col;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.type === 'S' ? '★' : p.type, x + TILE / 2, y + TILE / 2 + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

let last = performance.now();

function loop(t) {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    if (state.mode === 'playing' && !state.paused) updateGame(dt);
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
    if (e.code === 'KeyM') {
        sndOn = !sndOn;
        document.getElementById('sndBtn').textContent = sndOn ? '🔊' : '🔇';
    }
    if (e.code === 'KeyP') {
        if (state.mode === 'playing') {
            state.paused = !state.paused;
            document.getElementById('pauseOverlay').classList.toggle('active', state.paused);
        }
    }
    if (e.code === 'Enter') {
        if (state.mode === 'menu') newGame(1);
        else if (state.mode === 'over') newGame(state.numPlayers);
    }
});

document.addEventListener('keyup', e => {
    keys[e.code] = false;
});

const lvEl = document.getElementById('lvNum');

function updLv() {
    lvEl.textContent = selLevel;
}

document.getElementById('lvMinus').addEventListener('click', e => {
    selLevel = selLevel <= 1 ? MAPS.length : selLevel - 1;
    updLv();
    e.currentTarget.blur();
});
document.getElementById('lvPlus').addEventListener('click', e => {
    selLevel = selLevel >= MAPS.length ? 1 : selLevel + 1;
    updLv();
    e.currentTarget.blur();
});
document.getElementById('oneBtn').addEventListener('click', e => {
    newGame(1);
    e.currentTarget.blur();
});
document.getElementById('twoBtn').addEventListener('click', e => {
    newGame(2);
    e.currentTarget.blur();
});
document.getElementById('resumeBtn').addEventListener('click', e => {
    state.paused = false;
    document.getElementById('pauseOverlay').classList.remove('active');
    e.currentTarget.blur();
});
document.getElementById('againBtn').addEventListener('click', e => {
    newGame(state.numPlayers);
    e.currentTarget.blur();
});
document.getElementById('sndBtn').addEventListener('click', e => {
    sndOn = !sndOn;
    document.getElementById('sndBtn').textContent = sndOn ? '🔊' : '🔇';
    ac();
    e.currentTarget.blur();
});

function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.bootstrap && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(el).show();
    } else {
        el.classList.add('show');
        el.style.display = 'block';
        if (!document.getElementById('tanksModalBackdrop')) {
            const back = document.createElement('div');
            back.className = 'modal-backdrop fade show';
            back.id = 'tanksModalBackdrop';
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
        const back = document.getElementById('tanksModalBackdrop');
        if (back) back.remove();
    }
}

const app = document.getElementById('tanksApp');
const isTouch = window.matchMedia('(pointer: coarse)').matches ||
                ('ontouchstart' in window) ||
                navigator.maxTouchPoints > 0;
if (isTouch) app.classList.add('tank-touch-on');

if (isTouch) {
    const twoBtn = document.getElementById('twoBtn');
    if (twoBtn) {
        twoBtn.textContent = '🕹🕹 2 PLAYERS — PC only';
        twoBtn.disabled = true;
    }
}

const dirBtns = { touchUp: 'KeyW', touchDown: 'KeyS', touchLeft: 'KeyA', touchRight: 'KeyD' };

Object.keys(dirBtns).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const key = dirBtns[id];
    const press = e => {
        e.preventDefault();
        e.stopPropagation();
        for (const k of Object.values(dirBtns)) keys[k] = (k === key);
    };
    const rel = () => { keys[key] = false; };
    el.addEventListener('touchstart', press, { passive: false });
    el.addEventListener('touchend', rel, { passive: false });
    el.addEventListener('touchcancel', rel, { passive: false });
    el.addEventListener('mousedown', press);
    el.addEventListener('mouseup', rel);
    el.addEventListener('mouseleave', rel);
});

const fireEl = document.getElementById('touchFire');
if (fireEl) {
    const fp = e => { e.preventDefault(); e.stopPropagation(); keys.Space = true; };
    const fr = () => { keys.Space = false; };
    fireEl.addEventListener('touchstart', fp, { passive: false });
    fireEl.addEventListener('touchend', fr, { passive: false });
    fireEl.addEventListener('touchcancel', fr, { passive: false });
    fireEl.addEventListener('mousedown', fp);
    fireEl.addEventListener('mouseup', fr);
}

const rotOverlay = document.getElementById('rotateOverlay');
let rotPausedByRot = false;

function syncOrientation() {
    const landscape = window.matchMedia('(orientation: landscape)').matches;
    const want = isTouch && landscape;
    rotOverlay.classList.toggle('active', want);
    if (state.mode !== 'playing') return;
    if (want && !state.paused) {
        state.paused = true;
        rotPausedByRot = true;
    }
    if (!want && rotPausedByRot) {
        state.paused = false;
        rotPausedByRot = false;
        document.getElementById('pauseOverlay').classList.remove('active');
    }
}

window.addEventListener('orientationchange', syncOrientation);
window.addEventListener('resize', syncOrientation);

updLv();
buildGrid(1);
updateHud();
syncOrientation();