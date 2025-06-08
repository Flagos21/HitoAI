const InformeService = require('../services/informe.service');

exports.generar = async (req, res) => {
  const { asignaturaId } = req.params;
  try {
    const { pdf, docx, nombre, nombreDocx } = await InformeService.generarInforme(asignaturaId);
    const zip = require('jszip')();
    zip.file(nombre, pdf);
    zip.file(nombreDocx, docx);
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=Informe-${asignaturaId}.zip`);
    return res.send(buffer);
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
