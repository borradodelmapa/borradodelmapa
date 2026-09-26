// debug-panel.js — "Mejora Salma" + panel técnico
// Intercepta console.* y errores en segundo plano (van con cada envío como detalles
// técnicos). Formulario "Mejora Salma" (botón fijo arriba y pantalla Ayuda), 👍/👎
// de respuestas y rutas, y "¿Nos avisas?" cuando algo falla — todo a POST
// /beta-feedback, también sin cuenta (26 sept 2026). Ver window.__dbg al final.
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

  // ═══ MEJORA SALMA (26 sept 2026) ═══
  // Todo el mundo es tester: formulario "Mejora Salma" (botón fijo arriba + Ayuda),
  // 👍/👎 debajo de cada respuesta de Salma y de cada ruta, y "¿Nos avisas?" cuando
  // algo falla. Todo va a POST /beta-feedback (también sin cuenta) → pestaña Feedback
  // del panel admin. Los 👍 solo se cuentan (feedback_ratings).

  function injectStyles() {
    if (document.getElementById('dbg-styles')) return;
    const s = document.createElement('style');
    s.id = 'dbg-styles';
    s.textContent = `
      #dbg-overlay{position:fixed;inset:0;z-index:2147483646;background:#0D0F10;display:flex;flex-direction:column;font-family:'Inter',sans-serif;color:#ECEBE8}
      #dbg-close{position:absolute;top:10px;right:10px;z-index:2;width:38px;height:38px;background:#17191B;color:#ECEBE8;border:1px solid #2B2E30;font-size:15px;cursor:pointer}
      #dbg-body{flex:1;overflow-y:auto;box-sizing:border-box;padding:18px 16px 24px;display:flex;flex-direction:column;gap:12px;max-width:620px;width:100%;margin:0 auto}
      #dbg-fb{display:flex;flex-direction:column;gap:12px;flex:1}
      .mj-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:30px;line-height:1;margin:4px 0 0;color:#ECEBE8}
      .mj-sub{font-size:15px;line-height:1.5;color:#C4C7C9;margin:0}
      .mj-sub b{color:#F4630B;font-weight:700}
      .mj-kinds{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .mj-kind{background:#17191B;border:1.5px solid #2B2E30;color:#ECEBE8;padding:12px 6px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:16px;line-height:1.15;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px}
      .mj-kind span{font-size:22px}
      .mj-kind.on{border-color:#F4630B;background:rgba(244,99,11,.12)}
      #dbg-fb textarea{width:100%;box-sizing:border-box;min-height:130px;background:#17191B;color:#ECEBE8;border:1.5px solid #2B2E30;padding:12px;font-family:inherit;font-size:15px;line-height:1.5;resize:vertical}
      #dbg-fb textarea:focus,#dbg-fb input:focus{outline:none;border-color:#F4630B}
      #dbg-fb-contact{width:100%;box-sizing:border-box;background:#17191B;color:#ECEBE8;border:1.5px solid #2B2E30;padding:11px 12px;font-family:inherit;font-size:14px}
      #dbg-fb-shot-btn{align-self:flex-start;background:transparent;color:#F4630B;border:1px dashed rgba(244,99,11,.55);padding:9px 14px;font-family:inherit;font-size:14px;cursor:pointer}
      #dbg-fb-shot-preview{display:flex;align-items:center;gap:10px}
      #dbg-fb-shot-thumb{width:48px;height:48px;object-fit:cover;border:1px solid #2B2E30}
      #dbg-fb-shot-preview span{flex:1;color:#C4C7C9;font-size:13px}
      #dbg-fb-shot-remove{background:transparent;color:#ECEBE8;border:1px solid #2B2E30;width:28px;height:28px;font-size:12px;cursor:pointer}
      #dbg-fb-send{background:#F4630B;color:#0D0F10;border:none;padding:14px;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:19px;letter-spacing:.04em;text-transform:uppercase;cursor:pointer}
      #dbg-fb-send:disabled{opacity:.5}
      #dbg-fb-status{font-size:14px;color:#F4630B;min-height:18px;line-height:1.45}
      #dbg-ver-wrap{margin-top:6px;color:#7E8285;font-size:13px}#dbg-ver-wrap summary{cursor:pointer}
      #dbg-ver{margin-top:8px;background:#17191B;border:1px solid #2B2E30;padding:8px 10px;color:#C4C7C9;font-size:11px;line-height:1.6;white-space:pre-wrap;word-break:break-all}
      #dbg-fb-copy{margin-top:8px;background:transparent;color:#ECEBE8;border:1px solid #2B2E30;padding:9px 12px;font-family:inherit;font-size:13px;cursor:pointer}

      /* 👍/👎 debajo de respuestas y rutas */
      .mj-rate{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:10px;font-size:13px;color:#7E8285}
      .mj-rate-q{margin-right:2px}
      .mj-rate-btn{background:transparent;border:1px solid #2B2E30;color:#C4C7C9;width:36px;height:32px;font-size:15px;cursor:pointer;line-height:1}
      .mj-rate-btn:active{transform:scale(.94)}
      .mj-rate-btn.on{border-color:#F4630B;background:rgba(244,99,11,.14)}
      .mj-rate-why{flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
      .mj-chip{background:#17191B;border:1px solid #2B2E30;color:#ECEBE8;padding:7px 10px;font-size:13px;cursor:pointer;font-family:inherit}
      .mj-chip.on{border-color:#F4630B;color:#F4630B}
      .mj-rate-text{flex-basis:100%;display:flex;gap:6px;margin-top:4px}
      .mj-rate-text input{flex:1;min-width:0;background:#17191B;border:1px solid #2B2E30;color:#ECEBE8;padding:8px 10px;font-size:14px;font-family:inherit}
      .mj-rate-text button{background:#F4630B;color:#0D0F10;border:none;padding:8px 14px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit}
      .mj-rate-done{color:#C4C7C9;font-size:13px;line-height:1.45}
      .mj-rate-done b{color:#F4630B}
      /* Aviso cuando algo falla */
      .mj-report{display:inline-block;margin:8px 0 0 8px;background:transparent;border:1px dashed rgba(244,99,11,.55);color:#F4630B;padding:7px 10px;font-size:13px;cursor:pointer;font-family:inherit}
      .mj-report:disabled{border-style:solid;color:#C4C7C9;border-color:#2B2E30;cursor:default}
    `;
    document.head.appendChild(s);
  }

  function logsAsText() {
    return logs.map(l => `[${l.t}] ${l.k.toUpperCase()}: ${l.m}`).join('\n');
  }

  // Envío común (formulario, 👍/👎, avisos). Con sesión manda el token; sin sesión
  // también funciona (el Worker limita por IP).
  async function sendFeedback(payload) {
    if (!window.SALMA_API) throw new Error('SALMA_API no definido');
    const user = window.firebase && firebase.auth && firebase.auth().currentUser;
    const headers = { 'Content-Type': 'application/json' };
    if (user) { try { headers.Authorization = 'Bearer ' + await user.getIdToken(); } catch (_) {} }
    if (!workerVer) { try { await loadWorkerVersion(); } catch (_) {} }
    const res = await fetch(window.SALMA_API + '/beta-feedback', {
      method: 'POST',
      headers,
      body: JSON.stringify(Object.assign({
        email: (user && user.email) || '',
        page: location.pathname + location.search + (window.currentState ? ' [' + window.currentState + ']' : ''),
        url: location.href,
        worker_version: (workerVer && workerVer.version_short) || '',
        front_versions: frontVersions(),
        user_agent: navigator.userAgent,
        logs_text: logsAsText(),
      }, payload)),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || ('HTTP ' + res.status));
    }
    return res.json().catch(() => ({}));
  }

  const PREMIUM_LINE = 'Si es un fallo y lo confirmamos, te regalamos <b>1 mes de Premium</b>.';
  const KIND_OPTS = [
    { k: 'panel_fallo', icon: '🐞', label: 'Algo no va', ph: '¿Qué ha pasado? Cuanto más concreto, mejor: qué hiciste, qué esperabas y qué salió.' },
    { k: 'panel_idea', icon: '💡', label: 'Tengo una idea', ph: '¿Qué te gustaría que hiciera Salma, o qué cambiarías?' },
    { k: 'panel_encanta', icon: '❤️', label: 'Me ha encantado', ph: '¿Qué te ha gustado? (opcional)' },
  ];

  // opts: { kind } para abrir con un tipo ya marcado
  function openPanel(opts) {
    opts = opts || {};
    document.getElementById('tab-tester')?.classList.remove('dbg-has-error');
    let overlay = document.getElementById('dbg-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      loadWorkerVersion().then(renderVersion);
      startVerRefresh();
      if (opts.kind) overlay.querySelector(`.mj-kind[data-k="${opts.kind}"]`)?.click();
      refreshContact(overlay);
      return;
    }
    overlay = document.createElement('div');
    overlay.id = 'dbg-overlay';
    overlay.innerHTML = `
      <button id="dbg-close" aria-label="Cerrar">✕</button>
      <div id="dbg-body">
        <div id="dbg-fb">
          <h2 class="mj-title">Mejora Salma</h2>
          <p class="mj-sub">Salma está creciendo y tú nos ayudas a mejorarla. Lo leemos todo. ${PREMIUM_LINE}</p>
          <div class="mj-kinds">
            ${KIND_OPTS.map(o => `<button type="button" class="mj-kind" data-k="${o.k}"><span>${o.icon}</span>${o.label}</button>`).join('')}
          </div>
          <textarea id="dbg-fb-note" rows="5" placeholder="Cuéntanos lo que quieras…"></textarea>
          <input id="dbg-fb-contact" type="text" placeholder="Tu email o WhatsApp (opcional)" style="display:none">
          <button id="dbg-fb-shot-btn" type="button">📎 Adjuntar captura</button>
          <div id="dbg-fb-shot-preview" style="display:none">
            <img id="dbg-fb-shot-thumb" alt="captura">
            <span>captura adjunta</span>
            <button id="dbg-fb-shot-remove" type="button" aria-label="Quitar captura">✕</button>
          </div>
          <input id="dbg-fb-shot-input" type="file" accept="image/*" style="display:none">
          <button id="dbg-fb-send" type="button">Enviar</button>
          <div id="dbg-fb-status"></div>
          <details id="dbg-ver-wrap"><summary>Detalles técnicos</summary><div id="dbg-ver"></div>
            <button id="dbg-fb-copy" type="button">📋 Copiar detalles</button></details>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    renderVersion();
    loadWorkerVersion().then(renderVersion);
    startVerRefresh();

    const noteEl = overlay.querySelector('#dbg-fb-note');
    const contactEl = overlay.querySelector('#dbg-fb-contact');
    const sendBtn = overlay.querySelector('#dbg-fb-send');
    const copyBtn = overlay.querySelector('#dbg-fb-copy');
    const statusEl = overlay.querySelector('#dbg-fb-status');
    const shotBtn = overlay.querySelector('#dbg-fb-shot-btn');
    const shotInput = overlay.querySelector('#dbg-fb-shot-input');
    const shotPreview = overlay.querySelector('#dbg-fb-shot-preview');
    const shotThumb = overlay.querySelector('#dbg-fb-shot-thumb');
    const shotRemove = overlay.querySelector('#dbg-fb-shot-remove');
    let kind = '';

    overlay.querySelectorAll('.mj-kind').forEach(btn => btn.addEventListener('click', () => {
      overlay.querySelectorAll('.mj-kind').forEach(b => b.classList.toggle('on', b === btn));
      kind = btn.dataset.k;
      const o = KIND_OPTS.find(x => x.k === kind);
      if (o) noteEl.placeholder = o.ph;
      statusEl.textContent = '';
      noteEl.focus();
    }));
    if (opts.kind) overlay.querySelector(`.mj-kind[data-k="${opts.kind}"]`)?.click();
    refreshContact(overlay);

    // ═══ CAPTURA ADJUNTA ═══
    // Comprime en el navegador (salma._compressImage, sin coste) y al enviar la sube
    // a R2 por el mismo endpoint de la galería — sin APIs de pago.
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

    // "Copiar detalles" (dentro de Detalles técnicos): nota + versión + logs al
    // portapapeles, para pegarlo en una sesión con Claude.
    copyBtn.addEventListener('click', async () => {
      const note = noteEl.value.trim();
      const text = (note ? 'NOTA: ' + note + '\n\n' : '') + versionText() + '\n────────────\n' + logsAsText();
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
      setTimeout(() => { copyBtn.textContent = '📋 Copiar detalles'; }, 1500);
    });

    sendBtn.addEventListener('click', async () => {
      const note = noteEl.value.trim();
      if (!kind && !note) { statusEl.textContent = 'Elige una opción o escribe algo.'; return; }
      if ((kind === 'panel_fallo' || kind === 'panel_idea' || !kind) && !note) {
        statusEl.textContent = 'Cuéntanos un poco más en el cuadro de texto.'; noteEl.focus(); return;
      }
      sendBtn.disabled = true;
      statusEl.textContent = 'Enviando…';
      try {
        let screenshotUrl = '';
        if (pendingShot) {
          statusEl.textContent = 'Subiendo captura…';
          screenshotUrl = await uploadPendingShot();
        }
        statusEl.textContent = 'Enviando…';
        await sendFeedback({
          kind: kind || 'panel',
          note,
          contact: contactEl.style.display === 'none' ? '' : contactEl.value.trim(),
          screenshot_url: screenshotUrl,
        });
        const loggedIn = !!(window.firebase && firebase.auth && firebase.auth().currentUser);
        statusEl.innerHTML = kind === 'panel_encanta'
          ? '✓ ¡Gracias! Nos alegra un montón.'
          : kind === 'panel_idea'
            ? '✓ ¡Apuntada! Gracias por la idea, las leemos todas.'
            : '✓ Recibido, gracias. Lo miramos.' + (loggedIn ? ' Si lo confirmamos, te llevas 1 mes de Premium.' : ' Si quieres el mes de Premium cuando lo confirmemos, créate una cuenta gratis.');
        noteEl.value = '';
        shotRemove.click();
        overlay.querySelectorAll('.mj-kind').forEach(b => b.classList.remove('on'));
        kind = '';
        sendBtn.disabled = false;
      } catch (e) {
        statusEl.textContent = 'No se ha podido enviar: ' + ((e && e.message) || e);
        sendBtn.disabled = false;
      }
    });
  }

  // Sin sesión se pide (opcional) un email o WhatsApp para poder contestar
  function refreshContact(overlay) {
    const el = overlay.querySelector('#dbg-fb-contact');
    const user = window.firebase && firebase.auth && firebase.auth().currentUser;
    if (el) el.style.display = user ? 'none' : '';
  }

  // ═══ 👍 / 👎 ═══
  // where: 'chat' | 'ruta'. getContext() devuelve { question, answer, route_id, route_title, stops }
  // en el momento de votar (no al pintar), para coger el texto ya completo.
  const REASONS = {
    chat: ['Dato falso', 'No me entendió', 'Lugar que no existe', 'Muy lenta', 'Demasiado larga', 'Otro'],
    ruta: ['Lugar que no existe', 'Mal ordenada', 'Falta algo importante', 'Dato falso', 'Otro'],
  };
  function rateBar(where, getContext, question) {
    const bar = document.createElement('div');
    bar.className = 'mj-rate';
    bar.innerHTML = `<span class="mj-rate-q">${question || '¿Te ha servido?'}</span>
      <button type="button" class="mj-rate-btn" data-v="up" aria-label="Me sirve">👍</button>
      <button type="button" class="mj-rate-btn" data-v="down" aria-label="No me sirve">👎</button>`;
    const ctx = () => { try { return Object.assign({ where }, getContext ? getContext() : {}); } catch (_) { return { where }; } };
    const done = html => { bar.innerHTML = `<span class="mj-rate-done">${html}</span>`; };

    bar.querySelector('[data-v="up"]').addEventListener('click', (e) => {
      e.stopPropagation();
      done('¡Gracias! 🧡');
      sendFeedback({ kind: 'up', context: ctx() }).catch(() => {});
    });
    bar.querySelector('[data-v="down"]').addEventListener('click', (e) => {
      e.stopPropagation();
      if (bar.querySelector('.mj-rate-why')) return;
      e.currentTarget.classList.add('on');
      let reason = '';
      const why = document.createElement('div');
      why.className = 'mj-rate-why';
      why.innerHTML = REASONS[where].map(r => `<button type="button" class="mj-chip">${r}</button>`).join('');
      const txt = document.createElement('div');
      txt.className = 'mj-rate-text';
      txt.innerHTML = `<input type="text" maxlength="300" placeholder="${where === 'ruta' ? '¿Qué parada o qué falla? (opcional)' : '¿Qué ha fallado? (opcional)'}"><button type="button">Enviar</button>`;
      bar.appendChild(why);
      bar.appendChild(txt);
      why.querySelectorAll('.mj-chip').forEach(c => c.addEventListener('click', (ev) => {
        ev.stopPropagation();
        why.querySelectorAll('.mj-chip').forEach(x => x.classList.toggle('on', x === c));
        reason = c.textContent;
      }));
      const input = txt.querySelector('input');
      const send = async (ev) => {
        if (ev) ev.stopPropagation();
        const note = input.value.trim();
        if (!reason && !note) { input.placeholder = 'Elige un motivo o escribe algo'; input.focus(); return; }
        const btn = txt.querySelector('button');
        btn.disabled = true; btn.textContent = '…';
        try {
          await sendFeedback({ kind: 'down', reason, note, context: ctx() });
          done('Gracias, lo miramos. ' + PREMIUM_LINE);
        } catch (err) {
          btn.disabled = false; btn.textContent = 'Enviar';
          input.value = note; input.placeholder = 'No se pudo enviar — prueba otra vez';
        }
      };
      txt.querySelector('button').addEventListener('click', send);
      input.addEventListener('keydown', ev => { if (ev.key === 'Enter') send(ev); });
      input.addEventListener('click', ev => ev.stopPropagation());
    });
    return bar;
  }

  // ═══ "¿Nos avisas?" cuando algo falla ═══
  // Un toque: manda qué ha fallado + los detalles técnicos que ya se recogen solos.
  function reportButton(what, getContext) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mj-report';
    btn.textContent = '⚑ ¿Nos avisas? Un toque';
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      btn.disabled = true;
      btn.textContent = 'Avisando…';
      let cx = {};
      try { cx = getContext ? getContext() : {}; } catch (_) {}
      try {
        await sendFeedback({ kind: 'auto_error', reason: what, context: Object.assign({ where: 'error' }, cx) });
        btn.textContent = '✓ Avisado, gracias';
      } catch (_) {
        btn.disabled = false;
        btn.textContent = '⚑ No se pudo — toca otra vez';
      }
    });
    return btn;
  }

  injectStyles();

  // open: formulario "Mejora Salma" (botón de arriba y pantalla Ayuda).
  // rateBar / reportButton: los usan salma.js (chat) y mapa-itinerario.js (rutas).
  window.__dbg = { open: openPanel, logs, version: versionText, worker: loadWorkerVersion,
    send: sendFeedback, rateBar, reportButton };
})();
