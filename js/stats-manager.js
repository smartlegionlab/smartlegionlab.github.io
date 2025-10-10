class StatsManager {
    constructor() {
        this.totalDownloads = CONFIG.RESEARCH_STATS.pointerParadigm.downloads + CONFIG.RESEARCH_STATS.localDataParadigm.downloads;
        this.updateStats();
    }

    updateStats() {
        this.updateHeaderStats();
        this.updateResearchStats();
    }

    updateHeaderStats() {
        const headerStats = document.querySelectorAll('.stats-row .stat:first-child .stat-number');
        if (headerStats.length > 0) {
            headerStats[0].textContent = this.totalDownloads;
        }

        const metricElement = document.getElementById('total-downloads-metric');
        if (metricElement) {
            metricElement.textContent = this.totalDownloads;
        }
    }

    updateResearchStats() {
        const pointerViews = document.getElementById('pointer-views');
        const pointerDownloads = document.getElementById('pointer-downloads');
        const localdataViews = document.getElementById('localdata-views');
        const localdataDownloads = document.getElementById('localdata-downloads');

        if (pointerViews) pointerViews.textContent = CONFIG.RESEARCH_STATS.pointerParadigm.views;
        if (pointerDownloads) pointerDownloads.textContent = CONFIG.RESEARCH_STATS.pointerParadigm.downloads;
        if (localdataViews) localdataViews.textContent = CONFIG.RESEARCH_STATS.localDataParadigm.views;
        if (localdataDownloads) localdataDownloads.textContent = CONFIG.RESEARCH_STATS.localDataParadigm.downloads;
    }
}