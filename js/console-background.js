/**
 * Console Background — self-typing session log.
 * Multiple scenarios, random pick per session.
 * Activated only when <div id="console-bg-trigger" hidden></div> is present.
 * v0.0.1
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('console-bg-trigger')) return;
        if (document.getElementById('console-bg')) return;

        const container = document.createElement('div');
        container.id = 'console-bg';
        document.body.prepend(container);

        const stream = document.createElement('div');
        stream.id = 'console-bg-stream';
        container.appendChild(stream);

        function isMobileNow() {
            return window.innerWidth < 768;
        }

        function applyLayout() {
            const mobile = isMobileNow();

            container.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: -1;
                pointer-events: none;
                overflow: hidden;
                background: #0d1117;
                font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
                font-size: ${mobile ? '10px' : '13px'};
                line-height: 1.4;
                color: #6c757d;
                opacity: ${mobile ? '0.12' : '0.18'};
            `;

            stream.style.cssText = `
                position: absolute;
                left: ${mobile ? '10px' : '24px'};
                right: ${mobile ? '10px' : '24px'};
                bottom: 0;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                white-space: pre-wrap;
                word-break: break-all;
                overflow-wrap: anywhere;
            `;
        }

        applyLayout();

        const SCENARIO_RESEARCH = [
            { cmd: '$ uname -srm', out: [
                { t: '> Linux 6.12.4-arch1-1 x86_64', c: '#6c757d' }
            ]},
            { cmd: '$ cd ~/research', out: [] },
            { cmd: '$ ls', out: [
                { t: '> pointer-based-security-paradigm   local-data-regeneration-paradigm', c: '#6c757d' },
                { t: '> position-candidate-hypothesis      deterministic-game-engine-report', c: '#6c757d' }
            ]},
            { cmd: '$ cd pointer-based-security-paradigm', out: [] },
            { cmd: '$ ls', out: [
                { t: '> main.tex  references.bib  figures/  Makefile  README.md', c: '#6c757d' }
            ]},
            { cmd: '$ make', out: [
                { t: '> pdflatex -interaction=nonstopmode main.tex', c: '#6c757d' },
                { t: '> bibtex main', c: '#6c757d' },
                { t: '> pdflatex main.tex', c: '#6c757d' },
                { t: '> pdflatex main.tex', c: '#6c757d' },
                { t: '> Output written on main.pdf (24 pages, 342 KiB)', c: '#198754' }
            ]},
            { cmd: '$ git status', out: [
                { t: '> On branch master', c: '#6c757d' },
                { t: '>     modified: main.tex', c: '#dc3545' },
                { t: '>     modified: references.bib', c: '#dc3545' }
            ]},
            { cmd: '$ git add . && git commit -m "docs: final proofreading"', out: [
                { t: '> [master 8f3a1c2] docs: final proofreading', c: '#198754' },
                { t: '> 2 files changed, 18 insertions(+), 7 deletions(-)', c: '#6c757d' }
            ]},
            { cmd: '$ git push origin master', out: [
                { t: '> To github.com:smartlegionlab/pointer-based-security-paradigm.git', c: '#6c757d' },
                { t: '>    a91f2b4..8f3a1c2  master -> master', c: '#198754' }
            ]},
            { cmd: '$ zenodo upload main.pdf --metadata zenodo.json', out: [
                { t: '> uploading 342 KiB', c: '#6c757d' },
                { t: '> DOI: 10.5281/zenodo.17204738', c: '#0dcaf0' },
                { t: '> published', c: '#198754' }
            ]},
            { cmd: '$ curl -s https://zenodo.org/api/records/17204738 | jq .stats', out: [
                { t: '> { views: 1842, downloads: 612, unique_views: 1420 }', c: '#0dcaf0' }
            ]},
            { cmd: '$ orcid-export --format bibtex > orcid.bib', out: [
                { t: '> exported 4 works', c: '#198754' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
        ];

        const SCENARIO_SMARTPASSLIB = [
            { cmd: '$ cd ~/projects/smartpasslib', out: [] },
            { cmd: '$ source .venv/bin/activate', out: [
                { t: '> (.venv) activated', c: '#0dcaf0' }
            ]},
            { cmd: '$ pytest -q', out: [
                { t: '> collecting 128 items', c: '#6c757d' },
                { t: '> ...F..F..', c: '#dc3545' },
                { t: '> 3 failed, 125 passed in 2.41s', c: '#dc3545' }
            ]},
            { cmd: '$ pytest -q tests/test_core.py -v', out: [
                { t: '> FAILED test_sha256_seed_short_input', c: '#dc3545' },
                { t: '> FAILED test_cross_language_parity_go', c: '#dc3545' },
                { t: '> FAILED test_unicode_secret_handling', c: '#dc3545' }
            ]},
            { cmd: '$ git checkout -b fix/deterministic-seed', out: [
                { t: '> Switched to a new branch "fix/deterministic-seed"', c: '#198754' }
            ]},
            { cmd: '$ vim smartpasslib/core.py', out: [
                { t: '> 42,11 → 84,29', c: '#6c757d' },
                { t: '> :wq', c: '#6c757d' }
            ]},
            { cmd: '$ pytest -q', out: [
                { t: '> 128 passed in 2.18s', c: '#198754' },
                { t: '> coverage: 94.2%', c: '#0dcaf0' }
            ]},
            { cmd: '$ python -m smartpasslib --generate --secret "***" --length 24', out: [
                { t: '> SHA-256 seed computed', c: '#6c757d' },
                { t: '> password: Xk9#mP2$vQ7nL4wR8tY6bH3', c: '#198754' }
            ]},
            { cmd: '$ python -m smartpasslib --verify --secret "***" --hash 0x8f4a...', out: [
                { t: '> proof of knowledge without exposure', c: '#6c757d' },
                { t: '> verification: OK', c: '#198754' }
            ]},
            { cmd: '$ git add . && git commit -m "fix: deterministic seed for short inputs and unicode"', out: [
                { t: '> [fix/deterministic-seed 3a1b2c3] fix: deterministic seed', c: '#198754' },
                { t: '> 2 files changed, 42 insertions(+), 11 deletions(-)', c: '#6c757d' }
            ]},
            { cmd: '$ gh pr create --fill', out: [
                { t: '> https://github.com/smartlegionlab/smartpasslib/pull/42', c: '#0dcaf0' }
            ]},
            { cmd: '$ gh pr merge 42 --squash --delete-branch', out: [
                { t: '> Merged pull request #42', c: '#198754' },
                { t: '> Switched to branch "master"', c: '#6c757d' }
            ]},
            { cmd: '$ python -m build', out: [
                { t: '> Successfully built smartpasslib-1.4.1.tar.gz', c: '#198754' },
                { t: '> Successfully built smartpasslib-1.4.1-py3-none-any.whl', c: '#198754' }
            ]},
            { cmd: '$ twine upload dist/*', out: [
                { t: '> View at: https://pypi.org/project/smartpasslib/1.4.1/', c: '#0dcaf0' }
            ]},
            { cmd: '$ cd ../smartpasslib-rs && cargo test --release', out: [
                { t: '> running 42 tests', c: '#6c757d' },
                { t: '> test result: ok. 42 passed; 0 failed', c: '#198754' }
            ]},
            { cmd: '$ cargo publish', out: [
                { t: '> Uploading smartpasslib v0.4.2', c: '#6c757d' },
                { t: '> View at: https://crates.io/crates/smartpasslib', c: '#0dcaf0' }
            ]},
            { cmd: '$ cd ../smartpasslib-go && go test ./...', out: [
                { t: '> ok  github.com/smartlegionlab/smartpasslib-go  0.142s', c: '#198754' }
            ]},
            { cmd: '$ cd ../smartpasslib-csharp && dotnet test', out: [
                { t: '> Passed! - Failed: 0, Passed: 42, Skipped: 0', c: '#198754' }
            ]},
            { cmd: '$ cd ../smartpasslib-kotlin && ./gradlew test', out: [
                { t: '> BUILD SUCCESSFUL in 8s', c: '#198754' }
            ]},
            { cmd: '$ cd ../smartpasslib-js && npm test', out: [
                { t: '> 42 passing (312ms)', c: '#198754' }
            ]},
            { cmd: '$ npm publish', out: [
                { t: '> + smartpasslib@0.4.2', c: '#0dcaf0' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
        ];

        const SCENARIO_TSP = [
            { cmd: '$ cd ~/projects/smart-tsp-solver', out: [] },
            { cmd: '$ source .venv/bin/activate', out: [
                { t: '> (.venv) activated', c: '#0dcaf0' }
            ]},
            { cmd: '$ ls tsplib/', out: [
                { t: '> eil51.tsp  berlin52.tsp  st70.tsp  kroA100.tsp  ch150.tsp', c: '#6c757d' }
            ]},
            { cmd: '$ python -m smart_tsp --solve --input tsplib/eil51.tsp', out: [
                { t: '> loading TSPLIB instance: eil51', c: '#6c757d' },
                { t: '> heuristic solver running', c: '#6c757d' },
                { t: '> iterations: 10,000', c: '#6c757d' },
                { t: '> known optimum: 426', c: '#0dcaf0' },
                { t: '> path length: 428  (gap: 0.47%)', c: '#198754' }
            ]},
            { cmd: '$ python -m smart_tsp --solve --input tsplib/berlin52.tsp', out: [
                { t: '> loading TSPLIB instance: berlin52', c: '#6c757d' },
                { t: '> known optimum: 7542', c: '#0dcaf0' },
                { t: '> path length: 7544  (gap: 0.03%)', c: '#198754' }
            ]},
            { cmd: '$ python -m smart_tsp_benchmark --compare all --instances tsplib/*.tsp', out: [
                { t: '> benchmarking 4 solvers on 5 instances', c: '#6c757d' },
                { t: '> branch & bound  : avg 0.42s   (optimal)', c: '#198754' },
                { t: '> dynamic gravity : avg 0.11s   (-24.7%)', c: '#0dcaf0' },
                { t: '> pch improver    : avg 0.08s   (-8.2%)', c: '#0dcaf0' },
                { t: '> angular-radial  : avg 0.14s   (-18.4%)', c: '#0dcaf0' }
            ]},
            { cmd: '$ cd ../smart-dynamic-gravity-tsp-rs', out: [] },
            { cmd: '$ cargo build --release', out: [
                { t: '> Compiling smart-dynamic-gravity-tsp v0.2.0', c: '#6c757d' },
                { t: '> Finished release [optimized] in 8.42s', c: '#198754' }
            ]},
            { cmd: '$ cargo run --release -- --input ../smart-tsp-solver/tsplib/eil51.tsp', out: [
                { t: '> loading TSPLIB instance: eil51', c: '#6c757d' },
                { t: '> dynamic gravity iterations: 5000', c: '#6c757d' },
                { t: '> best path length: 428', c: '#0dcaf0' },
                { t: '> known optimum: 426 (gap: 0.47%)', c: '#198754' }
            ]},
            { cmd: '$ cd ../smart-pch-tsp-rs', out: [] },
            { cmd: '$ cargo run --release -- --input best_path.json', out: [
                { t: '> applying PCH paradigm', c: '#6c757d' },
                { t: '> statistical analysis of path', c: '#6c757d' },
                { t: '> synthesized shorter path: -8.2%', c: '#198754' }
            ]},
            { cmd: '$ cd ../exact-tsp-solver-rs', out: [] },
            { cmd: '$ cargo run --release -- --input ../smart-tsp-solver/tsplib/berlin52.tsp', out: [
                { t: '> exact Branch & Bound', c: '#6c757d' },
                { t: '> explored nodes: 12,847', c: '#6c757d' },
                { t: '> optimal path: 7542', c: '#198754' },
                { t: '> proven optimal ✓', c: '#198754' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
        ];

        const SCENARIO_2FA = [
            { cmd: '$ cd ~/projects/smart-2fa-manager-cli', out: [] },
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
            { cmd: '$ smart-2fa generate --totp --account aws', out: [
                { t: '> TOTP: 719204', c: '#0dcaf0' },
                { t: '> valid for 21s', c: '#6c757d' }
            ]},
            { cmd: '$ smart-2fa add --account digitalocean --qr', out: [
                { t: '> scanning QR code...', c: '#6c757d' },
                { t: '> secret encrypted (AES-256-GCM)', c: '#0dcaf0' },
                { t: '> account added', c: '#198754' }
            ]},
            { cmd: '$ smart-2fa export --account github --qr out.png', out: [
                { t: '> exporting for Google Authenticator', c: '#6c757d' },
                { t: '> saved: out.png', c: '#198754' }
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
            { cmd: '$ cd ../smart-2fa-secure && pytest -q', out: [
                { t: '> 64 passed in 1.21s', c: '#198754' },
                { t: '> coverage: 96.8%', c: '#0dcaf0' }
            ]},
            { cmd: '$ cd ../smart-2fa-manager-desktop && python -m smart_2fa_gui', out: [
                { t: '> loading Qt5...', c: '#6c757d' },
                { t: '> opened GUI window', c: '#198754' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
        ];

        const SCENARIO_INFRA = [
            { cmd: '$ cd ~', out: [] },
            { cmd: '$ github-ssh-key test', out: [
                { t: '> testing SSH connection to github.com', c: '#6c757d' },
                { t: '> Hi smartlegionlab! You have successfully authenticated.', c: '#198754' }
            ]},
            { cmd: '$ smart-repository-manager sync --all', out: [
                { t: '> fetching repository list from GitHub', c: '#6c757d' },
                { t: '> fetched 75 repositories', c: '#6c757d' },
                { t: '> syncing...', c: '#6c757d' },
                { t: '> synced 75 / 75 OK', c: '#198754' }
            ]},
            { cmd: '$ smart-repository-manager health --check-ssh', out: [
                { t: '> ssh keys validated', c: '#6c757d' },
                { t: '> all remotes reachable', c: '#198754' }
            ]},
            { cmd: '$ forgejo-sync --repo smartpasslib-rs', out: [
                { t: '> pulling master...', c: '#6c757d' },
                { t: '> 3 commits fetched', c: '#198754' }
            ]},
            { cmd: '$ forgejo-sync --all', out: [
                { t: '> syncing 12 Forgejo repositories', c: '#6c757d' },
                { t: '> 12 / 12 up to date', c: '#198754' }
            ]},
            { cmd: '$ github-repos-backup --all --include-gists', out: [
                { t: '> backing up 75 repositories', c: '#6c757d' },
                { t: '> backing up 12 gists', c: '#6c757d' },
                { t: '> archive: backup_2026-09-18.tar.gz', c: '#198754' },
                { t: '> sha256: 8f4a1b2c9d3e...', c: '#0dcaf0' }
            ]},
            { cmd: '$ smart-pip-collector --dir ./projects', out: [
                { t: '> scanning 75 projects', c: '#6c757d' },
                { t: '> collected 128 unique dependencies', c: '#6c757d' },
                { t: '> archives downloaded', c: '#198754' }
            ]},
            { cmd: '$ docker compose -f ~/infra/docker-compose.yml up -d', out: [
                { t: '> Container infra_nginx    Started', c: '#198754' },
                { t: '> Container infra_redis    Started', c: '#198754' },
                { t: '> Container infra_postgres Started', c: '#198754' }
            ]},
            { cmd: '$ docker compose -f ~/infra/docker-compose.yml ps', out: [
                { t: '> NAME             STATUS         PORTS', c: '#6c757d' },
                { t: '> infra_nginx      Up 2 seconds   0.0.0.0:80->80/tcp', c: '#198754' },
                { t: '> infra_redis      Up 3 seconds   6379/tcp', c: '#198754' },
                { t: '> infra_postgres   Up 3 seconds   5432/tcp', c: '#198754' }
            ]},
            { cmd: '$ du -sh ~/backups/2026-09-18', out: [
                { t: '> 2.4G    ~/backups/2026-09-18', c: '#6c757d' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
        ];

        const SCENARIOS = [
            SCENARIO_RESEARCH,
            SCENARIO_SMARTPASSLIB,
            SCENARIO_TSP,
            SCENARIO_2FA,
            SCENARIO_INFRA
        ];

        function maxLines() {
            return isMobileNow() ? 12 : 18;
        }

        function makeLine(color) {
            const mobile = isMobileNow();
            const line = document.createElement('div');
            line.style.cssText = `
                white-space: ${mobile ? 'pre-wrap' : 'pre'};
                word-break: ${mobile ? 'break-all' : 'normal'};
                font-family: inherit;
                font-size: inherit;
                color: ${color || '#6c757d'};
                opacity: 1;
            `;
            const span = document.createElement('span');
            line.appendChild(span);
            stream.appendChild(line);
            return span;
        }

        function typeText(span, text, speed, done) {
            let i = 0;
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
            return new Promise(res => setTimeout(res, ms));
        }

        function trimLines() {
            const limit = maxLines();
            while (stream.children.length > limit) {
                stream.removeChild(stream.firstChild);
            }
        }

        async function playScenario(scenario) {
            for (const step of scenario) {
                if (stopped) return;

                const cmdSpan = makeLine('#c9d1d9');
                await new Promise(res => {
                    typeText(cmdSpan, step.cmd, 22, res);
                });

                await wait(150);

                for (const out of step.out) {
                    if (stopped) return;
                    const span = makeLine(out.c);
                    await wait(90);
                    typeText(span, out.t, 8, null);
                    await wait(50);
                }

                await wait(220);
                trimLines();
            }
        }

        let stopped = false;
        let lastIndex = -1;

        function pickScenario() {
            if (SCENARIOS.length === 1) return SCENARIOS[0];
            let idx;
            do {
                idx = Math.floor(Math.random() * SCENARIOS.length);
            } while (idx === lastIndex);
            lastIndex = idx;
            return SCENARIOS[idx];
        }

        async function loop() {
            while (!stopped) {
                const scenario = pickScenario();
                await playScenario(scenario);
                if (stopped) break;

                await wait(4500);
                stream.innerHTML = '';
            }
        }

        let resizeTimer = null;
        function handleResize() {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                applyLayout();
                trimLines();
            }, 150);
        }

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        document.addEventListener('visibilitychange', () => {
            stopped = document.hidden;
            if (!stopped) loop();
        });

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            container.style.display = 'none';
            return;
        }

        loop();
    });
})();