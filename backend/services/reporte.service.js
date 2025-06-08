const connection = require('../db/connection');

const fs = require('fs');
const path = require('path');
const { crearIntroduccion, crearConclusion } = require('../utils/openai');
const { generarPDF, generarDOCX } = require('../utils/reportGenerator');

async function obtenerDatos(asignaturaId) {
  return new Promise(resolve => {
    const sql = `SELECT * FROM asignatura WHERE ID_Asignatura = ?`;
    connection.query(sql, [asignaturaId], (err, rows) => {
      if (err || !rows.length) {
        console.error('Error obteniendo asignatura', err);
        return resolve({ ID_Asignatura: asignaturaId, Nombre: `Asignatura ${asignaturaId}` });
      }
      resolve(rows[0]);
    });
  });
}

exports.generarReporte = async asignaturaId => {
  const datos = await obtenerDatos(asignaturaId);
  const introduccion = await crearIntroduccion(datos.Nombre);
  const conclusion = await crearConclusion(datos.Nombre);
  const contenido = { datos, introduccion, conclusion };
  const pdf = await generarPDF(contenido);
  const docx = await generarDOCX(contenido);

  const base = `Informe-${datos.ID_Asignatura}-${new Date().toISOString().split('T')[0]}`;
  const outDir = path.join(__dirname, '..', 'uploads');
  fs.writeFileSync(path.join(outDir, `${base}.pdf`), pdf);
  fs.writeFileSync(path.join(outDir, `${base}.docx`), docx);
  return pdf;
};
