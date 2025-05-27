const RaService = require('../services/ra.service');

exports.getAllRA = async (req, res) => {
  const ra = await RaService.getAll();
  res.json(ra);
};

exports.getRAById = async (req, res) => {
  const ra = await RaService.getById(req.params.id);
  res.json(ra);
};

exports.crearRA = async (req, res) => {
  const { ID_RA, Nombre, competencias } = req.body;

  if (!ID_RA || !Nombre || !Array.isArray(competencias) || competencias.length === 0) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    await RaService.crearRAConCompetencias({ ID_RA, Nombre }, competencias);
    res.status(201).json({ message: 'Resultado de Aprendizaje creado con éxito' });
  } catch (error) {
    console.error('Error al crear RA:', error);
res.status(500).json({ message: 'Error al crear RA', error: error.message });

  }
};

exports.actualizarRA = async (req, res) => {
  const { Nombre, competencias } = req.body;
  const ID_RA = req.params.id;

  if (!Nombre || !Array.isArray(competencias) || competencias.length === 0) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    await RaService.actualizarRAConCompetencias(ID_RA, { Nombre }, competencias);
    res.json({ message: 'Resultado de Aprendizaje actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar RA', error });
  }
};

exports.eliminarRA = async (req, res) => {
  try {
    await RaService.eliminar(req.params.id);
    res.json({ message: 'Resultado de Aprendizaje eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar RA', error });
  }
};
