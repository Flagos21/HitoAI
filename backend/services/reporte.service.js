const connection = require('../db/connection');
const fs = require('fs');
const path = require('path');
const { crearIntroduccion, crearConclusion } = require('../utils/openai');
const { generarPDF, generarDOCX } = require('../utils/reportGenerator');

async function obtenerDatos(asignaturaId) {
  return new Promise(resolve => {
    const sql = `
      SELECT a.*, c.Nombre AS Carrera
      FROM asignatura a
      JOIN carrera c ON a.carrera_ID_Carrera = c.ID_Carrera
      WHERE a.ID_Asignatura = ?`;
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
  const introduccion = await crearIntroduccion(datos.Nombre, datos.Carrera);
  const conclusion = await crearConclusion(datos.Nombre);
  const contenido = { datos, introduccion, conclusion };
  let pdf = Buffer.from('');
  try {
    pdf = await generarPDF(contenido);
  } catch (err) {
    console.warn('PDF generation skipped:', err.message);
  }

  let docx = Buffer.from('');
  try {
    docx = await generarDOCX(contenido);
  } catch (err) {
    console.warn('DOCX generation skipped:', err.message);
  }


  const base = `Informe-${datos.ID_Asignatura}-${new Date().toISOString().split('T')[0]}`;
  const outDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  if (pdf.length) fs.writeFileSync(path.join(outDir, `${base}.pdf`), pdf);

  if (docx.length) fs.writeFileSync(path.join(outDir, `${base}.docx`), docx);

  return pdf;
};

// Distribución de puntajes por instancia e indicador
exports.obtenerDistribucionPorInstancia = asignaturaId => {
  const sql = `
    SELECT
      ev.N_Instancia AS instancia,
      i.ID_Indicador AS indicadorId,
      i.Descripcion AS indicador,
      c.Nombre AS criterio,
      c.R_Min AS rMin,
      c.R_Max AS rMax,
      SUM(a.Obtenido BETWEEN c.R_Min AND c.R_Max) AS cantidad,
      COUNT(a.ID_Aplicacion) AS total
    FROM evaluacion ev
    JOIN aplicacion a ON ev.ID_Evaluacion = a.evaluacion_ID_Evaluacion
    JOIN inscripcion ins ON ins.ID_Inscripcion = a.inscripcion_ID_Inscripcion
    JOIN indicador i ON i.ID_Indicador = a.indicador_ID_Indicador
    JOIN criterio c ON c.indicador_ID_Indicador = i.ID_Indicador
    WHERE ins.asignatura_ID_Asignatura = ?
    GROUP BY ev.N_Instancia, i.ID_Indicador, c.ID_Criterio
    ORDER BY ev.N_Instancia, i.ID_Indicador, c.R_Max DESC
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, [asignaturaId], (err, rows) => {
      if (err) return reject(err);

      const instancias = {};
      for (const r of rows) {
        if (!instancias[r.instancia]) instancias[r.instancia] = {};
        if (!instancias[r.instancia][r.indicadorId]) {
          instancias[r.instancia][r.indicadorId] = {
            indicador: r.indicador,
            criterios: [],
            total: r.total,
          };
        }
        const porcentaje = r.total ? Math.round((r.cantidad / r.total) * 100) : 0;
        instancias[r.instancia][r.indicadorId].criterios.push({
          nombre: r.criterio,
          rMin: r.rMin,
          rMax: r.rMax,
          cantidad: r.cantidad,
          porcentaje,
        });
      }

      const resultado = {};
      for (const [instancia, inds] of Object.entries(instancias)) {
        resultado[instancia] = Object.values(inds);
      }
      resolve(resultado);
    });
  });
};
