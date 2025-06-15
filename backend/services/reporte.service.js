const connection = require('../db/connection');
const InformeService = require('./informe.service');


exports.generarReporte = async asignaturaId => {
  // Delegate to the more complete report generator so the output
  // includes charts and additional analysis like the reference document.
  return InformeService.generarInforme(asignaturaId);
};

// Distribución de puntajes y promedios por instancia e indicador
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
      COUNT(a.ID_Aplicacion) AS total,
      ROUND(AVG(CASE WHEN a.Obtenido BETWEEN c.R_Min AND c.R_Max THEN a.Obtenido END), 1) AS promedio
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
      // Organizar datos por instancia e indicador
      rows.forEach(r => {
        if (!instancias[r.instancia]) instancias[r.instancia] = {};
        if (!instancias[r.instancia][r.indicadorId]) {
          instancias[r.instancia][r.indicadorId] = {
            indicador: r.indicador,
            valores: [],
          };
        }

        const porcentaje = r.total
          ? Math.round((r.cantidad / r.total) * 1000) / 10
          : null;

        instancias[r.instancia][r.indicadorId].valores.push({
          criterio: r.criterio,
          promedio: r.cantidad ? Number(r.promedio) : null,
          porcentaje,
          orden: r.rMax,
        });
      });

      // Transformar al formato solicitado
      const resultado = Object.keys(instancias).map(instancia => ({
        instancia: Number(instancia),
        resultados: Object.values(instancias[instancia]).map(ind => ({
          indicador: ind.indicador,
          valores: ind.valores
            .sort((a, b) => b.orden - a.orden)
            .map(v => ({
              criterio: v.criterio,
              promedio: v.promedio,
              porcentaje: v.porcentaje,
            })),
        })),
      }));

      resolve(resultado);
    });
  });
};
