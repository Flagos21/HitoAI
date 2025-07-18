function parseCompetencias(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || '')
    .split(/\s*\+\s*/)
    .map(c => c.trim())
    .filter(Boolean);
}

function toNumber(val) {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  const n = parseFloat(val);
  return Number.isNaN(n) ? 0 : n;
}

function calcularResumenCompetencias(datos) {
  const map = {};
  datos.forEach(d => {
    const comps = parseCompetencias(d.competencias);
    if (!comps.length) comps.push('Desconocida');
    comps.forEach(c => {
      if (!map[c]) map[c] = { puntajeIdeal: 0, promedio: 0 };
      const max = toNumber(d.puntaje_maximo);
      const prom = toNumber(d.promedio_obtenido);
      // Count the full score for each associated competencia
      map[c].puntajeIdeal += max;
      map[c].promedio += prom;
    });
  });
  const resumen = Object.entries(map).map(([competencia, v]) => {
    const puntajeIdeal = Math.round(v.puntajeIdeal * 10) / 10;
    const promedio = Math.round(v.promedio * 10) / 10;
    const cumplimiento = puntajeIdeal
      ? Math.round((promedio / puntajeIdeal) * 100)
      : 0;
    return { competencia, puntajeIdeal, promedio, cumplimiento };
  });
  let totalIdeal = 0;
  let totalProm = 0;
  resumen.forEach(r => {
    totalIdeal += r.puntajeIdeal;
    totalProm += r.promedio;
  });
  const totalCumpl = totalIdeal ? Math.round((totalProm / totalIdeal) * 100) : 0;
  resumen.push({
    competencia: 'Total',
    puntajeIdeal: Math.round(totalIdeal * 10) / 10,
    promedio: Math.round(totalProm * 10) / 10,
    cumplimiento: totalCumpl,
  });
  return resumen;
}

function resumenMarkdown(resumen) {
  const header =
    '| Competencia | Puntaje Ideal | Promedio | % Cumplimiento |\n' +
    '|-------------|---------------|----------|----------------|';
  const rows = resumen
    .map(r =>
      `| ${r.competencia} | ${r.puntajeIdeal} | ${r.promedio} | ${r.cumplimiento}% |`
    )
    .join('\n');
  return `${header}\n${rows}`;
}

function analisisSimple(resumen) {
  return resumen
    .filter(r => r.competencia !== 'Total')
    .map(r => `- ${r.competencia}: cumplimiento ${r.cumplimiento}%`)
    .join('\n');
}

module.exports = {
  calcularResumenCompetencias,
  resumenMarkdown,
  analisisSimple,
};
