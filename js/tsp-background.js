/**
 * TSP Background — traveling salesman path animation.
 * Dots drift slowly, greedy route is animated with a fading trail.
 */

class TSPBackground {
    constructor() {
        if (window.tspBackgroundInstance) {
            return window.tspBackgroundInstance;
        }

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.trail = [];
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

        window.tspBackgroundInstance = this;
        this.init();
    }

    init() {
        this.canvas.id = 'tsp-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            transform: translateZ(0);
            will-change: transform;
            backface-visibility: hidden;
        `;
        document.body.prepend(this.canvas);

        this.handleResize();
        this.startAnimation();
        this.setupEventListeners();
        this.scheduleNextRoute(500);
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
            this.createPoints();
            this.resetRoute();
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
                pulseSpeed: 0.01 + Math.random() * 0.01
            });
        }
    }

    resetRoute() {
        this.route = [];
        this.routeIndex = 0;
        this.segmentProgress = 0;
        this.trail = [];
        this.traveler = null;
        this.state = 'idle';
        if (this.routeTimer) {
            clearTimeout(this.routeTimer);
            this.routeTimer = null;
        }
    }

    scheduleNextRoute(delay) {
        if (this.routeTimer) clearTimeout(this.routeTimer);
        this.routeTimer = setTimeout(() => {
            if (!this.isPaused) this.buildRoute();
        }, delay);
    }

    distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    buildRoute() {
        if (this.points.length < 2) return;

        const startIdx = Math.floor(Math.random() * this.points.length);
        const visited = new Array(this.points.length).fill(false);
        const route = [startIdx];
        visited[startIdx] = true;

        let current = startIdx;
        for (let i = 1; i < this.points.length; i++) {
            let bestIdx = -1;
            let bestDist = Infinity;
            for (let j = 0; j < this.points.length; j++) {
                if (visited[j]) continue;
                const d = this.distance(this.points[current], this.points[j]);
                if (d < bestDist) {
                    bestDist = d;
                    bestIdx = j;
                }
            }
            if (bestIdx === -1) break;
            route.push(bestIdx);
            visited[bestIdx] = true;
            current = bestIdx;
        }

        this.route = route;
        this.routeIndex = 0;
        this.segmentProgress = 0;
        this.trail = [];
        const p0 = this.points[this.route[0]];
        this.traveler = { x: p0.x, y: p0.y };
        this.state = 'traveling';
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

    updateTraveler() {
        if (this.state !== 'traveling') return;
        if (this.routeIndex >= this.route.length - 1) {
            this.state = 'idle';
            this.scheduleNextRoute(2500 + Math.random() * 2000);
            return;
        }

        const a = this.points[this.route[this.routeIndex]];
        const b = this.points[this.route[this.routeIndex + 1]];
        const dist = this.distance(a, b);

        const speedPerPixel = this.segmentSpeed * Math.min(3, 80 / (dist + 20));
        this.segmentProgress += speedPerPixel;

        if (this.segmentProgress >= 1) {
            this.segmentProgress = 0;
            this.routeIndex++;

            this.trail.push({
                x1: a.x, y1: a.y, x2: b.x, y2: b.y,
                life: 1
            });

            if (this.routeIndex >= this.route.length - 1) {
                this.state = 'idle';
                this.scheduleNextRoute(2500 + Math.random() * 2000);
                return;
            }
        }

        const t = this.segmentProgress;
        this.traveler.x = a.x + (b.x - a.x) * t;
        this.traveler.y = a.y + (b.y - a.y) * t;

        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].life -= 0.012;
            if (this.trail[i].life <= 0) this.trail.splice(i, 1);
        }
        if (this.trail.length > 60) this.trail.splice(0, this.trail.length - 60);
    }

    drawPoints(time) {
        for (const p of this.points) {
            p.pulsePhase += p.pulseSpeed;
            const pulse = 0.85 + Math.sin(p.pulsePhase) * 0.15;
            const alpha = p.opacity * pulse;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.fill();
        }
    }

    drawTrail() {
        if (this.trail.length === 0) return;

        for (const seg of this.trail) {
            const alpha = seg.life * 0.55;
            if (alpha <= 0.01) continue;
            this.ctx.strokeStyle = `rgba(13, 110, 253, ${alpha})`;
            this.ctx.lineWidth = 1.2 * seg.life;
            this.ctx.beginPath();
            this.ctx.moveTo(seg.x1, seg.y1);
            this.ctx.lineTo(seg.x2, seg.y2);
            this.ctx.stroke();
        }
    }

    drawCurrentSegment() {
        if (this.state !== 'traveling') return;
        if (this.routeIndex >= this.route.length - 1) return;

        const a = this.points[this.route[this.routeIndex]];
        const b = this.points[this.route[this.routeIndex + 1]];
        const t = this.segmentProgress;

        this.ctx.strokeStyle = `rgba(13, 110, 253, 0.7)`;
        this.ctx.lineWidth = 1.4;
        this.ctx.beginPath();
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        this.ctx.stroke();
    }

    drawTraveler() {
        if (!this.traveler) return;

        const r = 4;
        const gradient = this.ctx.createRadialGradient(
            this.traveler.x, this.traveler.y, 0,
            this.traveler.x, this.traveler.y, r * 4
        );
        gradient.addColorStop(0, 'rgba(13, 202, 240, 0.9)');
        gradient.addColorStop(0.4, 'rgba(13, 110, 253, 0.4)');
        gradient.addColorStop(1, 'rgba(13, 110, 253, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.traveler.x, this.traveler.y, r * 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(this.traveler.x, this.traveler.y, r, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fill();
    }

    draw(time) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawPoints(time);
        this.drawTrail();
        this.drawCurrentSegment();
        this.drawTraveler();
    }

    animate(time) {
        if (this.isPaused) return;

        this.updatePoints();
        this.updateTraveler();
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
            this.debouncedResize();
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
                if (this.state === 'idle') this.scheduleNextRoute(500);
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