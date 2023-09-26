const express = require('express');
const mysql = require('mysql2/promise');

const app = express();

// Permitir peticiones HTTP versión 1
app.use((req, res, next) => {
  req.httpVersion = '1.1';
  req.httpVersionMajor = 1;
  req.httpVersionMinor = 1;
  next();
});

const pool = mysql.createPool({
  host: 'srv1075.hstgr.io',
  user: 'u945153519_mascotas',
  password: 'Eduar2532.',
  database: 'u945153519_mascotas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());

app.post('/api/agregarRegistro', async (req, res) => {
  const { tipo, hora, peso, fecha, idb } = req.body;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'INSERT INTO bascula (tipo, hora, peso, fecha, idb) VALUES (?, ?, ?, ?, ?)',
      [tipo, hora, peso, fecha, idb]
    );
    connection.release();
    res.json({ success: true, message: 'Registro insertado con éxito' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al insertar el registro', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
