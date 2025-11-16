class ArticleManager {
    constructor() {
        this.allArticles = [];
    }

    async fetchArticles() {
        console.log(`📡 Fetching articles for user: ${CONFIG.DEVTO_USERNAME}`);

        try {
            const response = await fetch(`https://dev.to/api/articles?username=${CONFIG.DEVTO_USERNAME}&per_page=100`);

            if (!response.ok) {
                throw new Error(`Dev.to API error: ${response.status} ${response.statusText}`);
            }

            const articles = await response.json();
            console.log(`✅ Successfully fetched ${articles.length} articles`);

            return articles;

        } catch (error) {
            throw error;
        }
    }

    displayArticles(articles) {
        const container = document.getElementById('articles-list');
        if (!container) return;

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
        const isPopular = article.positive_reactions_count > 10;
        const hasDiscussion = article.comments_count > 5;

        const card = document.createElement('div');
        card.className = 'repo-card';
        card.innerHTML = `
            <div class="repo-badges">
                ${isPopular ? '<span class="repo-badge bg-success">Popular</span>' : ''}
                ${hasDiscussion ? '<span class="repo-badge bg-info">Active Discussion</span>' : ''}
                ${article.published_at ? '<span class="repo-badge bg-primary">Published</span>' : ''}
            </div>

            <div class="repo-header">
                <div class="repo-title-section">
                    <a href="${article.url}" target="_blank" class="repo-title" title="${article.title}">
                        ${article.title}
                    </a>
                    <div class="repo-owner">
                        <i class="bi bi-person"></i> ${article.user.name || CONFIG.DEVTO_USERNAME}
                    </div>
                </div>
                <div class="repo-stats">
                    <span class="repo-stat text-danger" title="Likes">
                        <i class="bi bi-heart"></i> ${article.positive_reactions_count}
                    </span>
                    <span class="repo-stat text-info" title="Comments">
                        <i class="bi bi-chat"></i> ${article.comments_count}
                    </span>
                    ${article.public_reactions_count > 0 ? `
                        <span class="repo-stat text-warning" title="Reactions">
                            <i class="bi bi-emoji-smile"></i> ${article.public_reactions_count}
                        </span>
                    ` : ''}
                </div>
            </div>

            <p class="repo-description">${article.description || 'No description provided'}</p>

            ${article.tag_list && article.tag_list.length > 0 ? `
                <div class="repo-topics">
                    ${article.tag_list.slice(0, 5).map(tag => `
                        <span class="repo-topic" title="${tag}">${tag}</span>
                    `).join('')}
                    ${article.tag_list.length > 5 ? `<span class="repo-topic">+${article.tag_list.length - 5} more</span>` : ''}
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
                ${article.page_views_count > 0 ? `
                    <div class="repo-meta-item">
                        <i class="bi bi-eye"></i> ${article.page_views_count} views
                    </div>
                ` : ''}
            </div>

            <div class="repo-footer">
                <div class="repo-updated">
                    <i class="bi bi-tags"></i> ${article.tag_list ? article.tag_list.length : 0} tags
                </div>
                <a href="${article.url}" target="_blank" class="repo-action" title="Read full article">
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
        this.usedCache = false;
    }

    async loadArticles() {
        if (this.isLoading || this.hasLoaded) return;

        this.isLoading = true;
        console.log('🚀 Loading articles...');

        try {
            this.showLoadingState();

            const freshCache = ArticleCache.getCachedArticles();
            if (freshCache && freshCache.length > 0) {
                console.log('📦 Using fresh articles cache - NO API CALL');
                this.allArticles = freshCache;
                this.displayArticles(this.allArticles);
                this.hasLoaded = true;
                this.usedCache = true;

                console.log('✅ Articles loaded from cache successfully');
                return;
            }

            console.log('📡 No fresh articles cache available, fetching from Dev.to API...');
            const freshArticles = await this.fetchArticles();

            this.allArticles = freshArticles;
            ArticleCache.saveArticles(freshArticles);
            this.displayArticles(this.allArticles);
            this.hasLoaded = true;
            this.usedCache = false;

            console.log('✅ Articles loaded from API successfully');

        } catch (error) {
            console.error('❌ Error loading articles:', error);

            const staleCache = ArticleCache.getStaleArticles();
            if (staleCache && staleCache.data && staleCache.data.length > 0) {
                console.log('🔄 Using stale articles cache as fallback');
                this.allArticles = staleCache.data;
                this.displayArticles(this.allArticles);
                this.hasLoaded = true;
                this.usedCache = true;
                this.showCacheWarning(staleCache.isExpired);
            } else {
                this.showErrorState(error);
            }
        } finally {
            this.isLoading = false;
        }
    }

    showCacheWarning(isExpired = false) {
        const container = document.getElementById('articles-list');
        if (!container) return;

        const cacheAge = ArticleCache.getArticlesCacheAge();
        const hoursAgo = cacheAge ? Math.round(cacheAge / 3600000) : 'unknown';
        const minutesAgo = cacheAge ? Math.round(cacheAge / 60000) : 'unknown';

        let timeText;
        if (cacheAge < 3600000) {
            timeText = `${minutesAgo} minutes ago`;
        } else {
            timeText = `${hoursAgo} hours ago`;
        }

        const warning = document.createElement('div');
        warning.className = 'alert alert-warning mb-3';
        warning.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-clock-history me-2"></i>
                <div class="flex-grow-1">
                    <strong>Showing Cached Articles</strong>
                    <div class="small">${isExpired ? 'Data may be outdated' : 'Loaded from cache'}. Last updated ${timeText}.</div>
                </div>
                <button class="btn btn-sm btn-outline-warning ms-3" onclick="window.portfolioApp.articleManager.forceRefresh()">
                    <i class="bi bi-arrow-clockwise"></i> Refresh
                </button>
            </div>
        `;

        container.prepend(warning);
    }

    showErrorState(error) {
        const container = document.getElementById('articles-list');
        if (!container) return;

        const errorType = ErrorHandler.analyzeError(error);
        const errorInfo = ErrorHandler.getErrorMessage(errorType);

        const customMessage = errorInfo.message.replace('repositories', 'articles');
        const customTitle = errorInfo.title.replace('GitHub', 'Dev.to');

        container.innerHTML = `
            <div class="alert alert-danger">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <strong>${customTitle}</strong>
                        <div class="small mt-1">${customMessage}</div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger ms-3" onclick="window.portfolioApp.articleManager.forceRefresh()">
                        <i class="bi bi-arrow-clockwise"></i> ${errorInfo.action}
                    </button>
                </div>
            </div>
        `;
    }

    async forceRefresh() {
        if (this.isLoading) return;

        console.log('🔄 Manual articles refresh requested...');

        ArticleCache.clearArticlesCache();
        this.hasLoaded = false;
        this.usedCache = false;

        const container = document.getElementById('articles-list');
        if (container) {
            container.innerHTML = '';
        }

        await this.loadArticles();
    }

    async retryLoad() {
        await this.forceRefresh();
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