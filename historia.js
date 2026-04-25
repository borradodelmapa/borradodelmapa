// historia.js — Salma Historiadora MVP
// Lista → Detalle → Paradas con narración TTS

const historiaModule = (() => {

  // ─── Datos ────────────────────────────────────────────────────────────────

  const HISTORIAS = [
    {
      id: 'vietnam-1862-1975',
      title: 'Vietnam: Colonia a Nación',
      description: 'La historia de la resistencia vietnamita contra la colonización francesa y la guerra de Vietnam. Un viaje de 113 años de transformación.',
      thumbnail: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400',
      duration_minutes: 45,
      category: 'Asia',
      emoji: '🇻🇳',
      paradas: [
        {
          year: 1862,
          title: 'Invasión francesa — Conquista de Cochinchina',
          subtitle: 'El inicio de la colonización francesa en Vietnam',
          content: 'En 1862, Francia invade y conquista Cochinchina, el sur de Vietnam. Los franceses llegan con barcos de guerra y establecen su primer control sobre territorio vietnamita. Esta es la semilla que eventualmente llevaría a la Indochina Francesa. Vietnam estaba dividido en tres reinos: Tonkín al norte, Annam en el centro y Cochinchina al sur. Francia aprovecha las divisiones internas para hacerse con el control.',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
          key_facts: ['Batalla de Đà Nẵng (1858-1859) precede la conquista', 'Francia y España juntas contra Vietnam', 'Cochinchina cae en 1862']
        },
        {
          year: 1887,
          title: 'Unión Indochina — Hanoi, capital colonial',
          subtitle: 'Vietnam, Camboya y Laos bajo administración francesa unificada',
          content: 'Francia establece la Unión Indochina en 1887, unificando Vietnam, Camboya y Laos bajo una sola administración. Hanoi se convierte en la capital de la Indochina Francesa. Los franceses construyen infraestructura: ferrocarriles, carreteras, edificios gubernamentales. La ciudad vieja de Hanoi se mezcla con la nueva arquitectura francesa. Los vietnamitas se convierten en trabajadores de segunda clase en su propia tierra.',
          image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600',
          key_facts: ['Indochina Francesa: Vietnam, Camboya, Laos', 'Hanoi: mezcla de ciudad vieja y arquitectura francesa', 'Sistema administrativo colonial impuesto']
        },
        {
          year: 1911,
          title: 'Ho Chi Minh llega a Francia',
          subtitle: 'Un joven vietnamita busca justicia en París',
          content: 'Un joven llamado Nguyễn Sinh Cung, que el mundo conocerá como Ho Chi Minh, trabaja como cocinero en barcos franceses y llega a París en 1911. Es testigo de cómo Francia se presenta como defensora de la libertad mientras oprime a Vietnam. En la Conferencia de Paz de Versalles presenta una petición pidiendo independencia. Nadie lo escucha. Desilusionado, se acerca a las ideas comunistas.',
          image: 'https://images.unsplash.com/photo-1466873565700-f7e73fa20152?w=600',
          key_facts: ['Ho Chi Minh nace como Nguyễn Sinh Cung (1890)', 'Trabaja en barcos, es marinero y cocinero', 'Versalles 1919: petición ignorada = giro hacia el comunismo']
        },
        {
          year: 1954,
          title: 'Dien Bien Phu — Victoria vietnamita',
          subtitle: 'La batalla que acabó con la Indochina Francesa',
          content: 'En 1954, después de nueve años de guerra de independencia, los vietnamitas bajo Ho Chi Minh derrotan a Francia en la batalla de Dien Bien Phu. Francia pierde 2.293 soldados en cincuenta y cinco días de asedio. Es un golpe devastador para el imperio francés. La Conferencia de Ginebra divide Vietnam temporalmente en norte y sur. Se prometen elecciones reunificadoras que nunca llegan.',
          image: 'https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=600',
          key_facts: ['55 días de asedio', 'Francia se rinde: fin de la Indochina Francesa', 'Vietnam dividido: norte vs sur (Ginebra)', 'Promesa de elecciones que nunca ocurren']
        },
        {
          year: 1964,
          title: 'Incidente del Golfo de Tonkín',
          subtitle: 'El pretexto que escaló la guerra a nivel global',
          content: 'En agosto de 1964, dos incidentes en el Golfo de Tonkín, el segundo probablemente nunca ocurrió, son usados por EEUU como pretexto para escalar la guerra. El presidente Johnson ordena los bombardeos Rolling Thunder, tres años de ataques masivos sobre Vietnam del Norte. Las tropas americanas llegan en masa. La guerra se convierte en un conflicto de superpotencias: EEUU contra Vietnam del Norte apoyado por la Unión Soviética y China.',
          image: 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=600',
          key_facts: ['Incidentes del Golfo de Tonkín: agosto 1964', 'Segundo incidente: probablemente falso', 'EEUU bombardea Vietnam del Norte durante 3 años', 'Medio millón de soldados americanos en Vietnam en 1968']
        },
        {
          year: 1975,
          title: 'Caída de Saigón — Reunificación',
          subtitle: 'El final de la guerra de Vietnam',
          content: 'El 30 de abril de 1975, tanques del norte vietnamita entran en Saigón. Los últimos helicópteros americanos evacúan diplomáticos desde la embajada en escenas de caos absoluto. Vietnam se reúne bajo el gobierno comunista. La guerra termina después de veinte años. 58.000 americanos mueren. Entre dos y tres millones de vietnamitas pierden la vida. Las cicatrices todavía duelen hoy.',
          image: 'https://images.unsplash.com/photo-1591254670039-e72ea2c01df4?w=600',
          key_facts: ['30 de abril de 1975: Saigón cae', 'Evacuación caótica desde la embajada americana', '58.000 muertos americanos', '2-3 millones de vietnamitas muertos', 'Vietnam reunificado bajo gobierno comunista']
        }
      ]
    },
    {
      id: 'hanoi-1000-years',
      title: 'Hanoi: 1000 Años de Historia',
      description: 'Desde su fundación en el siglo XI hasta convertirse en capital de la Indochina Francesa y luego de un Vietnam independiente.',
      thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
      duration_minutes: 30,
      category: 'Asia',
      emoji: '🏯',
      paradas: [
        {
          year: 1010,
          title: 'Fundación de Hanoi — Thang Long',
          subtitle: 'El emperador Ly Thai To funda la ciudad',
          content: 'En 1010, el emperador Ly Thai To traslada la capital del reino de Dai Viet a la orilla del río Rojo y funda Thang Long, que significa Dragón Ascendente. La ciudad se construye con una fortaleza central. El nombre captura la aspiración de todo un pueblo: como un dragón que sube hacia el cielo.',
          image: '',
          key_facts: ['Fundada en 1010 como Thang Long', 'Capital del reino de Dai Viet', 'Orilla del río Rojo']
        },
        {
          year: 1887,
          title: 'Hanoi Colonial — Ciudad francesa',
          subtitle: 'Capital de la Indochina Francesa',
          content: 'Francia rediseña Hanoi. Construye avenidas arboladas, introduce la Catedral de San José y establece barrios de arquitectura neoclásica. La ciudad vieja con sus 36 calles de oficios coexiste con los nuevos barrios franceses. Los vietnamitas son tratados como ciudadanos de segunda clase en su propia capital.',
          image: '',
          key_facts: ['Capital de Indochina Francesa', 'Arquitectura francesa sobre la ciudad vieja', '36 calles de oficios: el corazón vietnamita']
        },
        {
          year: 1954,
          title: 'Hanoi Independiente',
          subtitle: 'Recupera su libertad tras Dien Bien Phu',
          content: 'Después de Dien Bien Phu y los Acuerdos de Ginebra, Hanoi se convierte en capital de Vietnam del Norte. Los franceses abandonan la ciudad que construyeron durante setenta años. Ho Chi Minh entra triunfante. Una nueva era comienza, aunque la guerra no ha terminado.',
          image: '',
          key_facts: ['Independencia de Francia: 1954', 'Ho Chi Minh entra en Hanoi', 'Capital de Vietnam del Norte']
        },
        {
          year: 1975,
          title: 'Capital de Vietnam Reunificado',
          subtitle: 'Fin de la división, inicio de la reconstrucción',
          content: 'Con la caída de Saigón el 30 de abril de 1975, Hanoi se convierte en capital de todo Vietnam reunificado. Una ciudad devastada por años de bombardeos americanos empieza a reconstruirse. La economía es un desastre, pero la independencia, después de un siglo de lucha, está ganada.',
          image: '',
          key_facts: ['1975: Capital de Vietnam reunificado', 'Reconstrucción tras décadas de guerra', 'Un siglo de lucha por la independencia']
        }
      ]
    },
    {
      id: 'thailand-siam-1600-2000',
      title: 'Siam: El País que Nunca Fue Colonizado',
      description: 'La única nación del sudeste asiático que nunca fue colonizada. La historia de cómo Tailandia navegó entre imperios.',
      thumbnail: 'https://images.unsplash.com/photo-1540959375944-7049f642e9f1?w=400',
      duration_minutes: 35,
      category: 'Asia',
      emoji: '🇹🇭',
      paradas: [
        {
          year: 1782,
          title: 'Fundación de Bangkok — Dinastía Chakri',
          subtitle: 'Rama I funda la dinastía que perdura hoy',
          content: 'El General Chakri funda Bangkok y establece la dinastía Chakri, que sigue gobernando Tailandia en el siglo XXI. Bangkok se construye como fortaleza defensiva contra Birmania, con el río Chao Phraya como arteria vital. La ciudad crece en torno a un gran palacio real, templos de oro y canales que le valdrán el apodo de la Venecia de Oriente.',
          image: '',
          key_facts: ['Dinastía Chakri: 1782 hasta hoy', 'Bangkok fundada como fortaleza', 'Río Chao Phraya: arteria de la ciudad']
        },
        {
          year: 1868,
          title: 'Rey Mongkut — Modernización de Siam',
          subtitle: 'Rama IV se abre al mundo moderno',
          content: 'El Rey Mongkut, Rama IV, realiza reformas profundas para modernizar Siam y mantener su independencia frente a las colonias francesas en Indochina y las británicas en Birmania. Firma tratados comerciales con potencias occidentales y aprende inglés y latín. Es la historia que inspiraría El rey y yo.',
          image: '',
          key_facts: ['Modernización para preservar independencia', 'Tratados con potencias occidentales', 'El único rey del sudeste asiático que resistió la colonización']
        },
        {
          year: 1932,
          title: 'Revolución de 1932 — Fin de la Monarquía Absoluta',
          subtitle: 'Transición a monarquía constitucional',
          content: 'Una revolución incruenta en 1932 limita el poder absoluto del rey. Siam se convierte en monarquía constitucional. Es un hito democrático en Asia que ocurre sin una sola gota de sangre, algo extraordinario en la historia de las revoluciones.',
          image: '',
          key_facts: ['1932: monarquía constitucional', 'Revolución incruenta', 'Hito democrático en Asia']
        },
        {
          year: 1949,
          title: 'Siam se convierte en Tailandia',
          subtitle: 'Identidad nacional reforzada con un nuevo nombre',
          content: 'El país cambia oficialmente su nombre de Siam a Tailandia para enfatizar la identidad tailandesa. El nombre significa literalmente tierra de los libres. Una declaración de principios de un país que lleva siglos defendiendo exactamente eso.',
          image: '',
          key_facts: ['Nombre oficial: Tailandia desde 1949', 'Significa tierra de los libres', 'Único país del sudeste asiático jamás colonizado']
        }
      ]
    },
    {
      id: 'french-revolution-1789',
      title: 'Revolución Francesa: 1789-1799',
      description: 'De Versalles al Terror. Cómo una nación cambió la historia del mundo en una década.',
      thumbnail: 'https://images.unsplash.com/photo-1518938267842-7dbd1d24ba3b?w=400',
      duration_minutes: 50,
      category: 'Europa',
      emoji: '🇫🇷',
      paradas: [
        {
          year: 1789,
          title: 'Toma de la Bastilla',
          subtitle: 'El símbolo del inicio de la revolución',
          content: 'El 14 de julio de 1789, parisinos furiosos rodean la Bastilla, la prisión real que era símbolo del poder absoluto del rey. Después de horas de enfrentamientos, la Bastilla cae. Hoy es el Día de la Bastilla, el día de la independencia francesa. En ese momento algo cambia para siempre: el pueblo europeo descubre que puede enfrentarse a sus reyes y ganar.',
          image: '',
          key_facts: ['14 de julio de 1789', 'La Bastilla: símbolo del absolutismo', 'Fin de la monarquía absoluta en Francia']
        },
        {
          year: 1793,
          title: 'Luis XVI muere en la guillotina',
          subtitle: 'Un punto de no retorno',
          content: 'En enero de 1793, el rey Luis XVI es juzgado, condenado a muerte y ejecutado en la guillotina ante una multitud en la plaza de la Revolución. María Antonieta será ejecutada meses después. El Ancien Régime, el viejo orden de siglos, está muerto. Europa entera tiembla.',
          image: '',
          key_facts: ['Ejecución en guillotina: 21 enero 1793', 'Fin de la monarquía', 'Europa entera en estado de shock']
        },
        {
          year: 1794,
          title: 'El Terror — Robespierre en el poder',
          subtitle: 'La revolución devora a sus propios hijos',
          content: 'Robespierre y el Comité de Seguridad Pública ejecutan a miles: nobles, clérigos, pero también revolucionarios que se consideran traidores. Se estiman cuarenta mil muertes durante el Terror. La revolución se ha vuelto contra sí misma. Finalmente, Robespierre mismo es arrestado y ejecutado en julio de 1794.',
          image: '',
          key_facts: ['40.000 ejecuciones estimadas', 'Nobles, clérigos y revolucionarios', 'Robespierre ejecutado en julio de 1794']
        },
        {
          year: 1799,
          title: 'Golpe de Napoleón — Fin de la Revolución',
          subtitle: 'Un joven general toma el poder',
          content: 'Napoleón Bonaparte orquesta el Golpe del 18 Brumario y se convierte en Primer Cónsul de Francia. La Revolución Francesa como movimiento ha terminado. Pero sus ideas, libertad, igualdad, fraternidad, viajarán con los ejércitos de Napoleón por toda Europa y cambiarán el mundo para siempre.',
          image: '',
          key_facts: ['Golpe del 18 Brumario: 1799', 'Napoleón: Primer Cónsul', 'Las ideas de la Revolución se expanden por Europa']
        }
      ]
    }
  ];

  // ─── Estado ───────────────────────────────────────────────────────────────

  let _currentHistoria = null;
  let _currentParadaIdx = 0;
  let _ttsActive = false;

  // ─── TTS ──────────────────────────────────────────────────────────────────

  function _narrar(texto) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (_ttsActive) { _ttsActive = false; _updateTTSBtn(); return; }
    const utt = new SpeechSynthesisUtterance(texto);
    utt.lang = 'es-ES';
    utt.rate = 0.95;
    const voices = speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es') && v.localService);
    if (esVoice) utt.voice = esVoice;
    utt.onstart = () => { _ttsActive = true; _updateTTSBtn(); };
    utt.onend = utt.onerror = () => { _ttsActive = false; _updateTTSBtn(); };
    speechSynthesis.speak(utt);
  }

  function _updateTTSBtn() {
    const btn = document.getElementById('hist-tts-btn');
    if (!btn) return;
    btn.textContent = _ttsActive ? '⏹ Detener' : '🔊 Escuchar';
    btn.classList.toggle('hist-tts-active', _ttsActive);
  }

  // ─── Render lista ─────────────────────────────────────────────────────────

  function _renderLista() {
    const $c = document.getElementById('app-content');
    if (!$c) return;
    $c.innerHTML = `
      <div class="hist-container">
        <div class="hist-header">
          <h1 class="hist-title">Historia</h1>
          <p class="hist-subtitle">Viaja en el tiempo por los lugares que visitas</p>
        </div>
        <div class="hist-grid">
          ${HISTORIAS.map(h => `
            <div class="hist-card" data-id="${h.id}">
              <div class="hist-card-img" style="background-image:url('${h.thumbnail}')">
                <span class="hist-card-cat">${h.category}</span>
              </div>
              <div class="hist-card-body">
                <div class="hist-card-emoji">${h.emoji}</div>
                <h2 class="hist-card-title">${h.title}</h2>
                <p class="hist-card-desc">${h.description}</p>
                <div class="hist-card-meta">
                  <span>📍 ${h.paradas.length} paradas</span>
                  <span>⏱ ${h.duration_minutes} min</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;

    $c.querySelectorAll('.hist-card').forEach(card => {
      card.addEventListener('click', () => {
        const historia = HISTORIAS.find(h => h.id === card.dataset.id);
        if (historia) _renderDetalle(historia);
      });
    });
  }

  // ─── Render detalle ───────────────────────────────────────────────────────

  function _renderDetalle(historia) {
    _currentHistoria = historia;
    _currentParadaIdx = 0;
    const $c = document.getElementById('app-content');
    if (!$c) return;

    const timelineItems = historia.paradas.map((p, i) => `
      <button class="hist-tl-item ${i === 0 ? 'hist-tl-item--active' : ''}" data-idx="${i}">
        <span class="hist-tl-year">${p.year}</span>
        <span class="hist-tl-dot"></span>
      </button>`).join('');

    $c.innerHTML = `
      <div class="hist-container">
        <div class="hist-nav-back">
          <button class="hist-back-btn" id="hist-back">← Todas las historias</button>
        </div>
        <div class="hist-detalle-header">
          <div class="hist-detalle-thumb" style="background-image:url('${historia.thumbnail}')"></div>
          <div class="hist-detalle-info">
            <span class="hist-card-cat">${historia.category}</span>
            <h1 class="hist-detalle-title">${historia.emoji} ${historia.title}</h1>
            <p class="hist-detalle-desc">${historia.description}</p>
            <p class="hist-detalle-meta">📍 ${historia.paradas.length} paradas · ⏱ ${historia.duration_minutes} min</p>
          </div>
        </div>

        <div class="hist-timeline-wrap">
          <div class="hist-timeline" id="hist-timeline">
            ${timelineItems}
          </div>
        </div>

        <div id="hist-parada-wrap"></div>

        <div class="hist-parada-nav">
          <button class="hist-nav-btn" id="hist-prev">← Anterior</button>
          <span id="hist-parada-count">1 / ${historia.paradas.length}</span>
          <button class="hist-nav-btn hist-nav-btn--next" id="hist-next">Siguiente →</button>
        </div>
      </div>`;

    _renderParada(0);

    document.getElementById('hist-back').addEventListener('click', _renderLista);

    document.getElementById('hist-prev').addEventListener('click', () => {
      if (_currentParadaIdx > 0) _renderParada(_currentParadaIdx - 1);
    });
    document.getElementById('hist-next').addEventListener('click', () => {
      if (_currentParadaIdx < _currentHistoria.paradas.length - 1) _renderParada(_currentParadaIdx + 1);
    });

    document.getElementById('hist-timeline').addEventListener('click', e => {
      const btn = e.target.closest('.hist-tl-item');
      if (btn) _renderParada(parseInt(btn.dataset.idx));
    });
  }

  // ─── Render parada ────────────────────────────────────────────────────────

  function _renderParada(idx) {
    window.speechSynthesis && window.speechSynthesis.cancel();
    _ttsActive = false;

    _currentParadaIdx = idx;
    const historia = _currentHistoria;
    const parada = historia.paradas[idx];
    const $wrap = document.getElementById('hist-parada-wrap');
    if (!$wrap) return;

    // Actualizar timeline
    document.querySelectorAll('.hist-tl-item').forEach((el, i) => {
      el.classList.toggle('hist-tl-item--active', i === idx);
      el.classList.toggle('hist-tl-item--done', i < idx);
    });

    // Scroll timeline activo a la vista
    const activeBtn = document.querySelector('.hist-tl-item--active');
    if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    // Actualizar contador
    const counter = document.getElementById('hist-parada-count');
    if (counter) counter.textContent = `${idx + 1} / ${historia.paradas.length}`;

    // Botones prev/next
    const btnPrev = document.getElementById('hist-prev');
    const btnNext = document.getElementById('hist-next');
    if (btnPrev) btnPrev.disabled = idx === 0;
    if (btnNext) btnNext.disabled = idx === historia.paradas.length - 1;

    const factsHTML = parada.key_facts && parada.key_facts.length
      ? `<ul class="hist-facts">${parada.key_facts.map(f => `<li>${f}</li>`).join('')}</ul>`
      : '';

    const imgHTML = parada.image
      ? `<div class="hist-parada-img" style="background-image:url('${parada.image}')"></div>`
      : '';

    $wrap.innerHTML = `
      <div class="hist-parada">
        ${imgHTML}
        <div class="hist-parada-body">
          <div class="hist-parada-year-badge">${parada.year}</div>
          <h2 class="hist-parada-title">${parada.title}</h2>
          <p class="hist-parada-subtitle">${parada.subtitle}</p>
          <p class="hist-parada-content">${parada.content}</p>
          ${factsHTML}
          <button class="hist-tts-btn" id="hist-tts-btn">🔊 Escuchar</button>
        </div>
      </div>`;

    document.getElementById('hist-tts-btn').addEventListener('click', () => {
      _narrar(`${parada.title}. ${parada.content}`);
    });

    $wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ─── API pública ──────────────────────────────────────────────────────────

  function render() {
    window.speechSynthesis && window.speechSynthesis.cancel();
    _ttsActive = false;
    if (_currentHistoria) {
      _renderDetalle(_currentHistoria);
    } else {
      _renderLista();
    }
  }

  return { render };

})();
