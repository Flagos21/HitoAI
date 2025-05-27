const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuario.controller');

router.post('/crear', controller.crearUsuario);
router.post('/login', controller.login);
router.get('/jefes', controller.getJefesCarrera);
router.get('/profesores', controller.getProfesores);


module.exports = router;
