class StatsManager {
    constructor() {
        this.updateAllStats();
    }

    updateAllStats(stats) {
        this.updateHeaderStats(stats);
        this.updateMetricsStats(stats);
    }

    updateHeaderStats(stats) {

        const headerRepos = document.getElementById('header-repos');
        const headerPypi = document.getElementById('header-pypi');
        const headerMonthly = document.getElementById('header-monthly');
        const headerYears = document.getElementById('header-years');
        const headerProjects = document.getElementById('header-projects');

        if (headerRepos) {
            headerRepos.textContent = CONFIG.COUNTERS.PUBLIC_REPOS + '+';
        }

        if (headerPypi) {
            headerPypi.textContent = CONFIG.COUNTERS.PRODUCTION_PACKAGES + '+';
        }

        if (headerMonthly) {
            headerMonthly.textContent = CONFIG.COUNTERS.MONTHLY_DOWNLOADS + 'K+';
        }

        if (headerYears) {
            headerYears.textContent = CONFIG.COUNTERS.EXPERIENCE_YEARS + '+';
        }

        if (headerProjects) {
            headerProjects.textContent = CONFIG.COUNTERS.PROJECTS_DELIVERED + '+';
        }

    }

    updateMetricsStats(stats) {

        const metricRepos = document.getElementById('metric-repos');
        const metricPypi = document.getElementById('metric-pypi');
        const metricMonthly = document.getElementById('metric-monthly');
        const metricYears = document.getElementById('metric-years');
        const metricProjects = document.getElementById('metric-projects');

        if (metricRepos) {
            metricRepos.textContent = CONFIG.COUNTERS.PUBLIC_REPOS + '+';
        }

        if (metricPypi) {
            metricPypi.textContent = CONFIG.COUNTERS.PRODUCTION_PACKAGES + '+';
        }

        if (metricMonthly) {
            metricMonthly.textContent = CONFIG.COUNTERS.MONTHLY_DOWNLOADS + 'K+';
        }

        if (metricYears) {
            metricYears.textContent = CONFIG.COUNTERS.EXPERIENCE_YEARS + '+';
        }

        if (metricProjects) {
            metricProjects.textContent = CONFIG.COUNTERS.PROJECTS_DELIVERED + '+';
        }

    }
}