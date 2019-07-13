const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const Assistant = require('watson-developer-cloud/assistant/v2');

const assistantId = require('../secrets');
const eventBrite_key= require('../secrets')
const keys = functions.config();


// Set up assistant service wrapper
const service =  new Assistant({
  iam_apikey:{iam_apikey},
  version: '2019-02-28'
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/json
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

let sessionId


const AssistantV2 = require('ibm-watson/assistant/v2');

const assistant = new AssistantV2({
  version: '2019-02-28',
  iam_apikey: 'wFv99LVMT3OHGuPhK3mXo2X9zczKa5iF8gutYuCHqZb7',
  url: 'https://gateway.watsonplatform.net/assistant/api/v2/assistants/699aacaa-86f4-4884-8e3f-e9d63c806ecc/sessions',
});

assistant.createSession({
  assistant_id: assistantId
})
  .then(res => {
    console.log(JSON.stringify(res, null, 2));
  })
  .catch(err => {
    console.log('error:', err);
  });



  app.post('/api/sendMessage', (req, res) => {
    const { message } = req.body;
    service.message(
      {
        input: { text: message},
        assistant_id: assistantId,
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
            Authorization: `Bearer ${eventBrite_key}`
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
    }  else if (generics.length > 0) {
      return generics[0].text;
    }
  }
}

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`App listening on ${port}`);
