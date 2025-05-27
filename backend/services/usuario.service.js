const connection = require('../db/connection');
const bcrypt = require('bcryptjs');

exports.crearUsuario = async (ID_Usuario, Nombre, Clave, Rol) => {
  const hashedClave = await bcrypt.hash(Clave, 10);
  const sql = `INSERT INTO usuario (ID_Usuario, Nombre, Clave, Rol) VALUES (?, ?, ?, ?)`;
  return new Promise((resolve, reject) => {
    connection.query(sql, [ID_Usuario, Nombre, hashedClave, Rol], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.validarLogin = (rut, clave) => {
  const sql = `SELECT * FROM usuario WHERE ID_Usuario = ?`;
  return new Promise((resolve, reject) => {
    connection.query(sql, [rut], async (err, results) => {
      if (err) {
        console.log('❌ Error SQL:', err);
        return reject(err);
      }

      if (results.length === 0) {
        console.log('❌ No se encontró el usuario con RUT:', rut);
        return resolve(null);
      }

      const usuario = results[0];
      console.log('✅ Usuario encontrado:', usuario);

      const bcrypt = require('bcryptjs');
      const match = await bcrypt.compare(clave, usuario.Clave);
      console.log('✅ ¿Clave coincide?', match);

      if (!match) return resolve(null);
      resolve({
        ID_Usuario: usuario.ID_Usuario,
        Nombre: usuario.Nombre,
        Rol: usuario.Rol
      });
    });
  });
};

exports.getJefesCarrera = () => {
  const sql = `SELECT ID_Usuario, Nombre FROM usuario WHERE Rol = 'Jefe de Carrera'`;
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


exports.getProfesores = () => {
  const sql = `SELECT ID_Usuario, Nombre FROM usuario WHERE Rol = 'Profesor'`;
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


