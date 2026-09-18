/**
 * Console Background — self-typing log.
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
            {
                cmd: '$ git clone git@github.com:smartlegionlab/smartpasslib.git',
                out: [
                    { t: '> Cloning into "smartpasslib"...', c: '#6c757d' },
                    { t: '> remote: Enumerating objects: 1,248, done.', c: '#6c757d' },
                    { t: '> Receiving objects: 100% (1248/1248)', c: '#198754' },
                    { t: '> Resolving deltas: 100% (712/712), done.', c: '#198754' }
                ]
            },
            {
                cmd: '$ pip install -r requirements.txt',
                out: [
                    { t: '> Collecting cryptography>=42.0', c: '#6c757d' },
                    { t: '> Collecting pyqt5>=5.15', c: '#6c757d' },
                    { t: '> Successfully installed 24 packages', c: '#198754' }
                ]
            },
            {
                cmd: '$ pytest -q tests/',
                out: [
                    { t: '> collecting 128 items...', c: '#6c757d' },
                    { t: '> 128 passed in 2.41s', c: '#198754' },
                    { t: '> coverage: 94.2%', c: '#0dcaf0' }
                ]
            },
            {
                cmd: '$ python -m smartpasslib --generate --secret "***" --length 24',
                out: [
                    { t: '> SHA-256 seed computed', c: '#6c757d' },
                    { t: '> deterministic hash: 0x8f4a1b2c9d3e', c: '#0dcaf0' },
                    { t: '> password: Xk9#mP2$vQ7nL4wR8tY6bH3', c: '#198754' },
                    { t: '> same secret + same params = same password', c: '#6c757d' }
                ]
            },
            {
                cmd: '$ python -m smartpasslib --verify --secret "***" --hash 0x8f4a...',
                out: [
                    { t: '> proof of knowledge without exposure', c: '#6c757d' },
                    { t: '> verification: OK', c: '#198754' }
                ]
            },
            {
                cmd: '$ clipassgen --secret "my phrase" --length 32 --symbols',
                out: [
                    { t: '> smart password generated', c: '#198754' },
                    { t: '> no storage used', c: '#0dcaf0' }
                ]
            },
            {
                cmd: '$ git status',
                out: [
                    { t: '> On branch master', c: '#6c757d' },
                    { t: '> Your branch is up to date with origin/master', c: '#198754' },
                    { t: '> nothing to commit, working tree clean', c: '#6c757d' }
                ]
            },
            {
                cmd: '$ git add .',
                out: [
                    { t: '> staged 12 files', c: '#6c757d' }
                ]
            },
            {
                cmd: '$ git commit -m "feat: pointer-based security paradigm"',
                out: [
                    { t: '> [master 3a1b2c3] feat: pointer-based security paradigm', c: '#198754' },
                    { t: '> 12 files changed, 428 insertions(+), 64 deletions(-)', c: '#6c757d' }
                ]
            },
            {
                cmd: '$ git push origin master',
                out: [
                    { t: '> Enumerating objects: 42, done.', c: '#6c757d' },
                    { t: '> Writing objects: 100% (42/42), 12.4 KiB', c: '#6c757d' },
                    { t: '> To github.com:smartlegionlab/smartpasslib.git', c: '#6c757d' },
                    { t: '>    4f8e1c2..3a1b2c3  master -> master', c: '#198754' }
                ]
            },
            {
                cmd: '$ gh release create v1.4.0 --generate-notes',
                out: [
                    { t: '> creating release v1.4.0', c: '#6c757d' },
                    { t: '> uploaded 3 assets', c: '#198754' },
                    { t: '> https://github.com/smartlegionlab/smartpasslib/releases/tag/v1.4.0', c: '#0dcaf0' }
                ]
            },
            {
                cmd: '$ twine upload dist/*',
                out: [
                    { t: '> Uploading smartpasslib-1.4.0-py3-none-any.whl', c: '#6c757d' },
                    { t: '> View at: https://pypi.org/project/smartpasslib/1.4.0/', c: '#0dcaf0' }
                ]
            },
            {
                cmd: '$ cargo build --release',
                out: [
                    { t: '> Compiling smartpasslib v0.4.1', c: '#6c757d' },
                    { t: '> Compiling smart-dynamic-gravity-tsp v0.2.0', c: '#6c757d' },
                    { t: '> Finished release [optimized] in 12.84s', c: '#198754' }
                ]
            },
            {
                cmd: '$ cargo publish',
                out: [
                    { t: '> Uploading smartpasslib v0.4.1', c: '#6c757d' },
                    { t: '> View at: https://crates.io/crates/smartpasslib', c: '#0dcaf0' }
                ]
            },
            {
                cmd: '$ docker compose up -d',
                out: [
                    { t: '> Creating network "sll_default"', c: '#6c757d' },
                    { t: '> Container sll_redis  Started', c: '#198754' },
                    { t: '> Container sll_db     Started', c: '#198754' },
                    { t: '> Container sll_app    Started', c: '#198754' }
                ]
            },
            {
                cmd: '$ docker compose ps',
                out: [
                    { t: '> NAME        STATUS         PORTS', c: '#6c757d' },
                    { t: '> sll_app     Up 2 seconds   0.0.0.0:8000->8000/tcp', c: '#198754' },
                    { t: '> sll_db      Up 3 seconds   5432/tcp', c: '#198754' },
                    { t: '> sll_redis   Up 3 seconds   6379/tcp', c: '#198754' }
                ]
            },
            {
                cmd: '$ python manage.py migrate',
                out: [
                    { t: '> Applying contenttypes... OK', c: '#198754' },
                    { t: '> Applying auth... OK', c: '#198754' },
                    { t: '> Applying smart_social... OK', c: '#198754' }
                ]
            },
            {
                cmd: '$ python manage.py runserver',
                out: [
                    { t: '> Watching for file changes with StatReloader', c: '#6c757d' },
                    { t: '> Starting development server at http://127.0.0.1:8000/', c: '#0dcaf0' }
                ]
            },
            {
                cmd: '$ npm install',
                out: [
                    { t: '> added 128 packages in 3.42s', c: '#198754' }
                ]
            },
            {
                cmd: '$ npm run build',
                out: [
                    { t: '> building for production...', c: '#6c757d' },
                    { t: '> bundle size: 42.1 KiB (gzip: 12.8 KiB)', c: '#0dcaf0' },
                    { t: '> build complete', c: '#198754' }
                ]
            },
            {
                cmd: '$ dotnet build -c Release',
                out: [
                    { t: '> Restored SmartPasswordManagerCsharpDesktop.csproj', c: '#6c757d' },
                    { t: '> Build succeeded in 4.2s', c: '#198754' }
                ]
            },
            {
                cmd: '$ gradle assembleRelease',
                out: [
                    { t: '> > Task :app:assembleRelease', c: '#6c757d' },
                    { t: '> BUILD SUCCESSFUL in 18s', c: '#198754' }
                ]
            },
            {
                cmd: '$ tsp --solve --branch-and-bound --input cities.txt',
                out: [
                    { t: '> exact solver started', c: '#6c757d' },
                    { t: '> explored nodes: 12,847', c: '#6c757d' },
                    { t: '> optimal path: 1 -> 5 -> 12 -> 8 -> 3 -> 7', c: '#0dcaf0' },
                    { t: '> length: 247 (proven optimal)', c: '#198754' }
                ]
            },
            {
                cmd: '$ tsp --solve --heuristic --dynamic-gravity --input big.txt',
                out: [
                    { t: '> dynamic gravity algorithm running', c: '#6c757d' },
                    { t: '> iterations: 10,000', c: '#6c757d' },
                    { t: '> improved vs reference by 24.7%', c: '#0dcaf0' },
                    { t: '> path length: 3,812', c: '#198754' }
                ]
            },
            {
                cmd: '$ smart-pch-tsp --improve best_path.json',
                out: [
                    { t: '> applying PCH paradigm', c: '#6c757d' },
                    { t: '> statistical analysis of path', c: '#6c757d' },
                    { t: '> synthesized shorter path: -8.2%', c: '#198754' }
                ]
            },
            {
                cmd: '$ python -m smart_babylon --book 42 --page 7',
                out: [
                    { t: '> coordinates: (42, 7)', c: '#6c757d' },
                    { t: '> deterministic generation complete', c: '#198754' },
                    { t: '> text regenerated from seed', c: '#0dcaf0' }
                ]
            },
            {
                cmd: '$ python -m babylonian_image --coord 128,64 --size 512',
                out: [
                    { t: '> generating image from coordinates', c: '#6c757d' },
                    { t: '> deterministic output ready', c: '#198754' }
                ]
            },
            {
                cmd: '$ python -m name_gender_nn --train dataset.txt',
                out: [
                    { t: '> loading dataset...', c: '#6c757d' },
                    { t: '> epoch 10/10  loss 0.0412  acc 0.987', c: '#0dcaf0' },
                    { t: '> model trained', c: '#198754' }
                ]
            },
            {
                cmd: '$ python -m name_gender_nn --predict "Alexander"',
                out: [
                    { t: '> prediction: male (0.998)', c: '#198754' }
                ]
            },
            {
                cmd: '$ smart-2fa generate --totp --account github',
                out: [
                    { t: '> TOTP: 482913', c: '#0dcaf0' },
                    { t: '> valid for 28s', c: '#6c757d' }
                ]
            },
            {
                cmd: '$ smart-2fa backup --encrypt --gpg',
                out: [
                    { t: '> encrypting with AES-256-GCM', c: '#6c757d' },
                    { t: '> backup saved: 2fa_backup.gpg', c: '#198754' }
                ]
            },
            {
                cmd: '$ smart-2fa import --qr',
                out: [
                    { t: '> scanning QR code...', c: '#6c757d' },
                    { t: '> account added', c: '#198754' }
                ]
            },
            {
                cmd: '$ smart-repository-manager sync --all',
                out: [
                    { t: '> fetched 75 repositories', c: '#6c757d' },
                    { t: '> synced 75 / 75 OK', c: '#198754' }
                ]
            },
            {
                cmd: '$ smart-repository-manager health --check-ssh',
                out: [
                    { t: '> ssh keys validated', c: '#6c757d' },
                    { t: '> all remotes reachable', c: '#198754' }
                ]
            },
            {
                cmd: '$ forgejo-sync --repo smartpasslib-rs',
                out: [
                    { t: '> pulling master...', c: '#6c757d' },
                    { t: '> 3 commits fetched', c: '#198754' },
                    { t: '> repository up to date', c: '#0dcaf0' }
                ]
            },
            {
                cmd: '$ github-repos-backup --all --include-gists',
                out: [
                    { t: '> backing up 75 repositories', c: '#6c757d' },
                    { t: '> backing up 12 gists', c: '#6c757d' },
                    { t: '> archive created: backup_2026-09-18.tar.gz', c: '#198754' }
                ]
            },
            {
                cmd: '$ github-ssh-key test',
                out: [
                    { t: '> testing SSH connection to github.com', c: '#6c757d' },
                    { t: '> Hi smartlegionlab! You have successfully authenticated.', c: '#198754' }
                ]
            },
            {
                cmd: '$ smart-pip-collector --dir ./projects',
                out: [
                    { t: '> scanning 75 projects', c: '#6c757d' },
                    { t: '> collected 128 unique dependencies', c: '#6c757d' },
                    { t: '> archives downloaded', c: '#198754' }
                ]
            },
            {
                cmd: '$ commandman run update-system',
                out: [
                    { t: '> executing 12 commands', c: '#6c757d' },
                    { t: '> all commands succeeded', c: '#198754' }
                ]
            },
            {
                cmd: '$ climan config --set default_timeout 60',
                out: [
                    { t: '> config updated', c: '#198754' }
                ]
            },
            {
                cmd: '$ smartrandom --type password --length 32',
                out: [
                    { t: '> generated: 7fK9$mP2vQ8nL4wR8tY6bH3xZ1cV5', c: '#0dcaf0' }
                ]
            },
            {
                cmd: '$ blockchain start --port 5000',
                out: [
                    { t: '> genesis block created', c: '#6c757d' },
                    { t: '> consensus: PoW', c: '#6c757d' },
                    { t: '> node listening on http://0.0.0.0:5000', c: '#198754' }
                ]
            },
            {
                cmd: '$ python -m personal_telegram_bot',
                out: [
                    { t: '> bot started', c: '#198754' },
                    { t: '> polling updates...', c: '#6c757d' }
                ]
            },
            {
                cmd: '$ qr-codes-generator --text "https://smartlegionlab.com" --output qr.png',
                out: [
                    { t: '> generating QR code', c: '#6c757d' },
                    { t: '> saved: qr.png', c: '#198754' }
                ]
            },
            {
                cmd: '$ python -m smart_file_duplicate_manager',
                out: [
                    { t: '> scanning directory tree', c: '#6c757d' },
                    { t: '> found 42 duplicate files', c: '#0dcaf0' },
                    { t: '> potential savings: 1.2 GB', c: '#198754' }
                ]
            },
            {
                cmd: '$ python -m smart_task_manager',
                out: [
                    { t: '> loading tasks...', c: '#6c757d' },
                    { t: '> 12 active, 47 completed', c: '#198754' }
                ]
            },
            {
                cmd: '$ echo "Smart Legion Lab"',
                out: [
                    { t: '> Smart Legion Lab', c: '#0dcaf0' }
                ]
            },
            {
                cmd: '$ uname -a',
                out: [
                    { t: '> Linux arch 6.x.x x86_64 GNU/Linux', c: '#6c757d' }
                ]
            },
            {
                cmd: '$ cat /etc/os-release',
                out: [
                    { t: '> NAME="Arch Linux"', c: '#0dcaf0' },
                    { t: '> ID=arch', c: '#6c757d' }
                ]
            },
            {
                cmd: '$ neofetch',
                out: [
                    { t: '> OS: Arch Linux x86_64', c: '#0dcaf0' },
                    { t: '> Shell: bash 5.x', c: '#6c757d' },
                    { t: '> Terminal: kitty', c: '#6c757d' },
                    { t: '> CPU: (16) @ 4.2GHz', c: '#198754' },
                    { t: '> Memory: 8.4GiB / 32GiB', c: '#6c757d' }
                ]
            },
            {
                cmd: '$ clear',
                out: []
            },
            {
                cmd: '$ exit',
                out: [
                    { t: '> session closed', c: '#6c757d' }
                ]
            }
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
                typeText(cmdSpan, scenario.cmd, 25, res);
            });

            await wait(180);

            for (const out of scenario.out) {
                const span = makeLine(out.c);
                await wait(120);
                typeText(span, out.t, 10, null);
                await wait(60);
            }

            await wait(500);
            trimLines();
        }

        let stopped = false;
        let index = 0;

        async function loop() {
            while (!stopped) {
                const s = SCENARIOS[index % SCENARIOS.length];
                await playScenario(s);
                index++;

                if (stream.children.length > 40) {
                    stream.innerHTML = '';
                }
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