
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, HeadingLevel } = require('docx');

// Genera un PDF básico a partir del contenido entregado
exports.generarPDF = contenido => {
  return new Promise(resolve => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text('INFORME DE ASIGNATURA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(contenido.datos.Nombre, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(contenido.introduccion, { align: 'justify' });
    doc.moveDown();
    doc.fontSize(12).text(contenido.conclusion, { align: 'justify' });

    doc.end();
  });
};

// Genera un DOCX con la misma información
exports.generarDOCX = contenido => {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'INFORME DE ASIGNATURA',
            heading: HeadingLevel.HEADING_1,
            alignment: 'center'
          }),
          new Paragraph({
            text: contenido.datos.Nombre,
            heading: HeadingLevel.HEADING_2,
            alignment: 'center'
          }),
          new Paragraph(contenido.introduccion),
          new Paragraph(contenido.conclusion)
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
};
