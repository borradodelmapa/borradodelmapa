/* Plantillas de PUBLICACIÓN (imagen para Instagram / historias) — 2 oct 2026, caso "plantillas de vídeo y posts".
   Seis composiciones de foto + mapa (familias: foto protagonista, collage, datos). Se pintan en un canvas 2D:
   no llaman a ninguna API de pago (el mapa sale de nuestros mosaicos, vía ctx.snap).
   Las animaciones de vídeo de estas mismas plantillas vendrán después; este módulo es solo la imagen fija.

   window.POSTS = { PLANTILLAS:[{id,n,s,fotos}], render(id, ctx) → Promise<canvas> }
   ctx = { fmt:'4:5'|'9:16', fotos:[Image], titulo, lugar, km, dias, fotosN, firma, atrib,
           snap(w,h,pad) → Promise<{canvas,pts:[[x,y]…],ini:[x,y],fin:[x,y]}> }     (pts en píxeles del canvas del mapa) */
(function () {
  const FC = '"Barlow Condensed","Arial Narrow",sans-serif', FB = 'Inter,system-ui,sans-serif';
  const OR = '#F4630B', INK = '#0D0F10', CREAM = '#ECEBE8', SOFT = '#C4C7C9';

  const PLANTILLAS = [
    { id: 'circulo',   n: 'Círculo',   s: 'Tu foto grande y el mapa en un círculo',       fotos: 1 },
    { id: 'tarjeta',   n: 'Tarjeta',   s: 'Foto grande con el mapa como tarjeta inclinada', fotos: 1 },
    { id: 'polaroids', n: 'Polaroids', s: 'El mapa de fondo y 3 fotos reveladas encima',   fotos: 3 },
    { id: 'datos',     n: 'Datos',     s: 'Foto, mapa y barra con km, días y paradas',     fotos: 1 },
    { id: 'panel',     n: 'Panel',     s: 'Foto arriba; abajo mapa y los 4 datos',          fotos: 1 },
    { id: 'apilado',   n: 'Apilado',   s: 'Mapa arriba, foto abajo',                        fotos: 1 }
  ];

  /* ── utilidades de dibujo ── */
  function fit(g, txt, weight, size, maxW, fam) {
    let s = size; g.font = `${weight} ${s}px ${fam || FC}`;
    const w = g.measureText(txt).width;
    if (w > maxW) { s = Math.max(size * .4, size * maxW / w); g.font = `${weight} ${s}px ${fam || FC}`; }
    return s;
  }
  function cover(g, img, x, y, w, h, fx = .5, fy = .42) {
    const k = Math.max(w / img.width, h / img.height), iw = img.width * k, ih = img.height * k;
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.drawImage(img, x - (iw - w) * fx, y - (ih - h) * fy, iw, ih); g.restore();
  }
  function shade(g, x, y, w, h, fromTop, a) {
    const gr = g.createLinearGradient(0, fromTop ? y : y + h, 0, fromTop ? y + h : y);
    gr.addColorStop(0, `rgba(13,15,16,${a})`); gr.addColorStop(1, 'rgba(13,15,16,0)');
    g.fillStyle = gr; g.fillRect(x, y, w, h);
  }
  function chip(g, txt, x, y, size, dark) {
    g.save(); const s = fit(g, txt, 800, size, 1e4), w = g.measureText(txt).width + s * .9, h = s * 1.3;
    g.fillStyle = dark ? 'rgba(13,15,16,.9)' : OR; g.fillRect(x, y, w, h);
    g.fillStyle = dark ? CREAM : INK; g.textBaseline = 'middle'; g.fillText(txt, x + s * .45, y + h / 2 + 1); g.restore();
    return { w, h };
  }
  function titulo(g, c, x, y, maxW, size) {
    g.save(); g.fillStyle = '#fff'; g.textBaseline = 'alphabetic';
    g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = size * .18; g.shadowOffsetY = size * .04;
    fit(g, (c.titulo || 'Mi viaje').toUpperCase(), 800, size, maxW); g.fillText((c.titulo || 'Mi viaje').toUpperCase(), x, y); g.restore();
  }
  function datosChip(c) {
    const p = [];
    if (c.km >= 1) p.push(`${Math.round(c.km)} KM`);
    if (c.dias >= 1) p.push(c.dias === 1 ? '1 DÍA' : `${c.dias} DÍAS`);
    return p.join(' · ');
  }
  function firma(g, c, x, y, size, align) {
    g.save(); g.textBaseline = 'alphabetic'; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = size * .25;
    const partes = c.firma ? [[c.firma, '#fff']] : [['✦ BORRADO', OR], [' DEL ', '#d0d3d5'], ['MAPA', OR]];
    g.font = `800 ${size}px ${FC}`;
    const tot = partes.reduce((a, p) => a + g.measureText(p[0]).width, 0);
    let px = align === 'right' ? x - tot : align === 'center' ? x - tot / 2 : x;
    partes.forEach(([t, col]) => { g.fillStyle = col; g.fillText(t, px, y); px += g.measureText(t).width; });
    g.restore();
  }
  function atrib(g, c, W, H, u) {
    g.save(); g.font = `600 ${15 * u}px ${FB}`; g.fillStyle = 'rgba(255,255,255,.7)'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 3 * u;
    g.textAlign = 'right'; g.fillText(c.atrib || '© OpenStreetMap', W - 14 * u, H - 12 * u); g.restore();
  }
  /* ruta sobre el mapa: borde blanco + línea naranja, salida con chincheta, llegada con anillo */
  function pinShape(g, x, y, s) {
    g.save(); g.fillStyle = OR; g.strokeStyle = '#fff'; g.lineWidth = s * .22; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(x, y);
    g.bezierCurveTo(x - s * .95, y - s * .95, x - s * .85, y - s * 2.15, x, y - s * 2.15);
    g.bezierCurveTo(x + s * .85, y - s * 2.15, x + s * .95, y - s * .95, x, y);
    g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y - s * 1.4, s * .36, 0, 7); g.fill(); g.restore();
  }
  function ruta(g, m, ox, oy, u, lw) {
    const P = m.pts; if (!P || P.length < 2) return;
    g.save(); g.translate(ox, oy); g.lineCap = g.lineJoin = 'round';
    const trazo = () => { g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };
    g.strokeStyle = '#fff'; g.lineWidth = (lw || 11) * u; trazo();
    g.strokeStyle = OR; g.lineWidth = (lw || 11) * u * .58; trazo();
    const f = m.fin; g.fillStyle = '#fff'; g.beginPath(); g.arc(f[0], f[1], 14 * u, 0, 7); g.fill();
    g.fillStyle = OR; g.beginPath(); g.arc(f[0], f[1], 8 * u, 0, 7); g.fill();
    pinShape(g, m.ini[0], m.ini[1], 15 * u); g.restore();
  }
  function mapa(g, m, x, y, u, lw) { g.drawImage(m.canvas, x, y); ruta(g, m, x, y, u, lw); }

  /* iconos de los datos (cuadrícula 24) */
  function icono(g, nom, cx, cy, s, col) {
    g.save(); g.translate(cx - s / 2, cy - s / 2); g.scale(s / 24, s / 24);
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 2; g.lineCap = g.lineJoin = 'round'; g.beginPath();
    if (nom === 'pin') { g.moveTo(12, 22); g.bezierCurveTo(5, 15, 4, 11, 4, 9.5); g.arc(12, 9.5, 8, Math.PI, 0); g.bezierCurveTo(20, 11, 19, 15, 12, 22); g.stroke(); g.beginPath(); g.arc(12, 9.5, 2.8, 0, 7); g.stroke(); }
    else if (nom === 'road') { g.moveTo(8, 22); g.bezierCurveTo(8, 16, 17, 16, 15, 11); g.bezierCurveTo(13, 6, 8, 8, 10, 2); g.stroke(); g.beginPath(); g.moveTo(16, 22); g.bezierCurveTo(16, 18, 21, 15, 19, 11); g.stroke(); }
    else if (nom === 'clock') { g.arc(12, 12, 9.5, 0, 7); g.stroke(); g.beginPath(); g.moveTo(12, 6.5); g.lineTo(12, 12); g.lineTo(16, 14.5); g.stroke(); }
    else { g.rect(2.5, 6.5, 19, 14); g.stroke(); g.beginPath(); g.moveTo(8, 6.5); g.lineTo(9.5, 3.5); g.lineTo(14.5, 3.5); g.lineTo(16, 6.5); g.stroke(); g.beginPath(); g.arc(12, 13.5, 4, 0, 7); g.stroke(); }
    g.restore();
  }
  function listaDatos(c) {
    const d = [{ ic: 'pin', v: (c.lugar || c.titulo || 'Viaje').toUpperCase(), l: 'DESTINO' }];
    if (c.km >= 1) d.push({ ic: 'road', v: `${Math.round(c.km)} KM`, l: 'DE RUTA' });
    if (c.dias >= 1) d.push({ ic: 'clock', v: c.dias === 1 ? '1 DÍA' : `${c.dias} DÍAS`, l: 'DE VIAJE' });
    if (c.fotosN >= 1) d.push({ ic: 'cam', v: String(c.fotosN), l: c.fotosN === 1 ? 'FOTO' : 'FOTOS' });
    return d;
  }
  function barraDatos(g, c, x, y, w, h, u) {
    g.fillStyle = INK; g.fillRect(x, y, w, h);
    g.fillStyle = OR; g.fillRect(x, y, w, 5 * u);
    const d = listaDatos(c), cw = w / d.length;
    d.forEach((it, i) => {
      const cx = x + cw * (i + .5);
      icono(g, it.ic, cx, y + h * .27, 46 * u, OR);
      g.textAlign = 'center'; g.fillStyle = CREAM; fit(g, it.v, 800, 46 * u, cw - 24 * u); g.fillText(it.v, cx, y + h * .66);
      g.fillStyle = '#8E9194'; g.font = `700 ${22 * u}px ${FC}`; g.fillText(it.l, cx, y + h * .86); g.textAlign = 'left';
      if (i) { g.fillStyle = '#2B2E30'; g.fillRect(x + cw * i, y + h * .15, 2 * u, h * .7); }
    });
  }
  function panelDatos(g, c, x, y, w, h, u) {
    g.fillStyle = INK; g.fillRect(x, y, w, h);
    const d = listaDatos(c), rh = h / d.length;
    d.forEach((it, i) => {
      const cy = y + rh * (i + .5), ix = x + 56 * u;
      icono(g, it.ic, ix, cy, 44 * u, OR);
      g.textAlign = 'left'; g.fillStyle = CREAM; fit(g, it.v, 800, 44 * u, w - 130 * u); g.fillText(it.v, x + 100 * u, cy + 4 * u);
      g.fillStyle = '#8E9194'; g.font = `700 ${20 * u}px ${FC}`; g.fillText(it.l, x + 100 * u, cy + 30 * u);
      if (i) { g.fillStyle = '#2B2E30'; g.fillRect(x + 30 * u, y + rh * i, w - 60 * u, 2 * u); }
    });
  }
  function flecha(g, x0, y0, x1, y1, u) {
    g.save(); g.strokeStyle = g.fillStyle = '#fff'; g.lineWidth = 7 * u; g.lineCap = 'round'; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 8 * u;
    const cx = (x0 + x1) / 2 - (y1 - y0) * .3, cy = (y0 + y1) / 2 + (x1 - x0) * .3;
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
    const a = Math.atan2(y1 - cy, x1 - cx), L = 34 * u;
    g.beginPath(); g.moveTo(x1 + Math.cos(a) * 6 * u, y1 + Math.sin(a) * 6 * u);
    g.lineTo(x1 - L * Math.cos(a - .5), y1 - L * Math.sin(a - .5)); g.lineTo(x1 - L * Math.cos(a + .5), y1 - L * Math.sin(a + .5)); g.closePath(); g.fill(); g.restore();
  }
  function polaroid(g, img, cx, cy, w, rot, c, u) {
    const pad = w * .05, h = w * 1.2; g.save(); g.translate(cx, cy); g.rotate(rot);
    g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 26 * u; g.shadowOffsetY = 10 * u; g.fillStyle = '#fff'; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent';
    cover(g, img, -w / 2 + pad, -h / 2 + pad, w - pad * 2, w - pad * 2);
    g.translate(0, h / 2 - (h - w) / 2 + pad * .2);
    const partes = c.firma ? [[c.firma, '#1f1b17']] : [['✦ BORRADO', OR], [' DEL ', '#8E9194'], ['MAPA', OR]];
    g.font = `800 ${w * .06}px ${FC}`; g.textBaseline = 'middle';
    const tot = partes.reduce((a, p) => a + g.measureText(p[0]).width, 0); let px = -tot / 2;
    partes.forEach(([t, col]) => { g.fillStyle = col; g.fillText(t, px, -w * .06); px += g.measureText(t).width; });
    g.restore();
  }
  function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  /* ── las 6 plantillas ── */
  const T = {
    async circulo(g, c, W, H, u) {
      cover(g, c.fotos[0], 0, 0, W, H); shade(g, 0, 0, W, H * .42, true, .65); shade(g, 0, H * .62, W, H * .38, false, .5);
      titulo(g, c, 56 * u, 150 * u, W - 112 * u, 128 * u);
      const dc = datosChip(c); if (dc) chip(g, dc, 60 * u, 186 * u, 44 * u);
      const r = W * .27, cx = W - r * .9, cy = H - r * 1.0, m = await c.snap(Math.round(2 * r), Math.round(2 * r), .2);
      flecha(g, cx - r * .55, cy - r * 1.05, cx - r * 1.5, cy - r * 1.55, u);
      g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30 * u; g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, r + 10 * u, 0, 7); g.fill(); g.restore();
      g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip(); mapa(g, m, cx - r, cy - r, u, 12); g.restore();
      firma(g, c, 56 * u, H - 44 * u, 40 * u, 'left');
    },
    async tarjeta(g, c, W, H, u) {
      cover(g, c.fotos[0], 0, 0, W, H); shade(g, 0, 0, W, H * .4, true, .62); shade(g, 0, H * .6, W, H * .4, false, .5);
      titulo(g, c, 56 * u, 150 * u, W - 112 * u, 128 * u);
      const dc = datosChip(c); if (dc) chip(g, dc, 60 * u, 186 * u, 44 * u);
      const w = W * .5, h = W * .56, b = 14 * u, m = await c.snap(Math.round(w), Math.round(h), .16);
      g.save(); g.translate(W - w / 2 - 50 * u, H - h / 2 - 150 * u); g.rotate(-.1);
      g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30 * u; g.shadowOffsetY = 12 * u; g.fillStyle = '#fff'; rrect(g, -w / 2 - b, -h / 2 - b, w + b * 2, h + b * 2, 22 * u); g.fill(); g.shadowColor = 'transparent';
      g.beginPath(); rrect(g, -w / 2, -h / 2, w, h, 12 * u); g.clip(); mapa(g, m, -w / 2, -h / 2, u, 10); g.restore();
      firma(g, c, 56 * u, H - 44 * u, 40 * u, 'left');
    },
    async polaroids(g, c, W, H, u) {
      const m = await c.snap(W, H, .26); mapa(g, m, 0, 0, u, 12);
      shade(g, 0, 0, W, H * .26, true, .72); shade(g, 0, H * .84, W, H * .16, false, .55);
      titulo(g, c, 56 * u, 140 * u, W - 112 * u, 124 * u);
      const dc = datosChip(c); if (dc) chip(g, dc, 60 * u, 176 * u, 44 * u);
      const pw = W * .46, F = c.fotos, pos = [[.30, .40, -.13], [.70, .52, .09], [.37, .73, -.04]];
      F.slice(0, 3).forEach((im, i) => polaroid(g, im, W * pos[i][0], H * pos[i][1], pw, pos[i][2], c, u));
      firma(g, c, W / 2, H - 38 * u, 40 * u, 'center');
    },
    async datos(g, c, W, H, u) {
      const h1 = Math.round(H * .56), h2 = Math.round(H * .2), h3 = H - h1 - h2;
      cover(g, c.fotos[0], 0, 0, W, h1); shade(g, 0, 0, W, h1 * .45, true, .62);
      titulo(g, c, 56 * u, 150 * u, W - 112 * u, 124 * u);
      const dc = datosChip(c); if (dc) chip(g, dc, 60 * u, 186 * u, 44 * u);
      const m = await c.snap(W, h2, .2); mapa(g, m, 0, h1, u, 10);
      barraDatos(g, c, 0, h1 + h2, W, h3, u); firma(g, c, W - 44 * u, 64 * u, 34 * u, 'right');
    },
    async panel(g, c, W, H, u) {
      const h1 = Math.round(H * .5), h2 = H - h1, mw = Math.round(W * .54);
      cover(g, c.fotos[0], 0, 0, W, h1); shade(g, 0, h1 * .45, W, h1 * .55, false, .72); shade(g, 0, 0, W, 170 * u, true, .5);
      firma(g, c, 56 * u, 74 * u, 36 * u, 'left');
      titulo(g, c, 56 * u, h1 - 112 * u, W - 112 * u, 124 * u);
      const dc = datosChip(c); if (dc) chip(g, dc, 60 * u, h1 - 94 * u, 44 * u);
      const m = await c.snap(mw, h2, .2); mapa(g, m, 0, h1, u, 10);
      panelDatos(g, c, mw, h1, W - mw, h2, u);
    },
    async apilado(g, c, W, H, u) {
      const h1 = Math.round(H * .42), h2 = H - h1;
      const m = await c.snap(W, h1, .16); mapa(g, m, 0, 0, u, 11);
      cover(g, c.fotos[0], 0, h1, W, h2);
      g.fillStyle = OR; g.fillRect(0, h1 - 3 * u, W, 6 * u);
      shade(g, 0, 0, W, h1 * .42, true, .6); titulo(g, c, 56 * u, 130 * u, W - 112 * u, 118 * u);
      const dc = datosChip(c); if (dc) chip(g, dc, 60 * u, h1 + 28 * u, 46 * u);
      shade(g, 0, H - 200 * u, W, 200 * u, false, .55); firma(g, c, 56 * u, H - 44 * u, 40 * u, 'left');
    }
  };

  async function render(id, c) {
    const fn = T[id]; if (!fn) throw new Error('plantilla desconocida: ' + id);
    const W = 1080, H = c.fmt === '9:16' ? 1920 : 1350, u = W / 1080;
    if (document.fonts && document.fonts.load) { try { await Promise.all([document.fonts.load('800 40px "Barlow Condensed"'), document.fonts.load('700 20px "Barlow Condensed"')]); } catch (_) {} }
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); g.fillStyle = INK; g.fillRect(0, 0, W, H);
    await fn(g, c, W, H, u); atrib(g, c, W, H, u);
    return cv;
  }

  window.POSTS = { PLANTILLAS, render };
})();
