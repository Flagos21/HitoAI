const InformeService = require('../services/informe.service');


exports.word = async (req, res) => {
  const { asignaturaId } = req.params;
  try {
    const { docx, nombreDocx } = await InformeService.generarInforme(asignaturaId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${nombreDocx}`);
    return res.send(docx);
  } catch (err) {
    console.error('Error al generar DOCX', err);
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
