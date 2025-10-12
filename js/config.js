const CONFIG = {
    GITHUB_USERNAME: 'smartlegionlab',
    DEVTO_USERNAME: 'smartlegionlab',
    EXCLUDED_REPOSITORIES: ['smartlegionlab.github.io', 'smartlegionlab'],

    COUNTERS: {
        PAPER_DOWNLOADS: 208,
        PUBLIC_REPOS: 35,
        PRODUCTION_PACKAGES: 20,
        MONTHLY_DOWNLOADS: 15000,

        RESEARCH_STATS: {
            pointerParadigm: { views: 151, downloads: 143 },
            localDataParadigm: { views: 69, downloads: 65 }
        }
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
    },
    ZENODO: {
        RECORDS: {
            POINTER_PARADIGM: '17204738',
            LOCAL_DATA_PARADIGM: '17264327'
        },
        CACHE_TTL: 2 * 60 * 60 * 1000,
        CACHE_KEY: 'zenodo_stats_cache'
    }
};