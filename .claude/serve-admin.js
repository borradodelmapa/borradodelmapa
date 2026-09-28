// Panel admin en local (28 sept 2026): sirve la copia de trabajo de C:\Users\User\Desktop\salma-admin en
// http://localhost:8091 con el mismo servidor de "Propuesta UX". Para enseñar a Paco un cambio del panel antes de subirlo.
const path = require('path');
process.env.PREVIEW_ROOT = path.join(__dirname, '..', '..', 'salma-admin');
process.env.PORT = '8091';
require('./serve-preview.js');
