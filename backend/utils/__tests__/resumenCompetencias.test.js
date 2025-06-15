const assert = require('assert');
const { calcularResumenCompetencias } = require('../resumenCompetencias');

// Helper to find a row by competencia
function row(resumen, competencia) {
  return resumen.find(r => r.competencia === competencia);
}

// Test splitting of points when multiple competencias are present
const resumen = calcularResumenCompetencias([
  { puntaje_maximo: 10, promedio_obtenido: 8, competencias: 'C1 + C2' },
  { puntaje_maximo: 5, promedio_obtenido: 2, competencias: 'C1' }
]);

const c1 = row(resumen, 'C1');
const c2 = row(resumen, 'C2');
const total = row(resumen, 'Total');

assert.strictEqual(c1.puntajeIdeal, 10);
assert.strictEqual(c1.promedio, 6);
assert.strictEqual(c2.puntajeIdeal, 5);
assert.strictEqual(c2.promedio, 4);
assert.strictEqual(total.puntajeIdeal, 15);
assert.strictEqual(total.promedio, 10);

console.log('All tests passed');

