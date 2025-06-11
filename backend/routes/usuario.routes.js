const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuario.controller');

router.post('/crear', controller.crearUsuario);
router.post('/login', controller.login);
router.get('/jefes', controller.getJefesCarrera);
router.get('/profesores', controller.getProfesores);
router.get('/todos', controller.getTodos);
router.put('/clave/:id', controller.actualizarClave);
router.put('/rol/:id', controller.actualizarRol);


module.exports = router;
