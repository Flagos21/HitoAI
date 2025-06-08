const PDFDocument = require('pdfkit');

exports.generarPDF = contenido => {
  return new Promise(resolve => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.fontSize(20).text('Informe de Asignatura', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(contenido.introduccion);
    doc.addPage();
    doc.fontSize(12).text(contenido.conclusion);

    doc.end();
  });
};
