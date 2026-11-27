(function () {
    "use strict";

    const out = document.getElementById('out');
    const term = document.getElementById('term');
    const xpEl = document.getElementById('xp');
    const rankEl = document.getElementById('rank');
    const bestEl = document.getElementById('best');
    const whoEl = document.getElementById('who');
    const diffEl = document.getElementById('diffChip');
    const missBox = document.getElementById('missions');
    const curHintEl = document.getElementById('curHint');

    const state = {
        phase: 'idle',
        userName: 'user',
        isRoot: false,
        cwd: ['home', 'user'],
        mission: 0,
        xp: 0,
        diff: 1,
        pending: null,
        sudoRun: false,
        flags: { flag1: false, flag2: false, malware: false, rebooted: false },
        win: false,
        startedAt: 0,
    };

    const DIFF_NAMES = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
    const DIFF_MULT = { 1: 1, 2: 1.5, 3: 2 };

    let lastCmd = [];
    let lastLine = '';
    const hist = [];
    let histIdx = -1;
    let currentInput = null;
    let bootTimer = null;

    const MISSIONS = [
        { icon: '🖥', title: 'Who are you',               hint: d => 'whoami',                     check: () => lastCmd[0] === 'whoami' || lastCmd[0] === 'id' },
        { icon: '📍', title: 'Where are you',             hint: d => 'pwd',                       check: () => lastCmd[0] === 'pwd' },
        { icon: '📂', title: 'What is in home',           hint: d => 'ls',                        check: () => lastCmd[0] === 'ls' },
        { icon: '📄', title: 'Read README.md',            hint: d => 'cat README.md',             check: () => lastCmd[0] === 'cat' && lastLine.includes('readme') },
        { icon: '🗂', title: 'Create projects directory', hint: d => 'mkdir projects',            check: () => lastCmd[0] === 'mkdir' && lastLine.includes('projects') },
        { icon: '📍', title: 'Go to projects',            hint: d => 'cd projects',               check: () => lastCmd[0] === 'cd' && lastLine.includes('projects') },
        { icon: '📝', title: 'Create task.txt',           hint: d => 'touch task.txt',            check: () => lastCmd[0] === 'touch' && lastLine.includes('task.txt') },
        { icon: '✍️', title: 'Write "hello it" to the file', hint: d => 'echo hello it > task.txt', check: () => lastLine.includes('>') && lastLine.includes('task.txt') },
        { icon: '📖', title: 'Check task.txt contents',   hint: d => 'cat task.txt',              check: () => lastCmd[0] === 'cat' && lastLine.includes('task.txt') },
        { icon: '🔑', title: 'Find the root password',    hint: d => d === 3 ? 'echo "bGludXg=" | base64 -d' : 'grep password /home/user/notes.txt',
          check: () => lastLine.includes('base64') || (lastCmd[0] === 'grep' && lastLine.includes('notes')) || (lastCmd[0] === 'cat' && lastLine.includes('notes')) },
        { icon: '🚩', title: 'Get the flag from secret',  hint: d => 'cat /home/user/secret/flag1.txt', check: () => state.flags.flag1 },
        { icon: '🧪', title: 'Make scan.sh executable',   hint: d => 'chmod +x /opt/tools/scan.sh', check: () => lastCmd[0] === 'chmod' && lastLine.includes('scan.sh') },
        { icon: '⚡', title: 'Run scan.sh',               hint: d => 'bash /opt/tools/scan.sh',   check: () => lastLine.includes('scan.sh') && (lastCmd[0].includes('scan') || lastCmd[0] === 'bash') },
        { icon: '🐛', title: 'Find the virus process',    hint: d => 'ps',                        check: () => lastCmd[0] === 'ps' },
        { icon: '👑', title: 'Get root access',           hint: d => 'sudo su  (password: linux)', check: () => state.isRoot },
        { icon: '🚩', title: 'Read the flag in /root',    hint: d => 'cat /root/flag2.txt',       check: () => state.flags.flag2 },
        { icon: '🦠', title: 'Delete the virus malware.sh', hint: d => 'rm /tmp/malware.sh',      check: () => state.flags.malware },
        { icon: '🔄', title: 'Reboot (final)',            hint: d => 'sudo reboot',               check: () => state.flags.rebooted },
    ];

    function rankBy(xp) {
        const T = [[0, 'Newbie'], [250, 'User'], [500, 'Terminalist'], [900, 'Unixoid'], [1400, 'Sysadmin'], [1900, 'Kernel Dev'], [2400, 'IT-Hero']];
        let r = T[0][1];
        for (const [t, n] of T) if (xp >= t) r = n;
        return r;
    }

    const FS = {
        home: { user: {
            'README.md': "Welcome to the it-site server!\n\nThis is a practice machine for the LINUX QUEST game.\n\nPlan:\n  whoami, pwd, ls, cat README, mkdir, cd, touch\n  echo hello it > task.txt\n  grep, chmod, bash, ps\n  sudo su (password: linux)\n  final: sudo reboot\n\nGood luck, engineer!",
            'notes.txt': "Secret notes:\n  check /opt/tools and /etc\n  virus: /tmp/malware.sh\n  root password: linux\n  flag: /home/user/secret/flag1.txt\n  (hard mode: bGludXg= -> echo \"bGludXg=\" | base64 -d)",
            secret: {
                'flag1.txt': 'ITSEC{fl4g1_un1x_1s_gr8}\n\nGreat job! +100 XP',
                'hint.txt':  'The root flag is in /root.',
            },
        }},
        root: {
            'flag2.txt': 'ITSEC{root_c0nqu3r3d}\n\nYou are root now! Neutralize the virus and reboot.',
            'vimrc':     'set nocompatible\n" yes, Vim is the best editor.',
        },
        etc: {
            'hosts':      '127.0.0.1 localhost\n127.0.1.1 it-server\n',
            'issue':      'Welcome to LINUX QUEST 1.3\n',
            'os-release': 'NAME="it-quest-os"\nVERSION="1.3 (hardened edition)"\nID=itquest\n',
            'passwd':     'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash\ndeploy:x:1001:1001::/srv:/usr/sbin/nologin',
        },
        var: { log: { 'syslog': '[kernel] module whisper loaded\n[systemd] reached target multi-user\n[*] someone is watching you...' } },
        opt: { tools: {
            'scan.sh': '#!/bin/bash\necho "scanning network..."\nnmap -sP 10.0.0.0/24\n# run: bash /opt/tools/scan.sh',
            'README':  'cat /opt/tools/scan.sh , then: chmod +x /opt/tools/scan.sh , run: bash /opt/tools/scan.sh',
        }},
        tmp: {
            'malware.sh': '#!/bin/bash\nrm -rf / --no-preserve-root   # ! DANGEROUS!\n# delete: rm /tmp/malware.sh',
            'readme.txt' : 'junk in /tmp',
        },
        usr: { bin: {} },
        srv: {},
    };

    const mini = {
        canvas: document.getElementById('miniCanvas'),
        ctx: null,
        mode: null,
        raf: null,
        clean: null,
    };

    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    function $now() {
        const d = new Date(), p = n => String(n).padStart(2, '0');
        return p(d.getDate()) + '.' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    }

    function fmtTime(ms) {
        const s = Math.floor(ms / 1000);
        return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }

    let cap = null;

    function emit(text, html, cls) {
        if (cap !== null) { cap.push(html ? text.replace(/<[^>]*>/g, '') : text); return; }
        const d = document.createElement('div');
        d.className = 'line ' + (cls || '');
        if (html) d.innerHTML = text; else d.textContent = text;
        out.appendChild(d);
        term.scrollTop = term.scrollHeight;
    }

    const printOut  = (t, c) => emit(t, false, c);
    const printHTML = (h, c) => emit(h, true, c);
    const printErr  = t => emit(t, false, 'err');

    function promptHTML() {
        const u = state.isRoot ? 'root' : state.userName;
        const cw = state.cwd.join('/') === 'home/user' ? '~' : '/' + state.cwd.join('/');
        return '<span class="pp">' + esc(u) + '@it-server</span><span class="c-dim">:</span><span class="c-cwd">' + esc(cw) + '</span><span class="c-dim">' + (state.isRoot ? '#' : '$') + '</span>';
    }

    function renderPrompt(html, isPw) {
        const wrap = document.createElement('div');
        wrap.className = 'line prompt-line';
        const pre = document.createElement('span');
        pre.className = 'pp';
        pre.innerHTML = html;
        wrap.appendChild(pre);
        const inp = document.createElement('input');
        inp.type = isPw ? 'password' : 'text';
        inp.className = 'cmd';
        inp.autocomplete = 'off';
        inp.autocapitalize = 'off';
        inp.spellcheck = false;
        if (isPw) inp.setAttribute('autocomplete', 'new-password');
        wrap.appendChild(inp);
        out.appendChild(wrap);
        term.scrollTop = term.scrollHeight;
        if (!mini.mode) inp.focus();
        currentInput = inp;
        inp.addEventListener('keydown', onKey);
    }

    function onKey(e) {
        const inp = currentInput;
        if (!inp) return;
        if (e.key === 'Enter') { e.preventDefault(); submit(); return; }
        if (state.phase === 'boot') return;
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (hist.length) {
                histIdx = histIdx < 0 ? hist.length - 1 : Math.max(0, histIdx - 1);
                inp.value = hist[histIdx];
            }
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histIdx >= 0) {
                histIdx++;
                if (histIdx >= hist.length) { histIdx = -1; inp.value = ''; }
                else inp.value = hist[histIdx];
            }
            return;
        }
        if (e.key === 'Tab') { e.preventDefault(); completeInput(inp); }
    }

    const SIMPLE_CMDS = ['help', 'hint', 'ls', 'cd', 'cat', 'pwd', 'whoami', 'id', 'echo', 'date', 'clear', 'exit', 'sudo', 'su', 'rm', 'mkdir', 'touch', 'chmod', 'chown', 'bash', 'sh', 'history', 'reset', 'neofetch', 'cowsay', 'fortune', 'cmatrix', 'snake', 'ping', 'ifconfig', 'ip', 'ps', 'top', 'free', 'df', 'uname', 'grep', 'apt', 'apt-get', 'vim', 'reboot', 'shutdown', 'sl', 'dd', 'nmap', 'curl', 'wget', 'yes', 'base64', 'donate', 'about'];

    function completeInput(inp) {
        const parts = inp.value.split(/\s+/);
        const last = parts[parts.length - 1];
        if (!last) return;
        if (parts.length === 1) {
            const cands = SIMPLE_CMDS.filter(c => c.startsWith(last));
            if (cands.length === 1) inp.value = cands[0] + ' ';
            else if (cands.length > 1) printOut(cands.join('  '), 'dim');
            return;
        }
        const node = cwdNode();
        if (node && typeof node === 'object') {
            const names = Object.keys(node).filter(n => n.startsWith(last));
            if (names.length === 1) {
                const base = parts.slice(0, -1).join(' ');
                const suf = typeof node[names[0]] === 'object' ? '/' : '';
                inp.value = base ? base + ' ' + names[0] + suf : names[0] + suf;
            } else if (names.length > 1) {
                printOut(names.map(n => typeof node[n] === 'object' ? n + '/' : n).join('  '), 'dim');
            }
        }
    }

    function setLast(raw) {
        lastLine = raw.toLowerCase();
        lastCmd = raw.toLowerCase().split(/\s+/);
    }

    function submit() {
        const inp = currentInput;
        if (!inp) return;
        const val = inp.value;
        const span = document.createElement('span');
        span.className = 'typed';
        span.textContent = inp.type === 'password' ? '' : val;
        inp.replaceWith(span);
        currentInput = null;
        term.scrollTop = term.scrollHeight;
        if (state.phase === 'loginName') { doLogin(val); return; }
        if (state.phase === 'loginPass') { doPass(val); return; }
        if (state.pending === 'su') { doSuPass(val); return; }
        if (state.phase === 'game') { execute(val); }
    }

    function resolve(pathStr) {
        const isAbs = pathStr.startsWith('/');
        const keyStack = isAbs ? [] : state.cwd.slice();
        for (const p of pathStr.split('/')) {
            if (p === '' || p === '.') continue;
            if (p === '..') { keyStack.pop(); continue; }
            keyStack.push(p);
        }
        let node = FS;
        for (const k of keyStack) {
            if (node === null || typeof node !== 'object' || !(k in node))
                return { error: 'no such file or directory: ' + pathStr };
            node = node[k];
        }
        return { node: node, keys: keyStack };
    }

    const isDir = n => typeof n === 'object' && n !== null;

    function pathStr(keys) { return keys.length ? '/' + keys.join('/') : '/'; }

    function cwdNode() {
        let n = FS;
        for (const k of state.cwd) n = n[k];
        return n;
    }

    function writeFile(path, data, append) {
        const isAbs = path.startsWith('/');
        const segs = isAbs ? [] : state.cwd.slice();
        for (const p of path.split('/')) {
            if (p === '' || p === '.') continue;
            if (p === '..') segs.pop(); else segs.push(p);
        }
        const file = segs.pop();
        let node = FS;
        for (const s of segs) {
            if (!node[s] || typeof node[s] !== 'object') return 'no such directory: ' + path;
            node = node[s];
        }
        node[file] = (append && file in node) ? node[file] + data : data;
        return null;
    }

    function strSize(s) {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return (h % 1200) + 24;
    }

    function doLs(args, detail) {
        const target = args.find(a => !a.startsWith('-'));
        const showH = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const r = target ? resolve(target) : { node: cwdNode(), keys: state.cwd };
        if (r.error) { printErr('ls: ' + r.error); return; }
        if (!isDir(r.node)) { printOut(String(r.node)); return; }
        let names = Object.keys(r.node).sort();
        if (!showH) names = names.filter(n => !n.startsWith('.'));
        if (!names.length) { printOut('(empty)'); return; }
        if (!detail) {
            printHTML(names.map(n => {
                const isD = isDir(r.node[n]);
                const exe = !isD && String(r.node[n]).startsWith('#!');
                const col = isD ? 'info' : (exe ? 'orange' : 'gold');
                return '<span class="' + col + '">' + esc(n) + (isD ? '/' : (exe ? '*' : '')) + '</span>';
            }).join('   '));
            return;
        }
        const pad = (s, w) => String(s).padEnd(w);
        printOut(names.map(n => {
            const node = r.node[n];
            let perms, size, owner;
            if (isDir(node)) { perms = 'drwxr-xr-x'; size = 4096; owner = 'root'; }
            else { perms = String(node).startsWith('#!') ? '-rwxr-xr-x' : '-rw-r--r--'; size = strSize(node); owner = 'user'; }
            return perms + ' 1 ' + owner + ' owner   ' + pad(size, 6) + ' ' + n + (isDir(node) ? '/' : '');
        }).join('\n'));
    }

    function doCd(args) {
        const dest = args[0] || '~';
        const r = resolve(dest === '~' ? pathStr(['home', 'user']) : dest);
        if (r.error) { printErr('cd: ' + r.error); return; }
        if (!isDir(r.node)) { printErr('cd: not a directory'); return; }
        state.cwd = r.keys;
    }

    function doCat(args) {
        const f = args[0];
        if (!f) { printErr('cat: missing file'); return; }
        const r = resolve(f);
        if (r.error) { printErr('cat: ' + r.error); return; }
        if (isDir(r.node)) { printErr('cat: ' + f + ': is a directory'); return; }
        if (r.keys[0] === 'root' && !(state.isRoot || state.sudoRun)) { printErr('cat: ' + f + ': Permission denied'); return; }
        printOut(String(r.node));
        const base = String(f).split('/').pop();
        if (base === 'flag1.txt') state.flags.flag1 = true;
        if (base === 'flag2.txt') state.flags.flag2 = true;
    }

    function doMkdir(args) {
        const f = args[0];
        if (!f) { printErr('mkdir: missing directory name'); return; }
        const r = resolve(f);
        if (!r.error) { printErr('mkdir: ' + f + ': already exists'); return; }
        const simple = f.split('/').pop();
        const node = cwdNode();
        if (isDir(node) && !(simple in node)) node[simple] = {};
        printOut('(directory created)');
    }

    function doTouch(args) {
        const f = args[0];
        if (!f) { printErr('touch: missing file'); return; }
        const simple = f.split('/').pop();
        const node = cwdNode();
        if (isDir(node) && !(simple in node)) node[simple] = 'new empty file';
        printOut('(file created)');
    }

    function rmJoke() {
        printErr('⚠  sudo rm -rf /');
        printHTML('<span class="err big">NEVER DO THIS IN REAL LIFE.</span>');
        printOut('Even in the demo we will not let you destroy the root. The system survived. So did you, miraculously.', 'dim');
    }

    function doRm(args) {
        const rest = args.filter(a => !['-rf', '-f', '-r', '-fr', '-R', '--no-preserve-root', '/'].includes(a));
        if (args.includes('--no-preserve-root') || (args.includes('-rf') && rest.length === 0) || args[0] === '/') { rmJoke(); return; }
        if (!rest.length) { printErr('rm: specify a file'); return; }
        for (const f of rest) {
            const r = resolve(f);
            if (r.error) { printErr('rm: ' + r.error); continue; }
            const content = isDir(r.node) ? '' : String(r.node);
            if (content.includes('ITSEC')) {
                printErr("rm: not allowed! This is a quest flag. Protected by ITSEC rights. (restored)");
                continue;
            }
            const parentKeys = r.keys.slice(0, -1);
            const name = r.keys[r.keys.length - 1];
            let p = FS;
            for (const k of parentKeys) p = p[k];
            delete p[name];
            if (String(f).split('/').pop() === 'malware.sh') {
                state.flags.malware = true;
                printHTML('<span class="ok">[✓] Virus neutralized! malware.sh deleted.</span>');
                printOut('Operation completed. Log sent to the administrator.', 'dim');
            } else {
                printOut("rm: removed '" + f + "'");
            }
        }
    }

    function doGrep(args) {
        let pat = args[0], file = args[1];
        if (['-r', '-i', '-ri', '-ir', '-rn', '-nr'].includes(pat)) { pat = args[1]; file = args[2]; }
        if (!pat || !file) { printErr('usage: grep <pattern> <file>'); return; }
        const r = resolve(file);
        if (r.error) { printErr('grep: ' + r.error); return; }
        if (isDir(r.node)) { printErr('grep: ' + file + ': is a directory'); return; }
        const lines = String(r.node).split('\n').filter(l => l.toLowerCase().includes(pat.toLowerCase()));
        if (!lines.length) { printOut('nothing found'); return; }
        printOut(lines.join('\n'));
    }

    function doSudo(args, line) {
        const sub = (args[0] || '').toLowerCase();
        if (!args.length) { printOut("sudo: error: a command is required. Example: sudo su"); return; }
        if (sub === 'su') {
            if (state.isRoot) { printOut('You are already root.'); return; }
            state.pending = 'su';
            printHTML('<span class="dim">[sudo] password for user:</span>');
            renderPrompt('<span class="c-dim">password:</span> ', true);
            return;
        }
        if (line.includes('rm') && (args.includes('-rf') || args.includes('-f') || args.includes('--no-preserve-root'))) { rmJoke(); return; }
        state.sudoRun = true;
        printHTML('<span class="dim">[sudo] password accepted · executing as root:</span> <span class="gold">' + esc(args.join(' ')) + '</span>');
        runCommand(sub, args.slice(1), line);
        state.sudoRun = false;
    }

    function doSu(args) {
        if (state.isRoot) { printOut('Already root.'); return; }
        if (args[0] && args[0] !== 'root') { printOut('su: switching to other users is not implemented (demo)'); return; }
        state.pending = 'su';
        printHTML('<span class="dim">Password:</span>');
        renderPrompt('<span class="c-dim">password:</span> ', true);
    }

    function doSuPass(pw) {
        state.pending = null;
        if ((pw || '').toLowerCase() === 'linux') {
            state.isRoot = true;
            state.cwd = ['root'];
            printHTML('<span class="ok big">root@it-server:~# </span>');
            printOut('Welcome back, oh great root!');
            printOut('You have access to /root. Check: cat /root/flag2.txt', 'dim');
            updateHud();
            checkMissions();
        } else {
            printErr('Wrong password. If you do not know it, the "root password" mission will help.');
        }
        renderPrompt(promptHTML());
    }

    function doExit() {
        if (state.isRoot) {
            state.isRoot = false;
            state.cwd = ['home', 'user'];
            printOut('Exiting root. Returning to user.');
            return;
        }
        printOut('logout - session closed.');
        state.phase = 'loginName';
        renderPrompt('<span class="c-dim">login:</span> ');
    }

    function doReboot(cmd) {
        if (!(state.isRoot || state.sudoRun)) { printErr(cmd + ': you must be superuser. Try: sudo reboot'); return; }
        printOut(cmd + ': calling shutdown procedure...');
        setTimeout(() => printOut('[  OK  ] Stopping services.'), 300);
        setTimeout(() => printOut('[  OK  ] Unmounting filesystems.'), 700);
        setTimeout(() => printHTML('<span class="gold big">System is shutting down...</span>'), 1100);
        setTimeout(() => {
            state.flags.rebooted = true;
            checkMissions();
            if (state.win) showWin();
        }, 1500);
    }

    function runProgress(label, doneText) {
        const el = document.createElement('div');
        el.className = 'line dim';
        el.textContent = label + ' ...';
        out.appendChild(el);
        term.scrollTop = term.scrollHeight;
        let p = 0;
        const iv = setInterval(() => {
            p += 15;
            el.textContent = label + ' [' + '#'.repeat(Math.floor(p / 15)) + '.'.repeat(7 - Math.floor(p / 15)) + '] ' + Math.min(100, p) + '%';
            term.scrollTop = term.scrollHeight;
            if (p >= 100) {
                clearInterval(iv);
                setTimeout(() => printHTML('<span class="ok">[✓] ' + esc(doneText) + '</span>'), 300);
            }
        }, 90);
    }

    function doApt(args) {
        const s = args.join(' ');
        if (s.includes('install')) {
            const pkg = args[args.length - 1];
            const jokes = {
                'girlfriend': '⚠ Error: the girlfriend package requires a physical connection to reality.',
                'java': 'java: hmm... are you sure? (better install kubernetes)',
                'vi': 'vi is already there. Vim is already there. Everything is already there.',
                'sl': 'sl is already installed! Command: sl',
                'cowsay': 'cowsay is already installed! Command: cowsay',
                'cmatrix': 'cmatrix is already installed! Command: cmatrix',
            };
            if (jokes[pkg]) { printOut(jokes[pkg]); return; }
            runProgress('apt-get install ' + pkg + ' -y', 'Done: package ' + pkg + ' installed (demo mode)');
            return;
        }
        if (s.includes('update')) { printOut('Hit:1 http://deb.it-quest.org/bookworm InRelease\nReading package lists... Done.'); return; }
        if (s.includes('upgrade')) { printOut('0 upgraded, 0 newly installed, 0 to remove - the system is in perfect shape.'); return; }
        printOut('usage: sudo apt-get install <package>');
    }

    function fakePing(args) {
        const host = args[0] || 'it-site.ru';
        printOut('PING ' + host + ' (10.0.0.1) 56(84) bytes of data.');
        let sent = 0;
        const iv = setInterval(() => {
            const ms = (Math.random() * 120 + 8).toFixed(2);
            printOut('64 bytes from ' + host + ': icmp_seq=' + (sent + 1) + ' ttl=64 time=' + ms + ' ms');
            sent++;
            if (sent >= 4) { clearInterval(iv); printOut('\n--- ' + host + ' ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss'); }
        }, 120);
    }

    function fakeWget(args) {
        const url = args[0] || 'https://it-site.ru';
        printOut('--' + $now() + '--  ' + url);
        runProgress('wget ' + url, 'Downloaded: index.html [200 OK]');
    }

    function doVim(args) {
        if (args[0] === ':wq!' || args[0] === ':wq') printOut(args[0] + ': saved and exited. Enough. Stopping.');
        else printOut('Vim is the best editor in history.\nNot being able to exit Vim is also an achievement. (try: vim :wq)');
    }

    function doNeofetch() {
        ['       .--.', '      |o_o |', '      |:_/ |', '     //   \\ \\', '    (|     | )', "    /'\\_   _/`\\", '    \\___)=(___/']
            .forEach(l => printHTML('<span class="cyan">' + esc(l) + '</span>'));
        printHTML('<span class="gold">' + esc(state.userName + '@it-server') + '</span>');
        printHTML('<span class="dim">________________________________</span>');
        printOut('OS: it-quest-os 1.3 x86_64');
        printOut('Host: it-server (educational)');
        printOut('Kernel: 6.6.1-quantum');
        printOut('Uptime: 4 hours, 20 mins');
        printOut('Shell: bash 5.2 (demo console)');
        printOut('CPU: Quantum Core i7-9999K @ 6.66GHz');
        printOut('Memory: 1024MiB / 2048MiB');
        printOut('The matrix checks out. Everything is fine. 😎');
    }

    function doCowsay(text) {
        const bar = '_'.repeat(Math.max(1, text.length + 2));
        const bot = '-'.repeat(Math.max(1, text.length + 2));
        printHTML('<span class="dim">' + esc(' ' + bar + '\n< ' + text + ' >\n ' + bot) + '</span>');
        printHTML('<span class="orange">        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||</span>');
    }

    function doFortune() {
        const q = [
            'A practitioner is someone who can solve a problem that no one else can.',
            'Smart engineers make the hard stuff simple: if it fails, have some tea.',
            'If it works, do not touch it. If it does not work, do not touch it either.',
            'There are two types of backups: those you have, and those you will have.',
            '44% of all statistics are made up on the spot.',
            'A programmer is a machine that turns coffee into code.',
            'Debugging is twice as hard as writing the code in the first place.',
        ];
        printHTML('<span class="pink">' + esc(q[Math.floor(Math.random() * q.length)]) + '</span>');
    }

    function doBash(args) {
        const f = args[0];
        if (!f) { printErr('bash: a script file is required'); return; }
        const r = resolve(f);
        if (r.error) { printErr('bash: ' + r.error); return; }
        if (isDir(r.node)) { printErr('bash: ' + f + ': is a directory'); return; }
        const content = String(r.node);
        printOut(content);
        const name = f.split('/').pop();
        if (name === 'scan.sh') {
            printOut('Running scan.sh...', 'dim');
            printOut('[+] 10.0.0.1  open tcp/22     sshd', 'ok');
            printOut('[+] 10.0.0.1  open tcp/8080   ???', 'ok');
            printOut('[!] 10.0.0.7  suspicious activity: crypto-miner (see ps / top)', 'err');
            printOut('Recommendation: delete /tmp/malware.sh', 'gold');
        } else if (name === 'malware.sh') {
            printErr('bash: malware.sh: Security denied. Delete it with rm /tmp/malware.sh');
        } else {
            printOut('(script executed)', 'dim');
        }
    }

    function execute(raw) {
        hist.push(raw);
        histIdx = -1;
        const segs = raw.split('&&').map(s => s.trim()).filter(Boolean);
        for (let i = 0; i < segs.length; i++) {
            processSegment(segs[i]);
            if (state.pending || state.phase !== 'game') break;
        }
        if (state.phase === 'game' && !state.pending && !state.win) renderPrompt(promptHTML());
    }

    function processSegment(line) {
        if (!line) return;
        if (state.pending === 'su') { doSuPass(line); return; }
        const rm = line.match(/^(.*?)\s*(>>|>)\s*([^\s>]+)\s*$/);
        if (rm && rm[1].trim()) {
            const cmdPart = rm[1].trim();
            cap = [];
            const parts = cmdPart.split(/\s+/);
            runCommand(parts[0].toLowerCase(), parts.slice(1), cmdPart);
            const data = cap.join('\n');
            cap = null;
            const wir = writeFile(rm[3], data, rm[2] === '>>');
            if (wir) printErr(wir);
            else printHTML('<span class="ok">written to ' + esc(rm[3]) + ' (' + data.length + ' chars)</span>');
            setLast(line);
            checkMissions();
            return;
        }
        const b64 = line.match(/^echo\s+['"]?([^\s'"]+)['"]?\s*\|\s*base64\s*-d\s*$/i);
        if (b64) {
            let dec;
            try { dec = atob(b64[1]); } catch (e) { dec = '(decode error)'; }
            printOut(dec);
            setLast(line);
            checkMissions();
            return;
        }
        const parts = line.split(/\s+/);
        setLast(line);
        runCommand(parts[0].toLowerCase(), parts.slice(1), line);
        checkMissions();
    }

    function runCommand(cmd, args, line) {
        switch (cmd) {
            case 'help': return showHelp();
            case 'clear': out.innerHTML = ''; return;
            case 'hint': return showHint();
            case 'reset': return resetGame();
            case 'whoami': return printOut(state.isRoot ? 'root' : state.userName);
            case 'pwd': return printOut(pathStr(state.cwd));
            case 'id': return printOut('uid=1000(' + state.userName + ') gid=1000(' + state.userName + ') groups=1000,27(sudo)');
            case 'uname': return printOut('Linux it-server 6.6.1-quantum x86_64 GNU/Linux');
            case 'hostname': return printOut('it-server');
            case 'arch': return printOut('x86_64');
            case 'uptime': return printOut($now() + ' up 4:20, 1 user, load average: 0.42, 0.13, 0.66');
            case 'date': return printOut($now() + ' MSK');
            case 'history': return printOut(hist.map((h, i) => String(i + 1).padStart(4) + '  ' + h).slice(-20).join('\n'));
            case 'echo': {
                let t = args.join(' ');
                t = t.replace(/\$USER/g, state.userName).replace(/\$HOME/g, pathStr(['home', 'user']));
                return printOut(t.replace(/^["']|["']$/g, ''));
            }
            case 'ls': case 'll': case 'l':
                return doLs(args, cmd === 'll' || cmd === 'l' || args.includes('-l') || args.includes('-la') || args.includes('-al'));
            case 'cd': return doCd(args);
            case 'cat': return doCat(args);
            case 'mkdir': return doMkdir(args);
            case 'touch': return doTouch(args);
            case 'rm': return doRm(args);
            case 'chmod': return printOut('chmod: permissions updated (demo) for ' + (args[args.length - 1] || '?'));
            case 'chown': return printOut('chown: ownership updated (demo) for ' + (args[args.length - 1] || '?'));
            case 'grep': return doGrep(args);
            case 'sudo': return doSudo(args, line);
            case 'su': return doSu(args);
            case 'exit': return doExit();
            case 'reboot': case 'shutdown': return doReboot(cmd);
            case 'bash': case 'sh': return doBash(args);
            case 'ping': return fakePing(args);
            case 'ifconfig': return printOut('eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 10.0.0.7  netmask 255.255.255.0\n        RX/TX packets: 4242/1337  errors: 0');
            case 'ip': return args[0] === 'a' ? printOut('1: lo: <LOOPBACK,UP> mtu 65536\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500  inet 10.0.0.7/24') : printOut('ip: use: ip a');
            case 'ps':
                return printOut('  PID TTY      STAT   TIME COMMAND\n    1 ?        Ss     0:01 systemd\n  424 ?        Ss     2:13 sshd: user@pts/0\n 1337 pts/0    Ss     0:42 bash --login\n 2048 pts/0    S+     0:00 top\n  666 pts/0    R+    99:99 crypto-miner   <-- virus!');
            case 'top':
                return printOut('top - ' + $now() + '  up 4:20, 1 user\nTasks: 69 total, 1 running, 68 sleeping\n%Cpu(s):  5.0 us, 3.0 sy, 1.0 ni, 90.0 id\n\n  PID   %CPU  %MEM  COMMAND\n  666  99.9   12.4  crypto-miner  (virus! file /tmp/malware.sh )');
            case 'free': return printOut('               total       used       free\ndevenv:        1024 MiB     512 MiB     512 MiB\nswap:          2048 MiB     128 MiB    1920 MiB');
            case 'df': return printOut('Filesystem    Size  Used  Avail  Use%  Mounted on\n/dev/sda1      20G   12G   8G   60%  /\ntmpfs         512M   1M  511M    1%  /dev');
            case 'nmap': return printOut('nmap: scanning neighbor servers is not approved by the administration. ⚠');
            case 'curl': return args[0] ? printOut('<!DOCTYPE html>\n<html><body><h1>it-site.ru</h1><p>Hi! You are on the right track.</p></body></html>') : printOut('curl: missing URL.');
            case 'wget': return fakeWget(args);
            case 'ssh': return printOut('ssh: connection interrupted. The channel is unstable. (demo mode)');
            case 'scp': return printOut('scp: copying is forbidden on the training server.');
            case 'sl':
                return printOut('      ====        ________\n  __________ _/_    _|\n /  PENGUIN   \\____//\n/___________________/   <- ls will not work here 😉');
            case 'dd': return runProgress('dd if=/dev/urandom of=/dev/null', 'copied, 0 B, 0,0 MB/s - straight to nowhere, as it should be!');
            case 'yes':
                printOut('linux');
                printOut('linux');
                printOut('linux');
                printOut('(....an infinite amount of linux remains - ' + (args[0] || 'linux') + ')', 'dim');
                return;
            case 'apt': case 'apt-get': return doApt(args);
            case 'vim': return doVim(args);
            case 'neofetch': return doNeofetch();
            case 'cowsay': return doCowsay(args.join(' ') || 'Hmm... Linux');
            case 'fortune': return doFortune();
            case 'cmatrix': case 'matrix': return startMatrix();
            case 'snake': return startSnake();
            case 'tetris':
                printOut('tetris: the game does not fit in the terminal (like your promises to make a backup).');
                printOut('But try: snake', 'dim');
                return;
            case 'donate': return printOut('Thanks! (just kidding, only persistence works here)');
            case 'about': case 'credits': return printOut('LINUX QUEST 1.3 - educational terminal quest for an IT site.\n18 missions · real commands · 3 difficulty levels.');
            default: {
                const r = cmd.includes('/') ? resolve(cmd) : null;
                if (r && !r.error && !isDir(r.node)) { doBash([cmd]); return; }
                printErr("bash: " + cmd + ": command not found. Type 'help' or 'hint'.");
            }
        }
    }

    function showHelp() {
        const groups = [
            ['Files', 'ls · cd · cat · pwd · mkdir · touch · rm · chmod · grep'],
            ['Streams', 'echo hello > file · echo "..." | base64 -d · command1 && command2'],
            ['System', 'whoami · id · uname · date · uptime · history · top · ps · free · df'],
            ['Network', 'ping · ifconfig · ip · ssh · curl · wget · nmap'],
            ['Root', 'sudo su (password: linux) · sudo <command> · su · exit · reboot · shutdown'],
            ['Games', 'neofetch · cowsay · fortune · cmatrix · snake · sl · apt install'],
            ['Other', 'echo · clear · vim · help · hint · reset'],
        ];
        printHTML('<span class="gold big">Available commands</span>');
        for (const [name, list] of groups)
            printHTML('<span class="info">' + esc(name) + '</span> · <span class="gold">' + esc(list) + '</span>');
        printOut('Start: whoami -> pwd -> ls -> cat README.md', 'dim');
    }

    function showHint() {
        const m = MISSIONS[state.mission];
        if (state.win) { printOut('All missions completed. You are a hero! 🏆'); return; }
        const hintText = m.hint(state.diff);
        if (state.diff === 3) {
            const cost = 25;
            if (state.xp < cost) { printErr('hint: not enough XP (need ' + cost + '). On hard difficulty hints are paid.'); return; }
            state.xp -= cost;
            updateHud();
            printHTML('<span class="pink">[-' + cost + ' XP]</span> Hint: <span class="gold">' + esc(hintText) + '</span>');
            return;
        }
        printHTML('Hint: <span class="gold">' + esc(hintText) + '</span>');
    }

    function checkMissions() {
        if (state.win) return;
        const m = MISSIONS[state.mission];
        if (m && m.check()) completeMission(m);
    }

    function completeMission(m) {
        const add = Math.round(100 * DIFF_MULT[state.diff]);
        state.xp += add;
        state.mission++;
        printHTML('');
        printHTML('<span class="ok big">== MISSION COMPLETE ==</span>  ' + m.icon + ' ' + esc(m.title) + '  <span class="gold">+' + add + ' XP</span>');
        if (state.mission < MISSIONS.length) {
            const nxt = MISSIONS[state.mission];
            let txt = 'Next: <span class="gold">' + nxt.icon + ' ' + esc(nxt.title) + '</span>';
            if (state.diff !== 3) txt += ' · command: <span class="info">' + esc(nxt.hint(state.diff)) + '</span>';
            printHTML(txt, 'dim');
        }
        updateHud();
        renderMissions();
        if (state.mission >= MISSIONS.length) state.win = true;
    }

    function readBest() {
        try { return parseInt(localStorage.getItem('lq_best') || '0', 10) || 0; } catch (e) { return 0; }
    }

    function writeBest(v) {
        try { localStorage.setItem('lq_best', String(v)); } catch (e) {}
    }

    function updateHud() {
        xpEl.textContent = state.xp;
        rankEl.textContent = rankBy(state.xp);
        const best = Math.max(readBest(), state.xp);
        writeBest(best);
        bestEl.textContent = best;
        diffEl.textContent = DIFF_NAMES[state.diff];
        whoEl.textContent = (state.isRoot ? 'root' : state.userName) + '@it-server';
    }

    function renderMissions() {
        missBox.innerHTML = '';
        MISSIONS.forEach((m, i) => {
            const el = document.createElement('div');
            let cls = 'mission';
            if (i < state.mission) cls += ' done';
            else if (i === state.mission) cls += ' current';
            el.className = cls;
            el.innerHTML = '<span class="num">' + String(i + 1).padStart(2, '0') + '</span>' +
                '<span>' + (i < state.mission ? '✔' : (i === state.mission ? '➤' : m.icon)) + ' ' + esc(m.title) + '</span>';
            missBox.appendChild(el);
        });
        missBox.scrollLeft = missBox.scrollWidth;
        const cur = MISSIONS[state.mission];
        curHintEl.textContent = (state.diff === 1 && cur && !state.win) ? 'Command: ' + cur.hint(1) : '';
    }

    function showWin() {
        state.win = true;
        document.getElementById('winUser').textContent = state.userName;
        document.getElementById('winXp').textContent = state.xp;
        document.getElementById('winBest').textContent = readBest();
        document.getElementById('winTime').textContent = state.startedAt ? fmtTime(Date.now() - state.startedAt) : '—';
        document.getElementById('winOverlay').classList.add('active');
        const chars = ['▓', '▒', '█', '●', '◆', '★', '✦'], cols = ['#48ff8b', '#ffe27a', '#5fd0ff', '#ff8ae2', '#ffab5c'];
        for (let i = 0; i < 90; i++) {
            const s = document.createElement('span');
            s.className = 'lq-confetti';
            s.textContent = chars[Math.floor(Math.random() * chars.length)];
            s.style.left = Math.random() * 100 + 'vw';
            s.style.top = '-5%';
            s.style.color = cols[Math.floor(Math.random() * cols.length)];
            s.style.animationDuration = (2.5 + Math.random() * 3) + 's';
            s.style.animationDelay = (Math.random() * 0.8) + 's';
            s.style.fontSize = (10 + Math.random() * 16) + 'px';
            document.body.appendChild(s);
            setTimeout(() => s.remove(), 7000);
        }
    }

    function resetGame() {
        try { localStorage.removeItem('lq_best'); } catch (e) {}
        location.reload();
    }

    const BOOT_LINES = [
        ['BIOS: loading LINUX QUEST 1.3 ...', 'dim'],
        ['[ 0.000000] Linux version 6.6.1-quantum (hero@it-server) #1 SMP', 'dim'],
        ['[ 0.174210] Memory: 1024M available (512M kernel code, 512M data)', 'dim'],
        ['[ 0.812300] Freeing SMP alternatives memory', 'dim'],
        ['[ 1.204100] Loading modules: whisper, penguin, turbo', 'dim'],
        ['[ 1.990540] it-quest-os: mounting root filesystem...', 'dim'],
        ['[ 2.410002] systemd: Starting Network Service      [ OK ]', 'ok'],
        ['[ 2.884101] systemd: Reached target Multi-User System', 'ok'],
        ['[ 3.230000] sshd: Listening on 0.0.0.0:22', 'ok'],
        ['[ 3.560100] Starting getty on tty1...               [ OK ]', 'ok'],
        ['[ 4.020094] Ready. Login: user · password: linux', 'gold'],
    ];
    let printedCount = 0;

    function startBoot() {
        state.phase = 'boot';
        printedCount = 0;
        const step = () => {
            if (printedCount < BOOT_LINES.length) {
                const t = BOOT_LINES[printedCount][0];
                const c = BOOT_LINES[printedCount][1];
                printedCount++;
                printOut(t, c);
                bootTimer = setTimeout(step, 230);
            } else afterBoot();
        };
        step();
    }

    function printAllRemaining() {
        if (state.phase !== 'boot') return;
        if (bootTimer) { clearTimeout(bootTimer); bootTimer = null; }
        while (printedCount < BOOT_LINES.length) {
            const t = BOOT_LINES[printedCount][0];
            const c = BOOT_LINES[printedCount][1];
            printedCount++;
            printOut(t, c);
        }
        afterBoot();
    }

    function afterBoot() {
        state.phase = 'loginName';
        printHTML('<span class="info">Connection established via SSH emulator.</span>');
        renderPrompt('<span class="c-dim">login:</span> ');
    }

    function doLogin(v) {
        const name = (v.trim() || 'user').toLowerCase();
        state.userName = 'user';
        if (name === 'root') printOut('Direct root login is forbidden. Log in as user, then sudo su.');
        printOut('Connection established. User: ' + state.userName);
        state.phase = 'loginPass';
        renderPrompt('<span class="c-dim">password:</span> ', true);
    }

    function doPass(v) {
        if ((v || '').toLowerCase() === 'linux') loginSuccess();
        else {
            printErr('Wrong password. Try again.');
            state.phase = 'loginName';
            renderPrompt('<span class="c-dim">login:</span> ');
        }
    }

    function loginSuccess() {
        state.phase = 'game';
        state.startedAt = Date.now();
        printHTML('');
        printHTML('<span class="big gold">  WELCOME TO LINUX QUEST 1.3</span>');
        printHTML('  Difficulty: <span class="gold">' + DIFF_NAMES[state.diff] + '</span> · XP ×' + DIFF_MULT[state.diff]);
        printHTML('  Type <span class="gold">help</span>, hint - <span class="gold">hint</span>. Start with: whoami');
        printHTML('');
        updateHud();
        renderMissions();
        renderPrompt(promptHTML());
    }

    const isTouch = window.matchMedia('(pointer: coarse)').matches ||
                    ('ontouchstart' in window) ||
                    navigator.maxTouchPoints > 0;

    function focusPrompt() {
        if (currentInput) { currentInput.focus(); return; }
        const inps = out.querySelectorAll('input.cmd');
        if (inps.length) inps[inps.length - 1].focus();
    }

    function overlayOpen(mode, note) {
        mini.mode = mode;
        document.getElementById('miniNote').textContent = note;
        document.getElementById('miniOverlay').classList.add('active');
        const s = Math.min(window.innerWidth - 30, 420);
        mini.canvas.width = s;
        mini.canvas.height = s;
        mini.ctx = mini.canvas.getContext('2d');
        const ctrl = document.getElementById('miniCtrl');
        ctrl.innerHTML = '';
        const hint = document.getElementById('miniHint');
        if (isTouch) {
            hint.textContent = '← BACK to terminal';
            const back = document.createElement('button');
            back.type = 'button';
            back.className = 'mini-back';
            back.textContent = '← BACK';
            back.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); overlayClose(); }, { passive: false });
            back.addEventListener('click', e => { e.preventDefault(); overlayClose(); });
            ctrl.appendChild(back);
        } else {
            hint.textContent = 'Q - back to terminal';
        }
    }

    function overlayClose() {
        if (mini.clean) mini.clean();
        if (mini.raf) cancelAnimationFrame(mini.raf);
        mini.raf = null;
        mini.clean = null;
        mini.mode = null;
        document.getElementById('miniOverlay').classList.remove('active');
        document.getElementById('miniCtrl').innerHTML = '';
        focusPrompt();
    }

    function startMatrix() {
        overlayOpen('cmatrix', isTouch ? 'The Matrix has you' : 'The Matrix has you... (Q - exit)');
        const c = mini.ctx;
        const W = mini.canvas.width, H = mini.canvas.height;
        const fs = 16, cols = Math.floor(W / fs);
        const drops = Array(cols).fill(0).map(() => Math.random() * H);
        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01λΣΠΔΞ';
        const draw = () => {
            c.fillStyle = 'rgba(0,0,0,0.08)';
            c.fillRect(0, 0, W, H);
            c.font = fs + 'px monospace';
            for (let i = 0; i < cols; i++) {
                c.fillStyle = Math.random() > 0.975 ? '#aaffcc' : '#33ff66';
                c.fillText(chars[Math.floor(Math.random() * chars.length)], i * fs, drops[i] * fs);
                if (drops[i] * fs > H && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
            mini.raf = requestAnimationFrame(draw);
        };
        mini.clean = () => { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); };
        mini.raf = requestAnimationFrame(draw);
    }

    function buildSnakePad(setDir) {
        const ctrl = document.getElementById('miniCtrl');
        const pad = document.createElement('div');
        pad.className = 'mini-pad';
        const mk = (label, dx, dy) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'mini-key';
            b.textContent = label;
            const press = e => { e.preventDefault(); e.stopPropagation(); setDir(dx, dy); };
            b.addEventListener('touchstart', press, { passive: false });
            b.addEventListener('mousedown', press);
            return b;
        };
        const row1 = document.createElement('div');
        row1.className = 'pad-row';
        row1.appendChild(mk('▲', 0, -1));
        const row2 = document.createElement('div');
        row2.className = 'pad-row';
        row2.appendChild(mk('◀', -1, 0));
        row2.appendChild(mk('▼', 0, 1));
        row2.appendChild(mk('▶', 1, 0));
        pad.appendChild(row1);
        pad.appendChild(row2);
        ctrl.insertBefore(pad, ctrl.firstChild);
    }

    function startSnake() {
        overlayOpen('snake', isTouch ? 'SNAKE: use the buttons or swipe' : 'SNAKE: arrows to move · Q - exit');
        const c = mini.ctx;
        const s = mini.canvas.width;
        const N = 18, cell = s / N;
        let snake = [{ x: 9, y: 9 }, { x: 8, y: 9 }];
        let dir = { x: 1, y: 0 };
        let next = dir;
        let food = null;
        let pts = 0;
        let over = false;

        function placeFood() {
            do { food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; }
            while (snake.some(seg => seg.x === food.x && seg.y === food.y));
        }
        placeFood();

        const setDir = (dx, dy) => {
            if (!(dx === -dir.x && dy === -dir.y)) next = { x: dx, y: dy };
        };

        if (isTouch) buildSnakePad(setDir);

        let last = performance.now(), acc = 0;

        const frame = t => {
            const dt = t - last;
            last = t;
            acc += dt;
            if (!over && acc >= 120) {
                acc = 0;
                dir = next;
                const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
                if (h.x < 0 || h.x >= N || h.y < 0 || h.y >= N || snake.some(seg => seg.x === h.x && seg.y === h.y)) over = true;
                else {
                    snake.unshift(h);
                    if (h.x === food.x && h.y === food.y) { pts += 10; placeFood(); } else snake.pop();
                }
            }
            c.fillStyle = '#000';
            c.fillRect(0, 0, s, s);
            for (let i = 0; i < N; i++) { c.strokeStyle = '#0b1a35'; c.strokeRect(i * cell, 0, cell, s); }
            snake.forEach((seg, i) => {
                c.fillStyle = i === 0 ? '#0d6efd' : '#0b5ed7';
                c.fillRect(seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2);
            });
            const anim = t / 1000;
            const fx = food.x * cell + cell / 2, fy = food.y * cell + cell / 2;
            const pulse = 1 + 0.14 * Math.sin(anim * 4.2);
            const rad = (cell / 3) * pulse, halo = rad * 2.6;
            let g = c.createRadialGradient(fx, fy, rad * 0.2, fx, fy, halo);
            g.addColorStop(0, 'rgba(13,110,253,0.55)');
            g.addColorStop(0.6, 'rgba(13,110,253,0.16)');
            g.addColorStop(1, 'rgba(13,110,253,0)');
            c.fillStyle = g;
            c.beginPath(); c.arc(fx, fy, halo, 0, Math.PI * 2); c.fill();
            g = c.createRadialGradient(fx - rad * 0.3, fy - rad * 0.3, rad * 0.1, fx, fy, rad);
            g.addColorStop(0, 'rgba(255,255,255,0.92)');
            g.addColorStop(1, 'rgba(13,110,253,0.62)');
            c.fillStyle = g;
            c.beginPath(); c.arc(fx, fy, rad, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#0d6efd';
            c.font = '12px monospace';
            c.fillText('score: ' + pts + (over ? '  ·  GAME OVER' : ''), 6, 14);
            mini.raf = requestAnimationFrame(frame);
        };

        const kd = e => {
            const m = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
            if (m[e.key] && !(m[e.key].x === -dir.x && m[e.key].y === -dir.y)) { next = m[e.key]; e.preventDefault(); e.stopPropagation(); }
        };
        document.addEventListener('keydown', kd);

        let swipeStart = null;
        const onTouchStart = e => {
            e.preventDefault(); e.stopPropagation();
            const t = e.touches[0];
            swipeStart = { x: t.clientX, y: t.clientY };
        };
        const onTouchMove = e => {
            e.preventDefault(); e.stopPropagation();
            if (!swipeStart) return;
            const t = e.touches[0];
            const dxx = t.clientX - swipeStart.x, dyy = t.clientY - swipeStart.y;
            if (Math.abs(dxx) < 22 && Math.abs(dyy) < 22) return;
            if (Math.abs(dxx) > Math.abs(dyy)) setDir(dxx > 0 ? 1 : -1, 0);
            else setDir(0, dyy > 0 ? 1 : -1);
            swipeStart = { x: t.clientX, y: t.clientY };
        };
        const onTouchEnd = () => { swipeStart = null; };
        if (isTouch) {
            mini.canvas.addEventListener('touchstart', onTouchStart, { passive: false });
            mini.canvas.addEventListener('touchmove', onTouchMove, { passive: false });
            mini.canvas.addEventListener('touchend', onTouchEnd);
            mini.canvas.addEventListener('touchcancel', onTouchEnd);
        }

        mini.clean = () => {
            over = true;
            document.removeEventListener('keydown', kd);
            if (isTouch) {
                mini.canvas.removeEventListener('touchstart', onTouchStart);
                mini.canvas.removeEventListener('touchmove', onTouchMove);
                mini.canvas.removeEventListener('touchend', onTouchEnd);
                mini.canvas.removeEventListener('touchcancel', onTouchEnd);
            }
        };

        mini.raf = requestAnimationFrame(frame);
    }

    function openModal(id) {
        const el = document.getElementById(id);
        if (!el) return;
        if (window.bootstrap && bootstrap.Modal) {
            bootstrap.Modal.getOrCreateInstance(el).show();
        } else {
            el.classList.add('show');
            el.style.display = 'block';
            if (!document.getElementById('lqModalBackdrop')) {
                const back = document.createElement('div');
                back.className = 'modal-backdrop fade show';
                back.id = 'lqModalBackdrop';
                document.body.appendChild(back);
            }
        }
    }

    function closeModal(id) {
        const el = document.getElementById(id);
        if (!el) return;
        if (window.bootstrap && bootstrap.Modal) {
            bootstrap.Modal.getOrCreateInstance(el).hide();
        } else {
            el.classList.remove('show');
            el.style.display = '';
            const back = document.getElementById('lqModalBackdrop');
            if (back) back.remove();
        }
    }

    window.openModal = openModal;
    window.closeModal = closeModal;

    document.addEventListener('keydown', e => {
        if (mini.mode) {
            if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') overlayClose();
            return;
        }
        if (state.phase === 'boot') printAllRemaining();
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    });

    term.addEventListener('click', () => { if (currentInput) currentInput.focus(); });

    document.querySelectorAll('.linux-quest-app .diff-btn').forEach(b => {
        b.addEventListener('click', () => {
            state.diff = parseInt(b.dataset.diff, 10);
            b.blur();
            document.getElementById('startOverlay').classList.remove('active');
            printHTML('<span class="dim">>>> Starting server it-server · difficulty: ' + DIFF_NAMES[state.diff] + ' ...</span>');
            updateHud();
            renderMissions();
            startBoot();
        });
    });

    document.getElementById('againBtn').addEventListener('click', () => {
        try { localStorage.removeItem('lq_best'); } catch (e) {}
        location.reload();
    });

    updateHud();
    renderMissions();
    printHTML('<span class="dim">Server is off. Choose difficulty to boot it.</span>');
})();