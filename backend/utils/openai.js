const https = require('https');
require('dotenv').config();

const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = 'gpt-3.5-turbo';

function callOpenAI(prompt) {
  if (!API_KEY) {
    return Promise.resolve('(openai key missing) ' + prompt);
  }
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: 'Eres un asistente que redacta secciones de informes académicos.' }, { role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${API_KEY}`
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.choices[0].message.content);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function safe(prompt, fallback) {
  try {
    return await callOpenAI(prompt);
  } catch (e) {
    return fallback;
  }
}


exports.crearIntroduccion = (asignatura, carrera) => ({
  objetivo: {
    titulo: 'Objetivo del informe:',
    texto:
      `El propósito de este informe es analizar el desempeño de los estudiantes en el hito evaluativo de nivel básico de la asignatura "${asignatura}" de la carrera de ${carrera}. Este análisis se enfocará en medir el porcentaje de estudiantes que alcanzaron los objetivos establecidos en cada hito, así como la distribución de las calificaciones obtenidas. Además, se evaluará cómo este hito contribuye al cumplimiento del perfil de egreso de los alumnos de la carrera de ${carrera}, con el fin de identificar fortalezas y áreas de mejora en la formación académica y profesional de los estudiantes.`,
  },
  relevancia: {
    titulo:
      'Relevancia de los Hitos Evaluativos en el Contexto del Plan de Estudios',
    texto:
      `Los hitos evaluativos desempeñan un papel crucial en el contexto del plan de estudios de la carrera de ${carrera}. Estos hitos están diseñados para evaluar el progreso de los estudiantes en competencias clave, asegurando que adquieran y apliquen los conocimientos y habilidades necesarias para cumplir con los estándares académicos y profesionales esperados. Al estar alineados con los objetivos del plan de estudios, los hitos evaluativos permiten una evaluación continua y precisa del desarrollo académico de los estudiantes. La importancia de los hitos evaluativos radica en su capacidad para medir el cumplimiento del perfil de egreso de los estudiantes. El perfil de egreso define las competencias y habilidades que los estudiantes deben poseer al finalizar la carrera. A través de los hitos evaluativos, es posible verificar si los estudiantes están alcanzando estos objetivos y si están preparados para enfrentar los desafíos profesionales en el campo de la ${carrera}. Además, estos hitos proporcionan retroalimentación valiosa tanto para los estudiantes como para los docentes, facilitando la identificación de áreas de mejora y el ajuste de estrategias de enseñanza para mejorar el aprendizaje y el desempeño académico.`,
  },
});


exports.crearConclusion = asignatura =>
  safe(
    `Redacta la conclusión general del informe para la asignatura ${asignatura}.`,
    `Conclusión para ${asignatura}`
  );

exports.analizarCriterio = ({
  indicador,
  competencia,
  evaluacion,
  max,
  min,
  promedio,
  porcentaje,
  raNombre,
  raDescripcion,
  contenidoNucleo,
  contenidoDescripcion,
  asignaturaNombre,
  carreraNombre,
}) => {
  const prompt = `Teniendo en cuenta los datos de las tablas de Evaluación, Indicador, Resultado de Aprendizaje, Contenido y Aplicación, analiza pedagógicamente el criterio "${indicador}" evaluado en "${evaluacion}" dentro de la asignatura ${asignaturaNombre} de la carrera ${carreraNombre}. El contenido relacionado es "${contenidoNucleo}" (${contenidoDescripcion}) y corresponde al RA "${raNombre}" (${raDescripcion}). Se obtuvo un puntaje máximo de ${max}, un mínimo de ${min}, un promedio de ${promedio} y un logro del ${porcentaje}%. Incluye recomendaciones de mejora.`;
  const diff = max - min;
  let dispersion;
  if (diff > 5) dispersion = 'una alta dispersión en los resultados';
  else if (diff > 2) dispersion = 'cierta dispersión en los resultados';
  else dispersion = 'poca dispersión en los resultados';
  const tendencia = porcentaje >= 50 ? 'la mayoría de los estudiantes superó el promedio' : 'solo una minoría superó el promedio';
  const fallback =
    `El indicador "${indicador}" obtuvo un puntaje promedio de ${promedio}. ` +
    `El máximo alcanzado fue ${max} y el mínimo ${min}, evidenciando ${dispersion}. ` +
    `${porcentaje}% de los estudiantes estuvo sobre el promedio, por lo que ${tendencia}. ` +
    `Revisa las tablas de distribución de niveles y promedios por criterio para contextualizar estos resultados y orientar la retroalimentación.`;
  return safe(prompt, fallback);
};

exports.conclusionCompetencias = ({ resumen, asignaturaNombre, carreraNombre }) => {
  const prompt = `A partir de toda la información registrada en las evaluaciones y resúmenes de competencias, elabora una conclusión global sobre el rendimiento de los estudiantes en la asignatura ${asignaturaNombre} de la carrera ${carreraNombre}. Utiliza los porcentajes de cumplimiento por competencia: ${resumen}.`;
  return safe(prompt, `Conclusión de competencias: ${resumen}`);
};

exports.recomendacionesTemas = (temas, asignaturaNombre, carreraNombre) => {
  const prompt = `Considerando el desempeño observado en las evaluaciones y las necesidades detectadas, sugiere recomendaciones para mejorar los siguientes temas en la asignatura ${asignaturaNombre} de la carrera ${carreraNombre}: ${temas}.`;
  return safe(prompt, `Recomendaciones para ${temas}`);
};

exports.conclusionCriterios = ({ resumen, asignaturaNombre, carreraNombre }) => {
  const prompt = `Utilizando la información disponible en las tablas de Indicadores y Aplicación, redacta una síntesis del rendimiento alcanzado en los criterios: ${resumen}. Esta conclusión corresponde a la asignatura ${asignaturaNombre} de la carrera ${carreraNombre}.`;
  return safe(prompt, `Conclusion de criterios: ${resumen}`);
};

exports.recomendacionesCompetencia = (
  competencia,
  cumplimiento,
  asignaturaNombre,
  carreraNombre,
) => {
  const prompt = `Actúa como un experto pedagogo y, considerando toda la evidencia obtenida en las evaluaciones, propone acciones concretas y estrategias de enseñanza que permitan mejorar la competencia ${competencia} que actualmente presenta un ${cumplimiento}% de cumplimiento en la asignatura ${asignaturaNombre} de la carrera ${carreraNombre}.`;
  return safe(prompt, `Recomendaciones para ${competencia}`);
};

exports.analisisCompetencia = ({ competencia, puntajeIdeal, promedio, cumplimiento, asignaturaNombre, carreraNombre }) => {
  const prompt = `Con base en las cifras registradas en las distintas evaluaciones, analiza en detalle la competencia ${competencia} de la asignatura ${asignaturaNombre} de la carrera ${carreraNombre}. El puntaje ideal fue ${puntajeIdeal}, el promedio ${promedio} y el grado de cumplimiento ${cumplimiento}%. Explica posibles causas de estos resultados y cómo repercuten en la formación profesional.`;
  return safe(prompt, `Analisis de la competencia ${competencia}`);
};

exports.recomendacionesGenerales = (temas, asignaturaNombre, carreraNombre) => {
  const prompt = `Revisa los resultados obtenidos en las distintas evaluaciones y formula recomendaciones generales para reforzar los temas ${temas} en la asignatura ${asignaturaNombre} de la carrera ${carreraNombre}.`;
  return safe(prompt, `Recomendaciones para ${temas}`);
};

exports.conclusionRA = ({
  raNombre,
  raDescripcion,
  promedio,
  asignaturaNombre,
  carreraNombre,
}) => {
  const prompt = `Tomando en cuenta la información de las tablas relacionadas con el resultado de aprendizaje, redacta una conclusión breve sobre "${raNombre}" (${raDescripcion}) en la asignatura ${asignaturaNombre} de la carrera ${carreraNombre}. El promedio de sus indicadores es ${promedio}.`;
  return safe(prompt, `Conclusión de ${raNombre}: ${promedio}`);
};

