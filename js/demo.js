let demoInterval = null;
let demoActive = false;
let demoStatInterval = null;
let demoTimeout = null;

function startDemo() {
    if (demoActive) return;
    demoActive = true;

    const consoleOutput = document.getElementById('consoleOutput');
    if (!consoleOutput) return;

    const initialStats = {
        projects: 70,
        libraries: 30,
        research: 4,
        ecosystems: 6,
        applications: 26,
        articles: 4
    };

    const displayStats = {
        projects: 0,
        libraries: 0,
        research: 0,
        ecosystems: 0,
        applications: 0,
        articles: 0
    };

    const lines = [
        { text: 'Initializing Smart Legion Lab...', delay: 800 },
        { text: 'Loading project repositories...', delay: 600 },
        { text: 'Syncing library dependencies...', delay: 700 },
        { text: 'Compiling projects...', delay: 500 },
        { text: 'Linking libraries...', delay: 600 },
        { text: 'Building ecosystems...', delay: 500 },
        { text: 'Packaging applications...', delay: 600 },
        { text: 'Processing research papers...', delay: 500 },
        { text: 'Deployment in progress...', delay: 400 },
        { text: '✅ DEPLOY SUCCESSFUL!', delay: 300 }
    ];

    const frameChars = ['|', '/', '-', '\\'];
    let frameIndex = 0;
    let lineIndex = 0;
    let charIndex = 0;
    let currentText = '';
    let isAnimating = false;
    let animationComplete = false;
    let updateCount = 0;

    function updateStats() {
        if (!demoActive) {
            clearInterval(demoStatInterval);
            return;
        }

        const keys = ['projects', 'libraries', 'research', 'ecosystems', 'applications', 'articles'];
        let allDone = true;

        keys.forEach(key => {
            if (displayStats[key] < initialStats[key]) {
                displayStats[key] += Math.ceil((initialStats[key] - displayStats[key]) / 3);
                if (displayStats[key] > initialStats[key]) {
                    displayStats[key] = initialStats[key];
                }
                allDone = false;
            }
        });

        drawFrame();

        if (allDone && !animationComplete) {
            animationComplete = true;
            clearInterval(demoStatInterval);
            demoStatInterval = null;
            demoTimeout = setTimeout(() => {
                if (demoActive) {
                    drawFinalFrame();
                }
            }, 500);
        }
    }

    function drawFrame() {
        if (!demoActive || !consoleOutput) return;

        const progress = Math.min((lineIndex / lines.length) * 100, 100);
        const progressBar = '▓'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
        const spinner = frameChars[frameIndex % frameChars.length];
        frameIndex++;

        let output = '';
        output += `🧑‍💻 ${spinner} [${progressBar}] ${Math.round(progress)}%\n`;

        if (currentText) {
            output += `${currentText}\n`;
        }

        output += `\n📦 ${displayStats.projects}+  📚 ${displayStats.libraries}+  🔬 ${displayStats.research}+`;
        output += `  🌐 ${displayStats.ecosystems}+  📱 ${displayStats.applications}+  📰 ${displayStats.articles}+\n`;

        const gameDiv = document.createElement('div');
        gameDiv.style.fontFamily = 'monospace';
        gameDiv.style.fontSize = '11px';
        gameDiv.style.whiteSpace = 'pre';
        gameDiv.style.color = '#00ff9d';
        gameDiv.style.marginBottom = '10px';
        gameDiv.style.padding = '4px';
        gameDiv.style.border = '1px solid #00ff9d22';
        gameDiv.style.borderRadius = '4px';
        gameDiv.innerHTML = output;

        if (consoleOutput.lastDemoDiv) {
            consoleOutput.lastDemoDiv.remove();
        }
        consoleOutput.appendChild(gameDiv);
        consoleOutput.lastDemoDiv = gameDiv;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function animateTyping() {
        if (!demoActive) {
            clearTimeout(demoTimeout);
            return;
        }

        if (lineIndex >= lines.length) {
            if (!isAnimating) {
                isAnimating = true;
                if (demoStatInterval) clearInterval(demoStatInterval);
                demoStatInterval = setInterval(updateStats, 200);
            }
            return;
        }

        const currentLine = lines[lineIndex];
        if (charIndex < currentLine.text.length) {
            currentText += currentLine.text[charIndex];
            charIndex++;
            drawFrame();
            demoTimeout = setTimeout(animateTyping, 50);
        } else {
            currentText += '\n';
            lineIndex++;
            charIndex = 0;
            drawFrame();
            demoTimeout = setTimeout(animateTyping, currentLine.delay);
        }
    }

    function drawFinalFrame() {
        if (!demoActive || !consoleOutput) return;

        let output = '';
        output += 'Smart Legion Lab\n\n';
        output += '✨ [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%\n\n';
        output += '🎉 ALL SYSTEMS OPERATIONAL!\n\n';
        output += `📦 ${displayStats.projects}+  📚 ${displayStats.libraries}+  🔬 ${displayStats.research}+`;
        output += `  🌐 ${displayStats.ecosystems}+  📱 ${displayStats.applications}+  📰 ${displayStats.articles}+\n\n`;
        output += 'Type "demo" to replay';

        const gameDiv = document.createElement('div');
        gameDiv.style.fontFamily = 'monospace';
        gameDiv.style.fontSize = '11px';
        gameDiv.style.whiteSpace = 'pre';
        gameDiv.style.color = '#00ff9d';
        gameDiv.style.marginBottom = '10px';
        gameDiv.style.padding = '8px';
        gameDiv.style.border = '2px solid #00ff9d';
        gameDiv.style.borderRadius = '4px';
        gameDiv.style.animation = 'glow 1s ease-in-out infinite alternate';
        gameDiv.innerHTML = output;

        if (consoleOutput.lastDemoDiv) {
            consoleOutput.lastDemoDiv.remove();
        }
        consoleOutput.appendChild(gameDiv);
        consoleOutput.lastDemoDiv = gameDiv;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;

        demoActive = false;
        clearInterval(demoStatInterval);
        demoStatInterval = null;
        clearTimeout(demoTimeout);
        demoTimeout = null;
    }

    function clearDemo() {
        demoActive = false;
        if (demoTimeout) {
            clearTimeout(demoTimeout);
            demoTimeout = null;
        }
        if (demoStatInterval) {
            clearInterval(demoStatInterval);
            demoStatInterval = null;
        }
        if (demoInterval) {
            clearInterval(demoInterval);
            demoInterval = null;
        }
    }

    currentText = '';
    lineIndex = 0;
    charIndex = 0;
    isAnimating = false;
    animationComplete = false;
    updateCount = 0;

    Object.keys(displayStats).forEach(key => {
        displayStats[key] = 0;
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes glow {
            from { border-color: #00ff9d44; box-shadow: 0 0 10px #00ff9d11; }
            to { border-color: #00ff9d; box-shadow: 0 0 20px #00ff9d44; }
        }
    `;
    document.head.appendChild(style);

    animateTyping();

    window._stopDemo = clearDemo;
}

function stopDemo() {
    if (window._stopDemo) {
        window._stopDemo();
        window._stopDemo = null;
    }
}