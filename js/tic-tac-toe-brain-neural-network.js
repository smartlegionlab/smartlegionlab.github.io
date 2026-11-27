const CANVAS_W = 640;
const CANVAS_H = 470;
const IN = 27;
const H1N = 48;
const H2N = 32;
const OUT = 9;
const ACC_STOP = 0.99;
const stepsPerEpoch = 256;
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function dsigmoid(y) { return y * (1 - y); }
function argmax(arr) { let b = 0; for (let i = 1; i < arr.length; i++) if (arr[i] > arr[b]) b = i; return b; }
let logBox = null;
let logBody = null;
let logLines = [];
function setToggleBtn(txt) {
  const tb = document.getElementById('logToggleBtn');
  if (tb) tb.textContent = txt;
}
function toggleLog() {
  if (!logBody) return;
  if (logBody.style.display === 'none') {
    logBody.style.display = 'block';
    if (logBox) logBox.style.maxHeight = '320px';
    setToggleBtn('\u2212');
  } else {
    logBody.style.display = 'none';
    if (logBox) logBox.style.maxHeight = '34px';
    setToggleBtn('+');
  }
}
function copyLogs() {
  const txt = logLines.join('\n');
  const cb = document.getElementById('logCopyBtn');
  function done() { if (cb) { cb.textContent = '\u2713'; setTimeout(() => { cb.textContent = 'Copy'; }, 900); } }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(done, done);
  } else {
    window.prompt('Copy logs:', txt);
    done();
  }
  showToast('Logs copied to clipboard', true);
}
function log(msg) {
  try {
    if (!logBox) {
      logBox = document.createElement('div');
      logBox.id = 'logBox';
      logBox.style.cssText = 'position:fixed;left:10px;bottom:10px;width:430px;max-height:320px;overflow:hidden;background:rgba(13,17,23,0.96);border:1px solid rgba(13,110,253,0.4);border-radius:8px;font-family:monospace;font-size:11px;color:#7ab3ff;z-index:80;display:flex;flex-direction:column;';
      const head = document.createElement('div');
      head.style.cssText = 'display:flex;justify-content:flex-end;gap:4px;padding:4px 8px;border-bottom:1px solid rgba(13,110,253,0.3);background:rgba(13,17,23,0.8);';
      const right = document.createElement('div');
      right.style.cssText = 'display:flex;gap:4px;';
      const tb = document.createElement('button');
      tb.id = 'logToggleBtn'; tb.textContent = '\u2212'; tb.title = 'Collapse / expand';
      tb.style.cssText = 'background:rgba(13,110,253,0.2);color:#7ab3ff;border:1px solid #0d6efd;border-radius:5px;padding:2px 10px;font-size:12px;cursor:pointer;';
      tb.addEventListener('click', toggleLog);
      const cb = document.createElement('button');
      cb.id = 'logCopyBtn'; cb.textContent = 'Copy'; cb.title = 'Copy logs';
      cb.style.cssText = 'background:rgba(13,110,253,0.2);color:#7ab3ff;border:1px solid #0d6efd;border-radius:5px;padding:2px 10px;font-size:11px;cursor:pointer;';
      cb.addEventListener('click', copyLogs);
      right.appendChild(tb); right.appendChild(cb);
      head.appendChild(right);
      logBox.appendChild(head);
      logBody = document.createElement('div');
      logBody.style.cssText = 'overflow:auto;max-height:285px;padding:6px;';
      logBox.appendChild(logBody);
      document.body.appendChild(logBox);
    }
    const line = document.createElement('div');
    line.textContent = new Date().toISOString().substr(11, 8) + ' ' + msg;
    logBody.appendChild(line);
    logLines.push(line.textContent);
    if (logLines.length > 500) logLines = logLines.slice(-500);
    while (logBody.childNodes.length > 100) logBody.removeChild(logBody.firstChild);
    if (logBody.style.display !== 'none') logBody.scrollTop = logBody.scrollHeight;
  } catch (e) { }
}
class NeuralNetwork {
  constructor(inN, h1N, h2N, outN, lr) {
    this.IN = inN; this.h1N = h1N; this.h2N = h2N; this.OUT = outN; this.lr = lr;
    this.mu = 0.9; this.opt = 'sgd';
    this.beta1 = 0.9; this.beta2 = 0.999; this.eps = 1e-8;
    this.reset();
  }
  reset() {
    const s1 = 1 / Math.sqrt(this.IN), s2 = 1 / Math.sqrt(this.h1N), s3 = 1 / Math.sqrt(this.h2N);
    const z = (r, c) => Array.from({ length: r }, () => new Array(c).fill(0));
    this.w1 = Array.from({ length: this.h1N }, () => Array.from({ length: this.IN }, () => (Math.random() * 2 - 1) * s1));
    this.w2 = Array.from({ length: this.h2N }, () => Array.from({ length: this.h1N }, () => (Math.random() * 2 - 1) * s2));
    this.w3 = Array.from({ length: this.OUT }, () => Array.from({ length: this.h2N }, () => (Math.random() * 2 - 1) * s3));
    this.b1 = new Array(this.h1N).fill(0);
    this.b2 = new Array(this.h2N).fill(0);
    this.b3 = new Array(this.OUT).fill(0);
    this.v1 = z(this.h1N, this.IN); this.m1 = z(this.h1N, this.IN); this.s1 = z(this.h1N, this.IN);
    this.v2 = z(this.h2N, this.h1N); this.m2 = z(this.h2N, this.h1N); this.s2 = z(this.h2N, this.h1N);
    this.v3 = z(this.OUT, this.h2N); this.m3 = z(this.OUT, this.h2N); this.s3 = z(this.OUT, this.h2N);
    this.vb1 = new Array(this.h1N).fill(0); this.mb1 = new Array(this.h1N).fill(0); this.sb1 = new Array(this.h1N).fill(0);
    this.vb2 = new Array(this.h2N).fill(0); this.mb2 = new Array(this.h2N).fill(0); this.sb2 = new Array(this.h2N).fill(0);
    this.vb3 = new Array(this.OUT).fill(0); this.mb3 = new Array(this.OUT).fill(0); this.sb3 = new Array(this.OUT).fill(0);
    this.t = 0;
    this.lastIn = new Array(this.IN).fill(0);
    this.lastH1 = new Array(this.h1N).fill(0);
    this.lastH2 = new Array(this.h2N).fill(0);
    this.lastOut = new Array(this.OUT).fill(0);
  }
  clip() {
    const B = 4.0;
    const fix = (x) => (!isFinite(x) ? (Math.random() * 2 - 1) * 0.3 : Math.max(-B, Math.min(B, x)));
    for (let i = 0; i < this.h1N; i++) {
      for (let j = 0; j < this.IN; j++) this.w1[i][j] = fix(this.w1[i][j]);
      this.b1[i] = fix(this.b1[i]);
    }
    for (let i = 0; i < this.h2N; i++) {
      for (let j = 0; j < this.h1N; j++) this.w2[i][j] = fix(this.w2[i][j]);
      this.b2[i] = fix(this.b2[i]);
    }
    for (let k = 0; k < this.OUT; k++) {
      for (let j = 0; j < this.h2N; j++) this.w3[k][j] = fix(this.w3[k][j]);
      this.b3[k] = fix(this.b3[k]);
    }
  }
  predict(inputs) {
    this.lastIn = [...inputs];
    this.lastH1 = this.w1.map((w, i) => sigmoid(w.reduce((s, v, j) => s + v * inputs[j], this.b1[i])));
    this.lastH2 = this.w2.map((w, i) => sigmoid(w.reduce((s, v, j) => s + v * this.lastH1[j], this.b2[i])));
    const logits = this.w3.map((w, i) => w.reduce((s, v, j) => s + v * this.lastH2[j], this.b3[i]));
    const m = Math.max(...logits);
    const ex = logits.map(x => Math.exp(x - m));
    const sum = ex.reduce((a, b) => a + b, 0);
    this.lastOut = ex.map(e => e / sum);
    return this.lastOut;
  }
  upd(p, i, g, m, s, v, lr, mu, bc1, bc2) {
    const GC = 1.0;
    g = Math.max(-GC, Math.min(GC, g));
    if (this.opt === 'sgd') {
      v[i] = mu * v[i] + lr * g;
      p[i] += v[i];
      return;
    }
    m[i] = this.beta1 * m[i] + (1 - this.beta1) * g;
    s[i] = this.beta2 * s[i] + (1 - this.beta2) * g * g;
    p[i] += lr * (m[i] / bc1) / (Math.sqrt(s[i] / bc2) + this.eps);
  }
  trainStep(inputs, target) {
    const out = this.predict(inputs);
    const lr = this.lr, mu = this.mu, H1 = this.h1N, H2 = this.h2N, OUT = this.OUT;
    if (this.opt === 'adam') this.t++;
    const bc1 = this.opt === 'adam' ? 1 - Math.pow(this.beta1, this.t) : 1;
    const bc2 = this.opt === 'adam' ? 1 - Math.pow(this.beta2, this.t) : 1;
    const dOut = out.map((o, i) => target[i] - o);
    for (let k = 0; k < OUT; k++) {
      this.upd(this.b3, k, dOut[k], this.mb3, this.sb3, this.vb3, lr, mu, bc1, bc2);
      for (let j = 0; j < H2; j++)
        this.upd(this.w3[k], j, dOut[k] * this.lastH2[j], this.m3[k], this.s3[k], this.v3[k], lr, mu, bc1, bc2);
    }
    const d2 = new Array(H2);
    for (let j = 0; j < H2; j++) {
      let e = 0;
      for (let k = 0; k < OUT; k++) e += this.w3[k][j] * dOut[k];
      d2[j] = e * dsigmoid(this.lastH2[j]);
    }
    for (let s = 0; s < H2; s++) {
      this.upd(this.b2, s, d2[s], this.mb2, this.sb2, this.vb2, lr, mu, bc1, bc2);
      for (let t = 0; t < H1; t++)
        this.upd(this.w2[s], t, d2[s] * this.lastH1[t], this.m2[s], this.s2[s], this.v2[s], lr, mu, bc1, bc2);
    }
    const d1 = new Array(H1);
    for (let t = 0; t < H1; t++) {
      let e = 0;
      for (let s = 0; s < H2; s++) e += this.w2[s][t] * d2[s];
      d1[t] = e * dsigmoid(this.lastH1[t]);
    }
    for (let t = 0; t < H1; t++) {
      this.upd(this.b1, t, d1[t], this.mb1, this.sb1, this.vb1, lr, mu, bc1, bc2);
      for (let j = 0; j < this.IN; j++)
        this.upd(this.w1[t], j, d1[t] * inputs[j], this.m1[t], this.s1[t], this.v1[t], lr, mu, bc1, bc2);
    }
    let ce = 0;
    for (let k = 0; k < OUT; k++) ce -= target[k] * Math.log(Math.max(1e-9, out[k]));
    return ce;
  }
}
function winLine(b) {
  for (const l of LINES) {
    if (b[l[0]] !== 0 && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return b[l[0]];
  }
  return 0;
}
function isFull(b) {
  return b.indexOf(0) < 0;
}
function encodeBoard(b) {
  const inp = new Array(IN).fill(0);
  for (let i = 0; i < 9; i++) {
    const c = b[i];
    if (c === 1) inp[i * 3] = 1;
    else if (c === 2) inp[i * 3 + 1] = 1;
    else inp[i * 3 + 2] = 1;
  }
  return inp;
}
function targetsFromMoves(list) {
  const a = new Array(OUT).fill(0);
  const k = list.length;
  for (const m of list) a[m] = 1 / k;
  return a;
}
function legalCells(b) {
  const l = [];
  for (let i = 0; i < 9; i++) if (b[i] === 0) l.push(i);
  return l;
}
const stateMap = new Map();
const states = [];
function genState(b, turn) {
  const key = b.join(',');
  if (stateMap.has(key)) return stateMap.get(key);
  const idx = states.length;
  stateMap.set(key, idx);
  states.push({ b: b.slice(), turn: turn });
  if (winLine(b) || isFull(b)) return idx;
  for (let i = 0; i < 9; i++) {
    if (b[i] === 0) { b[i] = turn; genState(b, turn === 1 ? 2 : 1); b[i] = 0; }
  }
  return idx;
}
genState(new Array(9).fill(0), 1);
const mmv = new Float64Array(states.length);
const mmc = new Array(states.length).fill(0);
function mmValue(idx) {
  if (mmc[idx]) return mmv[idx];
  const s = states[idx];
  const w = winLine(s.b);
  if (w || isFull(s.b)) { mmc[idx] = 1; mmv[idx] = w === 1 ? 1 : (w === 2 ? -1 : 0); return mmv[idx]; }
  const player = s.turn;
  let best = player === 1 ? -2 : 2;
  for (let i = 0; i < 9; i++) {
    if (s.b[i] === 0) {
      s.b[i] = player;
      const v = mmValue(stateMap.get(s.b.join(',')));
      s.b[i] = 0;
      if (player === 1) { if (v > best) best = v; } else { if (v < best) best = v; }
    }
  }
  mmc[idx] = 1;
  mmv[idx] = best;
  return best;
}
for (let i = 0; i < states.length; i++) mmValue(i);
const bestCache = [];
for (let i = 0; i < states.length; i++) {
  const s = states[i];
  const w = winLine(s.b);
  if (w || isFull(s.b)) { bestCache[i] = []; continue; }
  const list = [];
  const player = s.turn;
  for (let m = 0; m < 9; m++) {
    if (s.b[m] === 0) {
      s.b[m] = player;
      const v = mmValue(stateMap.get(s.b.join(',')));
      s.b[m] = 0;
      if (v === mmv[i]) list.push(m);
    }
  }
  bestCache[i] = list;
}
const netCanvas = document.getElementById('netCanvas');
const nCtx = netCanvas.getContext('2d');
const lossCanvas = document.getElementById('lossCanvas');
const lCtx = lossCanvas.getContext('2d');
const nn = new NeuralNetwork(IN, H1N, H2N, OUT, 0.02);
let dataset = [];
function buildDataset() {
  dataset = [];
  for (let i = 0; i < states.length; i++) {
    const bm = bestCache[i];
    if (!bm.length) continue;
    dataset.push({ inputs: encodeBoard(states[i].b), targets: targetsFromMoves(bm), idx: i, legal: legalCells(states[i].b) });
  }
  document.getElementById('datasetStats').textContent = 'Policy data: ' + dataset.length + ' minimax positions';
}
buildDataset();
function diagnostics() {
  let full = 0, forced = 0, forcedOk = 0, xN = 0, xOk = 0, oN = 0, oOk = 0, maxW = 0;
  for (const s of dataset) {
    const out = nn.predict(s.inputs);
    let best = -1, bv = -Infinity;
    for (const i of s.legal) { if (out[i] > bv) { bv = out[i]; best = i; } }
    const bm = bestCache[s.idx];
    const ok = bm.indexOf(best) >= 0;
    if (ok) full++;
    if (bm.length === 1) { forced++; if (ok) forcedOk++; }
    if (states[s.idx].turn === 1) { xN++; if (ok) xOk++; } else { oN++; if (ok) oOk++; }
  }
  for (const r of nn.w1) for (const v of r) { const a = Math.abs(v); if (a > maxW) maxW = a; }
  for (const r of nn.w2) for (const v of r) { const a = Math.abs(v); if (a > maxW) maxW = a; }
  for (const r of nn.w3) for (const v of r) { const a = Math.abs(v); if (a > maxW) maxW = a; }
  return {
    acc: dataset.length ? full / dataset.length : 0,
    forced: forced ? forcedOk / forced : 0,
    xAcc: xN ? xOk / xN : 0,
    oAcc: oN ? oOk / oN : 0,
    maxW: maxW
  };
}
let gameBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let userSide = 1;
let gameOver = false;
let netThinking = false;
let finishing = false;
let wins = 0;
let draws = 0;
let losses = 0;
let epoch = 0;
let bestLoss = Infinity;
let isTraining = false;
let smoothedLoss = null;
let lossHistory = [];
let accHistory = [];
let accCache = 0;
let fastRemaining = 0;
let accTick = 0;
let historyTick = 0;
let toastTimer = 0;
let anim = 0;
const boardBox = document.getElementById('board');
for (let i = 0; i < 9; i++) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'cell';
  b.onclick = () => cellClick(i);
  boardBox.appendChild(b);
}
function renderBoard() {
  const cells = boardBox.children;
  for (let i = 0; i < 9; i++) {
    const c = gameBoard[i];
    cells[i].textContent = c === 1 ? 'X' : (c === 2 ? 'O' : '');
    cells[i].className = 'cell' + (c === 1 ? ' x' : (c === 2 ? ' o' : ''));
    cells[i].disabled = c !== 0 || gameOver || netThinking || finishing;
  }
}
function netSide() {
  return userSide === 1 ? 2 : 1;
}
function updateStatus() {
  const el = document.getElementById('gameStatus');
  if (gameOver) return;
  if (finishing) { el.textContent = '...'; return; }
  if (netThinking) { el.textContent = 'Brain is thinking...'; return; }
  const who = userSide === 1 ? 'X' : 'O';
  el.textContent = 'Your turn - ' + who;
}
function setStatus(txt) {
  document.getElementById('gameStatus').textContent = txt;
}
function updateScore() {
  document.getElementById('scoreLine').textContent = 'You: ' + wins + ' W / ' + draws + ' D / ' + losses + ' L';
}
function place(i, p) {
  gameBoard[i] = p;
  renderBoard();
}
function finish(w) {
  gameOver = true;
  netThinking = false;
  if (w === 0) { draws++; setStatus('Draw - a perfect game'); log('result: draw'); }
  else if (w === userSide) { wins++; setStatus('You win!'); log('result: you win'); showToast('You beat the brain!', true); }
  else { losses++; setStatus('The brain wins - it never loses when trained'); log('result: brain wins'); showToast('The brain wins', false); }
  updateScore();
  renderBoard();
}
function scheduleNet() {
  if (gameOver || finishing) return;
  netThinking = true;
  renderBoard();
  updateStatus();
  setTimeout(() => {
    netThinking = false;
    netMove();
  }, 420);
}
function cellClick(i) {
  if (gameOver || netThinking || finishing) return;
  if (gameBoard[i] !== 0) return;
  place(i, userSide);
  log('you -> cell ' + (i + 1));
  const w = winLine(gameBoard);
  if (w || isFull(gameBoard)) {
    finishing = true;
    setStatus('...');
    renderBoard();
    setTimeout(() => { finishing = false; finish(w); }, 550);
    return;
  }
  scheduleNet();
}
function netMove() {
  if (gameOver || finishing) return;
  const out = nn.predict(encodeBoard(gameBoard));
  let best = -1, bv = -Infinity;
  const cand = [];
  for (let i = 0; i < 9; i++) {
    if (gameBoard[i] === 0) {
      cand.push({ i: i, v: out[i] });
      if (out[i] > bv) { bv = out[i]; best = i; }
    }
  }
  cand.sort((a, b) => b.v - a.v);
  const top = cand.slice(0, 3).map(c => String(c.i + 1) + ':' + Math.round(c.v * 100) + '%').join(' ');
  if (best < 0) { netThinking = false; renderBoard(); updateStatus(); return; }
  place(best, netSide());
  log('net -> cell ' + (best + 1) + ' tops: ' + top);
  const w = winLine(gameBoard);
  if (w || isFull(gameBoard)) {
    finishing = true;
    setStatus('...');
    renderBoard();
    setTimeout(() => { finishing = false; finish(w); }, 550);
    return;
  }
  netThinking = false;
  renderBoard();
  updateStatus();
}
function newGame() {
  gameBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  gameOver = false;
  netThinking = false;
  finishing = false;
  renderBoard();
  updateScore();
  log('new game - you play ' + (userSide === 1 ? 'X' : 'O'));
  if (userSide === 2) scheduleNet();
  else updateStatus();
}
function setSide(s) {
  userSide = s;
  document.getElementById('sideX').classList.toggle('active', s === 1);
  document.getElementById('sideO').classList.toggle('active', s === 2);
  newGame();
}
function toggleTrain() {
  isTraining = !isTraining;
  document.getElementById('trainBtn').textContent = isTraining ? 'Pause' : 'Start Training';
}
function trainEpoch() {
  let loss = 0;
  for (let k = 0; k < stepsPerEpoch; k++) {
    const s = dataset[Math.floor(Math.random() * dataset.length)];
    loss += nn.trainStep(s.inputs, s.targets);
  }
  nn.clip();
  epoch++;
  const avg = loss / stepsPerEpoch;
  smoothedLoss = smoothedLoss === null ? avg : smoothedLoss + (avg - smoothedLoss) * 0.3;
  if (avg < bestLoss) bestLoss = avg;
  historyTick++;
  if (historyTick % 2 === 0) {
    lossHistory.push(smoothedLoss);
    accHistory.push(accCache);
    if (lossHistory.length > 120) { lossHistory.shift(); accHistory.shift(); }
  }
}
function trainEpochs(n) {
  isTraining = false;
  document.getElementById('trainBtn').textContent = 'Start Training';
  fastRemaining = n;
  log('fastLearn start epochs=' + n + ' lr=' + nn.lr + ' opt=' + nn.opt.toUpperCase());
  showToast('Fast Learn - ' + n + ' epochs', true);
}
function resetNetwork() {
  isTraining = false;
  fastRemaining = 0;
  document.getElementById('trainBtn').textContent = 'Start Training';
  nn.reset();
  epoch = 0;
  bestLoss = Infinity;
  smoothedLoss = null;
  lossHistory = [];
  accHistory = [];
  accCache = 0;
  document.getElementById('trainStats').textContent = 'Epoch: 0 | Loss: - | Policy Acc: 0%';
  document.getElementById('lossStats').textContent = 'Current: - | Best: -';
  log('network reset');
  showToast('Network reset - train again', true);
}
function setLR(v, btn) {
  nn.lr = v;
  document.querySelectorAll('.lr-btn').forEach(b => b.classList.toggle('active', b === btn));
  log('learning rate = ' + v);
  showToast('Learning rate = ' + v, true);
}
function setOpt(name, btn) {
  nn.opt = name;
  document.querySelectorAll('.opt-btn').forEach(b => b.classList.toggle('active', b === btn));
  if (name === 'adam') {
    nn.t = 0;
    nn.m1.forEach(a => a.fill(0)); nn.s1.forEach(a => a.fill(0));
    nn.m2.forEach(a => a.fill(0)); nn.s2.forEach(a => a.fill(0));
    nn.m3.forEach(a => a.fill(0)); nn.s3.forEach(a => a.fill(0));
    nn.mb1.fill(0); nn.sb1.fill(0); nn.mb2.fill(0); nn.sb2.fill(0); nn.mb3.fill(0); nn.sb3.fill(0);
  } else {
    nn.v1.forEach(a => a.fill(0));
    nn.v2.forEach(a => a.fill(0));
    nn.v3.forEach(a => a.fill(0));
    nn.vb1.fill(0); nn.vb2.fill(0); nn.vb3.fill(0);
  }
  log('optimizer = ' + name.toUpperCase());
  showToast('Optimizer: ' + name.toUpperCase(), true);
}
function exportModel() {
  const data = {
    kind: 'tic-tac-toe-brain',
    arch: '27-48-32-9',
    lr: nn.lr,
    opt: nn.opt,
    w1: nn.w1,
    w2: nn.w2,
    w3: nn.w3,
    b1: nn.b1,
    b2: nn.b2,
    b3: nn.b3
  };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tic-tac-toe-brain-model.json';
  a.click();
  URL.revokeObjectURL(a.href);
  log('model exported');
  showToast('Model exported', true);
}
function importModel() {
  document.getElementById('modelFile').click();
}
function onImportFile(e) {
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.w1) || !Array.isArray(data.w2) || !Array.isArray(data.w3)) throw new Error('bad');
      isTraining = false;
      fastRemaining = 0;
      document.getElementById('trainBtn').textContent = 'Start Training';
      nn.lr = typeof data.lr === 'number' ? data.lr : nn.lr;
      nn.opt = (data.opt === 'sgd' || data.opt === 'adam') ? data.opt : nn.opt;
      nn.w1 = data.w1;
      nn.w2 = data.w2;
      nn.w3 = data.w3;
      nn.b1 = Array.isArray(data.b1) ? data.b1 : nn.b1;
      nn.b2 = Array.isArray(data.b2) ? data.b2 : nn.b2;
      nn.b3 = Array.isArray(data.b3) ? data.b3 : nn.b3;
      nn.t = 0;
      nn.v1.forEach(a => a.fill(0)); nn.v2.forEach(a => a.fill(0)); nn.v3.forEach(a => a.fill(0));
      nn.vb1.fill(0); nn.vb2.fill(0); nn.vb3.fill(0);
      nn.m1.forEach(a => a.fill(0)); nn.s1.forEach(a => a.fill(0));
      nn.m2.forEach(a => a.fill(0)); nn.s2.forEach(a => a.fill(0));
      nn.m3.forEach(a => a.fill(0)); nn.s3.forEach(a => a.fill(0));
      nn.mb1.fill(0); nn.sb1.fill(0); nn.mb2.fill(0); nn.sb2.fill(0); nn.mb3.fill(0); nn.sb3.fill(0);
      epoch = 0; bestLoss = Infinity; smoothedLoss = null;
      lossHistory = []; accHistory = [];
      accCache = diagnostics().acc;
      document.querySelectorAll('.lr-btn').forEach(b => b.classList.toggle('active', Math.abs(+b.dataset.lr - nn.lr) < 1e-9));
      document.querySelectorAll('.opt-btn').forEach(b => b.classList.toggle('active', b.dataset.opt === nn.opt));
      log('model imported arch=27-48-32-9');
      showToast('Model imported - trained brain loaded', true);
    } catch (err) {
      log('import failed - bad file');
      showToast('Import failed - bad file', false);
    }
  };
  reader.readAsText(f);
  e.target.value = '';
}
function showToast(msg, ok) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = ok === false ? '#ff5252' : '#00e676';
  t.style.background = ok === false ? '#321f1f' : '#1f3227';
  t.style.color = ok === false ? '#ff5252' : '#00e676';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(el) {
  el.closest('.modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal-overlay').forEach(o =>
  o.addEventListener('click', e => {
    if (e.target === o) { o.classList.remove('open'); document.body.style.overflow = ''; }
  }));
window.addEventListener('keydown', e => {
  if (e.key === 'Escape')
    document.querySelectorAll('.modal-overlay.open').forEach(o => {
      o.classList.remove('open');
      document.body.style.overflow = '';
    });
});
function rgba(r, g, b, a) {
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}
function drawSynapse(a, b, w, pos, neg, maxW, wMax) {
  nCtx.beginPath();
  nCtx.moveTo(a.x, a.y);
  nCtx.lineTo(b.x, b.y);
  nCtx.strokeStyle = w >= 0 ? pos : neg;
  nCtx.lineWidth = Math.max(0.4, Math.min(maxW, Math.abs(w) * (maxW / wMax)));
  nCtx.stroke();
}
function drawOrb(x, y, v, baseR, phase, col, label, darkText) {
  const a = Math.max(0, Math.min(1, v));
  const pulse = 1 + 0.1 * Math.sin(anim * 3.4 + phase);
  const rad = Math.max(2, baseR * (0.6 + 0.85 * a) * pulse);
  const halo = rad * 2.9;
  let g = nCtx.createRadialGradient(x, y, rad * 0.2, x, y, halo);
  g.addColorStop(0, rgba(col[0], col[1], col[2], 0.4 * a));
  g.addColorStop(0.6, rgba(col[0], col[1], col[2], 0.12 * a));
  g.addColorStop(1, rgba(col[0], col[1], col[2], 0));
  nCtx.fillStyle = g;
  nCtx.beginPath();
  nCtx.arc(x, y, halo, 0, Math.PI * 2);
  nCtx.fill();
  g = nCtx.createRadialGradient(x - rad * 0.35, y - rad * 0.4, rad * 0.1, x, y, rad);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.38, rgba(Math.min(255, col[0] + 80), Math.min(255, col[1] + 80), Math.min(255, col[2] + 80), 0.95));
  g.addColorStop(1, rgba(col[0], col[1], col[2], 0.6));
  nCtx.fillStyle = g;
  nCtx.beginPath();
  nCtx.arc(x, y, rad, 0, Math.PI * 2);
  nCtx.fill();
  nCtx.beginPath();
  nCtx.arc(x, y, rad * 1.16, 0, Math.PI * 2);
  nCtx.strokeStyle = rgba(col[0], col[1], col[2], 0.3 + 0.55 * a);
  nCtx.lineWidth = 1 + 1.4 * a;
  nCtx.stroke();
  if (label) {
    nCtx.fillStyle = darkText ? '#0a0a0a' : '#fff';
    nCtx.font = 'bold 14px sans-serif';
    nCtx.textAlign = 'center';
    nCtx.textBaseline = 'middle';
    nCtx.fillText(label, x, y);
  }
}
const IN_COLS = [[13, 110, 253], [244, 107, 192], [70, 85, 110]];
function inGroupPos(i) {
  const row = Math.floor(i / 3), col = i % 3;
  return { x: 26 + col * 64 + 20, y: 84 + row * 104 };
}
function outPos(i) {
  const row = Math.floor(i / 3), col = i % 3;
  return { x: 490 + col * 56 + 22, y: 90 + row * 126 };
}
function drawNetwork() {
  nCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const inPts = [];
  for (let i = 0; i < 9; i++) {
    const p = inGroupPos(i);
    inPts.push([{ x: p.x - 15, y: p.y }, { x: p.x, y: p.y }, { x: p.x + 15, y: p.y }]);
  }
  const h1X = 300;
  const h1Step = CANVAS_H / (H1N + 1);
  const h1Y = [];
  for (let i = 0; i < H1N; i++) h1Y.push(h1Step * (i + 1));
  const h2X = 400;
  const h2Step = CANVAS_H / (H2N + 1);
  const h2Y = [];
  for (let i = 0; i < H2N; i++) h2Y.push(h2Step * (i + 1));
  const outPts = [];
  for (let o = 0; o < OUT; o++) {
    const p = outPos(o);
    outPts.push({ x: p.x, y: p.y });
  }
  let wMax = 0.001;
  for (let i = 0; i < H1N; i++) for (let j = 0; j < IN; j++) { const aw = Math.abs(nn.w1[i][j]); if (aw > wMax) wMax = aw; }
  for (let i = 0; i < H2N; i++) for (let j = 0; j < H1N; j++) { const aw = Math.abs(nn.w2[i][j]); if (aw > wMax) wMax = aw; }
  for (let k = 0; k < OUT; k++) for (let i = 0; i < H2N; i++) { const aw = Math.abs(nn.w3[k][i]); if (aw > wMax) wMax = aw; }
  for (let i = 0; i < H1N; i++)
    for (let c = 0; c < 9; c++) for (let k = 0; k < 3; k++)
      drawSynapse({ x: inPts[c][k].x, y: inPts[c][k].y }, { x: h1X, y: h1Y[i] }, nn.w1[i][c * 3 + k], 'rgba(0,210,255,0.12)', 'rgba(255,82,82,0.12)', 1.6, wMax);
  for (let i = 0; i < H2N; i++)
    for (let j = 0; j < H1N; j++)
      drawSynapse({ x: h1X, y: h1Y[j] }, { x: h2X, y: h2Y[i] }, nn.w2[i][j], 'rgba(0,210,255,0.14)', 'rgba(255,82,82,0.14)', 1.8, wMax);
  for (let o = 0; o < OUT; o++)
    for (let i = 0; i < H2N; i++)
      drawSynapse({ x: h2X, y: h2Y[i] }, { x: outPts[o].x, y: outPts[o].y }, nn.w3[o][i], 'rgba(0,230,118,0.35)', 'rgba(255,82,82,0.3)', 2, wMax);
  for (let c = 0; c < 9; c++) for (let k = 0; k < 3; k++)
    drawOrb(inPts[c][k].x, inPts[c][k].y, nn.lastIn[c * 3 + k], 8, (c * 3 + k) * 0.8, IN_COLS[k], null, false);
  for (let i = 0; i < H1N; i++) drawOrb(h1X, h1Y[i], nn.lastH1[i], 4, i * 0.5, [0, 190, 255], null, false);
  for (let i = 0; i < H2N; i++) drawOrb(h2X, h2Y[i], nn.lastH2[i], 5, i * 0.6, [0, 170, 255], null, false);
  const win = argmax(nn.lastOut);
  for (let o = 0; o < OUT; o++) {
    const v = nn.lastOut[o];
    const isWin = o === win;
    const col = isWin ? [0, 230, 118] : (v > 0.12 ? [0, 210, 255] : [70, 90, 110]);
    drawOrb(outPts[o].x, outPts[o].y, v, 16, o, col, String(o + 1), col[0] < 140);
    if (isWin) {
      const wr = 20 + 2 * Math.sin(anim * 5);
      nCtx.beginPath();
      nCtx.arc(outPts[o].x, outPts[o].y, wr, 0, Math.PI * 2);
      nCtx.strokeStyle = rgba(0, 230, 118, 0.5 + 0.3 * Math.sin(anim * 5));
      nCtx.lineWidth = 2;
      nCtx.stroke();
    }
  }
  nCtx.fillStyle = '#555';
  nCtx.font = '10px sans-serif';
  nCtx.textAlign = 'center';
  nCtx.fillText('best move', 490 + 2 * 56 + 22, 84);
}
const LOSS_W = 300;
const LOSS_H = 230;
function setupLoss() {
  const dpr = window.devicePixelRatio || 1;
  lossCanvas.width = Math.round(LOSS_W * dpr);
  lossCanvas.height = Math.round(LOSS_H * dpr);
  lossCanvas.style.width = LOSS_W + 'px';
  lossCanvas.style.height = LOSS_H + 'px';
  lCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function drawLossGraph() {
  const W = LOSS_W, H = LOSS_H;
  const data = lossHistory, ac = accHistory;
  lCtx.clearRect(0, 0, W, H);
  lCtx.strokeStyle = '#242424';
  lCtx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const y = Math.round(H * i / 4);
    lCtx.beginPath();
    lCtx.moveTo(0, y);
    lCtx.lineTo(W, y);
    lCtx.stroke();
  }
  if (data.length === 0) {
    lCtx.fillStyle = '#9a9a9a';
    lCtx.font = '13px sans-serif';
    lCtx.textAlign = 'center';
    lCtx.textBaseline = 'middle';
    lCtx.fillText('Train to draw the curves', W / 2, H / 2);
    return;
  }
  let lo = Math.min(...data), hi = Math.max(...data), range = hi - lo;
  if (range < 1e-6) { lo = Math.max(0, lo - 0.05); hi += 0.05; range = hi - lo; }
  range = Math.max(range, 1e-6);
  const padL = 10, padR = 10, padT = 30, padB = 28;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const xFor = i => padL + (data.length === 1 ? innerW : innerW * i / (data.length - 1));
  const yFor = l => padT + (1 - (l - lo) / range) * innerH;
  lCtx.textBaseline = 'top';
  lCtx.textAlign = 'left';
  lCtx.fillStyle = '#9a9a9a';
  lCtx.font = '11px sans-serif';
  lCtx.fillText(hi.toFixed(3), padL, 6);
  lCtx.textAlign = 'right';
  lCtx.fillStyle = '#00e676';
  lCtx.fillText('loss', W - padR, 6);
  lCtx.fillStyle = 'rgba(0,210,255,0.9)';
  lCtx.fillText('acc', W - padR, 22);
  lCtx.textBaseline = 'bottom';
  lCtx.textAlign = 'left';
  lCtx.fillStyle = '#9a9a9a';
  lCtx.fillText(lo.toFixed(3), padL, H - 8);
  lCtx.textAlign = 'right';
  lCtx.fillStyle = '#9a9a9a';
  lCtx.fillText('epoch ' + epoch, W - padR, H - 22);
  const lastAcc = ac.length ? ac[ac.length - 1] : accCache;
  lCtx.fillStyle = 'rgba(0,210,255,0.9)';
  lCtx.fillText(Math.round(lastAcc * 100) + '%', W - padR, H - 8);
  lCtx.beginPath();
  lCtx.strokeStyle = '#00e676';
  lCtx.lineWidth = 2.5;
  data.forEach((loss, idx) => {
    const x = xFor(idx), y = yFor(loss);
    idx === 0 ? lCtx.moveTo(x, y) : lCtx.lineTo(x, y);
  });
  lCtx.stroke();
  if (ac.length > 1) {
    lCtx.setLineDash([5, 4]);
    lCtx.beginPath();
    lCtx.strokeStyle = 'rgba(0,210,255,0.9)';
    lCtx.lineWidth = 1.6;
    ac.forEach((a, idx) => {
      const x = xFor(idx), y = padT + innerH * (1 - a);
      idx === 0 ? lCtx.moveTo(x, y) : lCtx.lineTo(x, y);
    });
    lCtx.stroke();
    lCtx.setLineDash([]);
  }
}
function updateStats() {
  document.getElementById('trainStats').textContent =
    'Epoch: ' + epoch + ' | Loss: ' + (smoothedLoss === null ? '-' : smoothedLoss.toFixed(4)) +
    ' | Policy Acc: ' + Math.round(accCache * 100) + '%';
  document.getElementById('lossStats').textContent =
    'Current: ' + (smoothedLoss === null ? '-' : smoothedLoss.toFixed(4)) +
    ' | Best: ' + (bestLoss === Infinity ? '-' : bestLoss.toFixed(4));
}
function loop() {
  anim = performance.now() / 1000;
  if (isTraining) trainEpoch();
  if (fastRemaining > 0) {
    const chunk = Math.min(10, fastRemaining);
    for (let e = 0; e < chunk; e++) trainEpoch();
    fastRemaining -= chunk;
    if (fastRemaining <= 0) {
      isTraining = false;
      accCache = diagnostics().acc;
      document.getElementById('trainBtn').textContent = 'Start Training';
      const line = diagnostics();
      log('fastLearn done acc=' + Math.round(line.acc * 100) + '% forced=' + Math.round(line.forced * 100) + '% x=' + Math.round(line.xAcc * 100) + '% o=' + Math.round(line.oAcc * 100) + '% maxW=' + line.maxW.toFixed(3));
      showToast('Fast Learn done - policy acc ' + Math.round(accCache * 100) + '%', true);
    }
  }
  accTick++;
  if (accTick % 20 === 0 && (isTraining || fastRemaining > 0)) {
    const d = diagnostics();
    accCache = d.acc;
    if (accTick % 60 === 0) {
      log('e=' + epoch + ' loss=' + (smoothedLoss === null ? '-' : smoothedLoss.toFixed(4)) +
        ' acc=' + Math.round(d.acc * 100) + '% forced=' + Math.round(d.forced * 100) + '%' +
        ' x=' + Math.round(d.xAcc * 100) + '% o=' + Math.round(d.oAcc * 100) + '% maxW=' + d.maxW.toFixed(3));
    }
    if (accCache >= ACC_STOP) {
      isTraining = false;
      fastRemaining = 0;
      document.getElementById('trainBtn').textContent = 'Start Training';
      log('autoStop acc=' + Math.round(accCache * 100) + '% forced=' + Math.round(d.forced * 100) + '%');
      showToast('100% policy learned - training stopped', true);
    }
  }
  nn.predict(encodeBoard(gameBoard));
  drawNetwork();
  drawLossGraph();
  updateStats();
  requestAnimationFrame(loop);
}
log('init arch=27-48-32-9 states=' + states.length + ' dataset=' + dataset.length + ' opt=' + nn.opt + ' lr=' + nn.lr);
renderBoard();
updateScore();
updateStats();
setStatus('Your turn - X');
setupLoss();
loop();