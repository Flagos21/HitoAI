const InformeService = require('../services/informe.service');

exports.generar = async (req, res) => {
  const { asignaturaId } = req.params;
  try {
    const { pdf, nombre } = await InformeService.generarInforme(asignaturaId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombre}`);
    return res.send(pdf);
  } catch (err) {
    console.error('Error al generar informe', err);
    res.status(500).json({ message: 'Error al generar informe' });
  }
};

exports.asignaturasDelJefe = async (req, res) => {
  const idUsuario = req.params.idUsuario;
  try {
    const asignaturas = await require('../services/asignatura.service').obtenerPorCarreraDelJefe(idUsuario);
    res.json(asignaturas);
  } catch (err) {
    console.error('Error al obtener asignaturas', err);
    res.status(500).json({ message: 'Error al obtener asignaturas' });
  }
};
