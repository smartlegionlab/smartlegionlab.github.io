class PyPIManager {
    constructor() {
        this.allPackages = [];
        this.hasLoaded = false;
        this.isLoading = false;
        this.visiblePackages = 6;
    }

    async fetchAllPackages() {
        console.log('📡 Fetching PyPI packages from local file...');

        try {
            const response = await fetch('/data/pypi.json');
            
            if (!response.ok) {
                throw new Error(`Failed to load pypi.json: ${response.status} ${response.statusText}`);
            }

            const packages = await response.json();
            console.log(`✅ Successfully loaded ${packages.length} packages from file`);
            
            return packages;

        } catch (error) {
            console.error('❌ Error loading PyPI packages:', error);
            throw error;
        }
    }

    loadMorePackages() {
        this.visiblePackages += 6;

        const container = document.getElementById('pypi-list');
        const grid = container.querySelector('.repo-grid');

        const validPackages = this.allPackages.filter(pkg => !pkg.error);
        const newPackages = validPackages.slice(this.visiblePackages - 6, this.visiblePackages);

        newPackages.forEach((pkg, index) => {
            const card = this.createPackageCard(pkg);

            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease';

            grid.appendChild(card);

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });

        this.updatePackagesFooter();
    }

    updatePackagesFooter() {
        const container = document.getElementById('pypi-list');
        const oldFooter = container.querySelector('.d-flex.flex-column');
        if (oldFooter) oldFooter.remove();

        const validPackages = this.allPackages.filter(pkg => !pkg.error);
        const hasMorePackages = this.visiblePackages < validPackages.length;

        const footer = document.createElement('div');
        footer.className = 'd-flex flex-column align-items-center gap-3 mt-4';
        footer.style.width = '100%';

        if (window.innerWidth <= 768) {
            footer.style.padding = '0 15px';
        }

        footer.innerHTML = `
            <div class="text-muted small text-center w-100">
                Showing ${Math.min(this.visiblePackages, validPackages.length)} of ${validPackages.length} packages
            </div>
            ${hasMorePackages ? `
                <button class="btn btn-outline-primary" onclick="window.pypiManager.loadMorePackages()" style="min-width: 140px; width: 100%; max-width: 200px;">
                    <i class="bi bi-plus-circle"></i> Load More
                </button>
            ` : ''}
        `;

        container.appendChild(footer);
    }

    async loadPackages() {
        if (this.isLoading || this.hasLoaded) return;

        this.isLoading = true;
        console.log('🚀 Loading PyPI packages...');

        try {
            this.showLoadingState();

            console.log('📡 Fetching from local file...');
            const freshPackages = await this.fetchAllPackages();

            this.allPackages = freshPackages;
            this.displayPackages();
            this.hasLoaded = true;

            console.log('✅ PyPI packages loaded successfully');

        } catch (error) {
            console.error('❌ Error loading PyPI packages:', error);
            this.showErrorState(error);
        } finally {
            this.isLoading = false;
        }
    }

    displayPackages() {
        const container = document.getElementById('pypi-list');
        if (!container) return;

        container.innerHTML = '';

        const validPackages = this.allPackages.filter(pkg => !pkg.error);

        if (validPackages.length === 0) {
            container.innerHTML = '<div class="alert alert-info text-center mx-3">No PyPI packages found.</div>';
            return;
        }

        const packagesToShow = validPackages.slice(0, this.visiblePackages);

        const grid = document.createElement('div');
        grid.className = 'repo-grid';

        packagesToShow.forEach(pkg => {
            const card = this.createPackageCard(pkg);
            grid.appendChild(card);
        });

        container.appendChild(grid);

        const errorPackages = this.allPackages.filter(pkg => pkg.error);

        if (errorPackages.length > 0) {
            const warningSection = document.createElement('div');
            warningSection.className = 'col-12 mt-4';
            warningSection.innerHTML = `
                <div class="alert alert-warning">
                    <h5><i class="bi bi-exclamation-triangle"></i> Packages Not Found</h5>
                    <p class="mb-2">The following packages had errors:</p>
                    <ul class="mb-0">
                        ${errorPackages.map(pkg => `<li><code>${pkg.name}</code> - ${pkg.error}</li>`).join('')}
                    </ul>
                </div>
            `;
            container.appendChild(warningSection);
        }

        this.updatePackagesFooter();

        setTimeout(() => {
            const cards = container.querySelectorAll('.repo-card');
            cards.forEach((card, index) => {
                card.classList.add('fade-in-up', 'stagger-delay', 'visible');
                card.style.animationDelay = `${index * 0.1}s`;
            });
        }, 50);
    }

    createPackageCard(pkg) {
        const card = document.createElement('div');
        card.className = 'repo-card';
        card.innerHTML = `
            <div class="repo-header">
                <div class="repo-title-section" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <a href="${pkg.project_url || `https://pypi.org/project/${pkg.name}/`}" target="_blank" class="repo-title">
                        ${pkg.name}
                    </a>
                    <span class="repo-badge" style="background: rgba(13, 110, 253, 0.1); border: 1px solid var(--accent); color: var(--accent);">v${pkg.version || '?'}</span>
                </div>
            </div>

            <p class="repo-description">${pkg.summary || pkg.description || 'No description available'}</p>

            <div class="citation-tabs-container mt-3">
                <div class="citation-format text-center" style="position: relative;">
                    <p class="citation-text">pip install ${pkg.name}</p>
                </div>
            </div>

            <div class="repo-footer" style="display: flex; justify-content: flex-end; width: 100%;">
                <a href="${pkg.project_url || `https://pypi.org/project/${pkg.name}/`}" target="_blank" class="repo-action" title="View on PyPI">
                    <i class="bi bi-box-arrow-up-right"></i> View on PyPI
                </a>
            </div>
        `;

        return card;
    }

    showErrorState(error) {
        const container = document.getElementById('pypi-list');
        if (!container) return;

        container.innerHTML = `
            <div class="alert alert-danger">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <strong>❌ Error Loading PyPI Packages</strong>
                        <div class="small mt-1">${error.message || 'Failed to load packages from file'}</div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger ms-3" onclick="window.location.reload()">
                        <i class="bi bi-arrow-clockwise"></i> Reload
                    </button>
                </div>
            </div>
        `;
    }

    async forceRefresh() {
        if (this.isLoading) return;

        console.log('🔄 Manual PyPI refresh requested...');

        this.hasLoaded = false;
        this.visiblePackages = 6;

        const container = document.getElementById('pypi-list');
        if (container) {
            container.innerHTML = '';
        }

        await this.loadPackages();
    }

    showLoadingState() {
        const container = document.getElementById('pypi-list');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading PyPI packages...</span>
                </div>
                <p class="mt-3 text-muted">Loading PyPI packages...</p>
            </div>
        `;
    }
}