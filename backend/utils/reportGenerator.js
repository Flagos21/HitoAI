
let PDFDocument;
try {
  PDFDocument = require('pdfkit');
} catch (err) {
  console.warn(
    'pdfkit module not found. Run "npm install" in the backend directory to enable PDF generation.'
  );
  PDFDocument = null;
}
const fs = require('fs');
let Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TextRun,
  ImageRun,
  AlignmentType;
try {
  ({
    Document,
    Packer,
    Paragraph,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    TextRun,
    ImageRun,
    AlignmentType,
  } = require('docx'));
} catch (err) {
  console.warn(
    'docx module not found. Run "npm install" in the backend directory to enable DOCX generation.'
  );
}

function drawCriteriaTablePDF(doc, criterios) {
  const startX = doc.x;
  const widths = [180, 40, 40, 50, 70, 80];
  const headers = ['Criterio', 'Max', 'Min', 'Prom', '%>Prom', 'Comp.'];
  doc.font('Helvetica-Bold');
  headers.forEach((h, i) => {
    const x = startX + widths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(h, x, doc.y, { width: widths[i] });
  });
  doc.moveDown();
  doc.font('Helvetica');
  criterios.forEach(c => {
    let x = startX;
    doc.text(c.indicador, x, doc.y, { width: widths[0] });
    x += widths[0];
    doc.text(String(c.maximo), x, doc.y, { width: widths[1] });
    x += widths[1];
    doc.text(String(c.minimo), x, doc.y, { width: widths[2] });
    x += widths[2];
    doc.text(String(c.promedio), x, doc.y, { width: widths[3] });
    x += widths[3];
    doc.text(`${c.porcentaje}%`, x, doc.y, { width: widths[4] });
    x += widths[4];
    doc.text(c.competencia, x, doc.y, { width: widths[5] });
    doc.moveDown();
  });
}

function buildCriteriaTableDOCX(criterios) {
  return new Table({
    rows: [
      new TableRow({
        children: ['Criterio', 'Max', 'Min', 'Prom', '%>Prom', 'Comp.'].map(
          t =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: t, bold: true })],
                }),
              ],
            })
        ),
      }),
      ...criterios.map(c =>
        new TableRow({
          children: [
            c.indicador,
            String(c.maximo),
            String(c.minimo),
            String(c.promedio),
            `${c.porcentaje}%`,
            c.competencia,
          ].map(t =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun(String(t))] })],
            })
          ),
        })
      ),
    ],
  });
}

// Genera un PDF básico a partir del contenido entregado
exports.generarPDF = contenido => {
  if (!PDFDocument) {
    return Promise.reject(new Error('pdfkit not installed'));
  }
  return new Promise(resolve => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text('INFORME DE ASIGNATURA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(contenido.datos.Nombre, { align: 'center' });
    doc.moveDown();
    const intro = contenido.introduccion;
    doc.fontSize(14).text(intro.objetivo.titulo);
    doc.fontSize(12).text(intro.objetivo.texto, { align: 'justify' });
    doc.moveDown();
    doc.fontSize(14).text(intro.relevancia.titulo);
    doc.fontSize(12).text(intro.relevancia.texto, { align: 'justify' });
    doc.moveDown();
    doc.fontSize(12).text(contenido.conclusion, { align: 'justify' });

    doc.end();
  });
};

// Genera un DOCX con la misma información
exports.generarDOCX = async contenido => {
  if (!Document) {
    return Promise.reject(new Error('docx not installed'));
  }
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [new TextRun('INFORME DE ASIGNATURA')],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            children: [new TextRun(contenido.datos.Nombre)],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun(contenido.introduccion.objetivo.titulo)],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun(contenido.introduccion.objetivo.texto)],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun(contenido.introduccion.relevancia.titulo)],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun(contenido.introduccion.relevancia.texto)],
          }),
          new Paragraph({ children: [new TextRun(contenido.conclusion)] })
        ]
      }
    ]
  });
  const buffer = await Packer.toBuffer(doc);
  return buffer;
};

// Genera un PDF completo con tablas y gráfico
exports.generarPDFCompleto = contenido => {
  if (!PDFDocument) {
    return Promise.reject(new Error('pdfkit not installed'));
  }
  return new Promise(resolve => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text('INFORME DE ASIGNATURA INTEGRADORA DE SABERES I', { align: 'center' });
    doc.moveDown();
    const intro = contenido.introduccion;
    doc.fontSize(14).text(intro.objetivo.titulo);
    doc.fontSize(12).text(intro.objetivo.texto, { align: 'justify' });
    doc.moveDown();
    doc.fontSize(14).text(intro.relevancia.titulo);
    doc.fontSize(12).text(intro.relevancia.texto, { align: 'justify' });
    doc.moveDown();

    Object.keys(contenido.instancias)
      .sort((a, b) => a - b)
      .forEach(num => {
        const inst = contenido.instancias[num];
        doc.fontSize(14).text(`Instancia Evaluativa ${num}`, { underline: true });
        doc.moveDown(0.5);
        drawCriteriaTablePDF(doc, inst.criterios);
        doc.moveDown(0.5);
        inst.criterios.forEach((d, idx) => {
          doc.font('Helvetica-Bold').text(d.indicador);
          doc.font('Helvetica');
          doc.text(`• Máximo Puntaje Obtenido: ${d.maximo}`);
          doc.text(`• Mínimo Puntaje Obtenido: ${d.minimo}`);
          doc.text(`• Puntaje Promedio: ${d.promedio}`);
          doc.text(`• % de Alumnos sobre el Promedio: ${d.porcentaje}%`);
          if (Array.isArray(d.niveles)) {
            d.niveles.forEach(n => {
              doc.text(`${n.nombre}: ${n.cantidad} (${n.porcentaje}%)`);
            });
          }
          doc.text(inst.analisis[idx], { align: 'justify' });
          doc.moveDown();
        });
        doc.text(inst.conclusion);
        doc.moveDown();
      });


    if (contenido.graficos) {
      Object.values(contenido.graficos).forEach(p => {
        if (p && fs.existsSync(p)) {
          doc.image(p, { width: 500 });
          doc.moveDown();
        }
      });
    }

    doc.fontSize(14).text('Cumplimiento por Competencia', { underline: true });
    doc.moveDown();
    contenido.competencias.forEach(c => {
      doc.text(`${c.ID_Competencia} - Ideal: ${c.puntaje_ideal} Promedio: ${c.puntaje_promedio} Cumplimiento: ${c.cumplimiento}%`);
      if (contenido.recomendacionesComp) {
        const idx = contenido.competencias.findIndex(co => co.ID_Competencia === c.ID_Competencia);
        if (contenido.recomendacionesComp[idx]) {
          doc.text(`Recomendación: ${contenido.recomendacionesComp[idx]}`);
        }
      }
    });

    doc.moveDown();
    doc.text(contenido.conclusion);
    doc.moveDown();
    doc.text(contenido.recomendaciones);

    doc.end();
  });
};

// Genera un DOCX completo similar al PDF
exports.generarDOCXCompleto = async contenido => {
  if (!Document) {
    return Promise.reject(new Error('docx not installed'));
  }
  const tableIndicadores = new Table({
    rows: [
      new TableRow({
        children: ['Criterio', 'Eval.', 'Max', 'Min', 'Prom', '%', 'Comp.'].map(
          t =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: t, bold: true })],
                }),
              ],
            })
        ),
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
            d.competencia,
          ].map(t =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun(String(t))] })],
            })
          ),
        })
      ),
    ],
  });

  const compTable = new Table({
    rows: [
      new TableRow({
        children: ['Competencia', 'Ideal', 'Promedio', 'Cumplimiento'].map(
          t =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: t, bold: true })],
                }),
              ],
            })
        )
      }),
      ...contenido.competencias.map(c =>
        new TableRow({
          children: [
            c.ID_Competencia,
            String(c.puntaje_ideal),
            String(c.puntaje_promedio),
            `${c.cumplimiento}%`
          ].map(t =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun(String(t))] })],
            })
          )
        })
      )
    ]
  });

  const instanciasParagraphs = [];
  Object.keys(contenido.instancias)
    .sort((a, b) => a - b)
    .forEach(num => {
      const inst = contenido.instancias[num];
      instanciasParagraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun(`Instancia Evaluativa ${num}`)],
        })
      );
      instanciasParagraphs.push(buildCriteriaTableDOCX(inst.criterios));
      inst.criterios.forEach((c, idx) => {
        instanciasParagraphs.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun(c.indicador)],
          })
        );
        instanciasParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun(`Máximo Puntaje Obtenido: ${c.maximo}`)],
          })
        );
        instanciasParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun(`Mínimo Puntaje Obtenido: ${c.minimo}`)],
          })
        );
        instanciasParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun(`Puntaje Promedio: ${c.promedio}`)],
          })
        );
        instanciasParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun(`% de Alumnos sobre el Promedio: ${c.porcentaje}%`)],
          })
        );
        if (Array.isArray(c.niveles)) {
          c.niveles.forEach(n => {
            instanciasParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun(`${n.nombre}: ${n.cantidad} (${n.porcentaje}%)`),
                ],
              })
            );
          });
        }
        instanciasParagraphs.push(
          new Paragraph({ children: [new TextRun(inst.analisis[idx] || '')] })
        );
      });
      instanciasParagraphs.push(
        new Paragraph({ children: [new TextRun(inst.conclusion || '')] })
      );
    });

  const grafParags = Object.values(contenido.graficos || {})
    .filter(p => p && fs.existsSync(p))
    .map(p =>
      new Paragraph({
        children: [
          new ImageRun({
            data: fs.readFileSync(p),
            transformation: { width: 500, height: 250 },
          }),
        ],
      })
    );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [new TextRun('INFORME DE ASIGNATURA INTEGRADORA DE SABERES I')],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun(contenido.introduccion.objetivo.titulo)],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun(contenido.introduccion.objetivo.texto)],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun(contenido.introduccion.relevancia.titulo)],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun(contenido.introduccion.relevancia.texto)],
          }),
          ...instanciasParagraphs,
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun('Cumplimiento por Competencia')],
          }),
          compTable,
          ...(contenido.recomendacionesComp || []).map(
            t => new Paragraph({ children: [new TextRun(t)] })
          ),
          ...grafParags,
          new Paragraph({ children: [new TextRun(contenido.conclusion)] }),
          new Paragraph({ children: [new TextRun(contenido.recomendaciones)] })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
};
