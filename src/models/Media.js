const { Schema, model } = require('mongoose');
const opciones = require('./opciones');

const MediaSchema = new Schema({
  serial: { type: String, required: [true, 'El serial es obligatorio'], unique: true, trim: true },
  titulo: { type: String, required: [true, 'El título es obligatorio'], trim: true },
  sinopsis: { type: String, trim: true },
  url: { type: String, required: [true, 'La URL es obligatoria'], unique: true, trim: true },
  imagenPortada: { type: String, trim: true },
  anioEstreno: {
    type: Number,
    required: [true, 'El año de estreno es obligatorio'],
    min: [1888, 'El año de estreno no es válido'],
  },
  // Relaciones: guardan el _id del documento de otra colección
  genero: { type: Schema.Types.ObjectId, ref: 'Genero', required: [true, 'El género es obligatorio'] },
  director: { type: Schema.Types.ObjectId, ref: 'Director', required: [true, 'El director es obligatorio'] },
  productora: { type: Schema.Types.ObjectId, ref: 'Productora', required: [true, 'La productora es obligatoria'] },
  tipo: { type: Schema.Types.ObjectId, ref: 'Tipo', required: [true, 'El tipo es obligatorio'] },
}, opciones);

module.exports = model('Media', MediaSchema);
