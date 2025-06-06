const InscripcionService = require('../services/inscripcion.service');

exports.crearMasivo = async (req, res) => {
  const { inscripciones } = req.body;

  try {
    for (const insc of inscripciones) {
      const yaExiste = await InscripcionService.existe(insc.asignatura_ID_Asignatura, insc.estudiante_ID_Estudiante);
      if (!yaExiste) {
        await InscripcionService.crear(insc);
      }
    }

    res.status(201).json({ message: 'Inscripciones registradas correctamente' });
  } catch (error) {
    console.error('Error al inscribir:', error);
    res.status(500).json({ message: 'Error al registrar inscripciones' });
  }
};

exports.obtenerPorAsignatura = async (req, res) => {
  const id = req.params.id;
  const data = await InscripcionService.obtenerPorAsignatura(id);
  res.json(data);
};

exports.eliminar = async (req, res) => {
  const { asignatura, estudiante } = req.query;
  await InscripcionService.eliminar(asignatura, estudiante);
  res.json({ message: 'Inscripción eliminada' });
};
