/**
 * Background Dispatcher — universal.
 * Loads the first matching background engine based on page context.
 * Requires: <div id="background-trigger" hidden></div>
 *
 * To add a new engine, add a rule to the RULES array.
 * Each rule: { test: fn -> bool, engine: 'filename.js' }
 * The first rule whose test() returns true wins.
 */

(function () {
    'use strict';

    var DEFAULT_ENGINE = 'particle-background.js';

    var RULES = [
        {
            test: function (ctx) { return ctx.isMobile; },
            engine: 'tsp-background.js'
        },
        {
            test: function (ctx) { return ctx.matchesPath(/projects/i); },
            engine: 'console-background.js'
        }
    ];

    function buildContext() {
        var ua = navigator.userAgent || '';
        var uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
        var touchDevice =
            window.matchMedia('(pointer: coarse)').matches ||
            window.matchMedia('(hover: none)').matches;
        var smallScreen = window.innerWidth < 768;

        var pathname = window.location.pathname;

        return {
            isMobile: uaMobile || touchDevice || smallScreen,
            isTouch: touchDevice,
            isSmallScreen: smallScreen,
            pathname: pathname,
            matchesPath: function (re) { return re.test(pathname); }
        };
    }

    function pickEngine(ctx) {
        for (var i = 0; i < RULES.length; i++) {
            var rule = RULES[i];
            try {
                if (rule.test(ctx)) return rule.engine;
            } catch (e) {
                console.warn('[background-dispatcher] rule failed', e);
            }
        }
        return DEFAULT_ENGINE;
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
            console.warn('[background-dispatcher] #background-trigger not found');
            return;
        }

        var ctx = buildContext();
        var base = getBasePath();
        var src = base + pickEngine(ctx);

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