/**
 * StatsManager
 *
 * HOW TO USE:
 *
 * Add data-smart-key to any element
 *
 * <span data-smart-key="experience">10+</span>
 * <span data-smart-key="paradigms">4</span>
 * <span data-smart-key="paradigm.unique_views">1K+</span>
 * <span data-smart-key="paradigm.unique_downloads">896+</span>
 * <span data-smart-key="paradigm.total_views">1.5K+</span>
 * <span data-smart-key="pointerParadigm.unique_views">425</span>
 *
 * AVAILABLE KEYS:
 * - experience, paradigms, ecosystems, repos, pypi, projects, users, articles, monthly_downloads
 * - {recordKey}.unique_views, {recordKey}.unique_downloads
 * - {recordKey}.total_views, {recordKey}.total_downloads
 * - paradigm.unique_views, paradigm.unique_downloads (sum of all)
 * - paradigm.total_views, paradigm.total_downloads (sum of all)
 */

class StatsManager {
    constructor() {
        this.config = CONFIG;
        this.debug = CONFIG.DEBUG || false;
        this.data = null;
        this.init();
    }

    log(...args) {
        if (this.debug) console.log(...args);
    }

    warn(...args) {
        if (this.debug) console.warn(...args);
    }

    async init() {
        this.log('StatsManager init');
        this.data = this.getDefaultData();
        await this.loadAllData();
        this.updateAll();
        this.log('StatsManager ready', this.data);
    }

    getDefaultData() {
        const data = {
            experience: this.calcExperience(),
            paradigms: Object.keys(this.config.ZENODO_RECORDS).length,
            ecosystems: this.config.CONSTANTS.ECOSYSTEMS_COUNT,
            projects: this.config.CONSTANTS.PROJECTS_DELIVERED,
            articles: this.config.CONSTANTS.TECH_ARTICLES,
            users: this.config.CONSTANTS.USERS_SUPPORTED,
            repos: this.config.DEFAULTS.REPOS_COUNT,
            pypi: this.config.DEFAULTS.PYPI_PACKAGES_COUNT,
            monthly_downloads: this.config.DEFAULTS.MONTHLY_DOWNLOADS,
            paradigm: {
                unique_views: 0,
                unique_downloads: 0,
                total_views: 0,
                total_downloads: 0
            }
        };

        for (const key in this.config.ZENODO_RECORDS) {
            data[key] = {
                unique_views: 0,
                unique_downloads: 0,
                total_views: 0,
                total_downloads: 0
            };
        }

        for (const key in this.config.DEFAULTS.RESEARCH_STATS) {
            if (data[key]) {
                data[key] = this.config.DEFAULTS.RESEARCH_STATS[key];
                data.paradigm.unique_views += data[key].unique_views;
                data.paradigm.unique_downloads += data[key].unique_downloads;
                data.paradigm.total_views += data[key].total_views;
                data.paradigm.total_downloads += data[key].total_downloads;
            }
        }

        this.log('  📋 DEFAULT DATA (from CONFIG):');
        this.log(`     experience: ${data.experience} (from CAREER_START_YEAR)`);
        this.log(`     paradigms: ${data.paradigms} (from ZENODO_RECORDS count)`);
        this.log(`     ecosystems: ${data.ecosystems} (from CONSTANTS)`);
        this.log(`     projects: ${data.projects} (from CONSTANTS)`);
        this.log(`     articles: ${data.articles} (from CONSTANTS)`);
        this.log(`     users: ${data.users} (from CONSTANTS)`);
        this.log(`     repos: ${data.repos} (from DEFAULTS)`);
        this.log(`     pypi: ${data.pypi} (from DEFAULTS)`);
        this.log(`     monthly_downloads: ${data.monthly_downloads} (from DEFAULTS)`);
        this.log(`     paradigm.unique_views: ${data.paradigm.unique_views} (sum from RESEARCH_STATS)`);
        this.log(`     paradigm.unique_downloads: ${data.paradigm.unique_downloads} (sum from RESEARCH_STATS)`);
        this.log(`     paradigm.total_views: ${data.paradigm.total_views} (sum from RESEARCH_STATS)`);
        this.log(`     paradigm.total_downloads: ${data.paradigm.total_downloads} (sum from RESEARCH_STATS)`);

        for (const key in this.config.ZENODO_RECORDS) {
            if (data[key]) {
                this.log(`     ${key}.unique_views: ${data[key].unique_views} (from RESEARCH_STATS)`);
                this.log(`     ${key}.unique_downloads: ${data[key].unique_downloads} (from RESEARCH_STATS)`);
                this.log(`     ${key}.total_views: ${data[key].total_views} (from RESEARCH_STATS)`);
                this.log(`     ${key}.total_downloads: ${data[key].total_downloads} (from RESEARCH_STATS)`);
            }
        }

        return data;
    }

    calcExperience() {
        const start = this.config.PROFILE.CAREER_START_YEAR;
        const now = new Date().getFullYear();
        let years = now - start;
        const month = new Date().getMonth();
        if (month < 5) years -= 1;
        return Math.max(years, 1);
    }

    async loadAllData() {
        this.log('  🔄 LOADING REAL DATA FROM FILES:');
        await Promise.allSettled([
            this.loadRepos(),
            this.loadPyPI(),
            this.loadZenodo()
        ]);
    }

    async loadRepos() {
        try {
            const res = await fetch('/data/repos.json');
            if (!res.ok) throw new Error();
            const repos = await res.json();
            const valid = repos.filter(r => !r.archived && !this.config.EXCLUDED_REPOSITORIES.includes(r.name));
            const old = this.data.repos;
            this.data.repos = valid.length;
            this.log(`     repos: ${old} (DEFAULT) → ${this.data.repos} (FROM repos.json)`);
        } catch(e) {
            this.warn(`     repos failed, using default: ${this.data.repos}`);
        }
    }

    async loadPyPI() {
        try {
            const res = await fetch('/data/pypi.json');
            if (!res.ok) throw new Error();
            const pkgs = await res.json();
            const valid = pkgs.filter(p => !p.error);
            const old = this.data.pypi;
            if (valid.length > 0) this.data.pypi = valid.length;
            this.log(`     pypi: ${old} (DEFAULT) → ${this.data.pypi} (FROM pypi.json)`);
        } catch(e) {
            this.warn(`     pypi failed, using default: ${this.data.pypi}`);
        }
    }

    async loadZenodo() {
        try {
            const res = await fetch('/data/zenodo.json');
            if (!res.ok) throw new Error();
            const zenodo = await res.json();

            let uniqueViews = 0, uniqueDownloads = 0;
            let totalViews = 0, totalDownloads = 0;

            for (const key in this.config.ZENODO_RECORDS) {
                if (zenodo[key]) {
                    const old = this.data[key];
                    this.data[key] = zenodo[key];
                    uniqueViews += zenodo[key].unique_views || 0;
                    uniqueDownloads += zenodo[key].unique_downloads || 0;
                    totalViews += zenodo[key].total_views || 0;
                    totalDownloads += zenodo[key].total_downloads || 0;
                    this.log(`     ${key}: unique_views ${old?.unique_views} (DEFAULT) → ${zenodo[key].unique_views} (FROM zenodo.json)`);
                    this.log(`     ${key}: unique_downloads ${old?.unique_downloads} (DEFAULT) → ${zenodo[key].unique_downloads} (FROM zenodo.json)`);
                    this.log(`     ${key}: total_views ${old?.total_views} (DEFAULT) → ${zenodo[key].total_views} (FROM zenodo.json)`);
                    this.log(`     ${key}: total_downloads ${old?.total_downloads} (DEFAULT) → ${zenodo[key].total_downloads} (FROM zenodo.json)`);
                }
            }

            const oldUniqueViews = this.data.paradigm.unique_views;
            const oldUniqueDownloads = this.data.paradigm.unique_downloads;
            const oldTotalViews = this.data.paradigm.total_views;
            const oldTotalDownloads = this.data.paradigm.total_downloads;

            if (uniqueViews > 0) {
                this.data.paradigm.unique_views = uniqueViews;
                this.data.paradigm.unique_downloads = uniqueDownloads;
                this.data.paradigm.total_views = totalViews;
                this.data.paradigm.total_downloads = totalDownloads;
            }

            this.log(`     paradigm.unique_views: ${oldUniqueViews} (DEFAULT) → ${this.data.paradigm.unique_views} (FROM zenodo.json)`);
            this.log(`     paradigm.unique_downloads: ${oldUniqueDownloads} (DEFAULT) → ${this.data.paradigm.unique_downloads} (FROM zenodo.json)`);
            this.log(`     paradigm.total_views: ${oldTotalViews} (DEFAULT) → ${this.data.paradigm.total_views} (FROM zenodo.json)`);
            this.log(`     paradigm.total_downloads: ${oldTotalDownloads} (DEFAULT) → ${this.data.paradigm.total_downloads} (FROM zenodo.json)`);
        } catch(e) {
            this.warn(`     zenodo failed, using defaults`);
        }
    }

    updateAll() {
        this.log('  🎨 UPDATING DOM:');

        const flatKeys = ['experience', 'paradigms', 'ecosystems', 'repos', 'pypi', 'projects', 'users', 'articles', 'monthly_downloads'];

        flatKeys.forEach(key => {
            let val = this.data[key];
            if (val === undefined) return;
            let display = (key === 'users') ? val : val + '+';
            if (key === 'monthly_downloads') display = this.formatNumberRound(val) + 'K+';
            document.querySelectorAll(`[data-smart-key="${key}"]`).forEach(el => {
                if (el.textContent !== display) {
                    this.log(`     ${key}: ${el.textContent} → ${display}`);
                    el.textContent = display;
                }
            });
        });

        const updateNested = (obj, prefix = '') => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    updateNested(obj[key], prefix ? `${prefix}.${key}` : key);
                } else {
                    const fullKey = prefix ? `${prefix}.${key}` : key;
                    let val = obj[key];
                    if (val === undefined) return;

                    let display = val;
                    if (fullKey.includes('views') || fullKey.includes('downloads')) {
                        display = this.formatNumberRound(val);
                        if (fullKey.startsWith('paradigm.')) display += '+';
                    } else if (fullKey !== 'users') {
                        display = val + '+';
                    }

                    document.querySelectorAll(`[data-smart-key="${fullKey}"]`).forEach(el => {
                        if (el.textContent !== display) {
                            this.log(`     ${fullKey}: ${el.textContent} → ${display}`);
                            el.textContent = display;
                        }
                    });
                }
            }
        };

        updateNested(this.data);
        this.log('  ✅ DOM updated');
    }

    formatNumberRound(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatNum(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return num.toString();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.statsManager = new StatsManager();
});