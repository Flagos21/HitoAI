const CompetenciaService = require('../services/competencia.service');

exports.getAllCompetencias = async (req, res) => {
  const competencias = await CompetenciaService.getAll();
  res.json(competencias);
};

exports.getCompetenciaById = async (req, res) => {
  const competencia = await CompetenciaService.getById(req.params.id);
  res.json(competencia);
};

exports.crearCompetencia = async (req, res) => {
  const { ID_Competencia, Nombre, Tipo } = req.body;
  await CompetenciaService.crear({ ID_Competencia, Nombre, Tipo });
  res.status(201).json({ message: 'Competencia creada con éxito' });
};

exports.actualizarCompetencia = async (req, res) => {
  const { Nombre, Tipo } = req.body;
  await CompetenciaService.actualizar(req.params.id, { Nombre, Tipo });
  res.json({ message: 'Competencia actualizada' });
};

exports.eliminarCompetencia = async (req, res) => {
  await CompetenciaService.eliminar(req.params.id);
  res.json({ message: 'Competencia eliminada' });
};
