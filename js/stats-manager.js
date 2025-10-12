class StatsManager {
    constructor() {
        this.totalDownloads = CONFIG.COUNTERS.PAPER_DOWNLOADS;
        this.updateStats();
    }

    updateStats() {
        this.updateHeaderStats();
        this.updateResearchStats();
        this.updateMetricsStats();
    }

    updateHeaderStats() {
        const stats = document.querySelectorAll('.stats-row .stat');
        if (stats.length >= 4) {
            stats[0].querySelector('.stat-number').textContent = CONFIG.COUNTERS.PAPER_DOWNLOADS;
            stats[1].querySelector('.stat-number').textContent = CONFIG.COUNTERS.PUBLIC_REPOS + '+';
            stats[2].querySelector('.stat-number').textContent = CONFIG.COUNTERS.PRODUCTION_PACKAGES + '+';
            stats[3].querySelector('.stat-number').textContent = CONFIG.COUNTERS.MONTHLY_DOWNLOADS + '+';
        }

        const metricElement = document.getElementById('total-downloads-metric');
        if (metricElement) {
            metricElement.textContent = CONFIG.COUNTERS.PAPER_DOWNLOADS;
        }
    }

    updateResearchStats() {
        const pointerViews = document.getElementById('pointer-views');
        const pointerDownloads = document.getElementById('pointer-downloads');
        const localdataViews = document.getElementById('localdata-views');
        const localdataDownloads = document.getElementById('localdata-downloads');

        if (pointerViews) pointerViews.textContent = CONFIG.COUNTERS.RESEARCH_STATS.pointerParadigm.views;
        if (pointerDownloads) pointerDownloads.textContent = CONFIG.COUNTERS.RESEARCH_STATS.pointerParadigm.downloads;
        if (localdataViews) localdataViews.textContent = CONFIG.COUNTERS.RESEARCH_STATS.localDataParadigm.views;
        if (localdataDownloads) localdataDownloads.textContent = CONFIG.COUNTERS.RESEARCH_STATS.localDataParadigm.downloads;
    }

    updateMetricsStats() {
        const metrics = document.querySelectorAll('.metric-item .metric-number');
        if (metrics.length >= 4) {
            metrics[0].textContent = CONFIG.COUNTERS.PAPER_DOWNLOADS;
            metrics[1].textContent = CONFIG.COUNTERS.PUBLIC_REPOS + '+';
            metrics[2].textContent = CONFIG.COUNTERS.PRODUCTION_PACKAGES + '+';
            metrics[3].textContent = CONFIG.COUNTERS.MONTHLY_DOWNLOADS + '+';
        }
    }
}