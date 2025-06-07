const connection = require('../db/connection');

exports.contarPorAsignatura = (asignaturaID) => {
  const sql = `
    SELECT COUNT(DISTINCT e.ID_Evaluacion) AS total
    FROM evaluacion e
    JOIN aplicacion a ON e.ID_Evaluacion = a.evaluacion_ID_Evaluacion
    JOIN inscripcion i ON a.inscripcion_ID_Inscripcion = i.ID_Inscripcion
    WHERE i.asignatura_ID_Asignatura = ?
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, [asignaturaID], (err, results) => {
      if (err) return reject(err);
      resolve(results[0].total);
    });
  });
};

exports.crearConAplicaciones = (data) => {
  return new Promise((resolve, reject) => {
    const { Nombre, Tipo, N_Instancia, Fecha, asignatura_ID_Asignatura, contenidos } = data;

    const sqlEvaluacion = `
      INSERT INTO evaluacion (Nombre, Tipo, N_Instancia, Fecha)
      VALUES (?, ?, ?, ?)
    `;

    connection.query(sqlEvaluacion, [Nombre, Tipo, N_Instancia, Fecha], (err, result) => {
      if (err) return reject(err);
      const evaluacionID = result.insertId;

      const sqlInscripciones = `
        SELECT * FROM inscripcion
        WHERE asignatura_ID_Asignatura = ?
      `;

      connection.query(sqlInscripciones, [asignatura_ID_Asignatura], (err, inscripciones) => {
        if (err) return reject(err);
        if (inscripciones.length === 0) {
          return reject(new Error('No hay estudiantes inscritos en esta asignatura.'));
        }

        let tareasPendientes = 0;
        let falló = false;
        let totalAplicaciones = 0;

        for (const contenidoID of contenidos) {
          const sqlIndicadores = `
            SELECT * FROM indicador
            WHERE contenido_ID_Contenido = ?
          `;

          connection.query(sqlIndicadores, [contenidoID], (err, indicadores) => {
            if (err) {
              falló = true;
              return reject(err);
            }

            if (indicadores.length === 0) {
              return reject(new Error(`El contenido con ID ${contenidoID} no tiene indicadores asociados.`));
            }

            for (const insc of inscripciones) {
              for (const ind of indicadores) {
                const sqlAplicacion = `
                  INSERT INTO aplicacion (Obtenido, Grupo, inscripcion_ID_Inscripcion, evaluacion_ID_Evaluacion, indicador_ID_Indicador)
                  VALUES (0, 0, ?, ?, ?)
                `;

                tareasPendientes++;
                connection.query(sqlAplicacion, [insc.ID_Inscripcion, evaluacionID, ind.ID_Indicador], (err) => {
                  if (err && !falló) {
                    falló = true;
                    return reject(err);
                  }

                  tareasPendientes--;
                  if (tareasPendientes === 0 && !falló) {
                    resolve();
                  }
                });
              }
            }
          });
        }

        if (contenidos.length === 0) {
          return reject(new Error('Debes seleccionar al menos un contenido.'));
        }
      });
    });
  });
};

exports.obtenerPorAsignatura = (asignaturaID) => {
  const sql = `
    SELECT DISTINCT e.*
    FROM evaluacion e
    JOIN aplicacion a ON e.ID_Evaluacion = a.evaluacion_ID_Evaluacion
    JOIN inscripcion i ON a.inscripcion_ID_Inscripcion = i.ID_Inscripcion
    WHERE i.asignatura_ID_Asignatura = ?
    ORDER BY e.Fecha DESC, e.ID_Evaluacion DESC
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, [asignaturaID], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};
exports.obtenerContenidosUsados = (asignaturaID) => {
  const sql = `
    SELECT DISTINCT i.contenido_ID_Contenido AS ID_Contenido
    FROM aplicacion a
    JOIN inscripcion ins ON a.inscripcion_ID_Inscripcion = ins.ID_Inscripcion
    JOIN indicador i ON a.indicador_ID_Indicador = i.ID_Indicador
    WHERE ins.asignatura_ID_Asignatura = ?
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, [asignaturaID], (err, results) => {
      if (err) return reject(err);
      const usados = results.map(r => r.ID_Contenido);
      resolve(usados);
    });
  });
};
