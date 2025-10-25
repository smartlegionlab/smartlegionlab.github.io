class VerticalProgressNav {
    constructor() {
        this.sections = [];
        this.progressFill = null;
        this.markers = [];
        this.init();
    }

    init() {
        this.createProgressBar();
        this.setupSections();
        this.setupEventListeners();
        this.updateAll();
    }

    createProgressBar() {
        const nav = document.createElement('div');
        nav.className = 'vertical-progress-nav';

        const track = document.createElement('div');
        track.className = 'progress-track';

        this.progressFill = document.createElement('div');
        this.progressFill.className = 'progress-fill';

        track.appendChild(this.progressFill);
        nav.appendChild(track);

        const sections = ['hero', 'about', 'research', 'repositories', 'expertise', 'technologies', 'contact'];
        const labels = ['Home', 'About', 'Research', 'Repositories', 'Expertise', 'Technologies', 'Contact'];

        sections.forEach((sectionId, index) => {
            const marker = document.createElement('div');
            marker.className = 'progress-marker';
            marker.dataset.section = sectionId;
            marker.dataset.tooltip = labels[index];
            marker.dataset.index = index;

            marker.addEventListener('click', () => {
                this.scrollToSection(sectionId);
            });

            track.appendChild(marker);
            this.markers.push(marker);
        });

        document.body.appendChild(nav);
    }

    setupSections() {
        this.sections = [
            'hero', 'about', 'research', 'repositories', 'expertise', 'technologies', 'contact'
        ].map(id => document.getElementById(id)).filter(Boolean);
    }

    setupEventListeners() {
        const debouncedScroll = Utils.debounce(() => this.updateAll(), 16);
        window.addEventListener('scroll', debouncedScroll);
        window.addEventListener('resize', () => setTimeout(() => this.updateAll(), 100));
    }

    updateAll() {
        this.updateProgress();
        this.updateMarkers();
    }

    updateProgress() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const totalScrollable = documentHeight - windowHeight;
        const progress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;

        if (this.progressFill) {
            this.progressFill.style.height = Math.min(Math.max(progress, 0), 100) + '%';
        }
    }

    updateMarkers() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const totalScrollable = documentHeight - windowHeight;
        const isAtBottom = scrollTop + windowHeight >= documentHeight - 50;

        let activeSection = '';

        if (isAtBottom) {
            activeSection = this.sections[this.sections.length - 1].id;
        } else {
            for (let i = 0; i < this.sections.length; i++) {
                const section = this.sections[i];
                const sectionTop = section.offsetTop - CONFIG.SCROLL_OFFSET;

                if (scrollTop >= sectionTop && scrollTop < sectionTop + section.offsetHeight) {
                    activeSection = section.id;
                    break;
                }
            }

            if (!activeSection && this.sections.length > 0) {
                activeSection = this.sections[0].id;
            }
        }

        this.markers.forEach(marker => {
            const sectionId = marker.dataset.section;
            const section = document.getElementById(sectionId);

            if (!section) return;

            const sectionTop = section.offsetTop - CONFIG.SCROLL_OFFSET;
            const sectionProgress = totalScrollable > 0 ? (Math.max(sectionTop, 0) / totalScrollable) * 100 : 0;
            const currentProgress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;

            const nav = document.querySelector('.vertical-progress-nav');
            const navHeight = nav.offsetHeight;
            const markerPosition = (sectionProgress / 100) * navHeight;
            marker.style.top = Math.max(8, Math.min(markerPosition, navHeight - 8)) + 'px';

            marker.classList.remove('active', 'filled');

            if (sectionId === activeSection) {
                marker.classList.add('active');
            }

            if (currentProgress >= sectionProgress) {
                marker.classList.add('filled');
            }
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - CONFIG.SCROLL_OFFSET;
            window.scrollTo({
                top: Math.max(offsetTop, 0),
                behavior: 'smooth'
            });
        }
    }
}