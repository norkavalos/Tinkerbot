const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const prompt = require('prompt-sync');
const Assistant = require('watson-developer-cloud/assistant/v2');
const keys = require('../secrets');

// Set up assistant service wrapper
const service =  new Assistant({
  iam_apikey: keys.chatbotKey,
  version: '2018-09-20'
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/json

let sessionId

service.createSession({
  assistant_id: keys.assistantIdPer,
}, (err, res) => sessionId = res.session_id);

app.post('/api/sendMessage', (req, res) => {
  const { message } = req.body;
  service.message(
    {
      input: { text: message},
      assistant_id: keys.assistantIdPer,
      session_id: sessionId,
    },
    async (err, response) => {
      if (err) {
        console.log('Error received', err);
        return;
      }
      const ans = await processResponse(response);
      res.send(ans);
    }
  );
});

async function processResponse(response) {
  const intents = response.output.intents;
  const generics = response.output.generic;

  if (intents.length > 0) {
    if (intents[0].intent === 'event_location') {
      const location = response.output.entities.find((elm) => elm.entity === 'sys-location');
      const events = await axios.get(
        'https://www.eventbriteapi.com/v3/events/search',
        {
          params: {
            'location.address': location.value,
            'location.within': '10mi'
          },
          headers: {
            Authorization: `Bearer ${keys.eventBrite}`
          }
        }
      );
      let ans = ``;

      events.data.events.forEach(event => {
        ans += `
          **** NAME OF THE EVENT: ****: ${event.name.text}
        `;
      });

      return ans;
    } else if (generics.length > 0) {
      return generics[0].text;
    }
  }
}

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
