class ZenodoCache {
    static get CACHE_KEY() { return CONFIG.ZENODO.CACHE_KEY; }
    static get CACHE_TTL() { return CONFIG.ZENODO.CACHE_TTL; }

    static saveStats(stats) {
        try {
            const cacheData = {
                data: stats,
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
            if (!cached) {
                console.log('📦 No Zenodo cache found');
                return null;
            }

            const cacheData = JSON.parse(cached);
            const isExpired = Date.now() - cacheData.timestamp > this.CACHE_TTL;

            if (isExpired) {
                console.log('📦 Zenodo cache expired');
                return null;
            }

            console.log('📦 Fresh Zenodo cache available');
            return cacheData.data;
        } catch (error) {
            console.warn('⚠️ Error reading Zenodo cache:', error);
            return null;
        }
    }

    static getStaleStats() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            const isExpired = Date.now() - cacheData.timestamp > this.CACHE_TTL;

            console.log(`📦 ${isExpired ? 'Expired Zenodo cache' : 'Fresh Zenodo cache'} available for fallback`);
            return {
                data: cacheData.data,
                isExpired: isExpired
            };
        } catch (error) {
            console.warn('⚠️ Error reading stale Zenodo cache:', error);
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