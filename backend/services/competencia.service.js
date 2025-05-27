const connection = require('../db/connection');

exports.getAll = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM competencia', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.getById = (id) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM competencia WHERE ID_Competencia = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

exports.crear = ({ ID_Competencia, Nombre, Tipo }) => {
  const sql = `INSERT INTO competencia (ID_Competencia, Nombre, Tipo) VALUES (?, ?, ?)`;
  return new Promise((resolve, reject) => {
    connection.query(sql, [ID_Competencia, Nombre, Tipo], (err) => err ? reject(err) : resolve());
  });
};

exports.actualizar = (id, { Nombre, Tipo }) => {
  const sql = `UPDATE competencia SET Nombre = ?, Tipo = ? WHERE ID_Competencia = ?`;
  return new Promise((resolve, reject) => {
    connection.query(sql, [Nombre, Tipo, id], (err) => err ? reject(err) : resolve());
  });
};

exports.eliminar = (id) => {
  return new Promise((resolve, reject) => {
    connection.query('DELETE FROM competencia WHERE ID_Competencia = ?', [id], (err) => err ? reject(err) : resolve());
  });
};
