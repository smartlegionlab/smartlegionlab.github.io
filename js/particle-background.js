class ParticleBackground {
    constructor() {
        if (window.particleBackgroundInstance) {
            return window.particleBackgroundInstance;
        }

//        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
//        if (this.isMobile) return;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particlesArray = [];
        this.animationId = null;
        this.isPaused = false;

        this.techWords = [
            'Arch', 'Artix', 'Manjaro', 'Garuda', 'EndeavourOS',
            'Gentoo', 'LFS', 'Void', 'NixOS', 'Slackware',
            'Debian', 'Ubuntu', 'Fedora', 'openSUSE',
            'FreeBSD', 'OpenBSD', 'NetBSD',
            'WSL', 'WINE', 'Proton', 'Bottles',
            
            'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 
            'Go', 'Rust', 'Swift', 'Kotlin', 'Zig', 'Nim', 'Crystal', 'D',
            'Haskell', 'Scala', 'Elixir', 'Erlang', 'Clojure', 'F#', 'OCaml',
            'Lua', 'Perl', 'R', 'Julia', 'Bash', 'Zsh', 'Fish',
            'Assembly', 'COBOL', 'Fortran', 'Lisp', 'Prolog', 'Racket',
            
            'React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Qwik',
            'Django', 'Flask', 'FastAPI', 'Spring', 'Laravel', 'Symfony',
            'Rails', 'Phoenix', 'Actix', 'Rocket', 'Tauri', 'Electron',
            'PyTorch', 'TensorFlow', 'JAX', 'Transformers', 'LangChain',
            
            'Docker', 'Podman', 'Kubernetes', 'k3s', 'Rancher',
            'Git', 'GitLab', 'Gitea', 'Codeberg',
            'Neovim', 'Vim', 'Emacs', 'Helix', 'Kakoune',
            'Codium', 'Sublime',
            'curl', 'wget',
            
            'PostgreSQL', 'MySQL', 'MariaDB', 'SQLite', 'DuckDB',
            'MongoDB', 'Redis', 'Memcached', 'Dragonfly', 'KeyDB',
            'ClickHouse', 'TimescaleDB', 'InfluxDB', 'Prometheus',
            'Elasticsearch', 'Cassandra', 'ScyllaDB', 'Neo4j',
            
            'DigitalOcean', 'Hetzner', 'Linode',
            'Vercel', 'Netlify', 'Railway', 'Fly.io',
            
            'REST', 'GraphQL', 'tRPC', 'WebSocket', 'SSE',
            'HTTP/2', 'HTTP/3', 'QUIC', 'TCP/IP', 'UDP', 'ICMP',
            'JSON', 'YAML', 'TOML', 'XML', 'Protobuf', 'Avro',
            'JWT', 'OAuth', 'OIDC', 'SAML', 'LDAP', 'Kerberos',
            
            'Microservices', 'Monolith', 'Serverless', 'Edge',
            'Clean Architecture', 'DDD', 'CQRS', 'Event Sourcing',
            'MVC', 'MVP', 'MVVM', 'VIPER', 'Redux', 'Zustand',
            
            'Make', 'CMake', 'Meson', 'Ninja', 'Bazel',
            'GitHub Actions', 'Jenkins', 'Drone', 'Woodpecker',
            'Ansible', 'Terraform', 'Packer', 'Vagrant', 'Pulumi',
            
            'pip', 'pipx', 'poetry', 'pdm', 'uv',
            'venv', 'virtualenv', 'conda', 'mamba', 'micromamba',
            'NumPy', 'Pandas', 'Polars', 'Pyspark', 'Dask',
            'Jupyter', 'IPython', 'Colab', 'Kaggle',
            
            'npm', 'yarn', 'pnpm', 'bun', 'deno',
            'webpack', 'Vite', 'esbuild', 'Rollup', 'Parcel',
            'Babel', 'SWC', 'tsc', 'ESLint', 'Prettier',
            'Node.js', 'Bun', 'Deno',
            
            'X11', 'Xorg', 'Wayland', 'Sway', 'Hyprland', 'River', 'DWL',
            'Qt', 'GTK', 'wxWidgets', 'FLTK', 'IUP',
            'KDE Plasma', 'GNOME', 'XFCE', 'LXQt', 'Cinnamon', 'MATE',
            
            'Alacritty', 'Kitty', 'WezTerm', 'Foot', 'ST',
            'Bash', 'Zsh', 'Fish', 'NuShell', 'Elvish', 'Xonsh',
            
            'systemd', 'OpenRC', 'runit', 's6', 'dinit',
            'GRUB', 'systemd-boot', 'rEFInd', 'Limine',
            'iptables', 'nftables', 'firewalld', 'ufw',
            
            'LXC', 'LXD', 'Incus', 'Proxmox', 'QEMU', 'KVM',
            'VirtualBox', 'Xen', 'bhyve',
            'Flatpak', 'Snap', 'AppImage', 'Distrobox',
            
            'ext4', 'XFS', 'Btrfs', 'ZFS', 'F2FS', 'NTFS-3G',
            'LUKS', 'LVM', 'RAID', 'mdadm',
            
            'x86_64', 'ARM', 'AArch64', 'RISC-V', 'MIPS', 'PowerPC',
            'AMD64', 'i386', 'ARMv7', 'ARMv8',
            
            'SELinux', 'AppArmor', 'Tomoyo', 'Smack',
            'GnuPG', 'OpenPGP', 'age', 'sops',
            'OpenSSL', 'LibreSSL', 'GnuTLS', 'mbed TLS'
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
        if (window.innerWidth < 1024) return 45;
        return 70;
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
