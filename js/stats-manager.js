/**
 * StatsManager
 *
 * Usage:
 *
 * Add data-smart-key to any element to display stats.
 *
 * Available keys:
 *   experience, paradigms, ecosystems, repos, pypi,
 *   projects, articles, applications, publications, libraries
 *
 * Nested keys:
 *   {recordKey}.unique_views, {recordKey}.unique_downloads
 *   {recordKey}.total_views, {recordKey}.total_downloads
 *   paradigm.unique_views, paradigm.unique_downloads (sum of all records)
 *   paradigm.total_views, paradigm.total_downloads (sum of all records)
 *
 * Performance:
 *   Data is loaded lazily based on page requirements.
 *   Only needed JSON files (repos.json, zenodo.json)
 *   are fetched when corresponding data-smart-key elements exist.
 *
 * Example:
 *   <span data-smart-key="projects">70+</span>
 *   <span data-smart-key="paradigm.unique_views">1K+</span>
 *   <span data-smart-key="pointerParadigm.unique_views">425</span>
 *
 * Profiles:
 *   <div data-smart-profile="alexander-suvorov">
 *       <span data-smart-profile-field="name">Alexander Suvorov</span>
 *       <span data-smart-profile-field="github">smartlegionlab</span>
 *       <span data-smart-profile-field="orcid">0009-0006-3427-9611</span>
 *       <span data-smart-profile-field="career_start">2015</span>
 *   </div>
 */

class StatsManager {
    constructor() {
        this.config = CONFIG;
        this.data = null;
        this.loaded = false;
        this.init();
    }

    async init() {
        this.data = this.getDefaultData();
        await this.loadRequiredData();
        this.updateAll();
        this.loaded = true;
    }

    getDefaultData() {
        const data = {
            experience: this.calcExperienceForProfile(this.config.PROFILES[0]),
            paradigms: this.config.CONSTANTS.PARADIGMS,
            ecosystems: this.config.CONSTANTS.ECOSYSTEMS_COUNT,
            applications: this.config.CONSTANTS.APPLICATIONS,
            projects: this.config.CONSTANTS.PROJECTS_COUNT,
            articles: this.config.CONSTANTS.ARTICLES_COUNT,
            publications: this.config.CONSTANTS.PUBLICATIONS,
            libraries: this.config.CONSTANTS.LIBRARIES_COUNT,
            repos: this.config.CONSTANTS.PROJECTS_COUNT,
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

        return data;
    }

    calcExperienceForProfile(profile) {
        if (!profile || !profile.career_start) return 1;
        const start = profile.career_start;
        const now = new Date().getFullYear();
        let years = now - start;
        const month = new Date().getMonth();
        if (month < 5) years -= 1;
        return Math.max(years, 1);
    }

    getRequiredKeys() {
        const elements = document.querySelectorAll('[data-smart-key]');
        const keys = new Set();
        elements.forEach(el => {
            const key = el.getAttribute('data-smart-key');
            keys.add(key.split('.')[0]);
        });
        return keys;
    }

    async loadRequiredData() {
        const requiredKeys = this.getRequiredKeys();
        const tasks = [];

        if (requiredKeys.has('projects') || requiredKeys.has('repos') || requiredKeys.has('libraries')) {
            tasks.push(this.loadRepos());
        }

        const zenodoKeys = Object.keys(this.config.ZENODO_RECORDS);
        const needsZenodo = zenodoKeys.some(key => requiredKeys.has(key)) || requiredKeys.has('paradigm');
        if (needsZenodo) {
            tasks.push(this.loadZenodo());
        }

        if (tasks.length > 0) {
            await Promise.allSettled(tasks);
        }
    }

    async loadRepos() {
        try {
            const res = await fetch('/data/repos.json');
            if (!res.ok) throw new Error();
            const repos = await res.json();
            const valid = repos.filter(r => !r.archived);

            if (valid.length > 0) {
                this.data.projects = valid.length;
                this.data.repos = valid.length;

                const libraries = valid.filter(r => r.pypi_url && r.pypi_url !== '');
                if (libraries.length > 0) {
                    this.data.libraries = libraries.length;
                }
            }
        } catch(e) {
            // Keep default values from CONFIG.CONSTANTS
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
                    this.data[key] = zenodo[key];
                    uniqueViews += zenodo[key].unique_views || 0;
                    uniqueDownloads += zenodo[key].unique_downloads || 0;
                    totalViews += zenodo[key].total_views || 0;
                    totalDownloads += zenodo[key].total_downloads || 0;
                }
            }

            if (uniqueViews > 0) {
                this.data.paradigm.unique_views = uniqueViews;
                this.data.paradigm.unique_downloads = uniqueDownloads;
                this.data.paradigm.total_views = totalViews;
                this.data.paradigm.total_downloads = totalDownloads;
            }
        } catch(e) {
            // Keep default values from DEFAULTS.RESEARCH_STATS
        }
    }

    updateAll() {
        const flatKeys = [
            'experience', 'paradigms', 'ecosystems', 'repos',
            'projects', 'articles', 'applications', 'publications', 'libraries'
        ];

        flatKeys.forEach(key => {
            const val = this.data[key];
            if (val === undefined) return;
            const display = val + '+';
            document.querySelectorAll(`[data-smart-key="${key}"]`).forEach(el => {
                el.textContent = display;
            });
        });

        this.updateNested(this.data);
        this.updateProfiles();
        this.updateVersion();
    }

    updateNested(obj, prefix = '') {
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.updateNested(obj[key], prefix ? `${prefix}.${key}` : key);
            } else {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                let val = obj[key];
                if (val === undefined) return;

                let display = val;
                if (fullKey.includes('views') || fullKey.includes('downloads')) {
                    display = this.formatNumberRound(val);
                    if (fullKey.startsWith('paradigm.')) display += '+';
                } else {
                    display = val + '+';
                }

                document.querySelectorAll(`[data-smart-key="${fullKey}"]`).forEach(el => {
                    el.textContent = display;
                });
            }
        }
    }

    updateProfiles() {
        const profiles = this.config.PROFILES || [];
        profiles.forEach(profile => {
            const container = document.querySelector(`[data-smart-profile="${profile.id}"]`);
            if (!container) return;

            const nameEl = container.querySelector('[data-smart-profile-field="name"]');
            const githubEl = container.querySelector('[data-smart-profile-field="github"]');
            const orcidEl = container.querySelector('[data-smart-profile-field="orcid"]');
            const careerEl = container.querySelector('[data-smart-profile-field="career_start"]');

            if (nameEl) nameEl.textContent = profile.name;
            if (githubEl) githubEl.textContent = profile.github;
            if (orcidEl) orcidEl.textContent = profile.orcid;
            if (careerEl) {
                const years = this.calcExperienceForProfile(profile);
                careerEl.textContent = years + '+ years';
            }
        });
    }

    updateVersion() {
        const version = this.config.VERSION;
        if (!version) return;

        document.querySelectorAll('[data-smart-version]').forEach(el => {
            el.textContent = version;
        });
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.statsManager = new StatsManager();
});