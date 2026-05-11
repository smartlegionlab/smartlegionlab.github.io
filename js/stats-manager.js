/**
 * StatsManager- automatic updating of all figures on the site
 *
 * ============================================================
 * HOW TO USE CLASSES
 * ============================================================
 *
 * 1. STAT BLOCKS (.smart-stat)
 * ------------------------------------------------------------
 * Use on homepage for metrics grid (8-12 items).
 *
 * <div class="smart-stat">
 *     <div class="smart-stat-number"></div>
 *     <div class="smart-stat-label">Years Experience</div>
 * </div>
 *
 * Available labels:
 * - Years Experience
 * - Paradigms
 * - Ecosystems
 * - Open Source Repos
 * - PyPI
 * - Projects Delivered
 * - Paradigm Views
 * - Paradigm Downloads
 * - Monthly Downloads
 * - Tech Articles
 * - Users Supported
 *
 *
 * 2. HEADER ELEMENTS (.smart-header-*)
 * ------------------------------------------------------------
 * Use in header, footer, navigation.
 *
 * <span class="smart-header-paradigms"></span>
 * <span class="smart-header-views"></span>
 * <span class="smart-header-downloads"></span>
 * <span class="smart-header-projects"></span>
 *
 *
 * 3. METRIC ELEMENTS (.smart-metric-*)
 * ------------------------------------------------------------
 * Use on Research, About, Skills pages.
 *
 * <span class="smart-metric-paradigms"></span>
 * <span class="smart-metric-views"></span>
 * <span class="smart-metric-downloads"></span>
 * <span class="smart-metric-projects"></span>
 * <span class="smart-metric-repos"></span>
 * <span class="smart-metric-pypi"></span>
 * <span class="smart-metric-ecosystems"></span>
 * <span class="smart-metric-experience"></span>
 * <span class="smart-metric-articles"></span>
 *
 *
 * 4. DATA ATTRIBUTE (data-smart-stat)
 * ------------------------------------------------------------
 * Universal way — works anywhere on any element.
 *
 * <span data-smart-stat="paradigm_views"></span>
 * <span data-smart-stat="paradigm_downloads"></span>
 * <span data-smart-stat="paradigms"></span>
 * <span data-smart-stat="ecosystems"></span>
 * <span data-smart-stat="repos"></span>
 * <span data-smart-stat="pypi"></span>
 * <span data-smart-stat="projects"></span>
 * <span data-smart-stat="experience"></span>
 * <span data-smart-stat="users_supported"></span>
 * <span data-smart-stat="tech_articles"></span>
 *
 * Available values:
 * - experience
 * - paradigms
 * - ecosystems
 * - repos
 * - pypi
 * - projects
 * - paradigm_views
 * - paradigm_downloads
 * - users_supported
 * - tech_articles
 *
 * ============================================================
 */

class StatsManager {
    constructor() {
        this.config = CONFIG;
        this.data = null;
        this.isLoaded = false;
        this.init();
    }

    async init() {
        console.log('📊 StatsManager initializing...');

        this.data = this.getDefaultData();

        await this.loadAllData();

        this.updateAllStats();

        this.isLoaded = true;
        console.log('📊 StatsManager ready!', this.data);
    }

    getDefaultData() {
        let defaultViews = 0;
        let defaultDownloads = 0;
        for (const key in this.config.DEFAULTS.RESEARCH_STATS) {
            defaultViews += this.config.DEFAULTS.RESEARCH_STATS[key].unique_views;
            defaultDownloads += this.config.DEFAULTS.RESEARCH_STATS[key].unique_downloads;
        }

        return {
            experience: this.calculateExperience(),

            paradigms: this.config.CONSTANTS.PARADIGMS_COUNT,
            ecosystems: this.config.CONSTANTS.ECOSYSTEMS_COUNT,
            projectsDelivered: this.config.CONSTANTS.PROJECTS_DELIVERED,
            techArticles: this.config.CONSTANTS.TECH_ARTICLES,
            usersSupported: this.config.CONSTANTS.USERS_SUPPORTED,

            repos: this.config.DEFAULTS.REPOS_COUNT,
            pypiPackages: this.config.DEFAULTS.PYPI_PACKAGES_COUNT,
            monthlyDownloads: this.config.DEFAULTS.MONTHLY_DOWNLOADS,
            paradigmViews: defaultViews,
            paradigmDownloads: defaultDownloads
        };
    }

    calculateExperience() {
        const startYear = this.config.PROFILE.CAREER_START_YEAR;
        const currentYear = new Date().getFullYear();
        let years = currentYear - startYear;

        const currentMonth = new Date().getMonth();
        if (currentMonth < 5) years -= 1;

        return Math.max(years, 1);
    }

    async loadAllData() {
        const results = await Promise.allSettled([
            this.loadReposData(),
            this.loadPyPIData(),
            this.loadZenodoData()
        ]);

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`⚠️ Source ${index} failed, using defaults`);
            }
        });
    }

    async loadReposData() {
        try {
            const response = await fetch('/data/repos.json');
            if (!response.ok) throw new Error('HTTP error');

            const repos = await response.json();
            const validRepos = repos.filter(r =>
                !r.archived &&
                !this.config.EXCLUDED_REPOSITORIES.includes(r.name)
            );

            this.data.repos = validRepos.length;
            console.log(`  ✅ Repos loaded: ${this.data.repos}`);
        } catch (error) {
            console.warn(`  ⚠️ Repos load failed, using default: ${this.data.repos}`);
        }
    }

    async loadPyPIData() {
        try {
            const response = await fetch('/data/pypi.json');
            if (!response.ok) throw new Error('HTTP error');

            const packages = await response.json();
            const validPackages = packages.filter(p => !p.error);
            const actualCount = validPackages.length;

            if (actualCount > 0) {
                this.data.pypiPackages = actualCount;
            }
            console.log(`  ✅ PyPI loaded: ${this.data.pypiPackages}`);
        } catch (error) {
            console.warn(`  ⚠️ PyPI load failed, using default: ${this.data.pypiPackages}`);
        }
    }

    async loadZenodoData() {
        try {
            const response = await fetch('/data/zenodo.json');
            if (!response.ok) throw new Error('HTTP error');

            const zenodo = await response.json();

            let totalViews = 0;
            let totalDownloads = 0;

            for (const key in this.config.ZENODO_RECORDS) {
                const recordKey = this.getZenodoKeyMapping(key);
                if (zenodo[recordKey]) {
                    totalViews += zenodo[recordKey].unique_views || 0;
                    totalDownloads += zenodo[recordKey].unique_downloads || 0;
                }
            }

            if (totalViews > 0) {
                this.data.paradigmViews = totalViews;
                this.data.paradigmDownloads = totalDownloads;
            }
            console.log(`  ✅ Zenodo loaded: ${totalViews} views, ${totalDownloads} downloads`);
        } catch (error) {
            console.warn(`  ⚠️ Zenodo load failed, using defaults: ${this.data.paradigmViews} views, ${this.data.paradigmDownloads} downloads`);
        }
    }

    getZenodoKeyMapping(configKey) {
        const map = {
            'POINTER_PARADIGM': 'pointerParadigm',
            'LOCAL_DATA_PARADIGM': 'localDataParadigm',
            'DETERMINISTIC_ENGINE': 'deterministicEngine',
            'PCH_PARADIGM': 'pchParadigm'
        };
        return map[configKey] || configKey.toLowerCase();
    }

    updateAllStats() {
        this.updateStatBlocks();
        this.updateHeaderElements();
        this.updateMetricElements();
        this.updateDataStatElements();
    }

    updateStatBlocks() {
        const blocks = document.querySelectorAll('.smart-stat');

        blocks.forEach(block => {
            const labelEl = block.querySelector('.smart-stat-label');
            const valueEl = block.querySelector('.smart-stat-number');

            if (!labelEl || !valueEl) return;

            const label = labelEl.textContent.trim();
            let value = this.getStatValueByLabel(label);

            if (value !== undefined) {
                let displayValue = value;

                if (label === 'Paradigm Views' || label === 'Paradigm Downloads') {
                    displayValue = this.formatNumber(value) + '+';
                } else if (label === 'Monthly Downloads') {
                    displayValue = value + 'K+';
                } else if (['PyPI', 'Open Source Repos', 'Years Experience'].includes(label)) {
                    displayValue = value + '+';
                } else if (label === 'Users Supported') {
                    displayValue = value;
                }

                valueEl.textContent = displayValue;
            }
        });
    }

    updateHeaderElements() {
        document.querySelectorAll('.smart-header-paradigms').forEach(el => {
            el.textContent = this.data.paradigms;
        });

        document.querySelectorAll('.smart-header-views').forEach(el => {
            el.textContent = this.formatNumber(this.data.paradigmViews) + '+';
        });

        document.querySelectorAll('.smart-header-downloads').forEach(el => {
            el.textContent = this.formatNumber(this.data.paradigmDownloads) + '+';
        });

        document.querySelectorAll('.smart-header-projects').forEach(el => {
            el.textContent = this.data.projectsDelivered;
        });
    }

    updateMetricElements() {
        const metrics = {
            'smart-metric-paradigms': this.data.paradigms,
            'smart-metric-views': this.formatNumber(this.data.paradigmViews) + '+',
            'smart-metric-downloads': this.formatNumber(this.data.paradigmDownloads) + '+',
            'smart-metric-projects': this.data.projectsDelivered,
            'smart-metric-repos': this.data.repos,
            'smart-metric-pypi': this.data.pypiPackages,
            'smart-metric-ecosystems': this.data.ecosystems,
            'smart-metric-experience': this.data.experience + '+',
            'smart-metric-articles': this.data.techArticles
        };

        for (const [className, value] of Object.entries(metrics)) {
            document.querySelectorAll(`.${className}`).forEach(el => {
                el.textContent = value;
            });
        }
    }

    updateDataStatElements() {
        const statsMap = {
            'experience': this.data.experience,
            'paradigms': this.data.paradigms,
            'ecosystems': this.data.ecosystems,
            'repos': this.data.repos,
            'pypi': this.data.pypiPackages,
            'projects': this.data.projectsDelivered,
            'paradigm_views': this.formatNumber(this.data.paradigmViews) + '+',
            'paradigm_downloads': this.formatNumber(this.data.paradigmDownloads) + '+',
            'users_supported': this.data.usersSupported,
            'tech_articles': this.data.techArticles
        };

        for (const [statName, value] of Object.entries(statsMap)) {
            document.querySelectorAll(`[data-smart-stat="${statName}"]`).forEach(el => {
                el.textContent = value;
            });
        }
    }

    getStatValueByLabel(label) {
        const map = {
            'Years Experience': this.data.experience,
            'Paradigms': this.data.paradigms,
            'Ecosystems': this.data.ecosystems,
            'Open Source Repos': this.data.repos,
            'PyPI': this.data.pypiPackages,
            'Projects Delivered': this.data.projectsDelivered,
            'Paradigm Views': this.data.paradigmViews,
            'Paradigm Downloads': this.data.paradigmDownloads,
            'Monthly Downloads': this.data.monthlyDownloads,
            'Tech Articles': this.data.techArticles,
            'Users Supported': this.data.usersSupported
        };
        return map[label];
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return num.toString();
    }

    getData() {
        return { ...this.data };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.statsManager = new StatsManager();
});