const connection = require('../db/connection');

exports.getAll = () => {
  const sql = `
    SELECT 
      ra.ID_RA, 
      ra.Nombre, 
      GROUP_CONCAT(rc.competencia_ID_Competencia ORDER BY rc.competencia_ID_Competencia SEPARATOR ' + ') AS competencias
    FROM ra
    LEFT JOIN ra_competencia rc ON ra.ID_RA = rc.ra_ID_RA
    GROUP BY ra.ID_RA, ra.Nombre
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.getById = (id) => {
  const sql = `
    SELECT 
      ra.ID_RA, 
      ra.Nombre, 
      GROUP_CONCAT(rc.competencia_ID_Competencia ORDER BY rc.competencia_ID_Competencia SEPARATOR ' + ') AS competencias
    FROM ra
    LEFT JOIN ra_competencia rc ON ra.ID_RA = rc.ra_ID_RA
    WHERE ra.ID_RA = ?
    GROUP BY ra.ID_RA, ra.Nombre
  `;

  return new Promise((resolve, reject) => {
    connection.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

exports.crearRAConCompetencias = async (ra, competencias) => {
  return new Promise((resolve, reject) => {
    connection.beginTransaction(err => {
      if (err) return reject(err);

      const insertRA = `INSERT INTO ra (ID_RA, Nombre) VALUES (?, ?)`;
      connection.query(insertRA, [ra.ID_RA, ra.Nombre], (err) => {
        if (err) return connection.rollback(() => reject(err));

        const insertRelacion = `INSERT INTO ra_competencia (ra_ID_RA, competencia_ID_Competencia) VALUES ?`;
        const values = competencias.map(c => [ra.ID_RA, c]);

        connection.query(insertRelacion, [values], (err) => {
          if (err) return connection.rollback(() => reject(err));

          connection.commit(err => {
            if (err) return connection.rollback(() => reject(err));
            resolve();
          });
        });
      });
    });
  });
};

exports.actualizarRAConCompetencias = async (id, ra, competencias) => {
  return new Promise((resolve, reject) => {
    connection.beginTransaction(err => {
      if (err) return reject(err);

      const updateRA = `UPDATE ra SET Nombre = ? WHERE ID_RA = ?`;
      connection.query(updateRA, [ra.Nombre, id], (err) => {
        if (err) return connection.rollback(() => reject(err));

        const deleteAntiguas = `DELETE FROM ra_competencia WHERE ra_ID_RA = ?`;
        connection.query(deleteAntiguas, [id], (err) => {
          if (err) return connection.rollback(() => reject(err));

          const insertRelacion = `INSERT INTO ra_competencia (ra_ID_RA, competencia_ID_Competencia) VALUES ?`;
          const values = competencias.map(c => [id, c]);

          connection.query(insertRelacion, [values], (err) => {
            if (err) return connection.rollback(() => reject(err));

            connection.commit(err => {
              if (err) return connection.rollback(() => reject(err));
              resolve();
            });
          });
        });
      });
    });
  });
};

exports.eliminar = (id) => {
  const eliminarVinculos = `DELETE FROM ra_competencia WHERE ra_ID_RA = ?`;
  const eliminarRA = `DELETE FROM ra WHERE ID_RA = ?`;

  return new Promise((resolve, reject) => {
    connection.query(eliminarVinculos, [id], (err) => {
      if (err) return reject(err);
      connection.query(eliminarRA, [id], (err2) => {
        if (err2) return reject(err2);
        resolve();
      });
    });
  });
};
