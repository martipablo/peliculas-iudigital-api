const { Schema, model } = require('mongoose');
const opciones = require('./opciones');

const ProductoraSchema = new Schema({
  nombre: { type: String, required: [true, 'El nombre es obligatorio'], unique: true, trim: true },
  estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
  slogan: { type: String, trim: true },
  descripcion: { type: String, trim: true },
}, opciones);

module.exports = model('Productora', ProductoraSchema);
