const CANVAS_W = 640;
const CANVAS_H = 470;
const IN = 10;
const HID = 16;
const OUT = 36;
const MAX_LEN = 5;
const ACC_STOP = 0.99;
const stepsPerEpoch = 128;
const KEYS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
const CODES = ['.-','-...','-.-.','-..','.','..-.','--.','....','..','.---','-.-','.-..','--','-.','---','.--.','--.-','.-.','...','-','..-','...-','.--','-..-','-.--','--..','-----','.----','..---','...--','....-','.....','-....','--...','---..','----.'];
const MORSE = KEYS.map((ch, i) => ({ ch: ch, code: CODES[i], idx: i }));
const NC = MORSE.length;
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function dsigmoid(y) { return y * (1 - y); }
function argmax(arr) { let b = 0; for (let i = 1; i < arr.length; i++) if (arr[i] > arr[b]) b = i; return b; }
class NeuralNetwork {
  constructor(inN, hidN, outN, lr) {
    this.inN = inN; this.hidN = hidN; this.outN = outN; this.lr = lr;
    this.mu = 0.9; this.opt = 'sgd';
    this.beta1 = 0.9; this.beta2 = 0.999; this.eps = 1e-8;
    this.reset();
  }
  reset() {
    const s1 = 1 / Math.sqrt(this.inN), s2 = 1 / Math.sqrt(this.hidN);
    this.wIH = Array.from({ length: this.hidN }, () =>
      Array.from({ length: this.inN }, () => (Math.random() * 2 - 1) * s1));
    this.wHO = Array.from({ length: this.outN }, () =>
      Array.from({ length: this.hidN }, () => (Math.random() * 2 - 1) * s2));
    this.bH = new Array(this.hidN).fill(0);
    this.bO = new Array(this.outN).fill(0);
    this.vWIH = Array.from({ length: this.hidN }, () => new Array(this.inN).fill(0));
    this.vWHO = Array.from({ length: this.outN }, () => new Array(this.hidN).fill(0));
    this.vBH = new Array(this.hidN).fill(0);
    this.vBO = new Array(this.outN).fill(0);
    this.mWIH = Array.from({ length: this.hidN }, () => new Array(this.inN).fill(0));
    this.sWIH = Array.from({ length: this.hidN }, () => new Array(this.inN).fill(0));
    this.mWHO = Array.from({ length: this.outN }, () => new Array(this.hidN).fill(0));
    this.sWHO = Array.from({ length: this.outN }, () => new Array(this.hidN).fill(0));
    this.mBH = new Array(this.hidN).fill(0);
    this.sBH = new Array(this.hidN).fill(0);
    this.mBO = new Array(this.outN).fill(0);
    this.sBO = new Array(this.outN).fill(0);
    this.t = 0;
    this.lastIn = new Array(this.inN).fill(0);
    this.lastHid = new Array(this.hidN).fill(0);
    this.lastOut = new Array(this.outN).fill(0);
  }
  predict(inputs) {
    this.lastIn = [...inputs];
    this.lastHid = this.wIH.map((w, i) =>
      sigmoid(w.reduce((s, v, j) => s + v * inputs[j], this.bH[i])));
    const logits = this.wHO.map((w, i) =>
      w.reduce((s, v, j) => s + v * this.lastHid[j], this.bO[i]));
    const m = Math.max(...logits);
    const ex = logits.map(z => Math.exp(z - m));
    const sum = ex.reduce((a, b) => a + b, 0);
    this.lastOut = ex.map(e => e / sum);
    return this.lastOut;
  }
  upd(p, i, g, m, s, v, lr, mu, bc1, bc2) {
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
    const lr = this.lr, mu = this.mu;
    if (this.opt === 'adam') this.t++;
    const bc1 = this.opt === 'adam' ? 1 - Math.pow(this.beta1, this.t) : 1;
    const bc2 = this.opt === 'adam' ? 1 - Math.pow(this.beta2, this.t) : 1;
    const dOut = out.map((o, i) => target[i] - o);
    for (let k = 0; k < this.outN; k++) {
      this.upd(this.bO, k, dOut[k], this.mBO, this.sBO, this.vBO, lr, mu, bc1, bc2);
      for (let j = 0; j < this.hidN; j++)
        this.upd(this.wHO[k], j, dOut[k] * this.lastHid[j], this.mWHO[k], this.sWHO[k], this.vWHO[k], lr, mu, bc1, bc2);
    }
    for (let i = 0; i < this.hidN; i++) {
      let err = 0;
      for (let k = 0; k < this.outN; k++) err += this.wHO[k][i] * dOut[k];
      const dH = err * dsigmoid(this.lastHid[i]);
      this.upd(this.bH, i, dH, this.mBH, this.sBH, this.vBH, lr, mu, bc1, bc2);
      for (let j = 0; j < this.inN; j++)
        this.upd(this.wIH[i], j, dH * inputs[j], this.mWIH[i], this.sWIH[i], this.vWIH[i], lr, mu, bc1, bc2);
    }
    let ce = 0;
    for (let k = 0; k < this.outN; k++) ce -= target[k] * Math.log(Math.max(1e-9, out[k]));
    return ce;
  }
}
let actx = null;
function ensureAudio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
}
function tone(dur, freq) {
  const t = actx.currentTime;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.45, t + 0.004);
  g.gain.setValueAtTime(0.45, t + Math.max(0.01, dur - 0.02));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(actx.destination);
  o.start(t); o.stop(t + dur + 0.05);
}
function keyClick() {
  const t = actx.currentTime;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(1400, t);
  o.frequency.exponentialRampToValueAtTime(320, t + 0.03);
  g.gain.setValueAtTime(0.10, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  o.connect(g); g.connect(actx.destination);
  o.start(t); o.stop(t + 0.035);
}
function playDot() { ensureAudio(); tone(0.075, 680); keyClick(); }
function playDash() { ensureAudio(); tone(0.22, 680); keyClick(); }
function playSpace() { ensureAudio(); keyClick(); }
function encode(code) {
  const inp = new Array(IN).fill(0);
  for (let p = 0; p < code.length; p++) {
    if (code[p] === '.') inp[p * 2] = 1;
    else inp[p * 2 + 1] = 1;
  }
  return inp;
}
function targetsFor(c) {
  const a = new Array(NC).fill(0);
  a[c] = 1;
  return a;
}
const dotKey = document.getElementById('dotKey');
const dashKey = document.getElementById('dashKey');
const netCanvas = document.getElementById('netCanvas');
const nCtx = netCanvas.getContext('2d');
const lossCanvas = document.getElementById('lossCanvas');
const lCtx = lossCanvas.getContext('2d');
const nn = new NeuralNetwork(IN, HID, OUT, 0.25);
let dataset = [];
function buildDataset() {
  dataset = MORSE.map(m => ({ inputs: encode(m.code), targets: targetsFor(m.idx), idx: m.idx }));
}
buildDataset();
let buffer = [];
let word = '';
let epoch = 0;
let bestLoss = Infinity;
let isTraining = false;
let smoothedLoss = null;
let lossHistory = [];
let accHistory = [];
let accCache = 0;
let fastRemaining = 0;
let bestAcc = 0;
let bestWeights = null;
let plateau = 0;
let accTick = 0;
let historyTick = 0;
let toastTimer = 0;
let anim = 0;
function renderCode() {
  document.getElementById('codeLine').textContent = buffer.length ? buffer.join(' ') : '';
}
function renderWord() {
  document.getElementById('wordLine').textContent = word;
}
function renderTop(top) {
  const box = document.getElementById('topGuesses');
  if (!top.length) { box.innerHTML = '<i class="dim">press the key</i>'; return; }
  box.innerHTML = top.map((t, i) => {
    const m = MORSE[t.idx];
    return '<div class="g-row' + (i === 0 ? ' top' : '') + '"><b>' + m.ch + '</b><span>' + m.code + '</span><i>' + Math.round(t.v * 100) + '%</i></div>';
  }).join('');
}
function updatePrediction() {
  if (!buffer.length) {
    nn.predict(new Array(IN).fill(0));
    document.getElementById('predText').textContent = 'Answer: -';
    renderTop([]);
    return;
  }
  const out = nn.predict(encode(buffer.join('')));
  const best = argmax(out);
  const pct = Math.round(out[best] * 100);
  document.getElementById('predText').textContent = 'Answer: ' + MORSE[best].ch + ' (' + pct + '%)';
  const top = MORSE.map((m, i) => ({ idx: i, v: out[i] })).sort((a, b) => b.v - a.v).slice(0, 3);
  renderTop(top);
}
function appendSym(sym) {
  if (buffer.length >= MAX_LEN) { showToast('Max ' + MAX_LEN + ' symbols - press Space', false); return; }
  buffer.push(sym);
  renderCode();
  updatePrediction();
}
function pressDot() { playDot(); dotKey.classList.add('active'); appendSym('.'); }
function releaseDot() { dotKey.classList.remove('active'); }
function pressDash() { playDash(); dashKey.classList.add('active'); appendSym('-'); }
function releaseDash() { dashKey.classList.remove('active'); }
function commitLetter() {
  if (!buffer.length) {
    if (word && !word.endsWith(' ')) word += ' ';
    renderWord();
    showToast('Word space added', true);
    return;
  }
  const out = nn.predict(encode(buffer.join('')));
  const best = argmax(out);
  word += MORSE[best].ch;
  buffer.length = 0;
  renderCode();
  renderWord();
  playSpace();
  showToast('Decoded "' + MORSE[best].ch + '" (' + MORSE[best].code + ')', true);
  updatePrediction();
}
function backspace() {
  if (buffer.length) { buffer.pop(); renderCode(); updatePrediction(); }
}
function clearAll() {
  buffer.length = 0;
  word = '';
  renderCode();
  renderWord();
  updatePrediction();
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
  showToast('Fast Learn - ' + n + ' epochs', true);
}
function fullAccuracy() {
  let ok = 0;
  for (const s of dataset) {
    if (argmax(nn.predict(s.inputs)) === s.idx) ok++;
  }
  return dataset.length ? ok / dataset.length : 0;
}
function copyWeights() {
  return {
    wIH: nn.wIH.map(r => r.slice()),
    wHO: nn.wHO.map(r => r.slice()),
    bH: nn.bH.slice(),
    bO: nn.bO.slice()
  };
}
function applyWeights(cp) {
  nn.wIH = cp.wIH.map(r => r.slice());
  nn.wHO = cp.wHO.map(r => r.slice());
  nn.bH = cp.bH.slice();
  nn.bO = cp.bO.slice();
  nn.t = 0;
  nn.vWIH.forEach(a => a.fill(0));
  nn.vWHO.forEach(a => a.fill(0));
  nn.vBH.fill(0); nn.vBO.fill(0);
  nn.mWIH.forEach(a => a.fill(0));
  nn.sWIH.forEach(a => a.fill(0));
  nn.mWHO.forEach(a => a.fill(0));
  nn.sWHO.forEach(a => a.fill(0));
  nn.mBH.fill(0); nn.sBH.fill(0);
  nn.mBO.fill(0); nn.sBO.fill(0);
}
function stopTraining(msg) {
  isTraining = false;
  fastRemaining = 0;
  document.getElementById('trainBtn').textContent = 'Start Training';
  if (msg) showToast(msg, true);
  updatePrediction();
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
  bestAcc = 0;
  bestWeights = null;
  plateau = 0;
  document.getElementById('trainStats').textContent = 'Epoch: 0 | Loss: - | Acc: 0%';
  document.getElementById('lossStats').textContent = 'Current: - | Best: -';
  showToast('Network reset - train again', true);
  updatePrediction();
}
function setLR(v, btn) {
  nn.lr = v;
  document.querySelectorAll('.lr-btn').forEach(b => b.classList.toggle('active', b === btn));
  showToast('Learning rate = ' + v, true);
}
function setOpt(name, btn) {
  nn.opt = name;
  document.querySelectorAll('.opt-btn').forEach(b => b.classList.toggle('active', b === btn));
  if (name === 'adam') {
    nn.t = 0;
    nn.mWIH.forEach(a => a.fill(0));
    nn.sWIH.forEach(a => a.fill(0));
    nn.mWHO.forEach(a => a.fill(0));
    nn.sWHO.forEach(a => a.fill(0));
    nn.mBH.fill(0); nn.sBH.fill(0);
    nn.mBO.fill(0); nn.sBO.fill(0);
  } else {
    nn.vWIH.forEach(a => a.fill(0));
    nn.vWHO.forEach(a => a.fill(0));
    nn.vBH.fill(0); nn.vBO.fill(0);
  }
  showToast('Optimizer: ' + name.toUpperCase(), true);
}
function exportModel() {
  const data = {
    kind: 'morse-decoder',
    arch: '10-16-36',
    lr: nn.lr,
    opt: nn.opt,
    wIH: nn.wIH,
    wHO: nn.wHO,
    bH: nn.bH,
    bO: nn.bO
  };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'morse-decoder-model.json';
  a.click();
  URL.revokeObjectURL(a.href);
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
      if (!Array.isArray(data.wIH) || !Array.isArray(data.wHO)) throw new Error('bad');
      isTraining = false;
      fastRemaining = 0;
      document.getElementById('trainBtn').textContent = 'Start Training';
      nn.lr = typeof data.lr === 'number' ? data.lr : nn.lr;
      nn.opt = (data.opt === 'sgd' || data.opt === 'adam') ? data.opt : nn.opt;
      nn.wIH = data.wIH;
      nn.wHO = data.wHO;
      nn.bH = Array.isArray(data.bH) ? data.bH : nn.bH;
      nn.bO = Array.isArray(data.bO) ? data.bO : nn.bO;
      nn.t = 0;
      nn.vWIH.forEach(a => a.fill(0));
      nn.vWHO.forEach(a => a.fill(0));
      nn.vBH.fill(0); nn.vBO.fill(0);
      nn.mWIH.forEach(a => a.fill(0));
      nn.sWIH.forEach(a => a.fill(0));
      nn.mWHO.forEach(a => a.fill(0));
      nn.sWHO.forEach(a => a.fill(0));
      nn.mBH.fill(0); nn.sBH.fill(0);
      nn.mBO.fill(0); nn.sBO.fill(0);
      epoch = 0; bestLoss = Infinity; smoothedLoss = null;
      lossHistory = []; accHistory = [];
      bestAcc = 0; bestWeights = null; plateau = 0;
      accCache = fullAccuracy();
      document.querySelectorAll('.lr-btn').forEach(b => b.classList.toggle('active', Math.abs(+b.dataset.lr - nn.lr) < 1e-9));
      document.querySelectorAll('.opt-btn').forEach(b => b.classList.toggle('active', b.dataset.opt === nn.opt));
      showToast('Model imported - trained brain loaded', true);
      updatePrediction();
    } catch (err) {
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
function escapeModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(o => {
    o.classList.remove('open');
    document.body.style.overflow = '';
  });
}
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') { escapeModals(); return; }
  if (document.querySelector('.modal-overlay.open')) return;
  if (e.repeat) return;
  const k = (e.key || '').toLowerCase();
  if (k === 'a') pressDot();
  else if (k === 's') pressDash();
  else if (e.key === ' ') { e.preventDefault(); commitLetter(); }
  else if (k === 'x' || e.key === 'Backspace') { e.preventDefault(); backspace(); }
  else if (k === 'c') clearAll();
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
    nCtx.font = 'bold 13px sans-serif';
    nCtx.textAlign = 'center';
    nCtx.textBaseline = 'middle';
    nCtx.fillText(label, x, y);
  }
}
function drawOutputOrb(x, y, v, baseR, phase, col, winner, label) {
  const a = Math.max(0, Math.min(1, v));
  const pulse = 1 + 0.1 * Math.sin(anim * 2.8 + phase * 1.1) + (winner ? 0.1 * Math.sin(anim * 7) : 0);
  const rad = baseR * (0.55 + 0.6 * a) * pulse;
  const halo = rad * 2.0;
  let g = nCtx.createRadialGradient(x, y, rad * 0.2, x, y, halo);
  g.addColorStop(0, rgba(col[0], col[1], col[2], 0.32 * a));
  g.addColorStop(1, rgba(col[0], col[1], col[2], 0));
  nCtx.fillStyle = g;
  nCtx.beginPath();
  nCtx.arc(x, y, halo, 0, Math.PI * 2);
  nCtx.fill();
  nCtx.beginPath();
  nCtx.arc(x, y, rad, 0, Math.PI * 2);
  nCtx.fillStyle = rgba(col[0], col[1], col[2], 0.25 + 0.5 * a);
  nCtx.strokeStyle = rgba(col[0], col[1], col[2], 0.35 + 0.55 * a);
  nCtx.lineWidth = 1;
  nCtx.fill();
  nCtx.stroke();
  nCtx.fillStyle = col[0] < 140 ? '#fff' : '#0a0a0a';
  nCtx.font = 'bold 12px sans-serif';
  nCtx.textAlign = 'center';
  nCtx.textBaseline = 'middle';
  nCtx.fillText(label, x, y);
  if (winner) {
    const wr = rad * 1.5 + 2 * Math.sin(anim * 5);
    nCtx.beginPath();
    nCtx.arc(x, y, wr, 0, Math.PI * 2);
    nCtx.strokeStyle = rgba(0, 230, 118, 0.5 + 0.3 * Math.sin(anim * 5));
    nCtx.lineWidth = 2;
    nCtx.stroke();
  }
}
function drawNetwork() {
  nCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const inPts = [];
  const inStep = CANVAS_H / (MAX_LEN + 1);
  for (let p = 0; p < MAX_LEN; p++) {
    const y = inStep * (p + 1);
    inPts.push({ x: 70, y: y, label: '.' });
    inPts.push({ x: 104, y: y, label: '-' });
  }
  const hidX = 330;
  const hidStep = CANVAS_H / (HID + 1);
  const hidY = [];
  for (let i = 0; i < HID; i++) hidY.push(hidStep * (i + 1));
  const cols = 6;
  const ox = 468, oy = 22, cellX = 27, cellY = Math.floor((CANVAS_H - oy - 10) / cols);
  const outPts = [];
  for (let k = 0; k < OUT; k++) {
    outPts.push({ x: ox + (k % cols) * cellX + 13, y: oy + Math.floor(k / cols) * cellY + cellY / 2 });
  }
  let wMax = 0.001;
  for (let i = 0; i < HID; i++)
    for (let j = 0; j < IN; j++) {
      const aw = Math.abs(nn.wIH[i][j]);
      if (aw > wMax) wMax = aw;
    }
  for (let k = 0; k < OUT; k++)
    for (let i = 0; i < HID; i++) {
      const aw = Math.abs(nn.wHO[k][i]);
      if (aw > wMax) wMax = aw;
    }
  for (let i = 0; i < HID; i++)
    for (let j = 0; j < IN; j++)
      drawSynapse({ x: inPts[j].x, y: inPts[j].y }, { x: hidX, y: hidY[i] }, nn.wIH[i][j],
        'rgba(0,210,255,0.18)', 'rgba(255,82,82,0.18)', 2, wMax);
  for (let k = 0; k < OUT; k++)
    for (let i = 0; i < HID; i++)
      drawSynapse({ x: hidX, y: hidY[i] }, { x: outPts[k].x, y: outPts[k].y }, nn.wHO[k][i],
        'rgba(0,230,118,0.4)', 'rgba(255,82,82,0.35)', 2.5, wMax);
  for (let j = 0; j < IN; j++)
    drawOrb(inPts[j].x, inPts[j].y, nn.lastIn[j], 11, j * 1.1, [0, 200, 255], inPts[j].label, false);
  for (let i = 0; i < HID; i++)
    drawOrb(hidX, hidY[i], nn.lastHid[i], 8, i * 0.6, [0, 190, 255], null, false);
  const win = buffer.length ? argmax(nn.lastOut) : -1;
  for (let k = 0; k < OUT; k++) {
    const v = nn.lastOut[k];
    const isWin = k === win;
    const col = isWin ? [0, 230, 118] : (v > 0.12 ? [0, 210, 255] : [70, 90, 110]);
    drawOutputOrb(outPts[k].x, outPts[k].y, v, 12, k, col, isWin, MORSE[k].ch);
  }
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
function updateStatsBar() {
  document.getElementById('trainStats').textContent =
    'Epoch: ' + epoch + ' | Loss: ' + (smoothedLoss === null ? '-' : smoothedLoss.toFixed(4)) +
    ' | Acc: ' + Math.round(accCache * 100) + '%';
  document.getElementById('lossStats').textContent =
    'Current: ' + (smoothedLoss === null ? '-' : smoothedLoss.toFixed(4)) +
    ' | Best: ' + (bestLoss === Infinity ? '-' : bestLoss.toFixed(4));
}
function loop() {
  anim = performance.now() / 1000;
  if (isTraining) trainEpoch();
  if (fastRemaining > 0) {
    const chunk = Math.min(12, fastRemaining);
    for (let e = 0; e < chunk; e++) trainEpoch();
    fastRemaining -= chunk;
    if (fastRemaining <= 0) {
      isTraining = false;
      accCache = fullAccuracy();
      document.getElementById('trainBtn').textContent = 'Start Training';
      showToast('Fast Learn done - acc ' + Math.round(accCache * 100) + '%', true);
    }
  }
  accTick++;
  if (accTick % 20 === 0 && (isTraining || fastRemaining > 0)) {
    const acc = fullAccuracy();
    accCache = acc;
    if (acc >= ACC_STOP) {
      bestAcc = acc;
      bestWeights = copyWeights();
      stopTraining('100% learned - training stopped');
    } else if (acc > bestAcc) {
      bestAcc = acc;
      bestWeights = copyWeights();
      plateau = 0;
    } else {
      plateau++;
      if (plateau >= 4 && bestWeights) {
        applyWeights(bestWeights);
        accCache = bestAcc;
        stopTraining('Best acc ' + Math.round(bestAcc * 100) + '% - training stopped');
      }
    }
  }
  updatePrediction();
  drawNetwork();
  drawLossGraph();
  updateStatsBar();
  requestAnimationFrame(loop);
}
function buildRef() {
  const refBox = document.getElementById('refTable');
  let html = '';
  for (const m of MORSE) html += '<span class="chip"><b>' + m.ch + '</b>' + m.code + '</span>';
  refBox.innerHTML = html;
}
buildRef();
renderCode();
renderWord();
updatePrediction();
setupLoss();
loop();