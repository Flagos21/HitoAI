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
        ROUND(
          SUM(a.Obtenido > (
            SELECT AVG(Obtenido)
            FROM aplicacion
            WHERE indicador_ID_Indicador = i.ID_Indicador
              AND evaluacion_ID_Evaluacion = ev.ID_Evaluacion
          )) / COUNT(*) * 100,
          1
        ) AS porcentaje,
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
        ROUND(SUM(a.Obtenido) / COUNT(DISTINCT ins.ID_Inscripcion), 1) AS puntaje_promedio,
        ROUND((SUM(a.Obtenido) / COUNT(DISTINCT ins.ID_Inscripcion)) / SUM(i.Puntaje_Max) * 100, 1) AS cumplimiento
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
  const sql = `
    SELECT a.*, c.Nombre AS Carrera
    FROM asignatura a
    JOIN carrera c ON a.carrera_ID_Carrera = c.ID_Carrera
    WHERE a.ID_Asignatura = ?`;
  const rows = await query(sql, [id]);
  return (
    rows[0] || {
      ID_Asignatura: id,
      Nombre: `Asignatura ${id}`,
      Carrera: 'Carrera Desconocida',
    }
  );
}

async function obtenerRubricas(asignaturaId) {
  const sql = `
      SELECT
        ev.ID_Evaluacion AS evaluacionId,
        ev.N_Instancia AS instancia,
        i.ID_Indicador AS indicadorId,
        c.Nombre AS criterio,
        c.R_Min AS rMin,
        c.R_Max AS rMax,
        SUM(a.Obtenido BETWEEN c.R_Min AND c.R_Max) AS cantidad,
        COUNT(a.ID_Aplicacion) AS total
      FROM criterio c
      JOIN indicador i ON i.ID_Indicador = c.indicador_ID_Indicador
      JOIN aplicacion a ON a.indicador_ID_Indicador = i.ID_Indicador
      JOIN evaluacion ev ON ev.ID_Evaluacion = a.evaluacion_ID_Evaluacion
      JOIN inscripcion ins ON ins.ID_Inscripcion = a.inscripcion_ID_Inscripcion
      WHERE ins.asignatura_ID_Asignatura = ?
      GROUP BY ev.ID_Evaluacion, i.ID_Indicador, c.ID_Criterio;`;
  return query(sql, [asignaturaId]);
}

exports.generarInforme = async asignaturaId => {
  const datos = await obtenerDatosIndicadores(asignaturaId);
  const rubricas = await obtenerRubricas(asignaturaId);
  const competencias = await obtenerCompetencias(asignaturaId);
  const asignatura = await obtenerAsignatura(asignaturaId);

  const introduccion = await crearIntroduccion(asignatura.Nombre, asignatura.Carrera);

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

  // Mapear distribución de criterios por indicador
  const rubricaMap = {};
  rubricas.forEach(r => {
    const key = `${r.evaluacionId}-${r.indicadorId}`;
    if (!rubricaMap[key]) rubricaMap[key] = [];
    rubricaMap[key].push({
      nombre: r.criterio,
      rMin: r.rMin,
      rMax: r.rMax,
      cantidad: r.cantidad,
      porcentaje: Math.round((r.cantidad / r.total) * 1000) / 10,
    });
  });

  // Agrupar por instancia
  const instancias = {};
  const totalNiveles = {};
  datos.forEach((d, idx) => {
    const key = `${d.evaluacionId}-${d.indicadorId}`;
    d.niveles = rubricaMap[key] || [];
    d.niveles.forEach(n => {
      totalNiveles[n.nombre] = (totalNiveles[n.nombre] || 0) + n.cantidad;
    });

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

  // totalNiveles ya calculado al agregar rubricas

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
    Object.keys(totalNiveles),
    Object.values(totalNiveles),
    'niveles.png'
  );

  const compPath = await generarGraficoLineas(
    competencias.map(c => c.ID_Competencia),
    competencias.map(c => c.cumplimiento),
    'competencias.png'
  );

  const graficosInstancias = {};
  for (const [num, inst] of Object.entries(instancias)) {
    graficosInstancias[num] = await generarGraficoBarras(
      inst.criterios.map(c => c.indicador),
      inst.criterios.map(c => c.porcentaje),
      `instancia_${num}.png`
    );
  }

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
    graficos: { barrasPath, tortaPath, compPath, ...graficosInstancias },
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
  const archivosGraficos = [barrasPath, tortaPath, compPath, ...Object.values(graficosInstancias)];
  archivosGraficos.forEach(p => {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });
  return { pdf, docx, nombre: `${base}.pdf`, nombreDocx: `${base}.docx` };
};
