const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let full = '';
rl.on('line', l => {
  if (!l.startsWith('data: ')) return;
  try {
    const d = JSON.parse(l.slice(6));
    if (d.t) full += d.t;
    if (d.done) { console.log(full.substring(0, 4000)); process.exit(0); }
  } catch(e) {}
});
