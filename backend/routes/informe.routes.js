const { Router } = require('express');
const router = Router();
const InformeController = require('../controllers/informe.controller');

router.get('/jefe/:idUsuario', InformeController.asignaturasDelJefe);
router.get('/:asignaturaId/word', InformeController.word);

module.exports = router;
