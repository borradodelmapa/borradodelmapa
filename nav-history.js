/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — nav-history.js
   Browser back/forward para la SPA.
   Se carga DESPUÉS de app.js — envuelve
   showState() sin tocarlo.
   ═══════════════════════════════════════════ */

(function () {
  // Esperar a que app.js defina showState (lo define en el scope global)
  if (typeof showState !== 'function') {
    console.warn('[nav] showState no disponible');
    return;
  }

  // Estados principales que merecen entrada en el historial
  // 'diario' no está — es sub-vista de bitácora, su back lo gestiona itin:close
  const PUSH_STATES = ['welcome', 'chat', 'rutas', 'profile', 'bitacora', 'notas', 'documentos', 'galeria'];

  // Guardar referencia ANTES de sobreescribir
  const _orig = showState;

  // Reemplazar historia actual con el estado inicial
  try {
    history.replaceState({ state: typeof currentState !== 'undefined' ? currentState : 'welcome' }, '');
  } catch (_) {}

  // Sobreescribir showState global
  window.showState = function (state) {
    if (PUSH_STATES.includes(state)) {
      // No duplicar si ya estamos en ese estado
      if (history.state?.state !== state) {
        history.pushState({ state }, '');
      }
    }
    _orig(state);
  };

  // Manejar back/forward del navegador
  window.addEventListener('popstate', function (e) {
    const state = e.state?.state;
    if (state && typeof _orig === 'function') {
      // Llamar _orig directamente para no generar otro pushState
      _orig(state);
    }
  });
})();
