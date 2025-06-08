
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun, Media } = require('docx');

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

// Genera un PDF completo con tablas y gráfico
exports.generarPDFCompleto = contenido => {
  return new Promise(resolve => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text('INFORME DE ASIGNATURA INTEGRADORA DE SABERES I', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(contenido.introduccion, { align: 'justify' });
    doc.moveDown();

    doc.fontSize(14).text('Indicadores por Evaluación', { underline: true });
    doc.moveDown();
    // Tabla sencilla
    contenido.datos.forEach((d, idx) => {
      doc.text(`${d.indicador} (${d.competencia}) - ${d.evaluacion}`);
      doc.text(`Max: ${d.maximo} Min: ${d.minimo} Prom: ${d.promedio} Sobre prom: ${d.porcentaje}%`);
      doc.text(contenido.analisis[idx]);
      doc.moveDown();
    });

    if (contenido.chartUrl) {
      doc.image(contenido.chartUrl, { fit: [500, 300], align: 'center' });
      doc.moveDown();
    }

    doc.fontSize(14).text('Cumplimiento por Competencia', { underline: true });
    doc.moveDown();
    contenido.competencias.forEach(c => {
      doc.text(`${c.ID_Competencia} - Ideal: ${c.puntaje_ideal} Obtenido: ${c.puntaje_total} Cumplimiento: ${c.cumplimiento}%`);
    });

    doc.moveDown();
    doc.text(contenido.conclusion);
    doc.moveDown();
    doc.text(contenido.recomendaciones);

    doc.end();
  });
};

// Genera un DOCX completo similar al PDF
exports.generarDOCXCompleto = contenido => {
  const tableIndicadores = new Table({
    rows: [
      new TableRow({
        children: [
          'Indicador',
          'Eval.',
          'Max',
          'Min',
          'Prom',
          '% Sobre prom',
          'Comp.'
        ].map(t => new TableCell({ children: [new Paragraph({ text: t, bold: true })] }))
      }),
      ...contenido.datos.map(d =>
        new TableRow({
          children: [
            d.indicador,
            d.evaluacion,
            String(d.maximo),
            String(d.minimo),
            String(d.promedio),
            `${d.porcentaje}%`,
            d.competencia
          ].map(t => new TableCell({ children: [new Paragraph(String(t))] }))
        })
      )
    ]
  });

  const compTable = new Table({
    rows: [
      new TableRow({
        children: ['Competencia', 'Ideal', 'Total', 'Cumplimiento'].map(t => new TableCell({ children: [new Paragraph({ text: t, bold: true })] }))
      }),
      ...contenido.competencias.map(c =>
        new TableRow({
          children: [
            c.ID_Competencia,
            String(c.puntaje_ideal),
            String(c.puntaje_total),
            `${c.cumplimiento}%`
          ].map(t => new TableCell({ children: [new Paragraph(String(t))] }))
        })
      )
    ]
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: 'INFORME DE ASIGNATURA INTEGRADORA DE SABERES I', heading: HeadingLevel.HEADING_1, alignment: 'center' }),
          new Paragraph(contenido.introduccion),
          new Paragraph({ text: 'Indicadores por Evaluación', heading: HeadingLevel.HEADING_2 }),
          tableIndicadores,
          ...contenido.analisis.map(a => new Paragraph(a)),
          contenido.chartUrl ? Media.addImage(doc, contenido.chartUrl) : new Paragraph(''),
          new Paragraph({ text: 'Cumplimiento por Competencia', heading: HeadingLevel.HEADING_2 }),
          compTable,
          new Paragraph(contenido.conclusion),
          new Paragraph(contenido.recomendaciones)
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
};
