/**
 * Profile Counts — automatic element counting
 * for profile accordions and the side card.
 */
(function () {
    'use strict';

    var SECTIONS = [
        { collapseId: 'collapseEcosystems',   key: 'ecosystems'   },
        { collapseId: 'collapseApps',         key: 'applications' },
        { collapseId: 'collapseProjects',     key: 'projects'     },
        { collapseId: 'collapseLibraries',    key: 'libraries'    },
        { collapseId: 'collapsePublications', key: 'publications' },
        { collapseId: 'collapseArticles',     key: 'articles'     }
    ];

    var LABELS = {
        ecosystems:   'Ecosystems',
        applications: 'Applications',
        projects:     'Projects',
        libraries:    'Libraries',
        publications: 'Research & Publications',
        articles:     'Articles'
    };

    function countItems(collapseId) {
        var el = document.getElementById(collapseId);
        if (!el) return 0;

        var row = el.querySelector('.row');
        if (!row) return 0;

        var count = 0;
        var columns = row.children;

        for (var i = 0; i < columns.length; i++) {
            var col = columns[i];
            if (!col.querySelector) continue;

            var link = col.querySelector('a[href]');
            if (!link) continue;

            var href = link.getAttribute('href') || '';
            if (href.indexOf('page') !== -1) continue;
            if (link.closest('.text-muted')) continue;

            count++;
        }

        return count;
    }

    function updateAccordionButton(collapseId, count) {
        var btn = document.querySelector('.accordion-button[data-bs-target="#' + collapseId + '"]');
        if (!btn) return;

        var old = btn.querySelector('.badge-count-auto');
        if (old) old.remove();

        if (count === 0) return;

        var badge = document.createElement('span');
        badge.className = 'badge bg-primary ms-2 badge-count-auto';
        badge.textContent = count;
        btn.appendChild(badge);
    }

    function updateSideCard(key, count) {
        var items = document.querySelectorAll('.explore-block-style ul.list-unstyled > li');
        if (!items.length) return;

        var targetLabel = LABELS[key];
        if (!targetLabel) return;

        for (var i = 0; i < items.length; i++) {
            var li = items[i];
            var span = li.querySelector('span.fw-semibold');
            if (!span) continue;
            if (span.textContent.trim() !== targetLabel) continue;

            var old = li.querySelector('.count-auto');
            if (old) old.remove();

            if (count === 0) return;

            var counter = document.createElement('span');
            counter.className = 'text-secondary ms-2 count-auto';
            counter.textContent = count;
            span.after(counter);
            return;
        }
    }

    function updateAll() {
        for (var i = 0; i < SECTIONS.length; i++) {
            var s = SECTIONS[i];
            var count = countItems(s.collapseId);
            updateAccordionButton(s.collapseId, count);
            updateSideCard(s.key, count);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateAll);
    } else {
        updateAll();
    }

    window.ProfileCounts = { updateAll: updateAll };
})();