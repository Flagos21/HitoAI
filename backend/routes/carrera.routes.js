const express = require('express');
const router = express.Router();
const controller = require('../controllers/carrera.controller');

router.get('/', controller.getAllCarreras);
router.post('/crear', controller.crearCarrera);
router.put('/actualizar/:id', controller.actualizarCarrera);
router.delete('/eliminar/:id', controller.eliminarCarrera); // ← ya coincide con el nombre correcto

module.exports = router;
