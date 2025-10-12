class StatsManager {
    constructor() {
        this.initializeFromCacheOrConfig();
    }

    initializeFromCacheOrConfig() {
        const cachedStats = ZenodoCache.getCachedStats();

        if (cachedStats) {
            console.log('📦 StatsManager: Initializing from Zenodo cache');
            this.updateAllStats(cachedStats);
        } else {
            console.log('⚡ StatsManager: Initializing from config (no cache)');
            this.updateAllStats(CONFIG.COUNTERS.RESEARCH_STATS);
        }
    }

    updateAllStats(stats) {
        const pointerViews = document.getElementById('pointer-views');
        const pointerDownloads = document.getElementById('pointer-downloads');
        const localdataViews = document.getElementById('localdata-views');
        const localdataDownloads = document.getElementById('localdata-downloads');

        if (pointerViews) pointerViews.textContent = stats.pointerParadigm.views;
        if (pointerDownloads) pointerDownloads.textContent = stats.pointerParadigm.downloads;
        if (localdataViews) localdataViews.textContent = stats.localDataParadigm.views;
        if (localdataDownloads) localdataDownloads.textContent = stats.localDataParadigm.downloads;

        const totalDownloads = stats.pointerParadigm.downloads + stats.localDataParadigm.downloads;
        this.updateHeaderStats(totalDownloads);
        this.updateMetricsStats(totalDownloads);
    }

    updateHeaderStats(totalDownloads) {
        const stats = document.querySelectorAll('.stats-row .stat');
        if (stats.length >= 4) {
            stats[0].querySelector('.stat-number').textContent = totalDownloads;
            stats[1].querySelector('.stat-number').textContent = CONFIG.COUNTERS.PUBLIC_REPOS + '+';
            stats[2].querySelector('.stat-number').textContent = CONFIG.COUNTERS.PRODUCTION_PACKAGES + '+';
            stats[3].querySelector('.stat-number').textContent = CONFIG.COUNTERS.MONTHLY_DOWNLOADS + '+';
        }
    }

    updateMetricsStats(totalDownloads) {
        const metricElement = document.getElementById('total-downloads-metric');
        if (metricElement) {
            metricElement.textContent = totalDownloads;
        }

        const metrics = document.querySelectorAll('.metric-item .metric-number');
        if (metrics.length >= 4) {
            metrics[0].textContent = totalDownloads;
            metrics[1].textContent = CONFIG.COUNTERS.PUBLIC_REPOS + '+';
            metrics[2].textContent = CONFIG.COUNTERS.PRODUCTION_PACKAGES + '+';
            metrics[3].textContent = CONFIG.COUNTERS.MONTHLY_DOWNLOADS + '+';
        }
    }

    updateFromZenodo(stats) {
        console.log('🔄 StatsManager: Updating from Zenodo data');
        this.updateAllStats(stats);
    }
}