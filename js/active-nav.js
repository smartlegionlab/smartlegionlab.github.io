document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const navLinks = document.querySelectorAll('.nav-btn');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const cleanHref = href.replace(/^\//, '');

        if (cleanHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    const mobileNavLinks = document.querySelectorAll('.mobile-nav-btn');

    mobileNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        const cleanHref = href.replace(/^\//, '');

        if (cleanHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (currentPage === 'index.html' || currentPage === '') {
        const homeLink = document.querySelector('a[href="/"], a[href="index.html"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }

        const mobileHomeLink = document.querySelector('.mobile-nav-btn[href="/"], .mobile-nav-btn[href="index.html"]');
        if (mobileHomeLink) {
            mobileHomeLink.classList.add('active');
        }
    }
});
