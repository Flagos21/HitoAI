const connection = require('../db/connection');

exports.getAll = () => {
  const sql = `
    SELECT 
      c.ID_Carrera, 
      c.Nombre, 
      c.usuario_ID_Usuario,
      u.Nombre AS JefeCarrera
    FROM carrera c
    LEFT JOIN usuario u ON c.usuario_ID_Usuario = u.ID_Usuario
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.crear = ({ Nombre, facultad_ID_Facultad, usuario_ID_Usuario }) => {
  const sql = `INSERT INTO carrera (Nombre, facultad_ID_Facultad, usuario_ID_Usuario) VALUES (?, ?, ?)`;
  return new Promise((resolve, reject) => {
    connection.query(sql, [Nombre, facultad_ID_Facultad, usuario_ID_Usuario], (err) =>
      err ? reject(err) : resolve()
    );
  });
};

exports.actualizar = (id, { Nombre, usuario_ID_Usuario }) => {
  const sql = `UPDATE carrera SET Nombre = ?, usuario_ID_Usuario = ? WHERE ID_Carrera = ?`;
  return new Promise((resolve, reject) => {
    connection.query(sql, [Nombre, usuario_ID_Usuario, id], (err) =>
      err ? reject(err) : resolve()
    );
  });
};

exports.eliminar = (id) => {
  const sql = `DELETE FROM carrera WHERE ID_Carrera = ?`;
  return new Promise((resolve, reject) => {
    connection.query(sql, [id], (err) => err ? reject(err) : resolve());
  });
};
