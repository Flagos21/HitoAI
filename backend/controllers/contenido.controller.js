const ContenidoService = require('../services/contenido.service');

exports.obtenerPorAsignatura = async (req, res) => {
  const id = req.params.id;
  const data = await ContenidoService.obtenerPorAsignatura(id);
  res.json(data);
};

exports.crear = async (req, res) => {
  try {
    await ContenidoService.crear(req.body);
    res.status(201).json({ message: 'Contenido creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear contenido' });
  }
};

exports.actualizar = async (req, res) => {
  try {
    await ContenidoService.actualizar(req.params.id, req.body);
    res.json({ message: 'Contenido actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar contenido' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    await ContenidoService.eliminar(req.params.id);
    res.json({ message: 'Contenido eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar contenido' });
  }
};
