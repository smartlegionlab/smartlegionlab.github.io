class RepositoryManager {
    constructor() {
        this.allRepositories = [];
        this.visibleRepos = 6;
        this.languageColors = {
            'Python': '#3572A5', 'JavaScript': '#f1e05a', 'HTML': '#e34c26',
            'CSS': '#563d7c', 'TypeScript': '#2b7489', 'Shell': '#89e051',
            'Dockerfile': '#384d54', 'Jupyter Notebook': '#DA5B0B', 'PHP': '#4F5D95',
            'Java': '#b07219', 'C++': '#f34b7d', 'C#': '#178600',
            'Ruby': '#701516', 'Go': '#00ADD8', 'Rust': '#dea584'
        };
    }

    async fetchRepositories() {
        let allRepos = [];
        let page = 1;
        let hasMoreRepos = true;

        while (hasMoreRepos) {
            const response = await fetch(`https://api.github.com/users/${CONFIG.GITHUB_USERNAME}/repos?sort=updated&per_page=100&page=${page}`);
            if (!response.ok) throw new Error('Failed to load repositories');
            const repos = await response.json();
            allRepos = allRepos.concat(repos);
            hasMoreRepos = repos.length === 100;
            page++;
        }

        return allRepos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
    }

    loadMoreRepos() {
        this.visibleRepos += 6;

        const container = document.getElementById('repo-list');
        const grid = container.querySelector('.repo-grid');

        const filteredRepos = this.allRepositories.filter(repo =>
            !repo.archived && !CONFIG.EXCLUDED_REPOSITORIES.includes(repo.name)
        );

        const newRepos = filteredRepos.slice(this.visibleRepos - 6, this.visibleRepos);

        newRepos.forEach((repo, index) => {
            const card = this.createRepoCard(repo);

            card.style.width = '100%';
            card.style.margin = '0';
            card.style.boxSizing = 'border-box';

            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease';

            grid.appendChild(card);

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });

        this.updateReposFooter();
    }

    updateReposFooter() {
        const container = document.getElementById('repo-list');
        const oldFooter = container.querySelector('.d-flex.flex-column');
        if (oldFooter) oldFooter.remove();

        const filteredRepos = this.allRepositories.filter(repo =>
            !repo.archived && !CONFIG.EXCLUDED_REPOSITORIES.includes(repo.name)
        );

        const hasMoreRepos = this.visibleRepos < filteredRepos.length;

        const footer = document.createElement('div');
        footer.className = 'd-flex flex-column align-items-center gap-3 mt-4';
        footer.style.width = '100%';
        footer.style.boxSizing = 'border-box';

        if (window.innerWidth <= 768) {
            footer.style.padding = '0 15px';
        }

        footer.innerHTML = `
            <div class="text-muted small text-center w-100">
                Showing ${Math.min(this.visibleRepos, filteredRepos.length)} of ${filteredRepos.length} repositories
            </div>
            ${hasMoreRepos ? `
                <button class="btn btn-outline-primary" onclick="repositoryManager.loadMoreRepos()" style="min-width: 140px; width: 100%; max-width: 200px;">
                    <i class="bi bi-plus-circle"></i> Load More
                </button>
            ` : ''}
        `;

        container.appendChild(footer);
    }

    displayRepositories(repos = this.allRepositories) {
        const container = document.getElementById('repo-list');
        if (!container) return;

        container.innerHTML = '';

        const filteredRepos = repos.filter(repo =>
            !repo.archived && !CONFIG.EXCLUDED_REPOSITORIES.includes(repo.name)
        );

        if (filteredRepos.length === 0) {
            container.innerHTML = '<div class="alert alert-info text-center mx-3">No active repositories found.</div>';
            return;
        }

        const reposToShow = filteredRepos.slice(0, this.visibleRepos);

        const grid = document.createElement('div');
        grid.className = 'repo-grid';

        if (window.innerWidth <= 768) {
            grid.classList.add('mobile-grid');
        }

        reposToShow.forEach(repo => {
            const card = this.createRepoCard(repo);
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            grid.appendChild(card);
        });

        container.appendChild(grid);
        this.updateReposFooter();

        setTimeout(() => {
            const cards = container.querySelectorAll('.repo-card');
            cards.forEach((card, index) => {
                card.classList.add('fade-in-up', 'stagger-delay', 'visible');
                card.style.animationDelay = `${index * 0.1}s`;
            });
        }, 50);
    }

    createRepoCard(repo) {
        const langColor = this.languageColors[repo.language] || '#8b949e';
        const createdDate = Utils.formatDate(repo.created_at);
        const updatedDate = Utils.formatDate(repo.updated_at);

        const card = document.createElement('div');
        card.className = 'repo-card';
        card.innerHTML = `
            <div class="repo-badges">
                ${repo.fork ? '<span class="repo-badge bg-secondary">Fork</span>' : ''}
                ${repo.archived ? '<span class="repo-badge bg-danger">Archived</span>' : ''}
                ${repo.private ? '<span class="repo-badge bg-warning">Private</span>' : ''}
            </div>

            <div class="repo-header">
                <div class="repo-title-section">
                    <a href="${repo.html_url}" target="_blank" class="repo-title">
                        ${repo.name}
                    </a>
                    <div class="repo-owner">
                        <i class="bi bi-person"></i> ${repo.owner.login}
                    </div>
                </div>
                <div class="repo-stats">
                    <span class="repo-stat" title="Stars">
                        <i class="bi bi-star"></i> ${repo.stargazers_count}
                    </span>
                    <span class="repo-stat" title="Forks">
                        <i class="bi bi-diagram-2"></i> ${repo.forks_count}
                    </span>
                    ${repo.watchers_count > 0 ? `
                        <span class="repo-stat" title="Watchers">
                            <i class="bi bi-eye"></i> ${repo.watchers_count}
                        </span>
                    ` : ''}
                </div>
            </div>

            <p class="repo-description">${repo.description || 'No description provided'}</p>

            ${repo.topics && repo.topics.length > 0 ? `
                <div class="repo-topics">
                    ${repo.topics.map(topic => `
                        <span class="repo-topic">${topic}</span>
                    `).join('')}
                </div>
            ` : ''}

            <div class="repo-meta">
                ${repo.language ? `
                    <div class="repo-meta-item">
                        <div class="repo-language">
                            <span class="language-dot" style="background-color: ${langColor}"></span>
                            ${repo.language}
                        </div>
                    </div>
                ` : ''}
                <div class="repo-meta-item">
                    <i class="bi bi-calendar"></i> Created: ${createdDate}
                </div>
                <div class="repo-meta-item">
                    <i class="bi bi-arrow-clockwise"></i> Updated: ${updatedDate}
                </div>
                ${repo.size ? `
                    <div class="repo-meta-item">
                        <i class="bi bi-hdd"></i> ${Math.round(repo.size / 1024 * 10) / 10} MB
                    </div>
                ` : ''}
            </div>

            <div class="repo-footer">
                <div class="repo-updated">
                    <i class="bi bi-clock"></i> Last updated ${Utils.formatDate(repo.pushed_at)}
                </div>
                <a href="${repo.html_url}" target="_blank" class="repo-action">
                    <i class="bi bi-box-arrow-up-right"></i> View
                </a>
            </div>
        `;

        return card;
    }
}

class LazyRepositoryManager extends RepositoryManager {
    constructor() {
        super();
        this.hasLoadedRepos = false;
        this.isLoading = false;
        this.repoObserver = null;
    }

    initLazyLoading() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        this.repoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasLoadedRepos && !this.isLoading) {
                    this.loadRepositories();
                }
            });
        }, {
            rootMargin: '300px',
            threshold: 0
        });

        const repoSection = document.getElementById('repositories');
        if (repoSection) {
            this.repoObserver.observe(repoSection);
        }
    }

    async loadRepositories() {
        if (this.isLoading || this.hasLoadedRepos) return;

        this.isLoading = true;
        console.log('🚀 Starting lazy loading of repositories...');

        try {
            this.showSkeletonLoader();

            this.allRepositories = await this.fetchRepositories();
            this.displayRepositories();
            this.hasLoadedRepos = true;

            if (this.repoObserver) {
                this.repoObserver.disconnect();
            }

            console.log('✅ Repositories loaded via lazy loading');

        } catch (error) {
            console.error('Error loading repositories:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
        }
    }

    showSkeletonLoader() {
        const container = document.getElementById('repo-list');
        if (!container) return;

        container.innerHTML = `
            <div class="repo-grid">
                ${Array(6).fill(0).map(() => `
                    <div class="repo-card skeleton-card">
                        <div class="skeleton-line skeleton-title"></div>
                        <div class="skeleton-line skeleton-text"></div>
                        <div class="skeleton-line skeleton-text-short"></div>
                        <div class="skeleton-line skeleton-meta"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showErrorState() {
        const container = document.getElementById('repo-list');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i>
                    Failed to load repositories.
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="window.repositoryManager.loadRepositories()">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    displayRepositories(repos = this.allRepositories) {
        super.displayRepositories(repos);

        setTimeout(() => {
            document.querySelectorAll('.repo-card:not(.skeleton-card)').forEach((card, index) => {
                card.classList.add('fade-in-up', 'stagger-delay');
                card.style.animationDelay = `${index * 0.1}s`;
            });
        }, 100);
    }
}