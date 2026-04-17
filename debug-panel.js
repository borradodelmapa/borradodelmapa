// debug-panel.js — Panel de logs visible en el móvil
// Intercepta console.* y errores, muestra un botón flotante que abre
// un overlay con todos los logs + botón de Copiar.
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
      // Reflejar en el panel si está abierto
      const body = document.getElementById('dbg-body');
      if (body) renderLogs(body);
      // Badge rojo en el botón si hay error
      if (kind === 'error') {
        const btn = document.getElementById('dbg-btn');
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

  function injectStyles() {
    if (document.getElementById('dbg-styles')) return;
    const s = document.createElement('style');
    s.id = 'dbg-styles';
    s.textContent = `
      #dbg-btn{position:fixed;bottom:12px;right:12px;z-index:2147483647;width:42px;height:42px;border-radius:50%;background:#060503;color:#f0b429;border:1.5px solid #f0b429;font-size:18px;font-family:'JetBrains Mono',monospace;font-weight:700;box-shadow:0 2px 10px rgba(0,0,0,.5);cursor:pointer;opacity:.55;padding:0;display:flex;align-items:center;justify-content:center}
      #dbg-btn.dbg-has-error{background:#ef4444;color:#fff;border-color:#fff;opacity:1;animation:dbg-pulse 1s infinite}
      @keyframes dbg-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
      #dbg-overlay{position:fixed;inset:0;z-index:2147483646;background:#060503;display:flex;flex-direction:column;font-family:'JetBrains Mono',monospace}
      #dbg-head{display:flex;gap:8px;padding:10px;background:#141209;border-bottom:1px solid #f0b429}
      #dbg-head button{flex:1;background:#f0b429;color:#060503;border:none;border-radius:8px;padding:10px;font-family:inherit;font-weight:700;font-size:12px;cursor:pointer}
      #dbg-head .dbg-sec{background:transparent;color:#f5f0e8;border:1px solid rgba(245,240,232,.3)}
      #dbg-body{flex:1;overflow-y:auto;padding:8px;font-size:11px;line-height:1.5;color:#f5f0e8}
      .dbg-line{padding:4px 6px;border-bottom:1px solid rgba(240,180,41,.08);word-break:break-word;white-space:pre-wrap}
      .dbg-line.error{background:rgba(239,68,68,.12);color:#ff8b8b}
      .dbg-line.warn{background:rgba(240,180,41,.08);color:#f0b429}
      .dbg-t{color:rgba(245,240,232,.4);margin-right:6px}
    `;
    document.head.appendChild(s);
  }

  function injectButton() {
    if (document.getElementById('dbg-btn')) return;
    injectStyles();
    const b = document.createElement('button');
    b.id = 'dbg-btn';
    b.type = 'button';
    b.textContent = '🐛';
    b.title = 'Debug logs';
    b.addEventListener('click', openPanel);
    document.body.appendChild(b);
  }

  function renderLogs(body) {
    body.innerHTML = logs.map(l => `<div class="dbg-line ${l.k}"><span class="dbg-t">${l.t}</span>${escapeHtml(l.m)}</div>`).join('');
    body.scrollTop = body.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }

  function openPanel() {
    document.getElementById('dbg-btn')?.classList.remove('dbg-has-error');
    let overlay = document.getElementById('dbg-overlay');
    if (overlay) { overlay.style.display = 'flex'; return; }
    overlay = document.createElement('div');
    overlay.id = 'dbg-overlay';
    overlay.innerHTML = `
      <div id="dbg-head">
        <button id="dbg-copy">📋 Copiar</button>
        <button id="dbg-clear" class="dbg-sec">Limpiar</button>
        <button id="dbg-close" class="dbg-sec">✕</button>
      </div>
      <div id="dbg-body"></div>`;
    document.body.appendChild(overlay);
    const body = overlay.querySelector('#dbg-body');
    renderLogs(body);
    overlay.querySelector('#dbg-close').addEventListener('click', () => { overlay.style.display = 'none'; });
    overlay.querySelector('#dbg-clear').addEventListener('click', () => { logs.length = 0; renderLogs(body); });
    overlay.querySelector('#dbg-copy').addEventListener('click', async () => {
      const text = logs.map(l => `[${l.t}] ${l.k.toUpperCase()}: ${l.m}`).join('\n');
      try {
        await navigator.clipboard.writeText(text);
        const btn = overlay.querySelector('#dbg-copy');
        btn.textContent = '✓ Copiado';
        setTimeout(() => { btn.textContent = '📋 Copiar'; }, 1500);
      } catch (e) {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        ta.remove();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }

  // Exponer por si queremos abrirlo desde código
  window.__dbg = { open: openPanel, logs };
})();
