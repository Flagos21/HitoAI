exports.generarPDF = contenido => {
  const text = [
    'INFORME DE ASIGNATURA',
    '',
    contenido.introduccion,
    '',
    contenido.conclusion
  ].join('\n');
  return Promise.resolve(Buffer.from(text));
};
