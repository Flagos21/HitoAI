const MensajeService = require('../services/mensaje.service');

exports.crearSolicitud = (req, res) => {
  const { rut } = req.body;
  if (!rut) return res.status(400).json({ message: 'Rut requerido' });
  try {
    MensajeService.crearSolicitud(rut);
    res.json({ message: 'Solicitud registrada' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al guardar solicitud' });
  }
};

exports.getSolicitudes = (req, res) => {
  try {
    const data = MensajeService.getSolicitudes();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
};
