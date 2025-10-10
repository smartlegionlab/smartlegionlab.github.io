class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.initCounters();
        this.initScrollAnimations();
    }

    initCounters() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const text = element.textContent;
                    const value = parseInt(text);
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

    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, 100);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.research-card, .about-card, .expertise-card').forEach((el, index) => {
            el.classList.add('fade-in-up', 'stagger-delay');
            observer.observe(el);
        });

        document.querySelectorAll('.content-section').forEach(section => {
            const children = section.querySelectorAll('.card, .about-card, .expertise-card');
            children.forEach((child, idx) => {
                child.style.transitionDelay = `${idx * 0.1}s`;
            });
        });
    }
}