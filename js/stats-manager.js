class StatsManager {
    constructor() {
        this.initializeFromCacheOrConfig();
    }

    updateAllStats(stats) {
        this.updateHeaderStats(stats);
        this.updateMetricsStats(stats);
    }

    updateHeaderStats(stats) {

        const headerRepos = document.getElementById('header-repos');
        const headerPypi = document.getElementById('header-pypi');
        const headerMonthly = document.getElementById('header-monthly');

        if (headerRepos) {
            headerRepos.textContent = CONFIG.COUNTERS.PUBLIC_REPOS + '+';
        }
        if (headerPypi) {
            headerPypi.textContent = CONFIG.COUNTERS.PRODUCTION_PACKAGES + '+';
        }
        if (headerMonthly) {
            headerMonthly.textContent = CONFIG.COUNTERS.MONTHLY_DOWNLOADS + 'K+';
        }
    }

    updateMetricsStats(stats) {

        const metricRepos = document.getElementById('metric-repos');
        const metricPypi = document.getElementById('metric-pypi');
        const metricMonthly = document.getElementById('metric-monthly');

        if (metricRepos) {
            metricRepos.textContent = CONFIG.COUNTERS.PUBLIC_REPOS + '+';
        }
        if (metricPypi) {
            metricPypi.textContent = CONFIG.COUNTERS.PRODUCTION_PACKAGES + '+';
        }
        if (metricMonthly) {
            metricMonthly.textContent = CONFIG.COUNTERS.MONTHLY_DOWNLOADS + 'K+';
        }
    }
}