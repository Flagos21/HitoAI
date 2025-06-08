const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');

const width = 800;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

async function generarGraficoBarras(labels, datos, nombreArchivo = 'grafico.png') {
  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Alumnos sobre promedio (%)',
        data: datos,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      }],
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const dir = path.join(__dirname, '..', 'public', 'img');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, nombreArchivo);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

async function generarGraficoTorta(labels, datos, nombreArchivo = 'torta.png') {
  const config = {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data: datos,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
        },
      ],
    },
  };
  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const dir = path.join(__dirname, '..', 'public', 'img');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, nombreArchivo);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

async function generarGraficoLineas(labels, datos, nombreArchivo = 'lineas.png') {
  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Cumplimiento %',
          data: datos,
          backgroundColor: 'rgba(153, 102, 255, 0.6)'
        }
      ]
    }
  };
  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const dir = path.join(__dirname, '..', 'public', 'img');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, nombreArchivo);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

module.exports = {
  generarGraficoBarras,
  generarGraficoTorta,
  generarGraficoLineas,
};
