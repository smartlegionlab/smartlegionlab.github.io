class PyPICache {
    static get CACHE_KEY() {
        return CONFIG.CACHE_CONFIG.PYPI.KEY;
    }
    static get CACHE_TTL() {
        return CONFIG.CACHE_CONFIG.PYPI.TTL;
    }

    static savePackages(packages) {
        try {
            const cacheData = {
                data: packages,
                timestamp: Date.now(),
                packageNames: CONFIG.PYPI_PACKAGES
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
            console.log('✅ PyPI packages cached successfully');
        } catch (error) {
            console.warn('⚠️ Could not cache PyPI packages:', error);
        }
    }

    static getCachedPackages() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) {
                console.log('📦 No PyPI cache found');
                return null;
            }

            const cacheData = JSON.parse(cached);
            const isExpired = Date.now() - cacheData.timestamp > this.CACHE_TTL;

            if (isExpired) {
                console.log('📦 PyPI cache expired');
                return null;
            }

            console.log('📦 Fresh PyPI cache available');
            return cacheData.data;
        } catch (error) {
            console.warn('⚠️ Error reading PyPI cache:', error);
            return null;
        }
    }

    static getStalePackages() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            const isExpired = Date.now() - cacheData.timestamp > this.CACHE_TTL;

            console.log(`📦 ${isExpired ? 'Expired PyPI cache' : 'Fresh PyPI cache'} available for fallback`);

            return {
                data: cacheData.data,
                isExpired: isExpired
            };
        } catch (error) {
            console.warn('⚠️ Error reading stale PyPI cache:', error);
            return null;
        }
    }

    static clearCache() {
        try {
            localStorage.removeItem(this.CACHE_KEY);
            console.log('🗑️ PyPI cache cleared');
        } catch (error) {
            console.warn('⚠️ Error clearing PyPI cache:', error);
        }
    }

    static getCacheAge() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            return Date.now() - cacheData.timestamp;
        } catch (error) {
            return null;
        }
    }
}