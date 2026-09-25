// debug-panel.js — Panel de logs visible en el móvil
// Intercepta console.* y errores en segundo plano. La pestaña "Ayuda" del menú
// de abajo (ver app.js updateBottomBar, #tab-tester) abre directo un cuadro de
// texto (nota + captura opcional + versión) con dos acciones: "Enviar" manda
// nota+captura+logs a Paco (POST /beta-feedback, la captura vía
// /upload-gallery-photo a R2) y "Copiar" pone nota+versión+logs en el
// portapapeles (la captura no se copia, solo se manda con "Enviar").
// Ya no crea ningún botón flotante propio — solo expone window.__dbg.open()
// para que la pestaña del menú lo llame.
//
// Se carga primero en index.html para capturar desde el arranque.

(function () {
  'use strict';

  const logs = [];
  const MAX = 500;

  function push(kind, args) {
    try {
      const msg = Array.from(args).map(a => {
        if (a instanceof Error) return a.stack || (a.name + ': ' + a.message);
        if (typeof a === 'object') {
          try { return JSON.stringify(a); } catch (_) { return String(a); }
        }
        return String(a);
      }).join(' ');
      logs.push({
        t: new Date().toISOString().slice(11, 23),
        k: kind,
        m: msg
      });
      if (logs.length > MAX) logs.shift();
      // Badge rojo en la pestaña "Ayuda" del menú de abajo si hay error
      if (kind === 'error') {
        const btn = document.getElementById('tab-tester');
        if (btn) btn.classList.add('dbg-has-error');
      }
    } catch (_) {}
  }

  const origLog = console.log.bind(console);
  const origWarn = console.warn.bind(console);
  const origError = console.error.bind(console);
  const origInfo = console.info ? console.info.bind(console) : origLog;

  console.log = function () { push('log', arguments); origLog.apply(null, arguments); };
  console.warn = function () { push('warn', arguments); origWarn.apply(null, arguments); };
  console.error = function () { push('error', arguments); origError.apply(null, arguments); };
  console.info = function () { push('info', arguments); origInfo.apply(null, arguments); };

  window.addEventListener('error', (e) => {
    push('error', [
      (e.message || 'Error') +
      (e.filename ? ' @ ' + e.filename + ':' + e.lineno + ':' + e.colno : '')
    ]);
  });

  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    push('error', ['UnhandledRejection: ' + (r && (r.stack || r.message || r) || 'unknown')]);
  });

  // ═══ MARCADOR DE VERSIÓN ═══
  // Para que en la captura ya se vea qué versión del frontend y del Worker
  // está corriendo de verdad en esa pantalla, sin tener que preguntar.
  let workerVer = null; // null = aún no pedido

  function frontVersions() {
    try {
      return Array.from(document.querySelectorAll('script[src]')).map(s => {
        const u = s.getAttribute('src') || '';
        const q = u.indexOf('.js?v=');
        if (q === -1) return null;
        const name = u.slice(0, q).split('/').pop();
        const ver = u.slice(q + 6).split('&')[0];
        return name + ':' + ver;
      }).filter(Boolean);
    } catch (_) { return []; }
  }

  // Pide /version SIEMPRE, sin cachear: si se despliega el Worker con la app
  // abierta, la cabecera tiene que reflejarlo. Mientras llega la respuesta se
  // sigue mostrando el ultimo valor conocido, asi no parpadea.
  async function loadWorkerVersion() {
    try {
      if (!window.SALMA_API) throw new Error('SALMA_API no definido');
      const res = await fetch(window.SALMA_API + '/version', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      workerVer = await res.json();
    } catch (e) {
      workerVer = { error: (e && e.message) || String(e) };
    }
    return workerVer;
  }

  function versionText() {
    let w;
    if (!workerVer) w = 'cargando…';
    else if (workerVer.error) w = 'ERROR — ' + workerVer.error;
    else if (workerVer.version_short) w = workerVer.version_short + (workerVer.deployed_at ? '  (' + workerVer.deployed_at + ')' : '');
    else w = 'sin version_id — ¿falta el binding version_metadata?';
    const f = frontVersions();
    return 'WORKER  ' + w +
           '\nFRONT   ' + (f.length ? f.join('  ') : '(ningún script con ?v=)') +
           '\nURL     ' + location.href +
           '\nUA      ' + navigator.userAgent;
  }

  let verTimer = null;

  function startVerRefresh() {
    stopVerRefresh();
    verTimer = setInterval(() => {
      const ov = document.getElementById('dbg-overlay');
      if (!ov || ov.style.display === 'none') { stopVerRefresh(); return; }
      loadWorkerVersion().then(renderVersion);
    }, 15000);
  }

  function stopVerRefresh() {
    if (verTimer) { clearInterval(verTimer); verTimer = null; }
  }

  function renderVersion() {
    const el = document.getElementById('dbg-ver');
    if (el) el.textContent = versionText();
  }

  function injectStyles() {
    if (document.getElementById('dbg-styles')) return;
    const s = document.createElement('style');
    s.id = 'dbg-styles';
    s.textContent = `
      #dbg-overlay{position:fixed;inset:0;z-index:2147483646;background:#060503;display:flex;flex-direction:column;font-family:'Inter',sans-serif}
      #dbg-close{position:absolute;top:10px;right:10px;z-index:2;width:34px;height:34px;border-radius:50%;background:#141209;color:#f5f0e8;border:1px solid rgba(244,99,11,.35);font-size:14px;cursor:pointer}
      #dbg-body{flex:1;overflow-y:auto;box-sizing:border-box;padding:52px 14px 14px;display:flex;flex-direction:column;gap:12px}
      #dbg-ver{margin-top:8px;background:#1e190f;border:1px solid rgba(244,99,11,.25);border-radius:8px;padding:8px 10px;color:#F4630B;font-size:10px;line-height:1.6;white-space:pre-wrap;word-break:break-all}
      #dbg-ver-wrap{margin-top:10px;color:#9a968c;font-size:12px}#dbg-ver-wrap summary{cursor:pointer}
      #dbg-fb{display:flex;flex-direction:column;gap:10px;flex:1}
      #dbg-fb textarea{width:100%;box-sizing:border-box;flex:1;min-height:140px;background:#141209;color:#f5f0e8;border:1px solid rgba(244,99,11,.3);border-radius:8px;padding:10px;font-family:inherit;font-size:13px;resize:vertical}
      #dbg-fb-shot-btn{align-self:flex-start;background:transparent;color:#F4630B;border:1px dashed rgba(244,99,11,.45);border-radius:8px;padding:9px 14px;font-family:inherit;font-size:12px;cursor:pointer}
      #dbg-fb-shot-preview{display:flex;align-items:center;gap:10px}
      #dbg-fb-shot-thumb{width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid rgba(244,99,11,.35)}
      #dbg-fb-shot-preview span{flex:1;color:rgba(245,240,232,.6);font-size:11px}
      #dbg-fb-shot-remove{background:transparent;color:#f5f0e8;border:1px solid rgba(245,240,232,.35);border-radius:50%;width:26px;height:26px;font-size:12px;cursor:pointer}
      #dbg-fb-actions{display:flex;gap:8px}
      #dbg-fb-actions button{flex:1;background:#F4630B;color:#060503;border:none;border-radius:8px;padding:12px;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer}
      #dbg-fb-actions button:disabled{opacity:.5}
      #dbg-fb-actions .dbg-sec{background:transparent;color:#f5f0e8;border:1px solid rgba(245,240,232,.3)}
      #dbg-fb-status{font-size:11px;color:#F4630B;min-height:14px}
    `;
    document.head.appendChild(s);
  }

  function logsAsText() {
    return logs.map(l => `[${l.t}] ${l.k.toUpperCase()}: ${l.m}`).join('\n');
  }

  // Un solo botón "Tester Member 💬" → cae directo en el cuadro de texto, sin lista de logs en medio
  // (confundía al tester). "Enviar" manda nota+logs a Paco (POST /beta-feedback);
  // "Copiar" pone nota+versión+logs en el portapapeles para pegarlo en el chat con
  // Claude. Los logs se siguen capturando igual por detrás, solo dejan de listarse.
  function openPanel() {
    document.getElementById('tab-tester')?.classList.remove('dbg-has-error');
    let overlay = document.getElementById('dbg-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      loadWorkerVersion().then(renderVersion);
      startVerRefresh();
      overlay.querySelector('#dbg-fb-note')?.focus();
      return;
    }
    overlay = document.createElement('div');
    overlay.id = 'dbg-overlay';
    overlay.innerHTML = `
      <button id="dbg-close" aria-label="Cerrar">✕</button>
      <div id="dbg-body">
        <div id="dbg-fb">
          <textarea id="dbg-fb-note" rows="6" placeholder="Cuéntanos tu experiencia, si has tenido algún problema o ideas para mejorar..."></textarea>
          <button id="dbg-fb-shot-btn" type="button">📎 Adjuntar captura</button>
          <div id="dbg-fb-shot-preview" style="display:none">
            <img id="dbg-fb-shot-thumb" alt="captura">
            <span>captura adjunta</span>
            <button id="dbg-fb-shot-remove" type="button" aria-label="Quitar captura">✕</button>
          </div>
          <input id="dbg-fb-shot-input" type="file" accept="image/*" style="display:none">
          <div id="dbg-fb-actions">
            <button id="dbg-fb-send" type="button">Enviar</button>
            <button id="dbg-fb-copy" type="button" class="dbg-sec">📋 Copiar</button>
          </div>
          <div id="dbg-fb-status"></div>
          <details id="dbg-ver-wrap"><summary>Detalles técnicos</summary><div id="dbg-ver"></div></details>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    renderVersion();
    loadWorkerVersion().then(renderVersion);
    startVerRefresh();

    const noteEl = overlay.querySelector('#dbg-fb-note');
    const sendBtn = overlay.querySelector('#dbg-fb-send');
    const copyBtn = overlay.querySelector('#dbg-fb-copy');
    const statusEl = overlay.querySelector('#dbg-fb-status');
    const shotBtn = overlay.querySelector('#dbg-fb-shot-btn');
    const shotInput = overlay.querySelector('#dbg-fb-shot-input');
    const shotPreview = overlay.querySelector('#dbg-fb-shot-preview');
    const shotThumb = overlay.querySelector('#dbg-fb-shot-thumb');
    const shotRemove = overlay.querySelector('#dbg-fb-shot-remove');
    noteEl.focus();

    // ═══ CAPTURA ADJUNTA ═══
    // Reutiliza lo mismo que ya usa el chat para fotos: comprime en el navegador
    // (salma._compressImage, sin coste) y al enviar la sube a R2 vía el mismo
    // endpoint que ya usa la galería (/upload-gallery-photo) — no llama a ninguna
    // API de pago, solo guarda el fichero.
    let pendingShot = null; // { blob, localUrl }

    shotBtn.addEventListener('click', () => shotInput.click());

    shotInput.addEventListener('change', async () => {
      const file = shotInput.files[0];
      shotInput.value = '';
      if (!file) return;
      try {
        const blob = (window.salma && typeof salma._compressImage === 'function')
          ? await salma._compressImage(file, 1280, 0.85)
          : file;
        if (pendingShot?.localUrl) URL.revokeObjectURL(pendingShot.localUrl);
        const localUrl = URL.createObjectURL(blob);
        pendingShot = { blob, localUrl };
        shotThumb.src = localUrl;
        shotBtn.style.display = 'none';
        shotPreview.style.display = 'flex';
      } catch (e) {
        statusEl.textContent = 'No se pudo procesar la imagen.';
      }
    });

    shotRemove.addEventListener('click', () => {
      if (pendingShot?.localUrl) URL.revokeObjectURL(pendingShot.localUrl);
      pendingShot = null;
      shotPreview.style.display = 'none';
      shotBtn.style.display = '';
    });

    // Compartida entre "Enviar" y "Copiar" — si hay captura pendiente, la sube a
    // R2 (mismo endpoint de galería, sin API de pago) y devuelve la URL.
    async function uploadPendingShot() {
      if (!pendingShot) return '';
      const user = window.firebase && firebase.auth && firebase.auth().currentUser;
      const fd = new FormData();
      fd.append('photo', pendingShot.blob, 'captura.jpg');
      fd.append('uid', user?.uid || 'anon');
      const upRes = await fetch(window.SALMA_API + '/upload-gallery-photo', { method: 'POST', body: fd });
      const upData = await upRes.json().catch(() => ({}));
      return (upRes.ok && upData.url) ? upData.url : '';
    }

    overlay.querySelector('#dbg-close').addEventListener('click', () => {
      overlay.style.display = 'none';
      stopVerRefresh();
    });

    copyBtn.addEventListener('click', async () => {
      const note = noteEl.value.trim();
      let shotLine = '';
      if (pendingShot) {
        copyBtn.disabled = true;
        copyBtn.textContent = 'Subiendo captura…';
        try {
          const shotUrl = await uploadPendingShot();
          shotLine = shotUrl ? `📎 Captura: ${shotUrl}\n\n` : '(no se pudo subir la captura — inténtalo de nuevo)\n\n';
        } catch (e) {
          shotLine = '(no se pudo subir la captura — inténtalo de nuevo)\n\n';
        }
        copyBtn.disabled = false;
      }
      const text = shotLine + (note ? 'NOTA: ' + note + '\n\n' : '') + versionText() + '\n────────────\n' + logsAsText();
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        ta.remove();
      }
      copyBtn.textContent = '✓ Copiado';
      setTimeout(() => { copyBtn.textContent = '📋 Copiar'; }, 1500);
    });

    sendBtn.addEventListener('click', async () => {
      const note = noteEl.value.trim();
      if (!note) { statusEl.textContent = 'Escribe algo antes de enviar.'; return; }
      sendBtn.disabled = true;
      statusEl.textContent = 'Enviando…';
      try {
        const user = window.firebase && firebase.auth && firebase.auth().currentUser;
        if (!user) throw new Error('Inicia sesión para enviar feedback');
        if (!window.SALMA_API) throw new Error('SALMA_API no definido');
        const idToken = await user.getIdToken();
        if (!workerVer) await loadWorkerVersion();

        let screenshotUrl = '';
        if (pendingShot) {
          statusEl.textContent = 'Subiendo captura…';
          screenshotUrl = await uploadPendingShot();
        }

        statusEl.textContent = 'Enviando…';
        const res = await fetch(window.SALMA_API + '/beta-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
          body: JSON.stringify({
            note,
            email: user.email || '',
            page: location.pathname + location.search,
            url: location.href,
            worker_version: (workerVer && workerVer.version_short) || '',
            front_versions: frontVersions(),
            user_agent: navigator.userAgent,
            logs_text: logsAsText(),
            screenshot_url: screenshotUrl,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || ('HTTP ' + res.status));
        }
        statusEl.textContent = '✓ Enviado. ¡Gracias!';
        noteEl.value = '';
        shotRemove.click();
        sendBtn.disabled = false;
      } catch (e) {
        statusEl.textContent = 'Error: ' + ((e && e.message) || e);
        sendBtn.disabled = false;
      }
    });
  }

  injectStyles();

  // Expuesto para que la pestaña "Ayuda" del menú de abajo (app.js, #tab-tester)
  // pueda abrir el panel, y para poder abrirlo desde código.
  window.__dbg = { open: openPanel, logs, version: versionText, worker: loadWorkerVersion };
})();
