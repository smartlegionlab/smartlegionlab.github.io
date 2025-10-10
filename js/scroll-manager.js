class ScrollManager {
    constructor() {
        this.scrollToTopBtn = document.getElementById('scrollToTop');
        this.scrollProgress = document.querySelector('.scroll-progress-bar');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.toggleScrollToTop();
        this.updateScrollProgress();
    }

    setupEventListeners() {
        window.addEventListener('scroll', () => {
            this.toggleScrollToTop();
            this.updateScrollProgress();
        });

        this.scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    toggleScrollToTop() {
        if (window.pageYOffset > 300) {
            this.scrollToTopBtn.classList.add('show');
        } else {
            this.scrollToTopBtn.classList.remove('show');
        }
    }

    updateScrollProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.pageYOffset;
        const progress = (scrollTop / documentHeight) * 100;
        if (this.scrollProgress) {
            this.scrollProgress.style.width = progress + '%';
        }
    }
}