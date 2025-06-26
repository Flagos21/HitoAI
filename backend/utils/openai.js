// openai.js (versión final con funciones completas y nombres de competencias desde la base de datos)

const https = require('https');
require('dotenv').config();
const competenciaService = require('../services/competencia.service');

const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = 'gpt-3.5-turbo';

let COMPETENCIAS_CACHE = {};

async function cargarCompetencias() {
  if (Object.keys(COMPETENCIAS_CACHE).length) return COMPETENCIAS_CACHE;
  try {
    const resultados = await competenciaService.getAll();
    for (const c of resultados) {
      const id = c.ID_Competencia;
      const nombre = c.Nombre?.trim() || '';
      const descripcion = c.Descripcion?.trim() || '';
      COMPETENCIAS_CACHE[id] = `${id}: ${nombre} - ${descripcion}`;
    }
    return COMPETENCIAS_CACHE;
  } catch (err) {
    console.warn('⚠️ Error al cargar competencias desde la base de datos:', err.message);
    return {};
  }
}

function callOpenAI(prompt) {
  if (!API_KEY) {
    console.error('❌ OPENAI_API_KEY no está definido en el entorno');
    return Promise.reject(new Error('OpenAI key missing'));
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente que redacta informes académicos universitarios. Usa un lenguaje técnico, evita adjetivos vagos o subjetivos, y basa tus conclusiones en evidencia. Sé claro, objetivo y académico.'
        },
        { role: 'user', content: prompt }
      ]
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${API_KEY}`
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (!json.choices || !json.choices.length) {
            console.warn('⚠️ Respuesta sin contenido de OpenAI:', body);
            return reject(new Error('Respuesta sin contenido'));
          }
          const content = json.choices[0].message.content;
          resolve(content);
        } catch (e) {
          console.error('❌ Error al parsear respuesta de OpenAI:', e.message);
          console.error('Cuerpo recibido:', body);
          reject(e);
        }
      });
    });

    req.on('error', e => {
      console.error('❌ Error al hacer la solicitud a OpenAI:', e.message);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function safe(prompt, fallback) {
  try {
    console.log('\n🔍 Enviando prompt a OpenAI:\n' + prompt.slice(0, 500) + '\n...');
    const respuesta = await callOpenAI(prompt);
    console.log('✅ OpenAI respondió correctamente');
    return respuesta;
  } catch (e) {
    console.warn('⚠️ Fallback activado por error en OpenAI:', e.message);
    return fallback;
  }
}

function crearIntroduccion(asignatura, carrera) {
  return {
    objetivo: {
      titulo: 'Objetivo del informe:',
      texto: `El propósito de este informe es analizar el desempeño de los estudiantes en el hito evaluativo de nivel básico de la asignatura "${asignatura}" de la carrera de ${carrera}. Este análisis se enfocará en medir el porcentaje de estudiantes que alcanzaron los objetivos establecidos, así como la distribución de los puntajes obtenidos. Además, se evaluará el grado de contribución al perfil de egreso para proponer mejoras pedagógicas.`,
    },
    relevancia: {
      titulo: 'Relevancia de los Hitos Evaluativos en el Plan de Estudios',
      texto: `Los hitos evaluativos permiten verificar el logro de competencias claves asociadas al perfil de egreso de la carrera de ${carrera}. Están alineados con los resultados de aprendizaje de la asignatura "${asignatura}" y permiten realizar ajustes informados al proceso de enseñanza-aprendizaje.`,
    },
  };
}

function buildIndicatorFallback({ indicador, max, min, promedio, porcentaje }) {
  const diff = max - min;
  let dispersion = diff >= 6 ? 'una dispersión muy amplia'
    : diff >= 3 ? 'una diferencia notable entre puntajes'
    : 'poca variación en los puntajes';

  let tendencia = porcentaje >= 60 ? 'la mayoría de los estudiantes superó el promedio'
    : porcentaje >= 40 ? 'aproximadamente la mitad superó el promedio'
    : 'solo una minoría superó el promedio';

  return (
    `El indicador "${indicador}" obtuvo un puntaje promedio de ${promedio}. ` +
    `El máximo fue ${max} y el mínimo ${min}, mostrando ${dispersion}. ` +
    `El ${porcentaje}% de los estudiantes estuvo sobre el promedio, por lo que ${tendencia}. ` +
    `Revisa las tablas asociadas para comprender el contexto y orientar la retroalimentación.`
  );
}

async function analizarCriterio(data) {
  const competencias = await cargarCompetencias();
  const texto = (data.competencia || '').split('+').map(id => {
    const c = competencias[id.trim()];
    return c ? c : id.trim();
  }).join(' + ');

  const prompt = `Actúa como un experto pedagogo. ` +
    `Analiza el indicador "${data.indicador}" (criterio "${texto}") ` +
    `evaluado en "${data.evaluacion}" de la asignatura "${data.asignaturaNombre}" de la carrera "${data.carreraNombre}". ` +
    `Relaciona el contenido "${data.contenidoNucleo}" (${data.contenidoDescripcion}) con el RA "${data.raNombre}" (${data.raDescripcion}). ` +
    `Analiza los valores obtenidos (máx: ${data.max}, mín: ${data.min}, promedio: ${data.promedio}, logro: ${data.porcentaje}%) ` +
    `y entrega observaciones pedagógicas.`;

  const fallback = buildIndicatorFallback(data);
  return safe(prompt, fallback);
}

async function analisisCompetencia(data) {
  const competencias = await cargarCompetencias();
  const texto = competencias[data.competencia] || data.competencia;
  const prompt = `Con base en los resultados de evaluación, analiza la competencia "${texto}" en la asignatura "${data.asignaturaNombre}" de la carrera "${data.carreraNombre}". ` +
    `El puntaje ideal fue ${data.puntajeIdeal}, el promedio ${data.promedio} y el cumplimiento ${data.cumplimiento}%. Describe posibles causas y consecuencias pedagógicas.`;
  return safe(prompt, `Análisis de la competencia ${texto}`);
}

async function recomendacionesCompetencia(competencia, cumplimiento, asignaturaNombre, carreraNombre) {
  const competencias = await cargarCompetencias();
  const texto = competencias[competencia] || competencia;
  const prompt = `Sugiere estrategias pedagógicas para mejorar la competencia "${texto}" con un cumplimiento del ${cumplimiento}% en la asignatura "${asignaturaNombre}" de la carrera "${carreraNombre}".`;
  return safe(prompt, `Recomendaciones para ${texto}`);
}

async function conclusionCriterios({ resumen, asignaturaNombre, carreraNombre }) {
  const prompt = `Como experto en evaluación educativa, analiza los criterios ${resumen} en la asignatura "${asignaturaNombre}" de la carrera "${carreraNombre}". Explica los patrones observados y sus implicancias pedagógicas.`;
  return safe(prompt, `Conclusión de criterios: ${resumen}`);
}

async function recomendacionesTemas(temas, asignaturaNombre, carreraNombre) {
  const prompt = `Revisa los resultados obtenidos y formula recomendaciones para reforzar los temas: ${temas} en la asignatura "${asignaturaNombre}" de la carrera "${carreraNombre}".`;
  return safe(prompt, `Recomendaciones para ${temas}`);
}

async function recomendacionesGenerales(asignaturaNombre, carreraNombre) {
  const prompt = `Revisa los resultados obtenidos en las distintas evaluaciones y formula recomendaciones generales para reforzar los temas de la asignatura "${asignaturaNombre}" de la carrera "${carreraNombre}".`;
  return safe(prompt, `Recomendaciones generales para ${asignaturaNombre}`);
}

async function conclusionCompetencias({ resumen, asignaturaNombre, carreraNombre }) {
  const prompt = `Actúa como un experto pedagogo. Basándote en los porcentajes de cumplimiento por competencia (${resumen}), redacta una conclusión sobre el desempeño de los estudiantes en la asignatura "${asignaturaNombre}" de la carrera "${carreraNombre}". Describe tendencias, fortalezas, debilidades y acciones de mejora.`;
  return safe(prompt, `Conclusión de competencias: ${resumen}`);
}

module.exports = {
  callOpenAI,
  safe,
  crearIntroduccion,
  analizarCriterio,
  analisisCompetencia,
  recomendacionesCompetencia,
  buildIndicatorFallback,
  cargarCompetencias,
  conclusionCriterios,
  recomendacionesTemas,
  recomendacionesGenerales,
  conclusionCompetencias
};
