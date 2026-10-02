/* Plantillas de PUBLICACIÓN y de VÍDEO con plantillas — 2 oct 2026.
   Seis composiciones de foto + mapa (foto protagonista, collage, datos). Se pintan en un canvas 2D:
   no llaman a ninguna API de pago (el mapa sale de nuestros mosaicos, vía ctx.snap).
   La MISMA plantilla sirve para la imagen fija (render) y para el vídeo (video): una escena es la plantilla
   con una animación de entrada (ruta dibujándose, mapa y fotos que entran, datos que cuentan).

   window.POSTS = { PLANTILLAS, CICLO, render(id, ctx), video(opts) }
   ctx (imagen) = { fmt:'4:5'|'9:16', fotos:[Image], titulo, lugar, km, dias, fotosN, firma, atrib,
                    snap(w,h,pad) → Promise<{canvas,pts,ini,fin}> }     (pts en píxeles del canvas del mapa)
   video(opts)  = { W,H, paradas:[{nombre,dia,km,fotos:[Image]}], total, titulo, firma, atrib, fotosN, tpl:'mezcla'|id,
                    snap, onProgreso(i,n) } → Promise<{total, frame(g,t)}>                                             */
(function () {
  const FC = '"Barlow Condensed","Arial Narrow",sans-serif', FB = 'Inter,system-ui,sans-serif';
  const OR = '#F4630B', INK = '#0D0F10', CREAM = '#ECEBE8';

  const PLANTILLAS = [
    { id: 'circulo',   n: 'Círculo',   s: 'Tu foto grande y el mapa en un círculo',         fotos: 1 },
    { id: 'tarjeta',   n: 'Tarjeta',   s: 'Foto grande con el mapa como tarjeta inclinada', fotos: 1 },
    { id: 'polaroids', n: 'Polaroids', s: 'El mapa de fondo y 3 fotos reveladas encima',    fotos: 3 },
    { id: 'datos',     n: 'Datos',     s: 'Foto, mapa y barra con km, días y paradas',      fotos: 1 },
    { id: 'panel',     n: 'Panel',     s: 'Foto arriba; abajo mapa y los 4 datos',          fotos: 1 },
    { id: 'apilado',   n: 'Apilado',   s: 'Mapa arriba, foto abajo',                        fotos: 1 }
  ];
  const CICLO = ['circulo', 'datos', 'polaroids', 'tarjeta', 'panel', 'apilado'];   // el orden de la "Mezcla" en el vídeo

  /* ── animación: A.k(a,b) = progreso suave 0→1 entre a y b segundos de la escena (en la imagen fija, siempre 1) ── */
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const easeBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  function mkA(p) {
    const t = p ? p.t : 1e9, d = p ? p.d : 1;
    return {
      on: !!p, t,
      k: (a, b) => p ? easeOut(clamp((t - a) / (b - a), 0, 1)) : 1,
      back: (a, b) => p ? easeBack(clamp((t - a) / (b - a), 0, 1)) : 1,
      kb: () => p ? 1 + .09 * clamp(t / d, 0, 1) : 1,
      pulse: () => p ? .5 + .5 * Math.sin(t * 6) : 0
    };
  }

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
  function fotoKB(g, img, x, y, w, h, A) {   // foto con un zoom lento (Ken Burns) dentro de su recuadro
    const k = A.kb(); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.translate(x + w / 2, y + h / 2); g.scale(k, k); g.translate(-(x + w / 2), -(y + h / 2)); cover(g, img, x, y, w, h); g.restore();
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
  }
  function titulo(g, c, x, y, maxW, size) {
    g.save(); g.fillStyle = '#fff'; g.textBaseline = 'alphabetic';
    g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = size * .18; g.shadowOffsetY = size * .04;
    const t = (c.titulo || 'Mi viaje').toUpperCase(); fit(g, t, 800, size, maxW); g.fillText(t, x, y); g.restore();
  }
  function datosChip(c) {
    if (c.chip) return c.chip;
    const p = [];
    if (c.km >= 1) p.push(`${Math.round(c.km)} KM`);
    if (c.dias >= 1) p.push(c.dias === 1 ? '1 DÍA' : `${c.dias} DÍAS`);
    return p.join(' · ');
  }
  // título + chip que entran deslizando desde la izquierda
  function cabecera(g, c, A, x, yT, yC, u, size) {
    const e = A.k(0, .6); g.save(); g.globalAlpha *= e; g.translate(-70 * u * (1 - e), 0);
    titulo(g, c, x, yT, c.W - x * 2, size); const dc = datosChip(c); if (dc) chip(g, dc, x + 4 * u, yC, 44 * u); g.restore();
  }
  function firma(g, c, x, y, size, align, A) {
    g.save(); if (A) g.globalAlpha *= A.k(.5, 1.1);
    g.textBaseline = 'alphabetic'; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = size * .25;
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
  function pinShape(g, x, y, s) {
    g.save(); g.fillStyle = OR; g.strokeStyle = '#fff'; g.lineWidth = s * .22; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(x, y);
    g.bezierCurveTo(x - s * .95, y - s * .95, x - s * .85, y - s * 2.15, x, y - s * 2.15);
    g.bezierCurveTo(x + s * .85, y - s * 2.15, x + s * .95, y - s * .95, x, y);
    g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y - s * 1.4, s * .36, 0, 7); g.fill(); g.restore();
  }
  /* ruta sobre el mapa. Imagen fija: toda entera. Vídeo: la ruta completa tenue y, encima, el tramo hecho hasta
     esta escena (c.avance0 → c.avance, de 0 a 1) que se va dibujando; la cabeza lleva un punto que late. */
  function ruta(g, m, ox, oy, u, lw, A, c) {
    const P = m.pts; if (!P || P.length < 2) return; const n = P.length - 1;
    const a1 = c.avance == null ? 1 : c.avance, a0 = c.avance0 == null ? a1 : c.avance0;
    const cur = (a1 >= 1 && a0 >= 1) ? 1 : a0 + (a1 - a0) * A.k(.05, .8);
    const f = clamp(cur, 0, 1) * n, i = Math.min(n, Math.floor(f)), fr = f - i;
    const head = i >= n ? P[n] : [P[i][0] + (P[i + 1][0] - P[i][0]) * fr, P[i][1] + (P[i + 1][1] - P[i][1]) * fr];
    g.save(); g.translate(ox, oy); g.lineCap = g.lineJoin = 'round';
    const trazo = hasta => { g.beginPath(); for (let k = 0; k <= hasta; k++) k ? g.lineTo(P[k][0], P[k][1]) : g.moveTo(P[k][0], P[k][1]); if (hasta < n) g.lineTo(head[0], head[1]); g.stroke(); };
    if (a1 < 1) { g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = (lw || 11) * u * .45; g.setLineDash([10 * u, 12 * u]); trazo(n); g.setLineDash([]); }
    g.strokeStyle = '#fff'; g.lineWidth = (lw || 11) * u; trazo(i);
    g.strokeStyle = OR; g.lineWidth = (lw || 11) * u * .58; trazo(i);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(head[0], head[1], (14 + A.pulse() * 5) * u, 0, 7); g.fill();
    g.fillStyle = OR; g.beginPath(); g.arc(head[0], head[1], 8 * u, 0, 7); g.fill();
    pinShape(g, P[0][0], P[0][1], 15 * u); g.restore();
  }
  function mapa(g, m, x, y, u, lw, A, c) { g.drawImage(m.canvas, x, y); ruta(g, m, x, y, u, lw, A, c); }

  function icono(g, nom, cx, cy, s, col) {
    g.save(); g.translate(cx - s / 2, cy - s / 2); g.scale(s / 24, s / 24);
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 2; g.lineCap = g.lineJoin = 'round'; g.beginPath();
    if (nom === 'pin') { g.moveTo(12, 22); g.bezierCurveTo(5, 15, 4, 11, 4, 9.5); g.arc(12, 9.5, 8, Math.PI, 0); g.bezierCurveTo(20, 11, 19, 15, 12, 22); g.stroke(); g.beginPath(); g.arc(12, 9.5, 2.8, 0, 7); g.stroke(); }
    else if (nom === 'road') { g.moveTo(8, 22); g.bezierCurveTo(8, 16, 17, 16, 15, 11); g.bezierCurveTo(13, 6, 8, 8, 10, 2); g.stroke(); g.beginPath(); g.moveTo(16, 22); g.bezierCurveTo(16, 18, 21, 15, 19, 11); g.stroke(); }
    else if (nom === 'clock') { g.arc(12, 12, 9.5, 0, 7); g.stroke(); g.beginPath(); g.moveTo(12, 6.5); g.lineTo(12, 12); g.lineTo(16, 14.5); g.stroke(); }
    else { g.rect(2.5, 6.5, 19, 14); g.stroke(); g.beginPath(); g.moveTo(8, 6.5); g.lineTo(9.5, 3.5); g.lineTo(14.5, 3.5); g.lineTo(16, 6.5); g.stroke(); g.beginPath(); g.arc(12, 13.5, 4, 0, 7); g.stroke(); }
    g.restore();
  }
  function listaDatos(c, up) {   // up: 0→1, los números suben contando
    const d = [{ ic: 'pin', v: (c.lugar || c.titulo || 'Viaje').toUpperCase(), l: 'DESTINO' }];
    if (c.km >= 1) d.push({ ic: 'road', v: `${Math.round(c.km * up)} KM`, l: 'DE RUTA' });
    if (c.dias >= 1) d.push({ ic: 'clock', v: c.diaTxt || (c.dias === 1 ? '1 DÍA' : `${c.dias} DÍAS`), l: c.diaTxt ? 'DEL VIAJE' : 'DE VIAJE' });
    if (c.fotosN >= 1) d.push({ ic: 'cam', v: String(Math.round(c.fotosN * up)), l: c.fotosN === 1 ? 'FOTO' : 'FOTOS' });
    return d;
  }
  function barraDatos(g, c, x, y, w, h, u, up) {
    g.fillStyle = INK; g.fillRect(x, y, w, h); g.fillStyle = OR; g.fillRect(x, y, w, 5 * u);
    const d = listaDatos(c, up), cw = w / d.length;
    d.forEach((it, i) => {
      const cx = x + cw * (i + .5);
      icono(g, it.ic, cx, y + h * .27, 46 * u, OR);
      g.textAlign = 'center'; g.fillStyle = CREAM; fit(g, it.v, 800, 46 * u, cw - 24 * u); g.fillText(it.v, cx, y + h * .66);
      g.fillStyle = '#8E9194'; g.font = `700 ${22 * u}px ${FC}`; g.fillText(it.l, cx, y + h * .86); g.textAlign = 'left';
      if (i) { g.fillStyle = '#2B2E30'; g.fillRect(x + cw * i, y + h * .15, 2 * u, h * .7); }
    });
  }
  function panelDatos(g, c, x, y, w, h, u, up) {
    g.fillStyle = INK; g.fillRect(x, y, w, h);
    const d = listaDatos(c, up), rh = h / d.length;
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

  /* ── las 6 plantillas: needs(W,H) = los mapas que piden (clave, tamaño, margen) · draw(...) los pinta ── */
  const T = {
    circulo: {
      needs: (W, H) => [{ k: 'c', w: Math.round(W * .54), h: Math.round(W * .54), pad: .2 }],
      draw(g, c, W, H, u, A, M) {
        fotoKB(g, c.fotos[0], 0, 0, W, H, A); shade(g, 0, 0, W, H * .42, true, .65); shade(g, 0, H * .62, W, H * .38, false, .5);
        cabecera(g, c, A, 56 * u, 150 * u, 186 * u, u, 128 * u);
        const r = W * .27, cx = W - r * .9, cy = H - r * 1.0, m = M.c, pop = A.back(.25, .95);
        g.save(); g.globalAlpha *= A.k(.9, 1.3); flecha(g, cx - r * .55, cy - r * 1.05, cx - r * 1.5, cy - r * 1.55, u); g.restore();
        g.save(); g.translate(cx, cy); g.scale(Math.max(pop, .001), Math.max(pop, .001)); g.translate(-cx, -cy);
        g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30 * u; g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, r + 10 * u, 0, 7); g.fill(); g.restore();
        g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip(); mapa(g, m, cx - r, cy - r, u, 12, A, c); g.restore(); g.restore();
        firma(g, c, 56 * u, H - 44 * u, 40 * u, 'left', A);
      }
    },
    tarjeta: {
      needs: (W, H) => [{ k: 'c', w: Math.round(W * .5), h: Math.round(W * .56), pad: .16 }],
      draw(g, c, W, H, u, A, M) {
        fotoKB(g, c.fotos[0], 0, 0, W, H, A); shade(g, 0, 0, W, H * .4, true, .62); shade(g, 0, H * .6, W, H * .4, false, .5);
        cabecera(g, c, A, 56 * u, 150 * u, 186 * u, u, 128 * u);
        const w = W * .5, h = W * .56, b = 14 * u, m = M.c, e = A.k(.3, 1.1);
        g.save(); g.translate(W - w / 2 - 50 * u, H - h / 2 - 150 * u + (1 - e) * H * .35); g.rotate(-.1 - (1 - e) * .25); g.globalAlpha *= clamp(e * 1.6, 0, 1);
        g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30 * u; g.shadowOffsetY = 12 * u; g.fillStyle = '#fff'; rrect(g, -w / 2 - b, -h / 2 - b, w + b * 2, h + b * 2, 22 * u); g.fill(); g.shadowColor = 'transparent';
        g.beginPath(); rrect(g, -w / 2, -h / 2, w, h, 12 * u); g.clip(); mapa(g, m, -w / 2, -h / 2, u, 10, A, c); g.restore();
        firma(g, c, 56 * u, H - 44 * u, 40 * u, 'left', A);
      }
    },
    polaroids: {
      needs: (W, H) => [{ k: 'c', w: W, h: H, pad: .26 }],
      draw(g, c, W, H, u, A, M) {
        mapa(g, M.c, 0, 0, u, 12, A, c);
        shade(g, 0, 0, W, H * .26, true, .72); shade(g, 0, H * .84, W, H * .16, false, .55);
        cabecera(g, c, A, 56 * u, 140 * u, 176 * u, u, 124 * u);
        const pw = W * .46, pos = [[.30, .40, -.13], [.70, .52, .09], [.37, .73, -.04]];
        c.fotos.slice(0, 3).forEach((im, i) => {
          const e = A.back(.35 + i * .4, 1.0 + i * .4), a = clamp((A.on ? (A.t - (.35 + i * .4)) / .25 : 1), 0, 1);
          g.save(); g.globalAlpha *= a; polaroid(g, im, W * pos[i][0], H * pos[i][1] - (1 - e) * H * .3, pw, pos[i][2] * (1 + (1 - e) * 2.5), c, u); g.restore();
        });
        firma(g, c, W / 2, H - 38 * u, 40 * u, 'center', A);
      }
    },
    datos: {
      needs: (W, H) => [{ k: 'c', w: W, h: Math.round(H * .2), pad: .2 }],
      draw(g, c, W, H, u, A, M) {
        const h1 = Math.round(H * .56), h2 = Math.round(H * .2), h3 = H - h1 - h2;
        fotoKB(g, c.fotos[0], 0, 0, W, h1, A); shade(g, 0, 0, W, h1 * .45, true, .62);
        cabecera(g, c, A, 56 * u, 150 * u, 186 * u, u, 124 * u);
        g.save(); g.beginPath(); g.rect(0, h1, W * A.k(.2, 1), h2); g.clip(); mapa(g, M.c, 0, h1, u, 10, A, c); g.restore();
        g.save(); g.translate(0, (1 - A.k(.1, .8)) * h3); barraDatos(g, c, 0, h1 + h2, W, h3, u, A.k(.5, 1.5)); g.restore();
        firma(g, c, W - 44 * u, 64 * u, 34 * u, 'right', A);
      }
    },
    panel: {
      needs: (W, H) => [{ k: 'c', w: Math.round(W * .54), h: H - Math.round(H * .5), pad: .2 }],
      draw(g, c, W, H, u, A, M) {
        const h1 = Math.round(H * .5), h2 = H - h1, mw = Math.round(W * .54);
        fotoKB(g, c.fotos[0], 0, 0, W, h1, A); shade(g, 0, h1 * .45, W, h1 * .55, false, .72); shade(g, 0, 0, W, 170 * u, true, .5);
        firma(g, c, 56 * u, 74 * u, 36 * u, 'left', A);
        cabecera(g, c, A, 56 * u, h1 - 112 * u, h1 - 94 * u, u, 124 * u);
        g.save(); g.translate(-(1 - A.k(.15, .8)) * mw, 0); mapa(g, M.c, 0, h1, u, 10, A, c); g.restore();
        g.save(); g.translate((1 - A.k(.15, .8)) * (W - mw), 0); panelDatos(g, c, mw, h1, W - mw, h2, u, A.k(.5, 1.5)); g.restore();
      }
    },
    apilado: {
      needs: (W, H) => [{ k: 'c', w: W, h: Math.round(H * .42), pad: .16 }],
      draw(g, c, W, H, u, A, M) {
        const h1 = Math.round(H * .42), h2 = H - h1;
        g.save(); g.translate(0, -(1 - A.k(0, .6)) * h1 * .4); mapa(g, M.c, 0, 0, u, 11, A, c); g.restore();
        const e = A.k(.1, .8); g.save(); g.beginPath(); g.rect(0, h1 + h2 * (1 - e), W, h2 * e); g.clip(); fotoKB(g, c.fotos[0], 0, h1, W, h2, A); g.restore();
        g.fillStyle = OR; g.fillRect(0, h1 - 3 * u, W, 6 * u);
        shade(g, 0, 0, W, h1 * .42, true, .6);
        const e2 = A.k(0, .6); g.save(); g.globalAlpha *= e2; g.translate(-70 * u * (1 - e2), 0); titulo(g, c, 56 * u, 130 * u, W - 112 * u, 118 * u);
        const dc = datosChip(c); if (dc) chip(g, dc, 60 * u, h1 + 28 * u, 46 * u); g.restore();
        shade(g, 0, H - 200 * u, W, 200 * u, false, .55); firma(g, c, 56 * u, H - 44 * u, 40 * u, 'left', A);
      }
    }
  };

  /* tarjeta final del vídeo: km del viaje en grande sobre el mapa con la ruta entera */
  const CIERRE = {
    needs: (W, H) => [{ k: 'c', w: W, h: Math.round(H * .5), pad: .16 }],
    draw(g, c, W, H, u, A, M) {
      g.fillStyle = INK; g.fillRect(0, 0, W, H);
      const h1 = Math.round(H * .5); g.save(); g.globalAlpha *= A.k(0, .5); mapa(g, M.c, 0, 0, u, 12, A, Object.assign({}, c, { avance: 1, avance0: 0 })); g.restore();
      shade(g, 0, h1 * .55, W, h1 * .45, false, .9);
      const e = A.k(.3, 1.2);
      g.save(); g.globalAlpha *= e; g.translate(0, (1 - e) * 40 * u);
      g.fillStyle = OR; g.font = `800 ${240 * u}px ${FC}`; g.textBaseline = 'alphabetic';
      g.fillText(String(Math.round(c.km * A.k(.3, 1.6))), 56 * u, h1 + 230 * u);
      g.fillStyle = '#C4C7C9'; g.font = `700 ${46 * u}px ${FC}`; g.fillText('KM DE VIAJE', 62 * u, h1 + 290 * u);
      titulo(g, c, 56 * u, h1 + 420 * u, W - 112 * u, 100 * u); g.restore();
      firma(g, c, 56 * u, H - 70 * u, 52 * u, 'left', A);
    }
  };

  async function pintarEscena(g, def, c, W, H, A, M) {
    const u = W / 1080; c.W = W; def.draw(g, c, W, H, u, A, M);
  }
  async function cargarFuentes() {
    if (document.fonts && document.fonts.load) { try { await Promise.all([document.fonts.load('800 40px "Barlow Condensed"'), document.fonts.load('700 20px "Barlow Condensed"')]); } catch (_) {} }
  }
  async function resolverMapas(def, c, W, H, cache) {
    const M = {};
    for (const n of def.needs(W, H)) {
      const key = `${n.w}x${n.h}x${n.pad}`;
      M[n.k] = (cache && cache[key]) || (cache ? (cache[key] = await c.snap(n.w, n.h, n.pad)) : await c.snap(n.w, n.h, n.pad));
    }
    return M;
  }

  /* IMAGEN FIJA */
  async function render(id, c) {
    const def = T[id]; if (!def) throw new Error('plantilla desconocida: ' + id);
    const W = 1080, H = c.fmt === '9:16' ? 1920 : 1350;
    await cargarFuentes();
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); g.fillStyle = INK; g.fillRect(0, 0, W, H);
    const M = await resolverMapas(def, c, W, H);
    await pintarEscena(g, def, c, W, H, mkA(null), M);
    atrib(g, c, W, H, W / 1080);
    return cv;
  }

  /* VÍDEO con plantillas: una escena por foto (o por 3 con Polaroids), cada una con su plantilla; fundido entre escenas.
     El mapa de cada plantilla se pide una sola vez (cache) y es el mismo en todas las escenas de esa plantilla. */
  async function video(o) {
    const W = o.W, H = o.H, fade = .35, cache = {}, esc = [];
    await cargarFuentes();
    const ids = o.tpl && T[o.tpl] ? [o.tpl] : CICLO;
    let k = 0, av0 = 0, t0 = 0;
    const total = o.total || 1;
    (o.paradas || []).forEach(p => {
      const fs = (p.fotos || []).slice(); let i = 0;
      while (i < fs.length) {
        const id = ids[k % ids.length], meta = PLANTILLAS.find(x => x.id === id), n = meta.fotos;
        const grupo = fs.slice(i, i + n); i += n; k++;
        const av = clamp((p.km || 0) / total, 0, 1), d = n > 1 ? 4.6 : 3.4;
        esc.push({ id, def: T[id], t0, d, c: {
          fotos: grupo, titulo: o.titulo, lugar: p.nombre, km: p.km || 0, dias: p.dia || 0, diaTxt: p.dia ? `DÍA ${p.dia}` : '', fotosN: o.fotosN,
          chip: `${p.dia ? 'DÍA ' + p.dia + ' · ' : ''}${(p.nombre || '').toUpperCase()}`, firma: o.firma, atrib: o.atrib, avance0: av0, avance: av, snap: o.snap } });
        t0 += d; av0 = av;
      }
    });
    if (!esc.length) throw new Error('sin fotos para el vídeo');
    const fin = { id: 'cierre', def: CIERRE, t0, d: 4.2, c: { titulo: o.titulo, km: o.total || 0, firma: o.firma, atrib: o.atrib, snap: o.snap } };
    esc.push(fin);
    const tot = t0 + fin.d;
    for (let i = 0; i < esc.length; i++) { esc[i].M = await resolverMapas(esc[i].def, esc[i].c, W, H, cache); if (o.onProgreso) o.onProgreso(i + 1, esc.length); }
    const u = W / 1080;
    function dibujar(g, s, t) { const A = mkA({ t, d: s.d }); s.c.W = W; s.def.draw(g, s.c, W, H, u, A, s.M); }
    function frame(g, t) {
      t = clamp(t, 0, tot - .001);
      let i = esc.findIndex(s => t < s.t0 + s.d); if (i < 0) i = esc.length - 1;
      const s = esc[i], lt = t - s.t0;
      g.fillStyle = INK; g.fillRect(0, 0, W, H);
      if (i > 0 && lt < fade) {
        const prev = esc[i - 1]; dibujar(g, prev, prev.d);
        g.save(); g.globalAlpha = lt / fade; dibujar(g, s, lt); g.restore();
      } else dibujar(g, s, lt);
      atrib(g, s.c, W, H, u);
    }
    return { total: tot, frame, escenas: esc.length };
  }

  /* miniaturas esquemáticas (SVG) de cada plantilla, para elegirla de un vistazo */
  const MINI = (() => {
    const foto = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#78b1de"/><path d="M${x} ${y + h * .78}L${x + w * .3} ${y + h * .45}L${x + w * .55} ${y + h * .7}L${x + w * .8} ${y + h * .4}L${x + w} ${y + h * .72}V${y + h}H${x}Z" fill="#4d7357"/>`;
    const mapa = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#b9e39a"/><path d="M${x} ${y}H${x + w * .45}Q${x + w * .2} ${y + h * .5} ${x} ${y + h * .65}Z" fill="#5fb8ea"/>` +
      `<path d="M${x + w * .3} ${y + h * .12}C${x + w * .9} ${y + h * .3} ${x + w * .1} ${y + h * .6} ${x + w * .65} ${y + h * .88}" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>` +
      `<path d="M${x + w * .3} ${y + h * .12}C${x + w * .9} ${y + h * .3} ${x + w * .1} ${y + h * .6} ${x + w * .65} ${y + h * .88}" fill="none" stroke="#F4630B" stroke-width="2" stroke-linecap="round"/>`;
    const pol = (cx, cy, r) => `<g transform="translate(${cx} ${cy}) rotate(${r})"><rect x="-17" y="-21" width="34" height="42" fill="#fff"/><g transform="translate(-14.5 -18.5) scale(.24)">${foto(0, 0, 120, 120)}</g></g>`;
    const filas = (x, y, w, h) => [0, 1, 2, 3].map(i => `<circle cx="${x + 9}" cy="${y + h * (i + .5) / 4}" r="3" fill="#F4630B"/><rect x="${x + 17}" y="${y + h * (i + .5) / 4 - 1.6}" width="${w - 26}" height="3.2" fill="#ECEBE8" opacity=".85"/>`).join('');
    const sv = c => `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="120" height="150" fill="#0D0F10"/>${c}</svg>`;
    return {
      circulo: sv(foto(0, 0, 120, 150) + `<circle cx="84" cy="108" r="36" fill="#fff"/><clipPath id="mc"><circle cx="84" cy="108" r="32"/></clipPath><g clip-path="url(#mc)">${mapa(52, 76, 64, 64)}</g>`),
      tarjeta: sv(foto(0, 0, 120, 150) + `<g transform="rotate(-6 84 104)"><rect x="56" y="76" width="56" height="62" fill="#fff"/>${mapa(60, 80, 48, 54)}</g>`),
      polaroids: sv(mapa(0, 0, 120, 150) + pol(36, 52, -8) + pol(84, 66, 6) + pol(46, 106, -3)),
      datos: sv(foto(0, 0, 120, 84) + mapa(0, 84, 120, 30) + [0, 1, 2, 3].map(i => `<circle cx="${15 + i * 30}" cy="126" r="4" fill="#F4630B"/><rect x="${6 + i * 30}" y="136" width="18" height="4" fill="#ECEBE8" opacity=".85"/>`).join('')),
      panel: sv(foto(0, 0, 120, 75) + mapa(0, 75, 65, 75) + filas(65, 75, 55, 75)),
      apilado: sv(mapa(0, 0, 120, 63) + `<rect y="62" width="120" height="2.5" fill="#F4630B"/>` + foto(0, 64, 120, 86)),
      mezcla: sv(foto(4, 4, 54, 68) + mapa(62, 4, 54, 68) + foto(4, 78, 34, 68) + mapa(42, 78, 34, 68) + foto(80, 78, 36, 68))
    };
  })();

  window.POSTS = { PLANTILLAS, CICLO, MINI, render, video };
})();
