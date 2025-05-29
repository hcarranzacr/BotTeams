const { ActivityHandler, BotFrameworkAdapter } = require('botbuilder');
const restify = require('restify');
const axios = require('axios');
require('dotenv').config();

// Crear servidor Restify
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`Bot escuchando en http://localhost:3978`);
});

// Crear adaptador con App ID y Password desde .env
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Lógica del bot
const bot = new ActivityHandler();

bot.onMessage(async (context, next) => {
  const userMessage = context.activity.text || '';

  try {
    const response = await axios.post(
      'https://iwv2mcznpi.execute-api.us-east-1.amazonaws.com/Prod/teams-proxy',
      { text: userMessage },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const replyText = response.data.text || 'Sin respuesta del asistente.';
    await context.sendActivity({ type: 'message', text: replyText });
  } catch (error) {
    console.error('Error al llamar a la API de AWS:', error.message);
    await context.sendActivity({
      type: 'message',
      text: '⚠️ Hubo un error al procesar tu solicitud. Intenta más tarde.'
    });
  }

  await next();
});

// Ruta de mensajes para Teams
server.post('/api/messages', async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
  });
});
