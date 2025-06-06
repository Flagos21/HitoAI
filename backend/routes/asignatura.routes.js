const express = require('express');
const router = express.Router();
const controller = require('../controllers/asignatura.controller');

router.get('/', controller.obtenerTodas);
router.get('/por-jefe/:rut', controller.obtenerPorCarreraDelJefe);
router.get('/por-profesor/:rut', controller.obtenerPorProfesor);
router.post('/crear', controller.crear);
router.put('/actualizar/:id', controller.actualizar);
router.delete('/eliminar/:id', controller.eliminar);

module.exports = router;
