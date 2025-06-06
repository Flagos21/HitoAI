const connection = require('../db/connection');
const bcrypt = require('bcryptjs');

// Crear nuevo usuario
exports.crearUsuario = async (ID_Usuario, Nombre, Clave, Rol_ID_Rol) => {
  const hashedClave = await bcrypt.hash(Clave, 10);
  const sql = `INSERT INTO usuario (ID_Usuario, Nombre, Clave, Rol_ID_Rol) VALUES (?, ?, ?, ?)`;
  return new Promise((resolve, reject) => {
    connection.query(sql, [ID_Usuario, Nombre, hashedClave, Rol_ID_Rol], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Validar login
exports.validarLogin = (rut, clave) => {
  const sql = `
    SELECT u.ID_Usuario, u.Nombre, u.Clave, r.Nombre AS Rol
    FROM usuario u
    JOIN rol r ON u.Rol_ID_Rol = r.ID_Rol
    WHERE u.ID_Usuario = ?
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, [rut], async (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null);

      const usuario = results[0];
      const match = await bcrypt.compare(clave, usuario.Clave);
      if (!match) return resolve(null);

      resolve({
        ID_Usuario: usuario.ID_Usuario,
        Nombre: usuario.Nombre,
        Rol: usuario.Rol
      });
    });
  });
};

// Obtener todos los jefes de carrera
exports.getJefesCarrera = () => {
  const sql = `
    SELECT u.ID_Usuario, u.Nombre
    FROM usuario u
    JOIN rol r ON u.Rol_ID_Rol = r.ID_Rol
    WHERE r.Nombre = 'Jefe de Carrera'
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Obtener todos los profesores
exports.getProfesores = () => {
  const sql = `
    SELECT u.ID_Usuario, u.Nombre
    FROM usuario u
    JOIN rol r ON u.Rol_ID_Rol = r.ID_Rol
    WHERE r.Nombre = 'Profesor'
  `;
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};
