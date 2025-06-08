const ReporteService = require('../services/reporte.service');

exports.generarReporte = async (req, res) => {
  const { asignaturaId } = req.params;
  try {
    const buffer = await ReporteService.generarReporte(asignaturaId);
    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Informe-${asignaturaId}-${date}.pdf`);
    return res.send(buffer);
  } catch (err) {
    console.error('Error al generar reporte:', err);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};
