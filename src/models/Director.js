const { Schema, model } = require('mongoose');
const opciones = require('./opciones');

const DirectorSchema = new Schema({
  nombres: { type: String, required: [true, 'Los nombres son obligatorios'], trim: true },
  estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
}, opciones);

module.exports = model('Director', DirectorSchema);
