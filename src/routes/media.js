const { Router } = require('express');
const { isValidObjectId } = require('mongoose');
const Media = require('../models/Media');
const Genero = require('../models/Genero');
const Director = require('../models/Director');
const Productora = require('../models/Productora');
const Tipo = require('../models/Tipo');

const router = Router();

// Solo estos campos se aceptan del body (así nadie puede enviar fechaCreacion, por ejemplo)
const CAMPOS = ['serial', 'titulo', 'sinopsis', 'url', 'imagenPortada', 'anioEstreno',
  'genero', 'director', 'productora', 'tipo'];

// Qué se muestra de cada relación al consultar (en lugar del simple _id)
const poblar = [
  { path: 'genero', select: 'nombre estado' },
  { path: 'director', select: 'nombres estado' },
  { path: 'productora', select: 'nombre estado' },
  { path: 'tipo', select: 'nombre' },
];

// Regla del caso: género, director y productora deben estar Activos; el tipo solo debe existir
const REFERENCIAS = [
  { campo: 'genero', Modelo: Genero, etiqueta: 'El género', exigeActivo: true },
  { campo: 'director', Modelo: Director, etiqueta: 'El director', exigeActivo: true },
  { campo: 'productora', Modelo: Productora, etiqueta: 'La productora', exigeActivo: true },
  { campo: 'tipo', Modelo: Tipo, etiqueta: 'El tipo', exigeActivo: false },
];

const tomarCampos = (body) =>
  Object.fromEntries(CAMPOS.filter((c) => body[c] !== undefined).map((c) => [c, body[c]]));

// Devuelve un mensaje de error si alguna relación enviada no sirve, o null si todo está bien
async function validarReferencias(datos) {
  for (const { campo, Modelo, etiqueta, exigeActivo } of REFERENCIAS) {
    if (datos[campo] === undefined) continue;
    if (!isValidObjectId(datos[campo])) return `${etiqueta} enviado no tiene un ID válido`;
    const doc = await Modelo.findById(datos[campo]);
    if (!doc) return `${etiqueta} indicado no existe`;
    if (exigeActivo && doc.estado !== 'Activo') return `${etiqueta} indicado está inactivo`;
  }
  return null;
}

// GET /api/medias  (filtros opcionales: ?genero=ID&director=ID&productora=ID&tipo=ID)
router.get('/', async (req, res) => {
  const filtro = {};
  for (const c of ['genero', 'director', 'productora', 'tipo']) {
    if (req.query[c]) filtro[c] = req.query[c];
  }
  res.json(await Media.find(filtro).populate(poblar).sort({ fechaCreacion: -1 }));
});

// GET /api/medias/:id
router.get('/:id', async (req, res) => {
  const media = await Media.findById(req.params.id).populate(poblar);
  if (!media) return res.status(404).json({ mensaje: 'Media no encontrada' });
  res.json(media);
});

// POST /api/medias
router.post('/', async (req, res) => {
  const datos = tomarCampos(req.body);
  const error = await validarReferencias(datos);
  if (error) return res.status(400).json({ mensaje: error });
  const media = await Media.create(datos);
  res.status(201).json(await media.populate(poblar));
});

// PUT /api/medias/:id  (solo se validan las relaciones que vengan en el body)
router.put('/:id', async (req, res) => {
  const datos = tomarCampos(req.body);
  const error = await validarReferencias(datos);
  if (error) return res.status(400).json({ mensaje: error });
  const media = await Media.findByIdAndUpdate(req.params.id, datos, {
    new: true,
    runValidators: true,
  }).populate(poblar);
  if (!media) return res.status(404).json({ mensaje: 'Media no encontrada' });
  res.json(media);
});

// DELETE /api/medias/:id
router.delete('/:id', async (req, res) => {
  const media = await Media.findByIdAndDelete(req.params.id);
  if (!media) return res.status(404).json({ mensaje: 'Media no encontrada' });
  res.json({ mensaje: 'Media eliminada', media });
});

module.exports = router;
