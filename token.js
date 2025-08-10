// token.js  – ejecuta esto una sola vez
import 'dotenv/config';           // carga automáticamente tu .env
import { google } from 'googleapis';
import readline from 'node:readline/promises';

const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI } = process.env;

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI,
);

// 1) Genera la URL de autorización
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',          // obliga a que Google devuelva refresh_token
  prompt: 'consent',               // fuerza pantalla de consentimiento
  scope: ['https://mail.google.com/'],
});
console.log('\n• Abre esta URL en tu navegador y concede acceso:\n\n', authUrl);

// 2) Pide el código que Google devuelve
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const code = await rl.question('\n• Pega aquí el parámetro "code" que viene en la URL de retorno:\n');
rl.close();

// 3) Intercambia el código por los tokens
const { tokens } = await oauth2Client.getToken(code.trim());
console.log('\n✅ REFRESH TOKEN obtenido:\n', tokens.refresh_token ?? '(no recibido)');
process.exit();