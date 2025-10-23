const CONFIG = {
    GITHUB_USERNAME: 'smartlegionlab',
    DEVTO_USERNAME: 'smartlegionlab',
    EXCLUDED_REPOSITORIES: ['smartlegionlab'],

    COUNTERS: {
        PUBLIC_REPOS: 35,
        PRODUCTION_PACKAGES: 20,
        MONTHLY_DOWNLOADS: 15,

        RESEARCH_STATS: {
            pointerParadigm: { 
                unique_views: 211, 
                unique_downloads: 193,
                total_views: 400, 
                total_downloads: 420 
            },
            localDataParadigm: { 
                unique_views: 129, 
                unique_downloads: 121,
                total_views: 197, 
                total_downloads: 211 
            },
            deterministicEngine: { 
                unique_views: 45, 
                unique_downloads: 29,
                total_views: 79, 
                total_downloads: 75 
            }
        }
    },

    SCROLL_OFFSET: 80,

    PYPI_PACKAGES: [
        'smartpasslib',
        'clipassman',
        'clipassgen',
        'smart-tsp-solver',
        'smart-tsp-benchmark',
        'smart-2fa-secure',
        'babylonian-image-library',
        'smart-babylon-library',
        'commandman',
        'smartpathlibrary',
        'smartexecutorlib',
        'climan',
        'github-ssh-key',
        'commandpack',
        'smartprinter',
        'smartcliapp',
        'commandex',
        'smartrandom',
        'smarttextdecorator',
        'smartauthen',
        'smart-redis-storage',
        'smart-text-randomizer',
        'smart-ip-info',
    ],

    CACHE_CONFIG: {
        REPOSITORIES: {
            TTL: 24 * 60 * 60 * 1000,
            KEY: 'github_repos_cache'
        },
        ARTICLES: {
            TTL: 2 * 60 * 60 * 1000,
            KEY: 'devto_articles_cache'
        },
        PYPI: { 
            TTL: 24 * 60 * 60 * 1000, 
            KEY: 'pypi_packages_cache' 
        }
    },
    
    ZENODO: {
        RECORDS: {
            POINTER_PARADIGM: '17204738',
            LOCAL_DATA_PARADIGM: '17264327',
            DETERMINISTIC_ENGINE: '17383447'
        },
        CACHE_TTL: 60 * 60 * 1000,
        CACHE_KEY: 'zenodo_stats_cache'
    }
};