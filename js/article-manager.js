class ArticleManager {
    constructor() {
        this.allArticles = [];
    }

    async fetchArticles() {
        const response = await fetch(`https://dev.to/api/articles?username=${CONFIG.DEVTO_USERNAME}`);
        if (!response.ok) throw new Error('Failed to load articles');
        return await response.json();
    }

    displayArticles(articles) {
        const container = document.getElementById('articles-list');
        container.innerHTML = '';

        if (articles.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No articles found.</div>';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'repo-grid';

        articles.forEach(article => {
            const card = this.createArticleCard(article);
            grid.appendChild(card);
        });

        container.appendChild(grid);

        setTimeout(() => {
            const cards = container.querySelectorAll('.repo-card');
            cards.forEach((card, index) => {
                card.classList.add('fade-in-up', 'stagger-delay', 'visible');
                card.style.animationDelay = `${index * 0.1}s`;
            });
        }, 50);
    }

    createArticleCard(article) {
        const publishedDate = Utils.formatDate(article.published_at);
        const readTime = article.reading_time_minutes ? `${article.reading_time_minutes} min read` : '';

        const card = document.createElement('div');
        card.className = 'repo-card';
        card.innerHTML = `
            <div class="repo-badges">
                ${article.positive_reactions_count > 10 ? '<span class="repo-badge bg-success">Popular</span>' : ''}
                ${article.comments_count > 5 ? '<span class="repo-badge bg-info">Active Discussion</span>' : ''}
            </div>

            <div class="repo-header">
                <div class="repo-title-section">
                    <a href="${article.url}" target="_blank" class="repo-title">
                        ${article.title}
                    </a>
                    <div class="repo-owner">
                        <i class="bi bi-person"></i> ${article.user.name || CONFIG.DEVTO_USERNAME}
                    </div>
                </div>
                <div class="repo-stats">
                    <span class="repo-stat" title="Likes">
                        <i class="bi bi-heart"></i> ${article.positive_reactions_count}
                    </span>
                    <span class="repo-stat" title="Comments">
                        <i class="bi bi-chat"></i> ${article.comments_count}
                    </span>
                </div>
            </div>

            <p class="repo-description">${article.description || 'No description provided'}</p>

            ${article.tag_list && article.tag_list.length > 0 ? `
                <div class="repo-topics">
                    ${article.tag_list.slice(0, 5).map(tag => `
                        <span class="repo-topic">${tag}</span>
                    `).join('')}
                </div>
            ` : ''}

            <div class="repo-meta">
                <div class="repo-meta-item">
                    <i class="bi bi-calendar"></i> Published: ${publishedDate}
                </div>
                ${readTime ? `
                    <div class="repo-meta-item">
                        <i class="bi bi-clock"></i> ${readTime}
                    </div>
                ` : ''}
            </div>

            <div class="repo-footer">
                <div class="repo-updated">
                    <i class="bi bi-tags"></i> ${article.tag_list ? article.tag_list.length : 0} tags
                </div>
                <a href="${article.url}" target="_blank" class="repo-action">
                    <i class="bi bi-box-arrow-up-right"></i> Read Article
                </a>
            </div>
        `;

        return card;
    }
}

class LazyArticleManager extends ArticleManager {
    constructor() {
        super();
        this.hasLoaded = false;
        this.isLoading = false;
    }

    async loadArticles() {
        if (this.isLoading || this.hasLoaded) return;

        this.isLoading = true;
        console.log('🚀 Loading articles...');

        try {
            this.showLoadingState();

            this.allArticles = await this.fetchArticles();
            this.displayArticles(this.allArticles);
            this.hasLoaded = true;

            console.log('✅ Articles loaded successfully');

        } catch (error) {
            console.error('❌ Error loading articles:', error);
            this.showErrorState(error);
        } finally {
            this.isLoading = false;
        }
    }

    showErrorState(error) {
        const container = document.getElementById('articles-list');
        if (!container) return;

        container.innerHTML = `
            <div class="alert alert-danger">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <strong>❌ Failed to Load Articles</strong>
                        <div class="small mt-1">Could not load articles from Dev.to. Please try again.</div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger ms-3" onclick="window.portfolioApp.articleManager.retryLoad()">
                        <i class="bi bi-arrow-clockwise"></i> Try Again
                    </button>
                </div>
            </div>
        `;
    }

    async retryLoad() {
        if (this.isLoading) return;

        this.hasLoaded = false;
        await this.loadArticles();
    }

    showLoadingState() {
        const container = document.getElementById('articles-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading articles...</span>
                    </div>
                    <p class="mt-3 text-muted">Loading technical articles...</p>
                </div>
            `;
        }
    }
}