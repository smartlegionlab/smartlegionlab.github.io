(function() {
    const loadingUI = document.getElementById('loadingUI');
    const planetCountEl = document.getElementById('planetCount');
    const moonCountEl = document.getElementById('moonCount');
    const fpsCounterEl = document.getElementById('fpsCounter');

    async function loadSitemap() {
        try {
            const response = await fetch('/sitemap.xml');
            if (!response.ok) throw new Error('Failed to load sitemap.xml');
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const urls = xmlDoc.querySelectorAll('url');

            const result = [];
            urls.forEach(url => {
                const loc = url.querySelector('loc');
                if (loc) {
                    const text = loc.textContent.trim();
                    let label = text.replace('https://smartlegionlab.ru', '');
                    if (!label || label === '/') {
                        label = '🏠 Home';
                    } else {
                        label = label.replace(/^\/+/, '').replace(/\/+$/, '');
                        const parts = label.split('/');
                        let lastPart = parts[parts.length - 1];
                        if (lastPart.endsWith('.html')) {
                            lastPart = lastPart.replace('.html', '');
                        }
                        label = lastPart
                            .replace(/-/g, ' ')
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase());
                        if (parts.length === 1) {
                            const icons = {
                                'projects': '📁 Projects',
                                'libraries': '📚 Libraries',
                                'ecosystems': '🌍 Ecosystems',
                                'applications': '📱 Applications',
                                'team': '👥 Team',
                                'profiles': '👤 Profiles',
                                'articles': '📰 Articles',
                                'research': '🔬 Research'
                            };
                            const key = parts[0].toLowerCase();
                            if (icons[key]) label = icons[key];
                            else label = '📂 ' + label;
                        }
                    }
                    result.push({
                        loc: text,
                        label: label,
                        path: text.replace('https://smartlegionlab.ru', '')
                    });
                }
            });
            return result;
        } catch (error) {
            console.error('Sitemap load error:', error);
            return getFallbackData();
        } finally {
            loadingUI.classList.add('hidden');
        }
    }

    function getFallbackData() {
        return [
            { loc: 'https://smartlegionlab.ru/', label: '🏠 Home' },
            { loc: 'https://smartlegionlab.ru/projects.html', label: '📁 Projects' },
            { loc: 'https://smartlegionlab.ru/libraries.html', label: '📚 Libraries' },
            { loc: 'https://smartlegionlab.ru/ecosystems.html', label: '🌍 Ecosystems' },
            { loc: 'https://smartlegionlab.ru/applications.html', label: '📱 Applications' },
            { loc: 'https://smartlegionlab.ru/team.html', label: '👥 Team' },
            { loc: 'https://smartlegionlab.ru/articles.html', label: '📰 Articles' },
            { loc: 'https://smartlegionlab.ru/research.html', label: '🔬 Research' }
        ];
    }

    function buildGraph(urls) {
        const nodes = [];
        const edges = [];
        const nodeMap = new Map();

        const root = urls.find(u => u.path === '/' || u.path === '');
        const rootId = 'root';
        nodes.push({
            id: rootId,
            label: root ? root.label : '☀️ Smart Legion Lab',
            group: 'root',
            url: root ? root.loc : 'https://smartlegionlab.ru/'
        });
        nodeMap.set('https://smartlegionlab.ru/', rootId);

        const sections = new Map();
        const indexPages = new Map();
        const validSections = ['projects', 'libraries', 'ecosystems', 'applications', 'team', 'articles', 'research'];

        urls.forEach(u => {
            if (u.path === '/' || u.path === '') return;
            let path = u.path.replace(/^\/+/, '').replace(/\/+$/, '');
            if (!path) return;
            const parts = path.split('/');
            let section = parts[0];
            if (!section) return;

            if (section === 'profiles') {
                section = 'team';
            }

            if (!validSections.includes(section)) return;

            const isIndex = path === section + '.html' || path === section;
            if (isIndex && parts.length === 1) {
                indexPages.set(section, u);
            } else if (parts.length > 1) {
                if (!sections.has(section)) sections.set(section, []);
                sections.get(section).push(u);
            }
        });

        const sectionList = [];
        sections.forEach((items, sectionName) => {
            const indexPage = indexPages.get(sectionName);
            sectionList.push({
                name: sectionName,
                items: items,
                indexPage: indexPage
            });
        });

        const planetColors = [
            0x0d6efd, 0x4a9eff, 0xff6b35, 0x00d4ff,
            0xff4444, 0x6c8cba, 0xffaa00, 0x8b5cf6
        ];
        const hasRing = [false, true, false, true, true, false, true, false];
        const orbitRadii = [7, 10, 13, 16, 19, 22, 25];
        const angleOffset = Math.random() * Math.PI * 2;

        sectionList.forEach((sectionData, idx) => {
            const sectionName = sectionData.name;
            const items = sectionData.items;
            const indexPage = sectionData.indexPage;

            const sectionId = 'sec_' + sectionName;
            const icons = {
                'projects': '📁',
                'libraries': '📚',
                'ecosystems': '🌍',
                'applications': '📱',
                'team': '👥',
                'articles': '📰',
                'research': '🔬'
            };
            const sectionLabel = (icons[sectionName] || '📂') + ' ' + sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
            const sectionUrl = 'https://smartlegionlab.ru/' + sectionName + '.html';

            const size = 0.7 + Math.random() * 0.5;
            const color = planetColors[idx % planetColors.length];
            const ring = hasRing[idx % hasRing.length];
            const radius = orbitRadii[idx % orbitRadii.length] + (Math.floor(idx / orbitRadii.length) * 3);

            nodes.push({
                id: sectionId,
                label: sectionLabel,
                group: 'section',
                url: sectionUrl,
                size: size,
                orbitRadius: radius,
                color: color,
                hasRing: ring
            });
            nodeMap.set('section_' + sectionName, sectionId);
            edges.push({ from: rootId, to: sectionId });

            if (indexPage && !nodeMap.has(indexPage.loc)) {
                const nodeId = 'node_' + indexPage.loc.replace(/[^a-zA-Z0-9]/g, '_');
                nodes.push({
                    id: nodeId,
                    label: '📋 ' + sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
                    group: 'page',
                    url: indexPage.loc,
                    fullLabel: sectionName.charAt(0).toUpperCase() + sectionName.slice(1) + ' (index)'
                });
                nodeMap.set(indexPage.loc, nodeId);
                edges.push({ from: sectionId, to: nodeId });
            }

            items.forEach(page => {
                const nodeId = 'node_' + page.loc.replace(/[^a-zA-Z0-9]/g, '_');
                if (nodeMap.has(page.loc)) return;
                let pageLabel = page.label;
                if (pageLabel.length > 30) {
                    pageLabel = pageLabel.substring(0, 27) + '…';
                }
                nodes.push({
                    id: nodeId,
                    label: pageLabel,
                    group: 'page',
                    url: page.loc,
                    fullLabel: page.label
                });
                nodeMap.set(page.loc, nodeId);
                edges.push({ from: sectionId, to: nodeId });
            });
        });

        return { nodes, edges };
    }

    let scene, camera, renderer, controls;
    let nodeObjects = [];
    let planetData = [];
    let moonData = [];
    let orbitLines = [];
    let labelObjects = [];
    let stars;
    let raycaster, mouse;
    let ships = [];
    let shipTargets = [];
    let clickableObjects = [];
    let allNodes = [];
    let allPlanets = [];
    let allMoons = [];

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

    const travelerColors = {
        'Aixandrolab': '#ff3333',
        'SmartLegionLab': '#3388ff',
        'You': '#00ff88'
    };

    const travelerInfo = {
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

    function addHistoryEntry(travelerName, target) {
        if (!historyData[travelerName]) return;
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
            icon: target.userData.type === '☀️ Sun' ? '☀️' : target.userData.type === '🪐 Planet' ? '🪐' : '🌙'
        };

        historyData[travelerName].push(entry);
        renderHistory();

        console.log(`📜 ${travelerName} visited: ${entry.label} at ${entry.time}`);
    }

    function renderHistory() {
        const accordion = document.getElementById('historyAccordion');
        if (!accordion) return;

        let html = '';
        const travelerNames = ['You', 'Aixandrolab', 'SmartLegionLab'];

        travelerNames.forEach((name, idx) => {
            const entries = historyData[name] || [];
            const color = travelerColors[name] || '#ffffff';
            const isPlayer = name === 'You';
            const icon = isPlayer ? '👤' : '🚀';

            html += `
                <div class="accordion-item">
                    <div class="accordion-header">
                        <button class="accordion-button" onclick="toggleHistory('${name}')" style="color:${color};">
                            <span>
                                <span class="traveler-dot" style="background:${color};"></span>
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

    window.travelToHistory = function(travelerName, entryIndex) {
        const entries = historyData[travelerName];
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

    function createPlanetMesh(color, size, emissiveIntensity = 0.15, hasRing = false) {
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

    function createMoon(moonColor, moonSize, planetSize) {
        const group = new THREE.Group();

        const maxSize = planetSize * 0.1;
        const finalSize = Math.max(0.05, Math.min(moonSize, maxSize));

        const color = new THREE.Color(moonColor);
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

    function openTravelerModal(travelerName) {
        const info = travelerInfo[travelerName];
        if (!info) return;

        const icon = travelerName === 'You' ? '👤' : '🚀';
        const color = travelerColors[travelerName] || '#ffffff';

        modalIcon.textContent = icon;
        modalType.textContent = 'Traveler';
        modalType.style.color = color;
        modalType.style.borderColor = color;
        modalTitle.textContent = info.name;
        modalUrl.textContent = info.url;
        modalDesc.textContent = info.description || 'Space traveler exploring the universe.';
        modalGoBtn.href = info.url || '#';
        modalGoBtn.textContent = '🔗 Visit Profile';

        modalOverlay.classList.add('active');
        controls.autoRotate = false;
    }

    function createTraveler(color, label) {
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
            const travelerLabel = createLabel(label, '#ffffff', 0.35);
            travelerLabel.position.set(0, 0.7, 0);
            group.add(travelerLabel);
        }

        group.scale.set(1.2, 1.2, 1.2);
        return group;
    }

    function buildSolarSystem(graph) {
        nodeObjects.forEach(obj => scene.remove(obj));
        planetData.forEach(obj => scene.remove(obj));
        moonData.forEach(obj => scene.remove(obj));
        orbitLines.forEach(obj => scene.remove(obj));
        labelObjects.forEach(obj => scene.remove(obj));
        ships.forEach(obj => scene.remove(obj));

        nodeObjects = [];
        planetData = [];
        moonData = [];
        orbitLines = [];
        labelObjects = [];
        ships = [];
        allPlanets = [];
        allMoons = [];
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
            url: rootNode.url || 'https://smartlegionlab.ru/',
            group: 'root',
            type: '☀️ Sun',
            description: 'Smart Legion Lab home page. Start your journey through the universe of projects, libraries and research.'
        };
        scene.add(sunGroup);
        nodeObjects.push(sunGroup);
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

            const planetGroup = createPlanetMesh(color, size, 0.2, hasRing);
            planetGroup.position.set(x, y, z);

            const sectionUrl = section.url || 'https://smartlegionlab.ru/' + section.id.replace('sec_', '') + '.html';
            planetGroup.userData = {
                nodeId: section.id,
                label: section.label,
                url: sectionUrl,
                group: 'section',
                type: '🪐 Planet',
                angle: angle,
                radius: radius,
                speed: 0.04 + Math.random() * 0.04,
                orbitY: y,
                planetSize: size,
                description: `Section "${section.label.replace(/^[^\s]+\s/, '')}" — all related projects and pages.`
            };
            scene.add(planetGroup);
            nodeObjects.push(planetGroup);
            planetData.push(planetGroup);
            clickableObjects.push(planetGroup);
            allPlanets.push(planetGroup);

            const labelColor = '#' + new THREE.Color(color).getHexString();
            const label = createLabel(section.label, labelColor);
            label.position.set(0, size * 2.0 + 0.8, 0);
            planetGroup.add(label);
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
                const moonRadius = 1.5 + (pIdx / Math.max(sectionPages.length, 1)) * 1.8;
                const moonAngle = (pIdx / Math.max(sectionPages.length, 1)) * Math.PI * 2 + Math.random() * 0.3;
                const mx = x + Math.cos(moonAngle) * moonRadius;
                const mz = z + Math.sin(moonAngle) * moonRadius;
                const my = y + (Math.random() - 0.5) * 1.2;

                const minSize = size * 0.04;
                const maxSize = size * 0.1;
                const moonSize = minSize + Math.random() * (maxSize - minSize);

                const moonColor = new THREE.Color(color);
                moonColor.offsetHSL(
                    (Math.random() - 0.5) * 0.3,
                    0.2 + Math.random() * 0.5,
                    0.2 + Math.random() * 0.4
                );

                const moonGroup = createMoon(moonColor, moonSize, size);
                moonGroup.position.set(mx, my, mz);

                moonGroup.userData = {
                    nodeId: page.id,
                    label: page.label,
                    url: page.url,
                    fullLabel: page.fullLabel || page.label,
                    group: 'page',
                    type: '🌙 Moon',
                    planet: planetGroup,
                    angle: moonAngle,
                    radius: moonRadius,
                    speed: 0.12 + Math.random() * 0.15,
                    orbitY: y,
                    description: `Page "${page.fullLabel || page.label}" — part of "${section.label.replace(/^[^\s]+\s/, '')}" section.`
                };
                scene.add(moonGroup);
                nodeObjects.push(moonGroup);
                moonData.push(moonGroup);
                clickableObjects.push(moonGroup);
                allMoons.push(moonGroup);

                const moonLabel = createLabel('✦ ' + page.label, '#8aa0c9', 0.5);
                moonLabel.scale.set(2.5, 0.6, 1);
                moonLabel.position.set(0, moonSize * 4 + 0.3, 0);
                moonGroup.add(moonLabel);
                labelObjects.push(moonLabel);
            });
        });

        planetCountEl.textContent = sections.length;
        moonCountEl.textContent = graph.nodes.filter(n => n.group === 'page').length;

        createTravelers();
        renderHistory();
    }

    function createTravelers() {
        const traveler1 = createTraveler(0xff3333, 'Aixandrolab');
        traveler1.userData = {
            name: 'Aixandrolab',
            color: 0xff3333,
            targetIndex: 0,
            waitTimer: 0,
            isWaiting: false,
            speed: 0.018,
            arrivalTimer: 0,
            isArrived: false,
            lastTarget: null,
            isTraveler: true,
            label: 'Aixandrolab',
            url: 'https://github.com/aixandrolab',
            description: 'AI researcher and developer'
        };
        const startPos1 = getRandomPlanetPosition();
        traveler1.position.copy(startPos1);
        scene.add(traveler1);
        ships.push(traveler1);
        clickableObjects.push(traveler1);

        const traveler2 = createTraveler(0x3388ff, 'SmartLegionLab');
        traveler2.userData = {
            name: 'SmartLegionLab',
            color: 0x3388ff,
            targetIndex: 0,
            waitTimer: 0,
            isWaiting: false,
            speed: 0.016,
            arrivalTimer: 0,
            isArrived: false,
            lastTarget: null,
            isTraveler: true,
            label: 'SmartLegionLab',
            url: 'https://github.com/smartlegionlab',
            description: 'Open source community'
        };
        const startPos2 = getRandomPlanetPosition();
        traveler2.position.copy(startPos2);
        scene.add(traveler2);
        ships.push(traveler2);
        clickableObjects.push(traveler2);

        const traveler3 = createTraveler(0x00ff88, '👤 You');
        traveler3.userData = {
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
            isTraveler: true,
            label: 'You',
            url: '#',
            description: 'Space traveler'
        };
        const startPos3 = new THREE.Vector3(0, 2, 0);
        traveler3.position.copy(startPos3);
        scene.add(traveler3);
        ships.push(traveler3);
        clickableObjects.push(traveler3);

        document.getElementById('shipCount').textContent = ships.length;
        updateShipTargets();
    }

    function getRandomPlanetPosition() {
        if (allPlanets.length === 0) return new THREE.Vector3(0, 0, 0);
        const planet = allPlanets[Math.floor(Math.random() * allPlanets.length)];
        return planet.position.clone();
    }

    function updateShipTargets() {
        shipTargets = [];
        const allTargets = [...allPlanets, ...allMoons];
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
        const allTargets = [...allPlanets, ...allMoons];
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
            'page': '🌙'
        };
        const types = {
            'root': 'Sun',
            'section': 'Planet',
            'page': 'Moon'
        };

        if (data.isTraveler) {
            openTravelerModal(data.name);
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
        controls.autoRotate = false;
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        controls.autoRotate = true;
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
            if (playerShip && obj.userData.group !== 'root' && !obj.userData.isTraveler) {
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

        planetData.forEach(planet => {
            const data = planet.userData;
            data.angle += data.speed * 0.01 * delta;
            const x = Math.cos(data.angle) * data.radius;
            const z = Math.sin(data.angle) * data.radius;
            planet.position.x = x;
            planet.position.z = z;
            planet.rotation.y += 0.008 * delta;
        });

        moonData.forEach(moon => {
            const data = moon.userData;
            data.angle += data.speed * 0.015 * delta;
            const planetPos = data.planet.position;
            const mx = planetPos.x + Math.cos(data.angle) * data.radius;
            const mz = planetPos.z + Math.sin(data.angle) * data.radius;
            moon.position.x = mx;
            moon.position.z = mz;
            moon.position.y = data.orbitY + Math.sin(time * 0.5 + data.angle) * 0.3;
            moon.rotation.y += 0.02 * delta;
            moon.rotation.x += 0.01 * delta;
        });

        if (nodeObjects[0]) {
            nodeObjects[0].rotation.y += 0.002 * delta;
        }

        updateShips(delta);

        if (stars) {
            stars.rotation.y += 0.0001 * delta;
        }

        renderer.render(scene, camera);
    }

    async function init() {
        const urls = await loadSitemap();
        const graph = buildGraph(urls);
        initScene();
        buildSolarSystem(graph);

        setTimeout(() => {
            updateShipTargets();
        }, 1000);

        setTimeout(() => {
            if (controls) controls.autoRotate = true;
        }, 1500);

        console.log('🚀 Universe loaded!');
        console.log('📊 Total URLs:', urls.length);
        console.log('🪐 Planets:', graph.nodes.filter(n => n.group === 'section').length);
        console.log('🌙 Moons:', graph.nodes.filter(n => n.group === 'page').length);
        console.log('👤 Travelers:', ships.length);
    }

    init();
})();