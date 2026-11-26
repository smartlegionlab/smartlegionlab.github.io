const GRID_SIZE = 8;
const BREAKPOINT = 1000;
const drawCanvas = document.getElementById('drawCanvas');
const dCtx = drawCanvas.getContext('2d');
const cellSize = drawCanvas.width / GRID_SIZE;
let grid = Array(GRID_SIZE * GRID_SIZE).fill(0);
let isDrawing = false;
function openModal(id) {
  bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).show();
}
function renderGrid() {
  dCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const val = grid[y * GRID_SIZE + x];
      dCtx.fillStyle = val > 0 ? '#00d2ff' : '#141414';
      dCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      dCtx.strokeStyle = '#2a2a2a';
      dCtx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}
function getGridPos(clientX, clientY) {
  const rect = drawCanvas.getBoundingClientRect();
  const x = Math.floor((clientX - rect.left) / rect.width * GRID_SIZE);
  const y = Math.floor((clientY - rect.top) / rect.height * GRID_SIZE);
  return { x, y };
}
function drawAt(e) {
  if (!isDrawing) return;
  const p = e.touches ? e.touches[0] : e;
  const { x, y } = getGridPos(p.clientX, p.clientY);
  if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
    grid[y * GRID_SIZE + x] = 1;
    renderGrid();
    const out = nn.predict(grid);
    const isX = out[0] > out[1];
    const conf = Math.round(Math.max(out[0], out[1]) * 100);
    document.getElementById('predText').textContent = 'Answer: ' + (isX ? 'X' : 'O') + ' (' + conf + '%)';
  }
}
drawCanvas.addEventListener('mousedown', (e) => { isDrawing = true; drawAt(e); });
drawCanvas.addEventListener('mousemove', drawAt);
window.addEventListener('mouseup', () => isDrawing = false);
drawCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; drawAt(e); }, { passive: false });
drawCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); drawAt(e); }, { passive: false });
window.addEventListener('touchend', () => isDrawing = false);
function clearGrid() {
  grid.fill(0);
  renderGrid();
  document.getElementById('predText').textContent = 'Answer: -';
}
const sigmoid = x => 1 / (1 + Math.exp(-x));
const dsigmoid = y => y * (1 - y);
class NeuralNetwork {
  constructor(inNodes, hidNodes, outNodes) {
    this.inNodes = inNodes;
    this.hidNodes = hidNodes;
    this.outNodes = outNodes;
    this.lr = 0.2;
    this.reset();
  }
  reset() {
    this.wIH = Array.from({length: this.hidNodes}, () =>
      Array.from({length: this.inNodes}, () => Math.random() * 2 - 1));
    this.wHO = Array.from({length: this.outNodes}, () =>
      Array.from({length: this.hidNodes}, () => Math.random() * 2 - 1));
    this.bH = Array.from({length: this.hidNodes}, () => Math.random() * 2 - 1);
    this.bO = Array.from({length: this.outNodes}, () => Math.random() * 2 - 1);
    this.lastIn = Array(this.inNodes).fill(0);
    this.lastHid = Array(this.hidNodes).fill(0);
    this.lastOut = Array(this.outNodes).fill(0);
  }
  predict(inputs) {
    this.lastIn = [...inputs];
    this.lastHid = this.wIH.map((w, i) =>
      sigmoid(w.reduce((s, val, j) => s + val * inputs[j], this.bH[i])));
    this.lastOut = this.wHO.map((w, i) =>
      sigmoid(w.reduce((s, val, j) => s + val * this.lastHid[j], this.bO[i])));
    return this.lastOut;
  }
  train(inputs, targets) {
    const outputs = this.predict(inputs);
    const outErrors = targets.map((t, i) => t - outputs[i]);
    for (let i = 0; i < this.outNodes; i++) {
      const grad = dsigmoid(outputs[i]) * outErrors[i] * this.lr;
      for (let j = 0; j < this.hidNodes; j++) this.wHO[i][j] += grad * this.lastHid[j];
      this.bO[i] += grad;
    }
    const hidErrors = this.lastHid.map((_, j) =>
      this.wHO.reduce((s, w, i) => s + w[j] * outErrors[i], 0));
    for (let i = 0; i < this.hidNodes; i++) {
      const grad = dsigmoid(this.lastHid[i]) * hidErrors[i] * this.lr;
      for (let j = 0; j < this.inNodes; j++) this.wIH[i][j] += grad * inputs[j];
      this.bH[i] += grad;
    }
    return outErrors.reduce((s, e) => s + e * e, 0) / outErrors.length;
  }
}
const nn = new NeuralNetwork(64, 12, 2);
let dataset = [];
let lossHistory = [];
let isTraining = false;
let epoch = 0;
let bestLoss = Infinity;
let smoothedLoss = null;
let toastTimer = 0;
let anim = 0;
function updateDatasetStats() {
  const xCount = dataset.filter(s => s.targets[0] === 1).length;
  const oCount = dataset.filter(s => s.targets[1] === 1).length;
  document.getElementById('datasetStats').textContent =
    'Samples: X - ' + xCount + ' | O - ' + oCount + ' (total ' + dataset.length + ')';
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
function addSample(label) {
  if (grid.every(v => v === 0)) {
    showToast('Draw a shape first!', false);
    return;
  }
  dataset.push({ inputs: [...grid], targets: label === 0 ? [1, 0] : [0, 1] });
  updateDatasetStats();
  showToast('Saved ' + (label === 0 ? 'X' : 'O') + ' sample #' + dataset.length, true);
  clearGrid();
}
function toggleTrain() {
  if (dataset.length < 2) {
    showToast('Add at least 2 samples (X and O)!', false);
    return;
  }
  isTraining = !isTraining;
  document.getElementById('trainBtn').textContent = isTraining ? 'Pause' : 'Start Training';
}
function resetNetwork() {
  isTraining = false;
  document.getElementById('trainBtn').textContent = 'Start Training';
  nn.reset();
  epoch = 0;
  lossHistory = [];
  bestLoss = Infinity;
  smoothedLoss = null;
  document.getElementById('lossStats').textContent = 'Current: - | Best: -';
  showToast('Network reset - train again', true);
}
function exportModel() {
  const data = {
    kind: 'x-o',
    arch: '64-12-2',
    lr: nn.lr,
    wIH: nn.wIH,
    wHO: nn.wHO,
    bH: nn.bH,
    bO: nn.bO
  };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'x-o-model.json';
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
      nn.wIH = data.wIH;
      nn.wHO = data.wHO;
      nn.bH = Array.isArray(data.bH) ? data.bH : nn.bH;
      nn.bO = Array.isArray(data.bO) ? data.bO : nn.bO;
      epoch = 0;
      lossHistory = [];
      bestLoss = Infinity;
      smoothedLoss = null;
      nn.predict(grid);
      showToast('Model imported - trained brain loaded', true);
    } catch (err) {
      showToast('Import failed - bad file', false);
    }
  };
  reader.readAsText(f);
  e.target.value = '';
}
const netCanvas = document.getElementById('netCanvas');
const nCtx = netCanvas.getContext('2d');
const lossCanvas = document.getElementById('lossCanvas');
const lCtx = lossCanvas.getContext('2d');
function drawSynapse(a, b, w, posColor, negColor, maxW, wMax) {
  nCtx.beginPath();
  nCtx.moveTo(a.x, a.y);
  nCtx.lineTo(b.x, b.y);
  nCtx.strokeStyle = w >= 0 ? posColor : negColor;
  nCtx.lineWidth = Math.max(0.4, Math.min(maxW, Math.abs(w) * (maxW / wMax)));
  nCtx.stroke();
}
function rgba(r, g, b, a) {
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
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
function drawNetwork() {
  nCtx.clearRect(0, 0, netCanvas.width, netCanvas.height);
  const isMobile = window.innerWidth <= BREAKPOINT;
  const inVisible = isMobile ? nn.lastIn.filter((_, idx) => idx % 4 === 0) : nn.lastIn;
  const inCount = inVisible.length;
  const inX = 80, hidX = 320, outX = 560;
  const inY = [], hidY = [], outY = [];
  const inStep = netCanvas.height / (inCount + 1);
  for (let i = 0; i < inCount; i++) inY.push(inStep * (i + 1));
  const hidStep = netCanvas.height / (nn.hidNodes + 1);
  for (let i = 0; i < nn.hidNodes; i++) hidY.push(hidStep * (i + 1));
  const outStep = netCanvas.height / (nn.outNodes + 1);
  for (let i = 0; i < nn.outNodes; i++) outY.push(outStep * (i + 1));
  let wMax = 0.001;
  for (let i = 0; i < nn.hidNodes; i++) {
    for (let j = 0; j < inCount; j++) {
      const aw = Math.abs(isMobile ? nn.wIH[i][j * 4] : nn.wIH[i][j]);
      if (aw > wMax) wMax = aw;
    }
  }
  for (let i = 0; i < nn.outNodes; i++) {
    for (let j = 0; j < nn.hidNodes; j++) {
      const aw = Math.abs(nn.wHO[i][j]);
      if (aw > wMax) wMax = aw;
    }
  }
  for (let i = 0; i < nn.hidNodes; i++) {
    for (let j = 0; j < inCount; j++) {
      const w = isMobile ? nn.wIH[i][j * 4] : nn.wIH[i][j];
      const alpha = isMobile ? 0.25 : 0.16;
      drawSynapse({ x: inX, y: inY[j] }, { x: hidX, y: hidY[i] }, w,
        'rgba(0,210,255,' + alpha + ')', 'rgba(255,82,82,' + alpha + ')', isMobile ? 3 : 2, wMax);
    }
  }
  for (let i = 0; i < nn.outNodes; i++) {
    for (let j = 0; j < nn.hidNodes; j++) {
      drawSynapse({ x: hidX, y: hidY[j] }, { x: outX, y: outY[i] }, nn.wHO[i][j],
        'rgba(0,230,118,0.5)', 'rgba(255,82,82,0.5)', 4, wMax);
    }
  }
  for (let i = 0; i < inCount; i++) {
    drawOrb(inX, inY[i], inVisible[i], isMobile ? 7 : 4, i * 1.1, [0, 200, 255]);
  }
  for (let i = 0; i < nn.hidNodes; i++) {
    drawOrb(hidX, hidY[i], nn.lastHid[i], 10, i * 0.7, [0, 190, 255]);
  }
  const hasDraw = grid.some(v => v > 0);
  let win = 0;
  for (let i = 1; i < nn.outNodes; i++) if (nn.lastOut[i] > nn.lastOut[win]) win = i;
  const labels = ['X', 'O'];
  for (let i = 0; i < nn.outNodes; i++) {
    const v = nn.lastOut[i];
    const a = Math.max(0, Math.min(1, v));
    const winner = hasDraw && i === win;
    const col = winner ? [0, 230, 118] : (v > 0.5 ? [0, 210, 255] : [95, 105, 122]);
    drawOutputOrb(outX, outY[i], v, 22, i, col, winner);
    nCtx.fillStyle = (winner || v > 0.5) ? '#0a0a0a' : '#fff';
    nCtx.font = 'bold 16px sans-serif';
    nCtx.textAlign = 'center';
    nCtx.textBaseline = 'middle';
    nCtx.fillText(labels[i], outX, outY[i]);
    nCtx.textAlign = 'left';
    nCtx.fillStyle = winner ? '#00e676' : (v > 0.5 ? '#a5ffd1' : '#8a8a8a');
    nCtx.font = 'bold 13px sans-serif';
    nCtx.fillText(Math.round(v * 100) + '%', outX + 34, outY[i]);
    nCtx.textAlign = 'center';
  }
}
function drawLossGraph() {
  const W = lossCanvas.width, H = lossCanvas.height;
  const data = lossHistory;
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
    lCtx.fillText('Train to draw the loss curve', W / 2, H / 2);
    return;
  }
  let lo = Math.min(...data);
  let hi = Math.max(...data);
  let range = hi - lo;
  if (range < 1e-6) { lo = Math.max(0, lo - 0.05); hi += 0.05; range = hi - lo; }
  range = Math.max(range, 1e-6);
  const padL = 8, padR = 8, padT = 26, padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const xFor = idx => padL + (data.length === 1 ? innerW : innerW * idx / (data.length - 1));
  const yFor = loss => padT + (1 - (loss - lo) / range) * innerH;
  lCtx.fillStyle = '#9a9a9a';
  lCtx.font = '11px sans-serif';
  lCtx.textBaseline = 'top';
  lCtx.textAlign = 'left';
  lCtx.fillText(hi.toFixed(4), padL, 6);
  lCtx.textBaseline = 'bottom';
  lCtx.fillText(lo.toFixed(4), padL, H - 4);
  lCtx.beginPath();
  lCtx.strokeStyle = '#00e676';
  lCtx.lineWidth = 2;
  data.forEach((loss, idx) => {
    const x = xFor(idx), y = yFor(loss);
    idx === 0 ? lCtx.moveTo(x, y) : lCtx.lineTo(x, y);
  });
  lCtx.stroke();
  const cx = xFor(data.length - 1), cy = yFor(data[data.length - 1]);
  lCtx.beginPath();
  lCtx.arc(cx, cy, 4, 0, Math.PI * 2);
  lCtx.fillStyle = '#00e676';
  lCtx.fill();
  lCtx.fillStyle = '#e0e0e0';
  lCtx.font = 'bold 11px sans-serif';
  lCtx.textAlign = 'left';
  lCtx.textBaseline = 'bottom';
  lCtx.fillText(data[data.length - 1].toFixed(4), Math.min(W - 66, cx + 7), Math.max(16, cy - 3));
  lCtx.fillStyle = '#9a9a9a';
  lCtx.font = '11px sans-serif';
  lCtx.textAlign = 'right';
  lCtx.textBaseline = 'bottom';
  lCtx.fillText('epoch ' + epoch, W - 4, H - 4);
}
function loop() {
  anim = performance.now() / 1000;
  if (isTraining && dataset.length > 0) {
    let batchLoss = 0;
    for (let s = 0; s < 15; s++) {
      const sample = dataset[Math.floor(Math.random() * dataset.length)];
      batchLoss += nn.train(sample.inputs, sample.targets);
    }
    epoch++;
    const avgLoss = batchLoss / 15;
    smoothedLoss = smoothedLoss === null ? avgLoss : smoothedLoss + (avgLoss - smoothedLoss) * 0.25;
    if (epoch % 15 === 0) {
      lossHistory.push(smoothedLoss);
      if (smoothedLoss < bestLoss) bestLoss = smoothedLoss;
      if (lossHistory.length > 100) lossHistory.shift();
    }
    document.getElementById('trainStats').textContent =
      'Epoch: ' + epoch + ' | Loss: ' + smoothedLoss.toFixed(4);
    document.getElementById('lossStats').textContent =
      'Current: ' + smoothedLoss.toFixed(4) + ' | Best: ' + (bestLoss === Infinity ? '-' : bestLoss.toFixed(4));
  }
  drawNetwork();
  drawLossGraph();
  requestAnimationFrame(loop);
}
renderGrid();
loop();