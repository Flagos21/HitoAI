const https = require('https');

const API_KEY = process.env.OPENAI_KEY ||
  'sk-proj-GznLKfiW7SV3JIXLOUC-jPNQLSM-obg1RqpG7evvy5x0DkfqHJ4yг6OKABQbGG_DjDUgEhpwz0T3BIbkFJ9_6-YuJ3WQDZIg3a71A0mdF7D7CnUOR7GmKBb0-TO7SuXwk|7Bomz-IgExeYoj0ulP55vCB8A';
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

exports.analizarCriterio = ({ indicador, competencia, evaluacion, max, min, promedio, porcentaje }) => {
  const prompt = `Redacta un análisis pedagógico y recomendaciones para el criterio: "${indicador}". Competencia: ${competencia}. Evaluación: ${evaluacion}. Resultados: Máximo ${max}, Mínimo ${min}, Promedio ${promedio}, ${porcentaje}% sobre el promedio.`;
  return safe(prompt, `Análisis de ${indicador}`);
};

exports.conclusionCompetencias = resumen => {
  const prompt = `Redacta una conclusión general del rendimiento de los estudiantes en base a los siguientes resultados por competencia: ${resumen}.`;
  return safe(prompt, `Conclusión de competencias: ${resumen}`);
};

exports.recomendacionesTemas = temas => {
  const prompt = `Entrega recomendaciones generales de mejora para los siguientes temas: ${temas}.`;
  return safe(prompt, `Recomendaciones para ${temas}`);
};

exports.conclusionCriterios = resumen => {
  const prompt = `Redacta una conclusion breve sobre el rendimiento observado en los siguientes criterios: ${resumen}.`;
  return safe(prompt, `Conclusion de criterios: ${resumen}`);
};

exports.recomendacionesCompetencia = (competencia, cumplimiento) => {
  const prompt = `Entrega recomendaciones para mejorar la competencia ${competencia} que actualmente tiene un cumplimiento de ${cumplimiento} por ciento.`;
  return safe(prompt, `Recomendaciones para ${competencia}`);
};

exports.recomendacionesGenerales = temas => {
  const prompt = `Entrega recomendaciones generales para reforzar los siguientes temas: ${temas}.`;
  return safe(prompt, `Recomendaciones para ${temas}`);
};

