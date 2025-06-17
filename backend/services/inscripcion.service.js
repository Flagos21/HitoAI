const connection = require('../db/connection');

exports.crear = (data) => {
  const sql = `
    INSERT INTO inscripcion (asignatura_ID_Asignatura, estudiante_ID_Estudiante, Anio, Semestre, Estado)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    data.asignatura_ID_Asignatura,
    data.estudiante_ID_Estudiante,
    data.Anio,
    data.Semestre,
    data.Estado || 'Activo'
  ];
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err) => err ? reject(err) : resolve());
  });
};

exports.obtenerPorAsignatura = (id) => {
  const sql = `
    SELECT e.ID_Estudiante, e.Nombre, e.Apellido
    FROM inscripcion i
    JOIN estudiante e ON e.ID_Estudiante = i.estudiante_ID_Estudiante
    WHERE i.asignatura_ID_Asignatura = ? AND i.Estado = 'Activo'
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, [id], (err, results) => err ? reject(err) : resolve(results));
  });
};

exports.eliminar = (asignaturaId, estudianteId) => {
  const sql = `
    DELETE FROM inscripcion
    WHERE asignatura_ID_Asignatura = ? AND estudiante_ID_Estudiante = ?
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, [asignaturaId, estudianteId], (err) => err ? reject(err) : resolve());
  });
};

exports.existe = (asignaturaId, estudianteId) => {
  const sql = `
    SELECT 1 FROM inscripcion
    WHERE asignatura_ID_Asignatura = ? AND estudiante_ID_Estudiante = ? AND Estado = 'Activo'
    LIMIT 1
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, [asignaturaId, estudianteId], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
};
