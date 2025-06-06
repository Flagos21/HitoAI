const connection = require('../db/connection');

// Obtener todos los contenidos de una asignatura
exports.obtenerPorAsignatura = (idAsignatura) => {
  const sql = `
    SELECT * FROM contenido
    WHERE asignatura_ID_Asignatura = ?
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, [idAsignatura], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Crear nuevo contenido
exports.crear = (data) => {
  const sql = `
    INSERT INTO contenido (Nucleo_Tematico, Descripcion, Horas, asignatura_ID_Asignatura)
    VALUES (?, ?, ?, ?)
  `;
  const params = [data.Nucleo_Tematico, data.Descripcion, data.Horas, data.asignatura_ID_Asignatura];
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Actualizar contenido existente
exports.actualizar = (id, data) => {
  const sql = `
    UPDATE contenido
    SET Nucleo_Tematico = ?, Descripcion = ?, Horas = ?
    WHERE ID_Contenido = ?
  `;
  const params = [data.Nucleo_Tematico, data.Descripcion, data.Horas, id];
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Eliminar contenido por ID
exports.eliminar = (id) => {
  const sql = `DELETE FROM contenido WHERE ID_Contenido = ?`;
  return new Promise((resolve, reject) => {
    connection.query(sql, [id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
