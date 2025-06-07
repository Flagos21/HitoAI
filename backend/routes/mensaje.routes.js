const express = require('express');
const router = express.Router();
const controller = require('../controllers/mensaje.controller');

router.post('/solicitar-clave', controller.crearSolicitud);
router.get('/solicitudes', controller.getSolicitudes);

module.exports = router;
