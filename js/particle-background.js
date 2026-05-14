class ParticleBackground {
    constructor() {
        if (window.particleBackgroundInstance) {
            return window.particleBackgroundInstance;
        }

        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
//        if (this.isMobile) return;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particlesArray = [];
        this.animationId = null;
        this.isPaused = false;

        this.techWords = [
            'Pointer-Based Security Paradigm',
            'Local Data Regeneration Paradigm',
            'Position-Candidate-Hypothesis Paradigm',
            'PCH Paradigm',
            'Deterministic Game Engine',
            'Data Non-Existence Philosophy',
            'Synchronous State Discovery',

            'SmartPassLib Ecosystem',
            'SmartPassLib Cross-Platform',
            'TSP Ecosystem',
            '2FA Manager Ecosystem',
            'Repository Manager Ecosystem',
            'Deterministic Ecosystem',
            'Research Ecosystem',

            'SmartPassLib Python',
            'SmartPassLib Go',
            'SmartPassLib C#',
            'SmartPassLib Kotlin',
            'SmartPassLib JavaScript',
            'Smart Repository Manager Core',
            'Smart TSP Solver',
            'Exact TSP Solver',
            'Smart TSP Oracle',
            'Smart TSP Benchmark',
            'Smart Babylon Library',
            'Babylonian Image Library',
            'CommandPack',
            'CommandEx',
            'SmartPrinter',
            'SmartCLIApp',
            'SmartRandom',
            'SmartTextDecorator',
            'Smart Auth',
            'Smart Redis Storage',
            'Smart Path Library',
            'Smart Executor Lib',
            'CLIMan',
            'GitHub SSH Key',
            'Smart Text Randomizer',
            'Smart Pip Collector',
            'GitHub Repos Backup Tools',
            'Smart Legion Lab Library',

            'smartpasslib',
            'clipassman',
            'clipassgen',
            'smart-tsp-solver',
            'smart-tsp-benchmark',
            'smart-2fa-secure',
            'babylonian-image-library',
            'smart-babylon-library',
            'commandman',
            'smartpathlibrary',
            'smartexecutorlib',
            'climan',
            'github-ssh-key',
            'commandpack',
            'smartprinter',
            'smartcliapp',
            'commandex',
            'smartrandom',
            'smarttextdecorator',
            'smartauthen',
            'smart-redis-storage',
            'smart-text-randomizer',
            'smart-repository-manager-core',

            'CLIPassMan',
            'CLIPassGen',
            'Smart Password Manager CLI',
            'Smart Password Generator CLI',
            'Smart Repository Manager CLI',
            'CommandMan',
            'CLIToDo',
            'ToDo App CLI',
            'Smart 2FA Manager CLI',
            'Smart 2FA Manager Bash',

            'Smart Password Manager Desktop',
            'Smart Password Manager C# Desktop',
            'Smart Repository Manager GUI',
            'Smart Project Manager',
            'Smart Task Manager',
            'Smart 2FA Manager Desktop',
            'Smart File Duplicate Manager',
            'Smart ToDo App Desktop',

            'Smart Password Manager Web',
            'Smart Social Network',
            'Smart ToDo App Local',
            'Alexander Suvorov Academic Site',
            'SmartLegionLab Portfolio Site',

            'Smart Password Manager Android',
            'Smart 2FA Manager Android',

            'Personal Telegram Bot',
            'ToDo App Telegram Bot',

            'Deterministic Password Generation',
            'Zero-Storage Security',
            'Decentralized Architecture',
            'Offline-First Security',
            'Cross-Platform Determinism',
            'Proof of Knowledge Without Exposure',
            'No Cloud Dependency',
            'Zero Trust Architecture',
            'Deterministic Infinite Library',
            'Full-Cycle Development',
            'From Idea to Production',
            'Software Architecture',
            'System Integration',
            'High-Performance Computing',
            'Cryptographic Security',
            'GitHub Automation',
            'Open Source Ecosystem',

            'Python', 'Go', 'C#', 'Kotlin', 'JavaScript',
            'PyQt5', 'PyQt6', 'WPF', 'Django', 'Flask',
            'Android SDK', 'Telegram Bot API', 'GitHub API',
            'Redis', 'PostgreSQL', 'SQLite',
            'SHA-256', 'TOTP', '2FA', 'MFA',
            'Docker', 'Git', 'GitHub Actions',
            'HTML5', 'CSS3', 'Bootstrap', 'Termux',

            'Smart Legion Lab',
            'Alexander Suvorov',
            'Alexander Suvorov Paradigms',
            'Smart Password Manager',
            'Smart 2FA Manager',
            'Smart Repository Manager',
            'Smart TSP Solver',
            'Smart Babylon Library',
            'Babylonian Image Library',
            'Deterministic Game Engine Report',
            'Clipassman',
            'Clipassgen',
            'Smartpasslib',

            'Independent Researcher',
            'Theoretical Computer Science',
            'Computational Complexity',
            'Information Theory',
            'Open Access Research',
            'Zenodo DOI Publications',
            'Academic Portfolio',
            'Research Validation',
            'Experimental Implementation'
        ];
//        this.techWords = [
//            'PBS Paradigm',
//            'LDR Paradigm',
//            'PCH Paradigm',
//            'DGE Report',
//            'Data Non-Existence',
//            'Synchronous Discovery',
//
//            'SmartPassLib',
//            'TSP Solver',
//            '2FA Manager',
//            'Repo Manager',
//            'Deterministic',
//            'Ecosystems',
//            'Open Source',
//            'Cross-Platform',
//            'Offline-First',
//
//            'PyPI Package',
//            'Python Lib',
//            'Go Library',
//            'C# Library',
//            'Kotlin Lib',
//            'JavaScript',
//            'smartpasslib',
//            'clipassman',
//            'clipassgen',
//
//            'Android',
//            'Desktop Apps',
//            'Web App',
//            'CLI Tools',
//            'Telegram Bots',
//            'Bash Script',
//            'Password Manager',
//            'Social Network',
//            'Task Manager',
//            'Duplicate Finder',
//
//            'Zero-Storage',
//            'Decentralized',
//            'Deterministic',
//            'No Cloud',
//            'SHA-256',
//            'TOTP 2FA',
//            'GitHub API',
//            'Proof of Knowledge',
//            'No Password DB',
//
//            'PyQt', 'Django', 'Flask',
//            'Redis', 'SQLite', 'Docker',
//            'Termux', 'WPF', 'FastAPI',
//            'PyQt6', 'C#', 'Go', 'Kotlin',
//            'PostgreSQL', 'Android', 'Mobile',
//
//            'Smart Legion Lab',
//            'Alexander Suvorov',
//            'SmartPassLib Ecosystem',
//
//            'Zenodo DOI',
//            'Open Access',
//            'Research',
//            'Independent Researcher',
//            'Computational Complexity',
//            'Information Theory',
//            'NP-Complete',
//            'Theoretical CS',
//            'Paradigms'
//        ];

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
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 12 + 12,
                text: this.techWords[Math.floor(Math.random() * this.techWords.length)],
                opacity: Math.random() * 0.25 + 0.1,
                rotation: 0
            });
        }
    }

    updateParticles() {
        for (let particle of this.particlesArray) {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            particle.opacity += (Math.random() - 0.5) * 0.01;
            if (particle.opacity < 0.1) particle.opacity = 0.1;
            if (particle.opacity > 0.3) particle.opacity = 0.3;

            if (particle.x > this.canvas.width + 100) particle.x = -100;
            else if (particle.x < -100) particle.x = this.canvas.width + 100;
            if (particle.y > this.canvas.height + 100) particle.y = -100;
            else if (particle.y < -100) particle.y = this.canvas.height + 100;
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawConnections();

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `500 ${this.getResponsiveFontSize()}px 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace`;
        
        for (let particle of this.particlesArray) {
            this.ctx.fillStyle = `rgba(13, 110, 253, ${particle.opacity})`;
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
