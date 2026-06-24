const CONFIG = {
    DEBUG: false,

    PROFILE: {
        NAME: 'Alexander Suvorov',
        GITHUB_USERNAME: 'smartlegionlab',
        DEVTO_USERNAME: 'smartlegionlab',
        ORCID: '0009-0006-3427-9611',
        CAREER_START_YEAR: 2015
    },

    CONSTANTS: {
        ECOSYSTEMS_COUNT: 6,
        PROJECTS_COUNT: 70,
        ARTICLES_COUNT: 4,
        USERS_SUPPORTED: '500K+',
        COMMITS: "11K",
        PARADIGMS: 3,
        APPLICATIONS: 26,
        PUBLICATIONS: 4
    },

    ZENODO_RECORDS: {
        pointerParadigm: '17204738',
        localDataParadigm: '17264327',
        deterministicEngine: '17383447',
        pchParadigm: '17614888'
    },

    PYPI_PACKAGES: [
        'smartpasslib', 'clipassman', 'clipassgen', 'smart-tsp-solver',
        'smart-tsp-benchmark', 'smart-2fa-secure', 'babylonian-image-library',
        'smart-babylon-library', 'commandman', 'smartpathlibrary', 'smartexecutorlib',
        'climan', 'github-ssh-key', 'commandpack', 'smartprinter', 'smartcliapp',
        'commandex', 'smartrandom', 'smarttextdecorator', 'smartauthen',
        'smart-redis-storage', 'smart-text-randomizer', 'smart-repository-manager-core',
        'forgejo-sync-manager-core', 'django-smart-dynamic-path', 'smart-dynamic-path',
        'smart-legion-lab-library'
    ],

    DEFAULTS: {
        REPOS_COUNT: 70,
        PYPI_PACKAGES_COUNT: 27,
        MONTHLY_DOWNLOADS: 15000,
        RESEARCH_STATS: {
            pointerParadigm: {
                unique_views: 485,
                unique_downloads: 370,
                total_views: 727,
                total_downloads: 708
            },
            localDataParadigm: {
                unique_views: 324,
                unique_downloads: 282,
                total_views: 427,
                total_downloads: 452
            },
            deterministicEngine: {
                unique_views: 244,
                unique_downloads: 186,
                total_views: 311,
                total_downloads: 311
            },
            pchParadigm: {
                unique_views: 158,
                unique_downloads: 145,
                total_views: 201,
                total_downloads: 242
            }
        }
    },

    EXCLUDED_REPOSITORIES: ['smartlegionlab']
};