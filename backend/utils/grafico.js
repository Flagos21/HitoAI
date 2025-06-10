const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');
let ChartDataLabels;
try {
  ChartDataLabels = require('chartjs-plugin-datalabels');

} catch {
  ChartDataLabels = null;
}

const width = 900;
const height = 500;
const chartCallback = ChartJS => {
  if (ChartDataLabels) {
    ChartJS.register(ChartDataLabels);
  }
};
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

async function generarGraficoBarras(labels, datos, nombreArchivo = 'grafico.png') {
  const wrappedLabels = labels.map(l => l.match(/.{1,15}/g)?.join('\n') || l);

  const config = {
    type: 'bar',
    data: {
      labels: wrappedLabels,
      datasets: [{
        label: 'Alumnos sobre promedio (%)',
        data: datos,
        backgroundColor: 'rgba(0,123,255,0.8)',
      }],
    },
    options: {
      indexAxis: 'x',
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          title: { display: true, text: '% de Alumnos' },
        },
        x: {
          title: { display: true, text: 'Indicadores' },
        },
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          color: '#ffffff',
          anchor: 'center',
          align: 'center',
          formatter: v => `${v}%`,
        },
      },
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
  const wrappedLabels = labels.map(l => l.match(/.{1,15}/g)?.join('\n') || l);
  const config = {
    type: 'bar',
    data: {
      labels: wrappedLabels,
      datasets: [
        {
          label: 'Cumplimiento (%)',
          data: datos,
          backgroundColor: 'rgba(0,123,255,0.8)',
        },
      ],
    },
    options: {
      indexAxis: 'x',
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          title: { display: true, text: 'Cumplimiento (%)' },
        },
        x: { title: { display: true, text: 'Competencias' } },
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          color: '#ffffff',
          anchor: 'center',
          align: 'center',
          formatter: v => `${v}%`,
        },
      },
    },
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
