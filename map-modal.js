// ═══════════════════════════════════════════════════════════════
// map-modal.js — Modal simple con iframe Google Maps
// ═══════════════════════════════════════════════════════════════
(function() {
  function _injectCSS() {
    if (document.getElementById('mm-css')) return;
    const s = document.createElement('style');
    s.id = 'mm-css';
    s.textContent = `
#mm { position: fixed; inset: 0; z-index: 10000; background: #060503; }
#mm-iframe { width: 100%; height: 100%; border: 0; display: block; }
#mm-close { position: absolute; top: 14px; right: 14px; width: 42px; height: 42px; border-radius: 50%; background: rgba(0,0,0,0.82); color: #fff; border: none; font-size: 26px; line-height: 1; cursor: pointer; z-index: 12; display:flex; align-items:center; justify-content:center; }
#mm-open { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); background: #f0b429; color: #060503; border: none; padding: 12px 20px; border-radius: 22px; font-size: 13px; font-weight: 700; cursor: pointer; z-index: 12; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
    `;
    document.head.appendChild(s);
  }

  function _getUserLoc() {
    if (typeof salma !== 'undefined' && salma._userLocation) {
      return { lat: salma._userLocation.lat, lng: salma._userLocation.lng };
    }
    return null;
  }

  function _buildEmbedUrl(url) {
    // Convertir URL de Google Maps a formato embed con directions reales
    try {
      const userLoc = _getUserLoc();
      const saddr = userLoc ? userLoc.lat + ',' + userLoc.lng : '';

      if (/\/maps\/dir\/\?api=1/i.test(url)) {
        const u = new URL(url);
        const dest = u.searchParams.get('destination') || '';
        return 'https://maps.google.com/maps?saddr=' + encodeURIComponent(saddr) +
          '&daddr=' + encodeURIComponent(dest) + '&output=embed';
      }
      if (/\/maps\/dir\/[^?]/i.test(url)) {
        const parts = url.split('/dir/')[1].split('/').filter(Boolean);
        const places = parts.map(p => decodeURIComponent(p.replace(/\+/g, ' ')));
        if (places.length >= 2) {
          const daddr = places.map(encodeURIComponent).join('+to:');
          return 'https://maps.google.com/maps?saddr=' + encodeURIComponent(saddr) +
            '&daddr=' + daddr + '&output=embed';
        }
        if (places.length === 1) {
          return 'https://maps.google.com/maps?q=' + encodeURIComponent(places[0]) + '&output=embed';
        }
      }
      if (!/[?&]output=embed/i.test(url)) {
        return url + (url.indexOf('?') === -1 ? '?' : '&') + 'output=embed';
      }
      return url;
    } catch (_) {
      return url;
    }
  }

  window.openMapsModal = function(url) {
    try {
      _injectCSS();
      document.getElementById('mm')?.remove();

      const embedUrl = _buildEmbedUrl(url);

      const modal = document.createElement('div');
      modal.id = 'mm';
      modal.innerHTML = `
        <iframe id="mm-iframe" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
        <button id="mm-close" aria-label="Cerrar">×</button>
        <button id="mm-open">📍 Abrir en Google Maps</button>
      `;
      document.body.appendChild(modal);

      document.getElementById('mm-close').addEventListener('click', () => modal.remove());
      document.getElementById('mm-open').addEventListener('click', () => {
        window.open(url, '_blank');
      });
    } catch (e) {
      window.open(url, '_blank');
    }
  };
})();
