(function () {
    const ACCORDION_ID = 'profileAccordion';
    const GROUP_MAP = {
        collapseEcosystems: 'ecosystems',
        collapseApps: 'applications',
        collapseProjects: 'projects',
        collapseLibraries: 'libraries',
        collapsePublications: 'publications',
        collapseArticles: 'articles'
    };

    const accordion = document.getElementById(ACCORDION_ID);
    const profileKey = accordion ? accordion.getAttribute('data-profile') : '';
    const data = (typeof CONFIG !== 'undefined' && profileKey && CONFIG.PROFILES_DATA && CONFIG.PROFILES_DATA[profileKey])
        ? CONFIG.PROFILES_DATA[profileKey]
        : {};

    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function buildItem(item) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-6 mb-3';
        col.innerHTML = '<div><a href="' + item.href + '" class="fw-bold text-primary text-decoration-none">' + esc(item.title) + '</a>' +
            '<p class="small text-secondary mb-0">' + esc(item.desc || '') + '</p></div>';
        return col;
    }

    function fillGroup(groupKey) {
        const items = data[groupKey];
        if (!items || !items.length) return;
        const collapseId = Object.keys(GROUP_MAP).find(function (k) { return GROUP_MAP[k] === groupKey; });
        if (!collapseId) return;
        const collapse = document.getElementById(collapseId);
        if (!collapse) return;
        const row = collapse.querySelector('.accordion-body .row');
        if (!row) return;
        const frag = document.createDocumentFragment();
        items.forEach(function (item) { frag.appendChild(buildItem(item)); });
        row.appendChild(frag);
    }

    Object.keys(GROUP_MAP).forEach(function (collapseId) {
        fillGroup(GROUP_MAP[collapseId]);
    });
})();