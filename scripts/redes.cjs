// Nuestras redes: un solo sitio para las direcciones y los iconos del pie (Paco, 7 nov 2026).
// Los usan build-blog-viajes.js y build-destinos.js; comprobar-nada-atras.cjs revisa que estén en todos los pies.
const YOUTUBE = 'https://www.youtube.com/@Borradodelmapa';
const TIKTOK = 'https://www.tiktok.com/@borradodelmapa';
const INSTAGRAM = 'https://www.instagram.com/borradodelmapa/';

// sub_confirmation=1: YouTube abre directamente la confirmación de suscripción
const SUSCRIBIRSE = YOUTUBE + '?sub_confirmation=1';

const svg = (cuerpo, extra = 'fill="currentColor"') => `<svg width="18" height="18" viewBox="0 0 24 24" ${extra} aria-hidden="true">${cuerpo}</svg>`;
const ICONO_YOUTUBE = svg('<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>');
const ICONO_TIKTOK = svg('<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>');
const ICONO_INSTAGRAM = svg('<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>', 'fill="none" stroke="currentColor" stroke-width="2"');

const COLOR = 'rgba(244,239,230,.6)'; // discreto, pero legible sobre el fondo oscuro de los pies
const iconos = [[YOUTUBE, 'YouTube', ICONO_YOUTUBE], [TIKTOK, 'TikTok', ICONO_TIKTOK], [INSTAGRAM, 'Instagram', ICONO_INSTAGRAM]]
  .map(([u, n, i]) => `<a href="${u}" target="_blank" rel="noopener" aria-label="Borrado del Mapa en ${n}" title="${n}" style="color:${COLOR};line-height:0">${i}</a>`).join('');

// Pie de blog, legal y funciones (.pg-footer): su propia fila, debajo de los enlaces
const REDES_PIE_PAGINAS = `<div class="pie-redes" style="flex-basis:100%;display:flex;gap:18px;margin-top:6px">${iconos}</div>`;
// Pie de las páginas de destino (.destino-footer): misma fila centrada que sus enlaces
const REDES_PIE_DESTINOS = `<div class="destino-footer-links pie-redes">${iconos}</div>`;

// Botón «Compartir info» (Paco, 7 nov 2026): una sola pieza para toda la web. En el móvil abre el menú del teléfono; en el ordenador copia el enlace.
const BOTON_COMPARTIR = `<button class="bd-compartir" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg><span>Compartir info</span></button>`;
const COMPARTIR_JS = `<script>document.addEventListener("click",function(e){var b=e.target.closest(".bd-compartir");if(!b)return;var d={title:document.querySelector("h1").textContent,url:location.origin+location.pathname};
if(navigator.share&&matchMedia("(pointer:coarse)").matches){navigator.share(d).catch(function(){});return;}
var t=b.querySelector("span"),o=t.dataset.o||t.textContent;t.dataset.o=o;if(navigator.clipboard)navigator.clipboard.writeText(d.url).then(function(){t.textContent="Enlace copiado";setTimeout(function(){t.textContent=o;},2000);});});</script>
`;

module.exports = { BOTON_COMPARTIR, COMPARTIR_JS, YOUTUBE, TIKTOK, INSTAGRAM, SUSCRIBIRSE, ICONO_YOUTUBE, REDES_PIE_PAGINAS, REDES_PIE_DESTINOS };
