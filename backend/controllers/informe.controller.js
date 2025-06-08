const InformeService = require('../services/informe.service');

exports.generar = async (req, res) => {
  const { asignaturaId } = req.params;
  try {
  const { pdf, docx, nombre, nombreDocx } = await InformeService.generarInforme(asignaturaId);
  const zip = require('jszip')();
  if (pdf && pdf.length) {
    zip.file(nombre, pdf);
  } else {
    console.warn('PDF not included in ZIP: generation failed or dependency missing');
  }
  if (docx && docx.length) {
    zip.file(nombreDocx, docx);
  } else {
    console.warn('DOCX not included in ZIP: generation failed or dependency missing');
  }
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=Informe-${asignaturaId}.zip`);
    return res.send(buffer);
  } catch (err) {
    console.error('Error al generar informe', err);
    res.status(500).json({ message: 'Error al generar informe' });
  }
};

exports.pdf = async (req, res) => {
  const { asignaturaId } = req.params;
  try {
    const { pdf, nombre } = await InformeService.generarInforme(asignaturaId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombre}`);
    return res.send(pdf);
  } catch (err) {
    console.error('Error al generar PDF', err);
    res.status(500).json({ message: 'Error al generar informe' });
  }
};

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
