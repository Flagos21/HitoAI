const { Router } = require('express');
const router = Router();
const InformeController = require('../controllers/informe.controller');

router.get('/jefe/:idUsuario', InformeController.asignaturasDelJefe);
router.get('/:asignaturaId', InformeController.generar);
router.get('/:asignaturaId/pdf', InformeController.pdf);
router.get('/:asignaturaId/word', InformeController.word);

module.exports = router;
