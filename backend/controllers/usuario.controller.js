const UsuarioService = require('../services/usuario.service');

// Crear nuevo usuario
exports.crearUsuario = async (req, res) => {
  const { ID_Usuario, Nombre, Clave, Rol_ID_Rol } = req.body;
  const rut = ID_Usuario.replace(/\./g, '').replace(/-/g, '').toUpperCase();

  if (!ID_Usuario || !Nombre || !Clave || !Rol_ID_Rol) {
    return res.status(400).json({ message: 'Faltan datos requeridos para crear el usuario' });
  }

  try {
    await UsuarioService.crearUsuario(rut, Nombre, Clave, Rol_ID_Rol);
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

// Validar login
exports.login = async (req, res) => {
  const { ID_Usuario, Clave } = req.body;
  const rut = ID_Usuario.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  try {
    const resultado = await UsuarioService.validarLogin(rut, Clave);
    if (resultado?.error === 'not_found') {
      return res.status(404).json({ message: 'RUT no registrado' });
    }
    if (resultado?.error === 'invalid_password') {
      return res.status(401).json({ message: 'Clave incorrecta' });
    }
    res.json(resultado);
  } catch (error) {
    console.error('Error login backend:', error);
    res.status(500).json({ message: 'Error en el login' });
  }
};

// Obtener jefes de carrera
exports.getJefesCarrera = async (req, res) => {
  try {
    const jefes = await UsuarioService.getJefesCarrera();
    res.json(jefes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener jefes de carrera' });
  }
};

// Obtener profesores
exports.getProfesores = async (req, res) => {
  try {
    const profesores = await UsuarioService.getProfesores();
    res.json(profesores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener profesores' });
  }
};

// Obtener todos los usuarios
exports.getTodos = async (req, res) => {
  try {
    const usuarios = await UsuarioService.getTodos();
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Actualizar clave
exports.actualizarClave = async (req, res) => {
  const { id } = req.params;
  const { clave } = req.body;

  if (!clave) {
    return res.status(400).json({ message: 'La clave es requerida' });
  }

  try {
    await UsuarioService.actualizarClave(id, clave);
    res.json({ message: 'Clave actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar clave' });
  }
};

// Actualizar rol
exports.actualizarRol = async (req, res) => {
  const { id } = req.params;
  const { rolId } = req.body;
  if (!rolId) {
    return res.status(400).json({ message: 'Rol requerido' });
  }
  try {
    await UsuarioService.actualizarRol(id, rolId);
    res.json({ message: 'Rol actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
};
