(function () {
    'use strict';

    function isMobile() {
        var ua = navigator.userAgent || '';
        var uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
        var touchDevice =
            window.matchMedia('(pointer: coarse)').matches ||
            window.matchMedia('(hover: none)').matches;
        var smallScreen = window.innerWidth < 768;
        return uaMobile || touchDevice || smallScreen;
    }

    function isProjectsPage() {
        return /projects/i.test(window.location.pathname)
            || /projects/i.test(document.title);
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.async = false;
            s.onload = resolve;
            s.onerror = function () { reject(new Error('Failed to load ' + src)); };
            document.head.appendChild(s);
        });
    }

    function boot() {
        var trigger = document.getElementById('background-trigger');
        if (!trigger) {
            console.warn('[background-dispatcher] #background-trigger not found');
            return;
        }

        var src = (isMobile() || isProjectsPage())
            ? 'js/console-background.js'
            : 'js/particle-background.js';

        console.log('[background-dispatcher] loading', src);

        loadScript(src).catch(function (err) {
            console.error('[background-dispatcher]', err.message);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();