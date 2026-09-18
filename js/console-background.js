/**
 * Console Background — self-typing coherent session log.
 * Activated only when <div id="console-bg-trigger" hidden></div> is present.
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

        const SCENARIOS = [
            // --- Session start ---
            { cmd: '$ uname -a', out: [
                { t: '> Linux arch 6.12.4 x86_64 GNU/Linux', c: '#6c757d' }
            ]},
            { cmd: '$ cd ~/projects', out: [] },
            { cmd: '$ ls', out: [
                { t: '> smartpasslib        smart-tsp-solver       smart-2fa-manager-cli', c: '#6c757d' },
                { t: '> smart-babylon       name-gender-nn         blockchain', c: '#6c757d' },
                { t: '> smart-repo-manager  qr-codes-generator     personal-tg-bot', c: '#6c757d' },
                { t: '> ... 75 repositories total', c: '#0dcaf0' }
            ]},

            // --- Research: paradigms ---
            { cmd: '$ cd ~/research/pointer-based-security-paradigm', out: [] },
            { cmd: '$ ls *.tex', out: [
                { t: '> main.tex  references.bib  figures/  Makefile', c: '#6c757d' }
            ]},
            { cmd: '$ make', out: [
                { t: '> pdflatex main.tex', c: '#6c757d' },
                { t: '> bibtex main', c: '#6c757d' },
                { t: '> pdflatex main.tex (x2)', c: '#6c757d' },
                { t: '> Output written on main.pdf (24 pages, 342 KiB)', c: '#198754' }
            ]},
            { cmd: '$ zenodo upload main.pdf --doi', out: [
                { t: '> uploading to Zenodo...', c: '#6c757d' },
                { t: '> DOI: 10.5281/zenodo.17204738', c: '#0dcaf0' },
                { t: '> published', c: '#198754' }
            ]},

            // --- Clone & setup ---
            { cmd: '$ cd ~/projects', out: [] },
            { cmd: '$ git clone git@github.com:smartlegionlab/smartpasslib.git', out: [
                { t: '> Cloning into "smartpasslib"...', c: '#6c757d' },
                { t: '> Receiving objects: 100% (1248/1248)', c: '#198754' },
                { t: '> Resolving deltas: 100% (712/712), done.', c: '#198754' }
            ]},
            { cmd: '$ cd smartpasslib', out: [] },
            { cmd: '$ python -m venv .venv && source .venv/bin/activate', out: [
                { t: '> (.venv) activated', c: '#0dcaf0' }
            ]},
            { cmd: '$ pip install -r requirements.txt', out: [
                { t: '> Collecting cryptography>=42.0', c: '#6c757d' },
                { t: '> Collecting pyqt5>=5.15', c: '#6c757d' },
                { t: '> Successfully installed 24 packages', c: '#198754' }
            ]},

            // --- Test ---
            { cmd: '$ pytest -q tests/', out: [
                { t: '> collecting 128 items...', c: '#6c757d' },
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

            // --- Fix ---
            { cmd: '$ vim smartpasslib/core.py', out: [
                { t: '> editing core.py', c: '#6c757d' },
                { t: '> :wq', c: '#6c757d' }
            ]},
            { cmd: '$ pytest -q tests/', out: [
                { t: '> 128 passed in 2.18s', c: '#198754' },
                { t: '> coverage: 94.2%', c: '#0dcaf0' }
            ]},

            // --- Password generation demo ---
            { cmd: '$ python -m smartpasslib --generate --secret "***" --length 24', out: [
                { t: '> SHA-256 seed computed', c: '#6c757d' },
                { t: '> deterministic hash: 0x8f4a1b2c9d3e', c: '#0dcaf0' },
                { t: '> password: Xk9#mP2$vQ7nL4wR8tY6bH3', c: '#198754' }
            ]},
            { cmd: '$ python -m smartpasslib --verify --secret "***" --hash 0x8f4a...', out: [
                { t: '> proof of knowledge without exposure', c: '#6c757d' },
                { t: '> verification: OK', c: '#198754' }
            ]},

            // --- Commit & PR ---
            { cmd: '$ git status', out: [
                { t: '> On branch fix/deterministic-seed', c: '#6c757d' },
                { t: '>     modified: smartpasslib/core.py', c: '#dc3545' },
                { t: '>     modified: tests/test_core.py', c: '#dc3545' }
            ]},
            { cmd: '$ git add .', out: [
                { t: '> staged 2 files', c: '#6c757d' }
            ]},
            { cmd: '$ git commit -m "fix: deterministic seed for short inputs and unicode"', out: [
                { t: '> [fix/deterministic-seed 3a1b2c3] fix: deterministic seed', c: '#198754' },
                { t: '> 2 files changed, 42 insertions(+), 11 deletions(-)', c: '#6c757d' }
            ]},
            { cmd: '$ git push -u origin fix/deterministic-seed', out: [
                { t: '> To github.com:smartlegionlab/smartpasslib.git', c: '#6c757d' },
                { t: '>  * [new branch]      fix/deterministic-seed -> fix/deterministic-seed', c: '#198754' }
            ]},
            { cmd: '$ gh pr create --fill', out: [
                { t: '> Creating pull request...', c: '#6c757d' },
                { t: '> https://github.com/smartlegionlab/smartpasslib/pull/42', c: '#0dcaf0' }
            ]},
            { cmd: '$ gh pr merge 42 --squash --delete-branch', out: [
                { t: '> Merged pull request #42', c: '#198754' },
                { t: '> Deleted branch fix/deterministic-seed', c: '#6c757d' },
                { t: '> Switched to branch "master"', c: '#6c757d' }
            ]},

            // --- Release ---
            { cmd: '$ git pull origin master', out: [
                { t: '> Already up to date.', c: '#6c757d' }
            ]},
            { cmd: '$ python -m build', out: [
                { t: '> Building sdist and wheel...', c: '#6c757d' },
                { t: '> Successfully built smartpasslib-1.4.1.tar.gz', c: '#198754' },
                { t: '> Successfully built smartpasslib-1.4.1-py3-none-any.whl', c: '#198754' }
            ]},
            { cmd: '$ twine upload dist/*', out: [
                { t: '> Uploading smartpasslib-1.4.1-py3-none-any.whl', c: '#6c757d' },
                { t: '> View at: https://pypi.org/project/smartpasslib/1.4.1/', c: '#0dcaf0' }
            ]},
            { cmd: '$ gh release create v1.4.1 --generate-notes', out: [
                { t: '> creating release v1.4.1', c: '#6c757d' },
                { t: '> uploaded 3 assets', c: '#198754' }
            ]},

            // --- Cross-language parity: Rust ---
            { cmd: '$ cd ../smartpasslib-rs', out: [] },
            { cmd: '$ cargo build --release', out: [
                { t: '> Compiling smartpasslib v0.4.2', c: '#6c757d' },
                { t: '> Finished release [optimized] in 12.84s', c: '#198754' }
            ]},
            { cmd: '$ cargo test', out: [
                { t: '> running 42 tests', c: '#6c757d' },
                { t: '> test result: ok. 42 passed; 0 failed', c: '#198754' }
            ]},
            { cmd: '$ cargo publish', out: [
                { t: '> Uploading smartpasslib v0.4.2', c: '#6c757d' },
                { t: '> View at: https://crates.io/crates/smartpasslib', c: '#0dcaf0' }
            ]},

            // --- Cross-language parity: Go ---
            { cmd: '$ cd ../smartpasslib-go', out: [] },
            { cmd: '$ go test ./...', out: [
                { t: '> ok  github.com/smartlegionlab/smartpasslib-go  0.142s', c: '#198754' }
            ]},
            { cmd: '$ go build -o smartpasslib .', out: [
                { t: '> built binary: smartpasslib', c: '#198754' }
            ]},

            // --- Cross-language parity: C# ---
            { cmd: '$ cd ../smartpasslib-csharp', out: [] },
            { cmd: '$ dotnet test', out: [
                { t: '> Passed! - Failed: 0, Passed: 42, Skipped: 0', c: '#198754' }
            ]},
            { cmd: '$ dotnet pack -c Release', out: [
                { t: '> Successfully created package SmartPassLib.0.4.2.nupkg', c: '#198754' }
            ]},

            // --- Cross-language parity: Kotlin ---
            { cmd: '$ cd ../smartpasslib-kotlin', out: [] },
            { cmd: '$ ./gradlew test', out: [
                { t: '> BUILD SUCCESSFUL in 8s', c: '#198754' },
                { t: '> 42 tests passed', c: '#198754' }
            ]},

            // --- Cross-language parity: JS ---
            { cmd: '$ cd ../smartpasslib-js', out: [] },
            { cmd: '$ npm test', out: [
                { t: '> 42 passing (312ms)', c: '#198754' }
            ]},
            { cmd: '$ npm publish', out: [
                { t: '> + smartpasslib@0.4.2', c: '#0dcaf0' }
            ]},

            // --- TSP solvers ---
            { cmd: '$ cd ../smart-tsp-solver', out: [] },
            { cmd: '$ python -m smart_tsp --solve --input cities.txt', out: [
                { t: '> running heuristic solver', c: '#6c757d' },
                { t: '> iterations: 10,000', c: '#6c757d' },
                { t: '> improved vs reference by 24.7%', c: '#0dcaf0' },
                { t: '> path length: 3,812', c: '#198754' }
            ]},
            { cmd: '$ python -m smart_tsp_benchmark --compare all', out: [
                { t: '> benchmarking 4 solvers', c: '#6c757d' },
                { t: '> branch & bound  : 0.42s (optimal)', c: '#198754' },
                { t: '> dynamic gravity : 0.11s (-24.7%)', c: '#0dcaf0' },
                { t: '> pch improver    : 0.08s (-8.2%)', c: '#0dcaf0' },
                { t: '> angular-radial  : 0.14s (-18.4%)', c: '#0dcaf0' }
            ]},

            // --- Rust TSP ---
            { cmd: '$ cd ../smart-dynamic-gravity-tsp-rs', out: [] },
            { cmd: '$ cargo run --release -- --input tsplib/eil51.tsp', out: [
                { t: '> loading TSPLIB instance: eil51', c: '#6c757d' },
                { t: '> dynamic gravity iterations: 5000', c: '#6c757d' },
                { t: '> best path length: 428', c: '#0dcaf0' },
                { t: '> known optimum: 426 (gap: 0.47%)', c: '#198754' }
            ]},

            // --- PCH improver ---
            { cmd: '$ cd ../smart-pch-tsp-rs', out: [] },
            { cmd: '$ cargo run --release -- --input best_path.json', out: [
                { t: '> applying PCH paradigm', c: '#6c757d' },
                { t: '> statistical analysis of path', c: '#6c757d' },
                { t: '> synthesized shorter path: -8.2%', c: '#198754' }
            ]},

            // --- Babylon ---
            { cmd: '$ cd ../smart-babylon-library', out: [] },
            { cmd: '$ python -m smart_babylon --book 42 --page 7', out: [
                { t: '> coordinates: (42, 7)', c: '#6c757d' },
                { t: '> deterministic generation complete', c: '#198754' },
                { t: '> text regenerated from seed', c: '#0dcaf0' }
            ]},
            { cmd: '$ cd ../babylonian-image-library', out: [] },
            { cmd: '$ python -m babylonian_image --coord 128,64 --size 512', out: [
                { t: '> generating image from coordinates', c: '#6c757d' },
                { t: '> deterministic output ready', c: '#198754' }
            ]},

            // --- Neural network ---
            { cmd: '$ cd ../name-gender-nn-py', out: [] },
            { cmd: '$ python -m name_gender_nn --train dataset.txt', out: [
                { t: '> loading dataset...', c: '#6c757d' },
                { t: '> epoch 10/10  loss 0.0412  acc 0.987', c: '#0dcaf0' },
                { t: '> model trained', c: '#198754' }
            ]},
            { cmd: '$ python -m name_gender_nn --predict "Alexander"', out: [
                { t: '> prediction: male (0.998)', c: '#198754' }
            ]},
            { cmd: '$ cd ../name-gender-nn-rs && cargo run --release -- --predict "Sophia"', out: [
                { t: '> prediction: female (0.994)', c: '#198754' }
            ]},

            // --- 2FA ---
            { cmd: '$ cd ../smart-2fa-manager-cli', out: [] },
            { cmd: '$ smart-2fa generate --totp --account github', out: [
                { t: '> TOTP: 482913', c: '#0dcaf0' },
                { t: '> valid for 28s', c: '#6c757d' }
            ]},
            { cmd: '$ smart-2fa backup --encrypt --gpg', out: [
                { t: '> encrypting with AES-256-GCM', c: '#6c757d' },
                { t: '> backup saved: 2fa_backup.gpg', c: '#198754' }
            ]},

            // --- Deploy ---
            { cmd: '$ cd ../smart-social-network', out: [] },
            { cmd: '$ docker compose up -d', out: [
                { t: '> Creating network "sll_default"', c: '#6c757d' },
                { t: '> Container sll_redis  Started', c: '#198754' },
                { t: '> Container sll_db     Started', c: '#198754' },
                { t: '> Container sll_app    Started', c: '#198754' }
            ]},
            { cmd: '$ docker compose exec app python manage.py migrate', out: [
                { t: '> Applying contenttypes... OK', c: '#198754' },
                { t: '> Applying auth... OK', c: '#198754' },
                { t: '> Applying smart_social... OK', c: '#198754' }
            ]},
            { cmd: '$ docker compose ps', out: [
                { t: '> NAME        STATUS         PORTS', c: '#6c757d' },
                { t: '> sll_app     Up 2 seconds   0.0.0.0:8000->8000/tcp', c: '#198754' },
                { t: '> sll_db      Up 3 seconds   5432/tcp', c: '#198754' },
                { t: '> sll_redis   Up 3 seconds   6379/tcp', c: '#198754' }
            ]},

            // --- Blockchain ---
            { cmd: '$ cd ../blockchain && python -m blockchain start --port 5000', out: [
                { t: '> genesis block created', c: '#6c757d' },
                { t: '> consensus: PoW', c: '#6c757d' },
                { t: '> node listening on http://0.0.0.0:5000', c: '#198754' }
            ]},

            // --- Bot ---
            { cmd: '$ cd ../personal-telegram-bot && python -m bot', out: [
                { t: '> bot started', c: '#198754' },
                { t: '> polling updates...', c: '#6c757d' }
            ]},

            // --- Sync & backup ---
            { cmd: '$ cd ~', out: [] },
            { cmd: '$ smart-repository-manager sync --all', out: [
                { t: '> fetched 75 repositories', c: '#6c757d' },
                { t: '> synced 75 / 75 OK', c: '#198754' }
            ]},
            { cmd: '$ smart-repository-manager health --check-ssh', out: [
                { t: '> ssh keys validated', c: '#6c757d' },
                { t: '> all remotes reachable', c: '#198754' }
            ]},
            { cmd: '$ forgejo-sync --repo smartpasslib-rs', out: [
                { t: '> pulling master...', c: '#6c757d' },
                { t: '> 3 commits fetched', c: '#198754' },
                { t: '> repository up to date', c: '#0dcaf0' }
            ]},
            { cmd: '$ github-repos-backup --all --include-gists', out: [
                { t: '> backing up 75 repositories', c: '#6c757d' },
                { t: '> backing up 12 gists', c: '#6c757d' },
                { t: '> archive created: backup_2026-09-18.tar.gz', c: '#198754' }
            ]},
            { cmd: '$ github-ssh-key test', out: [
                { t: '> testing SSH connection to github.com', c: '#6c757d' },
                { t: '> Hi smartlegionlab! You have successfully authenticated.', c: '#198754' }
            ]},

            // --- Extras ---
            { cmd: '$ smart-pip-collector --dir ./projects', out: [
                { t: '> scanning 75 projects', c: '#6c757d' },
                { t: '> collected 128 unique dependencies', c: '#6c757d' },
                { t: '> archives downloaded', c: '#198754' }
            ]},
            { cmd: '$ smartrandom --type password --length 32', out: [
                { t: '> generated: 7fK9$mP2vQ8nL4wR8tY6bH3xZ1cV5', c: '#0dcaf0' }
            ]},
            { cmd: '$ qr-codes-generator --text "https://smartlegionlab.com" --output qr.png', out: [
                { t: '> generating QR code', c: '#6c757d' },
                { t: '> saved: qr.png', c: '#198754' }
            ]},

            // --- Session end ---
            { cmd: '$ neofetch', out: [
                { t: '> OS: Arch Linux x86_64', c: '#0dcaf0' },
                { t: '> Kernel: 6.12.4-arch1-1', c: '#6c757d' },
                { t: '> Shell: bash 5.2', c: '#6c757d' },
                { t: '> Terminal: kitty', c: '#6c757d' },
                { t: '> CPU: (16) @ 4.2GHz', c: '#198754' },
                { t: '> Memory: 8.4GiB / 32GiB', c: '#6c757d' }
            ]},
            { cmd: '$ exit', out: [
                { t: '> session closed', c: '#6c757d' }
            ]}
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
            const cmdSpan = makeLine('#c9d1d9');
            await new Promise(res => {
                typeText(cmdSpan, scenario.cmd, 22, res);
            });

            await wait(150);

            for (const out of scenario.out) {
                const span = makeLine(out.c);
                await wait(90);
                typeText(span, out.t, 8, null);
                await wait(50);
            }

            await wait(220);
            trimLines();
        }

        let stopped = false;

        async function loop() {
            while (!stopped) {
                for (let i = 0; i < SCENARIOS.length && !stopped; i++) {
                    await playScenario(SCENARIOS[i]);
                }
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