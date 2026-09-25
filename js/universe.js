(function() {
    const loadingUI = document.getElementById('loadingUI');
    const sectionCountEl = document.getElementById('sectionCount');
    const pageCountEl = document.getElementById('pageCount');
    const fpsCounterEl = document.getElementById('fpsCounter');

    let isPaused = false;
    const pauseBtn = document.getElementById('pauseBtn');

    const helpBtn = document.getElementById('helpBtn');
    const helpModalOverlay = document.getElementById('helpModalOverlay');
    const helpModalClose = document.getElementById('helpModalClose');
    const helpModalCloseBtn = document.getElementById('helpModalCloseBtn');

    const UNIVERSE_DATA = {
        sun: {
            label: 'Smart Legion Lab',
            url: 'https://smartlegionlab.com/',
            description: 'Smart Legion Lab home page. Start your journey through the universe of projects, libraries and research.'
        },
        planets: [
            {
                name: 'projects',
                label: '📁 Projects',
                url: 'https://smartlegionlab.com/projects.html',
                description: 'All projects: apps, CLI tools, desktop programs and experiments.',
                moons: [
                    { label: 'CliPassMan', url: 'https://smartlegionlab.com/projects/clipassman.html' },
                    { label: 'smartpasslib', url: 'https://smartlegionlab.com/projects/smartpasslib.html' },
                    { label: 'smart-2fa-secure', url: 'https://smartlegionlab.com/projects/smart-2fa-secure.html' },
                    { label: 'smart-babylon-library', url: 'https://smartlegionlab.com/projects/smart-babylon-library.html' },
                    { label: 'smart-tsp-solver', url: 'https://smartlegionlab.com/projects/smart-tsp-solver.html' },
                    { label: 'smart-tsp-benchmark', url: 'https://smartlegionlab.com/projects/smart-tsp-benchmark.html' },
                    { label: 'smart-dynamic-path', url: 'https://smartlegionlab.com/projects/smart-dynamic-path.html' },
                    { label: 'django-smart-dynamic-path', url: 'https://smartlegionlab.com/projects/django-smart-dynamic-path.html' },
                    { label: 'github-ssh-key', url: 'https://smartlegionlab.com/projects/github-ssh-key.html' },
                    { label: 'smartauthen', url: 'https://smartlegionlab.com/projects/smartauthen.html' },
                    { label: 'smartcliapp', url: 'https://smartlegionlab.com/projects/smartcliapp.html' },
                    { label: 'smartrandom', url: 'https://smartlegionlab.com/projects/smartrandom.html' },
                    { label: 'smarttextdecorator', url: 'https://smartlegionlab.com/projects/smarttextdecorator.html' },
                    { label: 'smartprinter', url: 'https://smartlegionlab.com/projects/smartprinter.html' },
                    { label: 'smartpathlibrary', url: 'https://smartlegionlab.com/projects/smartpathlibrary.html' },
                    { label: 'smartexecutorlib', url: 'https://smartlegionlab.com/projects/smartexecutorlib.html' },
                    { label: 'smart-redis-storage', url: 'https://smartlegionlab.com/projects/smart-redis-storage.html' },
                    { label: 'commandex', url: 'https://smartlegionlab.com/projects/commandex.html' },
                    { label: 'commandman', url: 'https://smartlegionlab.com/projects/commandman.html' },
                    { label: 'commandpack', url: 'https://smartlegionlab.com/projects/commandpack.html' },
                    { label: 'smart-pch-tsp-rs', url: 'https://smartlegionlab.com/projects/smart-pch-tsp.html' },
                    { label: 'smart-dynamic-gravity-tsp-rs', url: 'https://smartlegionlab.com/projects/smart-dynamic-gravity-tsp-rs.html' },
                    { label: 'smartpasslib-rs', url: 'https://smartlegionlab.com/projects/smartpasslib-rs.html' },
                    { label: 'smartpasslib-csharp', url: 'https://smartlegionlab.com/projects/smartpasslib-csharp.html' },
                    { label: 'smartpasslib-go', url: 'https://smartlegionlab.com/projects/smartpasslib-go.html' },
                    { label: 'smartpasslib-js', url: 'https://smartlegionlab.com/projects/smartpasslib-js.html' },
                    { label: 'smartpasslib-kotlin', url: 'https://smartlegionlab.com/projects/smartpasslib-kotlin.html' },
                    { label: 'forgejo-sync-manager-core', url: 'https://smartlegionlab.com/projects/forgejo-sync-manager-core.html' },
                    { label: 'smart-repository-manager-core', url: 'https://smartlegionlab.com/projects/smart-repository-manager-core.html' }
                ]
            },
            {
                name: 'libraries',
                label: '📚 Libraries',
                url: 'https://smartlegionlab.com/libraries.html',
                description: 'Reusable libraries and core modules.',
                moons: [
                    { label: 'smartpasslib', url: 'https://smartlegionlab.com/libraries/smartpasslib.html' },
                    { label: 'smartpasslib-rs', url: 'https://smartlegionlab.com/libraries/smartpasslib-rs.html' },
                    { label: 'smartpasslib-csharp', url: 'https://smartlegionlab.com/libraries/smartpasslib-csharp.html' },
                    { label: 'smartpasslib-go', url: 'https://smartlegionlab.com/libraries/smartpasslib-go.html' },
                    { label: 'smartpasslib-js', url: 'https://smartlegionlab.com/libraries/smartpasslib-js.html' },
                    { label: 'smartpasslib-kotlin', url: 'https://smartlegionlab.com/libraries/smartpasslib-kotlin.html' },
                    { label: 'smartcliapp', url: 'https://smartlegionlab.com/libraries/smartcliapp.html' },
                    { label: 'smartprinter', url: 'https://smartlegionlab.com/libraries/smartprinter.html' },
                    { label: 'smartpathlibrary', url: 'https://smartlegionlab.com/libraries/smartpathlibrary.html' },
                    { label: 'smartexecutorlib', url: 'https://smartlegionlab.com/libraries/smartexecutorlib.html' },
                    { label: 'smartrandom', url: 'https://smartlegionlab.com/libraries/smartrandom.html' },
                    { label: 'smarttextdecorator', url: 'https://smartlegionlab.com/libraries/smarttextdecorator.html' },
                    { label: 'smart-redis-storage', url: 'https://smartlegionlab.com/libraries/smart-redis-storage.html' },
                    { label: 'smart-babylon-library', url: 'https://smartlegionlab.com/libraries/smart-babylon-library.html' },
                    { label: 'commandex', url: 'https://smartlegionlab.com/libraries/commandex.html' },
                    { label: 'commandman', url: 'https://smartlegionlab.com/libraries/commandman.html' },
                    { label: 'commandpack', url: 'https://smartlegionlab.com/libraries/commandpack.html' },
                    { label: 'smartauthen', url: 'https://smartlegionlab.com/libraries/smartauthen.html' },
                    { label: 'django-smart-dynamic-path', url: 'https://smartlegionlab.com/libraries/django-smart-dynamic-path.html' },
                    { label: 'smart-dynamic-path', url: 'https://smartlegionlab.com/libraries/smart-dynamic-path.html' },
                    { label: 'smart-2fa-secure', url: 'https://smartlegionlab.com/libraries/smart-2fa-secure.html' },
                    { label: 'smart-tsp-solver', url: 'https://smartlegionlab.com/libraries/smart-tsp-solver.html' },
                    { label: 'smart-tsp-benchmark', url: 'https://smartlegionlab.com/libraries/smart-tsp-benchmark.html' },
                    { label: 'smart-pch-tsp-rs', url: 'https://smartlegionlab.com/libraries/smart-pch-tsp-rs.html' },
                    { label: 'smart-dynamic-gravity-tsp-rs', url: 'https://smartlegionlab.com/libraries/smart-dynamic-gravity-tsp-rs.html' },
                    { label: 'forgejo-sync-manager-core', url: 'https://smartlegionlab.com/libraries/forgejo-sync-manager-core.html' },
                    { label: 'smart-repository-manager-core', url: 'https://smartlegionlab.com/libraries/smart-repository-manager-core.html' },
                    { label: 'github-ssh-key', url: 'https://smartlegionlab.com/libraries/github-ssh-key.html' }
                ]
            },
            {
                name: 'ecosystems',
                label: '🌍 Ecosystems',
                url: 'https://smartlegionlab.com/ecosystems.html',
                description: 'Groups of projects that work together.',
                moons: [
                    { label: 'Smart Passwords Ecosystem', url: 'https://smartlegionlab.com/ecosystems/smart-passwords-ecosystem.html' },
                    { label: 'Deterministic Ecosystem', url: 'https://smartlegionlab.com/ecosystems/deterministic-ecosystem.html' },
                    { label: 'Repository Management Ecosystem', url: 'https://smartlegionlab.com/ecosystems/repository-management-ecosystem.html' },
                    { label: '2FA Management Ecosystem', url: 'https://smartlegionlab.com/ecosystems/2fa-management-ecosystem.html' },
                    { label: 'NP Problem Ecosystem', url: 'https://smartlegionlab.com/ecosystems/np-problem-ecosystem.html' },
                    { label: 'Research Ecosystem', url: 'https://smartlegionlab.com/ecosystems/research-ecosystem.html' },
                    { label: 'Todo Ecosystem', url: 'https://smartlegionlab.com/ecosystems/todo-ecosystem.html' }
                ]
            },
            {
                name: 'applications',
                label: '📱 Applications',
                url: 'https://smartlegionlab.com/applications.html',
                description: 'Ready-to-use applications for desktop, mobile and web.',
                moons: []
            },
            {
                name: 'team',
                label: '👥 Team',
                url: 'https://smartlegionlab.com/team.html',
                description: 'People behind Smart Legion Lab.',
                moons: [
                    { label: 'Smart Legion Lab profile', url: 'https://smartlegionlab.com/profiles/smartlegionlab.html' },
                    { label: 'Aixandrolab profile', url: 'https://smartlegionlab.com/profiles/aixandrolab.html' }
                ]
            },
            {
                name: 'articles',
                label: '📰 Articles',
                url: 'https://smartlegionlab.com/articles.html',
                description: 'Articles and essays.',
                moons: [
                    { label: 'Pointer-Based Security Paradigm', url: 'https://smartlegionlab.com/articles/pointer-based-security-paradigm-article.html' },
                    { label: 'Local Data Regeneration Paradigm', url: 'https://smartlegionlab.com/articles/local-data-regeneration-paradigm-article.html' },
                    { label: 'Deterministic Game Engine', url: 'https://smartlegionlab.com/articles/deterministic-game-engine-tech-report-article.html' },
                    { label: 'Position-Candidate-Hypothesis', url: 'https://smartlegionlab.com/articles/position-candidate-hypothesis-paradigm-article.html' }
                ]
            },
            {
                name: 'research',
                label: '🔬 Research',
                url: 'https://smartlegionlab.com/research.html',
                description: 'Research papers and paradigms.',
                moons: [
                    { label: 'Pointer-Based Security Paradigm', url: 'https://smartlegionlab.com/research/pointer-based-security-paradigm.html' },
                    { label: 'Local Data Regeneration Paradigm', url: 'https://smartlegionlab.com/research/local-data-regeneration-paradigm.html' },
                    { label: 'Deterministic Game Engine', url: 'https://smartlegionlab.com/research/deterministic-game-engine-tech-report.html' },
                    { label: 'Position-Candidate-Hypothesis', url: 'https://smartlegionlab.com/research/position-candidate-hypothesis-paradigm.html' }
                ]
            }
        ]
    };

    function openHelpModal() {
        helpModalOverlay.classList.add('active');
        if (controls) controls.autoRotate = false;
    }

    function closeHelpModal() {
        helpModalOverlay.classList.remove('active');
        if (controls && !isPaused) controls.autoRotate = true;
    }

    if (helpBtn) {
        helpBtn.addEventListener('click', openHelpModal);
    }

    if (helpModalClose) {
        helpModalClose.addEventListener('click', closeHelpModal);
    }

    if (helpModalCloseBtn) {
        helpModalCloseBtn.addEventListener('click', closeHelpModal);
    }

    if (helpModalOverlay) {
        helpModalOverlay.addEventListener('click', (e) => {
            if (e.target === helpModalOverlay) closeHelpModal();
        });
    }

    function buildGraph() {
        const nodes = [];
        const edges = [];

        const sun = UNIVERSE_DATA.sun;
        const rootId = 'root';
        nodes.push({
            id: rootId,
            label: sun.label,
            group: 'root',
            url: sun.url,
            description: sun.description
        });

        const sectionColors = [
            0x0d6efd, 0x4a9eff, 0xff6b35, 0x00d4ff,
            0xff4444, 0x6c8cba, 0xffaa00, 0x8b5cf6
        ];
        const hasRing = [false, true, false, true, true, false, true, false];
        const orbitRadii = [7, 10, 13, 16, 19, 22, 25];

        UNIVERSE_DATA.planets.forEach((planet, idx) => {
            const sectionId = 'sec_' + planet.name;
            const color = sectionColors[idx % sectionColors.length];
            const ring = hasRing[idx % hasRing.length];
            const radius = orbitRadii[idx % orbitRadii.length];
            const size = 0.7 + Math.random() * 0.5;

            nodes.push({
                id: sectionId,
                label: planet.label,
                group: 'section',
                url: planet.url,
                description: planet.description,
                size: size,
                orbitRadius: radius,
                color: color,
                hasRing: ring
            });
            edges.push({ from: rootId, to: sectionId });

            (planet.moons || []).forEach(moon => {
                const nodeId = 'node_' + moon.url.replace(/[^a-zA-Z0-9]/g, '_');
                nodes.push({
                    id: nodeId,
                    label: moon.label,
                    group: 'page',
                    url: moon.url,
                    fullLabel: moon.label,
                    description: moon.description || ('Page: ' + moon.label)
                });
                edges.push({ from: sectionId, to: nodeId });
            });
        });

        return { nodes, edges };
    }

    let scene, camera, renderer, controls;
    let sectionObjects = [];
    let sectionData = [];
    let pageData = [];
    let orbitLines = [];
    let labelObjects = [];
    let stars;
    let raycaster, mouse;
    let ships = [];
    let shipTargets = [];
    let clickableObjects = [];
    let allNodes = [];
    let allSections = [];
    let allPages = [];

    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalIcon = document.getElementById('modalIcon');
    const modalType = document.getElementById('modalType');
    const modalTitle = document.getElementById('modalTitle');
    const modalUrl = document.getElementById('modalUrl');
    const modalDesc = document.getElementById('modalDesc');
    const modalGoBtn = document.getElementById('modalGoBtn');
    const modalBackBtn = document.getElementById('modalBackBtn');

    const historyData = {
        'Aixandrolab': [],
        'SmartLegionLab': [],
        'You': []
    };

    const userColors = {
        'Aixandrolab': '#ff3333',
        'SmartLegionLab': '#3388ff',
        'You': '#00ff88'
    };

    const userInfo = {
        'Aixandrolab': {
            name: 'Aixandrolab',
            url: 'https://github.com/aixandrolab',
            description: 'AI researcher and developer'
        },
        'SmartLegionLab': {
            name: 'Smart Legion Lab',
            url: 'https://github.com/smartlegionlab',
            description: 'Open source community'
        },
        'You': {
            name: 'You',
            url: '#',
            description: 'Space traveler'
        }
    };

    let historyEntryCounter = 0;
    let clickTimer = null;
    let clickTarget = null;
    let currentYear = new Date().getFullYear();
    document.getElementById('currentYear').textContent = currentYear;

    let touchStartTime = 0;
    let touchStartPos = { x: 0, y: 0 };
    let lastTapTime = 0;
    let tapTimeout = null;

    let lastTime = 0;

    function togglePause() {
        isPaused = !isPaused;
        if (isPaused) {
            pauseBtn.innerHTML = '▶️ Play';
            pauseBtn.classList.add('paused');
            if (controls) controls.autoRotate = false;
        } else {
            pauseBtn.innerHTML = '⏸️ Pause';
            pauseBtn.classList.remove('paused');
            if (controls) controls.autoRotate = true;
        }
    }

    pauseBtn.addEventListener('click', togglePause);

    function addHistoryEntry(userName, target) {
        if (!historyData[userName]) return;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = {
            id: ++historyEntryCounter,
            target: target,
            time: timeStr,
            timestamp: now.getTime(),
            label: target.userData.fullLabel || target.userData.label,
            url: target.userData.url,
            type: target.userData.type,
            group: target.userData.group,
            icon: target.userData.type === '☀️ Main Page' ? '☀️' : target.userData.type === '🪐 Section' ? '🪐' : '📄'
        };

        historyData[userName].push(entry);
        renderHistory();

        console.log(`📜 ${userName} visited: ${entry.label} at ${entry.time}`);
    }

    function renderHistory() {
        const accordion = document.getElementById('historyAccordion');
        if (!accordion) return;

        let html = '';
        const userNames = ['You', 'Aixandrolab', 'SmartLegionLab'];

        userNames.forEach((name, idx) => {
            const entries = historyData[name] || [];
            const color = userColors[name] || '#ffffff';
            const isPlayer = name === 'You';
            const icon = isPlayer ? '👤' : '🚀';

            html += `
                <div class="accordion-item">
                    <div class="accordion-header">
                        <button class="accordion-button" onclick="toggleHistory('${name}')" style="color:${color};">
                            <span>
                                <span class="user-dot" style="background:${color};"></span>
                                ${icon} ${name}
                            </span>
                            <span class="badge-count">${entries.length}</span>
                        </button>
                    </div>
                    <div class="accordion-body" id="history_${name}" style="display:none;">
                        ${entries.length === 0 ? '<div class="history-empty">No visits yet...</div>' : ''}
                        ${entries.slice().reverse().map((entry, i) => `
                            <div class="history-item" onclick="travelToHistory('${name}', ${historyData[name].length - 1 - i})" title="Click to travel">
                                <span>
                                    <span class="type-icon">${entry.icon}</span>
                                    ${entry.label}
                                </span>
                                <span class="time">${entry.time}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        accordion.innerHTML = html;
    }

    window.toggleHistory = function(name) {
        const body = document.getElementById('history_' + name);
        if (!body) return;
        const allBodies = document.querySelectorAll('.accordion-body');
        allBodies.forEach(b => {
            if (b.id !== 'history_' + name) {
                b.style.display = 'none';
            }
        });
        if (body.style.display === 'none' || body.style.display === '') {
            body.style.display = 'block';
        } else {
            body.style.display = 'none';
        }
    };

    window.travelToHistory = function(userName, entryIndex) {
        const entries = historyData[userName];
        if (!entries || !entries[entryIndex]) return;
        const entry = entries[entryIndex];

        const targetObj = findObjectByUrl(entry.url);
        if (!targetObj) {
            console.warn('Target not found:', entry.url);
            return;
        }

        openModal(targetObj.userData);

        const playerShip = ships.find(s => s.userData.isPlayer);
        if (playerShip && targetObj.userData.group !== 'root') {
            if (playerShip.userData.currentTarget !== targetObj) {
                movePlayerTo(targetObj);
            } else {
                playerShip.userData.isMoving = false;
                playerShip.userData.target = null;
            }
        }
    };

    function findObjectByUrl(url) {
        for (const obj of clickableObjects) {
            if (obj.userData && obj.userData.url === url) {
                return obj;
            }
        }
        return null;
    }

    function createStarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,200,0.8)');
        gradient.addColorStop(0.5, 'rgba(255,200,100,0.3)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        return new THREE.CanvasTexture(canvas);
    }

    function initScene() {
        const container = document.getElementById('canvas-container');
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x05080f);

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
        camera.position.set(30, 25, 40);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
        renderer.shadowMap.enabled = false;
        container.appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.rotateSpeed = 0.6;
        controls.zoomSpeed = 1.2;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.target.set(0, 0, 0);
        controls.minDistance = 15;
        controls.maxDistance = 80;

        const ambient = new THREE.AmbientLight(0x334466, 0.4);
        scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
        dirLight.position.set(15, 25, 15);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0x4488ff, 0.3);
        dirLight2.position.set(-15, -10, -15);
        scene.add(dirLight2);

        const pointLight = new THREE.PointLight(0xffc107, 1.2, 40);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);

        createStars();

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        setupInteraction();
        setupResize();
        setupModal();
        animate(0);
    }

    function createStars() {
        const starTexture = createStarTexture();
        const starGeo = new THREE.BufferGeometry();
        const starCount = 800;
        const starPos = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const r = 40 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            starPos[i*3] = Math.sin(phi) * Math.cos(theta) * r;
            starPos[i*3+1] = Math.sin(phi) * Math.sin(theta) * r * 0.8;
            starPos[i*3+2] = Math.cos(phi) * r;

            const temp = Math.random();
            if (temp < 0.15) {
                starColors[i*3] = 0.5 + Math.random() * 0.3;
                starColors[i*3+1] = 0.7 + Math.random() * 0.3;
                starColors[i*3+2] = 1.0;
            } else if (temp < 0.35) {
                starColors[i*3] = 1.0;
                starColors[i*3+1] = 0.9 + Math.random() * 0.1;
                starColors[i*3+2] = 0.4 + Math.random() * 0.2;
            } else if (temp < 0.55) {
                starColors[i*3] = 1.0;
                starColors[i*3+1] = 0.6 + Math.random() * 0.2;
                starColors[i*3+2] = 0.2 + Math.random() * 0.2;
            } else if (temp < 0.75) {
                starColors[i*3] = 1.0;
                starColors[i*3+1] = 0.3 + Math.random() * 0.2;
                starColors[i*3+2] = 0.1 + Math.random() * 0.1;
            } else {
                const c = 0.8 + Math.random() * 0.2;
                starColors[i*3] = c;
                starColors[i*3+1] = c;
                starColors[i*3+2] = c;
            }
            starSizes[i] = 0.15 + Math.random() * 0.6;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

        const starMat = new THREE.PointsMaterial({
            size: 0.4,
            map: starTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });
        stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);
    }

    function createSectionMesh(color, size, emissiveIntensity = 0.15, hasRing = false) {
        const group = new THREE.Group();

        const geo = new THREE.SphereGeometry(size, 20, 20);
        const mat = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: emissiveIntensity,
            transparent: true,
            opacity: 0.92,
            shininess: 40,
            specular: 0x333355
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);

        const atmosGeo = new THREE.SphereGeometry(size * 1.08, 16, 16);
        const atmosMat = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.06,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        const atmos = new THREE.Mesh(atmosGeo, atmosMat);
        group.add(atmos);

        if (hasRing) {
            const ringColor = new THREE.Color(color);
            ringColor.offsetHSL(0, -0.2, 0.3);

            const ringGeo = new THREE.TorusGeometry(size * 1.6, size * 0.1, 8, 32);
            const ringMat = new THREE.MeshPhongMaterial({
                color: ringColor,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide,
                emissive: ringColor,
                emissiveIntensity: 0.03
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2.8;
            ring.rotation.z = 0.3;
            group.add(ring);

            const ring2Geo = new THREE.TorusGeometry(size * 1.8, size * 0.05, 8, 32);
            const ring2Mat = new THREE.MeshPhongMaterial({
                color: 0x88aacc,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
            ring2.rotation.x = Math.PI / 2.8;
            ring2.rotation.z = -0.2;
            group.add(ring2);
        }

        return group;
    }

    function createPageMesh(pageColor, pageSize, sectionSize) {
        const group = new THREE.Group();

        const maxSize = sectionSize * 0.1;
        const finalSize = Math.max(0.05, Math.min(pageSize, maxSize));

        const color = new THREE.Color(pageColor);
        color.offsetHSL(
            (Math.random() - 0.5) * 0.25,
            0.2 + Math.random() * 0.5,
            0.1 + Math.random() * 0.5
        );

        const geo = new THREE.SphereGeometry(finalSize, 8, 8);
        const mat = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.05 + Math.random() * 0.08,
            transparent: true,
            opacity: 0.95,
            shininess: 15 + Math.random() * 30,
            specular: 0x224466
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        group.add(mesh);

        if (Math.random() > 0.8) {
            const glowGeo = new THREE.SphereGeometry(finalSize * 1.2, 4, 4);
            const glowMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.04,
                blending: THREE.AdditiveBlending,
                wireframe: true
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            group.add(glow);
        }

        return group;
    }

    function createLabel(text, color = '#ffffff', scale = 1) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const width = Math.max(512, text.length * 18);
        const height = 128;
        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        let fontSize = 40;
        if (text.length > 20) fontSize = 32;
        if (text.length > 30) fontSize = 26;
        if (text.length > 40) fontSize = 20;

        ctx.font = `Bold ${fontSize}px "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 5;
        ctx.strokeText(text, canvas.width/2, canvas.height/2);

        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = color;
        ctx.fillText(text, canvas.width/2, canvas.height/2);

        ctx.shadowColor = color;
        ctx.shadowBlur = 30;
        ctx.globalAlpha = 0.2;
        ctx.fillText(text, canvas.width/2, canvas.height/2);
        ctx.globalAlpha = 1.0;

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const sprite = new THREE.Sprite(material);
        const scaleX = Math.max(4, text.length * 0.25);
        sprite.scale.set(scaleX * scale, 1 * scale, 1);
        return sprite;
    }

    function openUserModal(userName) {
        const info = userInfo[userName];
        if (!info) return;

        const icon = userName === 'You' ? '👤' : '🚀';
        const color = userColors[userName] || '#ffffff';

        modalIcon.textContent = icon;
        modalType.textContent = 'User';
        modalType.style.color = color;
        modalType.style.borderColor = color;
        modalTitle.textContent = info.name;
        modalUrl.textContent = info.url;
        modalDesc.textContent = info.description || 'Space traveler exploring the universe.';
        modalGoBtn.href = info.url || '#';
        modalGoBtn.textContent = '🔗 Visit Profile';

        modalOverlay.classList.add('active');
        if (!isPaused) controls.autoRotate = false;
    }

    function createUser(color, label) {
        const group = new THREE.Group();

        const bodyMat = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.2,
            shininess: 60,
            specular: 0x4488aa
        });

        const helmetGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const helmet = new THREE.Mesh(helmetGeo, bodyMat);
        helmet.position.y = 0.35;
        helmet.scale.set(1, 1.1, 1);
        group.add(helmet);

        const visorMat = new THREE.MeshPhongMaterial({
            color: 0x88ccff,
            emissive: 0x88ccff,
            emissiveIntensity: 0.1,
            transparent: true,
            opacity: 0.4,
            shininess: 100
        });
        const visorGeo = new THREE.SphereGeometry(0.12, 6, 6);
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 0.35, 0.15);
        visor.scale.set(0.8, 0.7, 0.3);
        group.add(visor);

        const bodyGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 6);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.1;
        group.add(body);

        const packMat = new THREE.MeshPhongMaterial({
            color: 0x334466,
            emissive: 0x334466,
            emissiveIntensity: 0.05
        });
        const packGeo = new THREE.BoxGeometry(0.15, 0.2, 0.08);
        const pack = new THREE.Mesh(packGeo, packMat);
        pack.position.set(0, 0.2, -0.15);
        group.add(pack);

        const armMat = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.1
        });
        const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 4);
        const arm1 = new THREE.Mesh(armGeo, armMat);
        arm1.position.set(0.18, 0.2, 0);
        arm1.rotation.z = 0.3;
        group.add(arm1);
        const arm2 = new THREE.Mesh(armGeo, armMat);
        arm2.position.set(-0.18, 0.2, 0);
        arm2.rotation.z = -0.3;
        group.add(arm2);

        const legMat = new THREE.MeshPhongMaterial({
            color: 0x223355
        });
        const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.2, 4);
        const leg1 = new THREE.Mesh(legGeo, legMat);
        leg1.position.set(0.07, -0.1, 0);
        group.add(leg1);
        const leg2 = new THREE.Mesh(legGeo, legMat);
        leg2.position.set(-0.07, -0.1, 0);
        group.add(leg2);

        const fireMat = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.7
        });
        const fireGeo = new THREE.ConeGeometry(0.04, 0.15, 4);
        const fire1 = new THREE.Mesh(fireGeo, fireMat);
        fire1.position.set(0.06, -0.2, 0);
        fire1.rotation.x = 0.2;
        group.add(fire1);
        const fire2 = new THREE.Mesh(fireGeo, fireMat);
        fire2.position.set(-0.06, -0.2, 0);
        fire2.rotation.x = -0.2;
        group.add(fire2);

        const glowMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });
        const glowGeo = new THREE.SphereGeometry(0.3, 6, 6);
        const glow = new THREE.Mesh(glowGeo, glowMat);
        group.add(glow);

        if (label) {
            const userLabel = createLabel(label, '#ffffff', 0.35);
            userLabel.position.set(0, 0.7, 0);
            group.add(userLabel);
        }

        group.scale.set(1.2, 1.2, 1.2);
        return group;
    }

    function buildSolarSystem(graph) {
        sectionObjects.forEach(obj => scene.remove(obj));
        sectionData.forEach(obj => scene.remove(obj));
        pageData.forEach(obj => scene.remove(obj));
        orbitLines.forEach(obj => scene.remove(obj));
        labelObjects.forEach(obj => scene.remove(obj));
        ships.forEach(obj => scene.remove(obj));

        sectionObjects = [];
        sectionData = [];
        pageData = [];
        orbitLines = [];
        labelObjects = [];
        ships = [];
        allSections = [];
        allPages = [];
        clickableObjects = [];
        allNodes = graph.nodes;

        const rootNode = graph.nodes.find(n => n.group === 'root');
        const sections = graph.nodes.filter(n => n.group === 'section');

        const sunGroup = new THREE.Group();
        const sunGeo = new THREE.SphereGeometry(2.0, 32, 32);
        const sunMat = new THREE.MeshPhongMaterial({
            color: 0xffc107,
            emissive: 0xffc107,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 1
        });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sunGroup.add(sun);

        const coronaGeo = new THREE.SphereGeometry(3.5, 16, 16);
        const coronaMat = new THREE.MeshBasicMaterial({
            color: 0xffc107,
            transparent: true,
            opacity: 0.06,
            blending: THREE.AdditiveBlending,
            wireframe: true
        });
        const corona = new THREE.Mesh(coronaGeo, coronaMat);
        sunGroup.add(corona);

        sunGroup.position.set(0, 0, 0);
        sunGroup.userData = {
            nodeId: rootNode.id,
            label: rootNode.label,
            url: rootNode.url || 'https://smartlegionlab.com/',
            group: 'root',
            type: '☀️ Main page',
            description: rootNode.description || 'Smart Legion Lab home page. Start your journey through the universe of projects, libraries and research.'
        };
        scene.add(sunGroup);
        sectionObjects.push(sunGroup);
        clickableObjects.push(sunGroup);

        const sunLabel = createLabel('☀️ ' + rootNode.label, '#ffc107');
        sunLabel.position.set(0, 3.5, 0);
        scene.add(sunLabel);
        labelObjects.push(sunLabel);

        const angleOffset = Math.random() * Math.PI * 2;

        sections.forEach((section, idx) => {
            const radius = section.orbitRadius || 12 + idx * 2;
            const angle = (idx / sections.length) * Math.PI * 2 + angleOffset;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * 2;

            const size = section.size || 0.8;
            const color = section.color || 0x0d6efd;
            const hasRing = section.hasRing || false;

            const sectionGroup = createSectionMesh(color, size, 0.2, hasRing);
            sectionGroup.position.set(x, y, z);

            const sectionUrl = section.url;
            sectionGroup.userData = {
                nodeId: section.id,
                label: section.label,
                url: sectionUrl,
                group: 'section',
                type: '🪐 Section',
                description: section.description || ('Section ' + section.label),
                angle: angle,
                radius: radius,
                speed: 0.04 + Math.random() * 0.04,
                orbitY: y,
                sectionSize: size
            };
            scene.add(sectionGroup);
            sectionObjects.push(sectionGroup);
            sectionData.push(sectionGroup);
            clickableObjects.push(sectionGroup);
            allSections.push(sectionGroup);

            const labelColor = '#' + new THREE.Color(color).getHexString();
            const label = createLabel(section.label, labelColor);
            label.position.set(0, size * 2.0 + 0.8, 0);
            sectionGroup.add(label);
            labelObjects.push(label);

            const orbitPoints = [];
            const segments = 48;
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                const ox = Math.cos(theta) * radius;
                const oz = Math.sin(theta) * radius;
                orbitPoints.push(new THREE.Vector3(ox, y, oz));
            }
            const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMat = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.06
            });
            const orbitLine = new THREE.Line(orbitGeo, orbitMat);
            scene.add(orbitLine);
            orbitLines.push(orbitLine);

            const sectionPages = graph.edges
                .filter(e => e.from === section.id)
                .map(e => graph.nodes.find(n => n.id === e.to))
                .filter(n => n && n.group === 'page');

            sectionPages.forEach((page, pIdx) => {
                const pageOrbitRadius = 1.5 + (pIdx / Math.max(sectionPages.length, 1)) * 1.8;
                const pageAngle = (pIdx / Math.max(sectionPages.length, 1)) * Math.PI * 2 + Math.random() * 0.3;
                const px = x + Math.cos(pageAngle) * pageOrbitRadius;
                const pz = z + Math.sin(pageAngle) * pageOrbitRadius;
                const py = y + (Math.random() - 0.5) * 1.2;

                const minSize = size * 0.04;
                const maxSize = size * 0.1;
                const pageSize = minSize + Math.random() * (maxSize - minSize);

                const pageColor = new THREE.Color(color);
                pageColor.offsetHSL(
                    (Math.random() - 0.5) * 0.3,
                    0.2 + Math.random() * 0.5,
                    0.2 + Math.random() * 0.4
                );

                const pageGroup = createPageMesh(pageColor, pageSize, size);
                pageGroup.position.set(px, py, pz);

                pageGroup.userData = {
                    nodeId: page.id,
                    label: page.label,
                    url: page.url,
                    fullLabel: page.fullLabel || page.label,
                    group: 'page',
                    type: '📄 Page',
                    description: page.description || ('Page ' + page.label),
                    section: sectionGroup,
                    angle: pageAngle,
                    radius: pageOrbitRadius,
                    speed: 0.12 + Math.random() * 0.15,
                    orbitY: y
                };
                scene.add(pageGroup);
                sectionObjects.push(pageGroup);
                pageData.push(pageGroup);
                clickableObjects.push(pageGroup);
                allPages.push(pageGroup);

                const pageLabel = createLabel('✦ ' + page.label, '#8aa0c9', 0.5);
                pageLabel.scale.set(2.5, 0.6, 1);
                pageLabel.position.set(0, pageSize * 4 + 0.3, 0);
                pageGroup.add(pageLabel);
                labelObjects.push(pageLabel);
            });
        });

        sectionCountEl.textContent = sections.length;
        pageCountEl.textContent = graph.nodes.filter(n => n.group === 'page').length;

        createUsers();
        renderHistory();
    }

    function createUsers() {
        const user1 = createUser(0xff3333, 'Aixandrolab');
        user1.userData = {
            name: 'Aixandrolab',
            color: 0xff3333,
            targetIndex: 0,
            waitTimer: 0,
            isWaiting: false,
            speed: 0.018,
            arrivalTimer: 0,
            isArrived: false,
            lastTarget: null,
            isUser: true,
            label: 'Aixandrolab',
            url: 'https://github.com/aixandrolab',
            description: 'AI researcher and developer'
        };
        const startPos1 = getRandomSectionPosition();
        user1.position.copy(startPos1);
        scene.add(user1);
        ships.push(user1);
        clickableObjects.push(user1);

        const user2 = createUser(0x3388ff, 'SmartLegionLab');
        user2.userData = {
            name: 'SmartLegionLab',
            color: 0x3388ff,
            targetIndex: 0,
            waitTimer: 0,
            isWaiting: false,
            speed: 0.016,
            arrivalTimer: 0,
            isArrived: false,
            lastTarget: null,
            isUser: true,
            label: 'SmartLegionLab',
            url: 'https://github.com/smartlegionlab',
            description: 'Open source community'
        };
        const startPos2 = getRandomSectionPosition();
        user2.position.copy(startPos2);
        scene.add(user2);
        ships.push(user2);
        clickableObjects.push(user2);

        const user3 = createUser(0x00ff88, '👤 You');
        user3.userData = {
            name: 'You',
            color: 0x00ff88,
            targetIndex: 0,
            waitTimer: 0,
            isWaiting: false,
            speed: 0.025,
            isPlayer: true,
            target: null,
            isMoving: false,
            currentTarget: null,
            arrivalTimer: 0,
            isArrived: false,
            lastTarget: null,
            isUser: true,
            label: 'You',
            url: '#',
            description: 'Space traveler'
        };
        const startPos3 = new THREE.Vector3(0, 2, 0);
        user3.position.copy(startPos3);
        scene.add(user3);
        ships.push(user3);
        clickableObjects.push(user3);

        document.getElementById('userCount').textContent = ships.length;
        updateShipTargets();
    }

    function getRandomSectionPosition() {
        if (allSections.length === 0) return new THREE.Vector3(0, 0, 0);
        const section = allSections[Math.floor(Math.random() * allSections.length)];
        return section.position.clone();
    }

    function updateShipTargets() {
        shipTargets = [];
        const allTargets = [...allSections, ...allPages];
        if (allTargets.length === 0) return;

        ships.forEach((ship, idx) => {
            if (ship.userData.isPlayer) {
                shipTargets.push(null);
                return;
            }
            let target;
            let attempts = 0;
            do {
                target = allTargets[Math.floor(Math.random() * allTargets.length)];
                attempts++;
            } while (target === shipTargets[idx-1] && attempts < 10);
            shipTargets.push(target);
        });
    }

    function updateShips(delta = 1) {
        if (isPaused) return;

        const allTargets = [...allSections, ...allPages];
        if (allTargets.length === 0) return;

        ships.forEach((ship, idx) => {
            const data = ship.userData;

            if (data.isPlayer) {
                if (data.isMoving && data.target) {
                    moveShipToTarget(ship, data.target, delta);
                }
                return;
            }

            if (!data.isWaiting) {
                const target = shipTargets[idx];
                if (target) {
                    const dist = ship.position.distanceTo(target.position);
                    if (dist < 0.4) {
                        data.isWaiting = true;
                        data.waitTimer = 60 + Math.random() * 100;
                        data.isArrived = true;
                        data.arrivalTimer = 0;
                        if (data.lastTarget !== target) {
                            addHistoryEntry(data.name, target);
                            data.lastTarget = target;
                        }
                    } else {
                        moveShipToTarget(ship, target, delta);
                    }
                }
            } else {
                data.waitTimer -= delta;
                if (data.waitTimer <= 0) {
                    data.isWaiting = false;
                    data.isArrived = false;
                    let newTarget;
                    let attempts = 0;
                    do {
                        newTarget = allTargets[Math.floor(Math.random() * allTargets.length)];
                        attempts++;
                    } while (newTarget === shipTargets[idx] && attempts < 10);
                    shipTargets[idx] = newTarget;
                }
            }
        });
    }

    function moveShipToTarget(ship, target, delta = 1) {
        const direction = new THREE.Vector3().copy(target.position).sub(ship.position);
        const distance = direction.length();
        if (distance < 0.05) return;

        direction.normalize();
        const speed = (ship.userData.speed || 0.015) * delta;
        const moveAmount = Math.min(speed, distance);
        ship.position.add(direction.multiplyScalar(moveAmount));

        ship.lookAt(target.position);
        ship.rotateX(Math.PI / 2);
    }

    function movePlayerTo(target) {
        const playerShip = ships.find(s => s.userData.isPlayer);
        if (!playerShip) return;

        const data = playerShip.userData;

        if (data.currentTarget === target) {
            data.isMoving = false;
            data.target = null;
            return;
        }

        data.target = target;
        data.isMoving = true;
        data.currentTarget = target;
        data.isArrived = false;

        addHistoryEntry('You', target);
    }

    function setupModal() {
        modalClose.addEventListener('click', closeModal);
        modalBackBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    function openModal(data) {
        const icons = {
            'root': '☀️',
            'section': '🪐',
            'page': '📄'
        };
        const types = {
            'root': 'Main Page',
            'section': 'Section',
            'page': 'Page'
        };

        if (data.isUser) {
            openUserModal(data.name);
            return;
        }

        modalIcon.textContent = icons[data.group] || '🚀';
        modalType.textContent = types[data.group] || 'Object';
        modalTitle.textContent = data.label || 'Untitled';
        modalUrl.textContent = data.url || '—';
        modalDesc.textContent = data.description || 'Smart Legion Lab page.';
        modalGoBtn.href = data.url || '#';
        modalGoBtn.textContent = '🌐 Visit Page';

        if (data.fullLabel && data.fullLabel !== data.label) {
            modalTitle.textContent = data.fullLabel;
        }

        modalOverlay.classList.add('active');
        if (!isPaused) controls.autoRotate = false;
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        if (!isPaused) controls.autoRotate = true;
    }

    let hoveredObject = null;
    const tooltip = document.getElementById('tooltip');
    const tooltipLabel = document.getElementById('tooltipLabel');
    const tooltipUrl = document.getElementById('tooltipUrl');
    const tooltipType = document.getElementById('tooltipType');

    function handleTap(obj) {
        if (!obj || !obj.userData) return;

        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
            if (clickTarget === obj) {
                openModal(obj.userData);
                clickTarget = null;
                return;
            }
        }
        clickTarget = obj;
        clickTimer = setTimeout(() => {
            const playerShip = ships.find(s => s.userData.isPlayer);
            if (playerShip && obj.userData.group !== 'root' && !obj.userData.isUser) {
                if (playerShip.userData.currentTarget !== obj) {
                    movePlayerTo(obj);
                } else {
                    playerShip.userData.isMoving = false;
                    playerShip.userData.target = null;
                }
            }
            clickTimer = null;
            clickTarget = null;
        }, 300);
    }

    function setupInteraction() {
        renderer.domElement.addEventListener('mousemove', (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(clickableObjects, true);

            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while (obj && !obj.userData?.label && obj.parent) {
                    obj = obj.parent;
                }

                if (obj && obj.userData && obj.userData.label) {
                    tooltip.style.display = 'block';
                    let left = event.clientX + 15;
                    let top = event.clientY - 10;
                    if (left + 350 > window.innerWidth) left = event.clientX - 360;
                    if (top + 100 > window.innerHeight) top = window.innerHeight - 110;
                    tooltip.style.left = left + 'px';
                    tooltip.style.top = top + 'px';

                    tooltipLabel.textContent = obj.userData.fullLabel || obj.userData.label;
                    tooltipUrl.textContent = obj.userData.url || '—';
                    tooltipType.textContent = obj.userData.type || '';

                    if (hoveredObject && hoveredObject !== obj) {
                        if (hoveredObject.children) {
                            hoveredObject.children.forEach(child => {
                                if (child.material && child.material.emissiveIntensity !== undefined) {
                                    child.material.emissiveIntensity = 0.15;
                                }
                            });
                        }
                    }
                    hoveredObject = obj;
                    if (obj.children) {
                        obj.children.forEach(child => {
                            if (child.material && child.material.emissiveIntensity !== undefined) {
                                child.material.emissiveIntensity = 0.6;
                            }
                        });
                    }
                }
            } else {
                tooltip.style.display = 'none';
                if (hoveredObject && hoveredObject.children) {
                    hoveredObject.children.forEach(child => {
                        if (child.material && child.material.emissiveIntensity !== undefined) {
                            child.material.emissiveIntensity = 0.15;
                        }
                    });
                }
                hoveredObject = null;
            }
        });

        renderer.domElement.addEventListener('click', (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(clickableObjects, true);

            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while (obj && !obj.userData?.url && obj.parent) {
                    obj = obj.parent;
                }
                if (obj && obj.userData) {
                    handleTap(obj);
                }
            } else {
                if (clickTimer) {
                    clearTimeout(clickTimer);
                    clickTimer = null;
                    clickTarget = null;
                }
            }
        });

        renderer.domElement.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            touchStartTime = Date.now();
            touchStartPos.x = touch.clientX;
            touchStartPos.y = touch.clientY;
        }, { passive: true });

        renderer.domElement.addEventListener('touchend', (event) => {
            const touch = event.changedTouches[0];
            const dt = Date.now() - touchStartTime;
            const dx = Math.abs(touch.clientX - touchStartPos.x);
            const dy = Math.abs(touch.clientY - touchStartPos.y);

            if (dt < 300 && dx < 20 && dy < 20) {
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(clickableObjects, true);

                if (intersects.length > 0) {
                    let obj = intersects[0].object;
                    while (obj && !obj.userData?.url && obj.parent) {
                        obj = obj.parent;
                    }
                    if (obj && obj.userData) {
                        handleTap(obj);
                        event.preventDefault();
                    }
                }
            }
        }, { passive: false });

        renderer.domElement.addEventListener('touchstart', () => {
            tooltip.style.display = 'none';
        }, { passive: true });
    }

    function setupResize() {
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    let fpsFrames = 0;
    let fpsTime = 0;
    let time = 0;
    let frameCount = 0;

    function animate(timestamp) {
        requestAnimationFrame(animate);

        let delta = 1;
        if (lastTime === 0) {
            lastTime = timestamp;
        } else {
            delta = (timestamp - lastTime) / 16.667;
            if (delta > 3) delta = 3;
            if (delta < 0.1) delta = 0.1;
            lastTime = timestamp;
        }

        time += 0.01 * delta;
        frameCount++;

        fpsFrames++;
        const now = performance.now();
        if (now - fpsTime > 1000) {
            const fps = fpsFrames;
            fpsCounterEl.textContent = fps;
            if (fps < 25) {
                fpsCounterEl.className = 'fps-value critical';
            } else if (fps < 45) {
                fpsCounterEl.className = 'fps-value low';
            } else {
                fpsCounterEl.className = 'fps-value';
            }
            fpsFrames = 0;
            fpsTime = now;
        }

        controls.update();

        if (!isPaused) {
            sectionData.forEach(section => {
                const data = section.userData;
                data.angle += data.speed * 0.01 * delta;
                const x = Math.cos(data.angle) * data.radius;
                const z = Math.sin(data.angle) * data.radius;
                section.position.x = x;
                section.position.z = z;
                section.rotation.y += 0.008 * delta;
            });

            pageData.forEach(page => {
                const data = page.userData;
                data.angle += data.speed * 0.015 * delta;
                const sectionPos = data.section.position;
                const px = sectionPos.x + Math.cos(data.angle) * data.radius;
                const pz = sectionPos.z + Math.sin(data.angle) * data.radius;
                page.position.x = px;
                page.position.z = pz;
                page.position.y = data.orbitY + Math.sin(time * 0.5 + data.angle) * 0.3;
                page.rotation.y += 0.02 * delta;
                page.rotation.x += 0.01 * delta;
            });

            if (sectionObjects[0]) {
                sectionObjects[0].rotation.y += 0.002 * delta;
            }

            updateShips(delta);

            if (stars) {
                stars.rotation.y += 0.0001 * delta;
            }
        }

        renderer.render(scene, camera);
    }

    function init() {
        const graph = buildGraph();
        initScene();
        buildSolarSystem(graph);

        setTimeout(() => {
            updateShipTargets();
        }, 1000);

        setTimeout(() => {
            if (controls) controls.autoRotate = true;
        }, 1500);

        if (loadingUI) loadingUI.classList.add('hidden');

        console.log('🚀 Smart Legion Lab Universe loaded!');
        console.log('🪐 Sections:', graph.nodes.filter(n => n.group === 'section').length);
        console.log('📄 Pages:', graph.nodes.filter(n => n.group === 'page').length);
        console.log('👤 Users:', ships.length);
    }

    init();
})();