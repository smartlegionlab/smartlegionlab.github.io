(function () {
    const GRID_ID = 'projectsGrid';
    const SEARCH_ID = 'searchInput';
    const CLEAR_ID = 'clearSearch';
    const FILTER_MENU_ID = 'filterDropdownMenu';
    const FILTER_TEXT_ID = 'selectedFilterText';
    const STATUS_TEXT_ID = 'projectsStatusText';
    const COUNT_BADGE_ID = 'projectsCountBadge';

    const grid = document.getElementById(GRID_ID);
    const dataKey = (grid && grid.dataset.source) || 'PROJECTS';
    const data = (typeof CONFIG !== 'undefined' && CONFIG[dataKey]) ? CONFIG[dataKey] : [];

    const searchInput = document.getElementById(SEARCH_ID);
    const clearBtn = document.getElementById(CLEAR_ID);
    const filterMenu = document.getElementById(FILTER_MENU_ID);
    const filterText = document.getElementById(FILTER_TEXT_ID);
    const statusText = document.getElementById(STATUS_TEXT_ID);
    const countBadge = document.getElementById(COUNT_BADGE_ID);

    let currentFilter = 'all';
    let searchQuery = '';

    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function icon(classes) {
        return '<i class="bi ' + classes + '" aria-hidden="true"></i>';
    }

    function getFiltered() {
        let list = data.slice();
        if (currentFilter !== 'all') {
            const v = currentFilter.toLowerCase();
            list = list.filter(function (p) {
                return p.owner.toLowerCase() === v
                    || p.author.toLowerCase() === v
                    || p.lang.toLowerCase() === v
                    || p.github.toLowerCase() === v;
            });
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(function (p) {
                return p.title.toLowerCase().indexOf(q) !== -1
                    || p.description.toLowerCase().indexOf(q) !== -1
                    || p.author.toLowerCase().indexOf(q) !== -1
                    || p.tags.some(function (t) { return t.toLowerCase().indexOf(q) !== -1; });
            });
        }
        return list;
    }

    function buildCard(p, index, animate) {
        const langCls = p.langDark ? 'text-dark' : 'text-light';
        const langColor = p.langColor || 'rgba(13,110,253,0.3)';
        const badge = '<span class="badge ' + langCls + ' rounded-pill position-absolute smart-badge" style="background: ' + langColor + ';">' + esc(p.lang) + '</span>';

        const titleTag = p.plainTitle ? 'p' : 'h4';
        const title = '<' + titleTag + ' class="mt-2 text-light">' + esc(p.title) + '</' + titleTag + '>';

        let authorInner = icon('bi-person-circle text-secondary me-1') +
            '<a href="' + p.authorLink + '" class="text-decoration-none text-warning small author">' + esc(p.author) + '</a>';
        if (p.version) {
            authorInner += ' <span class="text-warning me-1">' + icon('bi-git') + ' ' + esc(p.version) + '</span>';
        }
        const author = '<div class="mt-1 mb-1">' + authorInner + '</div>';

        const desc = '<div class="pdf-header d-flex justify-content-center align-items-center flex-wrap p-3 smart-text-block flex-grow-1">' +
            '<p class="mb-0 text-center small">' + esc(p.description) + '</p></div>';

        let tags = '';
        p.tags.forEach(function (t) {
            tags += '<span class="badge bg-primary custom-style">' + esc(t) + '</span> ';
        });
        const tagsBlock = '<div class="badges mb-3">' + tags + '</div>';

        let buttons = '<a href="' + p.viewLink + '" class="btn btn-outline-primary">View</a>';
        if (p.github) {
            buttons += '<a target="_blank" href="' + p.github + '" class="btn btn-outline-primary">GitHub ' + icon('bi-box-arrow-in-up-right') + '</a>';
        }
        (p.links || []).forEach(function (l) {
            buttons += '<a target="_blank" href="' + l.href + '" class="btn btn-outline-info">' + esc(l.label) + ' ' + icon('bi-box-arrow-in-up-right') + '</a>';
        });
        const btnBlock = '<div class="btn-group btn-group-sm text-center mt-auto">' + buttons + '</div>';

        const inner = '<div class="p-3 card-custom position-relative explore-block-style w-100 d-flex flex-column h-100 rounded">' +
            badge + '<div class="mb-2">' + title + author + '</div>' + desc + tagsBlock + btnBlock + '</div>';

        const col = document.createElement('div');
        col.className = 'col-lg-6 col-md-12 col-sm-12 col-12 mb-4 d-flex';
        if (animate) {
            col.classList.add('fade-in-up');
            col.style.transitionDelay = Math.min(index, 40) * 0.03 + 's';
        }
        col.innerHTML = inner;
        return col;
    }

    function buildStats(count) {
        const total = data.length;
        if (searchQuery === '' && currentFilter === 'all') {
            return 'found ' + total + ' ' + (total === 1 ? 'item' : 'items');
        }
        const noun = count === 1 ? 'item' : 'items';
        let text = 'found ' + count + ' of ' + total + ' ' + noun;
        if (searchQuery !== '') {
            text += ' --grep="' + searchQuery + '"';
        }
        if (currentFilter !== 'all') {
            const label = filterText ? filterText.textContent.trim().toLowerCase() : currentFilter;
            text += ' --type=' + label;
        }
        return text;
    }

    function renderAll(animate) {
        const list = getFiltered();
        grid.innerHTML = '';
        const frag = document.createDocumentFragment();
        list.forEach(function (p, i) {
            frag.appendChild(buildCard(p, i, animate));
        });
        grid.appendChild(frag);
        if (animate) {
            requestAnimationFrame(function () {
                const cards = grid.querySelectorAll('.fade-in-up');
                Array.prototype.forEach.call(cards, function (c) {
                    c.classList.add('visible');
                });
            });
        }
        if (statusText) {
            statusText.textContent = buildStats(list.length);
        }
    }

    function updateCount() {
        if (countBadge) {
            countBadge.textContent = data.length + '+';
        }
    }

    function applyView() {
        renderAll(false);
    }

    if (grid && data.length) {
        updateCount();
        renderAll(true);

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                searchQuery = searchInput.value.trim();
                applyView();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                    searchQuery = '';
                    applyView();
                }
            });
        }

        if (filterMenu) {
            filterMenu.addEventListener('click', function (event) {
                const item = event.target.closest('.dropdown-item');
                if (!item) return;
                currentFilter = item.getAttribute('data-value') || 'all';
                Array.prototype.forEach.call(filterMenu.querySelectorAll('.dropdown-item'), function (el) {
                    el.classList.toggle('active', el === item);
                });
                if (filterText) {
                    filterText.textContent = item.textContent.trim();
                }
                applyView();
            });
        }
    }
})();