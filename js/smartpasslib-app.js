(function () {
  'use strict';
  var lib = window.SmartPassLib || null;
  var toastTimer = 0;
  function $(id) { return document.getElementById(id); }
  function showToast(msg, ok) {
    var t = $('toast');
    t.textContent = msg;
    t.style.borderColor = ok === false ? '#ff5252' : '#00e676';
    t.style.background = ok === false ? '#321f1f' : '#1f3227';
    t.style.color = ok === false ? '#ff5252' : '#00e676';
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  function setOut(id, text, ok) {
    var el = $(id);
    el.textContent = text;
    el.classList.remove('good', 'bad');
    if (ok === true) el.classList.add('good');
    else if (ok === false) el.classList.add('bad');
  }
  function setLabel(id, text) {
    $(id).innerHTML = '<span class="dot"></span>' + text;
  }
  function pick(activeBtn, others) {
    if (activeBtn) activeBtn.classList.add('active');
    (others || []).forEach(function (b) { b.classList.remove('active'); });
  }
  function flashCopied(btn) {
    if (!btn) return;
    if (!btn.dataset.orig) btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Copied';
    btn.classList.add('copied');
    clearTimeout(btn._t);
    btn._t = setTimeout(function () {
      btn.innerHTML = btn.dataset.orig;
      btn.classList.remove('copied');
    }, 1600);
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard', true);
      if (done) done(true);
    } catch (e) {
      showToast('Copy failed', false);
      if (done) done(false);
    }
    document.body.removeChild(ta);
  }
  function doCopy(text, btn) {
    if (!text || text === '-') { showToast('Nothing to copy yet', false); return; }
    var done = function (ok) { if (ok) flashCopied(btn); };
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Copied to clipboard', true);
        done(true);
      }, function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  }
  function copyOut(id, btn) { doCopy($(id).textContent, btn); }
  function toggleSecret() {
    var inp = $('secretInput');
    var show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    $('secretToggle').innerHTML = show ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    $('secretToggle').setAttribute('aria-label', show ? 'Hide secret' : 'Show secret');
  }
  function numVal(id, fallback) {
    var v = parseInt($(id).value, 10);
    return isNaN(v) ? fallback : v;
  }
  function noLib() { showToast('SmartPassLib not loaded', false); }
  function genSmart() {
    if (!lib) return noLib();
    var s = $('secretInput').value;
    var len = numVal('smartLen', 32);
    lib.generateSmartPassword(s, len).then(function (pw) {
      setLabel('smartLabel', 'Smart password');
      setOut('smartOut', pw, true);
      showToast('Smart password generated', true);
    }, function (err) {
      setOut('smartOut', err && err.message ? err.message : 'Error', false);
      showToast(err && err.message ? err.message : 'Generation failed', false);
    });
  }
  function genPrivate() {
    if (!lib) return noLib();
    lib.generatePrivateKey($('secretInput').value).then(function (key) {
      pick($('privBtn'), [$('pubBtn')]);
      setLabel('keyLabel', 'Private key');
      setOut('keyOut', key, true);
      showToast('Private key generated', true);
    }, function (err) {
      setOut('keyOut', err && err.message ? err.message : 'Error', false);
      showToast(err && err.message ? err.message : 'Generation failed', false);
    });
  }
  function genPublic() {
    if (!lib) return noLib();
    lib.generatePublicKey($('secretInput').value).then(function (key) {
      pick($('pubBtn'), [$('privBtn')]);
      setLabel('keyLabel', 'Public key');
      setOut('keyOut', key, true);
      showToast('Public key generated', true);
    }, function (err) {
      setOut('keyOut', err && err.message ? err.message : 'Error', false);
      showToast(err && err.message ? err.message : 'Generation failed', false);
    });
  }
  function genStrong() {
    if (!lib) return noLib();
    var len = numVal('randLen', 24);
    lib.generateStrongPassword(len).then(function (pw) {
      pick($('strongBtn'), [$('baseBtn')]);
      setLabel('randLabel', 'Strong random');
      setOut('randOut', pw, true);
      showToast('Strong random password generated', true);
    }, function (err) {
      setOut('randOut', err && err.message ? err.message : 'Error', false);
      showToast(err && err.message ? err.message : 'Generation failed', false);
    });
  }
  function genBase() {
    if (!lib) return noLib();
    var len = numVal('randLen', 24);
    lib.generateBasePassword(len).then(function (pw) {
      pick($('baseBtn'), [$('strongBtn')]);
      setLabel('randLabel', 'Base random');
      setOut('randOut', pw, true);
      showToast('Base random password generated', true);
    }, function (err) {
      setOut('randOut', err && err.message ? err.message : 'Error', false);
      showToast(err && err.message ? err.message : 'Generation failed', false);
    });
  }
  function genCode() {
    if (!lib) return noLib();
    var len = numVal('codeLen', 8);
    lib.generateCode(len).then(function (code) {
      setLabel('codeLabel', '2FA code');
      setOut('codeOut', code, true);
      showToast('2FA code generated', true);
    }, function (err) {
      setOut('codeOut', err && err.message ? err.message : 'Error', false);
      showToast(err && err.message ? err.message : 'Generation failed', false);
    });
  }
  function verify() {
    if (!lib) return noLib();
    if (!$('verifySecret').value || !$('verifyPub').value.trim()) {
      setLabel('verifyLabel', 'Verification');
      setOut('verifyOut', 'Enter a secret phrase and a public key', false);
      showToast('Fill secret and public key', false);
      return;
    }
    lib.verifySecret($('verifySecret').value, $('verifyPub').value.trim()).then(function (ok) {
      setLabel('verifyLabel', 'Verification result');
      setOut('verifyOut', ok ? 'Valid: secret matches the public key' : 'Invalid: secret does not match', ok);
      showToast(ok ? 'Secret verified' : 'Verification failed', ok);
    }, function (err) {
      setOut('verifyOut', err && err.message ? err.message : 'Error', false);
      showToast(err && err.message ? err.message : 'Verification failed', false);
    });
  }
  function openModal(id) {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).show();
  }
  window.genSmart = genSmart;
  window.genPrivate = genPrivate;
  window.genPublic = genPublic;
  window.genStrong = genStrong;
  window.genBase = genBase;
  window.genCode = genCode;
  window.verify = verify;
  window.copyOut = copyOut;
  window.toggleSecret = toggleSecret;
  window.openModal = openModal;
  var verEls = document.querySelectorAll('.lib-version');
  verEls.forEach(function (el) { el.textContent = lib ? lib.VERSION : '-'; });
})();