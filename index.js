// MQTT → Google Apps Script (Sheets)
// Suscribe a un tópico MQTT y reenvía cada mensaje JSON a tu WebApp /exec?token=...

const mqtt = require("mqtt");
// node-fetch v3 es ESM; este puente funciona en CommonJS:
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const MQTT_URL   = process.env.MQTT_URL   || 'mqtt://test.mosquitto.org:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'ALSW2532/estacion1'; // cámbialo si usas otro
const CLIENT_ID  = process.env.MQTT_CLIENT_ID || 'railway-subscriber-1';

const GAS_URL    = process.env.GAS_URL; // EJ: https://script.google.com/.../exec?token=TU_TOKEN
if (!GAS_URL) {
  console.error('Falta GAS_URL (URL completa de tu WebApp con ?token=...)');
  process.exit(1);
}

console.log('Conectando MQTT:', MQTT_URL, 'topic:', MQTT_TOPIC);

const client = mqtt.connect(MQTT_URL, {
  clientId: CLIENT_ID,
  clean: true,
  keepalive: 60,
  reconnectPeriod: 2000,
});

client.on('connect', () => {
  console.log('MQTT conectado. Suscribiendo a', MQTT_TOPIC);
  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) console.error('Error al suscribir:', err);
  });
});

client.on('message', async (topic, msgBuf) => {
  const raw = msgBuf.toString();
  console.log('RX', topic, raw);

  // Intenta parsear como JSON; si no, lo envía como {"raw": "..."}
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    body = { raw };
  }

  // Enviar a Apps Script
  try {
    const r = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    console.log('GAS resp:', r.status, text);
  } catch (e) {
    console.error('Error POST a GAS:', e.message);
  }
});

client.on('error', (e) => console.error('MQTT error:', e.message));
