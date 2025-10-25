class PriorityAnimationManager {
    constructor() {
        this.hasInitializedLazy = false;
    }

    initImmediate() {
        this.initAvatarAnimation();
    }

    initLazy() {
        if (this.hasInitializedLazy) return;

        this.initScrollAnimations();
        this.initCounters();
        this.hasInitializedLazy = true;
    }

    initAvatarAnimation() {
        const avatar = document.querySelector('.profile-avatar');
        if (avatar) {
            setTimeout(() => {
                avatar.style.animation = 'avatarMorph 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s forwards';
            }, 500);
        }
    }

    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                        entry.target.offsetHeight;
                    }, parseInt(delay));
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        document.querySelectorAll('.research-card, .about-card, .expertise-card, .repo-card').forEach((el, index) => {
            el.classList.add('fade-in-up', 'stagger-delay');
            el.dataset.delay = (index % 6) * 100;
            observer.observe(el);
        });
    }

    initCounters() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const text = element.textContent;
                    const value = parseInt(text.replace(/[^0-9]/g, ''));
                    if (!isNaN(value)) {
                        Utils.animateValue(element, 0, value, 1500);
                    }
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.stat-number, .stats-number, .metric-number').forEach(el => {
            observer.observe(el);
        });
    }
}