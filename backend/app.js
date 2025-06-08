const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/usuario', require('./routes/usuario.routes'));
app.use('/api/carrera', require('./routes/carrera.routes'));
app.use('/api/competencia', require('./routes/competencia.routes'));
app.use('/api/ra', require('./routes/ra.routes'));
app.use('/api/asignatura', require('./routes/asignatura.routes'));
app.use('/api/estudiante', require('./routes/estudiante.routes'));
app.use('/api/inscripcion', require('./routes/inscripcion.routes'));
app.use('/api/indicador', require('./routes/indicador.routes'));
app.use('/api/contenido', require('./routes/contenido.routes'));
app.use('/api/aplicacion', require('./routes/aplicacion.routes'));
app.use('/api/evaluacion', require('./routes/evaluacion.routes'));
app.use('/api/rol', require('./routes/rol.routes'));
app.use('/api/mensaje', require('./routes/mensaje.routes'));
app.use('/api/reporte', require('./routes/reporte.routes'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
