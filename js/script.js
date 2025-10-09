const GITHUB_USERNAME = 'smartlegionlab';
const DEVTO_USERNAME = GITHUB_USERNAME;

const RESEARCH_STATS = {
    pointerParadigm: {
        views: 128,
        downloads: 123
    },
    localDataParadigm: {
        views: 48,
        downloads: 44
    }
};

const TOTAL_DOWNLOADS = RESEARCH_STATS.pointerParadigm.downloads + RESEARCH_STATS.localDataParadigm.downloads;

const EXCLUDED_REPOSITORIES = [
    'smartlegionlab.github.io',
    'smartlegionlab',
];

function updateResearchStats() {
    const headerStats = document.querySelectorAll('.stats-row .stat:first-child .stat-number');
    if (headerStats.length > 0) {
        headerStats[0].textContent = TOTAL_DOWNLOADS + '+';
    }

    const metricElement = document.getElementById('total-downloads-metric');
    if (metricElement) {
        metricElement.textContent = TOTAL_DOWNLOADS + '+';
    }

    const pointerViews = document.getElementById('pointer-views');
    const pointerDownloads = document.getElementById('pointer-downloads');
    const localdataViews = document.getElementById('localdata-views');
    const localdataDownloads = document.getElementById('localdata-downloads');

    if (pointerViews) pointerViews.textContent = RESEARCH_STATS.pointerParadigm.views;
    if (pointerDownloads) pointerDownloads.textContent = RESEARCH_STATS.pointerParadigm.downloads;
    if (localdataViews) localdataViews.textContent = RESEARCH_STATS.localDataParadigm.views;
    if (localdataDownloads) localdataDownloads.textContent = RESEARCH_STATS.localDataParadigm.downloads;
}

const languageColors = {
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'TypeScript': '#2b7489',
    'Shell': '#89e051',
    'Dockerfile': '#384d54',
    'Jupyter Notebook': '#DA5B0B',
    'PHP': '#4F5D95',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C#': '#178600',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584'
};

let currentRepoPage = 1;
const reposPerPage = 6;
let allRepositories = [];

function initScrollFeatures() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const scrollProgress = document.querySelector('.scroll-progress-bar');
    const navDots = document.querySelectorAll('.nav-dot');
    const sections = document.querySelectorAll('.content-section, .professional-header');

    function toggleScrollToTop() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    }

    function updateScrollProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.pageYOffset;
        const progress = (scrollTop / documentHeight) * 100;
        scrollProgress.style.width = progress + '%';
    }

    function updateActiveNav() {
        const scrollPosition = window.scrollY + 100;
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSection = section.id;
            }
        });

        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10) {
            currentSection = sections[sections.length - 1].id;
        }

        navDots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.dataset.section === currentSection) {
                dot.classList.add('active');
            }
        });
    }

    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    window.addEventListener('scroll', () => {
        toggleScrollToTop();
        updateScrollProgress();
        updateActiveNav();
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    navDots.forEach(dot => {
        dot.addEventListener('click', () => {
            scrollToSection(dot.dataset.section);
        });
    });

    toggleScrollToTop();
    updateScrollProgress();
    updateActiveNav();
}

async function fetchRepositories() {
    let allRepos = [];
    let page = 1;
    let hasMoreRepos = true;

    while (hasMoreRepos) {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&page=${page}`);
        if (!response.ok) throw new Error('Failed to load repositories');
        const repos = await response.json();
        allRepos = allRepos.concat(repos);
        hasMoreRepos = repos.length === 100;
        page++;
    }

    return allRepos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function changeRepoPage(page) {
    const filteredRepos = allRepositories.filter(repo => !repo.archived);
    const totalPages = Math.ceil(filteredRepos.length / reposPerPage);

    if (page >= 1 && page <= totalPages) {
        currentRepoPage = page;
        displayRepositories();
    }
}

function displayRepositories(repos = allRepositories) {
    const container = document.getElementById('repo-list');
    container.innerHTML = '';

    const filteredRepos = repos.filter(repo =>
        !repo.archived && !EXCLUDED_REPOSITORIES.includes(repo.name)
    );

    if (filteredRepos.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No active repositories found.</div>';
        return;
    }

    const totalPages = Math.ceil(filteredRepos.length / reposPerPage);
    const startIndex = (currentRepoPage - 1) * reposPerPage;
    const endIndex = startIndex + reposPerPage;
    const reposToShow = filteredRepos.slice(startIndex, endIndex);

    const grid = document.createElement('div');
    grid.className = 'repo-grid';

    reposToShow.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'repo-card';

        const langColor = languageColors[repo.language] || '#8b949e';
        const createdDate = formatDate(repo.created_at);
        const updatedDate = formatDate(repo.updated_at);

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
                    <i class="bi bi-clock"></i> Last updated ${formatDate(repo.pushed_at)}
                </div>
                <a href="${repo.html_url}" target="_blank" class="repo-action">
                    <i class="bi bi-box-arrow-up-right"></i> View Repository
                </a>
            </div>
        `;

        grid.appendChild(card);
    });

    container.appendChild(grid);

    if (filteredRepos.length > reposPerPage) {
        const pagination = document.createElement('div');
        pagination.className = 'd-flex justify-content-between align-items-center mb-4';

        pagination.innerHTML = `
            <div class="text-muted small">
                Showing ${startIndex + 1}-${Math.min(endIndex, filteredRepos.length)} of ${filteredRepos.length} repositories
            </div>
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-outline-primary ${currentRepoPage === 1 ? 'disabled' : ''}"
                        onclick="changeRepoPage(${currentRepoPage - 1})" ${currentRepoPage === 1 ? 'disabled' : ''}>
                    <i class="bi bi-chevron-left"></i>
                </button>
                <button type="button" class="btn btn-outline-primary disabled">
                    ${currentRepoPage}/${totalPages}
                </button>
                <button type="button" class="btn btn-outline-primary ${currentRepoPage === totalPages ? 'disabled' : ''}"
                        onclick="changeRepoPage(${currentRepoPage + 1})" ${currentRepoPage === totalPages ? 'disabled' : ''}>
                    <i class="bi bi-chevron-right"></i>
                </button>
            </div>
        `;

        container.insertBefore(pagination, grid);
    } else {
        const counter = document.createElement('div');
        counter.className = 'd-flex justify-content-between align-items-center mb-4';
        counter.innerHTML = `
            <div class="text-muted small">
                ${filteredRepos.length} repositories
            </div>
        `;
        container.insertBefore(counter, grid);
    }
}

async function fetchArticles() {
    const response = await fetch(`https://dev.to/api/articles?username=${DEVTO_USERNAME}`);
    if (!response.ok) throw new Error('Failed to load articles');
    return await response.json();
}

function displayArticles(articles) {
    const container = document.getElementById('articles-list');
    container.innerHTML = '';

    if (articles.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No articles found.</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'repo-grid';

    articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'repo-card';

        const publishedDate = formatDate(article.published_at);
        const readTime = article.reading_time_minutes ? `${article.reading_time_minutes} min read` : '';

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
                        <i class="bi bi-person"></i> ${article.user.name || DEVTO_USERNAME}
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

        grid.appendChild(card);
    });

    container.appendChild(grid);
}

document.addEventListener('DOMContentLoaded', async function() {
    updateResearchStats();
    initScrollFeatures();

    document.querySelector('a[href="#repos-tab"]').addEventListener('shown.bs.tab', async function() {
        try {
            if (allRepositories.length === 0) {
                allRepositories = await fetchRepositories();
            }
            currentRepoPage = 1;
            displayRepositories();
        } catch (error) {
            document.getElementById('repo-list').innerHTML = `
                <div class="alert alert-danger">Error loading repositories: ${error.message}</div>
            `;
        }
    });

    document.querySelector('a[href="#articles-tab"]').addEventListener('shown.bs.tab', async function() {
        try {
            const articles = await fetchArticles();
            displayArticles(articles);
        } catch (error) {
            document.getElementById('articles-list').innerHTML = `
                <div class="alert alert-danger">Error loading articles: ${error.message}</div>
            `;
        }
    });

    try {
        allRepositories = await fetchRepositories();
        displayRepositories();
    } catch (error) {
        document.getElementById('repo-list').innerHTML = `
            <div class="alert alert-danger">Error loading repositories: ${error.message}</div>
        `;
    }
});