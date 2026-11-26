const LOGICS = {
  XOR:  { rows: [[0,0,0],[0,1,1],[1,0,1],[1,1,0]] },
  AND:  { rows: [[0,0,0],[0,1,0],[1,0,0],[1,1,1]] },
  OR:   { rows: [[0,0,0],[0,1,1],[1,0,1],[1,1,1]] },
  NAND: { rows: [[0,0,1],[0,1,1],[1,0,1],[1,1,0]] },
  XNOR: { rows: [[0,0,1],[0,1,0],[1,0,0],[1,1,1]] }
};
const netCanvas = document.getElementById('netCanvas');
const nCtx = netCanvas.getContext('2d');
const lossCanvas = document.getElementById('lossCanvas');
const lCtx = lossCanvas.getContext('2d');
const mapCanvas = document.getElementById('mapCanvas');
const mCtx = mapCanvas.getContext('2d');
let currentLogic = 'XOR';
let aVal = 0, bVal = 1;
let epoch = 0, bestLoss = Infinity, isTraining = false;
let lossHistory = [], smoothedLoss = null;
let toastTimer = 0, suppressToast = false;
let anim = 0;
const sigmoid = x => 1 / (1 + Math.exp(-x));
const dsigmoid = y => y * (1 - y);
function rgba(r, g, b, a) {
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}
class NeuralNetwork {
  constructor(inN, hidN, outN, lr) {
    this.inN = inN; this.hidN = hidN; this.outN = outN; this.lr = lr;
    this.mu = 0.9;
    this.opt = 'sgd';
    this.beta1 = 0.9;
    this.beta2 = 0.999;
    this.eps = 1e-8;
    this.reset();
  }
  reset() {
    const s1 = 1 / Math.sqrt(this.inN);
    const s2 = 1 / Math.sqrt(this.hidN);
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
    this.lastOut = this.wHO.map((w, i) =>
      sigmoid(w.reduce((s, v, j) => s + v * this.lastHid[j], this.bO[i])));
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
    const out = this.predict(inputs)[0];
    const e = target - out;
    const lr = this.lr, mu = this.mu;
    if (this.opt === 'adam') this.t++;
    const bc1 = this.opt === 'adam' ? 1 - Math.pow(this.beta1, this.t) : 1;
    const bc2 = this.opt === 'adam' ? 1 - Math.pow(this.beta2, this.t) : 1;
    const dO = e * dsigmoid(out);
    this.upd(this.bO, 0, dO, this.mBO, this.sBO, this.vBO, lr, mu, bc1, bc2);
    for (let j = 0; j < this.hidN; j++) {
      this.upd(this.wHO[0], j, dO * this.lastHid[j], this.mWHO[0], this.sWHO[0], this.vWHO[0], lr, mu, bc1, bc2);
    }
    for (let i = 0; i < this.hidN; i++) {
      const dH = this.wHO[0][i] * dO * dsigmoid(this.lastHid[i]);
      this.upd(this.bH, i, dH, this.mBH, this.sBH, this.vBH, lr, mu, bc1, bc2);
      for (let j = 0; j < this.inN; j++) {
        this.upd(this.wIH[i], j, dH * inputs[j], this.mWIH[i], this.sWIH[i], this.vWIH[i], lr, mu, bc1, bc2);
      }
    }
  }
}
const nn = new NeuralNetwork(2, 3, 1, 0.3);
function getRows() { return LOGICS[currentLogic].rows; }
function truthOf(a, b) { for (const r of getRows()) if (r[0] === a && r[1] === b) return r[2]; return 0; }
function currentLoss() {
  let s = 0;
  for (const r of getRows()) { const o = nn.predict([r[0], r[1]])[0]; s += (r[2] - o) * (r[2] - o); }
  return s / 4;
}
function correctCount() {
  let c = 0;
  for (const r of getRows()) if ((nn.predict([r[0], r[1]])[0] > 0.5) === (r[2] === 1)) c++;
  return c;
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
function toggleTrain() {
  if (correctCount() === 4) {
    showToast('Already 100% correct - Reset to retrain', true);
    return;
  }
  isTraining = !isTraining;
  document.getElementById('trainBtn').textContent = isTraining ? 'Pause' : 'Start Training';
}
function trainOneEpoch() {
  for (const r of getRows()) nn.trainStep([r[0], r[1]], r[2]);
  epoch++;
  const k = currentLoss();
  smoothedLoss = smoothedLoss === null ? k : smoothedLoss + (k - smoothedLoss) * 0.3;
  if (k < bestLoss) bestLoss = k;
  if (lossHistory.length === 0 || epoch % 5 === 0) {
    lossHistory.push(smoothedLoss);
    if (lossHistory.length > 200) lossHistory.shift();
  }
  if (correctCount() === 4) {
    isTraining = false;
    document.getElementById('trainBtn').textContent = 'Start Training';
    if (!suppressToast) showToast('✓ 100% correct - training complete', true);
    return true;
  }
  return false;
}
function trainEpochs(n) {
  suppressToast = true;
  let achieved = false;
  for (let e = 0; e < n; e++) {
    if (trainOneEpoch()) { achieved = true; break; }
  }
  suppressToast = false;
  isTraining = false;
  document.getElementById('trainBtn').textContent = 'Start Training';
  if (achieved) showToast('✓ 100% correct in ' + epoch + ' epochs - loss ' + smoothedLoss.toFixed(4), true);
  else showToast('Trained ' + n + ' epochs - loss ' + smoothedLoss.toFixed(4) + ' · not 100% yet', correctCount() === 4);
}
function resetNetwork() {
  isTraining = false;
  document.getElementById('trainBtn').textContent = 'Start Training';
  nn.reset();
  epoch = 0; bestLoss = Infinity; smoothedLoss = null; lossHistory = [];
  showToast('Network reset - train again', true);
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
    kind: 'logic-gates',
    arch: '2-3-1',
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
  a.download = 'logic-gates-model.json';
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
      epoch = 0; bestLoss = Infinity; smoothedLoss = null; lossHistory = [];
      document.querySelectorAll('.lr-btn').forEach(b => b.classList.toggle('active', Math.abs(+b.dataset.lr - nn.lr) < 1e-9));
      document.querySelectorAll('.opt-btn').forEach(b => b.classList.toggle('active', b.dataset.opt === nn.opt));
      showToast('Model imported - trained brain loaded', true);
    } catch (err) {
      showToast('Import failed - bad file', false);
    }
  };
  reader.readAsText(f);
  e.target.value = '';
}
function logicButtons() {
  const box = document.getElementById('logicBtns');
  for (const name of Object.keys(LOGICS)) {
    const b = document.createElement('button');
    b.textContent = name;
    b.dataset.logic = name;
    b.onclick = () => selectLogic(name);
    box.appendChild(b);
  }
}
function selectLogic(name) {
  currentLogic = name;
  document.querySelectorAll('#logicBtns button').forEach(bb => bb.classList.toggle('active', bb.dataset.logic === name));
  isTraining = false;
  document.getElementById('trainBtn').textContent = 'Start Training';
  nn.reset();
  epoch = 0; bestLoss = Infinity; smoothedLoss = null; lossHistory = [];
  showToast('Function: ' + name + ' - fresh start, train again', true);
}
function setBit(which, v) {
  if (which === 'a') aVal = v; else bVal = v;
  updateSwitches();
}
function updateSwitches() {
  document.querySelectorAll('#swA button').forEach(b => b.classList.toggle('on', +b.textContent === aVal));
  document.querySelectorAll('#swA button').forEach(b => b.classList.toggle('off', +b.textContent !== aVal));
  document.querySelectorAll('#swB button').forEach(b => b.classList.toggle('on', +b.textContent === bVal));
  document.querySelectorAll('#swB button').forEach(b => b.classList.toggle('off', +b.textContent !== bVal));
}
function randomTest() {
  const r = getRows()[Math.floor(Math.random() * 4)];
  aVal = r[0]; bVal = r[1];
  updateSwitches();
  const y = nn.predict([aVal, bVal])[0];
  const pred = y > 0.5 ? 1 : 0;
  const ok = pred === r[2];
  showToast(currentLogic + '(' + aVal + ',' + bVal + ') = ' + r[2] + ' · brain: ' + pred + ' → ' + (ok ? 'correct' : 'wrong'), ok);
}
function testAll() {
  const ok = correctCount();
  showToast('All 4 rows: ' + ok + '/4 correct' + (ok === 4 ? ' · 100% ✓' : ''), ok === 4);
}
function renderTruth() {
  let html = '<tr><th>a</th><th>b</th><th>y</th><th>hat</th></tr>';
  for (const r of getRows()) {
    const o = nn.predict([r[0], r[1]])[0];
    const hat = o > 0.5 ? '1' : '0';
    const ok = hat == r[2];
    html += '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td class="out">' + r[2] + '</td>' +
            '<td class="' + (ok ? 'good' : 'bad') + '">' + hat + '</td></tr>';
  }
  document.getElementById('truthTable').innerHTML = html;
}
function renderPrediction() {
  const el = document.getElementById('predText');
  const conf = document.getElementById('confFill');
  const y = nn.predict([aVal, bVal])[0];
  const pred = y > 0.5 ? 1 : 0;
  const truth = truthOf(aVal, bVal);
  const ok = pred === truth;
  const pct = Math.round((y > 0.5 ? y : 1 - y) * 100);
  el.classList.remove('good', 'bad', 'idle');
  conf.classList.remove('good', 'bad');
  if (ok) {
    el.classList.add('good');
    conf.classList.add('good');
    el.innerHTML = 'y = <span class="val">' + pred + '</span> correct · ' + pct + '%';
  } else {
    el.classList.add('bad');
    conf.classList.add('bad');
    el.innerHTML = 'y = <span class="val">' + pred + '</span> wrong · target ' + truth + ' · ' + pct + '%';
  }
  conf.style.width = pct + '%';
  const c = correctCount();
  document.getElementById('scoreText').innerHTML =
    'correct: <b class="' + (c === 4 ? 'good' : 'bad') + '">' + c + '/4 (' + (c * 25) + '%)</b>';
}
function drawSynapse(a, b, w, pos, neg, maxW) {
  nCtx.beginPath();
  nCtx.moveTo(a.x, a.y);
  nCtx.lineTo(b.x, b.y);
  nCtx.strokeStyle = w >= 0 ? pos : neg;
  nCtx.lineWidth = Math.max(0.4, Math.min(maxW, Math.abs(w)));
  nCtx.stroke();
}
function drawOrb(x, y, v, baseR, phase, col) {
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
}
function drawOutputOrb(x, y, v, baseR, phase, col, winner) {
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
  if (winner) {
    const wr = rad * 1.34 + 2.5 * Math.sin(anim * 5);
    nCtx.beginPath();
    nCtx.arc(x, y, wr, 0, Math.PI * 2);
    nCtx.strokeStyle = rgba(0, 230, 118, 0.45 + 0.3 * Math.sin(anim * 5));
    nCtx.lineWidth = 2;
    nCtx.stroke();
  }
}
const IN_X = 110, HID_X = 320, OUT_X = 540, IN_Y = [130, 270], HID_Y = [80, 200, 320], OUT_Y = 200;
function drawNetwork() {
  nCtx.clearRect(0, 0, netCanvas.width, netCanvas.height);
  nn.predict([aVal, bVal]);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++)
    drawSynapse({ x: IN_X, y: IN_Y[j] }, { x: HID_X, y: HID_Y[i] }, nn.wIH[i][j],
      'rgba(0,210,255,0.35)', 'rgba(255,82,82,0.35)', 3);
  for (let i = 0; i < 3; i++)
    drawSynapse({ x: HID_X, y: HID_Y[i] }, { x: OUT_X, y: OUT_Y }, nn.wHO[0][i],
      'rgba(0,230,118,0.6)', 'rgba(255,82,82,0.5)', 4);
  for (let i = 0; i < 2; i++) {
    const v = nn.lastIn[i];
    const col = v > 0.5 ? [0, 210, 255] : [55, 75, 92];
    drawOrb(IN_X, IN_Y[i], v, 20, i * 1.3, col);
    nCtx.fillStyle = v > 0.5 ? '#000' : '#fff';
    nCtx.font = 'bold 16px sans-serif';
    nCtx.textAlign = 'center';
    nCtx.textBaseline = 'middle';
    nCtx.fillText(i === 0 ? 'a' : 'b', IN_X, IN_Y[i]);
  }
  for (let i = 0; i < 3; i++)
    drawOrb(HID_X, HID_Y[i], nn.lastHid[i], 18, i * 0.7, [0, 190, 255]);
  const o = nn.lastOut[0];
  drawOutputOrb(OUT_X, OUT_Y, o, 32, 0, [0, 230, 118], true);
  nCtx.fillStyle = o > 0.5 ? '#000' : '#fff';
  nCtx.font = 'bold 18px sans-serif';
  nCtx.textAlign = 'center';
  nCtx.textBaseline = 'middle';
  nCtx.fillText(o > 0.5 ? '1' : '0', OUT_X, OUT_Y);
  nCtx.fillStyle = '#ccc';
  nCtx.font = 'bold 12px sans-serif';
  nCtx.fillText('y = ' + (o > 0.5 ? 'true' : 'false') + '  (' + Math.round(o * 100) + '%)', OUT_X, OUT_Y + 44);
}
netCanvas.addEventListener('click', e => {
  const r = netCanvas.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width * netCanvas.width;
  const y = (e.clientY - r.top) / r.height * netCanvas.height;
  if (Math.hypot(x - IN_X, y - IN_Y[0]) < 28) { aVal = 1 - aVal; updateSwitches(); }
  else if (Math.hypot(x - IN_X, y - IN_Y[1]) < 28) { bVal = 1 - bVal; updateSwitches(); }
});
function drawMap() {
  const W = mapCanvas.width, H = mapCanvas.height;
  mCtx.clearRect(0, 0, W, H);
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const o = nn.predict([px / W, py / H])[0];
      mCtx.fillStyle = 'rgb(' + Math.round(o * 200) + ',' + Math.round(o * 60) + ',' + Math.round((1 - o) * 200) + ')';
      mCtx.fillRect(px, py, 1, 1);
    }
  }
  const corners = [[0, 0], [1, 0], [0, 1], [1, 1]];
  for (const [a, b] of corners) {
    const cx = a * (W - 1), cy = b * (H - 1);
    const tar = truthOf(a, b);
    const ok = (nn.predict([a, b])[0] > 0.5) === (tar === 1);
    mCtx.beginPath();
    mCtx.arc(cx, cy, 9, 0, Math.PI * 2);
    mCtx.fillStyle = ok ? '#00e676' : '#ff5252';
    mCtx.fill();
    mCtx.strokeStyle = '#fff';
    mCtx.lineWidth = 1.5;
    mCtx.stroke();
    mCtx.beginPath();
    mCtx.arc(cx, cy, 13, 0, Math.PI * 2);
    mCtx.strokeStyle = tar ? '#fff' : 'rgba(255,255,255,0.3)';
    mCtx.lineWidth = 1.2;
    mCtx.stroke();
  }
}
function drawLossGraph() {
  const W = lossCanvas.width, H = lossCanvas.height, data = lossHistory;
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
    lCtx.fillStyle = '#8a8a8a';
    lCtx.font = '12px sans-serif';
    lCtx.textAlign = 'center';
    lCtx.textBaseline = 'middle';
    lCtx.fillText('Train to see the loss curve', W / 2, H / 2);
    return;
  }
  let lo = Math.min(...data), hi = Math.max(...data), range = hi - lo;
  if (range < 1e-6) { lo = Math.max(0, lo - 0.05); hi += 0.05; range = hi - lo; }
  range = Math.max(range, 1e-6);
  const padL = 8, padR = 8, padT = 22, padB = 22;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const xFor = i => padL + (data.length === 1 ? innerW : innerW * i / (data.length - 1));
  const yFor = loss => padT + (1 - (loss - lo) / range) * innerH;
  lCtx.fillStyle = '#9a9a9a';
  lCtx.font = '11px sans-serif';
  lCtx.textAlign = 'left';
  lCtx.textBaseline = 'top';
  lCtx.fillText(hi.toFixed(3), padL, 4);
  lCtx.textBaseline = 'bottom';
  lCtx.fillText(lo.toFixed(3), padL, H - 4);
  lCtx.beginPath();
  lCtx.strokeStyle = '#00e676';
  lCtx.lineWidth = 2;
  data.forEach((loss, idx) => {
    const x = xFor(idx), y = yFor(loss);
    idx === 0 ? lCtx.moveTo(x, y) : lCtx.lineTo(x, y);
  });
  lCtx.stroke();
  lCtx.fillStyle = '#9a9a9a';
  lCtx.font = '11px sans-serif';
  lCtx.textAlign = 'right';
  lCtx.textBaseline = 'bottom';
  lCtx.fillText('epoch ' + epoch, W - 4, H - 4);
}
function stats() {
  const curr = smoothedLoss === null ? currentLoss() : smoothedLoss;
  document.getElementById('trainStats').textContent =
    'Epoch: ' + epoch + ' | Loss: ' + curr.toFixed(4) + ' | ' + nn.opt.toUpperCase() + ' · lr ' + nn.lr;
  document.getElementById('lossStats').textContent =
    'Current: ' + curr.toFixed(4) + ' | Best: ' + (bestLoss === Infinity ? '-' : bestLoss.toFixed(4));
}
function openModal(id) {
  bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).show();
}
function loop() {
  anim = performance.now() / 1000;
  if (isTraining) trainOneEpoch();
  renderTruth();
  renderPrediction();
  drawNetwork();
  drawMap();
  drawLossGraph();
  stats();
  requestAnimationFrame(loop);
}
logicButtons();
selectLogic('XOR');
updateSwitches();
loop();