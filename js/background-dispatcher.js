/**
 * Background Dispatcher - universal.
 * Loads the first matching background engine based on page context.
 * Requires: <div id="background-trigger" hidden></div>
 *
 * To add a new engine, add a rule to the RULES array.
 * Each rule: { test: fn -> bool, engine: 'filename.js' }
 * The first rule whose test() returns true wins.
 */

(function () {
    'use strict';
    var ENGINES = [
        'console-background.js',
        'particle-background.js',
        'tsp-background.js'
    ];
    var MOBILE_ENGINES = [
        'console-background.js',
        'tsp-background.js'
    ];
    var LAST_KEY = 'background-dispatcher.last-engine';
    function isMobile() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent || '')) {
            return true;
        }
        if (window.matchMedia('(pointer: coarse)').matches) {
            return true;
        }
        return window.innerWidth < 768;
    }
    function pickEngine() {
        if (isMobile()) {
            return MOBILE_ENGINES[Math.floor(Math.random() * MOBILE_ENGINES.length)];
        }
        var candidates = ENGINES.slice();
        var last = null;
        try {
            last = localStorage.getItem(LAST_KEY);
        } catch (e) {
            last = null;
        }
        if (last && candidates.length > 1) {
            var idx = candidates.indexOf(last);
            if (idx !== -1) candidates.splice(idx, 1);
        }
        var engine = candidates[Math.floor(Math.random() * candidates.length)];
        try {
            localStorage.setItem(LAST_KEY, engine);
        } catch (e) {
        }
        return engine;
    }
    function getBasePath() {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].getAttribute('src') || '';
            if (src.indexOf('background-dispatcher.js') !== -1) {
                return src.replace(/background-dispatcher\.js.*$/, '');
            }
        }
        return 'js/';
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
        if (!document.getElementById('background-trigger')) {
            return;
        }
        var base = getBasePath();
        var tried = {};
        function attempt() {
            var engine = pickEngine();
            if (tried[engine]) return;
            tried[engine] = true;
            loadScript(base + engine).catch(function (err) {
                console.error('[background-dispatcher]', err.message);
                attempt();
            });
        }
        attempt();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();