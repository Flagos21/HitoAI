
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
  Table,
  TableRow,
  TableCell,
  TextRun,
  ImageRun,
  AlignmentType,
  HeadingLevel,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  ShadingType,
  Chart,
  ChartType;
try {
  ({
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    ImageRun,
  AlignmentType,
  HeadingLevel,
  WidthType,
  BorderStyle,
    Header,
    Footer,
    ShadingType,
    Chart,
    ChartType,
  } = require('docx'));
} catch (err) {
  console.warn(
    'docx module not found. Run "npm install" in the backend directory to enable DOCX generation.'
  );
}

function drawCriteriaTablePDF(doc, criterios) {
  const startX = doc.x;
  const widths = [100, 180, 40, 40, 50, 70, 80];
  const headers = ['Instancia', 'Criterio', 'Max', 'Min', 'Prom', '%>Prom', 'Comp.'];
  doc.font('Helvetica-Bold');
  headers.forEach((h, i) => {
    const x = startX + widths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(h, x, doc.y, { width: widths[i] });
  });
  doc.moveDown();
  doc.font('Helvetica');
  criterios.forEach(c => {
    let x = startX;
    const nombreInst = c.evaluacion || `Instancia ${c.instancia}`;
    doc.text(nombreInst, x, doc.y, { width: widths[0] });
    x += widths[0];
    doc.text(c.indicador, x, doc.y, { width: widths[1] });
    x += widths[1];
    doc.text(String(c.maximo), x, doc.y, { width: widths[2] });
    x += widths[2];
    doc.text(String(c.minimo), x, doc.y, { width: widths[3] });
    x += widths[3];
    doc.text(String(c.promedio), x, doc.y, { width: widths[4] });
    x += widths[4];
    doc.text(`${c.porcentaje}%`, x, doc.y, { width: widths[5] });
    x += widths[5];
    doc.text(c.competencia, x, doc.y, { width: widths[6] });
    doc.moveDown();
  });
}

function buildCriteriaTableDOCX(criterios) {
  const header = new TableRow({
    children: ['Instancia', 'Criterio', 'Max', 'Min', 'Prom', '%>Prom', 'Comp.'].map(
      t =>
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
  criterios.forEach(c => {
    rows.push(
      new TableRow({
        children: [
          c.evaluacion || `Instancia ${c.instancia}`,
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

function generarTablaPromediosPorCriterioPDF(doc, instancia) {
  drawPromedioTablePDF(doc, instancia.criterios);
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

function generarTablaCompetenciasInstanciaPDF(doc, instancia) {
  drawCompetenciaTablePDF(doc, instancia.competenciasResumen || []);
  doc.moveDown();
}

function generarAnalisisCompetenciasPDF(doc, instancia) {
  (instancia.competenciasResumen || []).forEach((c, idx) => {
    doc.font('Helvetica-Bold').text(c.competencia);
    doc.font('Helvetica');
    doc.text(`Puntaje Ideal: ${c.puntajeIdeal}`);
    doc.text(`Promedio: ${c.promedio}`);
    doc.text(`% Cumplimiento: ${c.cumplimiento}%`);
    if (instancia.competenciasAnalisis && instancia.competenciasAnalisis[idx]) {
      doc.text(instancia.competenciasAnalisis[idx], { align: 'justify' });
    }
    doc.moveDown();
  });
}

function generarRecomendacionesCompetenciasPDF(doc, instancia) {
  if (Array.isArray(instancia.recomendacionesCompetencias) && instancia.recomendacionesCompetencias.length) {
    doc.font('Helvetica-Bold').text('Recomendaciones pedagógicas por competencia');
    doc.font('Helvetica');
    instancia.competenciasResumen.forEach((c, idx) => {
      doc.text(`\u2022 ${c.competencia}: ${instancia.recomendacionesCompetencias[idx]}`);
    });
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

function drawPromedioTablePDF(doc, indicadores) {
  const levelMap = {};
  indicadores.forEach(ind => {
    (ind.niveles || []).forEach(n => {
      if (!levelMap[n.nombre] || n.rMax > levelMap[n.nombre]) {
        levelMap[n.nombre] = n.rMax;
      }
    });
  });
  const niveles = Object.entries(levelMap)
    .sort((a, b) => b[1] - a[1])
    .map(([n]) => n);

  const startX = doc.x;
  const widths = [180, ...niveles.map(() => 50), ...niveles.map(() => 60)];
  const headers = [
    'Indicador',
    ...niveles,
    ...niveles.map(n => `${n} (%)`),
  ];

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
      const p = (ind.promedios || []).find(l => l.nombre === n);
      const val = p ? String(p.promedio) : '-';
      doc.rect(x, y, widths[idx + 1], rowHeight).stroke();
      doc.text(val, x, y + 5, { width: widths[idx + 1], align: 'center' });
      x += widths[idx + 1];
    });
    niveles.forEach((n, idx) => {
      const q = (ind.niveles || []).find(l => l.nombre === n);
      const pct = q ? `${q.porcentaje}%` : '-';
      doc.rect(x, y, widths[niveles.length + idx + 1], rowHeight).stroke();
      doc.text(pct, x, y + 5, {
        width: widths[niveles.length + idx + 1],
        align: 'center',
      });
      x += widths[niveles.length + idx + 1];
    });
    y += rowHeight;
  });
  doc.moveDown();
}

function drawCompetenciaTablePDF(doc, resumen) {
  const startX = doc.x;
  const widths = [140, 80, 80, 80];
  const headers = ['Competencia', 'Ideal', 'Promedio', '% Cumpl.'];
  doc.font('Helvetica-Bold');
  headers.forEach((h, i) => {
    const x = startX + widths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(h, x, doc.y, { width: widths[i], align: 'center' });
  });
  doc.moveDown();
  doc.font('Helvetica');
  let totalIdeal = 0;
  let totalProm = 0;
  resumen.forEach(r => {
    let x = startX;
    doc.text(r.competencia, x, doc.y, { width: widths[0], align: 'center' });
    x += widths[0];
    doc.text(String(r.puntajeIdeal), x, doc.y, { width: widths[1], align: 'center' });
    x += widths[1];
    doc.text(String(r.promedio), x, doc.y, { width: widths[2], align: 'center' });
    x += widths[2];
    doc.text(`${r.cumplimiento}%`, x, doc.y, { width: widths[3], align: 'center' });
    doc.moveDown();
    totalIdeal += r.puntajeIdeal;
    totalProm += r.promedio;
  });
  const totalCumpl = totalIdeal ? Math.round((totalProm / totalIdeal) * 100) : 0;
  doc.font('Helvetica-Bold');
  let x = startX;
  doc.text('Total', x, doc.y, { width: widths[0], align: 'center' });
  x += widths[0];
  doc.text(String(totalIdeal), x, doc.y, { width: widths[1], align: 'center' });
  x += widths[1];
  doc.text(String(Math.round(totalProm * 10) / 10), x, doc.y, { width: widths[2], align: 'center' });
  x += widths[2];
  doc.text(`${totalCumpl}%`, x, doc.y, { width: widths[3], align: 'center' });
  doc.moveDown();
}

function buildPromedioTableDOCX(indicadores) {
  const levelMap = {};
  indicadores.forEach(ind => {
    (ind.niveles || []).forEach(n => {
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
        ...niveles.map(n => {
          const p = (ind.promedios || []).find(l => l.nombre === n);
          const val = p ? String(p.promedio) : '-';
          return new TableCell({
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(val)] }),
            ],
          });
        }),
        ...niveles.map(n => {
          const q = (ind.niveles || []).find(l => l.nombre === n);
          const pct = q ? `${q.porcentaje}%` : '-';
          return new TableCell({
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(pct)] }),
            ],
          });
        }),
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

function buildCompetenciaTableDOCX(resumen) {
  const header = new TableRow({
    children: ['Competencia', 'Ideal', 'Promedio', '% Cumpl.'].map(t =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })],
      })
    ),
  });
  let totalIdeal = 0;
  let totalProm = 0;
  const rows = resumen.map(r => {
    totalIdeal += r.puntajeIdeal;
    totalProm += r.promedio;
    return new TableRow({
      children: [
        r.competencia,
        String(r.puntajeIdeal),
        String(r.promedio),
        `${r.cumplimiento}%`,
      ].map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun(String(t))] })] })),
    });
  });
  const totalCumpl = totalIdeal ? Math.round((totalProm / totalIdeal) * 100) : 0;
  rows.push(
    new TableRow({
      children: [
        'Total',
        String(totalIdeal),
        String(Math.round(totalProm * 10) / 10),
        `${totalCumpl}%`,
      ].map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun(String(t))], bold: true })] })),
    })
  );
  return new Table({ rows: [header, ...rows] });
}

function generarTablaResumenIndicadoresDOCX(criterios) {
  return buildCriteriaTableDOCX(criterios);
}

function generarBloqueDesgloseIndicadoresDOCX(instancia) {
  const parts = [];
  instancia.criterios.forEach((c, idx) => {
    parts.push(
      new Paragraph({
        style: 'ListParagraph',
        bullet: { level: 0 },
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

function buildBarChart(labels, values) {
  if (!Chart) return null;
  return new Chart({
    type: ChartType.COLUMN,
    width: 500,
    height: 250,
    legend: { position: 'none' },
    axes: {
      category: { title: 'Indicadores' },
      value: { min: 0, max: 100, title: '% de Alumnos' },
    },
    series: [
      {
        name: 'Alumnos sobre promedio (%)',
        labels,
        values,
        color: '4472C4',
      },
    ],
  });
}

function generarGraficoDesempenoDOCX(labels, values, imgPath) {
  if (imgPath && fs.existsSync(imgPath)) {
    return new Paragraph({
      children: [
        new ImageRun({
          data: fs.readFileSync(imgPath),
          transformation: { width: 500, height: 250 },
        }),
      ],
    });
  }
  const chart = buildBarChart(labels, values);
  if (!chart) return null;
  return new Paragraph({ children: [chart] });
}

function generarGraficoDistribucionNivelesDOCX(instancia, imgPath) {
  const nivelMap = {};
  instancia.criterios.forEach(c => {
    (c.niveles || []).forEach(n => {
      if (!nivelMap[n.nombre]) nivelMap[n.nombre] = 0;
      nivelMap[n.nombre] += n.porcentaje || 0;
    });
  });
  const labels = Object.keys(nivelMap);
  if (!labels.length) return null;
  const values = labels.map(l => nivelMap[l] / instancia.criterios.length);
  return generarGraficoDesempenoDOCX(labels, values, imgPath);
}

function generarTablaCriteriosPorIndicadorDOCX(instancia) {
  return buildDistribucionTableDOCX(instancia.criterios);
}

function generarTablaPromediosPorCriterioDOCX(instancia) {
  return buildPromedioTableDOCX(instancia.criterios);
}

function generarConclusionDOCX(instancia) {
  if (!instancia.conclusion) return [];
  return [
    new Paragraph({ style: 'ListParagraph', bullet: { level: 0 }, children: [new TextRun('Conclusiones')] }),
    new Paragraph({ children: [new TextRun(instancia.conclusion)] }),
  ];
}

function generarRecomendacionesDOCX(instancia) {
  if (!Array.isArray(instancia.recomendaciones) || !instancia.recomendaciones.length) {
    return [];
  }
  return [
    new Paragraph({ style: 'ListParagraph', bullet: { level: 0 }, children: [new TextRun('Recomendaciones')] }),
    ...instancia.recomendaciones.map(r =>
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun(r)] })
    ),
  ];
}

function generarTablaCompetenciasInstanciaDOCX(instancia) {
  return buildCompetenciaTableDOCX(instancia.competenciasResumen || []);
}

function generarAnalisisCompetenciasDOCX(instancia) {
  const parts = [];
  (instancia.competenciasResumen || []).forEach((c, idx) => {
    parts.push(
      new Paragraph({
        style: 'ListParagraph',
        bullet: { level: 0 },
        children: [new TextRun(c.competencia)],
      })
    );
    parts.push(new Paragraph({ children: [new TextRun(`Puntaje Ideal: ${c.puntajeIdeal}`)] }));
    parts.push(new Paragraph({ children: [new TextRun(`Promedio: ${c.promedio}`)] }));
    parts.push(new Paragraph({ children: [new TextRun(`% Cumplimiento: ${c.cumplimiento}%`)] }));
    if (instancia.competenciasAnalisis && instancia.competenciasAnalisis[idx]) {
      parts.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun(instancia.competenciasAnalisis[idx])] }));
    }
  });
  return parts;
}

function generarRecomendacionesCompetenciasDOCX(instancia) {
  if (!Array.isArray(instancia.recomendacionesCompetencias) || !instancia.recomendacionesCompetencias.length) {
    return [];
  }
  return [
    new Paragraph({ style: 'ListParagraph', bullet: { level: 0 }, children: [new TextRun('Recomendaciones pedagógicas por competencia')] }),
    ...instancia.competenciasResumen.map((c, idx) =>
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun(`${c.competencia}: ${instancia.recomendacionesCompetencias[idx]}`)] })
    ),
  ];
}

function drawRATablePDF(doc, resumen) {
  const startX = doc.x;
  const widths = [250, 80];
  const headers = ['Resultado de Aprendizaje', 'Promedio'];
  doc.font('Helvetica-Bold');
  headers.forEach((h, i) => {
    const x = startX + widths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(h, x, doc.y, { width: widths[i], align: 'center' });
  });
  doc.moveDown();
  doc.font('Helvetica');
  resumen.forEach(r => {
    let x = startX;
    doc.text(r.ra, x, doc.y, { width: widths[0], align: 'center' });
    x += widths[0];
    doc.text(String(r.promedio), x, doc.y, { width: widths[1], align: 'center' });
    doc.moveDown();
  });
}

function buildRATableDOCX(resumen) {
  const header = new TableRow({
    children: ['Resultado de Aprendizaje', 'Promedio'].map(t =>
      new TableCell({
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true })] }),
        ],
      })
    ),
  });
  const rows = resumen.map(r =>
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(r.ra)] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(String(r.promedio))] })] }),
      ],
    })
  );
  return new Table({ rows: [header, ...rows] });
}

function generarConclusionRAPDF(doc, instancia) {
  if (Array.isArray(instancia.raConclusiones) && instancia.raConclusiones.length) {
    doc.font('Helvetica-Bold').text('Conclusiones por RA');
    doc.font('Helvetica');
    instancia.raConclusiones.forEach((c, idx) => {
      const nombre = instancia.raResumen && instancia.raResumen[idx] ? instancia.raResumen[idx].ra : '';
      doc.text(`• ${nombre}: ${c}`);
    });
    doc.moveDown();
  }
}

function generarConclusionRADOCX(instancia) {
  if (!Array.isArray(instancia.raConclusiones) || !instancia.raConclusiones.length) {
    return [];
  }
  const parts = [new Paragraph({ style: 'ListParagraph', bullet: { level: 0 }, children: [new TextRun('Conclusiones por RA')] })];
  instancia.raConclusiones.forEach((c, idx) => {
    const nombre = instancia.raResumen && instancia.raResumen[idx] ? instancia.raResumen[idx].ra : '';
    parts.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(`${nombre}: ${c}`)] }));
  });
  return parts;
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
            style: 'ListParagraph',
            alignment: AlignmentType.CENTER,
            children: [new TextRun('INFORME DE ASIGNATURA')],
          }),
          new Paragraph({
            style: 'ListParagraph',
            alignment: AlignmentType.CENTER,
            children: [new TextRun(contenido.datos.Nombre)],
          }),
          new Paragraph({
            style: 'ListParagraph',
            children: [new TextRun(contenido.introduccion.objetivo.titulo)],
          }),
          new Paragraph({

            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun(contenido.introduccion.objetivo.texto)],
          }),
          new Paragraph({
            style: 'ListParagraph',
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

    doc.fontSize(18).font('Helvetica-Bold').text('INFORME DE ASIGNATURA INTEGRADORA DE SABERES I', { align: 'center' });
    doc.moveDown();
    const intro = contenido.introduccion;
    doc.fontSize(14).font('Helvetica-Bold').text(intro.objetivo.titulo);
    doc.fontSize(12).font('Helvetica').text(intro.objetivo.texto, { align: 'justify' });
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text(intro.relevancia.titulo);
    doc.fontSize(12).font('Helvetica').text(intro.relevancia.texto, { align: 'justify' });
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
        // B. Desglose por indicador
        generarBloqueDesgloseIndicadoresPDF(doc, inst);
        // C. Gráfico por instancia
        generarGraficoDesempenoPDF(doc, contenido.graficos && contenido.graficos[num]);
        // D. Conclusiones de instancia
        generarConclusionPDF(doc, inst);
        // E. Recomendaciones generales de instancia
        generarRecomendacionesPDF(doc, inst);
        // F. Tabla de desempeño por criterio (rúbrica)
        doc.fontSize(14).text('Promedio por Criterio', { underline: true });
        doc.moveDown(0.5);
        generarTablaPromediosPorCriterioPDF(doc, inst);
        // Se omite la generación de tablas y conclusiones por Resultado de Aprendizaje
        // if (inst.raResumen && inst.raResumen.length) {
        //   doc.fontSize(14).text('Resultados por RA', { underline: true });
        //   doc.moveDown(0.5);
        //   drawRATablePDF(doc, inst.raResumen);
        //   generarConclusionRAPDF(doc, inst);
        // }
        // G. Tabla de cumplimiento por competencia
        generarTablaCompetenciasInstanciaPDF(doc, inst);
        // H. Análisis por competencia
        generarAnalisisCompetenciasPDF(doc, inst);
        // I. Recomendaciones por competencia
        generarRecomendacionesCompetenciasPDF(doc, inst);
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
    contenido.competencias.forEach((c, idx) => {
      doc.text(
        `${c.ID_Competencia} - Ideal: ${c.puntaje_ideal} Promedio: ${c.puntaje_promedio} Cumplimiento: ${c.cumplimiento}%`
      );
      if (contenido.recomendacionesComp && contenido.recomendacionesComp[idx]) {
        doc.text(`Recomendación: ${contenido.recomendacionesComp[idx]}`);
      }
    });

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Conclusiones Generales');
    doc.font('Helvetica').text(contenido.conclusion, { align: 'justify' });
    doc.moveDown();
    doc.font('Helvetica-Bold').text('Recomendaciones Generales');
    doc.font('Helvetica').text(contenido.recomendaciones, { align: 'justify' });
    if (contenido.recomendacionesTemasFinal) {
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Recomendaciones por tema');
      doc.font('Helvetica').text(contenido.recomendacionesTemasFinal, { align: 'justify' });
    }

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
        new Paragraph({ style: 'ListParagraph', children: [new TextRun(titulo)] })
      );
      // B. Desglose por indicador
      instanciasParagraphs.push(...generarBloqueDesgloseIndicadoresDOCX(inst));
      // C. Gráfico por instancia
      const graf = generarGraficoDesempenoDOCX(
        inst.criterios.map(c => c.indicador),
        inst.criterios.map(c => c.porcentaje),
        contenido.graficos && contenido.graficos[num]
      );
      if (graf) instanciasParagraphs.push(graf);
      // D. Tabla de distribución de niveles por criterio
      instanciasParagraphs.push(generarTablaCriteriosPorIndicadorDOCX(inst));
      const grafNivel = generarGraficoDistribucionNivelesDOCX(inst);
      if (grafNivel) instanciasParagraphs.push(grafNivel);
      // Se omite la generación de tablas y conclusiones por Resultado de Aprendizaje
      // if (inst.raResumen && inst.raResumen.length) {
      //   instanciasParagraphs.push(buildRATableDOCX(inst.raResumen));
      //   instanciasParagraphs.push(...generarConclusionRADOCX(inst));
      // }
      // E. Análisis, conclusiones y recomendaciones por competencia
      instanciasParagraphs.push(generarTablaCompetenciasInstanciaDOCX(inst));
      instanciasParagraphs.push(...generarAnalisisCompetenciasDOCX(inst));
      instanciasParagraphs.push(...generarRecomendacionesCompetenciasDOCX(inst));
    });

  const grafParags = [];
  if (Array.isArray(contenido.datos) && contenido.datos.length) {
    const g = generarGraficoDesempenoDOCX(
      contenido.datos.map(d => d.indicador),
      contenido.datos.map(d => d.porcentaje),
      contenido.graficos && contenido.graficos.barrasPath
    );
    if (g) grafParags.push(g);
  }
  if (Array.isArray(contenido.competencias) && contenido.competencias.length) {
    const g = generarGraficoDesempenoDOCX(
      contenido.competencias.map(c => c.ID_Competencia),
      contenido.competencias.map(c => c.cumplimiento),
      contenido.graficos && contenido.graficos.compPath
    );
    if (g) grafParags.push(g);
  }

  const header = new Header({
    children: [
      new Paragraph({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: '4472C4' },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'Universidad Adventista de Chile',
            color: 'FFFFFF',
            bold: true,
          }),
        ],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: '4472C4' },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: 'Universidad Adventista de Chile',
            color: 'FFFFFF',
            size: 18,
          }),
        ],
      }),
      new Paragraph({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: '4472C4' },
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: 'ingenieria civil informática',
            color: 'FFFFFF',
            size: 18,
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    properties: {
      title: 'Universidad Adventista de Chile',
      creator: 'ingenieria civil informática',
      lastModifiedBy: 'Fabian Pavez',
      lastPrinted: new Date('2024-07-12T16:57:00Z'),
      created: new Date('2024-07-09T14:26:00Z'),
      modified: new Date('2025-06-10T22:29:00Z'),
    },
    sections: [
      {
        headers: { default: header },
        footers: { default: footer },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [new TextRun('INFORME DE ASIGNATURA INTEGRADORA DE SABERES I')],
            spacing: { after: 200 },
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun(contenido.introduccion.objetivo.titulo)],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            children: [new TextRun(contenido.introduccion.objetivo.texto)],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun(contenido.introduccion.relevancia.titulo)],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            children: [new TextRun(contenido.introduccion.relevancia.texto)],
          }),
          generarTablaResumenIndicadoresDOCX(contenido.resumenIndicadores),
          new Paragraph({}),
          ...instanciasParagraphs,
          new Paragraph({}),
          new Paragraph({
            style: 'ListParagraph',
            children: [new TextRun('Cumplimiento por Competencia')],
          }),
          compTable,
          new Paragraph({}),
          ...(contenido.recomendacionesComp || []).map(t =>
            new Paragraph({ children: [new TextRun(`Recomendación: ${t}`)] })
          ),
          ...grafParags,
          new Paragraph({ style: 'ListParagraph', children: [new TextRun('Conclusiones Generales')] }),
          new Paragraph({ children: [new TextRun(contenido.conclusion)] }),
          new Paragraph({ style: 'ListParagraph', children: [new TextRun('Recomendaciones Generales')] }),
          new Paragraph({ children: [new TextRun(contenido.recomendaciones)] }),
          ...(contenido.recomendacionesTemasFinal
            ? [
                new Paragraph({ style: 'ListParagraph', children: [new TextRun('Recomendaciones por tema')] }),
                new Paragraph({ children: [new TextRun(contenido.recomendacionesTemasFinal)] }),
              ]
            : [])
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
};
