// ═══════════════════════════════════════════════════════════════
// COUNTRY UTILS — Normalización de países para Bitácora
// ═══════════════════════════════════════════════════════════════

const COUNTRY_MAP = {
  'afganistan':'AF','albania':'AL','alemania':'DE','germany':'DE','andorra':'AD',
  'angola':'AO','argentina':'AR','armenia':'AM','australia':'AU','austria':'AT',
  'azerbaiyan':'AZ','bahamas':'BS','bangladesh':'BD','barbados':'BB','barein':'BH','bahrain':'BH',
  'belgica':'BE','belgium':'BE','belice':'BZ','benin':'BJ','bielorrusia':'BY','belarus':'BY',
  'birmania':'MM','myanmar':'MM','bolivia':'BO','bosnia':'BA','botsuana':'BW','botswana':'BW',
  'brasil':'BR','brazil':'BR','brunei':'BN','bulgaria':'BG','burkina faso':'BF','burundi':'BI',
  'butan':'BT','bhutan':'BT','cabo verde':'CV','camboya':'KH','cambodia':'KH',
  'camerun':'CM','cameroon':'CM','canada':'CA','catar':'QA','qatar':'QA','chad':'TD',
  'chile':'CL','china':'CN','chipre':'CY','cyprus':'CY','colombia':'CO',
  'comoras':'KM','congo':'CG','corea del norte':'KP','corea del sur':'KR','south korea':'KR',
  'costa de marfil':'CI','costa rica':'CR','croacia':'HR','croatia':'HR',
  'cuba':'CU','dinamarca':'DK','denmark':'DK','dominica':'DM',
  'ecuador':'EC','egipto':'EG','egypt':'EG',
  'el salvador':'SV','emiratos':'AE','emiratos arabes':'AE','uae':'AE',
  'eritrea':'ER','eslovaquia':'SK','slovakia':'SK',
  'eslovenia':'SI','slovenia':'SI','espana':'ES','spain':'ES',
  'estados unidos':'US','eeuu':'US','usa':'US','united states':'US',
  'estonia':'EE','etiopia':'ET','ethiopia':'ET','esuatini':'SZ',
  'filipinas':'PH','philippines':'PH',
  'finlandia':'FI','finland':'FI','fiyi':'FJ','fiji':'FJ',
  'francia':'FR','france':'FR','gabon':'GA','gambia':'GM','georgia':'GE',
  'ghana':'GH','grecia':'GR','greece':'GR','granada':'GD','guatemala':'GT','guinea':'GN',
  'guinea ecuatorial':'GQ','guinea bisau':'GW','guyana':'GY','haiti':'HT','honduras':'HN',
  'hungria':'HU','hungary':'HU','india':'IN','indonesia':'ID',
  'irak':'IQ','iraq':'IQ','iran':'IR','irlanda':'IE','ireland':'IE',
  'islandia':'IS','iceland':'IS','israel':'IL','italia':'IT','italy':'IT',
  'jamaica':'JM','japon':'JP','japan':'JP','jordania':'JO','jordan':'JO',
  'kazajistan':'KZ','kazakhstan':'KZ','kenia':'KE','kenya':'KE',
  'kirguistan':'KG','kyrgyzstan':'KG','kiribati':'KI','kuwait':'KW','laos':'LA',
  'letonia':'LV','latvia':'LV','lesoto':'LS','libano':'LB','lebanon':'LB',
  'liberia':'LR','libia':'LY','libya':'LY','liechtenstein':'LI',
  'lituania':'LT','lithuania':'LT','luxemburgo':'LU','luxembourg':'LU',
  'macedonia':'MK','madagascar':'MG','malasia':'MY','malaysia':'MY','malaui':'MW','malawi':'MW',
  'maldivas':'MV','maldives':'MV','mali':'ML','malta':'MT',
  'marruecos':'MA','morocco':'MA','mauricio':'MU','mauritius':'MU',
  'mauritania':'MR','mexico':'MX','micronesia':'FM','moldavia':'MD','moldova':'MD',
  'monaco':'MC','mongolia':'MN','montenegro':'ME','mozambique':'MZ',
  'namibia':'NA','nepal':'NP','nicaragua':'NI','niger':'NE','nigeria':'NG',
  'noruega':'NO','norway':'NO','nueva zelanda':'NZ','new zealand':'NZ',
  'oman':'OM','paises bajos':'NL','holanda':'NL','netherlands':'NL',
  'pakistan':'PK','palaos':'PW','palestina':'PS','panama':'PA','papua nueva guinea':'PG',
  'paraguay':'PY','peru':'PE','polonia':'PL','poland':'PL',
  'portugal':'PT','reino unido':'GB','uk':'GB','united kingdom':'GB','england':'GB',
  'republica centroafricana':'CF','republica checa':'CZ','czech republic':'CZ','chequia':'CZ',
  'republica dominicana':'DO','dominican republic':'DO',
  'rumania':'RO','romania':'RO','rusia':'RU','russia':'RU',
  'ruanda':'RW','rwanda':'RW','samoa':'WS','san marino':'SM',
  'santo tome':'ST','arabia saudita':'SA','saudi arabia':'SA',
  'senegal':'SN','serbia':'RS','seychelles':'SC',
  'singapur':'SG','singapore':'SG','siria':'SY','syria':'SY',
  'somalia':'SO','sri lanka':'LK','sudafrica':'ZA','south africa':'ZA',
  'sudan':'SD','sudan del sur':'SS','suecia':'SE','sweden':'SE','suiza':'CH','switzerland':'CH',
  'surinam':'SR','tailandia':'TH','thailand':'TH','taiwan':'TW','tanzania':'TZ',
  'tayikistan':'TJ','timor oriental':'TL','togo':'TG','tonga':'TO',
  'trinidad y tobago':'TT','tunez':'TN','tunisia':'TN',
  'turkmenistan':'TM','turquia':'TR','turkey':'TR','turkiye':'TR',
  'tuvalu':'TV','ucrania':'UA','ukraine':'UA','uganda':'UG','uruguay':'UY',
  'uzbekistan':'UZ','vanuatu':'VU','vaticano':'VA','venezuela':'VE',
  'vietnam':'VN','yemen':'YE','yibuti':'DJ',
  'zambia':'ZM','zimbabue':'ZW','zimbabwe':'ZW'
};

// Mapa inverso: código → nombre en castellano (primer nombre encontrado)
const CODE_TO_NAME = {};
for (const [name, code] of Object.entries(COUNTRY_MAP)) {
  if (!CODE_TO_NAME[code]) CODE_TO_NAME[code] = name.charAt(0).toUpperCase() + name.slice(1);
}
// Correcciones manuales de nombres bonitos
Object.assign(CODE_TO_NAME, {
  'DE':'Alemania','US':'Estados Unidos','GB':'Reino Unido','NL':'Países Bajos',
  'KR':'Corea del Sur','KP':'Corea del Norte','AE':'Emiratos Árabes','ZA':'Sudáfrica',
  'NZ':'Nueva Zelanda','CZ':'República Checa','DO':'República Dominicana',
  'BA':'Bosnia y Herzegovina','CF':'República Centroafricana','SS':'Sudán del Sur',
  'TL':'Timor Oriental','TT':'Trinidad y Tobago','GQ':'Guinea Ecuatorial',
  'GW':'Guinea-Bisáu','PG':'Papúa Nueva Guinea','SA':'Arabia Saudita',
  'CI':'Costa de Marfil','BF':'Burkina Faso','CV':'Cabo Verde',
  'MM':'Birmania/Myanmar','BR':'Brasil','FR':'Francia','IT':'Italia',
  'ES':'España','PT':'Portugal','MX':'México','JP':'Japón','CN':'China',
  'IN':'India','TH':'Tailandia','VN':'Vietnam','KH':'Camboya','NP':'Nepal',
  'EG':'Egipto','MA':'Marruecos','GR':'Grecia','TR':'Turquía','HR':'Croacia',
  'PL':'Polonia','HU':'Hungría','RO':'Rumanía','BG':'Bulgaria','RS':'Serbia',
  'SE':'Suecia','NO':'Noruega','FI':'Finlandia','DK':'Dinamarca','IS':'Islandia',
  'IE':'Irlanda','AT':'Austria','CH':'Suiza','BE':'Bélgica','LU':'Luxemburgo',
  'CO':'Colombia','PE':'Perú','AR':'Argentina','CL':'Chile','EC':'Ecuador',
  'BO':'Bolivia','PY':'Paraguay','UY':'Uruguay','CR':'Costa Rica','PA':'Panamá',
  'CU':'Cuba','GT':'Guatemala','HN':'Honduras','SV':'El Salvador','NI':'Nicaragua',
  'BZ':'Belice','JM':'Jamaica','QA':'Catar','BH':'Baréin','JO':'Jordania',
  'LB':'Líbano','IL':'Israel','GE':'Georgia','AM':'Armenia','AZ':'Azerbaiyán',
  'KZ':'Kazajistán','KG':'Kirguistán','UZ':'Uzbekistán','TJ':'Tayikistán',
  'TM':'Turkmenistán','LK':'Sri Lanka','MV':'Maldivas','PH':'Filipinas',
  'MY':'Malasia','ID':'Indonesia','LA':'Laos','BD':'Bangladés','PK':'Pakistán',
  'IR':'Irán','IQ':'Irak','SY':'Siria','YE':'Yemen','OM':'Omán',
  'KW':'Kuwait','ET':'Etiopía','KE':'Kenia','TZ':'Tanzania','UG':'Uganda',
  'RW':'Ruanda','MG':'Madagascar','MZ':'Mozambique','ZM':'Zambia','ZW':'Zimbabue',
  'BW':'Botsuana','NA':'Namibia','SN':'Senegal','GH':'Ghana','NG':'Nigeria',
  'CM':'Camerún','GA':'Gabón','CG':'Congo','ML':'Malí','MR':'Mauritania',
  'TN':'Túnez','LY':'Libia','SD':'Sudán','ER':'Eritrea','DJ':'Yibuti',
  'SO':'Somalia','LR':'Liberia','SL':'Sierra Leona','TD':'Chad',
  'FJ':'Fiyi','TO':'Tonga','WS':'Samoa','VU':'Vanuatu',
  'UA':'Ucrania','BY':'Bielorrusia','MD':'Moldavia','LT':'Lituania',
  'LV':'Letonia','EE':'Estonia','AL':'Albania','MK':'Macedonia del Norte',
  'ME':'Montenegro','SI':'Eslovenia','SK':'Eslovaquia','RU':'Rusia',
  'AD':'Andorra','MC':'Mónaco','SM':'San Marino','VA':'Vaticano','LI':'Liechtenstein',
  'MT':'Malta','CY':'Chipre','BT':'Bután','MN':'Mongolia','BN':'Brunéi',
  'SG':'Singapur','TW':'Taiwán','HT':'Haití','BB':'Barbados','BS':'Bahamas',
  'GY':'Guyana','SR':'Surinam','VE':'Venezuela'
});

function countryEmoji(code) {
  if (!code || code.length !== 2) return '';
  return String.fromCodePoint(...code.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

function normalizeCountry(raw) {
  if (!raw) return { code: '', name: '', emoji: '' };
  const norm = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '').trim();

  // Directo
  if (COUNTRY_MAP[norm]) {
    const code = COUNTRY_MAP[norm];
    return { code, name: CODE_TO_NAME[code] || norm, emoji: countryEmoji(code) };
  }

  // Parcial — buscar si el texto contiene un nombre de país
  for (const [key, code] of Object.entries(COUNTRY_MAP)) {
    if (norm.includes(key) || key.includes(norm)) {
      return { code, name: CODE_TO_NAME[code] || key, emoji: countryEmoji(code) };
    }
  }

  return { code: '', name: raw, emoji: '' };
}

// Detectar país en un mensaje del usuario
function detectCountryInMessage(msg) {
  if (!msg) return null;
  const norm = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Buscar el nombre de país más largo que aparezca en el mensaje
  let best = null;
  let bestLen = 0;
  for (const [key, code] of Object.entries(COUNTRY_MAP)) {
    if (norm.includes(key) && key.length > bestLen) {
      best = { code, name: CODE_TO_NAME[code] || key, emoji: countryEmoji(code) };
      bestLen = key.length;
    }
  }
  return best;
}

// ═══════════════════════════════════════════════════════════════
// RELOJ MUNDIAL — hora local de cualquier país, sin llamar a ninguna
// API (Intl + IANA timezone del propio navegador, coste cero).
// Un país grande con varios husos usa el de su capital/mayor ciudad
// — aproximación suficiente para saber la hora en una escala de vuelo.
// ═══════════════════════════════════════════════════════════════

const COUNTRY_TZ = {
  // Europa
  AL:'Europe/Tirane', AD:'Europe/Andorra', AT:'Europe/Vienna', BY:'Europe/Minsk',
  BE:'Europe/Brussels', BA:'Europe/Sarajevo', BG:'Europe/Sofia', HR:'Europe/Zagreb',
  CY:'Asia/Nicosia', CZ:'Europe/Prague', DK:'Europe/Copenhagen', EE:'Europe/Tallinn',
  FI:'Europe/Helsinki', FR:'Europe/Paris', DE:'Europe/Berlin', GR:'Europe/Athens',
  HU:'Europe/Budapest', IS:'Atlantic/Reykjavik', IE:'Europe/Dublin', IT:'Europe/Rome',
  LV:'Europe/Riga', LI:'Europe/Vaduz', LT:'Europe/Vilnius', LU:'Europe/Luxembourg',
  MK:'Europe/Skopje', MT:'Europe/Malta', MD:'Europe/Chisinau', MC:'Europe/Monaco',
  ME:'Europe/Podgorica', NL:'Europe/Amsterdam', NO:'Europe/Oslo', PL:'Europe/Warsaw',
  PT:'Europe/Lisbon', RO:'Europe/Bucharest', RU:'Europe/Moscow', SM:'Europe/San_Marino',
  RS:'Europe/Belgrade', SK:'Europe/Bratislava', SI:'Europe/Ljubljana', ES:'Europe/Madrid',
  SE:'Europe/Stockholm', CH:'Europe/Zurich', UA:'Europe/Kyiv', GB:'Europe/London',
  VA:'Europe/Vatican',
  // Asia
  AF:'Asia/Kabul', AM:'Asia/Yerevan', AZ:'Asia/Baku', BH:'Asia/Bahrain',
  BD:'Asia/Dhaka', BT:'Asia/Thimphu', BN:'Asia/Brunei', KH:'Asia/Phnom_Penh',
  CN:'Asia/Shanghai', GE:'Asia/Tbilisi', IN:'Asia/Kolkata', ID:'Asia/Jakarta',
  IR:'Asia/Tehran', IQ:'Asia/Baghdad', IL:'Asia/Jerusalem', JP:'Asia/Tokyo',
  JO:'Asia/Amman', KZ:'Asia/Almaty', KW:'Asia/Kuwait', KG:'Asia/Bishkek',
  LA:'Asia/Vientiane', LB:'Asia/Beirut', MY:'Asia/Kuala_Lumpur', MV:'Indian/Maldives',
  MN:'Asia/Ulaanbaatar', MM:'Asia/Yangon', NP:'Asia/Kathmandu', KP:'Asia/Pyongyang',
  OM:'Asia/Muscat', PK:'Asia/Karachi', PS:'Asia/Gaza', PH:'Asia/Manila',
  QA:'Asia/Qatar', SA:'Asia/Riyadh', SG:'Asia/Singapore', KR:'Asia/Seoul',
  LK:'Asia/Colombo', SY:'Asia/Damascus', TW:'Asia/Taipei', TJ:'Asia/Dushanbe',
  TH:'Asia/Bangkok', TL:'Asia/Dili', TR:'Europe/Istanbul', TM:'Asia/Ashgabat',
  AE:'Asia/Dubai', UZ:'Asia/Tashkent', VN:'Asia/Ho_Chi_Minh', YE:'Asia/Aden',
  KI:'Pacific/Tarawa',
  // África
  AO:'Africa/Luanda', BJ:'Africa/Porto-Novo', BW:'Africa/Gaborone', BF:'Africa/Ouagadougou',
  BI:'Africa/Bujumbura', CV:'Atlantic/Cape_Verde', CM:'Africa/Douala', CF:'Africa/Bangui',
  TD:'Africa/Ndjamena', KM:'Indian/Comoro', CG:'Africa/Brazzaville', CI:'Africa/Abidjan',
  DJ:'Africa/Djibouti', EG:'Africa/Cairo', GQ:'Africa/Malabo', ER:'Africa/Asmara',
  SZ:'Africa/Mbabane', ET:'Africa/Addis_Ababa', GA:'Africa/Libreville', GM:'Africa/Banjul',
  GH:'Africa/Accra', GN:'Africa/Conakry', GW:'Africa/Bissau', KE:'Africa/Nairobi',
  LS:'Africa/Maseru', LR:'Africa/Monrovia', LY:'Africa/Tripoli', MG:'Indian/Antananarivo',
  MW:'Africa/Blantyre', ML:'Africa/Bamako', MR:'Africa/Nouakchott', MU:'Indian/Mauritius',
  MA:'Africa/Casablanca', MZ:'Africa/Maputo', NA:'Africa/Windhoek', NE:'Africa/Niamey',
  NG:'Africa/Lagos', RW:'Africa/Kigali', ST:'Africa/Sao_Tome', SN:'Africa/Dakar',
  SC:'Indian/Mahe', SL:'Africa/Freetown', SO:'Africa/Mogadishu', ZA:'Africa/Johannesburg',
  SS:'Africa/Juba', SD:'Africa/Khartoum', TZ:'Africa/Dar_es_Salaam', TG:'Africa/Lome',
  TN:'Africa/Tunis', UG:'Africa/Kampala', ZM:'Africa/Lusaka', ZW:'Africa/Harare',
  // América
  AR:'America/Argentina/Buenos_Aires', BS:'America/Nassau', BB:'America/Barbados',
  BZ:'America/Belize', BO:'America/La_Paz', BR:'America/Sao_Paulo', CA:'America/Toronto',
  CL:'America/Santiago', CO:'America/Bogota', CR:'America/Costa_Rica', CU:'America/Havana',
  DM:'America/Dominica', DO:'America/Santo_Domingo', EC:'America/Guayaquil',
  SV:'America/El_Salvador', GD:'America/Grenada', GT:'America/Guatemala',
  GY:'America/Guyana', HT:'America/Port-au-Prince', HN:'America/Tegucigalpa',
  JM:'America/Jamaica', MX:'America/Mexico_City', NI:'America/Managua',
  PA:'America/Panama', PY:'America/Asuncion', PE:'America/Lima', SR:'America/Paramaribo',
  TT:'America/Port_of_Spain', US:'America/New_York', UY:'America/Montevideo',
  VE:'America/Caracas',
  // Oceanía
  AU:'Australia/Sydney', FJ:'Pacific/Fiji', FM:'Pacific/Pohnpei', NZ:'Pacific/Auckland',
  PW:'Pacific/Palau', PG:'Pacific/Port_Moresby', WS:'Pacific/Apia', TO:'Pacific/Tongatapu',
  TV:'Pacific/Funafuti', VU:'Pacific/Efate'
};

// Lista única de países con huso conocido (código + nombre + bandera), para el buscador del reloj
let _countryListCache = null;
function countryList() {
  if (_countryListCache) return _countryListCache;
  _countryListCache = Object.keys(COUNTRY_TZ)
    .map(code => ({ code, name: CODE_TO_NAME[code] || code, emoji: countryEmoji(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return _countryListCache;
}

// "España 9:01 AM Domingo 20 septiembre 2026" — hora/fecha real de un país por su código ISO2
function countryTimeString(code) {
  const name = CODE_TO_NAME[code] || code || '';
  const rawTz = COUNTRY_TZ[code] || 'UTC';
  let tz = rawTz;
  try { new Intl.DateTimeFormat('es-ES', { timeZone: tz }); }
  catch (_) { tz = 'UTC'; }
  const now = new Date();
  const parts = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz
  }).formatToParts(now);
  const get = t => (parts.find(p => p.type === t) || {}).value || '';
  const weekday = get('weekday');
  const weekdayCap = weekday ? weekday.charAt(0).toUpperCase() + weekday.slice(1) : '';
  const timeStr = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz
  }).format(now);
  return `${name} ${timeStr} ${weekdayCap} ${get('day')} ${get('month')} ${get('year')}`.trim();
}

// Hora local del dispositivo (sin país conocido todavía) — mismo formato, sin nombre delante
function deviceTimeString() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).formatToParts(now);
  const get = t => (parts.find(p => p.type === t) || {}).value || '';
  const weekday = get('weekday');
  const weekdayCap = weekday ? weekday.charAt(0).toUpperCase() + weekday.slice(1) : '';
  const timeStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(now);
  return `${timeStr} ${weekdayCap} ${get('day')} ${get('month')} ${get('year')}`.trim();
}

// "Madrid,ES" — reutiliza la misma ciudad del huso horario para pedir el
// clima de ese país por /weather?city=, sin mantener una tabla aparte.
function countryWeatherQuery(code) {
  const tz = COUNTRY_TZ[code];
  if (!tz) return null;
  const city = tz.split('/').pop().replace(/_/g, ' ');
  return `${city},${code}`;
}
