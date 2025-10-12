const CONFIG = {
    GITHUB_USERNAME: 'smartlegionlab',
    DEVTO_USERNAME: 'smartlegionlab',
    EXCLUDED_REPOSITORIES: ['smartlegionlab.github.io', 'smartlegionlab'],
    RESEARCH_STATS: {
        pointerParadigm: { views: 151, downloads: 143 },
        localDataParadigm: { views: 69, downloads: 65 }
    },
    SCROLL_OFFSET: 80,

    CACHE_CONFIG: {
        REPOSITORIES: {
            TTL: 60 * 60 * 1000,
            KEY: 'github_repos_cache'
        },
        ARTICLES: {
            TTL: 2 * 60 * 60 * 1000,
            KEY: 'devto_articles_cache'
        }
    }
};