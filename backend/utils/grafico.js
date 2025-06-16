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

async function generarGraficoBarras(labels, datos, nombreArchivo = 'grafico.png') {
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
  } else if (Array.isArray(datos)) {
    datasets = datos.map((ds, idx) => {
      const label = ds.label || `Serie ${idx + 1}`;
      const data = (ds.data || []).map(d => Number(d) || 0);
      const bg = ds.backgroundColor || ds.color || colorMap[label] || defaultColors[idx % defaultColors.length];
      return {
        label,
        data,
        backgroundColor: bg,
        maxBarThickness: 40,
        barPercentage: 0.5,
      };
    });
  } else if (typeof datos === 'object' && datos !== null) {
    datasets = Object.entries(datos).map(([label, data], idx) => ({
      label,
      data: (data || []).map(d => Number(d) || 0),
      backgroundColor: colorMap[label] || defaultColors[idx % defaultColors.length],
      maxBarThickness: 40,
      barPercentage: 0.5,
    }));
  }

  const config = {
    type: 'bar',
    data: {
      labels: wrappedLabels,
      datasets,
    },
    options: {
      indexAxis: 'y',
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
      plugins: {
        legend: { display: datasets.length > 1 },
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
  if (!chartJSNodeCanvas) return null;
  const config = {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data: datos,
          backgroundColor: labels.map((_, i) => {
            const colors = [
              'rgba(75, 192, 192, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 205, 86, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(201, 203, 207, 0.6)',
            ];
            return colors[i % colors.length];
          }),
        },
      ],
    },
    options: {
      plugins: {
        datalabels: {
          color: '#000000',
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

async function generarGraficoLineas(labels, datos, nombreArchivo = 'lineas.png') {
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
