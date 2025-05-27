const UsuarioService = require('../services/usuario.service');

exports.crearUsuario = async (req, res) => {
  const { ID_Usuario, Nombre, Clave, Rol } = req.body;
  try {
    await UsuarioService.crearUsuario(ID_Usuario, Nombre, Clave, Rol);
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};
exports.login = async (req, res) => {
  const { ID_Usuario, Clave } = req.body;
  console.log('Login recibido:', ID_Usuario, Clave);
  try {
    const usuario = await UsuarioService.validarLogin(ID_Usuario, Clave);
    if (!usuario) {
      console.log('Credenciales inválidas');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    console.log('Login correcto:', usuario);
    res.json(usuario);
  } catch (error) {
    console.error('Error login backend:', error);
    res.status(500).json({ message: 'Error en el login' });
  }
};
exports.getJefesCarrera = async (req, res) => {
  try {
    const jefes = await UsuarioService.getJefesCarrera();
    res.json(jefes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener jefes de carrera' });
  }
};
exports.getProfesores = async (req, res) => {
  try {
    const profesores = await UsuarioService.getProfesores();
    res.json(profesores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener profesores' });
  }
};



