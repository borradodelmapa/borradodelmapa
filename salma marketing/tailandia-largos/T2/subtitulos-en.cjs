// Subtítulos EN (.srt) de Tailandia 2 · el norte en moto (M10, Y10): una traducción por frase del guion n14, con los tiempos reales del montaje (salida/<id>-tiempos.json). 0 €.
// Uso: node subtitulos-en.cjs <id del montaje>   → ULTIMA/asi-es-el-norte-de-tailandia-en-moto - subtitulos EN.srt
const fs = require('fs'), path = require('path');
const EN = [
  "One thousand eight hundred and sixty-four curves. Six days. One motorbike. And a Chinese village in the middle of Thailand.",
  "It's the Mae Hong Son loop, one of the most famous motorbike routes in Thailand. I rode all of it. This is what you need to know before you set off.",
  "Six hundred kilometres of mountains, right next to the border with Myanmar.",
  "It's a circuit: it leaves Chiang Mai and returns to Chiang Mai, on two roads, the 1095 and the 108.",
  "And it starts in a city with a moat: Chiang Mai, founded in 1296.",
  "But rushing it takes the fun away. How many days do you need?",
  "Four, at the very least. With five or six you have time for detours.",
  "I took six: Pai, the lake at Ban Rak Thai, Mae Sariang and the climb to the roof of the country.",
  "Before setting off, all you need is the bike. And your papers in order.",
  "I rented in Chiang Mai, at a highly recommended shop, and everything went well. Look for a serious place: there are plenty.",
  "To ride you need an international driving permit, because a European car licence is not valid for motorbikes. I had one.",
  "Without it, if you have a mishap, your insurance may not cover you.",
  "Better not to leave your passport as a deposit, and take photos of the bike before you leave.",
  "With your papers in order, the good part begins: the curves.",
  "Seven hundred and sixty-two curves in just over a hundred kilometres. And that's only as far as Pai.",
  "Enjoy it without rushing: in Thailand, the road is where you need to be most careful.",
  "On the left, with a helmet and closed shoes. And watch out for gravel and sand on the bends, especially if it rains.",
  "The reward, at the end of those curves, is a valley.",
  "Pai is a small town in a valley, with Shan and Thai heritage.",
  "At night, its walking street fills with food stalls, crafts and music. By day, the canyon: a cliff with a view.",
  "And the road that brings you here was first opened as a dirt track by the Japanese army in the Second World War, on the way to Burma.",
  "But the strangest thing on the trip was further north: a Chinese village in the middle of Thailand.",
  "Red lanterns, Chinese roofs and tea plantations, beside a lake among mountains, north of Mae Hong Son.",
  "It's Ban Rak Thai. It was built by Chinese Nationalist soldiers who left China after losing the civil war, in 1949.",
  "For years they lived on both sides of the border with Burma. The village had no Thai name until the eighties.",
  "At seven in the morning, the lake is mist, boats and monks collecting alms.",
  "A few kilometres away there is another border. And another story.",
  "Sometimes they are advertised as \"giraffe women\". They are called Kayan, and that name is considered offensive.",
  "They fled the war in eastern Burma. According to human rights organisations, up to a third of their state's population was displaced.",
  "Many still have no citizenship in any country.",
  "I went on my own and they didn't charge me anything. If you go with an agency, ask how much reaches the village. And ask permission before every photo.",
  "And before you go, check the Spanish Foreign Ministry's advice: it asks travellers not to go near the border with Myanmar.",
  "From here, the road heads south. And it holds a memory of the Second World War.",
  "In Khun Yuam, a small museum remembers the Japanese soldiers who passed through here towards Burma, and those who came back in retreat.",
  "And at the end, the roof of Thailand: Doi Inthanon, 2,565 metres. It is named after Inthawichayanon, one of the last kings of Chiang Mai, and his ashes lie at the summit.",
  "The entrance fee: three hundred baht for foreigners.",
  "Along the way there are elephant sanctuaries. The good ones: no riding and no shows.",
  "And now, what changes the trip the most: the date.",
  "From May to November it rains, and on a motorbike you feel it.",
  "The good news: from November to February, dry and cool. One detail: from January to March the air in the north gets much worse because fields are burned. Best of all, November and December.",
  "One last tip: fill up the tank in Mae Hong Son. On some stretches there are few petrol stations.",
  "One thousand eight hundred and sixty-four curves later, the loop closes where it began. On December the tenth, the other side of Thailand: a night of Muay Thai on Koh Samui.",
];
const T2 = __dirname, id = process.argv[2] || 'tailandia-2-v3';
const t = JSON.parse(fs.readFileSync(path.join(T2, 'salida', id + '-tiempos.json'), 'utf8')).filter(b => b.id !== 'app' && b.id !== 'fin');
if (t.length !== EN.length) throw new Error(`el montaje tiene ${t.length} frases con voz y hay ${EN.length} traducciones`);
const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, x = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const trozos = s => { const w = s.split(' '), out = []; let cur = ''; for (const p of w) { if ((cur + ' ' + p).trim().length > 84) { out.push(cur.trim()); cur = p; } else cur += ' ' + p; } if (cur.trim()) out.push(cur.trim()); return out; };
let n = 0; const lin = [];
t.forEach((b, i) => { const t0 = b.t0 + 0.15, t1 = b.t0 + b.D - 0.5, tr = trozos(EN[i]), tot = tr.reduce((a, x) => a + x.length, 0); let c = t0;
  tr.forEach(x => { const d = (t1 - t0) * x.length / tot; lin.push(`${++n}\n${f(c)} --> ${f(c + d - 0.05)}\n${x}\n`); c += d; }); });
const out = path.join(T2, 'ULTIMA', 'asi-es-el-norte-de-tailandia-en-moto - subtitulos EN.srt'); fs.writeFileSync(out, lin.join('\n')); console.log('srt EN', n, 'líneas ·', out);
