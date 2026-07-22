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
            id: 'alexander-suvorov',
            name: 'Alexander Suvorov',
            github: 'smartlegionlab',
            orcid: '0009-0006-3427-9611',
            career_start: 2015
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
        PROJECTS_COUNT: 70,
        ARTICLES_COUNT: 4,
        PARADIGMS: 3,
        APPLICATIONS: 26,
        PUBLICATIONS: 4,
        LIBRARIES_COUNT: 30
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

    VERSION: 'v7.1.9'
};