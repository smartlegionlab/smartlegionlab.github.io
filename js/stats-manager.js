

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
        this.updateParadigmStats('pointer', stats.pointerParadigm);
        this.updateParadigmStats('localdata', stats.localDataParadigm);
        this.updateParadigmStats('engine', stats.deterministicEngine);

        this.updateHeaderStats(stats);
        this.updateMetricsStats(stats);
    }

    updateParadigmStats(prefix, stats) {
        const viewsElement = document.getElementById(`${prefix}-views`);
        const downloadsElement = document.getElementById(`${prefix}-downloads`);

        if (viewsElement) {
            viewsElement.innerHTML = `${stats.unique_views}<span class="text-primary" style="opacity: 0.7;">/${stats.total_views}</span>`;
        }
        if (downloadsElement) {
            downloadsElement.innerHTML = `${stats.unique_downloads}<span class="text-primary" style="opacity: 0.7;">/${stats.total_downloads}</span>`;
        }
    }

    updateHeaderStats(stats) {
        const totalUniqueDownloads = stats.pointerParadigm.unique_downloads +
                                   stats.localDataParadigm.unique_downloads +
                                   stats.deterministicEngine.unique_downloads;
        
        const totalDownloads = stats.pointerParadigm.total_downloads +
                             stats.localDataParadigm.total_downloads +
                             stats.deterministicEngine.total_downloads;

        const headerElement = document.getElementById('total-downloads-header');
        if (headerElement) {
            headerElement.innerHTML = `${totalUniqueDownloads}+<span class="text-primary" style="opacity: 0.7;">/${totalDownloads}+</span>`;
        }
    }

    updateMetricsStats(stats) {
        const totalUniqueDownloads = stats.pointerParadigm.unique_downloads +
                                   stats.localDataParadigm.unique_downloads +
                                   stats.deterministicEngine.unique_downloads;
        
        const totalDownloads = stats.pointerParadigm.total_downloads +
                             stats.localDataParadigm.total_downloads +
                             stats.deterministicEngine.total_downloads;

        const totalUniqueViews = stats.pointerParadigm.unique_views +
                               stats.localDataParadigm.unique_views +
                               stats.deterministicEngine.unique_views;
        
        const totalViews = stats.pointerParadigm.total_views +
                         stats.localDataParadigm.total_views +
                         stats.deterministicEngine.total_views;

        const downloadsMetric = document.getElementById('total-downloads-metric');
        if (downloadsMetric) {
            downloadsMetric.innerHTML = `${totalUniqueDownloads}+<span class="text-primary" style="opacity: 0.7;">/${totalDownloads}+</span>`;
        }

        const viewsMetric = document.getElementById('total-views-metric');
        if (viewsMetric) {
            viewsMetric.innerHTML = `${totalUniqueViews}+<span class="text-primary" style="opacity: 0.7;">/${totalViews}+</span>`;
        }

        const metrics = document.querySelectorAll('.metric-item .metric-number');
        if (metrics.length >= 4) {
            metrics[2].textContent = CONFIG.COUNTERS.PUBLIC_REPOS + '+';
            metrics[3].textContent = CONFIG.COUNTERS.PRODUCTION_PACKAGES + '+';
        }
    }

    updateFromZenodo(stats) {
        console.log('🔄 StatsManager: Updating from Zenodo data');
        this.updateAllStats(stats);
    }
}