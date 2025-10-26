class PyPIManager {
    constructor() {
        this.allPackages = [];
        this.hasLoaded = false;
        this.isLoading = false;
        this.usedCache = false;
        this.visiblePackages = 6;
    }

    async fetchPackageInfo(packageName) {
        console.log(`📡 Fetching PyPI package: ${packageName}`);

        try {
            const response = await fetch(`https://pypi.org/pypi/${packageName}/json`);

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`⚠️ Package not found: ${packageName}`);
                    return this.createNotFoundPackage(packageName);
                }
                throw new Error(`PyPI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Successfully fetched ${packageName}`);

            return this.transformPackageData(data);

        } catch (error) {
            console.error(`❌ Error fetching package ${packageName}:`, error);
            return this.createErrorPackage(packageName, error);
        }
    }

    transformPackageData(packageData) {
        const info = packageData.info;
        const releases = packageData.releases;

        const versions = Object.keys(releases).sort((a, b) => {
            const dateA = releases[a]?.[0]?.upload_time || '1970-01-01';
            const dateB = releases[b]?.[0]?.upload_time || '1970-01-01';
            return new Date(dateB) - new Date(dateA);
        });
        const latestVersion = versions[0] || info.version || '0.0.0';

        const lastUpdated = releases[latestVersion]?.[0]?.upload_time ?
            new Date(releases[latestVersion][0].upload_time) : null;

        return {
            name: info.name,
            version: latestVersion,
            description: info.description || 'No description provided',
            summary: info.summary || (info.description ? info.description.split('.')[0] : 'No summary available'),
            license: info.license || 'Not specified',
            home_page: info.home_page || info.project_urls?.Homepage || '',
            project_url: info.project_url || `https://pypi.org/project/${info.name}/`,
            last_updated: lastUpdated,
            classifiers: info.classifiers || [],
            requires_python: info.requires_python || '',
            keywords: info.keywords ? info.keywords.split(/\s*,\s*/) : [],
            bugtrack_url: info.bugtrack_url || '',
            docs_url: info.project_urls?.Documentation || '',
            repo_url: info.project_urls?.Source || info.project_urls?.Repository || '',
            is_valid: true
        };
    }

    createNotFoundPackage(packageName) {
        return {
            name: packageName,
            version: '0.0.0',
            description: 'Package not found on PyPI',
            summary: 'Package not available',
            license: 'Not specified',
            project_url: `https://pypi.org/project/${packageName}/`,
            last_updated: null,
            is_valid: false,
            not_found: true
        };
    }

    createErrorPackage(packageName, error) {
        return {
            name: packageName,
            version: '0.0.0',
            description: `Error loading package: ${error.message}`,
            summary: 'Failed to load package info',
            license: 'Not specified',
            project_url: `https://pypi.org/project/${packageName}/`,
            last_updated: null,
            is_valid: false,
            error: true
        };
    }

    async fetchAllPackages() {
        console.log('📡 Fetching all PyPI packages...');

        try {
            const packages = await Promise.all(
                CONFIG.PYPI_PACKAGES.map(packageName =>
                    this.fetchPackageInfo(packageName)
                )
            );

            const sortedPackages = packages.sort((a, b) => {
                if (a.is_valid && !b.is_valid) return -1;
                if (!a.is_valid && b.is_valid) return 1;
                return 0;
            });

            console.log(`✅ Successfully fetched ${packages.filter(p => p.is_valid).length} valid packages`);
            return sortedPackages;

        } catch (error) {
            console.error('❌ Error fetching PyPI packages:', error);
            throw error;
        }
    }

    loadMorePackages() {
        this.visiblePackages += 6;

        const container = document.getElementById('pypi-list');
        const grid = container.querySelector('.repo-grid');

        const validPackages = this.allPackages.filter(pkg => pkg.is_valid && !pkg.not_found);
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

        const validPackages = this.allPackages.filter(pkg => pkg.is_valid && !pkg.not_found);
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

            const freshCache = PyPICache.getCachedPackages();
            if (freshCache && freshCache.length > 0) {
                console.log('📦 Using fresh PyPI cache - NO API CALL');

                this.allPackages = this.validateCachedPackages(freshCache);
                this.displayPackages();
                this.hasLoaded = true;
                this.usedCache = true;
                console.log('✅ PyPI packages loaded from cache successfully');
                return;
            }

            console.log('📡 No fresh PyPI cache available, fetching from PyPI API...');
            const freshPackages = await this.fetchAllPackages();

            this.allPackages = freshPackages;
            PyPICache.savePackages(freshPackages);
            this.displayPackages();
            this.hasLoaded = true;
            this.usedCache = false;
            console.log('✅ PyPI packages loaded from API successfully');

        } catch (error) {
            console.error('❌ Error loading PyPI packages:', error);

            const staleCache = PyPICache.getStalePackages();
            if (staleCache && staleCache.data && staleCache.data.length > 0) {
                console.log('🔄 Using stale PyPI cache as fallback');

                this.allPackages = this.validateCachedPackages(staleCache.data);
                this.displayPackages();
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

    validateCachedPackages(cachedPackages) {
        return cachedPackages.map(pkg => {
            if (!pkg.version) {
                pkg.version = '0.0.0';
            }

            return pkg;
        });
    }

    displayPackages() {
        const container = document.getElementById('pypi-list');
        if (!container) return;

        container.innerHTML = '';

        const validPackages = this.allPackages.filter(pkg =>
            pkg.is_valid && !pkg.not_found
        );

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

        const invalidPackages = this.allPackages.filter(pkg =>
            !pkg.is_valid || pkg.not_found
        );

        if (invalidPackages.length > 0) {
            const warningSection = document.createElement('div');
            warningSection.className = 'col-12 mt-4';
            warningSection.innerHTML = `
                <div class="alert alert-warning">
                    <h5><i class="bi bi-exclamation-triangle"></i> Packages Not Found</h5>
                    <p class="mb-2">The following packages were not found on PyPI:</p>
                    <ul class="mb-0">
                        ${invalidPackages.map(pkg => `<li><code>${pkg.name}</code></li>`).join('')}
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
                    <a href="${pkg.project_url}" target="_blank" class="repo-title">
                        ${pkg.name}
                    </a>
                    <span class="repo-badge" style="background: rgba(13, 110, 253, 0.1); border: 1px solid var(--accent); color: var(--accent);">v${pkg.version}</span>
                </div>
            </div>

            <p class="repo-description">${pkg.summary}</p>

            <div class="citation-tabs-container mt-3">
                <div class="citation-format text-center" style="position: relative;">
                    <p class="citation-text">pip install ${pkg.name}</p>
                </div>
            </div>

            <div class="repo-footer" style="display: flex; justify-content: flex-end; width: 100%;">
                <a href="${pkg.project_url}" target="_blank" class="repo-action" title="View on PyPI">
                    <i class="bi bi-box-arrow-up-right"></i> View on PyPI
                </a>
            </div>
        `;

        return card;
    }

    showCacheWarning(isExpired = false) {
        const container = document.getElementById('pypi-list');
        if (!container) return;

        const cacheAge = PyPICache.getCacheAge();
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
                    <strong>Showing Cached PyPI Data</strong>
                    <div class="small">${isExpired ? 'Data may be outdated' : 'Loaded from cache'}. Last updated ${timeText}.</div>
                </div>
                <button class="btn btn-sm btn-outline-warning ms-3" onclick="window.pypiManager.forceRefresh()">
                    <i class="bi bi-arrow-clockwise"></i> Refresh
                </button>
            </div>
        `;

        container.prepend(warning);
    }

    showErrorState(error) {
        const container = document.getElementById('pypi-list');
        if (!container) return;

        const errorType = this.analyzeError(error);
        const errorInfo = this.getErrorMessage(errorType);

        container.innerHTML = `
            <div class="alert alert-danger">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                        <strong>${errorInfo.title}</strong>
                        <div class="small mt-1">${errorInfo.message}</div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger ms-3" onclick="window.pypiManager.forceRefresh()">
                        <i class="bi bi-arrow-clockwise"></i> ${errorInfo.action}
                    </button>
                </div>
            </div>
        `;
    }

    analyzeError(error) {
        if (error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('Network request failed')) {
            return 'NETWORK_ERROR';
        } else if (error.message.includes('rate limit') || error.status === 429) {
            return 'RATE_LIMIT';
        } else if (error.status === 404) {
            return 'NOT_FOUND';
        } else if (error.status === 500 || error.status === 502 || error.status === 503) {
            return 'SERVER_ERROR';
        } else {
            return 'UNKNOWN_ERROR';
        }
    }

    getErrorMessage(errorType) {
        const messages = {
            NETWORK_ERROR: {
                title: '🔌 No Internet Connection',
                message: 'Please check your internet connection and try again.',
                action: 'Try Again'
            },
            RATE_LIMIT: {
                title: '⏳ PyPI API Rate Limit',
                message: 'PyPI API rate limit exceeded. Please try again later.',
                action: 'Try Again'
            },
            NOT_FOUND: {
                title: '📦 Packages Not Found',
                message: 'Some packages were not found on PyPI.',
                action: 'Try Again'
            },
            SERVER_ERROR: {
                title: '🚧 PyPI Server Error',
                message: 'PyPI servers are temporarily unavailable.',
                action: 'Try Again'
            },
            UNKNOWN_ERROR: {
                title: '❌ Unknown Error',
                message: 'An unexpected error occurred while loading PyPI packages.',
                action: 'Try Again'
            }
        };

        return messages[errorType] || messages.UNKNOWN_ERROR;
    }

    async forceRefresh() {
        if (this.isLoading) return;

        console.log('🔄 Manual PyPI refresh requested...');

        PyPICache.clearCache();
        this.hasLoaded = false;
        this.usedCache = false;
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