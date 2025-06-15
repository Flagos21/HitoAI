const connection = require('../db/connection');
const fs = require('fs');
const path = require('path');
const {
  generarGraficoBarras,
  generarGraficoLineas,
} = require('../utils/grafico');
const {
  crearIntroduccion,
  analizarCriterio,
  conclusionCompetencias,
  conclusionCriterios,
  conclusionRA,
  recomendacionesTemas,
  recomendacionesCompetencia,
  analisisCompetencia,
  recomendacionesGenerales,
} = require('../utils/openai');
const { generarPDFCompleto, generarDOCXCompleto } = require('../utils/reportGenerator');
const {
  calcularResumenCompetencias,
} = require('../utils/resumenCompetencias');

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function obtenerDatosIndicadores(asignaturaId) {
  const sql = `
      SELECT
        ev.ID_Evaluacion AS evaluacionId,
        ev.N_Instancia AS instancia,
        ev.Nombre AS evaluacion,
        i.ID_Indicador AS indicadorId,
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
        GROUP_CONCAT(DISTINCT rc.competencia_ID_Competencia
          ORDER BY rc.competencia_ID_Competencia SEPARATOR ' + ') AS competencia,
        r.Nombre AS raNombre,
        r.Descripcion AS raDescripcion,
        contenido.Nucleo_Tematico AS contenidoNucleo,
        contenido.Descripcion AS contenidoDescripcion
      FROM aplicacion a
      JOIN evaluacion ev ON ev.ID_Evaluacion = a.evaluacion_ID_Evaluacion
      JOIN indicador i ON i.ID_Indicador = a.indicador_ID_Indicador
      JOIN ra r ON r.ID_RA = i.ra_ID_RA
      LEFT JOIN ra_competencia rc ON rc.ra_ID_RA = r.ID_RA
      LEFT JOIN competencia c ON c.ID_Competencia = rc.competencia_ID_Competencia
      JOIN contenido contenido ON contenido.ID_Contenido = i.contenido_ID_Contenido
      JOIN inscripcion ins ON ins.ID_Inscripcion = a.inscripcion_ID_Inscripcion
      WHERE ins.asignatura_ID_Asignatura = ?
      GROUP BY ev.ID_Evaluacion, i.ID_Indicador;`;
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

async function obtenerPromediosCriterio(asignaturaId) {
  const sql = `
      SELECT
        ev.ID_Evaluacion AS evaluacionId,
        ev.N_Instancia AS instancia,
        i.ID_Indicador AS indicadorId,
        i.Descripcion AS indicador,
        c.Nombre AS criterio,
        c.R_Min AS rMin,
        c.R_Max AS rMax,
        ROUND(AVG(a.Obtenido), 1) AS promedio,
        ROUND(AVG(a.Obtenido) / i.Puntaje_Max * 100, 1) AS porcentaje
      FROM criterio c
      JOIN indicador i ON i.ID_Indicador = c.indicador_ID_Indicador
      JOIN aplicacion a ON a.indicador_ID_Indicador = i.ID_Indicador
      JOIN evaluacion ev ON ev.ID_Evaluacion = a.evaluacion_ID_Evaluacion
      JOIN inscripcion ins ON ins.ID_Inscripcion = a.inscripcion_ID_Inscripcion
      WHERE ins.asignatura_ID_Asignatura = ?
        AND a.Obtenido BETWEEN c.R_Min AND c.R_Max
      GROUP BY ev.ID_Evaluacion, i.ID_Indicador, c.ID_Criterio;`;
  return query(sql, [asignaturaId]);
}

exports.generarInforme = async asignaturaId => {
  const datos = await obtenerDatosIndicadores(asignaturaId);
  const rubricas = await obtenerRubricas(asignaturaId);
  const promedios = await obtenerPromediosCriterio(asignaturaId);
  const competenciasResumen = calcularResumenCompetencias(
    datos.map(d => ({
      puntaje_maximo: d.puntajeMax,
      promedio_obtenido: d.promedio,
      competencias: d.competencia,
    }))
  );
  const competencias = competenciasResumen
    .filter(c => c.competencia !== 'Total')
    .map(c => ({
      ID_Competencia: c.competencia,
      puntaje_ideal: c.puntajeIdeal,
      puntaje_promedio: c.promedio,
      cumplimiento: c.cumplimiento,
    }));
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
        raNombre: d.raNombre,
        raDescripcion: d.raDescripcion,
        contenidoNucleo: d.contenidoNucleo,
        contenidoDescripcion: d.contenidoDescripcion,
        asignaturaNombre: asignatura.Nombre,
        carreraNombre: asignatura.Carrera,
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

  const promedioMap = {};
  promedios.forEach(p => {
    const key = `${p.evaluacionId}-${p.indicadorId}`;
    if (!promedioMap[key]) promedioMap[key] = [];
    promedioMap[key].push({
      nombre: p.criterio,
      rMin: p.rMin,
      rMax: p.rMax,
      promedio: p.promedio,
      porcentaje: p.porcentaje,
    });
  });
  Object.keys(promedioMap).forEach(k => {
    promedioMap[k].sort((a, b) => b.rMax - a.rMax);
  });
  // Ordenar criterios de cada indicador por rango máximo descendente
  Object.keys(rubricaMap).forEach(k => {
    rubricaMap[k].sort((a, b) => b.rMax - a.rMax);
  });

  // Agrupar por instancia
  const instancias = {};
  const totalNiveles = {};
  datos.forEach((d, idx) => {
    const key = `${d.evaluacionId}-${d.indicadorId}`;
    d.niveles = rubricaMap[key] || [];
    d.promedios = promedioMap[key] || [];
    d.niveles.forEach(n => {
      totalNiveles[n.nombre] = (totalNiveles[n.nombre] || 0) + n.cantidad;
    });

    if (!instancias[d.instancia]) {
      instancias[d.instancia] = {
        nombre: d.evaluacion,
        criterios: [],
        analisis: [],
        competencias: {},
        estudiantes: 0,
      };
    }
    if (d.total > instancias[d.instancia].estudiantes) {
      instancias[d.instancia].estudiantes = d.total;
    }
    instancias[d.instancia].criterios.push(d);
    instancias[d.instancia].analisis.push(analisis[idx]);

    const claves = String(d.competencia || '')
      .split(/\s*\+\s*/)
      .filter(Boolean);
    if (!claves.length) claves.push('Desconocida');
    claves.forEach(c => {
      const comp = instancias[d.instancia].competencias[c] || {
        puntajeIdeal: 0,
        promedioSum: 0,
      };
      // Count the full indicator score for each associated competencia
      comp.puntajeIdeal += d.puntajeMax * d.total;
      if (typeof d.promedio === 'number') {
        comp.promedioSum += d.promedio * d.total;
      }
      instancias[d.instancia].competencias[c] = comp;
    });
  });

  for (const i of Object.values(instancias)) {
    const resumen = i.criterios.map(c => c.indicador).join(', ');
    i.conclusion = await conclusionCriterios({
      resumen,
      asignaturaNombre: asignatura.Nombre,
      carreraNombre: asignatura.Carrera,
    });
    i.recomendaciones = [
      await recomendacionesTemas(
        resumen,
        asignatura.Nombre,
        asignatura.Carrera
      ),
    ];

    i.competenciasResumen = [];
    for (const [comp, datos] of Object.entries(i.competencias)) {
      const puntajeIdeal = i.estudiantes
        ? Math.round((datos.puntajeIdeal / i.estudiantes) * 10) / 10
        : 0;
      const promedio = i.estudiantes
        ? Math.round((datos.promedioSum / i.estudiantes) * 10) / 10
        : 0;
      const cumplimiento = puntajeIdeal
        ? Math.round((promedio / puntajeIdeal) * 100)
        : 0;
      i.competenciasResumen.push({
        competencia: comp,
        puntajeIdeal,
        promedio,
        cumplimiento,
      });
    }
    i.competenciasAnalisis = await Promise.all(
      i.competenciasResumen.map(c =>
        analisisCompetencia({
          competencia: c.competencia,
          puntajeIdeal: c.puntajeIdeal,
          promedio: c.promedio,
          cumplimiento: c.cumplimiento,
          asignaturaNombre: asignatura.Nombre,
          carreraNombre: asignatura.Carrera,
        })
      )
    );
    i.recomendacionesCompetencias = await Promise.all(
      i.competenciasResumen.map(c =>
        recomendacionesCompetencia(
          c.competencia,
          c.cumplimiento,
          asignatura.Nombre,
          asignatura.Carrera
        )
      )
    );

  }

  // totalNiveles ya calculado al agregar rubricas

  const resumenComp = competencias.map(c => `${c.ID_Competencia}: ${c.cumplimiento}%`).join(', ');
  const conclusion = await conclusionCompetencias({
    resumen: resumenComp,
    asignaturaNombre: asignatura.Nombre,
    carreraNombre: asignatura.Carrera,
  });

  const recomendacionesComp = await Promise.all(
    competencias.map(c =>
      recomendacionesCompetencia(
        c.ID_Competencia,
        c.cumplimiento,
        asignatura.Nombre,
        asignatura.Carrera
      )
    )
  );

  const recomendaciones = await recomendacionesGenerales(
    'temas de la asignatura',
    asignatura.Nombre,
    asignatura.Carrera
  );

  const resumenTemasFinal = [...new Set(datos.map(d => d.indicador))].join(', ');
  const recomendacionesTemasFinal = await recomendacionesTemas(
    resumenTemasFinal,
    asignatura.Nombre,
    asignatura.Carrera
  );

  const barrasPath = await generarGraficoBarras(
    datos.map(d => d.indicador),
    datos.map(d => Number(d.porcentaje) || 0),
    'barras.png'
  );

  const compPath = await generarGraficoLineas(
    competencias.map(c => c.ID_Competencia),
    competencias.map(c => Number(c.cumplimiento) || 0),
    'competencias.png'
  );

  const graficosInstancias = {};
  for (const [num, inst] of Object.entries(instancias)) {
    graficosInstancias[num] = await generarGraficoBarras(
      inst.criterios.map(c => c.indicador),
      inst.criterios.map(c => Number(c.porcentaje) || 0),
      `instancia_${num}.png`
    );
  }

  const resumenIndicadores = [...datos].sort((a, b) => a.instancia - b.instancia);

  const contenido = {
    asignatura,
    introduccion,
    instancias,
    resumenIndicadores,
    datos,
    analisis,
    competencias,
    recomendacionesComp,
    conclusion,
    recomendaciones,
    recomendacionesTemasFinal,
    graficos: { barrasPath, compPath, ...graficosInstancias },
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
  const archivosGraficos = [barrasPath, compPath, ...Object.values(graficosInstancias)];
  archivosGraficos.forEach(p => {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });
  return { pdf, docx, nombre: `${base}.pdf`, nombreDocx: `${base}.docx` };
};
