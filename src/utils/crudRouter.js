const { Router } = require('express');

// Router reutilizable para los catálogos. No incluye DELETE porque el caso
// solo pide "registrar y editar"; se desactivan con estado = Inactivo.
module.exports = (Model) => {
  const router = Router();

  // GET /  -> lista (opcional: ?estado=Activo)
  router.get('/', async (req, res) => {
    const filtro = req.query.estado ? { estado: req.query.estado } : {};
    res.json(await Model.find(filtro).sort({ fechaCreacion: -1 }));
  });

  // GET /:id -> uno
  router.get('/:id', async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json(doc);
  });

  // POST / -> crear
  router.post('/', async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json(doc);
  });

  // PUT /:id -> editar
  router.put('/:id', async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json(doc);
  });

  return router;
};
