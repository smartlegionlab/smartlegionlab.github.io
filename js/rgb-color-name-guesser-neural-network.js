const CANVAS_W = 640;
const CANVAS_H = 470;
const NOISE = 24;
const ACC_STOP = 0.985;
const COLORS = [
  { name: 'Red', short: 'R', hex: '#d83232', rgb: [216, 50, 50], darkText: false },
  { name: 'Orange', short: 'Or', hex: '#ff8c00', rgb: [255, 130, 0], darkText: true },
  { name: 'Yellow', short: 'Ye', hex: '#f0c808', rgb: [248, 210, 30], darkText: true },
  { name: 'Green', short: 'Gn', hex: '#2aad55', rgb: [40, 175, 70], darkText: false },
  { name: 'Cyan', short: 'Cy', hex: '#00bcd4', rgb: [30, 190, 200], darkText: true },
  { name: 'Blue', short: 'Bl', hex: '#1e66f0', rgb: [35, 90, 235], darkText: false },
  { name: 'Purple', short: 'Pu', hex: '#8844dd', rgb: [140, 60, 215], darkText: false },
  { name: 'Pink', short: 'Pk', hex: '#f46bc0', rgb: [238, 110, 178], darkText: true },
  { name: 'Brown', short: 'Br', hex: '#8a5a2b', rgb: [142, 84, 38], darkText: false },
  { name: 'Gray', short: 'Gy', hex: '#7d7d85', rgb: [128, 128, 132], darkText: false },
  { name: 'Black', short: 'Bk', hex: '#14141a', rgb: [26, 26, 30], darkText: false },
  { name: 'White', short: 'Wt', hex: '#f2f2f6', rgb: [240, 240, 243], darkText: true }
];
const NC = COLORS.length;
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
const rS = document.getElementById('rS');
const gS = document.getElementById('gS');
const bS = document.getElementById('bS');
const rV = document.getElementById('rV');
const gV = document.getElementById('gV');
const bV = document.getElementById('bV');
const swatch = document.getElementById('swatch');
const hexText = document.getElementById('hexText');
const netCanvas = document.getElementById('netCanvas');
const nCtx = netCanvas.getContext('2d');
const lossCanvas = document.getElementById('lossCanvas');
const lCtx = lossCanvas.getContext('2d');
const confBars = document.getElementById('confBars');
function toHex(n) {
  const s = n.toString(16).toUpperCase();
  return s.length < 2 ? '0' + s : s;
}
function currentRGB() {
  return [+rS.value, +gS.value, +bS.value];
}
function targetsFor(c) {
  const a = new Array(NC).fill(0);
  a[c] = 1;
  return a;
}
function updateSwatch() {
  const [r, g, b] = currentRGB();
  swatch.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
  hexText.textContent = '#' + toHex(r) + toHex(g) + toHex(b);
}
function renderConfBars(out, best) {
  const rows = confBars.children;
  for (let i = 0; i < NC; i++) {
    const row = rows[i];
    row.classList.toggle('top', i === best);
    row.querySelector('.fill').style.width = Math.round(out[i] * 100) + '%';
    row.querySelector('.cp').textContent = Math.round(out[i] * 100) + '%';
  }
}
function updatePrediction() {
  const [r, g, b] = currentRGB();
  const out = nn.predict([r / 255, g / 255, b / 255]);
  const best = argmax(out);
  const pct = Math.round(out[best] * 100);
  document.getElementById('predText').textContent = 'Answer: ' + COLORS[best].name + ' (' + pct + '%)';
  document.getElementById('watchS').style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
  document.getElementById('watchLabel').textContent = COLORS[best].name + ' - ' + pct + '%';
  renderConfBars(out, best);
}
function onRGB() {
  rV.textContent = rS.value;
  gV.textContent = gS.value;
  bV.textContent = bS.value;
  updateSwatch();
  updatePrediction();
}
const classBtns = document.getElementById('classBtns');
let selectedClass = 0;
COLORS.forEach((c, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'class-btn';
  b.innerHTML = '<i class="dot" style="background:' + c.hex + '"></i>' + c.name;
  b.onclick = () => selectClass(i);
  classBtns.appendChild(b);
});
function selectClass(i) {
  selectedClass = i;
  document.querySelectorAll('.class-btn').forEach((b, k) => b.classList.toggle('active', k === i));
}
selectClass(0);
function buildConfBars() {
  confBars.innerHTML = '';
  COLORS.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'conf-row';
    row.innerHTML = '<span class="cn">' + c.short + '</span><div class="track"><span class="fill"></span></div><b class="cp"></b>';
    confBars.appendChild(row);
  });
}
buildConfBars();
const nn = new NeuralNetwork(3, 24, 12, 0.25);
let dataset = [];
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
const stepsPerEpoch = 128;
let accTick = 0;
let historyTick = 0;
let toastTimer = 0;
let anim = 0;
function pushSample(r, g, b, cls) {
  dataset.push({ inputs: [r / 255, g / 255, b / 255], targets: targetsFor(cls), cls: cls });
}
function genSample(c) {
  const p = COLORS[c].rgb;
  const n = () => (Math.random() + Math.random() - 1) * NOISE;
  return [
    Math.max(0, Math.min(255, Math.round(p[0] + n()))),
    Math.max(0, Math.min(255, Math.round(p[1] + n()))),
    Math.max(0, Math.min(255, Math.round(p[2] + n())))
  ];
}
function genDataset(perClass) {
  dataset = [];
  for (let c = 0; c < NC; c++) {
    for (let k = 0; k < perClass; k++) {
      const rgb = genSample(c);
      pushSample(rgb[0], rgb[1], rgb[2], c);
    }
  }
}
function addSample() {
  const [r, g, b] = currentRGB();
  pushSample(r, g, b, selectedClass);
  updateDatasetStats();
  showToast('Saved sample #' + dataset.length + ' -> ' + COLORS[selectedClass].name, true);
}
function randomColor() {
  rS.value = Math.floor(Math.random() * 256);
  gS.value = Math.floor(Math.random() * 256);
  bS.value = Math.floor(Math.random() * 256);
  onRGB();
}
function autoGen() {
  genDataset(180);
  bestAcc = 0;
  bestWeights = null;
  plateau = 0;
  accCache = 0;
  updateDatasetStats();
  showToast('Auto-generated ' + dataset.length + ' color samples', true);
}
function updateDatasetStats() {
  const counts = new Array(NC).fill(0);
  for (const s of dataset) counts[s.cls]++;
  document.getElementById('datasetStats').textContent =
    'Samples: ' + dataset.length + ' | ' + counts.map((n, i) => COLORS[i].short + ':' + n).join(' ');
}
function toggleTrain() {
  if (dataset.length < 2) { showToast('Generate samples first', false); return; }
  isTraining = !isTraining;
  document.getElementById('trainBtn').textContent = isTraining ? 'Pause' : 'Start Training';
}
function trainEpoch() {
  if (!dataset.length) return;
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
  if (dataset.length < 2) { showToast('Generate samples first', false); return; }
  isTraining = false;
  document.getElementById('trainBtn').textContent = 'Start Training';
  fastRemaining = n;
  showToast('Fast Learn - ' + n + ' epochs', true);
}
function fullAccuracy() {
  let ok = 0;
  for (const s of dataset) {
    if (argmax(nn.predict(s.inputs)) === s.cls) ok++;
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
    kind: 'rgb-color-guesser',
    arch: '3-24-12',
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
  a.download = 'rgb-color-guesser-model.json';
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
    nCtx.font = 'bold 13px sans-serif';
    nCtx.textAlign = 'center';
    nCtx.textBaseline = 'middle';
    nCtx.fillText(label, x, y);
  }
}
function drawOutputOrb(x, y, v, baseR, phase, col, winner, label, darkText) {
  const a = Math.max(0, Math.min(1, v));
  const pulse = 1 + 0.1 * Math.sin(anim * 2.8 + phase * 1.1) + (winner ? 0.1 * Math.sin(anim * 7) : 0);
  const rad = baseR * (0.55 + 0.6 * a) * pulse;
  const halo = rad * 2.1;
  let g = nCtx.createRadialGradient(x, y, rad * 0.2, x, y, halo);
  g.addColorStop(0, rgba(col[0], col[1], col[2], 0.32 * a));
  g.addColorStop(1, rgba(col[0], col[1], col[2], 0));
  nCtx.fillStyle = g;
  nCtx.beginPath();
  nCtx.arc(x, y, halo, 0, Math.PI * 2);
  nCtx.fill();
  g = nCtx.createRadialGradient(x - rad * 0.32, y - rad * 0.38, rad * 0.1, x, y, rad);
  g.addColorStop(0, rgba(255, 255, 255, 0.3 + 0.4 * a));
  g.addColorStop(0.5, rgba(col[0], col[1], col[2], 0.3 + 0.55 * a));
  g.addColorStop(1, rgba(col[0], col[1], col[2], 0.2 + 0.45 * a));
  nCtx.fillStyle = g;
  nCtx.beginPath();
  nCtx.arc(x, y, rad, 0, Math.PI * 2);
  nCtx.fill();
  nCtx.beginPath();
  nCtx.arc(x, y, rad * 1.1, 0, Math.PI * 2);
  nCtx.strokeStyle = rgba(col[0], col[1], col[2], 0.25 + 0.6 * a);
  nCtx.lineWidth = 1 + 1.6 * a;
  nCtx.stroke();
  nCtx.fillStyle = darkText ? '#0a0a0a' : '#fff';
  nCtx.font = 'bold 11px sans-serif';
  nCtx.textAlign = 'center';
  nCtx.textBaseline = 'middle';
  nCtx.fillText(label, x, y);
  if (winner) {
    const wr = rad * 1.34 + 2.5 * Math.sin(anim * 5);
    nCtx.beginPath();
    nCtx.arc(x, y, wr, 0, Math.PI * 2);
    nCtx.strokeStyle = rgba(0, 230, 118, 0.45 + 0.3 * Math.sin(anim * 5));
    nCtx.lineWidth = 2;
    nCtx.stroke();
  }
}
const IN_CHAN_COLORS = [[235, 60, 60], [60, 200, 90], [70, 140, 255]];
const IN_CHAN_LABELS = ['R', 'G', 'B'];
const IN_CHAN_DARK = [false, true, false];
function drawNetwork() {
  nCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const inX = 70, hidX = 320, outX = 560;
  const inStep = CANVAS_H / (nn.inN + 1);
  const hidStep = CANVAS_H / (nn.hidN + 1);
  const outStep = CANVAS_H / (nn.outN + 1);
  const inY = Array.from({ length: nn.inN }, (_, i) => inStep * (i + 1));
  const hidY = Array.from({ length: nn.hidN }, (_, i) => hidStep * (i + 1));
  const outY = Array.from({ length: nn.outN }, (_, i) => outStep * (i + 1));
  let wMax = 0.001;
  for (let i = 0; i < nn.hidN; i++)
    for (let j = 0; j < nn.inN; j++) {
      const aw = Math.abs(nn.wIH[i][j]);
      if (aw > wMax) wMax = aw;
    }
  for (let k = 0; k < nn.outN; k++)
    for (let i = 0; i < nn.hidN; i++) {
      const aw = Math.abs(nn.wHO[k][i]);
      if (aw > wMax) wMax = aw;
    }
  for (let i = 0; i < nn.hidN; i++)
    for (let j = 0; j < nn.inN; j++)
      drawSynapse({ x: inX, y: inY[j] }, { x: hidX, y: hidY[i] }, nn.wIH[i][j],
        'rgba(0,210,255,0.2)', 'rgba(255,82,82,0.2)', 2.5, wMax);
  for (let k = 0; k < nn.outN; k++)
    for (let i = 0; i < nn.hidN; i++)
      drawSynapse({ x: hidX, y: hidY[i] }, { x: outX, y: outY[k] }, nn.wHO[k][i],
        'rgba(0,230,118,0.45)', 'rgba(255,82,82,0.4)', 3.2, wMax);
  for (let j = 0; j < nn.inN; j++)
    drawOrb(inX, inY[j], nn.lastIn[j], 20, j * 1.3, IN_CHAN_COLORS[j], IN_CHAN_LABELS[j], IN_CHAN_DARK[j]);
  for (let i = 0; i < nn.hidN; i++)
    drawOrb(hidX, hidY[i], nn.lastHid[i], 8, i * 0.6, [0, 190, 255], null, false);
  const win = argmax(nn.lastOut);
  for (let k = 0; k < nn.outN; k++) {
    const c = COLORS[k];
    const v = nn.lastOut[k];
    drawOutputOrb(outX, outY[k], v, 17, k, c.rgb, k === win, c.short, c.darkText);
    nCtx.textAlign = 'left';
    nCtx.fillStyle = k === win ? '#00e676' : (v > 0.08 ? '#a5ffd1' : '#8a8a8a');
    nCtx.font = 'bold 11px sans-serif';
    nCtx.textBaseline = 'middle';
    nCtx.fillText(Math.round(v * 100) + '%', outX + 30, outY[k]);
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
genDataset(180);
updateDatasetStats();
updateSwatch();
updatePrediction();
setupLoss();
loop();