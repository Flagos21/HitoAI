const connection = require('../db/connection');
const { crearIntroduccion, crearConclusion } = require('../utils/openai');
const { generarPDF } = require('../utils/reportGenerator');

async function obtenerDatos(asignaturaId) {
  // Placeholder que obtiene datos básicos para el informe
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM asignatura WHERE ID_Asignatura = ?`;
    connection.query(sql, [asignaturaId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
}

exports.generarReporte = async asignaturaId => {
  const datos = await obtenerDatos(asignaturaId);
  const introduccion = await crearIntroduccion(datos.Nombre);
  const conclusion = await crearConclusion(datos.Nombre);
  const pdf = await generarPDF({ datos, introduccion, conclusion });
  return pdf;
};
