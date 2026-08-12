document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('searchInput');
    var clearSearch = document.getElementById('clearSearch');
    var filterDropdownMenu = document.getElementById('filterDropdownMenu');
    var selectedFilterText = document.getElementById('selectedFilterText');
    var searchStats = document.getElementById('searchStats');

    if (!searchInput || !filterDropdownMenu) return;

    var cards = document.querySelectorAll('.col-lg-6.mb-4.d-flex');
    var currentFilter = 'all';

    function updateDropdownText(value) {
        if (!selectedFilterText) return;
        var items = filterDropdownMenu.querySelectorAll('.dropdown-item');
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('active');
            if (items[i].getAttribute('data-value') === value) {
                selectedFilterText.textContent = items[i].textContent;
                items[i].classList.add('active');
            }
        }
    }

    function filterItems() {
        var term = searchInput.value.toLowerCase().trim();
        var filterValue = currentFilter;
        var visibleCount = 0;

        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var badge = card.querySelector('.smart-badge');
            var author = card.querySelector('.author');
            var badgeText = badge ? badge.textContent.trim().toLowerCase() : '';
            var authorText = author ? author.textContent.trim().toLowerCase() : '';
            var fullText = card.textContent.toLowerCase();

            var matchSearch = term === '' || fullText.indexOf(term) !== -1;
            var matchFilter = filterValue === 'all' || badgeText === filterValue || authorText === filterValue;

            if (matchSearch && matchFilter) {
                card.style.setProperty('display', 'flex', 'important');
                visibleCount++;
            } else {
                card.style.setProperty('display', 'none', 'important');
            }
        }

        var total = cards.length;
        var pageName = document.title.split('·')[0].trim() || 'items';
        var statsText = 'Found ' + visibleCount + ' ' + pageName.toLowerCase() + (visibleCount !== 1 ? 's' : '');
        if (term !== '') {
            statsText += ' matching "' + term + '"';
        }
        if (filterValue !== 'all') {
            var filterLabel = selectedFilterText ? selectedFilterText.textContent : filterValue;
            statsText += ' in ' + filterLabel;
        }
        if (visibleCount === total && term === '' && filterValue === 'all') {
            statsText = 'Showing all ' + total + ' ' + pageName.toLowerCase();
        }
        if (searchStats) searchStats.textContent = statsText;
    }

    searchInput.addEventListener('input', filterItems);

    filterDropdownMenu.addEventListener('click', function(e) {
        var target = e.target.closest('.dropdown-item');
        if (!target) return;
        var value = target.getAttribute('data-value');
        if (value !== null) {
            currentFilter = value;
            updateDropdownText(value);
            filterItems();
            var dropdownToggle = document.getElementById('filterDropdown');
            if (dropdownToggle && typeof bootstrap !== 'undefined') {
                var dropdown = bootstrap.Dropdown.getInstance(dropdownToggle);
                if (dropdown) dropdown.hide();
            }
        }
    });

    if (clearSearch) {
        clearSearch.addEventListener('click', function() {
            searchInput.value = '';
            filterItems();
            searchInput.focus();
        });
    }

    updateDropdownText('all');
    filterItems();
});