const express = require('express');
const router = express.Router();
const controller = require('../controllers/inscripcion.controller');

// Crear inscripciones masivas
router.post('/crear-masivo', controller.crearMasivo);

// Obtener estudiantes inscritos por asignatura
router.get('/por-asignatura/:id', controller.obtenerPorAsignatura);

// Eliminar inscripción (requiere query params: ?asignatura=...&estudiante=...)
router.delete('/eliminar', controller.eliminar);

module.exports = router;
