const { Schema, model } = require('mongoose');
const opciones = require('./opciones');

const TipoSchema = new Schema({
  nombre: { type: String, required: [true, 'El nombre es obligatorio'], unique: true, trim: true },
  descripcion: { type: String, trim: true },
}, opciones);

module.exports = model('Tipo', TipoSchema);
