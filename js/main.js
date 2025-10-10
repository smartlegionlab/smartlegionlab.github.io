class PortfolioApp {
    constructor() {
        this.repositoryManager = new RepositoryManager();
        this.articleManager = new ArticleManager();
        this.statsManager = new StatsManager();
        this.citationManager = new CitationManager();
        this.init();
    }

    async init() {
        const particleBg = new ParticleBackground();
        new VerticalProgressNav();
        new ScrollManager();
        new AnimationManager();

        this.setupTabHandlers();

        await this.loadInitialData();

        window.addEventListener('beforeunload', () => {
            particleBg.destroy();
        });
    }

    setupTabHandlers() {
        document.querySelector('a[href="#repos-tab"]').addEventListener('shown.bs.tab', async () => {
            try {
                if (this.repositoryManager.allRepositories.length === 0) {
                    this.repositoryManager.allRepositories = await this.repositoryManager.fetchRepositories();
                }
                this.repositoryManager.visibleRepos = 6;
                this.repositoryManager.displayRepositories();
            } catch (error) {
                document.getElementById('repo-list').innerHTML = `
                    <div class="alert alert-danger">Error loading repositories: ${error.message}</div>
                `;
            }
        });

        document.querySelector('a[href="#articles-tab"]').addEventListener('shown.bs.tab', async () => {
            try {
                if (this.articleManager.allArticles.length === 0) {
                    this.articleManager.allArticles = await this.articleManager.fetchArticles();
                }
                this.articleManager.displayArticles(this.articleManager.allArticles);
            } catch (error) {
                document.getElementById('articles-list').innerHTML = `
                    <div class="alert alert-danger">Error loading articles: ${error.message}</div>
                `;
            }
        });
    }

    async loadInitialData() {
        try {
            this.repositoryManager.allRepositories = await this.repositoryManager.fetchRepositories();
            this.repositoryManager.displayRepositories();
        } catch (error) {
            document.getElementById('repo-list').innerHTML = `
                <div class="alert alert-danger">Error loading repositories: ${error.message}</div>
            `;
        }
    }
}

let repositoryManager;

document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    repositoryManager = app.repositoryManager;
});