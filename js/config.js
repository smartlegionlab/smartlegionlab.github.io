const CONFIG = {
    GITHUB_USERNAME: 'smartlegionlab',
    DEVTO_USERNAME: 'smartlegionlab',
    EXCLUDED_REPOSITORIES: ['smartlegionlab'],

    COUNTERS: {
        PUBLIC_REPOS: 40,
        PRODUCTION_PACKAGES: 20,
        MONTHLY_DOWNLOADS: 15,
        EXPERIENCE_YEARS: 10,
        PROJECTS_DELIVERED: 250,
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
    }
};