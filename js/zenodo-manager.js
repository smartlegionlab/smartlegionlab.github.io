class ZenodoManager {
    constructor(statsManager) {
        this.statsManager = statsManager;
        this.stats = null;
        this.hasLoaded = false;
        this.isLoading = false;
    }

    async fetchRecordStats(recordId) {
        try {
            const response = await fetch(`https://zenodo.org/api/records/${recordId}`);

            if (!response.ok) {
                throw new Error(`Zenodo API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                unique_views: data.stats.unique_views || 0,
                unique_downloads: data.stats.unique_downloads || 0,
                total_views: data.stats.views || 0,
                total_downloads: data.stats.downloads || 0
            };
        } catch (error) {
            console.error(`🌐 Zenodo record ${recordId} fetch failed:`, error.message);
            throw error;
        }
    }

    async fetchAllStats() {
        console.log('📡 Fetching Zenodo statistics...');

        try {
            const [pointerStats, localDataStats, engineStats] = await Promise.all([
                this.fetchRecordStats(CONFIG.ZENODO.RECORDS.POINTER_PARADIGM),
                this.fetchRecordStats(CONFIG.ZENODO.RECORDS.LOCAL_DATA_PARADIGM),
                this.fetchRecordStats(CONFIG.ZENODO.RECORDS.DETERMINISTIC_ENGINE)
            ]);

            const stats = {
                pointerParadigm: pointerStats,
                localDataParadigm: localDataStats,
                deterministicEngine: engineStats
            };

            console.log('✅ Zenodo stats fetched successfully');
            return stats;

        } catch (error) {
            console.error('🌐 Zenodo API unavailable, using fallback');
            throw error;
        }
    }

    async loadStats() {
        if (this.isLoading || this.hasLoaded) return;

        this.isLoading = true;
        console.log('🚀 Loading Zenodo statistics...');

        try {
            const freshCache = ZenodoCache.getCachedStats();
            if (freshCache) {
                console.log('📦 Using cached Zenodo data');
                this.stats = freshCache;
                this.statsManager.updateFromZenodo(freshCache);
                this.hasLoaded = true;
                return;
            }

            console.log('🌐 Fetching fresh Zenodo data...');
            const freshStats = await this.fetchAllStats();

            this.stats = freshStats;
            ZenodoCache.saveStats(freshStats);
            this.statsManager.updateFromZenodo(freshStats);
            this.hasLoaded = true;

        } catch (error) {
            const staleCache = ZenodoCache.getStaleStats();
            if (staleCache && staleCache.data) {
                console.log('🔄 Using stale cache (API unavailable)');
                this.stats = staleCache.data;
                this.statsManager.updateFromZenodo(staleCache.data);
                this.hasLoaded = true;
            } else {
                console.log('⚡ Using config values (no cache available)');
                this.hasLoaded = true;
            }
        } finally {
            this.isLoading = false;
        }
    }

    showCacheWarning(isExpired) {
        console.log(`ℹ️ Using ${isExpired ? 'expired' : 'cached'} Zenodo data`);
    }

    async forceRefresh() {
        if (this.isLoading) return;

        console.log('🔄 Manual Zenodo refresh requested...');
        ZenodoCache.clearCache();
        this.hasLoaded = false;

        await this.loadStats();
    }
}