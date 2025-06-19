const EstudianteService = require('../services/estudiante.service');
const csv = require('csv-parser');
const fs = require('fs');

exports.getAll = async (req, res) => {
  const data = await EstudianteService.getAll();
  res.json(data);
};

exports.getNoInscritos = async (req, res) => {
  const data = await EstudianteService.getNoInscritos();
  res.json(data);
};

exports.getDisponiblesPorAsignatura = async (req, res) => {
  const data = await EstudianteService.getDisponiblesPorAsignatura(req.params.id);
  res.json(data);
};

exports.crear = async (req, res) => {
  try {
    const existe = await EstudianteService.existe(req.body.ID_Estudiante);
    if (existe) {
      return res.status(400).json({ message: 'Estudiante inscrito' });
    }
    await EstudianteService.crear(req.body);
    res.status(201).json({ message: 'Estudiante creado' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Estudiante inscrito' });
    }
    console.error('Error al crear estudiante:', error);
    res.status(500).json({ message: 'Error al crear estudiante' });
  }
};

exports.actualizar = async (req, res) => {
  await EstudianteService.actualizar(req.params.id, req.body);
  res.json({ message: 'Estudiante actualizado' });
};

exports.eliminar = async (req, res) => {
  try {
    await EstudianteService.eliminar(req.params.id);
    res.json({ message: 'Estudiante eliminado' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Estudiante inscrito' });
    }
    console.error('Error al eliminar estudiante:', error);
    res.status(500).json({ message: 'Error al eliminar estudiante' });
  }
};

exports.cargarCSV = async (req, res) => {
  const archivo = req.file;
  if (!archivo) {
    return res.status(400).json({ error: 'No se envió ningún archivo' });
  }

  const estudiantes = [];

  fs.createReadStream(archivo.path)
    .pipe(csv())
    .on('data', (row) => {
      const rut = row?.ID_Estudiante
        ?.toString()
        .replace(/\./g, '')
        .replace(/-/g, '')
        .trim();
      const nombre = row?.Nombre?.trim();
      const apellido = row?.Apellido?.trim();
      const anio = parseInt(row?.Anio_Ingreso, 10);

      if (rut && nombre && apellido && !isNaN(anio)) {
        estudiantes.push({
          ID_Estudiante: rut,
          Nombre: nombre,
          Apellido: apellido,
          Anio_Ingreso: anio
        });
      }
    })
    .on('end', async () => {
      try {
        for (const est of estudiantes) {
          const existe = await EstudianteService.existe(est.ID_Estudiante);
          if (existe) {
            await EstudianteService.actualizar(est.ID_Estudiante, est);
          } else {
            await EstudianteService.crear(est);
          }
        }

        res.status(200).json({
          message: `${estudiantes.length} estudiantes procesados correctamente`,
          estudiantes: estudiantes
        });
      } catch (error) {
        console.error('Error al procesar CSV:', error);
        res.status(500).json({ error: 'Error al procesar el archivo CSV' });
      }
    });
};
