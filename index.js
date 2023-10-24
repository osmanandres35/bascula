var mqtt = require("mqtt");
const mysql = require('mysql2');
var client = mqtt.connect("mqtt://test.mosquitto.org");

const dbConfig = {
  host: 'srv1075.hstgr.io',
  user: 'u945153519_mascotas',
  password: 'Eduar2532.',
  database: 'u945153519_mascotas'
};

const pool = mysql.createPool(dbConfig);

function EventoConectar() {
  client.subscribe("ALSW2532/#", function (err) {
    if (!err) {
      client.publish("ALSW2532/Temperatura", "30");
    }
  });
}

function EventoMensaje(topic, message) {
  if (topic == "ALSW2532/temp") {
    console.log("La Temperatura es " + message.toString());
  }
  
  
  const [tipo, hora, peso, fecha, idb] = message.toString().split(',');

  const query = 'INSERT INTO bascula (tipo, hora, peso, fecha, idb) VALUES (?, ?, ?, ?, ?)';
  pool.query(query, [tipo, hora, peso, fecha, idb], (error, results, fields) => {
    if (error) {
      console.error('Error al realizar la inserción en la base de datos:', error);
    } else {
      console.log('R_ok');
    }
  });
}

client.on("connect", EventoConectar);
client.on("message", EventoMensaje);

pool.on('error', (err) => {
  console.error('Error de conexión a la base de datos:', err);
});
