var IN = 53, HID = 48, OUT = 12, BREAKPOINT = 1000, RHY = 4, HARM = 7;
var HARM_FUNCS = ['i', 'ii', 'III', 'iv', 'v', 'VI', 'VII'];
function harmName(name) { return name === 'V7' ? 'v' : name; }
var TONIC = 9;
var NATURAL = [0, 2, 3, 5, 7, 8, 10];
var HARMONIC = [0, 2, 3, 5, 7, 8, 11];
var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
var KEY_NAMES = {
    0: 'C minor', 1: 'C# minor', 2: 'D minor', 3: 'D# minor', 4: 'E minor', 5: 'F minor',
    6: 'F# minor', 7: 'G minor', 8: 'G# minor', 9: 'A minor', 10: 'A# minor', 11: 'B minor'
};
var PROGRESSIONS = [
    ['i', 'iv', 'v', 'i'],
    ['i', 'VI', 'III', 'VII'],
    ['i', 'VII', 'VI', 'v'],
    ['i', 'VI', 'V7', 'i'],
    ['i', 'III', 'VII', 'VI'],
    ['VI', 'iv', 'v', 'i'],
    ['i', 'iv', 'VII', 'III']
];
var CHORDS = {};
(function () {
    var keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    var d = [0, 2, 4, 5, 7, 9, 10];
    var funcs = ['i', 'ii', 'III', 'iv', 'v', 'VI', 'VII'];
    var quality = [0, 0, 1, 0, 0, 1, 1];
    for (var k = 0; k < keys.length; k++) {
        var tonic = keys[k];
        var sc = NATURAL.map(function (r) { return (tonic + r) % 12; });
        var obj = {};
        for (var i = 0; i < 7; i++) {
            var relPc = d.map(function (x) { return sc[(i + x) % 7]; });
            var s = (funcs[i] === 'V' || funcs[i] === 'V7') ? 1 : 0;
            if (funcs[i] === 'V') relPc[2] = (tonic + 11) % 12;
            obj[funcs[i]] = { rel: relPc, q: quality[i], s: s };
        }
        obj.V7 = {
            rel: [sc[4], sc[6], (tonic + 11) % 12, sc[3]].filter(function (v, i2, a) { return a.indexOf(v) === i2; }),
            q: 1, s: 1
        };
        CHORDS[tonic] = obj;
    }
})();
var HARM_NEXT = {};
(function () {
    HARM_FUNCS.forEach(function (n) { HARM_NEXT[n] = []; });
    PROGRESSIONS.forEach(function (p) {
        for (var i = 0; i < p.length; i++) {
            var a = harmName(p[i]), b = harmName(p[(i + 1) % p.length]);
            if (HARM_NEXT[a].indexOf(b) < 0) HARM_NEXT[a].push(b);
        }
    });
})();
var MOTIFS = [[0, 1, 2, 3, 4, 3, 2, 1], [0, 2, 3, 4, 3, 2, 0, 1], [0, 0, 2, 3, 5, 4, 3, 2], [0, 1, 3, 4, 5, 3, 4, 2], [0, 2, 2, 3, 4, 2, 1, 0]];
var BASS_SEQ = [0, 2, 0, 1];
var GROOVES = [
    { b: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], k: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], s: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], h: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
    { b: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0], k: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], s: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], h: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
    { b: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0], k: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1], s: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], h: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1] },
    { b: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], k: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], s: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], h: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0] }
];
var ORCH_KEYS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var KEY_AUTO = false;
var TEMPO_SET = [72, 80, 88, 96, 104, 112, 120, 132, 144];
var SECTIONS = [
    { name: 'Intro', bars: 1, mask: [0, 1, 1, 1, 0, 1], dense: 4, drumsLite: true, groove: 0 },
    { name: 'Verse A', bars: 3, mask: [1, 1, 1, 1, 1, 1], dense: 4, drumsLite: false, groove: 1 },
    { name: 'Chorus A', bars: 4, mask: [1, 1, 1, 1, 1, 1], dense: 2, drumsLite: false, groove: 2 },
    { name: 'Verse B', bars: 3, mask: [1, 1, 1, 1, 1, 1], dense: 4, drumsLite: false, groove: 1 },
    { name: 'Bridge', bars: 2, mask: [1, 1, 0, 0, 0, 1], dense: 3, drumsLite: true, groove: 3 },
    { name: 'Chorus B', bars: 4, mask: [1, 1, 1, 1, 1, 1], dense: 2, drumsLite: false, groove: 2 },
    { name: 'Outro', bars: 1, mask: [1, 1, 0, 1, 0, 1], dense: 4, drumsLite: true, groove: 3 }
];
var songPlan = null, totalSteps = 0, curSectionName = '-';
function chordStore(tonic) { return CHORDS[((tonic % 12) + 12) % 12]; }
function chordOf(name) { return chordStore(TONIC)[harmName(name)] || chordStore(TONIC).i; }
function chordAbs(name) { return chordOf(name).rel; }
function chordRootAbs(name) { return chordOf(name).rel[0]; }
function pcAbs(rel) { return ((TONIC + rel) % 12 + 12) % 12; }
function scalePcs(id) {
    var rel = id === 1 ? HARMONIC : NATURAL;
    return rel.map(function (r) { return (TONIC + r) % 12; });
}
function minDist(a, b) {
    var d = Math.abs(((a - b) % 12 + 12) % 12);
    return d > 6 ? 6 - d : d;
}
function argmax(arr) {
    var b = 0;
    for (var i = 1; i < arr.length; i++) if (arr[i] > arr[b]) b = i;
    return b;
}
function clmp(x) { return Math.max(-1, Math.min(1, x)); }
function pcName(pc) { return (pc >= 0 && pc < 12) ? NOTE_NAMES[pc] : '-'; }
function degName(pc) {
    var rel = ((pc - TONIC) % 12 + 12) % 12;
    var idx = NATURAL.indexOf(rel);
    return idx >= 0 ? '' + (idx + 1) : 'x';
}
function funcIdx(name) { return HARM_FUNCS.indexOf(harmName(name)); }
var sigmoid = function (x) { return 1 / (1 + Math.exp(-x)); };
var dsigmoid = function (y) { return y * (1 - y); };
var globalMuted = false, masterVol = 90;
function NeuralNetwork(inN, hidN, outN, rhyN, lr) {
    this.inN = inN; this.hidN = hidN; this.outN = outN; this.rhyN = rhyN; this.harmHid = 16; this.lr = lr; this.mu = 0.9; this.wd = 0.002;
    this.opt = 'sgd'; this.beta1 = 0.9; this.beta2 = 0.999; this.eps = 1e-8;
    this.reset();
}
NeuralNetwork.prototype.zeros2 = function (r, c) {
    var a = [];
    for (var i = 0; i < r; i++) a.push(new Array(c).fill(0));
    return a;
};
NeuralNetwork.prototype.reset = function () {
    var s1 = 1 / Math.sqrt(this.inN), s2 = 1 / Math.sqrt(this.hidN);
    this.wIH = Array.from({ length: this.hidN }, function () { return Array.from({ length: this.inN }, function () { return (Math.random() * 2 - 1) * s1; }); });
    this.wHO = Array.from({ length: this.outN }, function () { return Array.from({ length: this.hidN }, function () { return (Math.random() * 2 - 1) * s2; }); });
    this.wRF = Array.from({ length: this.rhyN }, function () { return Array.from({ length: this.hidN }, function () { return (Math.random() * 2 - 1) * s2; }); });
    this.wH1 = Array.from({ length: this.harmHid }, function () { return Array.from({ length: this.inN }, function () { return (Math.random() * 2 - 1) * s1; }); });
    this.bH1 = new Array(this.harmHid).fill(0);
    this.wH2 = Array.from({ length: HARM }, function () { return Array.from({ length: this.harmHid }, function () { return (Math.random() * 2 - 1) / Math.sqrt(this.harmHid); }); });
    this.bH2 = new Array(HARM).fill(0);
    this.bH = new Array(this.hidN).fill(0); this.bO = new Array(this.outN).fill(0); this.bRF = new Array(this.rhyN).fill(0);
    this.vWIH = this.zeros2(this.hidN, this.inN); this.vWHO = this.zeros2(this.outN, this.hidN); this.vWRF = this.zeros2(this.rhyN, this.hidN);
    this.vBH = new Array(this.hidN).fill(0); this.vBO = new Array(this.outN).fill(0); this.vBRF = new Array(this.rhyN).fill(0);
    this.mWIH = this.zeros2(this.hidN, this.inN); this.sWIH = this.zeros2(this.hidN, this.inN);
    this.mWHO = this.zeros2(this.outN, this.hidN); this.sWHO = this.zeros2(this.outN, this.hidN);
    this.mWRF = this.zeros2(this.rhyN, this.hidN); this.sWRF = this.zeros2(this.rhyN, this.hidN);
    this.mBH = new Array(this.hidN).fill(0); this.sBH = new Array(this.hidN).fill(0);
    this.mBO = new Array(this.outN).fill(0); this.sBO = new Array(this.outN).fill(0);
    this.mBRF = new Array(this.rhyN).fill(0); this.sBRF = new Array(this.rhyN).fill(0);
    this.vW1 = this.zeros2(this.harmHid, this.inN); this.vB1 = new Array(this.harmHid).fill(0);
    this.vW2 = this.zeros2(HARM, this.harmHid); this.vB2 = new Array(HARM).fill(0);
    this.t = 0;
    this.lastIn = new Array(this.inN).fill(0);
    this.lastHid = new Array(this.hidN).fill(0);
    this.lastOut = new Array(this.outN).fill(0);
    this.rOut = new Array(this.rhyN).fill(0);
    this.harmOut = new Array(HARM).fill(0);
    this.hidH = new Array(this.harmHid).fill(0);
};
NeuralNetwork.prototype.resetGrad = function () {
    this.gw1 = this.zeros2(this.hidN, this.inN); this.gb1 = new Array(this.hidN).fill(0);
    this.gw2 = this.zeros2(this.outN, this.hidN); this.gb2 = new Array(this.outN).fill(0);
    this.gwR = this.zeros2(this.rhyN, this.hidN); this.gbR = new Array(this.rhyN).fill(0);
    this.gwH1 = this.zeros2(this.harmHid, this.inN); this.gbH1 = new Array(this.harmHid).fill(0);
    this.gwH2 = this.zeros2(HARM, this.harmHid); this.gbH2 = new Array(HARM).fill(0);
};
NeuralNetwork.prototype.clip = function () {
    var s1 = 1 / Math.sqrt(this.inN), s2 = 1 / Math.sqrt(this.hidN), s3 = 1 / Math.sqrt(this.harmHid), bound = 2.0, i, j, w;
    for (i = 0; i < this.hidN; i++) {
        for (j = 0; j < this.inN; j++) {
            w = this.wIH[i][j];
            if (!isFinite(w)) this.wIH[i][j] = (Math.random() * 2 - 1) * s1;
            else if (w > bound) this.wIH[i][j] = bound;
            else if (w < -bound) this.wIH[i][j] = -bound;
        }
        if (!isFinite(this.bH[i])) this.bH[i] = 0;
        if (this.bH[i] > bound) this.bH[i] = bound;
        else if (this.bH[i] < -bound) this.bH[i] = -bound;
    }
    for (var k = 0; k < this.outN; k++) {
        for (j = 0; j < this.hidN; j++) {
            w = this.wHO[k][j];
            if (!isFinite(w)) this.wHO[k][j] = (Math.random() * 2 - 1) * s2;
            else if (w > bound) this.wHO[k][j] = bound;
            else if (w < -bound) this.wHO[k][j] = -bound;
        }
        if (!isFinite(this.bO[k])) this.bO[k] = 0;
        if (this.bO[k] > bound) this.bO[k] = bound;
        else if (this.bO[k] < -bound) this.bO[k] = -bound;
    }
    for (var r = 0; r < this.rhyN; r++) {
        for (j = 0; j < this.hidN; j++) {
            w = this.wRF[r][j];
            if (!isFinite(w)) this.wRF[r][j] = (Math.random() * 2 - 1) * s2;
            else if (w > bound) this.wRF[r][j] = bound;
            else if (w < -bound) this.wRF[r][j] = -bound;
        }
        if (!isFinite(this.bRF[r])) this.bRF[r] = 0;
        if (this.bRF[r] > bound) this.bRF[r] = bound;
        else if (this.bRF[r] < -bound) this.bRF[r] = -bound;
    }
    for (var i2 = 0; i2 < this.harmHid; i2++) {
        for (j = 0; j < this.inN; j++) {
            w = this.wH1[i2][j];
            if (!isFinite(w)) this.wH1[i2][j] = (Math.random() * 2 - 1) * s1;
            else if (w > bound) this.wH1[i2][j] = bound;
            else if (w < -bound) this.wH1[i2][j] = -bound;
        }
        if (!isFinite(this.bH1[i2])) this.bH1[i2] = 0;
        if (this.bH1[i2] > bound) this.bH1[i2] = bound;
        else if (this.bH1[i2] < -bound) this.bH1[i2] = -bound;
    }
    for (var h = 0; h < HARM; h++) {
        for (j = 0; j < this.harmHid; j++) {
            w = this.wH2[h][j];
            if (!isFinite(w)) this.wH2[h][j] = (Math.random() * 2 - 1) * s3;
            else if (w > bound) this.wH2[h][j] = bound;
            else if (w < -bound) this.wH2[h][j] = -bound;
        }
        if (!isFinite(this.bH2[h])) this.bH2[h] = 0;
        if (this.bH2[h] > bound) this.bH2[h] = bound;
        else if (this.bH2[h] < -bound) this.bH2[h] = -bound;
    }
};
NeuralNetwork.prototype.predict = function (inputs) {
    this.lastIn = inputs.slice();
    var self = this;
    this.lastHid = this.wIH.map(function (w, i) { return sigmoid(w.reduce(function (s, v, j) { return s + v * inputs[j]; }, self.bH[i])); });
    for (var h = 0; h < this.hidN; h++) if (!isFinite(this.lastHid[h])) this.lastHid[h] = 0;
    var logits = this.wHO.map(function (w, i) { return w.reduce(function (s, v, j) { return s + v * self.lastHid[j]; }, self.bO[i]); });
    var m = logits[0], sum = 0, e = [];
    for (var k = 1; k < this.outN; k++) if (logits[k] > m) m = logits[k];
    for (var k = 0; k < this.outN; k++) { e[k] = Math.exp(logits[k] - m); sum += e[k]; }
    for (var k = 0; k < this.outN; k++) { this.lastOut[k] = e[k] / sum; if (!isFinite(this.lastOut[k])) this.lastOut[k] = 1 / this.outN; }
    var rl = new Array(this.rhyN), mr = rl[0], sr = 0, re = [];
    for (var r = 0; r < this.rhyN; r++) rl[r] = this.wRF[r].reduce(function (s, v, j) { return s + v * self.lastHid[j]; }, self.bRF[r]);
    for (var r = 1; r < this.rhyN; r++) if (rl[r] > mr) mr = rl[r];
    for (var r = 0; r < this.rhyN; r++) { re[r] = Math.exp(rl[r] - mr); sr += re[r]; }
    for (var r = 0; r < this.rhyN; r++) { this.rOut[r] = re[r] / sr; if (!isFinite(this.rOut[r])) this.rOut[r] = 1 / this.rhyN; }
    return this.lastOut;
};
NeuralNetwork.prototype.predictHarm = function (inputs) {
    var i, j, h2;
    for (i = 0; i < this.harmHid; i++) {
        var acc = this.bH1[i];
        for (j = 0; j < this.inN; j++) acc += this.wH1[i][j] * inputs[j];
        this.hidH[i] = sigmoid(acc);
    }
    var hl = new Array(HARM), mh = -Infinity, sh = 0;
    for (h2 = 0; h2 < HARM; h2++) {
        var a2 = this.bH2[h2];
        for (i = 0; i < this.harmHid; i++) a2 += this.wH2[h2][i] * this.hidH[i];
        hl[h2] = a2;
        if (a2 > mh) mh = a2;
    }
    for (h2 = 0; h2 < HARM; h2++) { this.harmOut[h2] = Math.exp(hl[h2] - mh); sh += this.harmOut[h2]; }
    for (h2 = 0; h2 < HARM; h2++) { this.harmOut[h2] /= sh; if (!isFinite(this.harmOut[h2])) this.harmOut[h2] = 1 / HARM; }
    return this.harmOut;
};
NeuralNetwork.prototype.accumulate = function (inputs, target, rhyTarget) {
    var out = this.predict(inputs);
    var d = new Array(this.outN);
    for (var k = 0; k < this.outN; k++) d[k] = clmp(out[k] - target[k]);
    for (var k = 0; k < this.outN; k++) { this.gb2[k] += d[k]; for (var j = 0; j < this.hidN; j++) this.gw2[k][j] += d[k] * this.lastHid[j]; }
    for (var i = 0; i < this.hidN; i++) {
        var err = 0;
        for (var k = 0; k < this.outN; k++) err += d[k] * this.wHO[k][i];
        var dh = clmp(err * dsigmoid(this.lastHid[i]));
        this.gb1[i] += dh;
        for (var j = 0; j < this.inN; j++) this.gw1[i][j] += dh * inputs[j];
    }
    for (var r = 0; r < this.rhyN; r++) {
        var dr = clmp(this.rOut[r] - (rhyTarget === r ? 1 : 0));
        this.gbR[r] += dr;
        for (var j = 0; j < this.hidN; j++) this.gwR[r][j] += dr * this.lastHid[j];
    }
};
NeuralNetwork.prototype.accumulateHarm = function (inputs, targetIdx) {
    var p = this.predictHarm(inputs);
    var dH = new Array(HARM), h2, i, j, smooth = 0.05;
    for (h2 = 0; h2 < HARM; h2++) {
        var tgt = (h2 === targetIdx) ? (1 - smooth) : (smooth / (HARM - 1));
        dH[h2] = p[h2] - tgt;
    }
    for (h2 = 0; h2 < HARM; h2++) { this.gbH2[h2] += dH[h2]; for (i = 0; i < this.harmHid; i++) this.gwH2[h2][i] += dH[h2] * this.hidH[i]; }
    for (i = 0; i < this.harmHid; i++) {
        var err = 0;
        for (h2 = 0; h2 < HARM; h2++) err += dH[h2] * this.wH2[h2][i];
        var dh = clmp(err * dsigmoid(this.hidH[i]));
        this.gbH1[i] += dh;
        for (j = 0; j < this.inN; j++) this.gwH1[i][j] += dh * inputs[j];
    }
    var ce = -Math.log(Math.max(1e-9, p[targetIdx]));
    return isFinite(ce) ? ce : NaN;
};
NeuralNetwork.prototype.applyStep = function (lr, mu, B) {
    var sc = lr / B, i, j, k, r, g;
    for (i = 0; i < this.hidN; i++) for (j = 0; j < this.inN; j++) { g = this.gw1[i][j]; if (g !== 0) { this.vWIH[i][j] = mu * this.vWIH[i][j] + sc * clmp(g); this.wIH[i][j] += this.vWIH[i][j]; } }
    for (i = 0; i < this.hidN; i++) { g = this.gb1[i]; if (g !== 0) { this.vBH[i] = mu * this.vBH[i] + sc * clmp(g); this.bH[i] += this.vBH[i]; } }
    for (k = 0; k < this.outN; k++) {
        for (j = 0; j < this.hidN; j++) { g = this.gw2[k][j]; if (g !== 0) { this.vWHO[k][j] = mu * this.vWHO[k][j] + sc * clmp(g); this.wHO[k][j] += this.vWHO[k][j]; } }
        g = this.gb2[k]; if (g !== 0) { this.vBO[k] = mu * this.vBO[k] + sc * clmp(g); this.bO[k] += this.vBO[k]; }
    }
    for (r = 0; r < this.rhyN; r++) {
        for (j = 0; j < this.hidN; j++) { g = this.gwR[r][j]; if (g !== 0) { this.vWRF[r][j] = mu * this.vWRF[r][j] + sc * clmp(g); this.wRF[r][j] += this.vWRF[r][j]; } }
        g = this.gbR[r]; if (g !== 0) { this.vBRF[r] = mu * this.vBRF[r] + sc * clmp(g); this.bRF[r] += this.vBRF[r]; }
    }
    for (i = 0; i < this.hidN; i++) for (j = 0; j < this.inN; j++) this.wIH[i][j] *= (1 - this.wd * lr);
    for (k = 0; k < this.outN; k++) for (j = 0; j < this.hidN; j++) this.wHO[k][j] *= (1 - this.wd * lr);
    for (r = 0; r < this.rhyN; r++) for (j = 0; j < this.hidN; j++) this.wRF[r][j] *= (1 - this.wd * lr);
    var sc2 = 1.2 / HARM_BATCH, h2, gg;
    for (h2 = 0; h2 < HARM; h2++) {
        for (i = 0; i < this.harmHid; i++) {
            g = this.gwH2[h2][i];
            if (g !== 0) { gg = Math.max(-2, Math.min(2, g)); this.vW2[h2][i] = mu * this.vW2[h2][i] + sc2 * gg; this.wH2[h2][i] += this.vW2[h2][i]; }
        }
        gg = Math.max(-2, Math.min(2, this.gbH2[h2]));
        if (this.gbH2[h2] !== 0) { this.vB2[h2] = mu * this.vB2[h2] + sc2 * gg; this.bH2[h2] += this.vB2[h2]; }
    }
    for (i = 0; i < this.harmHid; i++) {
        for (j = 0; j < this.inN; j++) {
            g = this.gwH1[i][j];
            if (g !== 0) { gg = Math.max(-2, Math.min(2, g)); this.vW1[i][j] = mu * this.vW1[i][j] + sc2 * gg; this.wH1[i][j] += this.vW1[i][j]; }
        }
        gg = Math.max(-2, Math.min(2, this.gbH1[i]));
        if (this.gbH1[i] !== 0) { this.vB1[i] = mu * this.vB1[i] + sc2 * gg; this.bH1[i] += this.vB1[i]; }
    }
    this.clip();
};
var nn = new NeuralNetwork(IN, HID, OUT, RHY, 0.2);
function buildFeatures(last, prev, root, quality, stepInBar, scaleId, chord) {
    var f = new Array(IN).fill(0);
    if (last >= 0) f[last] = 1;
    if (prev >= 0) f[12 + prev] = 1;
    f[24 + root] = 1;
    for (var i = 0; i < chord.length; i++) f[36 + chord[i]] = 1;
    var phrasePos = stepInBar % 8;
    f[48] = quality;
    f[49] = phrasePos >= 6 ? 1 : 0;
    f[50] = stepInBar / 15;
    f[51] = scaleId;
    f[52] = stepInBar >= 8 ? 1 : 0;
    return f;
}
function teacherBar(prog, hist, motifIdx) {
    var motif = MOTIFS[motifIdx % MOTIFS.length], steps = [];
    for (var bi = 0; bi < 4; bi++) {
        var name = prog[bi], c = chordOf(name);
        var root = chordRootAbs(name), sc = scalePcs(c.s), chord = chordAbs(name);
        var prev = hist.length ? hist[hist.length - 1] : TONIC;
        for (var s = 0; s < 16; s++) {
            var phrasePos = s % 8, nearEnd = phrasePos >= 6, isAns = s >= 8, w = {};
            for (var p = 0; p < sc.length; p++) w[sc[p]] = 0.02;
            for (var q = 0; q < chord.length; q++) w[chord[q]] = (w[chord[q]] || 0) + 2.0;
            for (var pc in w) { var d = minDist(prev, +pc); if (d <= 2) w[pc] += 1.2 * Math.exp(-d); }
            if (!isAns) { var seeded = sc[motif[s % motif.length] % sc.length]; w[seeded] = (w[seeded] || 0) + 1.4; }
            if (nearEnd) { var rnote = isAns ? TONIC : (c.s === 1 ? pcAbs(11) : root); for (var pc in w) w[pc] += 2.4 / (1 + minDist(rnote, +pc)); }
            var keys = Object.keys(w), total = 0;
            for (var k = 0; k < keys.length; k++) total += w[keys[k]];
            var soft = new Array(OUT).fill(0);
            for (var k = 0; k < keys.length; k++) soft[keys[k]] = w[keys[k]] / total;
            var pow = 0.5, ss = 0;
            for (var k = 0; k < OUT; k++) { soft[k] = Math.pow(soft[k], pow); ss += soft[k]; }
            for (var k = 0; k < OUT; k++) soft[k] = soft[k] / ss;
            var best = 0, chosen = TONIC;
            for (var k = 0; k < keys.length; k++) if (w[keys[k]] > best) { best = w[keys[k]]; chosen = +keys[k]; }
            hist.push(chosen);
            steps.push({ pc: chosen, target: soft, root: root, q: c.q, s: c.s, step: s, chord: chord });
            prev = chosen;
        }
    }
    return steps;
}
var dataset = [], harmPool = [], harmValPool = [];
var SONGS = 120;
function genData() {
    dataset = []; harmPool = []; harmValPool = [];
    for (var g = 0; g < SONGS; g++) {
        var prog = PROGRESSIONS[Math.floor(Math.random() * PROGRESSIONS.length)];
        var motifIdx = Math.floor(Math.random() * MOTIFS.length);
        var hist = [TONIC];
        var steps = teacherBar(prog, hist, motifIdx);
        var grooveForBar = [0, 0, 0, 0];
        for (var bi = 0; bi < 4; bi++) grooveForBar[bi] = Math.floor(Math.random() * RHY);
        for (var i = 0; i < steps.length; i++) {
            var st = steps[i];
            var last = hist[i], prev = i > 0 ? hist[i - 1] : -1;
            var bar = Math.floor(i / 16);
            dataset.push({ x: buildFeatures(last, prev, st.root, st.q, st.step, st.s, st.chord), t: st.target, tr: grooveForBar[bar] });
        }
        for (var bi = 0; bi < 4; bi++) {
            var name = prog[bi], c = chordOf(name);
            var root = chordRootAbs(name), chord = chordAbs(name);
            var feat = buildFeatures(root, root, root, c.q, bi * 4, c.s, chord);
            var next = harmName(prog[(bi + 1) % 4]);
            var hs = { x: feat, t: funcIdx(next) };
            if (g % 6 === 5) harmValPool.push(hs); else harmPool.push(hs);
        }
    }
    for (var rep = 0; rep < 8; rep++) {
        for (var pi = 0; pi < PROGRESSIONS.length; pi++) {
            var p0 = PROGRESSIONS[pi];
            for (var rot = 0; rot < 4; rot++) {
                var nm = p0[rot % 4], cc = chordOf(nm);
                var rt = chordRootAbs(nm), ch = chordAbs(nm);
                var ft = buildFeatures(rt, rt, rt, cc.q, rot * 4, cc.s, ch);
                var nx = harmName(p0[(rot + 1) % 4]);
                var hss = { x: ft, t: funcIdx(nx) };
                if ((rep + pi + rot) % 5 === 0) harmValPool.push(hss); else harmPool.push(hss);
            }
        }
    }
    log('genData key=' + TONIC + ' (' + (KEY_NAMES[TONIC] || '?') + ') dataset=' + dataset.length + ' harm=' + harmPool.length + '/' + harmValPool.length);
}
var logBox = null, logBody = null, logLines = [];
function setToggleBtn(txt) {
    try { var tb = document.getElementById('logToggleBtn'); if (tb) tb.textContent = txt; } catch (e) { }
}
function toggleLog() {
    if (!logBody) return;
    if (logBody.style.display === 'none') {
        logBody.style.display = 'block';
        if (logBox) logBox.style.maxHeight = '260px';
        setToggleBtn('\u2212');
    } else {
        logBody.style.display = 'none';
        if (logBox) logBox.style.maxHeight = '30px';
        setToggleBtn('+');
    }
}
function copyLogs() {
    var txt = logLines.join('\n'), cb = document.getElementById('logCopyBtn');
    function mark() { if (cb) { cb.textContent = '\u2713'; setTimeout(function () { cb.textContent = 'Copy'; }, 900); } }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(mark, mark);
    } else {
        window.prompt('Copy logs:', txt);
        mark();
    }
}
function log(msg) {
    try {
        if (!logBox) {
            logBox = document.createElement('div');
            logBox.id = 'logBox';
            logBox.style.cssText = 'position:fixed;left:10px;bottom:10px;width:380px;max-height:260px;overflow:hidden;background:rgba(13,17,23,0.95);border:1px solid rgba(13,110,253,0.35);border-radius:8px;padding:0;font-family:monospace;font-size:11px;color:#7ab3ff;z-index:60;display:flex;flex-direction:column;';
            var head = document.createElement('div');
            head.style.cssText = 'display:flex;justify-content:flex-end;align-items:center;gap:4px;padding:4px 8px;border-bottom:1px solid rgba(13,110,253,0.25);background:rgba(13,17,23,0.7);';
            var right = document.createElement('div');
            right.style.cssText = 'display:flex;gap:4px;';
            var tb = document.createElement('button');
            tb.id = 'logToggleBtn';
            tb.textContent = '\u2212';
            tb.title = 'Collapse / expand';
            tb.style.cssText = 'background:rgba(13,110,253,0.2);color:#7ab3ff;border:1px solid #0d6efd;border-radius:5px;padding:2px 10px;font-size:12px;cursor:pointer;';
            tb.addEventListener('click', toggleLog);
            var cb = document.createElement('button');
            cb.id = 'logCopyBtn';
            cb.textContent = 'Copy';
            cb.title = 'Copy logs';
            cb.style.cssText = 'background:rgba(13,110,253,0.2);color:#7ab3ff;border:1px solid #0d6efd;border-radius:5px;padding:2px 10px;font-size:11px;cursor:pointer;';
            cb.addEventListener('click', copyLogs);
            right.appendChild(tb);
            right.appendChild(cb);
            head.appendChild(right);
            logBox.appendChild(head);
            logBody = document.createElement('div');
            logBody.style.cssText = 'overflow:auto;max-height:230px;padding:6px;';
            logBox.appendChild(logBody);
            document.body.appendChild(logBox);
        }
        var line = document.createElement('div');
        line.textContent = (new Date()).toISOString().substr(11, 8) + ' ' + msg;
        logBody.appendChild(line);
        logLines.push(line.textContent);
        if (logLines.length > 400) logLines = logLines.slice(-400);
        while (logBody.childNodes.length > 60) logBody.removeChild(logBody.firstChild);
        if (logBody.style.display !== 'none') logBody.scrollTop = logBody.scrollHeight;
    } catch (e) { }
}
var epoch = 0, bestLoss = Infinity, isTraining = false, smoothedLoss = null, valHarm = NaN, valHarm2 = NaN, harmTrain = NaN;
var lossHistory = [], accTick = 0, accCache = null, toastTimer = 0, anim = 0, lastAccLogged = -1;
var RUN_EPOCHS = 160, BATCH = 64, HARM_BATCH = 96;
function trainOneEpoch() {
    if (dataset.length < 1) return;
    nn.resetGrad();
    var loss = 0;
    for (var b = 0; b < BATCH; b++) {
        var s = dataset[Math.floor(Math.random() * dataset.length)];
        nn.accumulate(s.x, s.t, s.tr);
        var o = nn.lastOut, ce = 0;
        for (var k = 0; k < OUT; k++) ce -= s.t[k] * Math.log(Math.max(1e-9, o[k]));
        if (isFinite(ce)) loss += ce;
    }
    if (harmPool.length) {
        for (var pass = 0; pass < 3; pass++) {
            for (var b2 = 0; b2 < HARM_BATCH; b2++) {
                var hs = harmPool[Math.floor(Math.random() * harmPool.length)];
                nn.accumulateHarm(hs.x, hs.t);
            }
        }
    }
    nn.applyStep(nn.lr, nn.mu, BATCH);
    epoch++;
    var avg = loss / BATCH;
    smoothedLoss = smoothedLoss === null ? avg : smoothedLoss + (avg - smoothedLoss) * 0.3;
    if (avg < bestLoss) bestLoss = avg;
    if (lossHistory.length === 0 || epoch % 5 === 0) {
        lossHistory.push(smoothedLoss);
        if (lossHistory.length > 200) lossHistory.shift();
    }
    if (epoch % 50 === 0) log('train epoch=' + epoch + ' loss=' + avg.toFixed(4) + ' smoothed=' + smoothedLoss.toFixed(4) + ' best=' + (bestLoss === Infinity ? '-' : bestLoss.toFixed(4)) + ' harmTr=' + (isNaN(harmTrain) ? '-' : Math.round(harmTrain * 100) + '%') + ' val=' + (isNaN(valHarm) ? '-' : Math.round(valHarm * 100) + '%') + ' t2=' + (isNaN(valHarm2) ? '-' : Math.round(valHarm2 * 100) + '%'));
}
function computeAcc() {
    var ok = 0, cnt = 0;
    for (var i = 0; i < dataset.length; i += 3) {
        var o = nn.predict(dataset[i].x);
        var t3 = [0, 1, 2].map(function (_, j) { return j; }).sort(function (a, b) { return o[b] - o[a]; }).slice(0, 3);
        if (t3.indexOf(argmax(dataset[i].t)) >= 0) ok++;
        cnt++;
    }
    var acc = cnt ? ok / cnt : 0, pct = Math.round(acc * 100);
    if (pct !== lastAccLogged) { lastAccLogged = pct; log('acc top3=' + pct + '% (ok=' + ok + '/' + cnt + ')'); }
    if (harmValPool.length) {
        var okh = 0, okh2 = 0, oktr = 0;
        for (var j = 0; j < harmValPool.length; j++) {
            var hs = harmValPool[j];
            var hp = nn.predictHarm(hs.x);
            var top2 = [0, 1].map(function (_, q) { return q; }).sort(function (a, b) { return hp[b] - hp[a]; }).slice(0, 2);
            if (top2[0] === hs.t) okh++;
            if (top2[0] === hs.t || top2[1] === hs.t) okh2++;
        }
        valHarm = okh / harmValPool.length;
        valHarm2 = okh2 / harmValPool.length;
        var ntr = Math.min(140, harmPool.length), trc = 0;
        for (var q2 = 0; q2 < ntr; q2++) {
            var ht = harmPool[q2];
            nn.predictHarm(ht.x);
            if (argmax(nn.harmOut) === ht.t) trc++;
        }
        harmTrain = ntr ? trc / ntr : NaN;
    }
    return acc;
}
function resetTrainingStats() {
    epoch = 0; bestLoss = Infinity; smoothedLoss = null; lossHistory = [];
    accCache = null; valHarm = NaN; valHarm2 = NaN; harmTrain = NaN;
}
function updateStats() {
    var sm = smoothedLoss === null ? '-' : smoothedLoss.toFixed(3);
    var ap = accCache === null ? '-' : Math.round(accCache * 100) + '%';
    document.getElementById('trainStats').textContent = 'Epoch: ' + epoch + ' | Loss: ' + sm + ' | Top3: ' + ap + ' | Harm Tr: ' + (isNaN(harmTrain) ? '-' : Math.round(harmTrain * 100) + '%') + ' Val: ' + (isNaN(valHarm) ? '-' : Math.round(valHarm * 100) + '%') + '/' + (isNaN(valHarm2) ? '-' : Math.round(valHarm2 * 100) + '%');
    document.getElementById('lossStats').textContent = 'Current: ' + sm + ' | Best: ' + (bestLoss === Infinity ? '-' : bestLoss.toFixed(4));
    document.getElementById('rawStats').textContent = 'Epoch=' + epoch + ' | Loss=' + sm + ' | Top3=' + ap + ' | HarmTr=' + (isNaN(harmTrain) ? '-' : Math.round(harmTrain * 100) + '%') + ' Val=' + (isNaN(valHarm) ? '-' : Math.round(valHarm * 100) + '%') + '/' + (isNaN(valHarm2) ? '-' : Math.round(valHarm2 * 100) + '%') + ' | Ex=' + exPool.length + ' | opt=' + nn.opt.toUpperCase() + ' | lr=' + nn.lr + ' | key=' + TONIC + ' | arch=53-48-12+r+h v1.0.2';
}
function copyStats() {
    var txt = document.getElementById('rawStats').textContent;
    function done() { showToast('Stats copied'); }
    function fail() { window.prompt('Copy stats:', txt); done(); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, fail);
    } else {
        window.prompt('Copy stats:', txt);
        done();
    }
}
function setAuto(v) { KEY_AUTO = v; }
function retrainKey(pc, silent) {
    if (pc === TONIC) return;
    TONIC = pc;
    document.getElementById('keyName').textContent = KEY_NAMES[pc] || ('Key ' + pc);
    log('=== KEY CHANGE to ' + TONIC + ' (' + (KEY_NAMES[pc] || '?') + ') ===');
    genData();
    resetTrainingStats();
    for (var e = 0; e < 150; e++) trainOneEpoch();
    accCache = null;
    updateStats();
    histPc = [TONIC]; histMidi = [72]; lastLeadPc = TONIC; curLeadPC = -1; curBassPC = -1;
    if (!silent) showToast('Key changed to ' + (KEY_NAMES[pc] || pc) + ' - retrained');
}
function setKey(pc) {
    var ak = document.getElementById('autoKey');
    if (ak) ak.checked = false;
    KEY_AUTO = false;
    retrainKey(pc, false);
}
function toggleTrain() {
    if (dataset.length === 0) genData();
    isTraining = !isTraining;
    document.getElementById('trainBtn').textContent = isTraining ? 'Pause' : 'Start Training';
    log('training ' + (isTraining ? 'started' : 'paused'));
}
function trainEpochs(n) {
    if (dataset.length === 0) genData();
    for (var e = 0; e < n; e++) trainOneEpoch();
    isTraining = false;
    document.getElementById('trainBtn').textContent = 'Start Training';
    accCache = null;
    updateStats();
    showToast('Trained ' + n + ' epochs');
}
function resetNetwork() {
    isTraining = false;
    document.getElementById('trainBtn').textContent = 'Start Training';
    nn.reset();
    resetTrainingStats();
    showToast('Network re-initialized');
}
function retrainNow() {
    genData();
    resetTrainingStats();
    for (var e = 0; e < 300; e++) trainOneEpoch();
    accCache = null;
    updateStats();
    showToast('Retrained on fresh patterns');
}
function setLR(v, btn) {
    nn.lr = v;
    document.querySelectorAll('.lr-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
    showToast('Learning rate = ' + v);
}
function setOpt(name, btn) {
    nn.opt = name;
    document.querySelectorAll('.opt-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
    showToast('Optimizer: ' + name.toUpperCase());
}
function exportModel() {
    var data = { kind: 'chiptune-composer', arch: '53-48-12+r+h', ver: '1.0.2', key: TONIC, lr: nn.lr, opt: nn.opt, wIH: nn.wIH, wHO: nn.wHO, wRF: nn.wRF, wH1: nn.wH1, bH1: nn.bH1, wH2: nn.wH2, bH2: nn.bH2, bH: nn.bH, bO: nn.bO, bRF: nn.bRF, ex: exPool };
    var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'chiptune-composer-model.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Model exported');
}
function importModel() { document.getElementById('modelFile').click(); }
function onImportFile(e) {
    var f = e.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
        try {
            var data = JSON.parse(reader.result);
            if (!Array.isArray(data.wIH) || !Array.isArray(data.wHO)) throw new Error('bad');
            if (data.wIH[0].length !== IN || data.wIH.length !== HID) throw new Error('arch');
            isTraining = false;
            document.getElementById('trainBtn').textContent = 'Start Training';
            nn.lr = typeof data.lr === 'number' ? data.lr : nn.lr;
            nn.opt = (data.opt === 'sgd' || data.opt === 'adam') ? data.opt : nn.opt;
            nn.wIH = data.wIH;
            nn.wHO = data.wHO;
            nn.bH = Array.isArray(data.bH) ? data.bH : nn.bH;
            nn.bO = Array.isArray(data.bO) ? data.bO : nn.bO;
            if (Array.isArray(data.wRF)) { nn.wRF = data.wRF; nn.bRF = Array.isArray(data.bRF) ? data.bRF : new Array(RHY).fill(0); }
            if (Array.isArray(data.wH1)) { nn.wH1 = data.wH1; nn.bH1 = Array.isArray(data.bH1) ? data.bH1 : new Array(nn.harmHid).fill(0); }
            if (Array.isArray(data.wH2)) { nn.wH2 = data.wH2; nn.bH2 = Array.isArray(data.bH2) ? data.bH2 : new Array(HARM).fill(0); }
            if (Array.isArray(data.ex)) { exPool = data.ex; }
            nn.t = 0;
            nn.vWIH.forEach(function (a) { a.fill(0); });
            nn.vWHO.forEach(function (a) { a.fill(0); });
            nn.vWRF.forEach(function (a) { a.fill(0); });
            nn.vW1.forEach(function (a) { a.fill(0); });
            nn.vW2.forEach(function (a) { a.fill(0); });
            nn.vBH.fill(0); nn.vBO.fill(0); nn.vBRF.fill(0); nn.vB1.fill(0); nn.vB2.fill(0);
            resetTrainingStats();
            updateNpStats();
            document.querySelectorAll('.lr-btn').forEach(function (b) { b.classList.toggle('active', Math.abs(+b.dataset.lr - nn.lr) < 1e-9); });
            document.querySelectorAll('.opt-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.opt === nn.opt); });
            showToast('Model imported - trained composer loaded');
        } catch (err) { showToast('Import failed - bad file'); }
    };
    reader.readAsText(f);
    e.target.value = '';
}
function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1800);
}
var netCanvas = document.getElementById('netCanvas'), nCtx = netCanvas.getContext('2d');
var lossCanvas = document.getElementById('lossCanvas'), lCtx = lossCanvas.getContext('2d');
var trackCanvas = document.getElementById('trackCanvas'), tCtx = trackCanvas.getContext('2d');
var distCanvas = document.getElementById('distCanvas'), dCtx = distCanvas ? distCanvas.getContext('2d') : null;
var DPR = window.devicePixelRatio || 1;
var NET_W = netCanvas.width, NET_H = netCanvas.height;
var fitTimer = 0;
function fitCanvases() {
    var r;
    netCanvas.width = Math.round(NET_W * DPR);
    netCanvas.height = Math.round(NET_H * DPR);
    nCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    r = trackCanvas.getBoundingClientRect();
    if (r.width > 0) {
        trackCanvas.width = Math.round(r.width * DPR);
        trackCanvas.height = Math.round(r.width * 220 / 620 * DPR);
    }
    r = lossCanvas.getBoundingClientRect();
    if (r.width > 0) {
        lossCanvas.width = Math.round(r.width * DPR);
        lossCanvas.height = Math.round(r.width * 170 / 300 * DPR);
    }
    r = distCanvas.getBoundingClientRect();
    if (r.width > 0) {
        distCanvas.width = Math.round(r.width * DPR);
        distCanvas.height = Math.round(r.width * 120 / 300 * DPR);
    }
}
window.addEventListener('resize', function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitCanvases, 60);
});
var barsWrap = document.getElementById('barsWrap'), barEls = [];
(function () {
    for (var i = 0; i < 6; i++) {
        var d = document.createElement('div');
        d.className = 'bar';
        d.setAttribute('data-ch', i);
        d.innerHTML = '<i></i>';
        barsWrap.appendChild(d);
    }
    barEls = Array.prototype.slice.call(barsWrap.children);
})();
var barAct = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
function drawBars() {
    var now = performance.now();
    for (var ch = 0; ch < 6; ch++) {
        if (now - barAct[ch][0] > 250) barAct[ch][1] *= 0.85;
        if (barAct[ch][1] < 0.01) barAct[ch][1] = 0;
        if (barEls[ch]) barEls[ch].querySelector('i').style.height = (barAct[ch][1] * 100) + '%';
    }
}
function rgba(r, g, b, a) { return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; }
function drawSynapse(a, b, w, pos, neg, maxW, wMax) {
    nCtx.beginPath();
    nCtx.moveTo(a.x, a.y);
    nCtx.lineTo(b.x, b.y);
    nCtx.strokeStyle = w >= 0 ? pos : neg;
    nCtx.lineWidth = Math.max(0.3, Math.min(maxW, Math.abs(w) * (maxW / wMax)));
    nCtx.stroke();
}
function drawOrb(x, y, v, baseR, phase, col) {
    if (!isFinite(v)) v = 0;
    var a = Math.max(0, Math.min(1, v));
    var pulse = 1 + 0.1 * Math.sin(anim * 3.4 + phase);
    var rad = Math.max(2, baseR * (0.6 + 0.85 * a) * pulse);
    if (!isFinite(rad)) rad = baseR;
    var halo = rad * 2.9, g;
    g = nCtx.createRadialGradient(x, y, rad * 0.2, x, y, halo);
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
    if (!isFinite(v)) v = 0;
    var a = Math.max(0, Math.min(1, v));
    var pulse = 1 + 0.1 * Math.sin(anim * 2.8 + phase * 1.1) + (winner ? 0.1 * Math.sin(anim * 7) : 0);
    var rad = baseR * (0.55 + 0.6 * a) * pulse;
    if (!isFinite(rad)) rad = baseR;
    var halo = rad * 2.1, g;
    g = nCtx.createRadialGradient(x, y, rad * 0.2, x, y, halo);
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
        var wr = rad * 1.34 + 2.5 * Math.sin(anim * 5);
        nCtx.beginPath();
        nCtx.arc(x, y, wr, 0, Math.PI * 2);
        nCtx.strokeStyle = rgba(0, 230, 118, 0.45 + 0.3 * Math.sin(anim * 5));
        nCtx.lineWidth = 2;
        nCtx.stroke();
    }
}
function drawNetwork() {
    nCtx.clearRect(0, 0, NET_W, NET_H);
    var isMobile = window.innerWidth <= BREAKPOINT, cols = 14, rows = 4, cell = isMobile ? 16 : 19, gap = 3, gx0 = 24, gy0 = 66, inPts = [];
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var idx = r * cols + c;
        if (idx >= IN) break;
        inPts.push({ x: gx0 + c * (cell + gap), y: gy0 + r * (cell + gap), act: nn.lastIn[idx] });
    }
    var hidX = gx0 + cols * (cell + gap) + 32, hidStep = NET_H / (HID + 1), hidY = [], wMax = 0.001;
    for (var i = 0; i < HID; i++) hidY.push(hidStep * (i + 1));
    var outX = hidX + 150, outStep = NET_H / (OUT + 1);
    for (var i = 0; i < HID; i++) for (var j = 0; j < IN; j++) { var aw = Math.abs(nn.wIH[i][j]); if (aw > wMax) wMax = aw; }
    for (var k = 0; k < OUT; k++) for (var j = 0; j < HID; j++) { var aw2 = Math.abs(nn.wHO[k][j]); if (aw2 > wMax) wMax = aw2; }
    for (var i = 0; i < HID; i++) for (var j = 0; j < inPts.length; j++) drawSynapse({ x: inPts[j].x + cell / 2, y: inPts[j].y + cell / 2 }, { x: hidX, y: hidY[i] }, nn.wIH[i][j], 'rgba(0,210,255,0.14)', 'rgba(255,82,82,0.14)', 1.8, wMax);
    for (var k = 0; k < OUT; k++) for (var j = 0; j < HID; j++) drawSynapse({ x: hidX, y: hidY[j] }, { x: outX, y: outStep * (k + 1) }, nn.wHO[k][j], 'rgba(0,230,118,0.42)', 'rgba(255,82,82,0.32)', 2.8, wMax);
    for (var p = 0; p < inPts.length; p++) {
        var ip = inPts[p], colIn = ip.act > 0 ? [0, 200, 255] : [40, 55, 70];
        nCtx.fillStyle = rgba(colIn[0], colIn[1], colIn[2], 0.2 + 0.8 * ip.act);
        nCtx.fillRect(ip.x, ip.y, cell, cell);
        nCtx.strokeStyle = 'rgba(0,200,255,0.3)';
        nCtx.strokeRect(ip.x + 0.5, ip.y + 0.5, cell - 1, cell - 1);
    }
    for (var i = 0; i < HID; i++) drawOrb(hidX, hidY[i], nn.lastHid[i], 6, i * 0.7, [0, 190, 255]);
    var win = (lastLeadPc >= 0 && lastLeadPc < OUT) ? lastLeadPc : argmax(nn.lastOut);
    for (var k = 0; k < OUT; k++) {
        var vv = nn.lastOut[k], winner = k === win;
        var colO = (degName(k) === 'x' && !winner) ? [70, 80, 90] : (winner ? [0, 230, 118] : (vv > 0.12 ? [0, 210, 255] : [95, 105, 122]));
        drawOutputOrb(outX, outStep * (k + 1), vv, 22, k, colO, winner);
        nCtx.fillStyle = vv > 0.12 ? '#0a0a0a' : '#fff';
        nCtx.font = 'bold 13px sans-serif';
        nCtx.textAlign = 'center';
        nCtx.textBaseline = 'middle';
        nCtx.fillText(degName(k) + ' ' + NOTE_NAMES[k], outX, outStep * (k + 1));
        nCtx.textAlign = 'left';
        nCtx.font = 'bold 11px sans-serif';
        nCtx.fillStyle = winner ? '#00e676' : '#8a8a8a';
        nCtx.fillText(Math.round(vv * 100) + '%', outX + 30, outStep * (k + 1));
    }
    nCtx.textAlign = 'center';
    nCtx.fillStyle = '#666';
    nCtx.font = '10px sans-serif';
    nCtx.fillText('last', gx0 + cols * (cell + gap) / 2 - 8, gy0 - 6);
    nCtx.fillText('prev', gx0 + cols * (cell + gap) / 2 - 8, gy0 + 1 * (cell + gap) + 8);
    nCtx.fillText('root', gx0 + cols * (cell + gap) / 2 - 8, gy0 + 2 * (cell + gap) + 8);
    nCtx.fillText('chord tones', gx0 + cols * (cell + gap) / 2 - 16, gy0 + 3 * (cell + gap) + 8);
}
function drawLoss() {
    var W = lossCanvas.width, H = lossCanvas.height, data = lossHistory;
    lCtx.clearRect(0, 0, W, H);
    lCtx.strokeStyle = '#242424';
    lCtx.lineWidth = 1;
    for (var i = 1; i < 4; i++) {
        var y = Math.round(H * i / 4);
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
    var lo = Math.min.apply(null, data), hi = Math.max.apply(null, data), range = hi - lo;
    if (range < 1e-6) { lo = Math.max(0, lo - 0.05); hi += 0.05; range = hi - lo; }
    range = Math.max(range, 1e-6);
    var padL = 8, padR = 8, padT = 18, padB = 18, innerW = W - padL - padR, innerH = H - padT - padB;
    var xFor = function (i) { return padL + (data.length === 1 ? innerW : innerW * i / (data.length - 1)); };
    var yFor = function (l) { return padT + (1 - (l - lo) / range) * innerH; };
    lCtx.fillStyle = '#9a9a9a';
    lCtx.font = '10px sans-serif';
    lCtx.textAlign = 'left';
    lCtx.textBaseline = 'top';
    lCtx.fillText(hi.toFixed(3), padL, 4);
    lCtx.textBaseline = 'bottom';
    lCtx.fillText(lo.toFixed(3), padL, H - 4);
    lCtx.beginPath();
    lCtx.strokeStyle = '#00e676';
    lCtx.lineWidth = 2;
    data.forEach(function (loss, idx) {
        var x = xFor(idx), y = yFor(loss);
        idx === 0 ? lCtx.moveTo(x, y) : lCtx.lineTo(x, y);
    });
    lCtx.stroke();
    lCtx.fillStyle = '#9a9a9a';
    lCtx.font = '10px sans-serif';
    lCtx.textAlign = 'right';
    lCtx.textBaseline = 'bottom';
    lCtx.fillText('epoch ' + epoch, W - 4, H - 4);
}
function drawDistribution() {
    if (!dCtx || !distCanvas) return;
    var W = distCanvas.width, H = distCanvas.height;
    dCtx.clearRect(0, 0, W, H);
    var out = nn.lastOut, bn = 12, gap = 3, bw = (W - gap * (bn - 1)) / bn;
    var sc = scalePcs(0), i;
    var inScale = new Array(12).fill(0);
    for (i = 0; i < sc.length; i++) inScale[sc[i]] = 1;
    var deg = new Array(12).fill('x');
    for (i = 0; i < 7; i++) deg[sc[i]] = '' + (i + 1);
    for (i = 0; i < bn; i++) {
        var v = out ? out[i] : 0, h = Math.max(2, v * (H - 16));
        if (!inScale[i]) {
            dCtx.fillStyle = 'rgba(80,90,100,0.2)';
            dCtx.fillRect(i * (bw + gap), H - 14, bw, 3);
        } else {
            dCtx.fillStyle = (i === lastLeadPc) ? 'rgba(0,230,118,0.95)' : 'rgba(13,110,253,0.62)';
            dCtx.fillRect(i * (bw + gap), H - 14 - h, bw, h);
        }
        dCtx.fillStyle = inScale[i] ? (i === lastLeadPc ? '#00e676' : '#98a3ad') : '#5a6570';
        dCtx.font = '7px sans-serif';
        dCtx.textAlign = 'center';
        dCtx.textBaseline = 'top';
        dCtx.fillText(inScale[i] ? deg[i] + ' ' + NOTE_NAMES[i] : 'x', i * (bw + gap) + bw / 2, H - 12);
        if (inScale[i] && v > 0.03) {
            dCtx.fillStyle = '#9a9a9a';
            dCtx.font = '6px sans-serif';
            dCtx.textBaseline = 'bottom';
            dCtx.fillText(Math.round(v * 100) + '%', i * (bw + gap) + bw / 2, H - 14 - h);
        }
    }
    dCtx.fillStyle = '#8a8a8a';
    dCtx.font = '8px sans-serif';
    dCtx.textAlign = 'left';
    dCtx.textBaseline = 'bottom';
    dCtx.fillText('1=A 2=B 3=C 4=D 5=E 6=F 7=G', 4, H - 16);
}
var curBarIndex = -1, curProg = [], curChordName = '-', curSectionName = '-', curLeadPC = -1, curBassPC = -1, curGroove = 0;
var histPc = [TONIC], histMidi = [72], lastLeadPc = TONIC;
function updateStatus() {
    var sk = document.getElementById('sKey'), st = document.getElementById('sTempo'), ss = document.getElementById('sSection'), sb = document.getElementById('sBar'), sc2 = document.getElementById('sChord'), sn = document.getElementById('sNotes');
    if (!sk) return;
    sk.textContent = KEY_NAMES[TONIC] || ('Key ' + TONIC);
    st.textContent = songPlan ? songPlan.tempo + ' bpm' : '-';
    ss.textContent = curSectionName;
    sb.textContent = (curBarIndex >= 0 ? (curBarIndex + 1) + '/' + songPlan.barCount : '-') + ' | groove ' + (curGroove + 1) + ' | ' + (curProg.length ? curProg.join(',') : '-');
    sc2.textContent = curChordName || '-';
    sn.textContent = (curLeadPC >= 0 ? pcName(curLeadPC) : '-') + ' / ' + (curBassPC >= 0 ? pcName(curBassPC) : '-') + ' / R' + (curGroove + 1);
}
var roll = [], curStep = 0;
function drawTrack() {
    var W = trackCanvas.width, H = trackCanvas.height;
    tCtx.clearRect(0, 0, W, H);
    var cols = 16, cw = W / cols, base = 57, span = 84 - base, rowsC = 7;
    tCtx.strokeStyle = 'rgba(13,110,253,0.15)';
    tCtx.lineWidth = 1;
    for (var c = 1; c < cols; c++) {
        tCtx.beginPath();
        tCtx.moveTo(c * cw, 0);
        tCtx.lineTo(c * cw, H);
        tCtx.stroke();
    }
    for (var r = 0; r < 9; r++) {
        var yy = H - (H / 8) * r;
        tCtx.beginPath();
        tCtx.moveTo(0, yy);
        tCtx.lineTo(W, yy);
        tCtx.stroke();
    }
    var n = roll.length;
    for (var c = 0; c < cols; c++) {
        var stepShowing = curStep - (cols - 1 - c), idx = -1;
        for (var i = n - 1; i >= 0; i--) { if (roll[i].step === stepShowing) { idx = i; break; } }
        if (idx < 0) continue;
        var it = roll[idx], x = c * cw;
        function note(midi, color, alpha) {
            if (midi == null) return;
            var rf = (midi - base) / span * 7, row = Math.max(0, Math.min(rowsC, Math.round(rf))), y = H - (H / 8) * (row + 1);
            tCtx.fillStyle = color;
            tCtx.globalAlpha = alpha;
            tCtx.fillRect(x + 1, y + 1, cw - 2, H / 8 - 2);
            tCtx.globalAlpha = 1;
        }
        note(it.lead, '#0d6efd', 0.95);
        note(it.arp, '#58a6ff', 0.7);
        note(it.bass, '#f0ad4e', 0.8);
        note(it.lead2, '#2ee6a8', 0.65);
        note(it.pad, '#b388ff', 0.55);
        if (it.drum) { tCtx.fillStyle = '#ff7b3a'; tCtx.fillRect(x + 1, H - 8, cw - 2, 5); }
    }
}
var actx = null, master, chanLead, chanArp, chanBass, chanDrum, chanLead2, chanPad;
var leadDry, echoSend, delayNode, feedbackGain, lowpass, echoOut, noiseBuffer = null;
var playing = false, schedulerId = 0, stepDur = 0, nextTime = 0, mute = [false, false, false, false, false, false], bassCount = 0, tailTimer = 0;
var wavRec = false, wavSamples = [], recNode = null, recMonitor = null, wavStartT = 0, wavTimer = 0, wavDur = 0, wavBlob = null, wavReady = false;
var exPool = [], npPending = [], exNew = 0, npRecOn = false;
var playlist = [], plSeq = 0, plAudio = null, plItem = null, plCurrent = -1, plPlaying = false, autoRecOn = false, autoSamples = [], autoNode = null, autoStartT = 0, liveTones = [], songLive = false;
function updateNpStats() {
    var el = document.getElementById('npStats');
    if (el) el.textContent = 'examples: ' + exPool.length + ' | new: ' + exNew + ' | rec: ' + (npRecOn ? 'on' : 'off');
}
function ensureAudio() {
    buildAudio();
    if (actx && actx.state === 'suspended') actx.resume();
}
function npPlay(pc) {
    ensureAudio();
    var midi = 60 + pc;
    tone('square', freqFromMidi(midi), actx.currentTime, 0.35, chanLead, 0.12);
    if (npRecOn) { npPending.push({ pc: pc }); exNew++; }
    updateNpStats();
}
function npRec() {
    npRecOn = !npRecOn;
    var b = document.getElementById('npRecBtn');
    if (b) {
        b.classList.toggle('recording', npRecOn);
        b.textContent = npRecOn ? 'Stop' : 'Rec';
    }
    showToast(npRecOn ? 'Recording started' : 'Recording stopped');
    updateNpStats();
}
function npContext() {
    if (songPlan && playing) {
        var bar = Math.max(0, Math.min(songPlan.barCount - 1, Math.floor(curStep / 16)));
        var name = songPlan.chords[bar], c = chordOf(name);
        var lastP = histPc.length ? histPc[histPc.length - 1] : TONIC;
        var prevP = histPc.length > 1 ? histPc[histPc.length - 2] : -1;
        return { last: lastP, prev: prevP, root: chordRootAbs(name), q: c.q, s: c.s, step: curStep % 16, chord: chordAbs(name), groove: curGroove };
    }
    var c0 = chordOf('i');
    return { last: TONIC, prev: -1, root: chordRootAbs('i'), q: c0.q, s: c0.s, step: (exPool.length * 2) % 16, chord: chordAbs('i'), groove: 0 };
}
function userTarget(pc) {
    var w = new Array(OUT).fill(0.02);
    w[pc] = 2.6;
    var raw = new Array(OUT).fill(0), sum = 0, k;
    for (k = 0; k < OUT; k++) { raw[k] = Math.exp(w[k] / 0.55); sum += raw[k]; }
    var t = new Array(OUT);
    for (k = 0; k < OUT; k++) t[k] = raw[k] / sum;
    return t;
}
function npSave() {
    if (!npPending.length) { showToast('Nothing recorded yet'); return; }
    var added = 0, skip = 0, i;
    for (i = 0; i < npPending.length; i++) {
        var ev = npPending[i];
        if (degName(ev.pc) === 'x') { skip++; continue; }
        var ctx = npContext();
        var x = buildFeatures(ctx.last, ctx.prev, ctx.root, ctx.q, ctx.step, ctx.s, ctx.chord);
        var s = { x: x, t: userTarget(ev.pc), tr: ctx.groove };
        dataset.push(s);
        exPool.push(s);
        added++;
    }
    npPending = [];
    exNew = 0;
    updateNpStats();
    showToast((added ? 'Added ' + added + ' example steps' : 'Nothing to add') + (skip ? ' (' + skip + ' skipped, off scale)' : ''));
}
function npLearn() {
    if (!exPool.length) { showToast('No saved examples yet'); return; }
    genData();
    for (var i = 0; i < exPool.length; i++) dataset.push(exPool[i]);
    isTraining = false;
    document.getElementById('trainBtn').textContent = 'Start Training';
    for (var e = 0; e < 300; e++) trainOneEpoch();
    accCache = null;
    updateStats();
    showToast('Learned ' + exPool.length + ' example steps + base patterns');
}
function buildNotePad() {
    var wrap = document.getElementById('npKeys');
    if (!wrap) return;
    wrap.innerHTML = '';
    var pc, k;
    for (pc = 0; pc < 12; pc++) {
        k = document.createElement('div');
        k.className = 'np-key' + (degName(pc) === 'x' ? ' off' : '');
        k.textContent = NOTE_NAMES[pc];
        k.title = degName(pc) + ' ' + NOTE_NAMES[pc];
        (function (p) {
            k.addEventListener('mousedown', function (e) { e.preventDefault(); npPlay(p); });
        })(pc);
        wrap.appendChild(k);
    }
    updateNpStats();
}
function fmtTime(t) {
    if (!isFinite(t)) t = 0;
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
}
function fmtSize(bytes) {
    if (!bytes) return '';
    var kb = bytes / 1024;
    return kb >= 1024 ? (kb / 1024).toFixed(2) + ' MB' : kb.toFixed(0) + ' KB';
}
function updateRecUI() {
    var recBtn = document.getElementById('recBtn'), stopBtn = document.getElementById('recStopBtn'), dlBtn = document.getElementById('recDlBtn'), status = document.getElementById('recStatus'), time = document.getElementById('recTime'), file = document.getElementById('recFile');
    if (!status) return;
    if (wavRec) {
        recBtn.classList.add('recording');
        stopBtn.disabled = false;
        dlBtn.disabled = true;
        status.textContent = 'Recording...';
        time.textContent = fmtTime(wavDur);
        file.textContent = '';
    } else if (wavReady) {
        recBtn.classList.remove('recording');
        stopBtn.disabled = true;
        dlBtn.disabled = false;
        status.textContent = 'Ready';
        time.textContent = fmtTime(wavDur);
        file.textContent = 'chiptune-recording.wav (' + fmtSize(wavBlob.size) + ', ' + wavDur.toFixed(1) + ' s)';
    } else {
        recBtn.classList.remove('recording');
        stopBtn.disabled = true;
        dlBtn.disabled = true;
        status.textContent = 'Ready to record';
        time.textContent = '0:00';
        file.textContent = '';
    }
}
function recStart() {
    if (!actx) { showToast('Press Play first'); return; }
    if (wavRec) return;
    wavSamples = [];
    wavBlob = null;
    wavReady = false;
    wavDur = 0;
    wavRec = true;
    wavStartT = performance.now();
    recNode = actx.createScriptProcessor(4096, 2, 2);
    recNode.onaudioprocess = function (e) {
        if (!wavRec) return;
        var c0 = e.inputBuffer.getChannelData(0), c1 = e.inputBuffer.getChannelData(1);
        for (var i = 0; i < c0.length; i++) { wavSamples.push(c0[i], c1[i]); }
    };
    master.connect(recNode);
    recMonitor = actx.createGain();
    recMonitor.gain.value = 0;
    recNode.connect(recMonitor);
    recMonitor.connect(actx.destination);
    wavTimer = setInterval(function () {
        wavDur = (performance.now() - wavStartT) / 1000;
        updateRecUI();
    }, 100);
    updateRecUI();
    showToast('Recording...');
}
function stopWav() {
    if (!wavRec) return;
    wavRec = false;
    clearInterval(wavTimer);
    wavDur = (performance.now() - wavStartT) / 1000;
    if (recNode) { try { recNode.disconnect(); } catch (e) { } recNode = null; }
    if (recMonitor) { try { recMonitor.disconnect(); } catch (e) { } recMonitor = null; }
    var blob = encodeWav(wavSamples, actx.sampleRate, 2, 16);
    wavBlob = blob;
    wavReady = true;
    updateRecUI();
    showToast('Recording saved - ready to download');
}
function downloadWav() {
    if (!wavBlob) { showToast('Nothing to download yet'); return; }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(wavBlob);
    a.download = 'chiptune-recording.wav';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Downloading chiptune-recording.wav');
}
function clearWav() {
    wavSamples = [];
    wavBlob = null;
    wavReady = false;
    wavDur = 0;
    updateRecUI();
    showToast('Recording cleared');
}
function autoRecStart() {
    if (!actx || !master) return;
    autoSamples = [];
    autoRecOn = true;
    autoStartT = performance.now();
    autoNode = actx.createScriptProcessor(4096, 2, 2);
    autoNode.onaudioprocess = function (e) {
        if (!autoRecOn) return;
        var c0 = e.inputBuffer.getChannelData(0);
        var c1 = e.inputBuffer.getChannelData(1);
        for (var i = 0; i < c0.length; i++) {
            autoSamples.push(c0[i], c1[i]);
        }
    };
    master.connect(autoNode);
}
function autoRecStop() {
    if (!autoRecOn) return;
    autoRecOn = false;
    var dur = (performance.now() - autoStartT) / 1000;
    if (autoNode) {
        try { autoNode.disconnect(); } catch (e) { }
        autoNode = null;
    }
    if (dur > 0.4 && autoSamples.length > 0) {
        var blob = encodeWav(autoSamples, actx.sampleRate, 2, 16);
        addPlaylist(blob, dur);
    }
    autoSamples = [];
}
function cancelLiveTones() {
    var now = actx ? actx.currentTime : 0;
    for (var i = 0; i < liveTones.length; i++) {
        var o = liveTones[i];
        try {
            if (o._at <= now) { o.stop(now); }
            else { o.start(now); o.stop(now); }
        } catch (e) { }
    }
    liveTones = [];
}
function addPlaylist(blob, dur) {
    plSeq++;
    var it = { id: plSeq, blob: blob, dur: dur, name: 'track-' + plSeq + '.wav', url: null };
    playlist.push(it);
    while (playlist.length > 3) {
        var rm = playlist.shift();
        if (rm === plItem) {
            try { plAudio.pause(); plAudio.currentTime = 0; } catch (e) { }
            plPlaying = false;
            plItem = null;
            plCurrent = -1;
        }
        if (rm.url) URL.revokeObjectURL(rm.url);
    }
    renderPlaylist();
    showToast('Track saved to playlist: ' + it.name);
}
function renderPlaylist() {
    var list = document.getElementById('plList');
    if (!list) return;
    list.innerHTML = '';
    var cnt = document.getElementById('plCount');
    if (cnt) cnt.textContent = playlist.length + '/3';
    for (var i = 0; i < playlist.length; i++) {
        var it = playlist[i];
        var d = document.createElement('div');
        d.className = 'pl-item';
        d.__it = it;
        var h = document.createElement('div');
        h.className = 'pl-item-head';
        var nm = document.createElement('b');
        nm.textContent = it.name;
        var du = document.createElement('span');
        du.textContent = fmtTime(it.dur);
        h.appendChild(nm);
        h.appendChild(du);
        var g = document.createElement('div');
        g.className = 'btn-group btn-group-sm';
        var pb = document.createElement('button');
        pb.type = 'button';
        pb.className = 'btn btn-green';
        pb.dataset.act = 'play';
        pb.textContent = 'Play';
        (function (idx) {
            pb.onclick = function () { playPl(idx); };
        })(i);
        var db = document.createElement('button');
        db.type = 'button';
        db.className = 'btn btn-info';
        db.textContent = 'Download';
        (function (idx) {
            db.onclick = function () { downloadPl(idx); };
        })(i);
        var rb = document.createElement('button');
        rb.type = 'button';
        rb.className = 'btn btn-red';
        rb.textContent = 'Delete';
        (function (idx) {
            rb.onclick = function () { deletePl(idx); };
        })(i);
        g.appendChild(pb);
        g.appendChild(db);
        g.appendChild(rb);
        d.appendChild(h);
        d.appendChild(g);
        list.appendChild(d);
    }
    updatePlPlayBtn();
}
function ensurePlAudio() {
    if (plAudio) return;
    plAudio = document.createElement('audio');
    plAudio.style.display = 'none';
    document.body.appendChild(plAudio);
    plAudio.addEventListener('play', function () { plPlaying = true; updatePlPlayBtn(); });
    plAudio.addEventListener('pause', function () { plPlaying = false; updatePlPlayBtn(); });
    plAudio.addEventListener('ended', function () {
        plPlaying = false;
        plItem = null;
        plCurrent = -1;
        updatePlPlayBtn();
        showToast('Track finished');
    });
}
function updatePlPlayBtn() {
    var list = document.getElementById('plList');
    if (!list) return;
    var items = list.querySelectorAll('.pl-item');
    for (var i = 0; i < items.length; i++) {
        var btn = items[i].querySelector('[data-act="play"]');
        if (!btn) continue;
        if (items[i].__it === plItem) {
            btn.textContent = plPlaying ? 'Pause' : 'Resume';
            btn.className = plPlaying ? 'btn btn-primary' : 'btn btn-green';
        } else {
            btn.textContent = 'Play';
            btn.className = 'btn btn-green';
        }
    }
}
function playPl(i) {
    var it = playlist[i];
    if (!it) return;
    ensurePlAudio();
    if (plItem === it) {
        if (plPlaying) {
            plAudio.pause();
            plPlaying = false;
            showToast('Paused: ' + it.name);
        } else {
            plAudio.play();
            plPlaying = true;
            showToast('Playing: ' + it.name);
        }
        updatePlPlayBtn();
        return;
    }
    if (playing) stopPlayback();
    if (it.url) URL.revokeObjectURL(it.url);
    it.url = URL.createObjectURL(it.blob);
    plAudio.src = it.url;
    plItem = it;
    plCurrent = i;
    plAudio.play();
    plPlaying = true;
    updatePlPlayBtn();
    showToast('Playing: ' + it.name);
}
function stopPlPlayback() {
    if (!plAudio) return;
    try { plAudio.pause(); plAudio.currentTime = 0; } catch (e) { }
    plPlaying = false;
    plItem = null;
    plCurrent = -1;
    updatePlPlayBtn();
}
function plStop() {
    if (!plAudio || !plItem) { showToast('Nothing is playing'); return; }
    stopPlPlayback();
    showToast('Playback stopped');
}
function downloadPl(i) {
    var it = playlist[i];
    if (!it) return;
    var url = URL.createObjectURL(it.blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = it.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    showToast('Downloading ' + it.name);
}
function deletePl(i) {
    var it = playlist[i];
    if (!it) return;
    if (it === plItem) {
        try { plAudio.pause(); plAudio.currentTime = 0; } catch (e) { }
        plPlaying = false;
        plItem = null;
        plCurrent = -1;
    }
    if (it.url) URL.revokeObjectURL(it.url);
    playlist.splice(i, 1);
    renderPlaylist();
    showToast('Track removed from playlist');
}
function writeWavString(view, offset, str) {
    for (var i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}
function encodeWav(samples, sampleRate, channels, bits) {
    var blockAlign = channels * (bits / 8), bytesPerSec = sampleRate * blockAlign, dataLength = samples.length * (bits / 8);
    var buffer = new ArrayBuffer(44 + dataLength), view = new DataView(buffer);
    writeWavString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeWavString(view, 8, 'WAVE');
    writeWavString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, bytesPerSec, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bits, true);
    writeWavString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    var offset = 44;
    for (var i = 0; i < samples.length; i++) {
        var v = Math.max(-1, Math.min(1, samples[i])), val = v < 0 ? v * 32768 : v * 32767;
        view.setInt16(offset, val, true);
        offset += 2;
    }
    return new Blob([buffer], { type: 'audio/wav' });
}
function setMaster() {
    var v = +document.getElementById('volSlider').value || 0;
    masterVol = v;
    document.getElementById('volVal').textContent = v;
    if (master && !globalMuted) master.gain.setTargetAtTime(v / 100 * 0.9, actx.currentTime, 0.02);
}
function toggleMaster() {
    globalMuted = !globalMuted;
    var btn = document.getElementById('muteAllBtn');
    if (master) master.gain.setTargetAtTime(globalMuted ? 0 : masterVol / 100 * 0.9, actx.currentTime, 0.02);
    btn.textContent = globalMuted ? 'Unmute All' : 'Mute All';
    btn.classList.toggle('red', globalMuted);
}
function makeNoise() {
    var len = Math.floor(actx.sampleRate * 0.3), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
}
function buildAudio() {
    if (actx) return;
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain();
    master.gain.value = globalMuted ? 0 : masterVol / 100 * 0.9;
    chanLead = actx.createGain(); chanLead.gain.value = 0.32;
    chanArp = actx.createGain(); chanArp.gain.value = 0.16;
    chanBass = actx.createGain(); chanBass.gain.value = 0.62;
    chanDrum = actx.createGain(); chanDrum.gain.value = 0.5;
    chanLead2 = actx.createGain(); chanLead2.gain.value = 0.16;
    chanPad = actx.createGain(); chanPad.gain.value = 0.45;
    leadDry = actx.createGain(); leadDry.gain.value = 1;
    echoSend = actx.createGain(); echoSend.gain.value = 0.6;
    delayNode = actx.createDelay(2.0);
    feedbackGain = actx.createGain(); feedbackGain.gain.value = 0.3;
    lowpass = actx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2800;
    echoOut = actx.createGain(); echoOut.gain.value = 0.3;
    master.connect(actx.destination);
    chanLead.connect(leadDry);
    leadDry.connect(master);
    chanLead.connect(echoSend);
    chanArp.connect(echoSend);
    chanLead2.connect(echoSend);
    echoSend.connect(delayNode);
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    delayNode.connect(lowpass);
    lowpass.connect(echoOut);
    echoOut.connect(master);
    chanArp.connect(master);
    chanBass.connect(master);
    chanDrum.connect(master);
    chanLead2.connect(master);
    chanPad.connect(master);
    noiseBuffer = makeNoise();
}
function setEcho() {
    var el = document.getElementById('echoSlider');
    if (!el) return;
    document.getElementById('echoVal').textContent = el.value;
    if (!echoOut) return;
    var v = (+el.value) / 100;
    echoOut.gain.setTargetAtTime(v * 0.9, actx.currentTime, 0.02);
}
var CHAN_GAIN = [0.32, 0.16, 0.62, 0.5, 0.16, 0.45];
function toggleMute(ch) {
    mute[ch] = !mute[ch];
    var d = [chanLead, chanArp, chanBass, chanDrum, chanLead2, chanPad][ch];
    if (d) d.gain.setTargetAtTime(mute[ch] ? 0 : CHAN_GAIN[ch], actx.currentTime, 0.02);
    document.querySelectorAll('.mute')[ch].classList.toggle('on', !mute[ch]);
}
function freqFromMidi(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function placeLead(pc, prevMidi, hi) {
    var lo = 50, hiY = hi ? 88 : 78;
    var best = 60, bestD = 999;
    for (var m = pc; m <= 96; m += 12) {
        if (m < lo || m > hiY) continue;
        var dd = Math.abs(m - prevMidi);
        if (dd < bestD) { best = m; bestD = dd; }
        else if (dd === bestD && m < best) { best = m; }
    }
    return best;
}
function placeBass(pc) {
    for (var m = pc + 24; m >= 0; m -= 12) {
        if (m <= 38) return m + 12;
    }
    return pc;
}
function placeArp(pc) {
    for (var m = pc; m <= 96; m += 12) {
        if (m >= 48 && m <= 72) return m;
    }
    return 60;
}
function tone(type, freq, t0, dur, dest, vol) {
    if (vol <= 0) return;
    var o = actx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    var g = actx.createGain();
    var a = Math.min(0.012, dur * 0.4), rel = Math.min(0.06, dur * 0.35);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol), t0 + a);
    g.gain.setValueAtTime(vol, t0 + dur - rel);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(dest);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
    if (songLive) {
        o._at = t0;
        liveTones.push(o);
        o.onended = function () {
            var k = liveTones.indexOf(o);
            if (k >= 0) liveTones.splice(k, 1);
        };
    }
}
function kick(t) {
    var o = actx.createOscillator();
    o.type = 'sine';
    var f = actx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 220;
    var g = actx.createGain();
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(1.0, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(f);
    f.connect(g);
    g.connect(chanDrum);
    o.start(t);
    o.stop(t + 0.18);
}
function snare(t) {
    var s = actx.createBufferSource();
    s.buffer = noiseBuffer;
    var f = actx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1900;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    s.connect(f);
    f.connect(g);
    g.connect(chanDrum);
    s.start(t);
    s.stop(t + 0.16);
    var o = actx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = 200;
    var g2 = actx.createGain();
    g2.gain.setValueAtTime(0.4, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o.connect(g2);
    g2.connect(chanDrum);
    o.start(t);
    o.stop(t + 0.1);
}
function hihat(t) {
    var s = actx.createBufferSource();
    s.buffer = noiseBuffer;
    var f = actx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 6500;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    s.connect(f);
    f.connect(g);
    g.connect(chanDrum);
    s.start(t);
    s.stop(t + 0.06);
}
function leadHold() {
    var el = document.getElementById('densitySlider');
    var d = el ? +el.value : 100;
    return d >= 65 ? 1 : (d >= 35 ? 2 : 4);
}
function nextLeadPc(last, prev, root, quality, stepInBar, scaleId, chord, c) {
    var sc = scalePcs(scaleId);
    var phrasePos = stepInBar % 8, isAns = stepInBar >= 8, nearEnd = phrasePos >= 6 || stepInBar >= 14;
    var resolve = chord.length ? chord[0] : TONIC;
    if (nearEnd) resolve = isAns ? TONIC : (c.s === 1 ? pcAbs(11) : root);
    var score = new Array(OUT).fill(-8), i, k, d;
    for (i = 0; i < sc.length; i++) score[sc[i]] = 0.5;
    for (i = 0; i < chord.length; i++) score[chord[i]] += 3.0;
    for (k = 0; k < OUT; k++) {
        d = minDist(last, k);
        if (d <= 1) score[k] += 3.4;
        else if (d <= 2) score[k] += 1.6;
        else if (d === 3 && chord.indexOf(k) >= 0) score[k] += 0.6;
    }
    if (nearEnd) { for (k = 0; k < OUT; k++) score[k] += 4.5 / (1 + minDist(resolve, k)); }
    var f = buildFeatures(last, prev, root, quality, stepInBar, scaleId, chord);
    var out = nn.predict(f);
    var aEl = document.getElementById('modelSlider'), a = aEl ? +aEl.value : 0.3;
    if (!isFinite(a)) a = 0.2;
    a = Math.max(0, Math.min(0.35, a));
    var TEl = document.getElementById('tempSlider'), T = TEl ? +TEl.value : 1.0;
    if (!isFinite(T) || T <= 0) T = 1.0;
    var isScale = new Array(OUT).fill(0);
    for (i = 0; i < sc.length; i++) isScale[sc[i]] = 1;
    var weights = new Array(OUT), sum = 0;
    for (k = 0; k < OUT; k++) {
        if (!isScale[k]) { weights[k] = 0; continue; }
        var pw = (1 - a) * score[k] + a * Math.log(Math.max(1e-4, out[k]));
        var wv = Math.exp(Math.max(-8, Math.min(8, pw / T)));
        weights[k] = wv;
        sum += wv;
    }
    if (sum <= 0) return TONIC;
    var r = Math.random() * sum, acc = 0, pick = TONIC;
    for (k = 0; k < OUT; k++) {
        if (!isScale[k]) continue;
        acc += weights[k];
        if (r <= acc) { pick = k; break; }
    }
    return pick;
}
function sampleGroove(last, prev, root, stepInBar, c, chord, sec) {
    var f = buildFeatures(last, prev, root, c.q, stepInBar, c.s, chord);
    nn.predict(f);
    var T = 1.1, w = [], sum = 0, base = sec ? sec.groove : 0;
    for (var r = 0; r < RHY; r++) {
        w[r] = 0.3 + 0.7 * Math.pow(Math.max(1e-6, nn.rOut[r]), 1 / T);
        sum += w[r];
    }
    if (sec && sec.drumsLite) { w[0] += 1.2; w[3] += 0.6; } else { w[base] += 0.9; }
    sum += 0.9;
    var x = Math.random() * sum, acc = 0, pick = 0;
    for (var r = 0; r < RHY; r++) {
        acc += w[r];
        if (x <= acc) { pick = r; break; }
    }
    return pick;
}
function sampleProgression() {
    var seq = ['i'], cur = 'i', b, total = 22;
    for (b = 1; b < total; b++) {
        var isEnd = (b % 4 === 0);
        var isFinal = (b === total - 1);
        var cand;
        if (isFinal) { cand = ['i']; }
        else if (isEnd) { cand = ['V7', 'i']; }
        else { cand = HARM_NEXT[cur] && HARM_NEXT[cur].length ? HARM_NEXT[cur].slice() : HARM_FUNCS.slice(); }
        var c = chordOf(cur), root = chordRootAbs(cur), chord = chordAbs(cur);
        var f = buildFeatures(root, root, root, c.q, (b % 4) * 4, c.s, chord);
        var hp = nn.predictHarm(f);
        var w = [], sum = 0;
        for (var ci = 0; ci < cand.length; ci++) {
            var idx = funcIdx(cand[ci]);
            var wv = (hp[idx] || 0) + 0.2;
            w.push(wv);
            sum += wv;
        }
        var r = Math.random() * sum, acc = 0, pick = cand[0];
        for (var ci = 0; ci < cand.length; ci++) {
            acc += w[ci];
            if (r <= acc) { pick = cand[ci]; break; }
        }
        seq.push(pick);
        cur = pick;
    }
    return seq;
}
function buildSong() {
    var tonic = KEY_AUTO ? ORCH_KEYS[Math.floor(Math.random() * ORCH_KEYS.length)] : TONIC;
    if (KEY_AUTO && tonic !== TONIC) retrainKey(tonic, true);
    var tempo = TEMPO_SET[Math.floor(Math.random() * TEMPO_SET.length)];
    var bpmEl = document.getElementById('bpmSlider');
    if (bpmEl) { bpmEl.value = tempo; bpmVal.textContent = tempo; }
    var prog = sampleProgression();
    var sections = [], chords = [], barSection = [], startBar = 0, i, j;
    for (i = 0; i < SECTIONS.length; i++) {
        var def = SECTIONS[i];
        var sec = { name: def.name, bars: def.bars, mask: def.mask.slice(), dense: def.dense, drumsLite: def.drumsLite, groove: def.groove, startBar: startBar };
        for (j = 0; j < def.bars; j++) {
            chords.push(prog[(startBar + j) % prog.length]);
            barSection.push(i);
        }
        sections.push(sec);
        startBar += def.bars;
    }
    songPlan = { tonic: TONIC, tempo: tempo, sections: sections, chords: chords, barSection: barSection, barCount: chords.length, prog: chords.slice(0, 8) };
    totalSteps = songPlan.barCount * 16;
}
function startPlayback() {
    buildAudio();
    if (actx.state === 'suspended') actx.resume();
    if (tailTimer) { clearTimeout(tailTimer); tailTimer = 0; }
    autoRecStop();
    stopPlPlayback();
    cancelLiveTones();
    songLive = true;
    stepDur = 60 / (songPlan.tempo * 4);
    delayNode.delayTime.value = stepDur * 3;
    setEcho();
    if (master) master.gain.setTargetAtTime(globalMuted ? 0 : masterVol / 100 * 0.9, actx.currentTime, 0.02);
    histPc = [TONIC]; histMidi = [72]; lastLeadPc = TONIC; curLeadPC = -1; curBassPC = -1; curGroove = 0; bassCount = 0; roll = []; curStep = 0;
    nextTime = actx.currentTime + 0.15;
    playing = true;
    document.getElementById('playBtn').textContent = 'Stop';
    document.getElementById('playBtn').classList.add('red');
    schedulerId = setInterval(tick, 25);
    autoRecStart();
    updateStatus();
    log('director -> key=' + KEY_NAMES[songPlan.tonic] + ' tempo=' + songPlan.tempo + ' bars=' + songPlan.barCount + ' prog=' + songPlan.prog.slice(0, 8).join(',') + '.. | play start');
}
function stopPlayback() {
    playing = false;
    clearInterval(schedulerId);
    autoRecStop();
    songLive = false;
    cancelLiveTones();
    document.getElementById('playBtn').textContent = 'Play';
    document.getElementById('playBtn').classList.remove('red');
    if (actx && actx.state === 'running') actx.suspend();
    log('play stop');
}
function togglePlay() {
    if (!playing) {
        if (dataset.length === 0) genData();
        buildSong();
        startPlayback();
    } else {
        stopPlayback();
    }
}
function newSong() {
    if (playing) {
        playing = false;
        clearInterval(schedulerId);
        autoRecStop();
        songLive = false;
        cancelLiveTones();
        if (actx && actx.state === 'running') actx.suspend();
    }
    buildSong();
    startPlayback();
    showToast('New song: ' + KEY_NAMES[songPlan.tonic] + ' | ' + songPlan.tempo + ' bpm | ' + songPlan.prog.slice(0, 6).join(' -> ') + '..');
}
function endSong() {
    playing = false;
    clearInterval(schedulerId);
    if (tailTimer) { clearTimeout(tailTimer); tailTimer = 0; }
    autoRecStop();
    songLive = false;
    cancelLiveTones();
    document.getElementById('playBtn').textContent = 'Play';
    document.getElementById('playBtn').classList.remove('red');
    var loopEl = document.getElementById('loopChk');
    if (loopEl && loopEl.checked) {
        buildSong();
        startPlayback();
        showToast('Loop: new track');
        return;
    }
    if (actx && actx.state === 'running') actx.suspend();
    showToast('Song finished. Press Play for a new song.');
}
function tick() {
    while (playing && nextTime < actx.currentTime + 0.12) {
        scheduleStep(curStep, nextTime);
        curStep++;
        nextTime += stepDur;
        if (curStep >= totalSteps) {
            playing = false;
            clearInterval(schedulerId);
            var tail = Math.max(stepDur * 8, 0.9);
            tailTimer = setTimeout(endSong, tail * 1000);
            return;
        }
    }
}
function scheduleStep(step, t) {
    var bar = Math.floor(step / 16), stepInBar = step % 16;
    var secIdx = songPlan.barSection[bar], sec = songPlan.sections[secIdx], name = songPlan.chords[bar];
    if (stepInBar === 0) {
        var lastb = histPc.length ? histPc[histPc.length - 1] : TONIC, prevb = histPc.length > 1 ? histPc[histPc.length - 2] : -1, cb = chordOf(name);
        curGroove = sampleGroove(lastb, prevb, chordRootAbs(name), stepInBar, cb, chordAbs(name), sec);
        bassCount = 0;
        log('[BAR] ' + (bar + 1) + '/' + songPlan.barCount + ' ' + sec.name + ' key=' + KEY_NAMES[TONIC] + ' groove=' + (curGroove + 1) + ' chord=' + name + ' | ' + chordAbs(name).map(pcName).join(','));
    }
    var c = chordOf(name), root = chordRootAbs(name), chord = chordAbs(name);
    curBarIndex = bar;
    curChordName = name;
    curSectionName = sec.name;
    curProg = songPlan.prog;
    var dens = +document.getElementById('densitySlider').value || 100;
    var hold = Math.max(1, Math.round(sec.dense * (100 / Math.max(10, dens))));
    var last = histPc.length ? histPc[histPc.length - 1] : TONIC, prev = histPc.length > 1 ? histPc[histPc.length - 2] : -1, leadMidi;
    var hi = sec.name === 'Bridge' || sec.name === 'Chorus B';
    if (step % hold === 0 || histPc.length === 0) {
        var leadPc = nextLeadPc(last, prev, root, c.q, stepInBar, c.s, chord, c);
        lastLeadPc = leadPc;
        curLeadPC = leadPc;
        var prevMidi = histMidi.length ? histMidi[histMidi.length - 1] : 60;
        leadMidi = placeLead(leadPc, prevMidi, hi);
        histPc.push(leadPc);
        if (histPc.length > 40) histPc.shift();
        histMidi.push(leadMidi);
        if (histMidi.length > 40) histMidi.shift();
    } else {
        leadMidi = histMidi.length ? histMidi[histMidi.length - 1] : 60;
    }
    var fkT = 1;
    var active = sec.mask;
    if (!mute[0] && active[0]) tone('square', freqFromMidi(leadMidi), t, stepDur * 0.9, chanLead, 0.10 * fkT);
    if (!mute[4] && active[4] && leadMidi > 36) tone('square', freqFromMidi(leadMidi - 12), t, stepDur * 0.9, chanLead2, 0.055 * fkT);
    var grv = GROOVES[curGroove];
    if (!mute[2] && active[2] && grv.b[stepInBar] === 1) {
        var bassPc = chord[BASS_SEQ[bassCount % BASS_SEQ.length] % chord.length];
        curBassPC = bassPc;
        bassCount++;
        var bassMidi = placeBass(bassPc);
        if (bassCount % 4 === 1) bassMidi -= 12;
        tone('triangle', freqFromMidi(bassMidi), t, stepDur * 1.6, chanBass, 0.5 * fkT);
    }
    var arp = chord.map(placeArp);
    if (!mute[1] && active[1]) {
        var sub = stepDur / 4;
        for (var i = 0; i < 4; i++) tone('square', freqFromMidi(arp[i % arp.length]), t + i * sub, sub * 0.8, chanArp, 0.10 * fkT);
    }
    if (!mute[5] && active[5] && stepInBar === 0) {
        var padTones = chord.slice(0, 4);
        var padDur = stepDur * 16 * 0.95;
        for (var pn = 0; pn < padTones.length; pn++) tone('triangle', freqFromMidi(placeArp(padTones[pn]) - 12), t, padDur, chanPad, 0.05 * fkT);
    }
    if (!mute[3] && active[3]) {
        if (sec.drumsLite) {
            if (stepInBar % 4 === 0) kick(t);
            if (stepInBar % 8 === 4) snare(t);
            if (stepInBar % 8 === 6) hihat(t);
        } else {
            if (grv.k[stepInBar] === 1) kick(t);
            if (grv.s[stepInBar] === 1) snare(t);
            if (grv.h[stepInBar] === 1) hihat(t);
        }
    }
    var bassMidiForRoll = curBassPC >= 0 ? freqFromMidi(placeBass(curBassPC)) : 0;
    var rLead = (!mute[0] && active[0]) ? leadMidi : null;
    var rLead2 = (!mute[4] && active[4] && leadMidi > 36) ? leadMidi - 12 : null;
    var rBass = (!mute[2] && active[2] && grv.b[stepInBar] === 1) ? bassMidiForRoll : null;
    var rArp = (!mute[1] && active[1]) ? arp[0] : null;
    var rPad = (!mute[5] && active[5] && stepInBar === 0) ? placeArp(chord[0]) - 12 : null;
    var rDrum = (!mute[3] && active[3]) && (sec.drumsLite ? (stepInBar % 4 === 0 || stepInBar % 8 === 4) : (grv.k[stepInBar] === 1 || grv.s[stepInBar] === 1 || grv.h[stepInBar] === 1));
    roll.push({ step: step, lead: rLead, lead2: rLead2, bass: rBass, arp: rArp, pad: rPad, drum: rDrum, s: !!rDrum, h: !!rDrum });
    if (roll.length > 64) roll.shift();
    var now = performance.now();
    for (var ch = 0; ch < 6; ch++) {
        var hit = [rLead, rArp, rBass, rDrum, rLead2, rPad][ch];
        if (hit != null && hit !== false) { barAct[ch][0] = now; barAct[ch][1] = Math.min(1, barAct[ch][1] + 0.8); }
    }
    if (stepInBar === 0) updateStatus();
}
function openModal(id) { bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).show(); }
function loop() {
    anim = performance.now() / 1000;
    if (isTraining) trainOneEpoch();
    accTick++;
    if (accCache === null || accTick % 30 === 0) accCache = computeAcc();
    updateStats();
    drawNetwork();
    drawLoss();
    drawDistribution();
    updateStatus();
    drawTrack();
    drawBars();
    requestAnimationFrame(loop);
}
function startupTrain() {
    var ak = document.getElementById('autoKey');
    if (ak) ak.checked = false;
    genData();
    log('init: arch=53-48-12+r+h v1.0.2 key=' + TONIC + ' opt=' + nn.opt + ' lr=' + nn.lr);
    function step() {
        for (var e = 0; e < 2 && epoch < RUN_EPOCHS; e++) trainOneEpoch();
        updateStats();
        if (epoch < RUN_EPOCHS) setTimeout(step, 0);
    }
    setTimeout(step, 0);
}
buildNotePad();
updateRecUI();
renderPlaylist();
startupTrain();
fitCanvases();
loop();