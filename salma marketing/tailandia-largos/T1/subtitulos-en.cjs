// Subtítulos EN (.srt) de Tailandia 1 (M10, Y10): una traducción por frase del guion, con los tiempos reales del montaje (salida/<id>-tiempos.json). Las frases largas se parten en trozos de ≤ 84 letras repartidos por su duración. 0 €.
// Uso: node subtitulos-en.cjs <id del montaje>   → ULTIMA/tailandia-que-saber-antes-de-ir - subtitulos EN.srt
const fs = require('fs'), path = require('path');
const EN = [
  "In Thailand, marijuana is sold on every corner, ATMs work the other way round from Spain, and the north is ridden by motorbike through eighteen hundred curves.",
  "Three months in Thailand, from a boxing ring on an island to the mountains of the north. Ten answers. Quick. And real.",
  "First: Thailand has changed the rules. With a Spanish passport you no longer get sixty days without a visa, but thirty. If you want more, you ask for an extension at Immigration.",
  "A passport valid for six months, and the digital arrival card, online, within the three days before you arrive.",
  "And don't overstay: it costs five hundred baht per day, and it can end in deportation.",
  "The next thing that shapes your trip is the month you go.",
  "The best season runs from November to February: dry and cool. From May to November it is the monsoon: heavy rain and, on the coast, currents to be careful with.",
  "And a detail almost nobody checks: in the north, from January to March the air gets much worse because fields are burned. If you go north, November or December is better.",
  "And is it a safe country?",
  "Yes. For independent travel it is a safe country. The Spanish Foreign Ministry only asks you to avoid three areas: the Cambodian border, with its crossings closed; the far south; and the border with Myanmar.",
  "Where you need to be most careful is on the road. And with two classic scams: jewellery shops with bargains, and drinks from strangers.",
  "And now, what everyone asks: how much does it cost?",
  "Getting around is cheap: in Chiang Mai, the shared red truck costs about thirty baht. Agree the price before you get in, or use Grab, with a fixed fare.",
  "What you notice most in your wallet are entrance fees: three hundred baht for Doi Inthanon. And the White Temple in Chiang Rai doubled its fee this year: two hundred.",
  "The tuk-tuk is worth it once, for the experience, but it costs more: agree the price first. And the centre of Chiang Mai, a square with a moat, can be crossed on foot in twenty-five minutes.",
  "On the island ferries, check there are life jackets: not all of them are well equipped.",
  "But the best way to discover the north is on two wheels.",
  "The north by motorbike is wonderful. But do it legally: you need an international driving permit, because a European car licence does not cover motorbikes. I had one.",
  "Without it, if something happens, your insurance may not cover you.",
  "Rent from a serious place: I did it in Chiang Mai, at a highly recommended shop, and everything went well. Better not to leave your passport as a deposit, and take photos of the bike before you leave.",
  "I rode the north: seven hundred and sixty-two curves to Pai, one thousand eight hundred and sixty-four on the Mae Hong Son loop. On the left, and with a helmet.",
  "Now, a couple of things you don't do there.",
  "Vaping: it is banned, and the fine can be around a thousand euros.",
  "Drugs, neither: they are punished with prison, even for using them. And marijuana? There are shops on every corner. The law requires a prescription, and the shop writes it for you on the spot. But you don't smoke it in the street.",
  "In the north you can visit Kayan villages. They are sometimes advertised as \"giraffe women\", a name considered offensive. They fled the war in Myanmar, and many still have no citizenship of any country. I went on my own and they didn't charge me anything. If you go with an agency, ask how much reaches the village, and ask permission before every photo.",
  "And elephants, better without rides or shows. In Chiang Mai there are sanctuaries where they are not ridden, like Elephant Nature Park, booked in advance.",
  "Before the ATM trick, one minute on health.",
  "Travelling from Spain, no vaccine is mandatory. The Foreign Ministry recommends hepatitis A and B, tetanus, rabies and Japanese encephalitis: book an appointment in good time at an international vaccination centre.",
  "Water: bottled. In the rainy season there is dengue: with a fever, see a doctor, and no aspirin. And take travel insurance: Spanish public healthcare does not cover you there.",
  "ATMs accept Spanish cards, but they work the other way round: first they give you the cash and then the card comes out. If you get distracted, it swallows it. Wait for it.",
  "And in nightclubs and clubs in Bangkok or Chiang Mai, better to pay cash: there is card fraud.",
  "And now, the big question: north or islands?",
  "The north is mountains, temples and road: Chiang Mai, founded in twelve ninety-six; the White Temple of Chiang Rai, under construction for almost thirty years; and the Golden Triangle, where three countries meet.",
  "The islands are another world. In Koh Samui I watched a German fighter perform the Wai Khru, the salute to the teacher, in each corner of the ring before her fight.",
  "Both stories, in full, on this channel: the north by motorbike on December the eighth; Muay Thai, on the tenth.",
];
const T1 = __dirname, id = process.argv[2] || 'tailandia-1-v4';
const t = JSON.parse(fs.readFileSync(path.join(T1, 'salida', id + '-tiempos.json'), 'utf8')).filter(b => b.id !== 'app' && b.id !== 'fin');
if (t.length !== EN.length) throw new Error(`el montaje tiene ${t.length} frases con voz y hay ${EN.length} traducciones`);
const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, x = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const trozos = s => { const w = s.split(' '), out = []; let cur = ''; for (const p of w) { if ((cur + ' ' + p).trim().length > 84) { out.push(cur.trim()); cur = p; } else cur += ' ' + p; } if (cur.trim()) out.push(cur.trim()); return out; };
let n = 0; const lin = [];
t.forEach((b, i) => { const t0 = b.t0 + 0.15, t1 = b.t0 + b.D - 0.5, tr = trozos(EN[i]), tot = tr.reduce((a, x) => a + x.length, 0); let c = t0;
  tr.forEach(x => { const d = (t1 - t0) * x.length / tot; lin.push(`${++n}\n${f(c)} --> ${f(c + d - 0.05)}\n${x}\n`); c += d; }); });
const out = path.join(T1, 'ULTIMA', 'tailandia-que-saber-antes-de-ir - subtitulos EN.srt'); fs.writeFileSync(out, lin.join('\n')); console.log('srt EN', n, 'líneas ·', out);
