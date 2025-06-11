const express = require('express');
const router = express.Router();
const controller = require('../controllers/contenido.controller');

router.get('/por-asignatura/:id', controller.obtenerPorAsignatura);
router.post('/crear', controller.crear);
router.put('/actualizar/:id', controller.actualizar);
router.delete('/eliminar/:id', controller.eliminar);

module.exports = router;
