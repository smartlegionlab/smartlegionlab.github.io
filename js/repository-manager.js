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
        this.displayRepositories();
    }

    displayRepositories(repos = this.allRepositories) {
        const container = document.getElementById('repo-list');
        container.innerHTML = '';

        const filteredRepos = repos.filter(repo =>
            !repo.archived && !CONFIG.EXCLUDED_REPOSITORIES.includes(repo.name)
        );

        if (filteredRepos.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No active repositories found.</div>';
            return;
        }

        const reposToShow = filteredRepos.slice(0, this.visibleRepos);
        const hasMoreRepos = this.visibleRepos < filteredRepos.length;

        const grid = document.createElement('div');
        grid.className = 'repo-grid';

        reposToShow.forEach(repo => {
            const card = this.createRepoCard(repo);
            grid.appendChild(card);
        });

        container.appendChild(grid);
        this.addReposFooter(container, reposToShow.length, filteredRepos.length, hasMoreRepos);
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
                    <i class="bi bi-box-arrow-up-right"></i> View Repository
                </a>
            </div>
        `;

        return card;
    }

    addReposFooter(container, showing, total, hasMore) {
        const footer = document.createElement('div');
        footer.className = 'd-flex flex-column align-items-center gap-3 mt-4';
        footer.innerHTML = `
            <div class="text-muted small">
                Showing ${showing} of ${total} repositories
            </div>
            ${hasMore ? `
                <button class="btn btn-outline-primary" onclick="repositoryManager.loadMoreRepos()">
                    <i class="bi bi-plus-circle"></i> Load More
                </button>
            ` : ''}
        `;
        container.appendChild(footer);
    }
}