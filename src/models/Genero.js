const { Schema, model } = require('mongoose');
const opciones = require('./opciones');

const GeneroSchema = new Schema({
  nombre: { type: String, required: [true, 'El nombre es obligatorio'], unique: true, trim: true },
  estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
  descripcion: { type: String, trim: true },
}, opciones);

module.exports = model('Genero', GeneroSchema);
