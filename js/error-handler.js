class ErrorHandler {
    static analyzeError(error) {
        if (error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('Network request failed')) {
            return 'NETWORK_ERROR';
        } else if (error.message.includes('rate limit') || error.status === 403) {
            return 'RATE_LIMIT';
        } else if (error.status === 404) {
            return 'USER_NOT_FOUND';
        } else if (error.status === 500 || error.status === 502 || error.status === 503) {
            return 'SERVER_ERROR';
        } else {
            return 'UNKNOWN_ERROR';
        }
    }

    static getErrorMessage(errorType) {
        const messages = {
            NETWORK_ERROR: {
                title: '🔌 No Internet Connection',
                message: 'Please check your internet connection and try again.',
                action: 'Try Again'
            },
            RATE_LIMIT: {
                title: '⏳ GitHub API Rate Limit',
                message: 'GitHub API rate limit exceeded. Please try again later.',
                action: 'Try Again'
            },
            USER_NOT_FOUND: {
                title: '🔍 User Not Found',
                message: 'GitHub user was not found. Please check the username.',
                action: 'Try Again'
            },
            SERVER_ERROR: {
                title: '🚧 GitHub Server Error',
                message: 'GitHub servers are temporarily unavailable.',
                action: 'Try Again'
            },
            UNKNOWN_ERROR: {
                title: '❌ Unknown Error',
                message: 'An unexpected error occurred while loading repositories.',
                action: 'Try Again'
            }
        };

        return messages[errorType] || messages.UNKNOWN_ERROR;
    }
}

class RepositoryCache {
    static CACHE_KEY = 'github_repos_cache';
    static CACHE_TTL = 60 * 60 * 1000;

    static saveRepos(repos) {
        try {
            const cacheData = {
                data: repos,
                timestamp: Date.now(),
                username: CONFIG.GITHUB_USERNAME
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
            console.log('✅ Repositories cached successfully');
        } catch (error) {
            console.warn('⚠️ Could not cache repositories:', error);
        }
    }

    static getCachedRepos() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) {
                console.log('📦 No cache found');
                return null;
            }

            const cacheData = JSON.parse(cached);

            const isExpired = Date.now() - cacheData.timestamp > this.CACHE_TTL;

            if (isExpired) {
                console.log('📦 Cache expired');
                return null;
            }

            console.log('📦 Fresh cache available');
            return cacheData.data;
        } catch (error) {
            console.warn('⚠️ Error reading cache:', error);
            return null;
        }
    }

    static getStaleCache() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) {
                return null;
            }

            const cacheData = JSON.parse(cached);
            const isExpired = Date.now() - cacheData.timestamp > this.CACHE_TTL;

            console.log(`📦 ${isExpired ? 'Expired cache' : 'Fresh cache'} available for fallback`);

            return {
                data: cacheData.data,
                isExpired: isExpired
            };
        } catch (error) {
            console.warn('⚠️ Error reading stale cache:', error);
            return null;
        }
    }

    static clearCache() {
        try {
            localStorage.removeItem(this.CACHE_KEY);
            console.log('🗑️ Cache cleared');
        } catch (error) {
            console.warn('⚠️ Error clearing cache:', error);
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