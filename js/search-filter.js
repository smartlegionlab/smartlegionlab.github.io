document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('searchInput');
    var clearSearch = document.getElementById('clearSearch');
    var filterSelect = document.getElementById('filterSelect');
    var searchStats = document.getElementById('searchStats');

    if (!searchInput || !filterSelect) return;

    var cards = document.querySelectorAll('.col-lg-6.mb-4.d-flex');

    function filterItems() {
        var term = searchInput.value.toLowerCase().trim();
        var filterValue = filterSelect.value;
        var visibleCount = 0;

        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var badge = card.querySelector('.smart-badge');
            var author = card.querySelector('.author');
            var badgeText = badge ? badge.textContent.trim().toLowerCase() : '';
            var authorText = author ? author.textContent.trim().toLowerCase() : '';
            console.log(authorText)
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
            statsText += ' in ' + filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
        }
        if (visibleCount === total && term === '' && filterValue === 'all') {
            statsText = 'Showing all ' + total + ' ' + pageName.toLowerCase();
        }
        if (searchStats) searchStats.textContent = statsText;
    }

    searchInput.addEventListener('input', filterItems);
    filterSelect.addEventListener('change', filterItems);

    if (clearSearch) {
        clearSearch.addEventListener('click', function() {
            searchInput.value = '';
            filterItems();
            searchInput.focus();
        });
    }

    filterItems();
});