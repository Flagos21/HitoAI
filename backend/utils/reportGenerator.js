
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');

exports.generarPDF = contenido => {
  return new Promise(resolve => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text('INFORME DE ASIGNATURA');
    doc.moveDown();
    doc.fontSize(12).text(contenido.introduccion);
    doc.moveDown();
    doc.text(contenido.conclusion);
    doc.end();
  });
};

exports.generarDOCX = contenido => {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'INFORME DE ASIGNATURA', bold: true, size: 32 })]
          }),
          new Paragraph(contenido.introduccion),
          new Paragraph(contenido.conclusion)
        ]
      }
    ]
  });
  return Packer.toBuffer(doc);
};
