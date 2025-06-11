const ReporteService = require('../services/reporte.service');

exports.generarReporte = async (req, res) => {
  const { asignaturaId } = req.params;
  try {
    const { docx, nombreDocx } = await ReporteService.generarReporte(asignaturaId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${nombreDocx}`);
    return res.send(docx);
  } catch (err) {
    console.error('Error al generar reporte:', err);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

exports.obtenerDistribucion = async (req, res) => {
  const { asignaturaId } = req.params;
  try {
    const data = await ReporteService.obtenerDistribucionPorInstancia(asignaturaId);
    res.json(data);
  } catch (err) {
    console.error('Error al obtener distribución:', err);
    res.status(500).json({ message: 'Error al obtener distribución' });
  }
};
