class Utils {
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const easeOut = t => 1 - Math.pow(1 - t, 3);

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOut(progress);
            const current = Math.floor(start + (end - start) * eased);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = end + '+';
            }
        }

        requestAnimationFrame(update);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static formatCacheTime(ms) {
        if (ms < 60000) {
            return `${Math.round(ms / 1000)} seconds`;
        } else if (ms < 3600000) {
            return `${Math.round(ms / 60000)} minutes`;
        } else if (ms < 86400000) {
            return `${Math.round(ms / 3600000)} hours`;
        } else {
            return `${Math.round(ms / 86400000)} days`;
        }
    }

    static getCacheTTLDescription() {
        const reposTTL = Utils.formatCacheTime(CONFIG.CACHE_CONFIG.REPOSITORIES.TTL);
        const articlesTTL = Utils.formatCacheTime(CONFIG.CACHE_CONFIG.ARTICLES.TTL);

        return {
            repositories: reposTTL,
            articles: articlesTTL
        };
    }
}