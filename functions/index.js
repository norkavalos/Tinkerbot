const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const AssistantV2 = require('ibm-watson/assistant/v2');

const keys = functions.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/json
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
let session;
let assistant;

app.use(async (req, res, next) => {
  assistant = new AssistantV2({
    version: '2019-02-28',
    iam_apikey: keys.watson.key,
    url: 'https://gateway.watsonplatform.net/assistant/api',
  });
  try {
    session = await assistant.createSession({
      assistant_id: keys.watson.assistant_id,
    });
  } catch (error) {
    console.log(error, '***');
  }

  next();
});

app.post('/api/sendMessage', (req, res) => {
  const { message } = req.body;
  assistant.message(
    {
      input: { text: message },
      assistant_id: keys.watson.assistant_id,
      session_id: session.session_id,
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
            Authorization: `Bearer ${keys.eventbrite.key}`
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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

exports.app = functions.https.onRequest(app)
