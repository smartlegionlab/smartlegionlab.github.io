const GITHUB_USERNAME = 'smartlegionlab';
const DEVTO_USERNAME = GITHUB_USERNAME;

const RESEARCH_STATS = {
    pointerParadigm: {
        views: 131,
        downloads: 126
    },
    localDataParadigm: {
        views: 51,
        downloads: 47
    }
};

const TOTAL_DOWNLOADS = RESEARCH_STATS.pointerParadigm.downloads + RESEARCH_STATS.localDataParadigm.downloads;

const EXCLUDED_REPOSITORIES = [
    'smartlegionlab.github.io',
    'smartlegionlab',
];

class ParticleBackground {
    constructor() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                        window.innerWidth <= 768;

        if (isMobile) {
            this.isMobile = true;
            return;
        }

        if (window.particleBackgroundInstance) {
            return window.particleBackgroundInstance;
        }

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particlesArray = [];
        this.animationId = null;
        this.isPaused = false;
        this.isMobile = false;
        this.particleColor = '13, 110, 253';
        this.lineColor = '255, 255, 255';

        window.particleBackgroundInstance = this;

        this.init();
    }

    init() {
        if (this.isMobile) {
            return;
        }

        const oldCanvas = document.getElementById('particle-canvas');
        if (oldCanvas) {
            oldCanvas.remove();
        }

        this.canvas.id = 'particle-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        document.body.prepend(this.canvas);

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        this.handleResize();
        this.createParticles();
        this.startAnimation();
        this.setupEventListeners();
    }

    getParticleCount() {
        if (this.isMobile) return 0;
        if (window.innerWidth < 1024) return 60;
        return 100;
    }

    handleResize() {
        if (this.isMobile || !this.canvas) return;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
    }

    createParticles() {
        if (this.isMobile) return;

        this.particlesArray = [];
        const count = this.getParticleCount();

        for (let i = 0; i < count; i++) {
            this.particlesArray.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 1.5 + 0.5
            });
        }
    }

    updateParticles() {
        if (this.isMobile) return;

        for (let particle of this.particlesArray) {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x > this.canvas.width) particle.x = 0;
            else if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = 0;
            else if (particle.y < 0) particle.y = this.canvas.height;
        }
    }

    drawParticles() {
        if (this.isMobile || !this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = `rgba(${this.particleColor}, 0.8)`;
        for (let particle of this.particlesArray) {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.drawConnections();
    }

    drawConnections() {
        if (this.isMobile) return;

        for (let i = 0; i < this.particlesArray.length; i++) {
            for (let j = i + 1; j < this.particlesArray.length; j++) {
                const dx = this.particlesArray[i].x - this.particlesArray[j].x;
                const dy = this.particlesArray[i].y - this.particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const opacity = 1 - (distance / 100);
                    this.ctx.strokeStyle = `rgba(${this.lineColor}, ${opacity * 0.3})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particlesArray[i].x, this.particlesArray[i].y);
                    this.ctx.lineTo(this.particlesArray[j].x, this.particlesArray[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        if (this.isPaused || this.isMobile) return;

        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        if (this.isMobile) return;

        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animate();
    }

    stopAnimation() {
        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    setupEventListeners() {
        if (this.isMobile) return;

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 250);
        });

        document.addEventListener('visibilitychange', () => {
            this.isPaused = document.hidden;
            if (!this.isPaused && !this.isMobile) {
                this.startAnimation();
            }
        });

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.stopAnimation();
        }
    }

    destroy() {
        this.stopAnimation();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.particleBackgroundInstance = null;
    }
}

class VerticalProgressNav {
    constructor() {
        this.sections = [];
        this.progressFill = null;
        this.markers = [];
        this.scrollOffset = 80;
        this.init();
    }

    init() {
        this.createProgressBar();
        this.setupSections();
        this.setupEventListeners();
        this.updateAll();
    }

    createProgressBar() {
        const nav = document.createElement('div');
        nav.className = 'vertical-progress-nav';

        const track = document.createElement('div');
        track.className = 'progress-track';

        this.progressFill = document.createElement('div');
        this.progressFill.className = 'progress-fill';

        track.appendChild(this.progressFill);
        nav.appendChild(track);

        const sections = ['hero', 'about', 'research', 'repositories', 'expertise', 'contact'];
        const labels = ['Home', 'About', 'Research', 'Repositories', 'Expertise', 'Contact'];

        sections.forEach((sectionId, index) => {
            const marker = document.createElement('div');
            marker.className = 'progress-marker';
            marker.dataset.section = sectionId;
            marker.dataset.tooltip = labels[index];
            marker.dataset.index = index;

            marker.addEventListener('click', () => {
                this.scrollToSection(sectionId);
            });

            track.appendChild(marker);
            this.markers.push(marker);
        });

        document.body.appendChild(nav);
    }

    setupSections() {
        this.sections = [
            'hero', 'about', 'research', 'repositories', 'expertise', 'contact'
        ].map(id => document.getElementById(id)).filter(Boolean);
    }

    setupEventListeners() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateAll();
            }, 16);
        });

        window.addEventListener('resize', () => {
            setTimeout(() => this.updateAll(), 100);
        });
    }

    updateAll() {
        this.updateProgress();
        this.updateMarkers();
    }

    updateProgress() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const totalScrollable = documentHeight - windowHeight;

        const progress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;

        if (this.progressFill) {
            this.progressFill.style.height = Math.min(Math.max(progress, 0), 100) + '%';
        }
    }

    updateMarkers() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const totalScrollable = documentHeight - windowHeight;

        const isAtBottom = scrollTop + windowHeight >= documentHeight - 50;

        let activeSection = '';

        if (isAtBottom) {
            activeSection = this.sections[this.sections.length - 1].id;
        } else {
            for (let i = 0; i < this.sections.length; i++) {
                const section = this.sections[i];
                const sectionTop = section.offsetTop - this.scrollOffset;

                if (scrollTop >= sectionTop && scrollTop < sectionTop + section.offsetHeight) {
                    activeSection = section.id;
                    break;
                }
            }

            if (!activeSection && this.sections.length > 0) {
                activeSection = this.sections[0].id;
            }
        }

        this.markers.forEach(marker => {
            const sectionId = marker.dataset.section;
            const section = document.getElementById(sectionId);

            if (!section) return;

            const sectionTop = section.offsetTop - this.scrollOffset;
            const sectionProgress = totalScrollable > 0 ? (Math.max(sectionTop, 0) / totalScrollable) * 100 : 0;
            const currentProgress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;

            const nav = document.querySelector('.vertical-progress-nav');
            const navHeight = nav.offsetHeight;
            const markerPosition = (sectionProgress / 100) * navHeight;
            marker.style.top = Math.max(8, Math.min(markerPosition, navHeight - 8)) + 'px';

            marker.classList.remove('active', 'filled');

            if (sectionId === activeSection) {
                marker.classList.add('active');
            }

            if (currentProgress >= sectionProgress) {
                marker.classList.add('filled');
            }
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - this.scrollOffset;
            window.scrollTo({
                top: Math.max(offsetTop, 0),
                behavior: 'smooth'
            });
        }
    }
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOut(progress);
        const current = Math.floor(start + (end - start) * eased);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end + '+';
        }
    }

    requestAnimationFrame(update);
}

function initCounters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                const value = parseInt(text);
                if (!isNaN(value)) {
                    animateValue(element, 0, value, 1500);
                }
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.stat-number, .stats-number, .metric-number').forEach(el => {
        observer.observe(el);
    });
}

function updateResearchStats() {
    const headerStats = document.querySelectorAll('.stats-row .stat:first-child .stat-number');
    if (headerStats.length > 0) {
        headerStats[0].textContent = TOTAL_DOWNLOADS;
    }

    const metricElement = document.getElementById('total-downloads-metric');
    if (metricElement) {
        metricElement.textContent = TOTAL_DOWNLOADS;
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

function initScrollFeatures() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const scrollProgress = document.querySelector('.scroll-progress-bar');

    new VerticalProgressNav();

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
        if (scrollProgress) {
            scrollProgress.style.width = progress + '%';
        }
    }

    window.addEventListener('scroll', () => {
        toggleScrollToTop();
        updateScrollProgress();
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    toggleScrollToTop();
    updateScrollProgress();
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

let allRepositories = [];
let visibleRepos = 6;

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

function loadMoreRepos() {
    visibleRepos += 6;
    displayRepositories();
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

    const reposToShow = filteredRepos.slice(0, visibleRepos);
    const hasMoreRepos = visibleRepos < filteredRepos.length;

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

    const footer = document.createElement('div');
    footer.className = 'd-flex flex-column align-items-center gap-3 mt-4';

    footer.innerHTML = `
        <div class="text-muted small">
            Showing ${reposToShow.length} of ${filteredRepos.length} repositories
        </div>
        ${hasMoreRepos ? `
            <button class="btn btn-outline-primary" onclick="loadMoreRepos()">
                <i class="bi bi-plus-circle"></i> Load More
            </button>
        ` : ''}
    `;

    container.appendChild(footer);
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

function initScrollAnimations() {
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

document.addEventListener('DOMContentLoaded', async function() {
    const particleBg = new ParticleBackground();

    window.addEventListener('beforeunload', () => {
        particleBg.destroy();
    });

    updateResearchStats();
    initScrollFeatures();
    initCounters();
    initScrollAnimations();


    document.querySelector('a[href="#repos-tab"]').addEventListener('shown.bs.tab', async function() {
        try {
            if (allRepositories.length === 0) {
                allRepositories = await fetchRepositories();
            }
            visibleRepos = 6;
            displayRepositories();
        } catch (error) {
            document.getElementById('repo-list').innerHTML = `
                <div class="alert alert-danger">Error loading repositories: ${error.message}</div>
            `;
        }
    });

    let allArticles = [];

    document.querySelector('a[href="#articles-tab"]').addEventListener('shown.bs.tab', async function() {
        try {
            if (allArticles.length === 0) {
                allArticles = await fetchArticles();
            }
            displayArticles(allArticles);
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

class CitationManager {
    constructor() {
        this.papers = {
            'pointer-paradigm': {
                author: 'Suvorov, Alexander',
                title: 'The Pointer-Based Security Paradigm: Architectural Shift from Data Protection to Data Non-Existence',
                month: 'sep',
                year: '2025',
                publisher: 'Zenodo',
                doi: '10.5281/zenodo.17204738',
                url: 'https://doi.org/10.5281/zenodo.17204738'
            },
            'localdata-paradigm': {
                author: 'Suvorov, Alexander',
                title: 'The Local Data Regeneration Paradigm: Ontological Shift from Data Transmission to Synchronous State Discovery',
                month: 'oct',
                year: '2025',
                publisher: 'Zenodo',
                doi: '10.5281/zenodo.17264327',
                url: 'https://doi.org/10.5281/zenodo.17264327'
            }
        };
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.citation-btn')) {
                const button = e.target.closest('.citation-btn');
                const paperId = button.dataset.doi;
                this.showCitationModal(paperId);
            }

            if (e.target.closest('.copy-btn')) {
                this.copyToClipboard(e.target.closest('.copy-btn'));
            }
        });
    }

    generateBibTeX(paper) {
        const citeKey = paper.doi.replace(/[^a-zA-Z0-9]/g, '_');
        return `@misc{${citeKey},
  author       = {${paper.author}},
  title        = {${paper.title}},
  month        = ${paper.month},
  year         = ${paper.year},
  publisher    = {${paper.publisher}},
  doi          = {${paper.doi}},
  url          = {${paper.url}}
}`;
    }

    generateAPA(paper) {
    return `Suvorov, A. (${paper.year}). ${paper.title}. Zenodo. https://doi.org/${paper.doi}`;
}

generateMLA(paper) {
    const months = {
        'sep': 'September',
        'oct': 'October'
    };
    const day = paper.month === 'sep' ? '26' : '4';
    const month = months[paper.month];

    return `Suvorov, A. ${paper.title}. Zenodo, ${day} ${month} ${paper.year} г., https://doi.org/${paper.doi}.`;
}

    showCitationModal(paperId) {
        const paper = this.papers[paperId];
        if (!paper) return;

        const safeId = paperId.replace(/[^a-zA-Z0-9]/g, '-');

        const modalHTML = `
            <div class="modal fade" id="citationModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title text-light">
                                <i class="bi bi-quote me-2"></i>Cite Research
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <ul class="nav citation-tabs mb-3">
                                <li class="nav-item">
                                    <a class="nav-link active" data-bs-toggle="tab" href="#bibtex-${safeId}">BibTeX</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-bs-toggle="tab" href="#apa-${safeId}">APA</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-bs-toggle="tab" href="#mla-${safeId}">MLA</a>
                                </li>
                            </ul>

                            <div class="tab-content">
                                <div class="tab-pane fade show active" id="bibtex-${safeId}">
                                    <div class="citation-format">
                                        <button class="copy-btn" data-text="${this.generateBibTeX(paper).replace(/"/g, '&quot;')}">
                                            <i class="bi bi-clipboard"></i> Copy
                                        </button>
                                        <pre class="citation-text">${this.generateBibTeX(paper)}</pre>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="apa-${safeId}">
                                    <div class="citation-format">
                                        <button class="copy-btn" data-text="${this.generateAPA(paper).replace(/"/g, '&quot;')}">
                                            <i class="bi bi-clipboard"></i> Copy
                                        </button>
                                        <p class="citation-text">${this.generateAPA(paper)}</p>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="mla-${safeId}">
                                    <div class="citation-format">
                                        <button class="copy-btn" data-text="${this.generateMLA(paper).replace(/"/g, '&quot;')}">
                                            <i class="bi bi-clipboard"></i> Copy
                                        </button>
                                        <p class="citation-text">${this.generateMLA(paper)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const oldModal = document.getElementById('citationModal');
        if (oldModal) oldModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = new bootstrap.Modal(document.getElementById('citationModal'));
        modal.show();
    }

    async copyToClipboard(button) {
        const text = button.dataset.text;
        try {
            await navigator.clipboard.writeText(text);

            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="bi bi-check"></i> Copied!';
            button.style.background = '#198754';

            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = '';
            }, 2000);

        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CitationManager();
});