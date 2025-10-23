

class ZenodoCache {
    static get CACHE_KEY() { return CONFIG.ZENODO.CACHE_KEY; }
    static get CACHE_TTL() { return CONFIG.ZENODO.CACHE_TTL; }

    static saveStats(stats) {
        try {
            const cacheData = {
                data: {
                    pointerParadigm: {
                        unique_views: stats.pointerParadigm.unique_views,
                        unique_downloads: stats.pointerParadigm.unique_downloads,
                        total_views: stats.pointerParadigm.total_views,
                        total_downloads: stats.pointerParadigm.total_downloads
                    },
                    localDataParadigm: {
                        unique_views: stats.localDataParadigm.unique_views,
                        unique_downloads: stats.localDataParadigm.unique_downloads,
                        total_views: stats.localDataParadigm.total_views,
                        total_downloads: stats.localDataParadigm.total_downloads
                    },
                    deterministicEngine: {
                        unique_views: stats.deterministicEngine.unique_views,
                        unique_downloads: stats.deterministicEngine.unique_downloads,
                        total_views: stats.deterministicEngine.total_views,
                        total_downloads: stats.deterministicEngine.total_downloads
                    }
                },
                timestamp: Date.now()
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
            console.log('✅ Zenodo stats cached successfully');
        } catch (error) {
            console.warn('⚠️ Could not cache Zenodo stats:', error);
        }
    }

    static getCachedStats() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            const isExpired = Date.now() - cacheData.timestamp > this.CACHE_TTL;

            if (isExpired) return null;

            return cacheData.data;
        } catch (error) {
            return null;
        }
    }

    static getStaleStats() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            return {
                data: cacheData.data,
                isExpired: Date.now() - cacheData.timestamp > this.CACHE_TTL
            };
        } catch (error) {
            return null;
        }
    }

    static clearCache() {
        try {
            localStorage.removeItem(this.CACHE_KEY);
            console.log('🗑️ Zenodo cache cleared');
        } catch (error) {
            console.warn('⚠️ Error clearing Zenodo cache:', error);
        }
    }
}