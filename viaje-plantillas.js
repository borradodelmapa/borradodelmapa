/* Plantillas del vídeo del viaje (viaje-fotos.html) — 29 sept 2026.
   AÑADIR UNA PLANTILLA = copiar una ficha de abajo, cambiar id/nombre/desc y ajustar valores. El motor no se toca.

   secuencia   'reel'      el vehículo recorre el mapa real; tras cada tramo, fotos en cortes rápidos
               'ruta'      el mapa vuela de parada en parada; fotos con fundido y collage
               'capitulos' sin mapa: un capítulo por día y fotos a pantalla completa
   sinMapa     secuencia si las fotos no traen ubicación ni hay guía elegida (hoy siempre 'capitulos')
   vehiculo    true = enseña el selector de vehículo (solo tiene sentido con 'reel')
   ritmo.foto  segundos por foto · ritmo.corte 'seco' | 'fundido' · ritmo.maxFotos · ritmo.tramo (× duración de cada tramo)
   look.marco  'blur' (foto entera sobre su propio fondo difuminado) · 'negro' · 'polaroid' (marco blanco sobre papel)
               · 'blanco' (foto con margen sobre fondo claro)
   look.rotulo 'chip' (DÍA N + sitio grande) · 'serif' (subtítulo de cine) · 'grande' (sitio enorme) · 'polaroid'
               (escrito en el marco) · 'minimal' (línea fina bajo la foto) · 'ninguno'
   look.titulo 'display' (Barlow Condensed) | 'serif' (Newsreader cursiva)
   look.claro  true si el fondo es claro · look.grano / look.vineta de 0 a 1 · look.bandas franjas de cine en horizontal
   Colores en hex (#RRGGBB).
*/
window.PLANTILLAS = [
  {
    id: 'reel', nombre: 'Reel', desc: '45 s: tu vehículo recorre el mapa real y las fotos van al ritmo',
    secuencia: 'reel', sinMapa: 'capitulos', vehiculo: true,
    ritmo: { foto: 1.15, corte: 'seco', maxFotos: 20, tramo: 1 },
    look: { fondo: '#0D0F10', texto: '#ECEBE8', suave: '#C4C7C9', acento: '#F4630B', sobreAcento: '#0D0F10',
            marco: 'blur', rotulo: 'chip', titulo: 'display', claro: false, grano: 0, vineta: 0, bandas: false }
  },
  {
    id: 'aventura', nombre: 'Aventura', desc: 'Cortes muy rápidos y rótulos enormes: moto, montaña, carretera',
    secuencia: 'reel', sinMapa: 'capitulos', vehiculo: true,
    ritmo: { foto: 0.72, corte: 'seco', maxFotos: 30, tramo: 0.75 },
    look: { fondo: '#0A0B0C', texto: '#FFFFFF', suave: '#D0D3D5', acento: '#F4630B', sobreAcento: '#0A0B0C',
            marco: 'blur', rotulo: 'grande', titulo: 'display', claro: false, grano: 0.05, vineta: 0.35, bandas: false }
  },
  {
    id: 'ruta', nombre: 'Ruta', desc: 'El mapa vuela de parada en parada y la línea del viaje se va dibujando',
    secuencia: 'ruta', sinMapa: 'capitulos', vehiculo: false,
    ritmo: { foto: 2.6, corte: 'fundido', maxFotos: 24 },
    look: { fondo: '#0D0F10', texto: '#ECEBE8', suave: '#C4C7C9', acento: '#F4630B', sobreAcento: '#0D0F10',
            marco: 'blur', rotulo: 'chip', titulo: 'display', claro: false, grano: 0, vineta: 0, bandas: false }
  },
  {
    id: 'pelicula', nombre: 'Película', desc: 'Capítulos por día, fotos a pantalla completa, grano de cine',
    secuencia: 'capitulos', sinMapa: 'capitulos', vehiculo: false,
    ritmo: { foto: 3.3, corte: 'fundido', maxFotos: 20 },
    look: { fondo: '#050403', texto: '#F3ECDF', suave: '#D9CFBD', acento: '#F4630B', sobreAcento: '#0D0F10',
            marco: 'negro', rotulo: 'serif', titulo: 'display', claro: false, grano: 0.07, vineta: 0.45, bandas: true }
  },
  {
    id: 'postal', nombre: 'Postal', desc: 'Fotos en marco blanco sobre papel, como un álbum de toda la vida',
    secuencia: 'capitulos', sinMapa: 'capitulos', vehiculo: false,
    ritmo: { foto: 2.6, corte: 'fundido', maxFotos: 20 },
    look: { fondo: '#EFE7D8', texto: '#2A2118', suave: '#6F6253', acento: '#C2500A', sobreAcento: '#FFFFFF',
            marco: 'polaroid', rotulo: 'polaroid', titulo: 'serif', claro: true, grano: 0.04, vineta: 0.18, bandas: false }
  },
  {
    id: 'minimal', nombre: 'Minimal', desc: 'Fondo blanco, mucho aire y tipografía grande',
    secuencia: 'capitulos', sinMapa: 'capitulos', vehiculo: false,
    ritmo: { foto: 3, corte: 'fundido', maxFotos: 18 },
    look: { fondo: '#F4F3F0', texto: '#111213', suave: '#6B6F72', acento: '#F4630B', sobreAcento: '#FFFFFF',
            marco: 'blanco', rotulo: 'minimal', titulo: 'display', claro: true, grano: 0, vineta: 0, bandas: false }
  }
];
