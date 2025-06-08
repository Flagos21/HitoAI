const connection = require('../db/connection');
const fs = require('fs');
const path = require('path');
const {
  generarGraficoBarras,
  generarGraficoTorta,
  generarGraficoLineas,
} = require('../utils/grafico');
const {
  crearIntroduccion,
  analizarCriterio,
  conclusionCompetencias,
  conclusionCriterios,
  recomendacionesTemas,
  recomendacionesCompetencia,
  recomendacionesGenerales,
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
        ev.N_Instancia AS instancia,
        i.Descripcion AS indicador,
        i.Puntaje_Max AS puntajeMax,
        MAX(a.Obtenido) AS maximo,
        MIN(a.Obtenido) AS minimo,
        ROUND(AVG(a.Obtenido), 1) AS promedio,
        ROUND(SUM(a.Obtenido > (SELECT AVG(Obtenido) FROM aplicacion WHERE indicador_ID_Indicador = i.ID_Indicador AND evaluacion_ID_Evaluacion = ev.ID_Evaluacion)) / COUNT(*) * 100, 1) AS porcentaje,
        SUM(a.Obtenido >= i.Puntaje_Max * 0.7) AS excelente,
        SUM(a.Obtenido >= i.Puntaje_Max * 0.4 AND a.Obtenido < i.Puntaje_Max * 0.7) AS aceptable,
        SUM(a.Obtenido < i.Puntaje_Max * 0.4) AS insuficiente,
        COUNT(*) AS total,
        c.ID_Competencia AS competencia
      FROM aplicacion a
      JOIN evaluacion ev ON ev.ID_Evaluacion = a.evaluacion_ID_Evaluacion
      JOIN indicador i ON i.ID_Indicador = a.indicador_ID_Indicador
      JOIN ra r ON r.ID_RA = i.ra_ID_RA
      JOIN ra_competencia rc ON rc.ra_ID_RA = r.ID_RA
      JOIN competencia c ON c.ID_Competencia = rc.competencia_ID_Competencia
      JOIN inscripcion ins ON ins.ID_Inscripcion = a.inscripcion_ID_Inscripcion
      WHERE ins.asignatura_ID_Asignatura = ?
      GROUP BY ev.ID_Evaluacion, i.ID_Indicador;`;
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

  // Agrupar por instancia
  const instancias = {};
  datos.forEach((d, idx) => {
    if (!instancias[d.instancia]) {
      instancias[d.instancia] = {
        nombre: d.evaluacion,
        criterios: [],
        analisis: [],
      };
    }
    instancias[d.instancia].criterios.push(d);
    instancias[d.instancia].analisis.push(analisis[idx]);
  });

  for (const i of Object.values(instancias)) {
    const resumen = i.criterios.map(c => c.indicador).join(', ');
    i.conclusion = await conclusionCriterios(resumen);
  }

  const totalNiveles = { excelente: 0, aceptable: 0, insuficiente: 0 };
  datos.forEach(d => {
    totalNiveles.excelente += d.excelente;
    totalNiveles.aceptable += d.aceptable;
    totalNiveles.insuficiente += d.insuficiente;
  });

  const resumenComp = competencias.map(c => `${c.ID_Competencia}: ${c.cumplimiento}%`).join(', ');
  const conclusion = await conclusionCompetencias(resumenComp);

  const recomendacionesComp = await Promise.all(
    competencias.map(c => recomendacionesCompetencia(c.ID_Competencia, c.cumplimiento))
  );

  const recomendaciones = await recomendacionesGenerales('temas de la asignatura');

  const barrasPath = await generarGraficoBarras(
    datos.map(d => d.indicador),
    datos.map(d => d.porcentaje),
    'barras.png'
  );

  const tortaPath = await generarGraficoTorta(
    ['Excelente', 'Aceptable', 'Insuficiente'],
    [totalNiveles.excelente, totalNiveles.aceptable, totalNiveles.insuficiente],
    'niveles.png'
  );

  const compPath = await generarGraficoLineas(
    competencias.map(c => c.ID_Competencia),
    competencias.map(c => c.cumplimiento),
    'competencias.png'
  );

  const contenido = {
    asignatura,
    introduccion,
    instancias,
    datos,
    analisis,
    competencias,
    recomendacionesComp,
    conclusion,
    recomendaciones,
    graficos: { barrasPath, tortaPath, compPath },
  };

  let pdf = Buffer.from('');
  try {
    pdf = await generarPDFCompleto(contenido);
  } catch (err) {
    console.warn('PDF generation skipped:', err.message);
  }

  let docx = Buffer.from('');
  try {
    docx = await generarDOCXCompleto(contenido);
  } catch (err) {
    console.warn('DOCX generation skipped:', err.message);
  }


  const base = `Informe-${asignatura.Nombre}-${new Date().toISOString().split('T')[0]}`.replace(/\s+/g, '_');
  const outDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  if (pdf.length) fs.writeFileSync(path.join(outDir, `${base}.pdf`), pdf);

  if (docx.length) fs.writeFileSync(path.join(outDir, `${base}.docx`), docx);
  [barrasPath, tortaPath, compPath].forEach(p => {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });
  return { pdf, docx, nombre: `${base}.pdf`, nombreDocx: `${base}.docx` };
};
