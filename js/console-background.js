/**
 * Console Background - self-typing session log.
 * Multiple scenarios, random pick per session.
 * Scenarios reflect the lab's focus: research & publications,
 * system architecture, cross-platform ecosystems, core libraries,
 * security apps and infrastructure automation.
 * Activated only when <div id="background-trigger" hidden></div> is present.
 * v0.2.0
 */

(function () {
    'use strict';

    function start() {
        if (!document.getElementById('background-trigger')) return;
        if (document.getElementById('console-bg')) return;

        var style = document.createElement('style');
        style.textContent = '@keyframes console-bg-blink { 0%,100% {opacity:1} 50% {opacity:0} }';
        document.head.appendChild(style);

        var container = document.createElement('div');
        container.id = 'console-bg';
        document.body.prepend(container);

        var stream = document.createElement('div');
        stream.id = 'console-bg-stream';
        container.appendChild(stream);

        var cursor = document.createElement('div');
        cursor.id = 'console-bg-cursor';
        cursor.textContent = '▊';
        stream.appendChild(cursor);

        function isMobileNow() {
            return window.innerWidth < 768;
        }

        function applyLayout() {
            var mobile = isMobileNow();
            container.style.cssText = [
                'position: fixed;',
                'inset: 0;',
                'z-index: 0;',
                'pointer-events: none;',
                'overflow: hidden;',
                'background: #0d1117;',
                "font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;",
                'font-size: ' + (mobile ? '10px' : '13px') + ';',
                'line-height: 1.4;',
                'color: #6c757d;',
                'opacity: ' + (mobile ? '0.2' : '0.3') + ';'
            ].join('\n');
            stream.style.cssText = [
                'position: absolute;',
                'left: ' + (mobile ? '10px' : '24px') + ';',
                'right: ' + (mobile ? '10px' : '24px') + ';',
                'bottom: 0;',
                'display: flex;',
                'flex-direction: column;',
                'justify-content: flex-end;',
                'white-space: pre-wrap;',
                'word-break: break-all;',
                'overflow-wrap: anywhere;'
            ].join('\n');
            cursor.style.cssText = [
                'font-family: inherit;',
                'font-size: inherit;',
                'color: #c9d1d9;',
                'animation: console-bg-blink 1s steps(1) infinite;'
            ].join('\n');
        }
        applyLayout();

        var SCENARIO_RESEARCH = [
            { cmd: '$ uname -srm', out: [
                { t: '> Linux 6.12.4-arch1-1 x86_64', c: '#6c757d' }
            ]},
            { cmd: '$ cd ~/research/cross-platform-architecture-paradigm', out: [] },
            { cmd: '$ ls', out: [
                { t: '> main.tex  sections/  figures/  references.bib  Makefile  README.md', c: '#6c757d' }
            ]},
            { cmd: '$ ls sections/', out: [
                { t: '> 01-introduction.tex  02-fundamental-paradigms.tex', c: '#6c757d' },
                { t: '> 03-ecosystems.tex     04-evaluation.tex', c: '#6c757d' },
                { t: '> 05-conclusion.tex', c: '#6c757d' }
            ]},
            { cmd: '$ git log --oneline -3', out: [
                { t: '> 9c2f1a7 docs: revise evaluation section', c: '#6c757d' },
                { t: '> b8e74a2 docs: add ecosystem comparison table', c: '#6c757d' },
                { t: '> 3f9c21a init: paper skeleton', c: '#6c757d' }
            ]},
            { cmd: '$ make', out: [
                { t: '> pdflatex -interaction=nonstopmode main.tex', c: '#6c757d' },
                { t: '> bibtex main', c: '#6c757d' },
                { t: '> pdflatex main.tex', c: '#6c757d' },
                { t: '> pdflatex main.tex', c: '#6c757d' },
                { t: '> Output written on main.pdf (18 pages, 246 KiB)', c: '#198754' }
            ]},
            { cmd: '$ git add sections/ figures/ && git commit -m "docs: finalize paradigm classification model"', out: [
                { t: '> [master 4d7a90c] docs: finalize paradigm classification model', c: '#198754' },
                { t: '> 5 files changed, 312 insertions(+), 48 deletions(-)', c: '#6c757d' }
            ]},
            { cmd: '$ git push origin master', out: [
                { t: '> To github.com:smartlegionlab/cross-platform-architecture-paradigm.git', c: '#6c757d' },
                { t: '>    b8e74a2..4d7a90c  master -> master', c: '#198754' }
            ]},
            { cmd: '$ zenodo upload main.pdf --metadata zenodo.json', out: [
                { t: '> uploading 246 KiB', c: '#6c757d' },
                { t: '> DOI: 10.5281/zenodo.17205123', c: '#0dcaf0' },
                { t: '> published', c: '#198754' }
            ]},
            { cmd: '$ curl -s https://zenodo.org/api/records/17205123 | jq .stats', out: [
                { t: '> { views: 2031, downloads: 788, unique_views: 1612 }', c: '#0dcaf0' }
            ]},
            { cmd: '$ orcid-export --format bibtex > orcid.bib', out: [
                { t: '> exported 5 works', c: '#198754' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
        ];

        var SCENARIO_ARCHITECTURE = [
            { cmd: '$ cd ~/lab/core-registry', out: [] },
            { cmd: '$ git checkout -b feat/component-registry', out: [
                { t: '> Switched to a new branch "feat/component-registry"', c: '#198754' }
            ]},
            { cmd: '$ ls architecture/', out: [
                { t: '> components.md  data-flow.md  evolution.md', c: '#6c757d' }
            ]},
            { cmd: '$ python -m archgen --input architecture/components.md --output build/components.dot', out: [
                { t: '> parsed 12 components, 17 relations', c: '#6c757d' },
                { t: '> diagram: build/components.dot', c: '#198754' }
            ]},
            { cmd: '$ dot -Tsvg build/components.dot -o build/architecture.svg', out: [
                { t: '> generated architecture.svg (94 KiB)', c: '#198754' }
            ]},
            { cmd: '$ vim src/registry/core.py', out: [
                { t: '> 128,44 → 156,52', c: '#6c757d' },
                { t: '> :wq', c: '#6c757d' }
            ]},
            { cmd: '$ python -m pytest -q', out: [
                { t: '> 156 passed in 1.9s', c: '#198754' },
                { t: '> coverage: 92.7%', c: '#0dcaf0' }
            ]},
            { cmd: '$ git add . && git commit -m "feat: versioned component registry"', out: [
                { t: '> [feat/component-registry a71c2e8] feat: versioned component registry', c: '#198754' }
            ]},
            { cmd: '$ git push -u origin feat/component-registry', out: [
                { t: '> To github.com:smartlegionlab/core-registry.git', c: '#6c757d' },
                { t: '>    * [new branch] feat/component-registry -> feat/component-registry', c: '#198754' }
            ]},
            { cmd: '$ gh pr create --title "feat: versioned component registry" --fill', out: [
                { t: '> https://github.com/smartlegionlab/core-registry/pull/58', c: '#0dcaf0' }
            ]},
            { cmd: '$ gh pr checks 58', out: [
                { t: '> all checks passed ✓', c: '#198754' }
            ]},
            { cmd: '$ gh pr merge 58 --squash --delete-branch', out: [
                { t: '> Merged pull request #58', c: '#198754' },
                { t: '> Switched to branch "master"', c: '#6c757d' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
        ];

        var SCENARIO_ECOSYSTEM = [
            { cmd: '$ cd ~/lab/smartpasslib', out: [] },
            { cmd: '$ git pull --rebase', out: [
                { t: '> Updating 4d7a90c..b31c2f5', c: '#198754' }
            ]},
            { cmd: '$ source .venv/bin/activate', out: [
                { t: '> (.venv) activated', c: '#0dcaf0' }
            ]},
            { cmd: '$ python -m pytest -q', out: [
                { t: '> 128 passed in 2.1s', c: '#198754' },
                { t: '> coverage: 94.2%', c: '#0dcaf0' }
            ]},
            { cmd: '$ python -m build', out: [
                { t: '> Successfully built smartpasslib-1.5.0.tar.gz', c: '#198754' },
                { t: '> Successfully built smartpasslib-1.5.0-py3-none-any.whl', c: '#198754' }
            ]},
            { cmd: '$ twine upload dist/*', out: [
                { t: '> View at: https://pypi.org/project/smartpasslib/1.5.0/', c: '#0dcaf0' }
            ]},
            { cmd: '$ cd ../smartpasslib-rs && cargo test --release', out: [
                { t: '> running 42 tests', c: '#6c757d' },
                { t: '> test result: ok. 42 passed; 0 failed', c: '#198754' }
            ]},
            { cmd: '$ cargo publish', out: [
                { t: '> Uploading smartpasslib v0.5.0', c: '#6c757d' },
                { t: '> View at: https://crates.io/crates/smartpasslib', c: '#0dcaf0' }
            ]},
            { cmd: '$ cd ../smartpasslib-go && go test ./...', out: [
                { t: '> ok  github.com/smartlegionlab/smartpasslib-go  0.118s', c: '#198754' }
            ]},
            { cmd: '$ cd ../smartpasslib-kotlin && ./gradlew test', out: [
                { t: '> BUILD SUCCESSFUL in 9s', c: '#198754' }
            ]},
            { cmd: '$ cd ../smartpasslib-csharp && dotnet test', out: [
                { t: '> Passed! - Failed: 0, Passed: 42, Skipped: 0', c: '#198754' }
            ]},
            { cmd: '$ cd ../smartpasslib-js && npm test', out: [
                { t: '> 42 passing (318ms)', c: '#198754' }
            ]},
            { cmd: '$ npm publish', out: [
                { t: '> + smartpasslib@0.5.0', c: '#0dcaf0' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
        ];

        var SCENARIO_ALGORITHM = [
            { cmd: '$ cd ~/research/tsp-solvers', out: [] },
            { cmd: '$ ls tsplib/', out: [
                { t: '> eil51.tsp  berlin52.tsp  st70.tsp  kroA100.tsp  ch150.tsp', c: '#6c757d' }
            ]},
            { cmd: '$ python -m bench --solver dynamic-gravity --instances tsplib/eil51.tsp', out: [
                { t: '> loading TSPLIB instance: eil51', c: '#6c757d' },
                { t: '> known optimum: 426', c: '#0dcaf0' },
                { t: '> iterations: 10,000', c: '#6c757d' },
                { t: '> best path: 428  (gap: 0.47%)', c: '#198754' }
            ]},
            { cmd: '$ python -m bench --compare all --instances tsplib/*.tsp', out: [
                { t: '> benchmarking 4 solvers on 5 instances', c: '#6c757d' },
                { t: '> branch & bound  : avg 0.42s   (optimal)', c: '#198754' },
                { t: '> dynamic gravity : avg 0.11s   (-24.7%)', c: '#0dcaf0' },
                { t: '> pch improver    : avg 0.08s   (-8.2%)', c: '#0dcaf0' },
                { t: '> angular-radial  : avg 0.14s   (-18.4%)', c: '#0dcaf0' }
            ]},
            { cmd: '$ python -m smart_tsp --solve --input tsplib/berlin52.tsp', out: [
                { t: '> loading TSPLIB instance: berlin52', c: '#6c757d' },
                { t: '> known optimum: 7542', c: '#0dcaf0' },
                { t: '> path length: 7544  (gap: 0.03%)', c: '#198754' }
            ]},
            { cmd: '$ git add . && git commit -m "perf: improve dynamic gravity convergence"', out: [
                { t: '> [master c4d20f7] perf: improve dynamic gravity convergence', c: '#198754' },
                { t: '> 3 files changed, 42 insertions(+), 11 deletions(-)', c: '#6c757d' }
            ]},
            { cmd: '$ python -m bench --report --output report.html', out: [
                { t: '> report saved: report.html', c: '#198754' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
        ];

        var SCENARIO_SECURITY = [
            { cmd: '$ cd ~/apps/smart-2fa-manager', out: [] },
            { cmd: '$ source .venv/bin/activate', out: [
                { t: '> (.venv) activated', c: '#0dcaf0' }
            ]},
            { cmd: '$ smart-2fa list', out: [
                { t: '> github      TOTP  SHA1    6 digits  30s', c: '#6c757d' },
                { t: '> gitlab      TOTP  SHA1    6 digits  30s', c: '#6c757d' },
                { t: '> aws         TOTP  SHA256  6 digits  30s', c: '#6c757d' }
            ]},
            { cmd: '$ smart-2fa generate --totp --account github', out: [
                { t: '> TOTP: 482913', c: '#0dcaf0' },
                { t: '> valid for 28s', c: '#6c757d' }
            ]},
            { cmd: '$ smart-2fa add --account digitalocean --qr', out: [
                { t: '> scanning QR code...', c: '#6c757d' },
                { t: '> secret encrypted (AES-256-GCM)', c: '#0dcaf0' },
                { t: '> account added', c: '#198754' }
            ]},
            { cmd: '$ smart-2fa backup --encrypt --gpg', out: [
                { t: '> encrypting with AES-256-GCM', c: '#6c757d' },
                { t: '> GPG signing backup', c: '#6c757d' },
                { t: '> backup saved: 2fa_backup.gpg', c: '#198754' }
            ]},
            { cmd: '$ smart-2fa verify backup 2fa_backup.gpg', out: [
                { t: '> GPG signature: valid', c: '#198754' },
                { t: '> decrypting...', c: '#6c757d' },
                { t: '> 4 accounts restored', c: '#198754' }
            ]},
            { cmd: '$ python -m pytest -q', out: [
                { t: '> 64 passed in 1.1s', c: '#198754' },
                { t: '> coverage: 96.8%', c: '#0dcaf0' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
        ];

        var SCENARIO_INFRA = [
            { cmd: '$ cd ~/lab/infra', out: [] },
            { cmd: '$ lab repos sync --all', out: [
                { t: '> fetching repository list from GitHub', c: '#6c757d' },
                { t: '> fetched 75 repositories', c: '#6c757d' },
                { t: '> synced 75 / 75 OK', c: '#198754' }
            ]},
            { cmd: '$ lab repos health --check-ssh', out: [
                { t: '> ssh keys validated', c: '#6c757d' },
                { t: '> all remotes reachable', c: '#198754' }
            ]},
            { cmd: '$ lab repos backup --all --include-gists', out: [
                { t: '> backing up 75 repositories', c: '#6c757d' },
                { t: '> backing up 12 gists', c: '#6c757d' },
                { t: '> archive: backup_2026-09-18.tar.gz', c: '#198754' },
                { t: '> sha256: 8f4a1b2c9d3e...', c: '#0dcaf0' }
            ]},
            { cmd: '$ docker compose up -d', out: [
                { t: '> Container infra_nginx    Started', c: '#198754' },
                { t: '> Container infra_redis    Started', c: '#198754' },
                { t: '> Container infra_postgres Started', c: '#198754' }
            ]},
            { cmd: '$ docker compose ps', out: [
                { t: '> NAME             STATUS         PORTS', c: '#6c757d' },
                { t: '> infra_nginx      Up 2 seconds   0.0.0.0:80->80/tcp', c: '#198754' },
                { t: '> infra_redis      Up 3 seconds   6379/tcp', c: '#198754' },
                { t: '> infra_postgres   Up 3 seconds   5432/tcp', c: '#198754' }
            ]},
            { cmd: '$ curl -s localhost/health | jq .', out: [
                { t: '> { "status": "ok", "services": 3, "uptime": "2s" }', c: '#0dcaf0' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
        ];

        var SCENARIOS = [
            SCENARIO_RESEARCH,
            SCENARIO_ARCHITECTURE,
            SCENARIO_ECOSYSTEM,
            SCENARIO_ALGORITHM,
            SCENARIO_SECURITY,
            SCENARIO_INFRA
        ];

        function maxLines() {
            return isMobileNow() ? 12 : 18;
        }

        function makeLine(color) {
            var mobile = isMobileNow();
            var line = document.createElement('div');
            line.style.cssText = [
                'white-space: ' + (mobile ? 'pre-wrap' : 'pre') + ';',
                'word-break: ' + (mobile ? 'break-all' : 'normal') + ';',
                'font-family: inherit;',
                'font-size: inherit;',
                'color: ' + (color || '#6c757d') + ';',
                'opacity: 1;'
            ].join('\n');
            var span = document.createElement('span');
            line.appendChild(span);
            stream.insertBefore(line, cursor);
            return span;
        }

        function typeText(span, text, speed, done) {
            var i = 0;
            function tick() {
                if (i <= text.length) {
                    span.textContent = text.slice(0, i);
                    i++;
                    setTimeout(tick, speed);
                } else if (done) {
                    done();
                }
            }
            tick();
        }

        function wait(ms) {
            return new Promise(function (res) { setTimeout(res, ms); });
        }

        function trimLines() {
            var limit = maxLines();
            while (stream.children.length - 1 > limit) {
                stream.removeChild(stream.firstChild);
            }
        }

        function clearStream() {
            while (stream.firstChild && stream.firstChild !== cursor) {
                stream.removeChild(stream.firstChild);
            }
        }

        async function playScenario(scenario) {
            for (var s = 0; s < scenario.length; s++) {
                var step = scenario[s];
                if (stopped) return;
                var cmdSpan = makeLine('#c9d1d9');
                await new Promise(function (res) { typeText(cmdSpan, step.cmd, 22, res); });
                await wait(150);
                for (var o = 0; o < step.out.length; o++) {
                    if (stopped) return;
                    var out = step.out[o];
                    var span = makeLine(out.c);
                    await wait(90);
                    typeText(span, out.t, 8, null);
                    await wait(50);
                }
                await wait(220);
                trimLines();
            }
        }

        var stopped = false;
        var running = false;
        var lastIndex = -1;

        function pickScenario() {
            if (SCENARIOS.length === 1) return SCENARIOS[0];
            var idx;
            do {
                idx = Math.floor(Math.random() * SCENARIOS.length);
            } while (idx === lastIndex);
            lastIndex = idx;
            return SCENARIOS[idx];
        }

        async function loop() {
            if (running) return;
            running = true;
            while (!stopped) {
                var scenario = pickScenario();
                await playScenario(scenario);
                if (stopped) break;
                await wait(4500);
                if (stopped) break;
                clearStream();
            }
            running = false;
        }

        var resizeTimer = null;
        function handleResize() {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                applyLayout();
                trimLines();
            }, 150);
        }

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        document.addEventListener('visibilitychange', function () {
            stopped = document.hidden;
            if (!stopped) loop();
        });

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            (function () {
                container.style.opacity = '0.35';
                var scenario = pickScenario();
                scenario.forEach(function (step) {
                    var cmd = makeLine('#c9d1d9');
                    cmd.textContent = step.cmd;
                    step.out.forEach(function (out) {
                        var line = makeLine(out.c);
                        line.textContent = out.t;
                    });
                });
            })();
            return;
        }

        loop();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();