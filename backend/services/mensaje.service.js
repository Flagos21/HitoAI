const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'messages.json');

function leer() {
  if (!fs.existsSync(file)) return [];
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    console.error(e);
    return [];
  }
}

function escribir(arr) {
  fs.writeFileSync(file, JSON.stringify(arr, null, 2));
}

exports.crearSolicitud = (rut) => {
  const arr = leer();
  arr.push({ id: Date.now(), rut, fecha: new Date().toISOString() });
  escribir(arr);
};

exports.getSolicitudes = () => {
  return leer();
};
