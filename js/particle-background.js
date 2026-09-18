class ParticleBackground {
    constructor() {
        if (window.particleBackgroundInstance) {
            return window.particleBackgroundInstance;
        }

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particlesArray = [];
        this.animationId = null;
        this.isPaused = false;

        this.techWords = [
            'Pointer-Based Security',
            'Local Data Regeneration',
            'PCH Paradigm',
            'Deterministic Systems',
            'Zero-Storage',
            'Data Non-Existence',

            'Smart Passwords',
            'NP Problem',
            '2FA Management',
            'Repository Management',
            'Deterministic',
            'Research',

            'SmartPassLib',
            'Smart TSP Solver',
            'Smart TSP Oracle',
            'Smart Babylon',
            'Babylonian Images',
            'Smart Repository Manager',
            'Smart 2FA Manager',
            'Smart Password Manager',
            'Smart Social Network',

            'Python', 'Go', 'C#', 'Kotlin', 'JavaScript', 'Rust',

            'PyQt', 'Django', 'Flask', 'Android',
            'Redis', 'PostgreSQL', 'Docker', 'GitHub API',

            'SHA-256', 'TOTP', '2FA', 'Cryptography',

            'Smart Legion Lab',
            'Alexander Suvorov Sr.',
            'Alexander Suvorov Jr.',
            'Independent Researcher',
            'Computer Science',
            'Open Source',
            'Cross-Platform',
            'Decentralized',
            'Zero Trust',
            'Full-Cycle Development'
        ];

        window.particleBackgroundInstance = this;
        this.init();
    }

    init() {
        this.canvas.id = 'particle-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        document.body.prepend(this.canvas);

        this.handleResize();
        this.createParticles();
        this.startAnimation();
        this.setupEventListeners();
    }

    getParticleCount() {
        if (window.innerWidth < 1024) return 20;
        return 30;
    }

    pickColor(text) {
        if (/Paradigm|Zero-Storage|Data Non-Existence|Deterministic Systems/i.test(text)) {
            return '255, 193, 7';
        }
        if (/Security|Cryptography|SHA|TOTP|2FA|Zero Trust/i.test(text)) {
            return '220, 53, 69';
        }
        if (/^(Python|Go|C#|Kotlin|JavaScript|Rust|PyQt|Django|Flask|Android|Redis|PostgreSQL|Docker|GitHub API)$/.test(text)) {
            return '13, 202, 240';
        }
        return '13, 110, 253';
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
    }

    createParticles() {
        this.particlesArray = [];
        const count = this.getParticleCount();

        for (let i = 0; i < count; i++) {
            const text = this.techWords[Math.floor(Math.random() * this.techWords.length)];
            this.particlesArray.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 12 + 12,
                text: text,
                color: this.pickColor(text),
                opacity: Math.random() * 0.15 + 0.05,
                targetOpacity: Math.random() * 0.15 + 0.05
            });
        }
    }

        updateParticles() {
        for (let particle of this.particlesArray) {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            const margin = 100;
            if (particle.x > this.canvas.width + margin) {
                particle.x = -margin;
                particle.opacity = 0;
                particle.targetOpacity = Math.random() * 0.15 + 0.05;
            } else if (particle.x < -margin) {
                particle.x = this.canvas.width + margin;
                particle.opacity = 0;
                particle.targetOpacity = Math.random() * 0.15 + 0.05;
            }
            if (particle.y > this.canvas.height + margin) {
                particle.y = -margin;
                particle.opacity = 0;
                particle.targetOpacity = Math.random() * 0.15 + 0.05;
            } else if (particle.y < -margin) {
                particle.y = this.canvas.height + margin;
                particle.opacity = 0;
                particle.targetOpacity = Math.random() * 0.15 + 0.05;
            }

            const target = Math.min(0.2, Math.max(0.05, particle.targetOpacity));
            particle.opacity += (target - particle.opacity) * 0.01;
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawConnections();

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `500 ${this.getResponsiveFontSize()}px 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace`;

        for (let particle of this.particlesArray) {
            this.ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity})`;
            this.ctx.fillText(particle.text, particle.x, particle.y);
        }
    }

    getResponsiveFontSize() {
        if (window.innerWidth < 768) return 10;
        if (window.innerWidth < 1024) return 12;
        return 14;
    }

    drawConnections() {
        for (let i = 0; i < this.particlesArray.length; i++) {
            for (let j = i + 1; j < this.particlesArray.length; j++) {
                const dx = this.particlesArray[i].x - this.particlesArray[j].x;
                const dy = this.particlesArray[i].y - this.particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = 1 - (distance / 150);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.25})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particlesArray[i].x, this.particlesArray[i].y);
                    this.ctx.lineTo(this.particlesArray[j].x, this.particlesArray[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        if (this.isPaused) return;

        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animate();
    }

    stopAnimation() {
        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    setupEventListeners() {
        const debouncedResize = this.debounce(() => this.handleResize(), 250);
        window.addEventListener('resize', debouncedResize);

        document.addEventListener('visibilitychange', () => {
            this.isPaused = document.hidden;
            if (!this.isPaused) {
                this.startAnimation();
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
        window.particleBackgroundInstance = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ParticleBackground();
});