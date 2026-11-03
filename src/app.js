const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
const crudRouter = require('./utils/crudRouter');

const Genero = require('./models/Genero');
const Director = require('./models/Director');
const Productora = require('./models/Productora');
const Tipo = require('./models/Tipo');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/generos', crudRouter(Genero));
app.use('/api/directores', crudRouter(Director));
app.use('/api/productoras', crudRouter(Productora));
app.use('/api/tipos', crudRouter(Tipo));
app.use('/api/medias', require('./routes/media'));

// Manejo central de errores (Express 5 envía aquí los errores de funciones async)
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      mensaje: 'Datos inválidos',
      detalle: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.name === 'CastError') return res.status(400).json({ mensaje: 'ID inválido' });
  if (err.code === 11000) {
    return res.status(409).json({ mensaje: 'Valor duplicado', campo: Object.keys(err.keyValue) });
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
conectarDB()
  .then(() => app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`)))
  .catch((e) => { console.error('No se pudo conectar a MongoDB:', e.message); process.exit(1); });
