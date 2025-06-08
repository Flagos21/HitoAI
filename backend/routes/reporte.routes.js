const { Router } = require('express');
const router = Router();
const ReporteController = require('../controllers/reporte.controller');

router.get('/:asignaturaId', ReporteController.generarReporte);

module.exports = router;
