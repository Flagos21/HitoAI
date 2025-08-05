let ChartJSNodeCanvas;
try {
  ({ ChartJSNodeCanvas } = require('chartjs-node-canvas'));
} catch (err) {
  console.warn(
    'chartjs-node-canvas module not found. Run "npm install" in the backend directory to enable chart generation.'
  );
}

const fs = require('fs');
const path = require('path');
let ChartDataLabels;
try {
  ChartDataLabels = require('chartjs-plugin-datalabels');
} catch {
  ChartDataLabels = null;
}

const chroma = require('chroma-js'); // Color library for gradients

const width = 900;
const height = 500;
const chartCallback = ChartJS => {
  if (ChartDataLabels) {
    ChartJS.register(ChartDataLabels);
  }
};

const chartJSNodeCanvas = ChartJSNodeCanvas
  ? new ChartJSNodeCanvas({ width, height, chartCallback })
  : null;

function ensureDir() {
  const dir = path.join(__dirname, '..', 'public', 'img');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function generarGraficoBarras(labels, datos, nombreArchivo = 'grafico.png', titulo = 'Gráfico de Barras') {
  if (!chartJSNodeCanvas) return null;

  const colorMap = {
    Excelente: 'rgba(75, 192, 192, 0.8)',
    Aceptable: 'rgba(255, 205, 86, 0.8)',
    Insuficiente: 'rgba(255, 99, 132, 0.8)',
  };
  const defaultColors = [
    colorMap.Excelente,
    colorMap.Aceptable,
    colorMap.Insuficiente,
    'rgba(0,123,255,0.8)',
  ];

  const wrappedLabels = labels.map(l => l.match(/.{1,15}/g)?.join('\n') || l);
  let datasets = [];

  if (Array.isArray(datos) && typeof datos[0] === 'number') {
    datasets.push({
      label: 'Alumnos sobre promedio (%)',
      data: datos.map(d => Number(d) || 0),
      backgroundColor: defaultColors[3],
      maxBarThickness: 40,
      barPercentage: 0.5,
    });
  }

  const config = {
    type: 'bar',
    data: {
      labels: wrappedLabels,
      datasets,
    },
    options: {
      indexAxis: 'y',
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: { size: 16 },
        },
        legend: { display: datasets.length > 1 },
        datalabels: {
          color: '#ffffff',
          anchor: 'center',
          align: 'center',
          formatter: v => `${v}%`,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          title: { display: true, text: '% de Alumnos' },
        },
        y: {
          title: { display: true, text: 'Indicadores' },
        },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const filePath = path.join(ensureDir(), nombreArchivo);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}


async function generarGraficoTorta(
  labels,
  datos,
  nombreArchivo = 'torta.png',
  titulo = ''
) {
  if (!chartJSNodeCanvas) return null;
  const colors = [
    'rgba(33, 150, 243, 0.7)',
    'rgba(76, 175, 80, 0.7)',
    'rgba(255, 193, 7, 0.7)',
    'rgba(244, 67, 54, 0.7)',
    'rgba(156, 39, 176, 0.7)',
    'rgba(158, 158, 158, 0.7)',
  ];
  const config = {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data: datos,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),

        },
      ],
    },
    options: {
      plugins: {

        title: { display: !!titulo, text: titulo },

        datalabels: {
          color: '#000000',
          formatter: (val, ctx) => {
            const data = ctx.chart.data.datasets[0].data || [];
            const sum = data.reduce((acc, d) => acc + Number(d || 0), 0);
            const pct = sum ? (val / sum) * 100 : 0;
            return `${pct % 1 ? pct.toFixed(1) : pct}%`;
          },
        },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const filePath = path.join(ensureDir(), nombreArchivo);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

async function generarGraficoLineas(labels, datos, nombreArchivo = 'lineas.png', titulo = 'Gráfico de Cumplimiento') {
  if (!chartJSNodeCanvas) return null;

  datos = datos.map(d => Number(d) || 0);
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
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: { size: 16 },
        },
        legend: { display: false },
        datalabels: {
          color: '#ffffff',
          anchor: 'center',
          align: 'center',
          formatter: v => `${v}%`,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          title: { display: true, text: 'Cumplimiento (%)' },
        },
        x: { title: { display: true, text: 'Competencias' } },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const filePath = path.join(ensureDir(), nombreArchivo);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

module.exports = {
  generarGraficoBarras,
  generarGraficoTorta,
  generarGraficoLineas,
};
