class ParticleBackground {
    constructor() {
        if (window.particleBackgroundInstance) {
            return window.particleBackgroundInstance;
        }

        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        if (this.isMobile) return;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particlesArray = [];
        this.animationId = null;
        this.isPaused = false;

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
        if (window.innerWidth < 1024) return 60;
        return 100;
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
            this.particlesArray.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 1.5 + 0.5
            });
        }
    }

    updateParticles() {
        for (let particle of this.particlesArray) {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x > this.canvas.width) particle.x = 0;
            else if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = 0;
            else if (particle.y < 0) particle.y = this.canvas.height;
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = `rgba(13, 110, 253, 0.8)`;
        for (let particle of this.particlesArray) {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.drawConnections();
    }

    drawConnections() {
        for (let i = 0; i < this.particlesArray.length; i++) {
            for (let j = i + 1; j < this.particlesArray.length; j++) {
                const dx = this.particlesArray[i].x - this.particlesArray[j].x;
                const dy = this.particlesArray[i].y - this.particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const opacity = 1 - (distance / 100);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
                    this.ctx.lineWidth = 0.5;
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
        const debouncedResize = Utils.debounce(() => this.handleResize(), 250);
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

    destroy() {
        this.stopAnimation();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.particleBackgroundInstance = null;
    }
}
