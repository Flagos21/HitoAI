const https = require('https');

const API_KEY = process.env.OPENAI_KEY;
const MODEL = 'gpt-3.5-turbo';

function callOpenAI(prompt) {
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

exports.crearIntroduccion = asignatura => callOpenAI(`Redacta la introduccion del informe para la asignatura ${asignatura}.`);
exports.crearConclusion = asignatura => callOpenAI(`Redacta la conclusion del informe para la asignatura ${asignatura}.`);
