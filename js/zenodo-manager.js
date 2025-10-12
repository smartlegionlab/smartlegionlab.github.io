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
                views: data.stats.unique_views || 0,
                downloads: data.stats.unique_downloads || 0
            };
        } catch (error) {
            console.error(`❌ Error fetching Zenodo record ${recordId}:`, error);
            throw error;
        }
    }

    async fetchAllStats() {
        console.log('📡 Fetching Zenodo statistics...');

        try {
            const [pointerStats, localDataStats] = await Promise.all([
                this.fetchRecordStats(CONFIG.ZENODO.RECORDS.POINTER_PARADIGM),
                this.fetchRecordStats(CONFIG.ZENODO.RECORDS.LOCAL_DATA_PARADIGM)
            ]);

            const stats = {
                pointerParadigm: pointerStats,
                localDataParadigm: localDataStats
            };

            console.log('✅ Zenodo stats fetched successfully:', stats);
            return stats;

        } catch (error) {
            console.error('❌ Error fetching Zenodo stats:', error);
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
                console.log('📦 Using fresh Zenodo cache - NO API CALL');
                this.stats = freshCache;
                this.statsManager.updateFromZenodo(freshCache);
                this.hasLoaded = true;
                return;
            }

            console.log('📡 No fresh cache, fetching from Zenodo API...');
            const freshStats = await this.fetchAllStats();

            this.stats = freshStats;
            ZenodoCache.saveStats(freshStats);
            this.statsManager.updateFromZenodo(freshStats);
            this.hasLoaded = true;

        } catch (error) {
            console.error('❌ Error loading Zenodo stats:', error);

            const staleCache = ZenodoCache.getStaleStats();
            if (staleCache && staleCache.data) {
                console.log('🔄 Using stale Zenodo cache as fallback');
                this.stats = staleCache.data;
                this.statsManager.updateFromZenodo(staleCache.data);
                this.hasLoaded = true;
                this.showCacheWarning(staleCache.isExpired);
            } else {
                console.log('⚡ Fallback to config values (already set)');
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