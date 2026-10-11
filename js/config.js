/**
 * StatsManager Configuration
 *
 * PROFILES - Array of profile objects. Add new profiles to this array.
 * CONSTANTS - Static values that don't change. Used as fallback if fetch fails.
 * ZENODO_RECORDS - Zenodo record IDs for fetching stats.
 * DEFAULTS.RESEARCH_STATS - Fallback values if Zenodo fetch fails.
 */
const CONFIG = {
    PROFILES: [
        {
            id: 'alexander-suvorov-sr',
            name: 'Alexander Suvorov Sr.',
            github: 'smartlegionlab',
            orcid: '0009-0006-3427-9611',
            career_start: 2011
        },
        {
            id: 'alexander-suvorov-jr',
            name: 'Alexander Suvorov Jr.',
            github: 'aixandrolab',
            orcid: '0009-0006-3427-9611',
            career_start: 2020
        },

    ],

    CONSTANTS: {
        ECOSYSTEMS_COUNT: 7,
        PROJECTS_COUNT: 101,
        ARTICLES_COUNT: 4,
        PARADIGMS: 3,
        APPLICATIONS: 52,
        PUBLICATIONS: 4,
        LIBRARIES_COUNT: 37
    },

    ZENODO_RECORDS: {
        pointerParadigm: '17204738',
        localDataParadigm: '17264327',
        deterministicEngine: '17383447',
        pchParadigm: '17614888'
    },

    DEFAULTS: {
        RESEARCH_STATS: {
            pointerParadigm: {
                unique_views: 569,
                unique_downloads: 424,
                total_views: 818,
                total_downloads: 783
            },
            localDataParadigm: {
                unique_views: 372,
                unique_downloads: 343,
                total_views: 477,
                total_downloads: 529
            },
            deterministicEngine: {
                unique_views: 299,
                unique_downloads: 249,
                total_views: 369,
                total_downloads: 388
            },
            pchParadigm: {
                unique_views: 207,
                unique_downloads: 209,
                total_views: 251,
                total_downloads: 316
            }
        }
    },

    VERSION: 'v7.6.14'
};