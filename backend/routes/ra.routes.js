const express = require('express');
const router = express.Router();
const controller = require('../controllers/ra.controller');

router.get('/', controller.getAllRA);
router.get('/:id', controller.getRAById);
router.post('/crear', controller.crearRA);
router.put('/actualizar/:id', controller.actualizarRA);
router.delete('/eliminar/:id', controller.eliminarRA);

module.exports = router;
