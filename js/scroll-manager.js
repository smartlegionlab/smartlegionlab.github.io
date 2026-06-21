class ScrollManager {
    constructor() {
        this.scrollToTopBtn = document.getElementById('scrollToTop');
        this.progressContainer = document.querySelector('.nav-progress');
        this.progressBar = document.querySelector('.nav-progress-bar');
        this.progressBall = document.querySelector('.nav-progress-ball');
        this.isScrolling = false;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            if (!this.isScrolling) {
                this.isScrolling = true;
                requestAnimationFrame(() => {
                    this.updateProgress();
                    this.toggleScrollToTop();
                    this.isScrolling = false;
                });
            }
        });

        if (this.scrollToTopBtn) {
            this.scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        this.updateProgress();
        this.toggleScrollToTop();
    }

    updateProgress() {
        const winScroll = window.pageYOffset;
        const height = document.documentElement.scrollHeight - window.innerHeight;

        if (height <= 0 || !this.progressBar || !this.progressContainer) return;

        const scrolled = (winScroll / height) * 100;
        const containerWidth = this.progressContainer.clientWidth;
        const ballOffset = (scrolled / 100) * containerWidth;

        this.progressBar.style.width = scrolled + '%';

        if (this.progressBall) {
            if (scrolled > 2 && scrolled < 98) {
                this.progressBall.style.opacity = '1';
                this.progressBall.textContent = Math.round(scrolled) + '%';
                this.progressBall.style.left = ballOffset - 10 + 'px';
            } else {
                this.progressBall.style.opacity = '0';
            }
        }
    }

    toggleScrollToTop() {
        if (this.scrollToTopBtn) {
            if (window.pageYOffset > 300) {
                this.scrollToTopBtn.classList.add('show');
            } else {
                this.scrollToTopBtn.classList.remove('show');
            }
        }
    }
}