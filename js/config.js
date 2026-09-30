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
        ECOSYSTEMS_COUNT: 6,
        PROJECTS_COUNT: 101,
        ARTICLES_COUNT: 4,
        PARADIGMS: 3,
        APPLICATIONS: 38,
        PUBLICATIONS: 4,
        LIBRARIES_COUNT: 33
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
                unique_views: 562,
                unique_downloads: 412,
                total_views: 811,
                total_downloads: 756
            },
            localDataParadigm: {
                unique_views: 366,
                unique_downloads: 332,
                total_views: 471,
                total_downloads: 508
            },
            deterministicEngine: {
                unique_views: 291,
                unique_downloads: 241,
                total_views: 361,
                total_downloads: 372
            },
            pchParadigm: {
                unique_views: 202,
                unique_downloads: 201,
                total_views: 246,
                total_downloads: 304
            }
        }
    },

    VERSION: 'v7.6.7'
};