const TSP_ROUTE_PAUSE = 2500;
const TSP_DELTA = 0.9;
const TSP_POST_OPTIMIZE = true;
const TSP_2OPT_ITER = 100;
const TSP_ANGLE_PENALTY = 0.3;
const TSP_USE_ANGLE = true;
const TSP_2OPT_WINDOW = 50;
const TSP_BASE_RGB = '30, 135, 240';
const TSP_NEAR_DIST = 74;
const TSP_CONSTELLATION_RADIUS = 130;
function tspDistance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
function computeDistMatrix(points) {
    const n = points.length;
    const matrix = [];
    for (let i = 0; i < n; i++) {
        matrix.push(new Array(n).fill(0));
    }
    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            const d = tspDistance(points[i], points[j]);
            matrix[i][j] = d;
            matrix[j][i] = d;
        }
    }
    return matrix;
}
function calculateCycleDistance(path, points) {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
        total += tspDistance(points[path[i]], points[path[i + 1]]);
    }
    return total;
}
function fast2opt(route, distMatrix, maxIter, window) {
    const n = route.length;
    const bestRoute = route.slice();
    let improved = true;
    let iteration = 0;
    while (improved && iteration < maxIter) {
        improved = false;
        for (let i = 1; i < n - 2; i++) {
            const a = bestRoute[i - 1];
            const b = bestRoute[i];
            const ab = distMatrix[a][b];
            const maxJ = Math.min(i + window, n - 1);
            for (let j = i + 1; j < maxJ; j++) {
                const c = bestRoute[j];
                const d = bestRoute[j + 1];
                const current = ab + distMatrix[c][d];
                const proposed = distMatrix[a][c] + distMatrix[b][d];
                if (proposed < current - 1e-6) {
                    const segment = bestRoute.slice(i, j + 1).reverse();
                    bestRoute.splice(i, j + 1 - i, ...segment);
                    improved = true;
                    break;
                }
            }
            if (improved) break;
        }
        iteration++;
    }
    return bestRoute;
}
function dynamicGravitySolve(points, delta, postOptimize, max2optIter, anglePenaltyWeight, useAnglePenalty, optWindow) {
    const n = points.length;
    if (n === 0) return { distance: 0, path: [] };
    let centerX = 0;
    let centerY = 0;
    for (const p of points) {
        centerX += p.x;
        centerY += p.y;
    }
    centerX /= n;
    centerY /= n;
    let startIdx = 0;
    let minDistToCenter = Infinity;
    for (let i = 0; i < n; i++) {
        const dx = points[i].x - centerX;
        const dy = points[i].y - centerY;
        const dist = dx * dx + dy * dy;
        if (dist < minDistToCenter) {
            minDistToCenter = dist;
            startIdx = i;
        }
    }
    const route = [];
    const remaining = new Array(n).fill(true);
    let currentPos = { x: centerX, y: centerY };
    let lastVector = { x: 0, y: 0 };
    route.push(startIdx);
    remaining[startIdx] = false;
    for (let i = 1; i < n; i++) {
        let minScore = Infinity;
        let nearest = 0;
        for (let j = 0; j < n; j++) {
            if (remaining[j]) {
                const dx = points[j].x - currentPos.x;
                const dy = points[j].y - currentPos.y;
                let distSq = dx * dx + dy * dy;
                if (useAnglePenalty && i > 1) {
                    const dotProduct = dx * lastVector.x + dy * lastVector.y;
                    const lastNormSq = lastVector.x * lastVector.x + lastVector.y * lastVector.y;
                    if (lastNormSq > 0) {
                        const norm = Math.sqrt(distSq * lastNormSq);
                        if (norm > 0) {
                            const cosAngle = dotProduct / norm;
                            const anglePenalty = anglePenaltyWeight * (1 - cosAngle);
                            distSq *= 1 + anglePenalty;
                        }
                    }
                }
                if (distSq < minScore) {
                    minScore = distSq;
                    nearest = j;
                }
            }
        }
        route.push(nearest);
        remaining[nearest] = false;
        lastVector = {
            x: points[nearest].x - currentPos.x,
            y: points[nearest].y - currentPos.y
        };
        currentPos = {
            x: points[nearest].x * delta + currentPos.x * (1 - delta),
            y: points[nearest].y * delta + currentPos.y * (1 - delta)
        };
    }
    route.push(route[0]);
    let finalRoute = route;
    if (postOptimize) {
        const distMatrix = computeDistMatrix(points);
        finalRoute = fast2opt(route, distMatrix, max2optIter, optWindow);
    }
    return { distance: calculateCycleDistance(finalRoute, points), path: finalRoute };
}
class TSPBackground {
    constructor() {
        if (window.tspBackgroundInstance) {
            return window.tspBackgroundInstance;
        }
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.trail = [];
        this.sparks = [];
        this.rings = [];
        this.traveler = null;
        this.route = [];
        this.routeIndex = 0;
        this.segmentProgress = 0;
        this.segmentSpeed = 0.012;
        this.state = 'idle';
        this.animationId = null;
        this.isPaused = false;
        this.lastWidth = 0;
        this.lastHeight = 0;
        this.routeTimer = null;
        this.totalPoints = 0;
        this.pointsVisited = 0;
        this.travelerAlpha = 0;
        this.pointsAlpha = 0;
        this.fadeStep = 0.02;
        window.tspBackgroundInstance = this;
        this.init();
    }
    baseColor(alpha) {
        return `rgba(${TSP_BASE_RGB}, ${alpha})`;
    }
    init() {
        this.canvas.id = 'tsp-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
            transform: translateZ(0);
            will-change: transform;
            backface-visibility: hidden;
        `;
        document.body.prepend(this.canvas);
        this.handleResize();
        this.createPoints();
        this.buildRoute();
        this.state = 'fading-in';
        this.startAnimation();
        this.setupEventListeners();
    }
    getPointCount() {
        if (window.innerWidth < 768) return 25;
        if (window.innerWidth < 1024) return 40;
        return 55;
    }
    handleResize() {
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        const widthChanged = Math.abs(newWidth - oldWidth) > 10;
        const heightChangedALot = Math.abs(newHeight - oldHeight) > 120;
        if (widthChanged || heightChangedALot) {
            this.routeTimer = null;
            this.createPoints();
            this.buildRoute();
            this.state = 'fading-in';
            this.pointsAlpha = Math.min(this.pointsAlpha, 0.5);
            this.travelerAlpha = Math.min(this.travelerAlpha, 0.5);
        }
    }
    createPoints() {
        const count = this.getPointCount();
        this.points = [];
        const pad = 60;
        const w = this.canvas.width;
        const h = this.canvas.height;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.12 + 0.03;
            this.points.push({
                x: pad + Math.random() * (w - pad * 2),
                y: pad + Math.random() * (h - pad * 2),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                opacity: Math.random() * 0.25 + 0.15,
                size: Math.random() * 1.2 + 1.0,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.01 + Math.random() * 0.01,
                visited: false
            });
        }
    }
    updatePoints() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const pad = 40;
        for (const p of this.points) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < pad) {
                p.x = pad;
                p.vx = Math.abs(p.vx);
            } else if (p.x > w - pad) {
                p.x = w - pad;
                p.vx = -Math.abs(p.vx);
            }
            if (p.y < pad) {
                p.y = pad;
                p.vy = Math.abs(p.vy);
            } else if (p.y > h - pad) {
                p.y = h - pad;
                p.vy = -Math.abs(p.vy);
            }
        }
    }
    distance(a, b) {
        return tspDistance(a, b);
    }
    buildRoute() {
        if (this.points.length < 2) {
            this.route = [];
            this.totalPoints = 0;
            return;
        }
        const result = dynamicGravitySolve(
            this.points,
            TSP_DELTA,
            TSP_POST_OPTIMIZE,
            TSP_2OPT_ITER,
            TSP_ANGLE_PENALTY,
            TSP_USE_ANGLE,
            TSP_2OPT_WINDOW
        );
        this.route = result.path;
        this.totalPoints = this.points.length;
        this.pointsVisited = 0;
        this.routeIndex = 0;
        this.segmentProgress = 0;
        this.trail.length = 0;
        this.sparks.length = 0;
        this.rings.length = 0;
        const p0 = this.points[this.route[0]];
        this.traveler = { x: p0.x, y: p0.y };
        this.travelerAlpha = 0;
        for (const p of this.points) {
            p.visited = false;
        }
        this.points[this.route[0]].visited = true;
    }
    finishRoute() {
        this.state = 'waiting';
        this.pointsVisited = this.totalPoints;
        this.travelerAlpha = 1;
        const end = this.points[this.route[this.route.length - 1]];
        if (end) this.explode(end.x, end.y);
        this.scheduleFadeOut(TSP_ROUTE_PAUSE);
    }
    scheduleFadeOut(delay) {
        if (this.routeTimer) clearTimeout(this.routeTimer);
        this.routeTimer = setTimeout(() => {
            if (!this.isPaused) this.state = 'fading-out';
        }, delay);
    }
    updateTrailLife() {
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].life -= 0.002;
            if (this.trail[i].life <= 0) this.trail.splice(i, 1);
        }
        if (this.trail.length > 400) this.trail.splice(0, this.trail.length - 400);
    }
    updateEffects() {
        for (let i = this.rings.length - 1; i >= 0; i--) {
            const ring = this.rings[i];
            ring.life -= ring.decay;
            ring.radius += ring.growth;
            if (ring.life <= 0) this.rings.splice(i, 1);
        }
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vx *= 0.96;
            s.vy *= 0.96;
            s.life -= s.decay;
            if (s.life <= 0) this.sparks.splice(i, 1);
        }
    }
    emitRing(x, y, growth, decay) {
        this.rings.push({
            x: x,
            y: y,
            radius: 2,
            growth: growth || 0.7 + Math.random() * 0.4,
            life: 1,
            decay: decay || 0.03
        });
    }
    emitSparks(x, y) {
        const count = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = Math.random() * 0.7 + 0.4;
            this.sparks.push({
                x: x,
                y: y,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                size: Math.random() * 1.2 + 0.6,
                life: 1,
                decay: 0.02 + Math.random() * 0.02
            });
        }
    }
    explode(x, y) {
        this.emitRing(x, y, 2.2, 0.02);
        this.emitRing(x, y, 1.4, 0.024);
        this.emitRing(x, y, 0.8, 0.03);
        for (let i = 0; i < 28; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = Math.random() * 2.2 + 0.8;
            this.sparks.push({
                x: x,
                y: y,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                size: Math.random() * 2 + 0.8,
                life: 1,
                decay: 0.012 + Math.random() * 0.02
            });
        }
    }
    update() {
        this.updatePoints();
        this.updateTrailLife();
        this.updateEffects();
        if (this.state === 'fading-out') {
            this.pointsAlpha = Math.max(0, this.pointsAlpha - this.fadeStep);
            this.travelerAlpha = Math.max(0, this.travelerAlpha - this.fadeStep);
            if (this.pointsAlpha <= 0 && this.travelerAlpha <= 0) {
                this.pointsAlpha = 0;
                this.travelerAlpha = 0;
                this.trail.length = 0;
                this.sparks.length = 0;
                this.rings.length = 0;
                this.createPoints();
                this.buildRoute();
                this.state = 'fading-in';
            }
            return;
        }
        if (this.state === 'fading-in') {
            this.pointsAlpha = Math.min(1, this.pointsAlpha + this.fadeStep);
            this.travelerAlpha = Math.min(1, this.travelerAlpha + this.fadeStep);
            if (this.pointsAlpha >= 1 && this.travelerAlpha >= 1) {
                this.pointsAlpha = 1;
                this.travelerAlpha = 1;
                this.state = 'traveling';
            }
            return;
        }
        if (this.state === 'waiting') {
            if (this.route.length > 0 && this.traveler) {
                const end = this.points[this.route[this.route.length - 1]];
                this.traveler.x = end.x;
                this.traveler.y = end.y;
            }
            return;
        }
        if (this.state === 'traveling') {
            this.updateTraveler();
        }
    }
    updateTraveler() {
        if (this.route.length === 0 || this.routeIndex >= this.route.length - 1) {
            this.finishRoute();
            return;
        }
        const a = this.points[this.route[this.routeIndex]];
        const b = this.points[this.route[this.routeIndex + 1]];
        const dist = this.distance(a, b);
        const speedPerPixel = this.segmentSpeed * Math.min(3, 80 / (dist + 20));
        this.segmentProgress += speedPerPixel;
        if (this.segmentProgress >= 1) {
            const aIdx = this.route[this.routeIndex];
            const bIdx = this.route[this.routeIndex + 1];
            this.pointsVisited = Math.min(this.totalPoints, this.pointsVisited + 1);
            this.segmentProgress = 0;
            this.routeIndex++;
            this.trail.push({
                aIdx: aIdx,
                bIdx: bIdx,
                life: 1
            });
            this.points[bIdx].visited = true;
            this.emitRing(this.traveler.x, this.traveler.y, 0.7 + Math.random() * 0.4, 0.03);
            this.emitSparks(this.traveler.x, this.traveler.y);
            this.traveler.x = b.x;
            this.traveler.y = b.y;
            if (this.routeIndex >= this.route.length - 1) {
                this.finishRoute();
                return;
            }
        }
        const t = this.segmentProgress;
        this.traveler.x = a.x + (b.x - a.x) * t;
        this.traveler.y = a.y + (b.y - a.y) * t;
    }
    drawPointLinks() {
        if (this.points.length < 2) return;
        const max = TSP_NEAR_DIST;
        const maxSq = max * max;
        const ctx = this.ctx;
        const pts = this.points;
        const n = pts.length;
        let drawn = false;
        for (let i = 0; i < n - 1; i++) {
            const a = pts[i];
            for (let j = i + 1; j < n; j++) {
                const b = pts[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distSq = dx * dx + dy * dy;
                if (distSq >= maxSq) continue;
                const alpha = (1 - Math.sqrt(distSq) / max) * 0.22 * this.pointsAlpha;
                if (alpha <= 0.01) continue;
                if (!drawn) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'lighter';
                    drawn = true;
                }
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = this.baseColor(alpha);
                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
        }
        if (drawn) ctx.restore();
    }
    drawPoints(time) {
        for (const p of this.points) {
            p.pulsePhase += p.pulseSpeed;
            const pulse = 0.85 + Math.sin(p.pulsePhase) * 0.15;
            const base = p.visited ? Math.min(0.85, p.opacity * 2.2) : p.opacity;
            const alpha = base * pulse * this.pointsAlpha;
            if (alpha <= 0) continue;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.visited ? p.size + 0.3 : p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.baseColor(alpha);
            this.ctx.fill();
        }
    }
    drawRoutePlan() {
        if (this.route.length < 2) return;
        const pts = this.route.map((idx) => this.points[idx]);
        this.ctx.beginPath();
        this.ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
            this.ctx.lineTo(pts[i].x, pts[i].y);
        }
        this.ctx.lineTo(pts[0].x, pts[0].y);
        this.ctx.strokeStyle = this.baseColor(0.06 * this.pointsAlpha);
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    drawTrail() {
        if (this.trail.length === 0) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const seg of this.trail) {
            const alpha = seg.life * 0.3 * this.pointsAlpha;
            if (alpha <= 0.01) continue;
            const pa = this.points[seg.aIdx];
            const pb = this.points[seg.bIdx];
            ctx.strokeStyle = this.baseColor(alpha);
            ctx.lineWidth = 1.6 * seg.life;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
        }
        ctx.restore();
    }
    drawCurrentSegment() {
        if (this.state !== 'traveling') return;
        if (this.routeIndex >= this.route.length - 1) return;
        const ctx = this.ctx;
        const a = this.points[this.route[this.routeIndex]];
        const b = this.points[this.route[this.routeIndex + 1]];
        const t = this.segmentProgress;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.baseColor(0.8);
        ctx.strokeStyle = this.baseColor(0.45 * this.pointsAlpha);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        ctx.stroke();
        ctx.restore();
    }
    drawTraveler() {
        if (!this.traveler) return;
        const a = this.travelerAlpha;
        if (a <= 0) return;
        const ctx = this.ctx;
        const r = 1.3 + 3.2 * a;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const gradient = ctx.createRadialGradient(
            this.traveler.x, this.traveler.y, 0,
            this.traveler.x, this.traveler.y, r * 5
        );
        gradient.addColorStop(0, this.baseColor(0.6 * a));
        gradient.addColorStop(0.4, this.baseColor(0.18 * a));
        gradient.addColorStop(1, this.baseColor(0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.traveler.x, this.traveler.y, r * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 14;
        ctx.shadowColor = this.baseColor(0.9);
        ctx.beginPath();
        ctx.arc(this.traveler.x, this.traveler.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * a})`;
        ctx.fill();
        ctx.restore();
    }
    drawConstellation() {
        if (!this.traveler) return;
        if (this.travelerAlpha <= 0.01) return;
        const maxDist = TSP_CONSTELLATION_RADIUS;
        const maxDistSq = maxDist * maxDist;
        const ctx = this.ctx;
        let drawn = false;
        for (const p of this.points) {
            const dx = p.x - this.traveler.x;
            const dy = p.y - this.traveler.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > maxDistSq) continue;
            const t = 1 - Math.sqrt(distSq) / maxDist;
            const alpha = t * 0.3 * this.travelerAlpha;
            if (alpha <= 0.01) continue;
            if (!drawn) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                drawn = true;
            }
            ctx.beginPath();
            ctx.moveTo(this.traveler.x, this.traveler.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = this.baseColor(alpha);
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }
        if (drawn) ctx.restore();
    }
    drawEffects() {
        if (this.sparks.length === 0 && this.rings.length === 0) return;
        const ctx = this.ctx;
        ctx.globalCompositeOperation = 'lighter';
        for (const ring of this.rings) {
            const alpha = ring.life * 0.45 * this.travelerAlpha;
            if (alpha <= 0.01) continue;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.baseColor(alpha);
            ctx.lineWidth = 1.6 * ring.life;
            ctx.stroke();
        }
        for (const s of this.sparks) {
            const alpha = s.life * 0.8;
            if (alpha <= 0.01) continue;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = this.baseColor(alpha);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
    }
    drawHud() {
        if (this.totalPoints <= 0) return;
        const clamped = Math.min(this.pointsVisited, this.totalPoints);
        const percent = (clamped / this.totalPoints) * 100;
        const barW = 140;
        const barH = 2;
        const bx = (this.canvas.width - barW) / 2;
        const by = this.canvas.height - 22;
        this.ctx.fillStyle = this.baseColor(0.14);
        this.ctx.fillRect(bx, by, barW, barH);
        this.ctx.fillStyle = this.baseColor(0.5);
        this.ctx.fillRect(bx, by, barW * (percent / 100), barH);
        this.ctx.font = '11px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        this.ctx.fillText(
            clamped + ' / ' + this.totalPoints + ' pts · ' + Math.round(percent) + '%',
            this.canvas.width / 2,
            by - 6
        );
    }
    draw(time) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawPointLinks();
        this.drawPoints(time);
        this.drawRoutePlan();
        this.drawTrail();
        this.drawCurrentSegment();
        this.drawTraveler();
        this.drawConstellation();
        this.drawEffects();
        this.drawHud();
    }
    animate(time) {
        if (this.isPaused) return;
        this.update();
        this.draw(time || 0);
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
    startAnimation() {
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
    stopAnimation() {
        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.routeTimer) {
            clearTimeout(this.routeTimer);
            this.routeTimer = null;
        }
    }
    setupEventListeners() {
        this.lastWidth = window.innerWidth;
        this.lastHeight = window.innerHeight;
        const onResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const widthChanged = w !== this.lastWidth;
            const heightChangedALot = Math.abs(h - this.lastHeight) > 120;
            if (widthChanged || heightChangedALot) {
                this.lastWidth = w;
                this.lastHeight = h;
                this.debouncedResize();
            } else {
                this.lastHeight = h;
            }
        };
        this.debouncedResize = this.debounce(() => this.handleResize(), 250);
        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.debouncedResize();
            }, 200);
        });
        document.addEventListener('visibilitychange', () => {
            this.isPaused = document.hidden;
            if (this.isPaused) {
                if (this.routeTimer) {
                    clearTimeout(this.routeTimer);
                    this.routeTimer = null;
                }
            } else {
                this.startAnimation();
                if (this.state === 'waiting') {
                    this.scheduleFadeOut(500);
                }
            }
        });
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.stopAnimation();
        }
    }
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    destroy() {
        this.stopAnimation();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.tspBackgroundInstance = null;
    }
}
(function () {
    function start() {
        if (!window.tspBackgroundInstance) {
            new TSPBackground();
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();