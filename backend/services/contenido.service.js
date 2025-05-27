const connection = require('../db/connection');

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

exports.crear = (data) => {
  const sql = `
    INSERT INTO contenido (Nucleo_Tematico, Horas, asignatura_ID_Asignatura)
    VALUES (?, ?, ?)
  `;
  const params = [data.Nucleo_Tematico, data.Horas, data.asignatura_ID_Asignatura];
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

exports.actualizar = (id, data) => {
  const sql = `
    UPDATE contenido
    SET Nucleo_Tematico = ?, Horas = ?
    WHERE ID_Contenido = ?
  `;
  const params = [data.Nucleo_Tematico, data.Horas, id];
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

exports.eliminar = (id) => {
  const sql = `DELETE FROM contenido WHERE ID_Contenido = ?`;
  return new Promise((resolve, reject) => {
    connection.query(sql, [id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
