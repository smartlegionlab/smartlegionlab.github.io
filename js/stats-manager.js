class StatsManager {
    constructor() {
        this.loadFromFile();
    }

    async loadFromFile() {
        try {
            const response = await fetch('/data/zenodo.json');
            if (response.ok) {
                const stats = await response.json();
                console.log('📡 Loaded Zenodo stats from file');
                this.updateAllStats(stats);
            } else {
                console.log('⚡ Using config values (file not found)');
                this.updateAllStats(CONFIG.COUNTERS.RESEARCH_STATS);
            }
        } catch (error) {
            console.log('⚡ Using config values (error loading file)');
            this.updateAllStats(CONFIG.COUNTERS.RESEARCH_STATS);
        }
    }

    updateAllStats(stats) {
        const mergedStats = {
            pointerParadigm: this.mergeWithConfig(stats.pointerParadigm, CONFIG.COUNTERS.RESEARCH_STATS.pointerParadigm),
            localDataParadigm: this.mergeWithConfig(stats.localDataParadigm, CONFIG.COUNTERS.RESEARCH_STATS.localDataParadigm),
            deterministicEngine: this.mergeWithConfig(stats.deterministicEngine, CONFIG.COUNTERS.RESEARCH_STATS.deterministicEngine),
            pchParadigm: this.mergeWithConfig(stats.pchParadigm, CONFIG.COUNTERS.RESEARCH_STATS.pchParadigm)
        };

        this.updateParadigmStats('pointer', mergedStats.pointerParadigm);
        this.updateParadigmStats('localdata', mergedStats.localDataParadigm);
        this.updateParadigmStats('engine', mergedStats.deterministicEngine);
        this.updateParadigmStats('pch', mergedStats.pchParadigm);
        this.updateHeaderStats(mergedStats);
        this.updateMetricsStats(mergedStats);
    }

    mergeWithConfig(fileStats, configStats) {
        if (!fileStats) return configStats;
        
        return {
            unique_views: fileStats.unique_views || configStats.unique_views,
            unique_downloads: fileStats.unique_downloads || configStats.unique_downloads,
            total_views: fileStats.total_views || configStats.total_views,
            total_downloads: fileStats.total_downloads || configStats.total_downloads
        };
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
                                   stats.deterministicEngine.unique_downloads +
                                   stats.pchParadigm.unique_downloads;

        const totalUniqueViews = stats.pointerParadigm.unique_views +
                               stats.localDataParadigm.unique_views +
                               stats.deterministicEngine.unique_views +
                               stats.pchParadigm.unique_views;

        const headerDownloads = document.querySelectorAll('.header-downloads');
        const headerViews = document.querySelectorAll('.header-views');

        const headerProjects = document.querySelectorAll('.header-projects');
        const headerParadigms = document.querySelectorAll('.header-paradigms');

        headerDownloads.forEach(el => {
            if (el) el.innerHTML = `${totalUniqueDownloads}+`;
        });

        headerViews.forEach(el => {
            if (el) el.innerHTML = `${totalUniqueViews}+`;
        });

        headerProjects.forEach(el => {
            if (el) el.innerHTML = `${CONFIG.HEADER_COUNTERS.headerProjects}`;
        });

        headerParadigms.forEach(el => {
            if (el) el.innerHTML = `${CONFIG.HEADER_COUNTERS.headerParadigms}`;
        });
    }

    updateMetricsStats(stats) {
        const totalUniqueDownloads = stats.pointerParadigm.unique_downloads +
                                   stats.localDataParadigm.unique_downloads +
                                   stats.deterministicEngine.unique_downloads +
                                   stats.pchParadigm.unique_downloads;

        const totalDownloads = stats.pointerParadigm.total_downloads +
                             stats.localDataParadigm.total_downloads +
                             stats.deterministicEngine.total_downloads +
                             stats.pchParadigm.total_downloads;

        const totalUniqueViews = stats.pointerParadigm.unique_views +
                               stats.localDataParadigm.unique_views +
                               stats.deterministicEngine.unique_views +
                               stats.pchParadigm.unique_views;

        const totalViews = stats.pointerParadigm.total_views +
                         stats.localDataParadigm.total_views +
                         stats.deterministicEngine.total_views +
                         stats.pchParadigm.total_views;

        const metricDownloads = document.getElementById('metric-downloads');
        const totalMetricDownloads = document.getElementById('total-metric-downloads');
        const metricViews = document.getElementById('metric-views');
        const totalMetricViews = document.getElementById('total-metric-views');
        const metricProjects = document.getElementById('metric-projects');
        const metricParadigms = document.getElementById('metric-paradigms');

        if (metricDownloads) metricDownloads.innerHTML = `${totalUniqueDownloads}+`;
        if (totalMetricDownloads) totalMetricDownloads.innerHTML = `${totalDownloads}+`;
        if (metricViews) metricViews.innerHTML = `${totalUniqueViews}+`;
        if (totalMetricViews) totalMetricViews.innerHTML = `${totalViews}+`;
        if (metricProjects) metricProjects.innerHTML = `${CONFIG.METRICS_COUNTERS.metricProjects}+`;
        if (metricParadigms) metricParadigms.innerHTML = `${CONFIG.METRICS_COUNTERS.metricParadigms}+`;
    }
}

window.addEventListener('load', () => {
    const app = new StatsManager();
});