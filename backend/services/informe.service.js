const connection = require('../db/connection');
const fs = require('fs');
const path = require('path');
let quickchart;
try {
  quickchart = require('quickchart-js');
} catch {
  quickchart = require('../utils/minimalChart');
  console.warn('quickchart-js package not found, using minimalChart');
}
const {
  crearIntroduccion,
  analizarCriterio,
  conclusionCompetencias,
  recomendacionesTemas,
} = require('../utils/openai');
const { generarPDFCompleto, generarDOCXCompleto } = require('../utils/reportGenerator');

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function obtenerDatosIndicadores(asignaturaId) {
  const sql = `
      SELECT 
        ev.Nombre AS evaluacion,
        i.Descripcion AS indicador,
        MAX(a.Obtenido) AS maximo,
        MIN(a.Obtenido) AS minimo,
        ROUND(AVG(a.Obtenido), 1) AS promedio,
        ROUND(SUM(a.Obtenido > (SELECT AVG(Obtenido) FROM aplicacion WHERE indicador_ID_Indicador = i.ID_Indicador AND evaluacion_ID_Evaluacion = ev.ID_Evaluacion)) / COUNT(*) * 100, 1) AS porcentaje,
        c.ID_Competencia AS competencia
      FROM aplicacion a
      JOIN evaluacion ev ON ev.ID_Evaluacion = a.evaluacion_ID_Evaluacion
      JOIN indicador i ON i.ID_Indicador = a.indicador_ID_Indicador
      JOIN ra r ON r.ID_RA = i.ra_ID_RA
      JOIN ra_competencia rc ON rc.ra_ID_RA = r.ID_RA
      JOIN competencia c ON c.ID_Competencia = rc.competencia_ID_Competencia
      JOIN inscripcion ins ON ins.ID_Inscripcion = a.inscripcion_ID_Inscripcion
      WHERE ins.asignatura_ID_Asignatura = ?
      GROUP BY ev.Nombre, i.ID_Indicador;`;
  return query(sql, [asignaturaId]);
}

async function obtenerCompetencias(asignaturaId) {
  const sql = `
      SELECT 
        c.ID_Competencia,
        SUM(i.Puntaje_Max) AS puntaje_ideal,
        ROUND(SUM(a.Obtenido), 1) AS puntaje_total,
        ROUND(SUM(a.Obtenido) / SUM(i.Puntaje_Max) * 100, 1) AS cumplimiento
      FROM aplicacion a
      JOIN indicador i ON i.ID_Indicador = a.indicador_ID_Indicador
      JOIN ra r ON r.ID_RA = i.ra_ID_RA
      JOIN ra_competencia rc ON rc.ra_ID_RA = r.ID_RA
      JOIN competencia c ON c.ID_Competencia = rc.competencia_ID_Competencia
      JOIN inscripcion ins ON ins.ID_Inscripcion = a.inscripcion_ID_Inscripcion
      WHERE ins.asignatura_ID_Asignatura = ?
      GROUP BY c.ID_Competencia;`;
  return query(sql, [asignaturaId]);
}

async function obtenerAsignatura(id) {
  const rows = await query('SELECT * FROM asignatura WHERE ID_Asignatura = ?', [id]);
  return rows[0] || { ID_Asignatura: id, Nombre: `Asignatura ${id}` };
}

exports.generarInforme = async asignaturaId => {
  const datos = await obtenerDatosIndicadores(asignaturaId);
  const competencias = await obtenerCompetencias(asignaturaId);
  const asignatura = await obtenerAsignatura(asignaturaId);

  const introduccion = await crearIntroduccion(asignatura.Nombre);

  const analisis = await Promise.all(
    datos.map(d =>
      analizarCriterio({
        indicador: d.indicador,
        competencia: d.competencia,
        evaluacion: d.evaluacion,
        max: d.maximo,
        min: d.minimo,
        promedio: d.promedio,
        porcentaje: d.porcentaje,
      })
    )
  );

  const resumenComp = competencias.map(c => `${c.ID_Competencia}: ${c.cumplimiento}%`).join(', ');
  const conclusion = await conclusionCompetencias(resumenComp);
  const recomendaciones = await recomendacionesTemas('temas de la asignatura');

  const chart = new quickchart();
  chart.setConfig({
    type: 'bar',
    data: {
      labels: datos.map(d => d.indicador),
      datasets: [{ label: '% sobre promedio', data: datos.map(d => d.porcentaje) }],
    },
  });

  const chartImage = await chart.toBinary();
  const contenido = {
    asignatura,
    introduccion,
    datos,
    analisis,
    competencias,
    conclusion,
    recomendaciones,

    chartImage,
  };

  const pdf = await generarPDFCompleto(contenido);
  const docx = await generarDOCXCompleto(contenido);

  const base = `Informe-${asignatura.Nombre}-${new Date().toISOString().split('T')[0]}`.replace(/\s+/g, '_');
  const outDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  fs.writeFileSync(path.join(outDir, `${base}.pdf`), pdf);
  fs.writeFileSync(path.join(outDir, `${base}.docx`), docx);
  return { pdf, nombre: `${base}.pdf` };
};
