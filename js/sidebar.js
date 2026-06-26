(function() {
    const sidebar = document.getElementById('bootSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggleBtn = document.getElementById('sidebarToggle');
    const closeBtn = document.getElementById('sidebarClose');

    if (!sidebar || !overlay) return;

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (toggleBtn) {
        toggleBtn.onclick = function(e) {
            e.preventDefault();
            openSidebar();
        };
    }

    if (closeBtn) {
        closeBtn.onclick = function(e) {
            e.preventDefault();
            closeSidebar();
        };
    }

    overlay.onclick = function(e) {
        if (e.target === overlay) {
            closeSidebar();
        }
    };

    document.onkeydown = function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    };
})();