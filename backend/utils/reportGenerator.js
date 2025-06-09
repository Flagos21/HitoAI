
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
  AlignmentType,
  WidthType,
  BorderStyle;
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
    WidthType,
    BorderStyle,
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
  let current = null;
  criterios.forEach(c => {
    if (c.instancia !== current) {
      current = c.instancia;
      doc.font('Helvetica-Bold').text(`Instancia ${current}`, startX);
      doc.moveDown(0.2);
    }
    doc.font('Helvetica');
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
  const header = new TableRow({
    children: ['Criterio', 'Max', 'Min', 'Prom', '%>Prom', 'Comp.'].map(t =>
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: t, bold: true })],
          }),
        ],
      })
    ),
  });

  const rows = [header];
  let current = null;
  criterios.forEach(c => {
    if (c.instancia !== current) {
      current = c.instancia;
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 6,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `Instancia ${current}`, bold: true })],
                }),
              ],
            }),
          ],
        })
      );
    }

    rows.push(
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
    );
  });

  return new Table({ rows });
}

function drawDistribucionTablePDF(doc, indicadores) {
  const levelMap = {};
  indicadores.forEach(i => {
    (i.niveles || []).forEach(n => {
      if (!levelMap[n.nombre]) levelMap[n.nombre] = n.rMax;
    });
  });
  const niveles = Object.entries(levelMap)
    .sort((a, b) => b[1] - a[1])
    .map(([n]) => n);
  const count = niveles.length;
  const widths = [180, ...Array(count * 2).fill(50)];
  const headers = [
    'Indicador',
    ...niveles,
    ...niveles.map(n => `${n} (%)`),
  ];
  const startX = doc.x;
  const rowHeight = 20;
  let y = doc.y;
  doc.font('Helvetica-Bold');
  headers.forEach((h, i) => {
    const x = startX + widths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.rect(x, y, widths[i], rowHeight).stroke();
    doc.text(h, x, y + 5, { width: widths[i], align: 'center' });
  });
  y += rowHeight;
  doc.font('Helvetica');
  indicadores.forEach(ind => {
    let x = startX;
    doc.rect(x, y, widths[0], rowHeight).stroke();
    doc.text(ind.indicador, x, y + 5, { width: widths[0], align: 'center' });
    x += widths[0];
    niveles.forEach((n, idx) => {
      const nivel = (ind.niveles || []).find(l => l.nombre === n);
      doc.rect(x, y, widths[idx + 1], rowHeight).stroke();
      doc.text(nivel ? String(nivel.cantidad) : '0', x, y + 5, {
        width: widths[idx + 1],
        align: 'center',
      });
      x += widths[idx + 1];
    });
    niveles.forEach((n, idx) => {
      const nivel = (ind.niveles || []).find(l => l.nombre === n);
      const val = nivel ? `${nivel.porcentaje}%` : '0%';
      doc.rect(x, y, widths[count + idx + 1], rowHeight).stroke();
      doc.text(val, x, y + 5, {
        width: widths[count + idx + 1],
        align: 'center',
      });
      x += widths[count + idx + 1];
    });
    y += rowHeight;
  });
  doc.moveDown();
}

function generarTablaResumenIndicadoresPDF(doc, criterios) {
  drawCriteriaTablePDF(doc, criterios);
  doc.moveDown(0.5);
}

function generarBloqueDesgloseIndicadoresPDF(doc, instancia) {
  instancia.criterios.forEach((d, idx) => {
    doc.font('Helvetica-Bold').text(d.indicador);
    doc.font('Helvetica');
    doc.text(`• Máximo Puntaje Obtenido: ${d.maximo}`);
    doc.text(`• Mínimo Puntaje Obtenido: ${d.minimo}`);
    doc.text(`• Puntaje Promedio: ${d.promedio}`);
    doc.text(`• % de Alumnos sobre el Promedio: ${d.porcentaje}%`);
    doc.text(instancia.analisis[idx] || '', { align: 'justify' });
    doc.moveDown();
  });
}

function generarGraficoDesempenoPDF(doc, path) {
  if (path && fs.existsSync(path)) {
    doc.image(path, { width: 500 });
    doc.moveDown();
  }
}

function generarTablaCriteriosPorIndicadorPDF(doc, instancia) {
  drawDistribucionTablePDF(doc, instancia.criterios);
  doc.moveDown(0.5);
}

function generarConclusionPDF(doc, instancia) {
  if (instancia.conclusion) {
    doc.font('Helvetica-Bold').text('Conclusiones');
    doc.font('Helvetica').text(instancia.conclusion, { align: 'justify' });
    doc.moveDown();
  }
}

function generarRecomendacionesPDF(doc, instancia) {
  if (Array.isArray(instancia.recomendaciones) && instancia.recomendaciones.length) {
    doc.font('Helvetica-Bold').text('Recomendaciones');
    doc.font('Helvetica');
    instancia.recomendaciones.forEach(r => doc.text(`\u2022 ${r}`));
    doc.moveDown();
  }
}

function buildDistribucionTableDOCX(indicadores) {
  const levelMap = {};
  indicadores.forEach(i => {
    (i.niveles || []).forEach(n => {
      if (!levelMap[n.nombre] || n.rMax > levelMap[n.nombre]) {
        levelMap[n.nombre] = n.rMax;
      }
    });
  });
  const niveles = Object.entries(levelMap)
    .sort((a, b) => b[1] - a[1])
    .map(([n]) => n);
  const headerCells = [
    'Indicador',
    ...niveles,
    ...niveles.map(n => `${n} (%)`),
  ].map(t =>
    new TableCell({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: t, bold: true })],
        }),
      ],
    })
  );

  const rows = indicadores.map(ind =>
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun(ind.indicador)],
            }),
          ],
        }),
        ...niveles.map(n =>
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun(
                    String((ind.niveles || []).find(l => l.nombre === n)?.cantidad || 0)
                  ),
                ],
              }),
            ],
          })
        ),
        ...niveles.map(n =>
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun(
                    `${(ind.niveles || []).find(l => l.nombre === n)?.porcentaje || 0}%`
                  ),
                ],
              }),
            ],
          })
        ),
      ],
    })
  );

  return new Table({
    rows: [new TableRow({ children: headerCells }), ...rows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideH: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideV: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    },
  });
}

function generarTablaResumenIndicadoresDOCX(criterios) {
  return buildCriteriaTableDOCX(criterios);
}

function generarBloqueDesgloseIndicadoresDOCX(instancia) {
  const parts = [];
  instancia.criterios.forEach((c, idx) => {
    parts.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun(c.indicador)],
      })
    );
    parts.push(
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun(`Máximo Puntaje Obtenido: ${c.maximo}`)] })
    );
    parts.push(
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun(`Mínimo Puntaje Obtenido: ${c.minimo}`)] })
    );
    parts.push(
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun(`Puntaje Promedio: ${c.promedio}`)] })
    );
    parts.push(
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun(`% de Alumnos sobre el Promedio: ${c.porcentaje}%`)] })
    );
    parts.push(new Paragraph({ children: [new TextRun(instancia.analisis[idx] || '')] }));
  });
  return parts;
}

function generarGraficoDesempenoDOCX(path) {
  if (path && fs.existsSync(path)) {
    return new Paragraph({
      children: [
        new ImageRun({ data: fs.readFileSync(path), transformation: { width: 500, height: 250 } }),
      ],
    });
  }
  return null;
}

function generarTablaCriteriosPorIndicadorDOCX(instancia) {
  return buildDistribucionTableDOCX(instancia.criterios);
}

function generarConclusionDOCX(instancia) {
  if (!instancia.conclusion) return [];
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun('Conclusiones')] }),
    new Paragraph({ children: [new TextRun(instancia.conclusion)] }),
  ];
}

function generarRecomendacionesDOCX(instancia) {
  if (!Array.isArray(instancia.recomendaciones) || !instancia.recomendaciones.length) {
    return [];
  }
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun('Recomendaciones')] }),
    ...instancia.recomendaciones.map(r =>
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun(r)] })
    ),
  ];
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
    generarTablaResumenIndicadoresPDF(doc, contenido.resumenIndicadores);
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

    generarTablaResumenIndicadoresPDF(doc, contenido.resumenIndicadores);
    doc.moveDown();

    const ordinales = [
      'Primera',
      'Segunda',
      'Tercera',
      'Cuarta',
      'Quinta',
      'Sexta',
      'Séptima',
      'Octava',
      'Novena',
      'Décima',
    ];

    Object.keys(contenido.instancias)
      .sort((a, b) => a - b)
      .forEach(num => {
        const inst = contenido.instancias[num];
        const idx = Number(num) - 1;
        const titulo = ordinales[idx]
          ? `${ordinales[idx]} Instancia Evaluativa`
          : `Instancia Evaluativa ${num}`;
        doc.fontSize(14).text(titulo, { underline: true });
        doc.moveDown(0.5);
        generarBloqueDesgloseIndicadoresPDF(doc, inst);
        generarGraficoDesempenoPDF(doc, contenido.graficos && contenido.graficos[num]);
        generarConclusionPDF(doc, inst);
        generarRecomendacionesPDF(doc, inst);
      });


    if (contenido.graficos) {
      Object.entries(contenido.graficos)
        .filter(([k]) => isNaN(Number(k)))
        .forEach(([_, p]) => {
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

  const ordinales = [
    'Primera',
    'Segunda',
    'Tercera',
    'Cuarta',
    'Quinta',
    'Sexta',
    'Séptima',
    'Octava',
    'Novena',
    'Décima',
  ];

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
      const idx = Number(num) - 1;
      const titulo = ordinales[idx]
        ? `${ordinales[idx]} Instancia Evaluativa`
        : `Instancia Evaluativa ${num}`;
      instanciasParagraphs.push(
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(titulo)] })
      );
      instanciasParagraphs.push(...generarBloqueDesgloseIndicadoresDOCX(inst));
      const graf = generarGraficoDesempenoDOCX(contenido.graficos && contenido.graficos[num]);
      if (graf) instanciasParagraphs.push(graf);
      instanciasParagraphs.push(...generarConclusionDOCX(inst));
      instanciasParagraphs.push(...generarRecomendacionesDOCX(inst));
    });

  const grafParags = Object.entries(contenido.graficos || {})
    .filter(([k, p]) => isNaN(Number(k)) && p && fs.existsSync(p))
    .map(([_, p]) =>
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
        generarTablaResumenIndicadoresDOCX(contenido.resumenIndicadores),
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
