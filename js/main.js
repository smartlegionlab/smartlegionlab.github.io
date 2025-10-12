class PortfolioApp {
    constructor() {
        this.loadingStages = {
            CORE: 1,
            VISUAL: 2,
            CONTENT: 3,
            LAZY: 4
        };
        this.currentStage = this.loadingStages.CORE;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    }

    async init() {
        await this.executeLoadingPipeline();
    }

    async executeLoadingPipeline() {
        try {
            await this.loadCoreFunctionality();

            await this.loadVisualEffects();

            this.setupLazyLoading();

            console.log('✅ Portfolio app fully loaded with priority system');
        } catch (error) {
            console.error('Error in loading pipeline:', error);
        }
    }

    async loadCoreFunctionality() {
        this.scrollManager = new ScrollManager();
        this.scrollManager.init();

        this.progressNav = new VerticalProgressNav();

        this.citationManager = new CitationManager();

        this.statsManager = new StatsManager();

        this.zenodoManager = new ZenodoManager(this.statsManager);

        console.log('✅ Core functionality loaded');
    }

    async loadVisualEffects() {
        if (!this.isMobile) {
            this.particleBg = new ParticleBackground();
        }

        this.animationManager = new PriorityAnimationManager();
        this.animationManager.initImmediate();

        console.log('✅ Visual effects loaded');
    }

    setupLazyLoading() {
        this.repositoryManager = new LazyRepositoryManager();
        this.articleManager = new LazyArticleManager();

        this.repositoryManager.initLazyLoading();

        this.animationManager.initLazy();

        setTimeout(() => {
            this.zenodoManager.loadStats();
        }, 1000);

        this.setupTabHandlers();

        console.log('✅ Lazy loading setup complete');
    }

    setupTabHandlers() {
        const articlesTab = document.querySelector('a[href="#articles-tab"]');
        if (articlesTab) {
            articlesTab.addEventListener('shown.bs.tab', async () => {
                if (!this.articleManager.hasLoaded && !this.articleManager.isLoading) {
                    await this.articleManager.loadArticles();
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    document.body.style.opacity = '0';

    const app = new PortfolioApp();
    window.portfolioApp = app;
    await app.init();

    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    }, 100);

    window.repositoryManager = app.repositoryManager;
    window.zenodoManager = app.zenodoManager;
});