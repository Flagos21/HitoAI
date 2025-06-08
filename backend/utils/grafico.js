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

module.exports = { generarGraficoBarras };
